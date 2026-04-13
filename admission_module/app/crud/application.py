from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from datetime import datetime
from fastapi import HTTPException

from app.models.application import Application, ApplicantDetails, ParentDetails, EducationDetails
from app.models.review_status import ApplicationStatusLog
from app.schemas.application import ApplicationCreate

async def create_full_application(db: AsyncSession, app_data: ApplicationCreate):
    """
    Creates the main Application object, the ApplicantDetails, ParentDetails, EducationDetails,
    and logs the status state change all in one go (transactionally bound).
    """
    
    # 1. Create Main Application Row
    new_application = Application(
        user_id=app_data.user_id,
        brochure_id=app_data.brochure_id,
        course_name=app_data.course_name,
        admission_year=app_data.admission_year,
        current_status="draft", # Initial state is draft
        submission_date=datetime.utcnow()
    )
    
    db.add(new_application)
    await db.flush() # Flush pushes to the DB to generate the application_id without committing!
    
    # 2. Add Applicant Details referencing the newly generated application_id
    applicant_details = ApplicantDetails(
        application_id=new_application.application_id,
        **app_data.applicant.model_dump()
    )
    db.add(applicant_details)
    
    # 3. Add single parent details record
    parent_db = ParentDetails(
        application_id=new_application.application_id,
        **app_data.parent_details.model_dump()
    )
    db.add(parent_db)
        
    # 4. Add all education historical records
    for edu in app_data.education:
        edu_db = EducationDetails(
            application_id=new_application.application_id,
            **edu.model_dump()
        )
        # Percentage is calculated in schema but confirmed here
        if edu.total_marks > 0:
            edu_db.percentage = (edu.obtained_marks / edu.total_marks) * 100
        db.add(edu_db)
        
    # 5. Application State Manager - Log the Submission Action
    status_log = ApplicationStatusLog(
        application_id=new_application.application_id,
        changed_by=app_data.user_id,
        changed_role="Applicant",
        status_id="draft", # Initial log is draft
        remark="Applicant saved the application form as draft."
    )
    db.add(status_log)
    
    # 6. Commit the entire transaction!
    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        # Detect Aadhaar unique constraint violation
        error_msg = str(e).lower()
        if "adhar_number" in error_msg and "unique" in error_msg:
            raise HTTPException(
                status_code=400, 
                detail="Aadhaar Number already registered. An application already exists with this Aadhaar."
            )
        raise e

    # Explicitly load relationships to avoid lazy-loading issues in async mode
    await db.refresh(new_application, ["applicant_details", "parent_details", "education_details"])
    
    return new_application

async def update_full_application(db: AsyncSession, application_id: int, app_data: ApplicationCreate):
    """
    Updates an existing main Application object and its related details.
    """
    # 1. Get existing application
    app_record = await get_application_by_id(db, application_id)
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found for update.")
        
    # 2. Update Application Record
    app_record.course_name = app_data.course_name
    app_record.admission_year = app_data.admission_year
    
    # 3. Update Applicant Details
    for key, value in app_data.applicant.model_dump().items():
        setattr(app_record.applicant_details, key, value)
        
    # 4. Update Parent Details
    for key, value in app_data.parent_details.model_dump().items():
        setattr(app_record.parent_details, key, value)
        
    # 5. Replace Education Details
    # Delete existing education rows
    await db.execute(
        EducationDetails.__table__.delete().where(EducationDetails.application_id == application_id)
    )
    # Add new ones
    for edu in app_data.education:
        edu_db = EducationDetails(
            application_id=application_id,
            **edu.model_dump()
        )
        if edu.total_marks > 0:
            edu_db.percentage = (edu.obtained_marks / edu.total_marks) * 100
        db.add(edu_db)
        
    # 6. Log the update Action
    status_log = ApplicationStatusLog(
        application_id=application_id,
        changed_by=app_data.user_id,
        changed_role="Applicant",
        status_id="draft", # reset to draft so they can upload documents again
        remark="Applicant updated the application form for revision."
    )
    db.add(status_log)
    
    # Update status to avoid being stuck in revision_required while uploading docs
    app_record.current_status = "draft"
    
    await db.commit()
    await db.refresh(app_record, ["applicant_details", "parent_details", "education_details"])
    
    return app_record

async def get_application_by_id(db: AsyncSession, application_id: int):
    # Eagerly load relationships to prevent async serialization errors
    query = select(Application).filter(Application.application_id == application_id).options(
        selectinload(Application.applicant_details),
        selectinload(Application.parent_details),
        selectinload(Application.education_details)
    )
    result = await db.execute(query)
    return result.scalars().first()

async def get_all_applications(db: AsyncSession):
    query = select(Application).options(
        selectinload(Application.applicant_details),
        selectinload(Application.parent_details),
        selectinload(Application.education_details)
    )
    result = await db.execute(query)
    return result.unique().scalars().all()

async def get_application_status_logs(db: AsyncSession, application_id: int):
    query = select(ApplicationStatusLog).filter(ApplicationStatusLog.application_id == application_id).order_by(ApplicationStatusLog.changed_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

async def finalize_application(db: AsyncSession, application_id: int, user_id: int):
    """
    Finalizes the application by checking for mandatory documents and updating the status.
    """
    # 1. Get Application
    application = await get_application_by_id(db, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found.")
    
    # 2. Check and SELF-HEAL for Mandatory Documents
    from app.models.document import Document
    from sqlalchemy.future import select
    
    # First, try to find for CURRENT application
    result = await db.execute(select(Document).filter(Document.application_id == application_id))
    docs = result.scalars().all()
    
    # If NONE found or some missing, try to search for any orphaned documents for this USER
    # We always check for user documents if some are missing to ensure max recovery
    from app.models.application import Application as AppModel
    
    # Use application's own user_id as source of truth for self-heal
    effective_user_id = application.user_id 
    
    user_apps_query = await db.execute(select(AppModel.application_id).filter(AppModel.user_id == effective_user_id))
    all_app_ids = user_apps_query.scalars().all()
    
    if all_app_ids:
        # Search for ALL documents belonging to ANY application of this user
        result_all = await db.execute(
            select(Document).filter(Document.application_id.in_(all_app_ids))
        )
        user_docs = result_all.scalars().all()
        
        # If we found docs elsewhere that aren't in our current 'docs' list, re-link them
        current_doc_ids = {d.doc_id for d in docs}
        healed_count = 0
        for d in user_docs:
            if d.application_id != application_id:
                # Potential self-heal: Link this doc to the current application
                d.application_id = application_id
                healed_count += 1
                if d.doc_id not in current_doc_ids:
                    docs.append(d)
        
        if healed_count > 0:
            await db.commit()
            print(f"DEBUG: Self-healed {healed_count} docs for application {application_id} (User {effective_user_id})")

    # Robust matching logic - use lowercase keyword search and common variations
    # We join both type and name to be safe
    all_text = " ".join([f"{d.document_type} {d.document_name}" for d in docs]).lower()
    
    has_adhar = any(x in all_text for x in ["adhar", "aadhar", "identity", "id_proof"])
    has_photo = any(x in all_text for x in ["photo", "photograph", "image", "img", "pic"])
    has_sign = any(x in all_text for x in ["signature", "sign"])
    
    missing = []
    if not has_adhar: missing.append("Aadhar Card")
    if not has_photo: missing.append("Passport Photo")
    if not has_sign: missing.append("Signature")
    
    if missing:
        found_info = ", ".join([f"{d.document_type} (ID:{d.doc_id})" for d in docs]) or "None"
        diagnostic = ""
        if not docs:
            diagnostic = " No documents are linked to this application or your user account."
        else:
            diagnostic = f" We found these files: [{found_info}], but they don't seem to match the required types."
            
        raise HTTPException(
            status_code=400, 
            detail=f"Mandatory documents missing: {', '.join(missing)}.{diagnostic} Please ensure you have uploaded Aadhar, Photo, and Signature with correct names."
        )
    
    # 3. Update Status
    application.current_status = "submitted"
    application.submission_date = datetime.utcnow()
    
    # 4. Log the action
    log_entry = ApplicationStatusLog(
        application_id=application_id,
        changed_by=user_id,
        changed_role="Applicant",
        status_id="submitted",
        remark="Applicant finalized the application after uploading mandatory documents."
    )
    db.add(log_entry)
    
    await db.commit()
    await db.refresh(application)
    return application
