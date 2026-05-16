from typing import Optional

from pydantic import BaseModel


class ApplicationCreate(BaseModel):
    job_id: Optional[int] = None
    company: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = "Applied"
    source: Optional[str] = "JobsVilla"
    notes: Optional[str] = None


class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    source: Optional[str] = None


class SavedJobCreate(BaseModel):
    job_id: int
