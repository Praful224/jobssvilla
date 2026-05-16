from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.user import User
from app.routes.auth import get_current_user
from app.schemas.profile import ProfileUpdate
from app.services.profile_service import (
    get_or_create_profile,
    profile_to_dict,
    update_profile,
)


router = APIRouter(tags=["profile"])


@router.get("/profile")
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = get_or_create_profile(db, current_user)
    return profile_to_dict(profile, current_user)


@router.put("/profile")
def save_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = update_profile(db, current_user, payload)
    return profile_to_dict(profile, current_user)
