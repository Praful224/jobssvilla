from typing import Optional

from pydantic import BaseModel


class JobCreate(BaseModel):

    company: str
    role: str
    location: str
    salary: Optional[str] = None
    skills: Optional[str] = None
    apply_link: str
    description: Optional[str] = None


class JobUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    skills: Optional[str] = None
    apply_link: Optional[str] = None
    description: Optional[str] = None
