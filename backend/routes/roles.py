from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from auth import get_current_user

router = APIRouter(prefix="/roles", tags=["Authorization"])


@router.get("", response_model=List[schemas.RoleOut])
def get_roles(db: Session = Depends(get_db)):
    """
    Return all available roles.
    """
    roles = db.query(models.Role).all()
    return roles


@router.post("/assign", response_model=schemas.AssignRoleResponse)
def assign_role(
    payload: schemas.AssignRoleRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Assign a role to a user by user_id.
    Requires a valid JWT (any authenticated user can call this in the demo;
    add role-check middleware in production).
    """
    user = db.query(models.User).filter(models.User.user_id == payload.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {payload.user_id} not found",
        )

    # Validate that the role exists
    role = db.query(models.Role).filter(models.Role.role_name == payload.role).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role '{payload.role}' does not exist. Call GET /roles for valid roles.",
        )

    # Note: user.role is now a read-only property. 
    # To assign a role, we update user_roles. We support 1 role per user in this demo:
    db.query(models.UserRole).filter(models.UserRole.user_id == user.user_id).delete()
    
    new_user_role = models.UserRole(user_id=user.user_id, role_id=role.role_id)
    db.add(new_user_role)
    db.commit()
    return {"message": "Role assigned successfully"}
