from typing import Optional

from pydantic import BaseModel


class PostCreate(BaseModel):
    title: str
    body: str
    tags: Optional[str] = None


class SkillGapRequest(BaseModel):
    target_role: str
    current_skills: Optional[str] = None


class CareerAssistantRequest(BaseModel):
    message: str
    target_role: Optional[str] = None
