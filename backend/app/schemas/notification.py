from typing import Optional

from pydantic import BaseModel


class NotificationCreate(BaseModel):
    title: str
    message: str
    channel: Optional[str] = "in_app"
