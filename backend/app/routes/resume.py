from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.user import User
from app.routes.auth import get_current_user
from app.schemas.resume import ResumeAnalyzeRequest, ResumeUpsert
from app.services.resume_service import analyze_resume, get_latest_resume, upsert_resume


router = APIRouter(tags=["resume"])


@router.get("/resume")
def get_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = get_latest_resume(db, current_user)
    return resume or {}


@router.post("/resume/analyze")
def analyze_resume_route(payload: ResumeAnalyzeRequest):
    return analyze_resume(payload)


@router.put("/resume")
def save_resume(
    payload: ResumeUpsert,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return upsert_resume(db, current_user, payload)
