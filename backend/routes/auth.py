from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from database import get_db
import models
import schemas
from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


from fastapi.security import OAuth2PasswordRequestForm

@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Authenticate a user.
    Note: For Swagger UI compatibility, this endpoint accepts form data
    with 'username' and 'password' fields. We treat 'username' as the email.
    """
    # payload.username contains the email from the form
    user = db.query(models.User).filter(models.User.email == payload.username).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extract roles via linking table
    user_roles = [ur.role.role_name for ur in user.user_roles if ur.role]
    primary_role = user_roles[0] if user_roles else "student"

    access_token = create_access_token(
        data={"sub": user.email, "role": primary_role},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {
        "access_token": access_token,
        "token_type": "Bearer",
        "role": primary_role,
    }


@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    New users get the 'Student' role by default.
    """
    # Check if email is already registered
    existing_user = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    new_user = models.User(
        username=payload.username,
        email=payload.email,
        password_hash=get_password_hash(payload.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Assign student role
    student_role = db.query(models.Role).filter(models.Role.role_name == "student").first()
    if student_role:
        db.add(models.UserRole(user_id=new_user.user_id, role_id=student_role.role_id))
        db.commit()

    # Create a dynamic response so it matches the UserOut schema
    response_data = schemas.UserOut(
        user_id=new_user.user_id,
        username=new_user.username,
        email=new_user.email,
        role="student"
    )
    return response_data


@router.post("/logout", response_model=schemas.LogoutResponse)
def logout(current_user: models.User = Depends(get_current_user)):
    """
    Logout endpoint.  JWT is stateless so the client should discard its token.
    Server-side we simply confirm the token was valid and the user is logged out.
    """
    return {"message": f"User '{current_user.email}' logged out successfully"}
