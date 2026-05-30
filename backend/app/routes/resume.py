from fastapi import APIRouter, Depends, File, UploadFile, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional
import re

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
from app.services.parser_service import extract_file_content
from app.services.ats_engine import run_full_ats_analysis


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
    return run_full_ats_analysis(
        resume_text=payload.resume_content,
        jd_text=payload.jd_content,
        target_role=payload.target_role or "",
        has_tables=False,
        is_scanned=False,
        filename=""
    )


@router.post("/resume/verify-claim")
def verify_claim(payload: VerifyClaimRequest):
    return verify_cryptographic_career_claim(payload.claim_json)


@router.post("/resume/upload-score")
async def upload_score(
    file: UploadFile = File(...),
    target_role: Optional[str] = Form(None),
    jd_content: Optional[str] = Form(None)
):
    # 1. Parse the uploaded file
    file_bytes = await file.read()
    parse_result = extract_file_content(file.filename, file_bytes)

    text = parse_result["text"]
    has_tables = parse_result["has_tables"]
    is_scanned = parse_result["is_scanned"]

    print("\n--- DEBUG ATS RESUME UPLOAD ---")
    print(f"File: {file.filename} | Status: {parse_result['status']} | Chars: {len(text)}")
    print(f"Sample:\n{text[:500]}")
    print("--------------------------------\n")

    # 2. Run the full research-backed ATS analysis engine
    result = run_full_ats_analysis(
        resume_text=text,
        jd_text=jd_content or "",
        target_role=target_role or "",
        has_tables=has_tables,
        is_scanned=is_scanned,
        filename=file.filename,
    )

    return result


