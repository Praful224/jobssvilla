from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text

from app.config.database import Base


class Mentor(Base):
    __tablename__ = "mentors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String, nullable=False)
    title = Column(String, nullable=False)
    company = Column(String, nullable=True)
    skills = Column(Text, nullable=True)
    hourly_rate = Column(String, nullable=True)
    availability = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class MentorSlot(Base):
    """
    Proper availability slot created by a mentor.
    Supports the full booking lifecycle:
      available → locked → confirmed → completed | cancelled | expired
    """
    __tablename__ = "mentor_slots"

    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey("mentors.id"), nullable=False)

    # When is this slot?
    date = Column(String, nullable=False)            # "2026-05-23"
    start_time = Column(String, nullable=False)      # "21:00"  (local time stored as string)
    end_time = Column(String, nullable=False)        # "22:00"
    start_utc = Column(String, nullable=True)        # ISO UTC "2026-05-23T15:30:00Z" (for ordering)

    # What kind of session?
    consultation_type = Column(String, nullable=True, default="mock")
    price = Column(Float, nullable=True, default=0.0)

    # Booking state
    # status: "available" | "locked" | "confirmed" | "completed" | "cancelled" | "expired"
    status = Column(String, nullable=False, default="available")
    is_booked = Column(Boolean, nullable=False, default=False)
    booked_by = Column(Integer, ForeignKey("users.id"), nullable=True)   # student user_id

    # Temporary lock (for future payment flow — 5-minute reservation window)
    locked_until = Column(DateTime, nullable=True)
    locked_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Payment hook (ready for Razorpay/Stripe — add later without schema migration)
    payment_id = Column(String, nullable=True)
    payment_status = Column(String, nullable=True, default="not_required")  # not_required | pending | paid | failed

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SessionBooking(Base):
    """
    Confirmed booking record. One row per booked session.
    Decoupled from MentorSlot so cancellation/rescheduling doesn't destroy history.
    """
    __tablename__ = "session_bookings"

    id = Column(Integer, primary_key=True, index=True)
    slot_id = Column(Integer, ForeignKey("mentor_slots.id"), nullable=True)
    mentor_id = Column(Integer, ForeignKey("mentors.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    interview_type = Column(String, nullable=True, default="mock")
    scheduled_for = Column(String, nullable=True)   # human-readable + timezone label

    # Meeting room
    meeting_link = Column(String, nullable=True)
    google_calendar_url = Column(String, nullable=True)
    ical_url = Column(Text, nullable=True)

    # Lifecycle status: confirmed | completed | cancelled | rescheduled
    status = Column(String, nullable=False, default="confirmed")

    # Payment hook
    payment_id = Column(String, nullable=True)
    payment_status = Column(String, nullable=True, default="not_required")

    notes = Column(Text, nullable=True)
    booked_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Interview(Base):
    """
    Legacy interview/booking record (kept for backward compatibility).
    New bookings use SessionBooking. This model is still used by the
    /mentors/interviews endpoints for the chat feature.
    """
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mentor_id = Column(Integer, ForeignKey("mentors.id"), nullable=True)
    interview_type = Column(String, default="mock", nullable=False)
    scheduled_for = Column(String, nullable=True)
    status = Column(String, default="confirmed", nullable=False)

    # Clean dedicated columns instead of jamming everything into feedback
    meeting_link = Column(String, nullable=True)
    google_calendar_url = Column(String, nullable=True)
    ical_url = Column(Text, nullable=True)
    feedback = Column(Text, nullable=True)          # Reserved for actual mentor feedback
    candidate_notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)


class InterviewSlot(Base):
    """Legacy slot model — kept for backward compatibility."""
    __tablename__ = "interview_slots"

    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey("mentors.id"), nullable=False)
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=False)
    status = Column(String, default="available", nullable=False)

