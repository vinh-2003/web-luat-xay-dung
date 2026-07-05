from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import uuid
import jwt

from app.db.database import get_db
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.api import deps
from app.services.email import send_password_reset_email
from app.schemas.auth import UserCreate, UserOut, Token, ForgotPasswordReq, ResetPasswordReq, GoogleLoginReq, UserUpdate, ChangePasswordReq
from app.crud import crud_user

router = APIRouter()

@router.post("/register", response_model=UserOut)
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> Any:
    """
    Register a new user.
    """
    user = crud_user.user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="Email này đã tồn tại trong hệ thống.",
        )
    user = crud_user.user.create(db, obj_in=user_in)
    return user

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = crud_user.user.get_by_email(db, email=form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Email hoặc mật khẩu không chính xác")
    elif user.is_active == 0:
        raise HTTPException(status_code=400, detail="Tài khoản đã bị khóa")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserOut)
def read_user_me(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.put("/me", response_model=UserOut)
def update_user_me(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    """
    Update current user (e.g. name).
    """
    current_user = crud_user.user.update(db, db_obj=current_user, obj_in=user_in)
    return current_user

@router.put("/change-password")
def change_password(
    req: ChangePasswordReq,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    """
    Change password for current user.
    """
    if not security.verify_password(req.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Mật khẩu hiện tại không chính xác.")
        
    current_user.hashed_password = security.get_password_hash(req.new_password)
    db.commit()
    return {"msg": "Đổi mật khẩu thành công."}

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordReq, db: Session = Depends(get_db)):
    """
    Simulate forgot password (in a real app, sends email)
    """
    user = crud_user.user.get_by_email(db, email=req.email)
    if not user:
        # Prevent email enumeration by just returning success
        return {"msg": "If the email exists, a password reset link has been sent."}
    
    # Generate real token
    reset_token = str(uuid.uuid4())
    user.reset_token = reset_token
    db.commit()
    
    # Send email
    try:
        send_password_reset_email(user.email, reset_token)
    except Exception as e:
        print(f"Error sending email: {e}")
        raise HTTPException(status_code=500, detail="Không thể gửi email khôi phục. Vui lòng thử lại sau.")
        
    return {"msg": "Đã gửi liên kết khôi phục mật khẩu vào email của bạn. Vui lòng kiểm tra hộp thư."}

@router.post("/reset-password")
def reset_password(req: ResetPasswordReq, db: Session = Depends(get_db)):
    """
    Reset password
    """
    user = crud_user.user.get_by_reset_token(db, token=req.token)
    if not user:
        raise HTTPException(status_code=400, detail="Đường dẫn không hợp lệ hoặc đã hết hạn")
    
    user.hashed_password = security.get_password_hash(req.new_password)
    user.reset_token = None
    db.commit()
    return {"msg": "Đổi mật khẩu thành công"}

@router.post("/google-login", response_model=Token)
def google_login(req: GoogleLoginReq, db: Session = Depends(get_db)):
    """
    Login with Google credential token
    """
    from google.oauth2 import id_token
    from google.auth.transport import requests
    
    try:
        # Verify the token signature and audience
        payload = id_token.verify_oauth2_token(
            req.credential, 
            requests.Request(), 
            settings.GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10
        )
        email = payload.get("email")
        name = payload.get("name")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid Google token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid Google token")
        
    if not email:
        raise HTTPException(status_code=400, detail="Email not found in Google token")
        
    user = crud_user.user.get_by_email(db, email=email)
    if not user:
        # Auto register
        user_in = UserCreate(email=email, password="google_oauth_dummy", name=name)
        user = crud_user.user.create(db, obj_in=user_in)
    elif user.is_active == 0:
        raise HTTPException(status_code=400, detail="Tài khoản đã bị khóa")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "user": user
    }
