from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from app.config.database import get_db
from app.models.user import User
from app.models.user_role import UserRole
from app.routes.auth import get_current_user

router = APIRouter(tags=["admin"])


class VerifyRolePayload(BaseModel):
    user_id: int
    requested_role: str
    approve: bool
    id: int = None


@router.get("/admin/pending-verifications")
def get_pending_verifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Fetch all pending role verification requests (mentor & recruiter) for the super-admin."""
    # Ensure current user is admin
    if current_user.role != "admin" and current_user.email != "praful@gmail.com" and current_user.email != "admin@jobsvilla.com":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Admin privileges required."
        )

    pending = (
        db.query(UserRole, User)
        .join(User, User.id == UserRole.user_id)
        .filter(UserRole.status == "pending")
        .all()
    )

    return [
        {
            "id": role.id,  # Primary key identifier for zero-conflict operations
            "user_id": user.id,
            "name": user.name,
            "email": user.email,
            "requested_role": role.role,
            "details": role.verification_details,
            "requested_at": role.created_at,
        }
        for role, user in pending
    ]


@router.post("/admin/verify-role")
def verify_user_role(
    payload: VerifyRolePayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Approve or Reject a pending user role request."""
    # Ensure current user is admin
    if current_user.role != "admin" and current_user.email != "praful@gmail.com" and current_user.email != "admin@jobsvilla.com":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Admin privileges required."
        )

    if payload.id is not None:
        # Resolve request using the robust primary key concept!
        entry = db.query(UserRole).filter(UserRole.id == payload.id).first()
    else:
        # Fallback to composite keys if old client call
        entry = (
            db.query(UserRole)
            .filter(
                UserRole.user_id == payload.user_id,
                UserRole.role == payload.requested_role,
            )
            .first()
        )

    if not entry:
        raise HTTPException(
            status_code=404,
            detail="Verification request not found."
        )

    if payload.approve:
        entry.status = "active"
        # Update user's active role in users table
        user = db.query(User).filter(User.id == payload.user_id).first()
        if user:
            user.role = payload.requested_role
    else:
        entry.status = "rejected"

    db.commit()
    return {
        "message": f"Role request successfully {'approved' if payload.approve else 'rejected'}!"
    }


class ToggleBlockPayload(BaseModel):
    user_id: int
    block: bool


@router.get("/admin/users")
def get_all_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Fetch all users inside the system for administration."""
    if current_user.role != "admin" and current_user.email != "praful@gmail.com" and current_user.email != "admin@jobsvilla.com":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Admin privileges required."
        )

    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
        }
        for u in users
    ]


@router.post("/admin/toggle-block-user")
def toggle_block_user(
    payload: ToggleBlockPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Block or unblock a user by setting their role."""
    if current_user.role != "admin" and current_user.email != "praful@gmail.com" and current_user.email != "admin@jobsvilla.com":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Admin privileges required."
        )

    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot block yourself.")

    if payload.block:
        user.role = "blocked"
    else:
        user.role = "student"

    db.commit()
    return {"message": f"User successfully {'blocked' if payload.block else 'unblocked'}!"}
