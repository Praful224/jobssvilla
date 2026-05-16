from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.application import Application, SavedJob
from app.models.job import Job
from app.models.user import User
from app.schemas.application import ApplicationCreate, ApplicationUpdate
from app.services.notification_service import create_notification


def list_applications(db: Session, user: User) -> list[Application]:
    return (
        db.query(Application)
        .filter(Application.user_id == user.id)
        .order_by(Application.updated_at.desc())
        .all()
    )


def create_application(
    db: Session,
    user: User,
    payload: ApplicationCreate,
) -> Application:
    job = None
    if payload.job_id:
        job = db.query(Job).filter(Job.id == payload.job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

    company = payload.company or (job.company if job else None)
    role = payload.role or (job.role if job else None)
    location = payload.location or (job.location if job else None)

    if not company or not role:
        raise HTTPException(
            status_code=400,
            detail="company and role are required when job_id is not provided",
        )

    application = Application(
        user_id=user.id,
        job_id=payload.job_id,
        company=company,
        role=role,
        location=location,
        status=payload.status or "Applied",
        source=payload.source or "JobsVilla",
        notes=payload.notes,
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    create_notification(
        db,
        user.id,
        "Application tracked",
        f"{role} at {company} was added to your application board.",
    )
    return application


def update_application(
    db: Session,
    user: User,
    application_id: int,
    payload: ApplicationUpdate,
) -> Application:
    application = (
        db.query(Application)
        .filter(
            Application.id == application_id,
            Application.user_id == user.id,
        )
        .first()
    )
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(application, field, value)

    db.commit()
    db.refresh(application)
    return application


def list_saved_jobs(db: Session, user: User) -> list[dict]:
    rows = (
        db.query(SavedJob, Job)
        .join(Job, SavedJob.job_id == Job.id)
        .filter(SavedJob.user_id == user.id, SavedJob.is_active.is_(True))
        .order_by(SavedJob.created_at.desc())
        .all()
    )

    return [
        {
            "id": saved.id,
            "job_id": job.id,
            "company": job.company,
            "role": job.role,
            "location": job.location,
            "salary": job.salary,
            "skills": job.skills,
            "apply_link": job.apply_link,
            "description": job.description,
            "created_at": saved.created_at,
        }
        for saved, job in rows
    ]


def save_job(db: Session, user: User, job_id: int) -> SavedJob:
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    saved = (
        db.query(SavedJob)
        .filter(SavedJob.user_id == user.id, SavedJob.job_id == job_id)
        .first()
    )
    if saved:
        saved.is_active = True
    else:
        saved = SavedJob(user_id=user.id, job_id=job_id)
        db.add(saved)

    db.commit()
    db.refresh(saved)
    return saved


def unsave_job(db: Session, user: User, job_id: int) -> dict:
    saved = (
        db.query(SavedJob)
        .filter(SavedJob.user_id == user.id, SavedJob.job_id == job_id)
        .first()
    )
    if not saved:
        raise HTTPException(status_code=404, detail="Saved job not found")

    saved.is_active = False
    db.commit()
    return {"message": "Job removed from saved list"}
