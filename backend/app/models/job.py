from sqlalchemy import Column, Integer, String, Text

from app.config.database import Base


class Job(Base):

    __tablename__ = "jobs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    company = Column(
        String,
        nullable=False
    )

    role = Column(
        String,
        nullable=False
    )

    location = Column(
        String,
        nullable=False
    )

    salary = Column(
        String,
        nullable=True
    )

    skills = Column(
        String,
        nullable=True
    )

    apply_link = Column(
        String,
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    created_by = Column(
        String,
        nullable=False
    )