from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.job import Job
from app.models.user import User
from app.routes.auth import get_current_user
from app.schemas.job import JobCreate
from app.services.job_service import create_job


router = APIRouter(tags=["recruiter"])


@router.get("/recruiter/dashboard")
def recruiter_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    jobs = (
        db.query(Job)
        .filter(Job.created_by == current_user.email)
        .order_by(Job.id.desc())
        .all()
    )
    return {
        "posted_jobs": jobs,
        "total_posted": len(jobs),
        "message": "Recruiter portal foundation is ready.",
    }


@router.post("/recruiter/jobs")
def recruiter_create_job(
    payload: JobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return create_job(db, payload, current_user.email)
