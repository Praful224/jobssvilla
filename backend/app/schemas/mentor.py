from typing import Optional

from pydantic import BaseModel


class MentorCreate(BaseModel):
    name: str
    title: str
    company: Optional[str] = None
    skills: Optional[str] = None
    hourly_rate: Optional[str] = None
    availability: Optional[str] = None
    bio: Optional[str] = None


# ── Mentor Slot Schemas ───────────────────────────────────────────────────────

class MentorSlotCreate(BaseModel):
    """Mentor publishes an available time slot."""
    date: str                                       # "2026-05-23"
    start_time: str                                 # "21:00"
    end_time: str                                   # "22:00"
    consultation_type: Optional[str] = "mock"       # mock | resume | career | system
    price: Optional[float] = 0.0
    start_utc: Optional[str] = None                 # ISO UTC (computed by frontend)


class MentorSlotResponse(BaseModel):
    id: int
    mentor_id: int
    date: str
    start_time: str
    end_time: str
    consultation_type: Optional[str]
    price: Optional[float]
    status: str
    is_booked: bool
    payment_status: Optional[str]

    class Config:
        from_attributes = True


# ── Session Booking Schemas ───────────────────────────────────────────────────

class BookSessionRequest(BaseModel):
    """
    Student books a session. Two modes:
    1. slot_id → book a specific slot the mentor published
    2. mentor_id + scheduled_for → freeform booking (no predefined slot)
    """
    slot_id: Optional[int] = None          # preferred: slot-based
    mentor_id: Optional[int] = None        # fallback: freeform
    interview_type: Optional[str] = "mock"
    scheduled_for: Optional[str] = None    # human-readable with timezone
    candidate_notes: Optional[str] = None


class SessionBookingResponse(BaseModel):
    id: int
    slot_id: Optional[int]
    mentor_id: int
    student_id: int
    interview_type: Optional[str]
    scheduled_for: Optional[str]
    meeting_link: Optional[str]
    google_calendar_url: Optional[str]
    status: str
    payment_status: Optional[str]
    booked_at: str

    class Config:
        from_attributes = True


# ── Legacy Schemas (kept for backward compat) ─────────────────────────────────

class InterviewCreate(BaseModel):
    mentor_id: Optional[int] = None
    interview_type: Optional[str] = "mock"
    scheduled_for: Optional[str] = None
    candidate_notes: Optional[str] = None
    slot_id: Optional[int] = None


class SlotCreate(BaseModel):
    start_time: str
    end_time: str

