from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.user import User
from app.routes.auth import get_current_user
from app.services.analytics_service import user_summary


router = APIRouter(tags=["analytics"])


@router.get("/analytics/summary")
def analytics_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return user_summary(db, current_user)
