from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.job import Job
from app.models.user import User
from app.models.application import Application
from app.routes.auth import get_current_user
from app.schemas.job import JobCreate
from app.schemas.application import ApplicationUpdate
from app.services.job_service import create_job
from app.services.notification_service import create_notification


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


@router.get("/recruiter/applications")
def get_recruiter_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    my_jobs = db.query(Job).filter(Job.created_by == current_user.email).all()
    my_job_ids = [j.id for j in my_jobs]
    
    query = db.query(Application, User).join(User, Application.user_id == User.id)
    if my_job_ids:
        applications = query.filter(Application.job_id.in_(my_job_ids)).all()
    else:
        applications = query.all()
        
    result = []
    for app, applicant in applications:
        result.append({
            "id": app.id,
            "job_id": app.job_id,
            "company": app.company,
            "role": app.role,
            "location": app.location,
            "status": app.status,
            "source": app.source,
            "notes": app.notes,
            "applied_at": app.applied_at,
            "updated_at": app.updated_at,
            "applicant": {
                "id": applicant.id,
                "name": applicant.name,
                "email": applicant.email
            }
        })
    return result


@router.patch("/recruiter/applications/{application_id}")
def update_recruiter_application(
    application_id: int,
    payload: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
        
    old_status = application.status
    if payload.status is not None:
        application.status = payload.status
    if payload.notes is not None:
        application.notes = payload.notes
    if payload.source is not None:
        application.source = payload.source
        
    db.commit()
    db.refresh(application)
    
    if payload.status is not None and old_status != payload.status:
        create_notification(
            db,
            application.user_id,
            "Application Status Updated",
            f"Your application for {application.role} at {application.company} has been moved to '{payload.status}' by the recruiter."
        )
        
    return application


@router.get("/recruiter/candidates")
def list_candidates(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    candidates = db.query(User).filter(User.role != "recruiter").all()
    result = []
    for c in candidates:
        # Deterministic simulation of predictive hireability and verified claims count
        hireability_score = min(100, 75 + (c.id * 7) % 24)
        result.append({
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "role": c.role,
            "hireability_index": hireability_score,
            "verified_claims_count": (c.id * 3) % 4
        })
    return result


