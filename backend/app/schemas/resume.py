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


class ResumeCompileRequest(BaseModel):
    latex_code: str


class ResumeJDMatchRequest(BaseModel):
    resume_content: str
    jd_content: str
    target_role: Optional[str] = None


class BulletEnhanceRequest(BaseModel):
    bullet: str
    tone: Optional[str] = "Technical"


class VerifyClaimRequest(BaseModel):
    claim_json: str

