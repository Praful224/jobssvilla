from typing import Optional

from pydantic import BaseModel


class CompanyCreate(BaseModel):
    name: str
    website: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None


class ReviewCreate(BaseModel):
    company_id: int
    rating: int
    title: str
    body: Optional[str] = None
