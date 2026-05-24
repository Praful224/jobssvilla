from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.user import User
from app.routes.auth import get_current_user
from app.schemas.company import CompanyCreate, ReviewCreate
from app.services.market_service import create_company, create_review, list_companies

router = APIRouter(tags=["companies"])


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
