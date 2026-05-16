from sqlalchemy.orm import Session

from app.models.application import Application, SavedJob
from app.models.job import Job
from app.models.notification import Notification
from app.models.user import User


def user_summary(db: Session, user: User) -> dict:
    applications = (
        db.query(Application)
        .filter(Application.user_id == user.id)
        .all()
    )
    status_counts: dict[str, int] = {}
    for application in applications:
        status_counts[application.status] = (
            status_counts.get(application.status, 0) + 1
        )

    return {
        "total_jobs": db.query(Job).count(),
        "applications": len(applications),
        "application_status": status_counts,
        "saved_jobs": (
            db.query(SavedJob)
            .filter(SavedJob.user_id == user.id, SavedJob.is_active.is_(True))
            .count()
        ),
        "unread_notifications": (
            db.query(Notification)
            .filter(Notification.user_id == user.id, Notification.is_read.is_(False))
            .count()
        ),
    }
