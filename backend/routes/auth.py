from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any
from pydantic import BaseModel
from ..database import get_db
from ..models import AppUser
from ..auth import verify_password_reset_token, get_password_hash

router = APIRouter(prefix="/auth", tags=["auth"])


class ResetPasswordRequest(BaseModel):
    token: str
    email: str
    newPassword: str


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
