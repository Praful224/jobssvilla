from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.config.database import get_db

from app.schemas.job import JobCreate, JobUpdate

from app.routes.auth import get_current_user
from app.models.user import User
from app.services import job_service


router = APIRouter(tags=["jobs"])


@router.post("/jobs")
def create_job(
    job: JobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_job = job_service.create_job(db, job, current_user.email)

    return {
        "message": "Job created successfully",
        "job_id": new_job.id
    }


@router.get("/jobs")
def get_jobs(
    q: str | None = None,
    company: str | None = None,
    location: str | None = None,
    skill: str | None = None,
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return job_service.list_jobs(
        db,
        q=q,
        company=company,
        location=location,
        skill=skill,
        limit=limit,
    )



@router.get("/jobs/search")
def search_jobs(
    q: str = Query(...),
    db: Session = Depends(get_db),
):
    return job_service.list_jobs(db, q=q)


@router.get("/jobs/{job_id}")
def get_single_job(
    job_id: int,
    db: Session = Depends(get_db),
):
    return job_service.get_job(db, job_id)


@router.patch("/jobs/{job_id}")
def update_job(
    job_id: int,
    payload: JobUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return job_service.update_job(db, job_id, payload)
