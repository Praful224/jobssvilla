from typing import Optional

from pydantic import BaseModel


class NotificationCreate(BaseModel):
    title: str
    message: str
    channel: Optional[str] = "in_app"


class BroadcastNotificationRequest(BaseModel):
    title: str
    message: str
    priority: Optional[bool] = False


class DirectNotificationRequest(BaseModel):
    user_id: int
    title: str
    message: str
    priority: Optional[bool] = False

