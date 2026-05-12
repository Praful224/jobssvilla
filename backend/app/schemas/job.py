from pydantic import BaseModel


class JobCreate(BaseModel):

    company: str
    role: str
    location: str
    salary: str
    skills: str
    apply_link: str
    description: str