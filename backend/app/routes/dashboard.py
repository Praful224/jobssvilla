from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.user import User
from app.routes.auth import get_current_user
from app.services.dashboard_service import user_summary

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard/summary")
def dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return user_summary(db, current_user)
