from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.user import User
from app.routes.auth import get_current_user
from app.schemas.notification import NotificationCreate
from app.services.notification_service import (
    create_notification,
    list_notifications,
    mark_notification_read,
)


router = APIRouter(tags=["notifications"])


@router.get("/notifications")
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return list_notifications(db, current_user.id)


@router.post("/notifications")
def add_notification(
    payload: NotificationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return create_notification(
        db,
        current_user.id,
        payload.title,
        payload.message,
        payload.channel or "in_app",
    )


@router.patch("/notifications/{notification_id}/read")
def read_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return mark_notification_read(db, current_user.id, notification_id)
