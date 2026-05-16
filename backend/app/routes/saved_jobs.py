from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.user import User
from app.routes.auth import get_current_user
from app.schemas.application import SavedJobCreate
from app.services.application_service import list_saved_jobs, save_job, unsave_job


router = APIRouter(tags=["saved-jobs"])


@router.get("/saved-jobs")
def get_saved_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return list_saved_jobs(db, current_user)


@router.post("/saved-jobs")
def add_saved_job(
    payload: SavedJobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return save_job(db, current_user, payload.job_id)


@router.delete("/saved-jobs/{job_id}")
def remove_saved_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return unsave_job(db, current_user, job_id)
