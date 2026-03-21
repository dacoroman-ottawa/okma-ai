from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Annotated, Any
from ..database import get_db
from ..models import AppUser, UserRoleEnum
from ..auth import get_current_user, RoleChecker, get_password_hash
from ..services.email import send_password_reset_email
import uuid

router = APIRouter(prefix="/users", tags=["users"])

# Common dependencies
DB = Annotated[Any, Depends(get_db)]
AdminUser = Annotated[Any, Depends(RoleChecker([UserRoleEnum.ADMIN]))]


def serialize_user(user: AppUser) -> dict:
    """Convert AppUser to API response format (camelCase)"""
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role.value if user.role else None,
        "isAdmin": user.is_admin,
        "isActive": user.is_active,
        "isVerified": user.is_verified,
        "createdAt": user.created_at.isoformat() if user.created_at else None,
        "lastLoginAt": user.last_login_at.isoformat() if user.last_login_at else None,
    }


@router.get("", response_model=List[dict])
async def get_users(
    db: DB,
    admin: AdminUser
):
    """List all users (admin only)"""
    users = db.query(AppUser).all()
    return [serialize_user(u) for u in users]


@router.get("/{user_id}")
async def get_user(
    user_id: str,
    db: DB,
    admin: AdminUser
):
    """Get a single user by ID (admin only)"""
    user = db.query(AppUser).filter(AppUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return serialize_user(user)


@router.post("")
async def create_user(
    user_data: dict,
    db: DB,
    admin: AdminUser
):
    """Create a new user (admin only). Password will be set via email invitation."""
    # Validate required fields
    if not user_data.get("name"):
        raise HTTPException(status_code=400, detail="Name is required")
    if not user_data.get("email"):
        raise HTTPException(status_code=400, detail="Email is required")

    # Check for duplicate email
    existing = db.query(AppUser).filter(AppUser.email == user_data["email"]).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    # Create user with temporary password
    user_id = "usr-" + str(uuid.uuid4())[:8]
    new_user = AppUser(
        id=user_id,
        name=user_data["name"],
        email=user_data["email"],
        hashed_password=get_password_hash("TEMP_" + str(uuid.uuid4())),  # Temp password
        role=UserRoleEnum(user_data.get("role", "student")),
        is_admin=user_data.get("isAdmin", False),
        is_active=True,
        is_verified=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Send password reset email so user can set their password
    await send_password_reset_email(new_user.email, new_user.name)

    return serialize_user(new_user)


@router.put("/{user_id}")
async def update_user(
    user_id: str,
    user_data: dict,
    db: DB,
    admin: AdminUser
):
    """Update user details (admin only)"""
    user = db.query(AppUser).filter(AppUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Security: Cannot remove own admin status
    if admin.id == user_id and "isAdmin" in user_data and not user_data["isAdmin"]:
        raise HTTPException(status_code=400, detail="Cannot remove your own admin status")

    # Update allowed fields
    if "name" in user_data:
        user.name = user_data["name"]
    if "email" in user_data:
        # Check for duplicate email
        existing = db.query(AppUser).filter(
            AppUser.email == user_data["email"],
            AppUser.id != user_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")
        user.email = user_data["email"]
    if "isAdmin" in user_data:
        user.is_admin = user_data["isAdmin"]
    if "role" in user_data:
        user.role = UserRoleEnum(user_data["role"])

    db.commit()
    db.refresh(user)

    return serialize_user(user)


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    db: DB,
    admin: AdminUser
):
    """Delete a user (admin only)"""
    # Security: Cannot delete self
    if admin.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    user = db.query(AppUser).filter(AppUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()

    return {"message": "User deleted successfully"}


@router.post("/{user_id}/toggle-status")
async def toggle_user_status(
    user_id: str,
    db: DB,
    admin: AdminUser
):
    """Toggle user active/inactive status (admin only)"""
    # Security: Cannot toggle own status
    if admin.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot toggle your own status")

    user = db.query(AppUser).filter(AppUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)

    return serialize_user(user)


@router.post("/{user_id}/send-reset-link")
async def send_reset_link(
    user_id: str,
    db: DB,
    admin: AdminUser
):
    """Send password reset link to user (admin only)"""
    user = db.query(AppUser).filter(AppUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await send_password_reset_email(user.email, user.name)

    return {"message": "Password reset link sent successfully"}
