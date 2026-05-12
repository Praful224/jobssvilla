from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.config.database import get_db

from app.models.job import Job

from app.schemas.job import JobCreate

from app.routes.auth import oauth2_scheme
from app.services.auth_service import verify_token


router = APIRouter()


@router.post("/jobs")
def create_job(
    job: JobCreate,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    email = verify_token(token)

    if not email:
        return {
            "error": "Invalid token"
        }

    new_job = Job(
        company=job.company,
        role=job.role,
        location=job.location,
        salary=job.salary,
        skills=job.skills,
        apply_link=job.apply_link,
        description=job.description,
        created_by=email
    )

    db.add(new_job)

    db.commit()

    db.refresh(new_job)

    return {
        "message": "Job created successfully",
        "job_id": new_job.id
    }


@router.get("/jobs")
def get_jobs(
    db: Session = Depends(get_db)
):

    jobs = db.query(Job).all()

    return jobs


@router.get("/jobs/search")
def search_jobs(
    q: str = Query(...),
    db: Session = Depends(get_db)
):

    jobs = db.query(Job).filter(

        or_(

            Job.role.ilike(f"%{q}%"),

            Job.company.ilike(f"%{q}%"),

            Job.skills.ilike(f"%{q}%"),

            Job.location.ilike(f"%{q}%"),

            Job.salary.ilike(f"%{q}%"),

            Job.description.ilike(f"%{q}%")

        )

    ).all()

    return jobs


@router.get("/jobs/{job_id}")
def get_single_job(
    job_id: int,
    db: Session = Depends(get_db)
):

    job = db.query(Job).filter(
        Job.id == job_id
    ).first()

    if not job:
        return {
            "error": "Job not found"
        }

    return job