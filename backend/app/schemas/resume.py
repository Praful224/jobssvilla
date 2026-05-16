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


class LatexResumeSave(BaseModel):
    title: Optional[str] = "My Resume"
    template_name: Optional[str] = "classic"
    latex_source: str


class LatexResumeRenderRequest(BaseModel):
    title: Optional[str] = "resume"
    latex_source: str
