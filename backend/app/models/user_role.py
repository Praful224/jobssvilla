from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from app.config.database import Base

class UserRole(Base):
    __tablename__ = "user_roles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String, nullable=False) # "student" | "recruiter" | "mentor" | "admin"
    status = Column(String, default="pending", nullable=False) # "active" | "pending" | "rejected"
    verification_details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
