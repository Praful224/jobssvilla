from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.user import User
from app.routes.auth import get_current_user
from app.schemas.resume import (
    ResumeAnalyzeRequest, 
    ResumeUpsert,
    ResumeCompileRequest,
    ResumeJDMatchRequest,
    BulletEnhanceRequest,
    VerifyClaimRequest
)
from app.services.resume_service import (
    analyze_resume, 
    get_latest_resume, 
    upsert_resume,
    compile_latex_to_pdf,
    compile_resume_to_docx,
    enhance_bullet_star,
    analyze_resume_vs_jd,
    verify_cryptographic_career_claim
)


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


@router.post("/resume/compile")
def compile_latex(payload: ResumeCompileRequest):
    pdf_path = compile_latex_to_pdf(payload.latex_code)
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename="resume.pdf"
    )


@router.post("/resume/export-docx")
def export_docx(payload: ResumeCompileRequest):
    docx_path = compile_resume_to_docx(payload.latex_code)
    return FileResponse(
        docx_path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename="resume.docx"
    )


@router.post("/resume/rewrite-bullet")
def rewrite_bullet(payload: BulletEnhanceRequest):
    enhanced = enhance_bullet_star(payload.bullet, payload.tone or "Technical")
    return {"suggestions": enhanced}


@router.post("/resume/analyze-jd")
def analyze_jd(payload: ResumeJDMatchRequest):
    return analyze_resume_vs_jd(payload.resume_content, payload.jd_content, payload.target_role)


@router.post("/resume/verify-claim")
def verify_claim(payload: VerifyClaimRequest):
    return verify_cryptographic_career_claim(payload.claim_json)

