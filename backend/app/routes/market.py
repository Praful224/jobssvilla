from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.user import User
from app.routes.auth import get_current_user
from app.schemas.company import CompanyCreate, ReviewCreate
from app.schemas.community import PostCreate
from app.schemas.mentor import InterviewCreate, MentorCreate
from app.services.market_service import (
    create_company,
    create_interview,
    create_mentor,
    create_post,
    create_review,
    list_companies,
    list_mentors,
    list_posts,
)


router = APIRouter(tags=["market"])


@router.get("/companies")
def companies(db: Session = Depends(get_db)):
    return list_companies(db)


@router.post("/companies")
def add_company(
    payload: CompanyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return create_company(db, current_user, payload)


@router.post("/companies/reviews")
def add_company_review(
    payload: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return create_review(db, current_user, payload)


@router.get("/mentors")
def mentors(db: Session = Depends(get_db)):
    return list_mentors(db)


@router.post("/mentors")
def add_mentor(
    payload: MentorCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return create_mentor(db, current_user, payload)


@router.post("/mentors/interviews")
def add_interview(
    payload: InterviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return create_interview(db, current_user, payload)


@router.get("/community/posts")
def community_posts(db: Session = Depends(get_db)):
    return list_posts(db)


@router.post("/community/posts")
def add_community_post(
    payload: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return create_post(db, current_user, payload)
