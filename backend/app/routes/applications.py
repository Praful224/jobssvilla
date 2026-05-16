from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.user import User
from app.routes.auth import get_current_user
from app.schemas.application import ApplicationCreate, ApplicationUpdate
from app.services.application_service import (
    create_application,
    list_applications,
    update_application,
)


router = APIRouter(tags=["applications"])


@router.get("/applications")
def get_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return list_applications(db, current_user)


@router.post("/applications")
def add_application(
    payload: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return create_application(db, current_user, payload)


@router.patch("/applications/{application_id}")
def patch_application(
    application_id: int,
    payload: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return update_application(db, current_user, application_id, payload)
