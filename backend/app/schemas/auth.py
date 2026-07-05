from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: str
    name: Optional[str] = None
    role: str
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class ForgotPasswordReq(BaseModel):
    email: EmailStr

class ResetPasswordReq(BaseModel):
    token: str
    new_password: str

class GoogleLoginReq(BaseModel):
    credential: str

class UserUpdate(BaseModel):
    name: str

class ChangePasswordReq(BaseModel):
    current_password: str
    new_password: str
