from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "student"
    verification_details: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str
