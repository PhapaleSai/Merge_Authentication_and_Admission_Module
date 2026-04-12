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
    # ... (existing code stays)
    user = db.query(models.User).filter(models.User.user_id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    role = db.query(models.Role).filter(models.Role.role_name == payload.role).first()
    if not role:
        raise HTTPException(status_code=400, detail="Role not found")

    db.query(models.UserRole).filter(models.UserRole.user_id == user.user_id).delete()
    
    new_user_role = models.UserRole(
        user_id=user.user_id, 
        role_id=role.role_id,
        created_by=current_user.email,
        token_expiry=getattr(current_user, 'token_expiry', None)
    )
    db.add(new_user_role)
    db.commit()
    return {"message": "Role assigned successfully"}


@router.put("/{role_id}/permissions")
def update_role_permissions(
    role_id: int,
    payload: List[str],
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Update permissions for a specific role."""
    # Simple role check here since it's an admin operation
    if current_user.role not in ['admin', 'vice_principal']:
        raise HTTPException(status_code=403, detail="Forbidden")

    role = db.query(models.Role).filter(models.Role.role_id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    # Clear existing
    db.query(models.RolePermission).filter(models.RolePermission.role_id == role_id).delete()

    # Add new
    for perm_name in payload:
        perm = db.query(models.Permission).filter(models.Permission.permission_name == perm_name).first()
        if perm:
            new_rp = models.RolePermission(
                role_id=role_id,
                permission_id=perm.permission_id
            )
            db.add(new_rp)

    role.updated_by = current_user.email
    db.commit()
    return {"message": "Permissions updated", "permissions": role.permissions}
