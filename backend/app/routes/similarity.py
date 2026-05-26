from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.user import User
from app.routes.auth import get_current_user
from app.services.resume_service import match_resume_to_jobs

router = APIRouter(tags=["similarity"])

@router.get("/profile/matches")
def get_profile_matches(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return match_resume_to_jobs(db, current_user)
