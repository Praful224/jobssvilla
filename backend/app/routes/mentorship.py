from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from app.config.database import get_db
from app.models.user import User
from app.models.mentor import Mentor, MentorSlot, SessionBooking
from app.models.community import Message
from app.routes.auth import get_current_user
from app.schemas.mentor import (
    InterviewCreate,
    MentorCreate,
    MentorSlotCreate,
    BookSessionRequest,
)
from app.services.market_service import create_interview, create_mentor, list_interviews, list_mentors
from app.services.booking_service import (
    book_session,
    cancel_session,
    cancel_mentor_slot,
    create_mentor_slot,
    list_mentor_slots,
    list_my_sessions,
)

router = APIRouter(tags=["mentorship"])


class MessageCreate(BaseModel):
    body: str


# ─────────────────────────────────────────────────────────────────────────────
# Mentor Directory
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/mentors")
def mentors(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List all mentors.
    - Admin: sees everyone (full oversight)
    - Student/Mentor: sees everyone EXCEPT themselves (no self-booking)
    """
    all_mentors = list_mentors(db)

    # Admin sees ALL mentors — they need full visibility for oversight
    if current_user.role == "admin" or current_user.email == "praful@gmail.com":
        return all_mentors

    # Everyone else: filter out own card to prevent self-booking confusion
    return [
        m for m in all_mentors 
        if m.user_id != current_user.id 
        and not (m.name and current_user.name and m.name.strip().lower() == current_user.name.strip().lower())
    ]


@router.post("/mentors")
def add_mentor(
    payload: MentorCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create or update the current user's mentor profile (upsert)."""
    return create_mentor(db, current_user, payload)


@router.get("/mentors/me")
def get_my_mentor_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the logged-in user's own mentor profile."""
    mentor = db.query(Mentor).filter(Mentor.user_id == current_user.id).first()
    if not mentor:
        return {"id": None}
    return mentor


# ─────────────────────────────────────────────────────────────────────────────
# Mentor Slots  (mentor creates / manages their availability)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/mentors/slots")
def create_slot(
    payload: MentorSlotCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Mentor publishes a new availability slot.
    The mentor must have a profile registered first.
    """
    mentor = db.query(Mentor).filter(Mentor.user_id == current_user.id).first()
    if not mentor:
        raise HTTPException(status_code=400, detail="You must register as a mentor first.")
    try:
        return create_mentor_slot(db, mentor, payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/mentors/{mentor_id}/slots")
def get_mentor_slots(
    mentor_id: int,
    all_slots: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get available slots for a mentor (student view).
    Use ?all_slots=true for the mentor's own full slot dashboard.
    """
    # If mentor is asking for their OWN slots, show all (not just available)
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    is_own_profile = mentor and mentor.user_id == current_user.id
    show_all = all_slots and is_own_profile

    slots = list_mentor_slots(db, mentor_id, available_only=not show_all)
    return slots


@router.delete("/mentors/slots/{slot_id}")
def delete_slot(
    slot_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mentor cancels one of their own availability slots."""
    mentor = db.query(Mentor).filter(Mentor.user_id == current_user.id).first()
    if not mentor:
        raise HTTPException(status_code=400, detail="No mentor profile found.")
    try:
        return cancel_mentor_slot(db, slot_id, mentor)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# Session Bookings  (student books / cancels)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/sessions/book")
def book_session_endpoint(
    payload: BookSessionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Book a session.
    Supports slot-based (payload.slot_id) and freeform (mentor_id + scheduled_for).
    All business-logic guards are applied in booking_service.book_session().
    """
    try:
        return book_session(db, current_user, payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/sessions/my")
def my_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all sessions for the current user (as student and as mentor)."""
    return list_my_sessions(db, current_user)


@router.post("/sessions/{booking_id}/cancel")
def cancel_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cancel a session. Only the student or mentor involved can cancel."""
    try:
        return cancel_session(db, booking_id, current_user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# Legacy Endpoints (backward compat — /mentors/interviews)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/mentors/interviews")
def add_interview(
    payload: InterviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Legacy freeform booking endpoint.
    Kept for backward compatibility with old frontend calls.
    New bookings should use POST /sessions/book.
    """
    try:
        return create_interview(db, current_user, payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/mentors/interviews")
def get_user_interviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Legacy: returns interviews. New: use GET /sessions/my."""
    return list_interviews(db, current_user)


# ─────────────────────────────────────────────────────────────────────────────
# Session Chat  (real-time coordinate messaging between mentor & student)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/mentors/interviews/{interview_id}/messages")
def get_interview_messages(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    room_name = f"interview_{interview_id}"
    messages = (
        db.query(Message)
        .filter(Message.room == room_name)
        .order_by(Message.created_at.asc())
        .all()
    )
    result = []
    for msg in messages:
        sender = db.query(User).filter(User.id == msg.sender_id).first()
        result.append({
            "id": msg.id,
            "sender_id": msg.sender_id,
            "sender_name": sender.name if sender else "Anonymous",
            "body": msg.body,
            "created_at": msg.created_at,
        })
    return result


@router.post("/mentors/interviews/{interview_id}/messages")
def send_interview_message(
    interview_id: int,
    payload: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    room_name = f"interview_{interview_id}"
    msg = Message(sender_id=current_user.id, room=room_name, body=payload.body)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return {
        "id": msg.id,
        "sender_id": msg.sender_id,
        "sender_name": current_user.name,
        "body": msg.body,
        "created_at": msg.created_at,
    }
