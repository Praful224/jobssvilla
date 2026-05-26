from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.user import User
from app.routes.auth import get_current_user
from app.schemas.notification import (
    NotificationCreate,
    BroadcastNotificationRequest,
    DirectNotificationRequest
)
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


@router.post("/admin/notifications/broadcast")
def broadcast_notification(
    payload: BroadcastNotificationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    users = db.query(User).all()
    for u in users:
        create_notification(
            db,
            u.id,
            payload.title,
            payload.message,
            "in_app"
        )
    return {"message": f"Broadcasted notification to {len(users)} users"}


@router.post("/admin/notifications/send-to-user")
def send_to_user_notification(
    payload: DirectNotificationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    create_notification(
        db,
        payload.user_id,
        payload.title,
        payload.message,
        "in_app"
    )
    return {"message": f"Direct notification sent to user ID {payload.user_id}"}

