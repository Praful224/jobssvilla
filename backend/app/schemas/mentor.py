from typing import Optional

from pydantic import BaseModel


class MentorCreate(BaseModel):
    name: str
    title: str
    company: Optional[str] = None
    skills: Optional[str] = None
    hourly_rate: Optional[str] = None
    availability: Optional[str] = None
    bio: Optional[str] = None


class InterviewCreate(BaseModel):
    mentor_id: Optional[int] = None
    interview_type: Optional[str] = "mock"
    scheduled_for: Optional[str] = None
