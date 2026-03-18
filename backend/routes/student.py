from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import schemas
from auth import get_current_student
from database import get_db
import models

router = APIRouter(prefix="/api", tags=["student"])

class LegacyLoginRequest(schemas.BaseModel):
    username: str
    password: str

@router.post("/signup", response_model=schemas.StudentOut, status_code=201)
def signup(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    db_student = db.query(models.Student).filter(models.Student.username == student.username).first()
    if db_student:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    from auth import get_password_hash, create_access_token
    
    new_student = models.Student(
        name=student.name,
        student_class=student.student_class,
        phone=student.phone,
        username=student.username,
        password_hash=get_password_hash(student.password),
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    
    access_token = create_access_token({"sub": new_student.username})
    return {"access_token": access_token, **new_student.__dict__}

@router.post("/login")
def login(payload: LegacyLoginRequest, db: Session = Depends(get_db)):
    db_student = db.query(models.Student).filter(models.Student.username == payload.username).first()
    
    from auth import verify_password, create_access_token
    if not db_student or not verify_password(payload.password, db_student.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    access_token = create_access_token({"sub": db_student.username})
    return {"access_token": access_token}


@router.get("/me", response_model=schemas.StudentOut)
def get_me(current_student: models.Student = Depends(get_current_student)):
    return current_student


@router.get("/students", response_model=List[schemas.StudentOut])
def get_all_students(db: Session = Depends(get_db)):
    """Admin endpoint — returns all registered students."""
    return db.query(models.Student).all()

