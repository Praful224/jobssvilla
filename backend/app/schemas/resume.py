from typing import Optional

from pydantic import BaseModel


class ResumeAnalyzeRequest(BaseModel):
    content: str
    target_role: Optional[str] = None


class ResumeUpsert(BaseModel):
    file_name: Optional[str] = None
    content: str
    skills: Optional[str] = None
    target_role: Optional[str] = None

