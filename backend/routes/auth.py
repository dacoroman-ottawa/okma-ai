from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any
from pydantic import BaseModel
from datetime import timedelta, datetime
from ..database import get_db
from ..models import AppUser
from ..auth import (
    verify_password_reset_token,
    get_password_hash,
    authenticate_user,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from ..services.email import send_password_reset_email

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    email: str
    newPassword: str


@router.post("/login")
async def login(
    request: LoginRequest,
    db: Any = Depends(get_db)
):
    """Authenticate user and return access token"""
    user = authenticate_user(db, request.email, request.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Please contact an administrator."
        )

    # Update last login time
    user.last_login_at = datetime.utcnow()
    db.commit()

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    return {
        "accessToken": access_token,
        "tokenType": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role.value if user.role else None,
            "isAdmin": user.is_admin
        }
    }


@router.post("/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    db: Any = Depends(get_db)
):
    """Send password reset email"""
    # Find the user
    user = db.query(AppUser).filter(AppUser.email == request.email).first()

    # Always return success to prevent email enumeration
    if not user:
        return {"message": "If an account exists with this email, a reset link has been sent."}

    if not user.is_active:
        return {"message": "If an account exists with this email, a reset link has been sent."}

    # Send reset email
    await send_password_reset_email(user.email, user.name)

    return {"message": "If an account exists with this email, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(
    request: ResetPasswordRequest,
    db: Any = Depends(get_db)
):
    """Reset user password using a valid reset token"""
    # Verify the token
    token_email = verify_password_reset_token(request.token)

    if not token_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )

    # Verify email matches
    if token_email.lower() != request.email.lower():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token for this email"
        )

    # Find the user
    user = db.query(AppUser).filter(AppUser.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Validate password
    if len(request.newPassword) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long"
        )

    # Update the password
    user.hashed_password = get_password_hash(request.newPassword)
    user.is_verified = True  # Mark user as verified since they confirmed email access
    db.commit()

    return {"message": "Password reset successfully"}
