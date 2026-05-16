from fastapi import HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.job import Job
from app.schemas.job import JobCreate, JobUpdate


def create_job(db: Session, job: JobCreate, created_by: str) -> Job:
    new_job = Job(
        company=job.company,
        role=job.role,
        location=job.location,
        salary=job.salary,
        skills=job.skills,
        apply_link=job.apply_link,
        description=job.description,
        created_by=created_by,
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job


def list_jobs(
    db: Session,
    q: str | None = None,
    company: str | None = None,
    location: str | None = None,
    skill: str | None = None,
    limit: int = 50,
) -> list[Job]:
    query = db.query(Job)

    if q:
        like_query = f"%{q}%"
        query = query.filter(
            or_(
                Job.role.ilike(like_query),
                Job.company.ilike(like_query),
                Job.skills.ilike(like_query),
                Job.location.ilike(like_query),
                Job.salary.ilike(like_query),
                Job.description.ilike(like_query),
            )
        )

    if company:
        query = query.filter(Job.company.ilike(f"%{company}%"))

    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))

    if skill:
        query = query.filter(Job.skills.ilike(f"%{skill}%"))

    return query.order_by(Job.id.desc()).limit(limit).all()


def get_job(db: Session, job_id: int) -> Job:
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


def update_job(db: Session, job_id: int, payload: JobUpdate) -> Job:
    job = get_job(db, job_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(job, field, value)
    db.commit()
    db.refresh(job)
    return job
