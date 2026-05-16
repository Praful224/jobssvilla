import shutil

from fastapi import APIRouter, BackgroundTasks, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.user import User
from app.routes.auth import get_current_user
from app.schemas.resume import (
    LatexResumeRenderRequest,
    LatexResumeSave,
    ResumeAnalyzeRequest,
    ResumeUpsert,
)
from app.services.latex_resume_service import (
    get_latex_resume,
    list_templates,
    render_latex_pdf,
    save_latex_resume,
)
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


@router.get("/resume/latex/templates")
def get_latex_templates():
    return list_templates()


@router.get("/resume/latex")
def get_saved_latex_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = get_latex_resume(db, current_user)
    return resume or {}


@router.put("/resume/latex")
def save_latex_resume_route(
    payload: LatexResumeSave,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return save_latex_resume(db, current_user, payload)


@router.post("/resume/latex/render")
def render_latex_resume_route(
    payload: LatexResumeRenderRequest,
    background_tasks: BackgroundTasks,
    _current_user: User = Depends(get_current_user),
):
    pdf_path, file_name = render_latex_pdf(
        payload.latex_source,
        payload.title or "resume",
    )
    background_tasks.add_task(shutil.rmtree, str(pdf_path.parent), ignore_errors=True)
    return FileResponse(
        path=pdf_path,
        filename=file_name,
        media_type="application/pdf",
    )
