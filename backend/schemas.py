from typing import Optional
from pydantic import BaseModel, EmailStr


# ── Auth ────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str


class LogoutResponse(BaseModel):
    message: str


# ── Roles ───────────────────────────────────────────────────────────────────

class RoleOut(BaseModel):
    role_id: int
    role_name: str

    class Config:
        from_attributes = True


class AssignRoleRequest(BaseModel):
    user_id: int
    role: str


class AssignRoleResponse(BaseModel):
    message: str


# ── Users ───────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserOut(BaseModel):
    user_id: int
    username: str
    email: str
    role: Optional[str] = None

    class Config:
        from_attributes = True


# ── Legacy schemas (kept for backward compatibility) ─────────────────────────

class StudentCreate(BaseModel):
    name: str
    student_class: str
    phone: str
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class StudentOut(BaseModel):
    id: int
    name: str
    student_class: str
    phone: str
    username: str

    class Config:
        from_attributes = True
