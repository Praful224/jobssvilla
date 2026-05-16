from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.user import User
from app.routes.auth import get_current_user
from app.schemas.community import CareerAssistantRequest, SkillGapRequest
from app.schemas.resume import ResumeAnalyzeRequest
from app.services.ai_service import career_assistant, recommendations, skill_gap
from app.services.resume_service import analyze_resume


router = APIRouter(tags=["ai"])


@router.post("/ai/resume-analyzer")
def ai_resume_analyzer(payload: ResumeAnalyzeRequest):
    return analyze_resume(payload)


@router.get("/ai/recommendations")
def ai_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return recommendations(db, current_user)


@router.post("/ai/skill-gap")
def ai_skill_gap(
    payload: SkillGapRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return skill_gap(db, current_user, payload)


@router.post("/ai/career-assistant")
def ai_career_assistant(payload: CareerAssistantRequest):
    return career_assistant(payload)
