"""
booking_service.py
==================
Production-grade booking logic for the JobsVilla mentorship platform.

Flow (current, without payments):
  AVAILABLE → CONFIRMED

Future-ready flow (just uncomment payment hooks):
  AVAILABLE → LOCKED (5 min) → PAYMENT_SUCCESS → CONFIRMED → COMPLETED

All functions raise ValueError for business-logic failures.
Routes catch ValueError and convert to HTTP 400 so CORS headers are preserved.
"""
import urllib.parse
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.mentor import Mentor, MentorSlot, SessionBooking
from app.models.user import User
from app.schemas.mentor import BookSessionRequest, MentorSlotCreate
from app.services.notification_service import create_notification


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _generate_meeting_link() -> str:
    """UUID-based meeting room link — guaranteed unique, future-proof."""
    room_id = str(uuid.uuid4())
    return f"https://jobsvilla.live/meeting/{room_id}"


def _build_google_calendar_url(title: str, date: str, start: str, end: str, details: str) -> str:
    """
    Robust Google Calendar link builder.
    Uses strptime so format is always correct — no fragile string hacks.
    """
    try:
        start_dt = datetime.strptime(f"{date}T{start}", "%Y-%m-%dT%H:%M")
        end_dt = datetime.strptime(f"{date}T{end}", "%Y-%m-%dT%H:%M")
    except ValueError:
        return ""

    fmt = "%Y%m%dT%H%M%SZ"
    params = {
        "action": "TEMPLATE",
        "text": title,
        "dates": f"{start_dt.strftime(fmt)}/{end_dt.strftime(fmt)}",
        "details": details,
        "sf": "true",
        "output": "xml",
    }
    return f"https://www.google.com/calendar/render?{urllib.parse.urlencode(params)}"


def _build_ical_uri(title: str, date: str, start: str, end: str, details: str) -> str:
    """Generates a client-side downloadable .ics data URI."""
    try:
        start_dt = datetime.strptime(f"{date}T{start}", "%Y-%m-%dT%H:%M")
        end_dt = datetime.strptime(f"{date}T{end}", "%Y-%m-%dT%H:%M")
    except ValueError:
        return ""

    fmt = "%Y%m%dT%H%M%SZ"
    ical = (
        "BEGIN:VCALENDAR\n"
        "VERSION:2.0\n"
        "PRODID:-//JobsVilla//Scheduling Engine//EN\n"
        "BEGIN:VEVENT\n"
        f"SUMMARY:{title}\n"
        f"DTSTART:{start_dt.strftime(fmt)}\n"
        f"DTEND:{end_dt.strftime(fmt)}\n"
        f"DESCRIPTION:{details}\n"
        "STATUS:CONFIRMED\n"
        "END:VEVENT\n"
        "END:VCALENDAR"
    )
    return f"data:text/calendar;charset=utf-8,{urllib.parse.quote(ical)}"


# ─────────────────────────────────────────────────────────────────────────────
# Mentor: Slot Management
# ─────────────────────────────────────────────────────────────────────────────

def create_mentor_slot(db: Session, mentor: Mentor, payload: MentorSlotCreate) -> MentorSlot:
    """
    Mentor publishes a new availability slot.
    Prevents duplicate slots (same date + start_time).
    """
    # Prevent duplicate slots for the same date+time
    existing = db.query(MentorSlot).filter(
        MentorSlot.mentor_id == mentor.id,
        MentorSlot.date == payload.date,
        MentorSlot.start_time == payload.start_time,
        MentorSlot.status != "cancelled",
    ).first()
    if existing:
        raise ValueError(f"You already have a slot on {payload.date} at {payload.start_time}.")

    slot = MentorSlot(
        mentor_id=mentor.id,
        date=payload.date,
        start_time=payload.start_time,
        end_time=payload.end_time,
        consultation_type=payload.consultation_type or "mock",
        price=payload.price or 0.0,
        start_utc=payload.start_utc,
        status="available",
        is_booked=False,
        payment_status="not_required",
    )
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return slot


def list_mentor_slots(db: Session, mentor_id: int, available_only: bool = True) -> list:
    """
    Return slots for a mentor.
    available_only=True → only future, unbooked slots (what students see).
    available_only=False → all slots including booked (what mentor sees).
    """
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    query = db.query(MentorSlot).filter(MentorSlot.mentor_id == mentor_id)

    if available_only:
        query = query.filter(
            MentorSlot.status == "available",
            MentorSlot.is_booked == False,
            MentorSlot.date >= today,           # No past slots
        )
    return query.order_by(MentorSlot.date.asc(), MentorSlot.start_time.asc()).all()


def cancel_mentor_slot(db: Session, slot_id: int, mentor: Mentor) -> MentorSlot:
    """Mentor cancels one of their own slots."""
    slot = db.query(MentorSlot).filter(
        MentorSlot.id == slot_id,
        MentorSlot.mentor_id == mentor.id,
    ).first()
    if not slot:
        raise ValueError("Slot not found or does not belong to you.")
    if slot.is_booked:
        raise ValueError("Cannot cancel a slot that is already booked. Cancel the booking instead.")

    slot.status = "cancelled"
    db.commit()
    db.refresh(slot)
    return slot


# ─────────────────────────────────────────────────────────────────────────────
# Student: Book a Session
# ─────────────────────────────────────────────────────────────────────────────

def book_session(db: Session, student: User, payload: BookSessionRequest) -> SessionBooking:
    """
    Student books a session. Supports two modes:
      1. Slot-based  (payload.slot_id is set)   — preferred
      2. Freeform    (payload.mentor_id + scheduled_for) — legacy fallback

    Security checks (backend always validates — never trust frontend):
      ✅ Auth required (handled in route)
      ✅ Slot exists and is available
      ✅ Slot is not in the past
      ✅ Self-booking blocked
      ✅ Double-booking blocked (row-level lock)
      ✅ Transaction rollback on any error
    """

    mentor_id = payload.mentor_id
    scheduled_for = payload.scheduled_for
    slot: MentorSlot | None = None

    # ── MODE 1: Slot-based booking ────────────────────────────────────────────
    if payload.slot_id:
        # Row-level lock: only ONE concurrent request can book this slot
        slot = (
            db.query(MentorSlot)
            .filter(MentorSlot.id == payload.slot_id)
            .with_for_update()          # ← PostgreSQL / SQLite advisory lock
            .first()
        )
        if not slot:
            raise ValueError("Slot not found.")

        if slot.status != "available" or slot.is_booked:
            raise ValueError("This slot is no longer available. Please choose another.")

        # Past slot guard
        try:
            slot_dt = datetime.strptime(f"{slot.date}T{slot.start_time}", "%Y-%m-%dT%H:%M")
            if slot_dt < datetime.utcnow():
                raise ValueError("This slot has already passed. Please choose a future slot.")
        except ValueError as parse_err:
            if "already passed" in str(parse_err):
                raise
            # If time parsing fails, proceed (don't block booking on bad format)

        mentor_id = slot.mentor_id
        scheduled_for = f"{slot.date} {slot.start_time} – {slot.end_time}"

    # ── MODE 2: Freeform booking (no predefined slot) ─────────────────────────
    elif not mentor_id:
        raise ValueError("Either slot_id or mentor_id must be provided.")

    # ── Guard: Self-booking blocked ───────────────────────────────────────────
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    if not mentor:
        raise ValueError("Mentor not found.")

    if mentor.user_id == student.id or (mentor.name and student.name and mentor.name.strip().lower() == student.name.strip().lower()):
        raise ValueError("You cannot book your own mentorship session.")

    # ── Guard: Double-booking (same student, same mentor, same time) ──────────
    if scheduled_for:
        existing = (
            db.query(SessionBooking)
            .filter(
                SessionBooking.student_id == student.id,
                SessionBooking.mentor_id == mentor_id,
                SessionBooking.scheduled_for == scheduled_for,
                SessionBooking.status != "cancelled",
            )
            .with_for_update()
            .first()
        )
        if existing:
            raise ValueError("You already have a booking with this mentor at this time.")

    # ── Generate meeting resources ────────────────────────────────────────────
    meet_url = _generate_meeting_link()

    cal_title = f"JobsVilla {payload.interview_type or 'Mock'} Session with {mentor.name}"
    cal_details = f"Meeting Room: {meet_url}\nMentor: {mentor.title} at {mentor.company or 'JobsVilla'}"

    gcal_url = ""
    ical_uri = ""
    if slot:
        gcal_url = _build_google_calendar_url(cal_title, slot.date, slot.start_time, slot.end_time, cal_details)
        ical_uri = _build_ical_uri(cal_title, slot.date, slot.start_time, slot.end_time, cal_details)

    # ── Create session booking ────────────────────────────────────────────────
    try:
        booking = SessionBooking(
            slot_id=slot.id if slot else None,
            mentor_id=mentor_id,
            student_id=student.id,
            interview_type=payload.interview_type or "mock",
            scheduled_for=scheduled_for,
            meeting_link=meet_url,
            google_calendar_url=gcal_url or None,
            ical_url=ical_uri or None,
            status="confirmed",
            payment_status="not_required",      # flip to "pending" when payment added
            notes=payload.candidate_notes,
        )
        db.add(booking)

        # Mark slot as booked (atomic with booking creation)
        if slot:
            slot.is_booked = True
            slot.booked_by = student.id
            slot.status = "confirmed"

        db.commit()
        db.refresh(booking)
    except Exception:
        db.rollback()
        raise

    # ── Notifications ─────────────────────────────────────────────────────────
    if mentor.user_id:
        create_notification(
            db,
            mentor.user_id,
            "📅 New Session Booked",
            f"{student.name} booked a {payload.interview_type or 'mock'} session with you "
            f"for {scheduled_for}. Room: {meet_url}",
        )

    create_notification(
        db,
        student.id,
        "✅ Session Confirmed",
        f"Your {payload.interview_type or 'mock'} session with {mentor.name} is confirmed "
        f"for {scheduled_for}. Room: {meet_url}",
    )

    return booking


# ─────────────────────────────────────────────────────────────────────────────
# Student: View & Cancel Sessions
# ─────────────────────────────────────────────────────────────────────────────

def list_my_sessions(db: Session, user: User) -> list[dict]:
    """
    Returns all sessions for the current user — both as student and as mentor.
    """
    result = []

    # Sessions where user is the student
    student_bookings = db.query(SessionBooking).filter(
        SessionBooking.student_id == user.id
    ).order_by(SessionBooking.booked_at.desc()).all()

    for b in student_bookings:
        mentor = db.query(Mentor).filter(Mentor.id == b.mentor_id).first()
        result.append({
            "id": b.id,
            "role": "student",
            "mentor_name": mentor.name if mentor else "Unknown",
            "mentor_title": mentor.title if mentor else "",
            "mentor_company": mentor.company if mentor else "",
            "interview_type": b.interview_type,
            "scheduled_for": b.scheduled_for,
            "status": b.status,
            "meeting_link": b.meeting_link,
            "google_calendar_url": b.google_calendar_url,
            "ical_url": b.ical_url,
            "payment_status": b.payment_status,
            "booked_at": b.booked_at.isoformat() if b.booked_at else None,
        })

    # Sessions where user is the mentor
    mentor_profile = db.query(Mentor).filter(Mentor.user_id == user.id).first()
    if mentor_profile:
        mentor_bookings = db.query(SessionBooking).filter(
            SessionBooking.mentor_id == mentor_profile.id
        ).order_by(SessionBooking.booked_at.desc()).all()

        for b in mentor_bookings:
            student = db.query(User).filter(User.id == b.student_id).first()
            result.append({
                "id": b.id,
                "role": "mentor",
                "student_name": student.name if student else "Unknown",
                "student_email": student.email if student else "",
                "interview_type": b.interview_type,
                "scheduled_for": b.scheduled_for,
                "status": b.status,
                "meeting_link": b.meeting_link,
                "google_calendar_url": b.google_calendar_url,
                "ical_url": b.ical_url,
                "payment_status": b.payment_status,
                "booked_at": b.booked_at.isoformat() if b.booked_at else None,
            })

    return result


def cancel_session(db: Session, booking_id: int, user: User) -> dict:
    """
    Cancel a session. Only the student or mentor involved can cancel.
    Frees up the slot if it was slot-based.
    """
    booking = db.query(SessionBooking).filter(SessionBooking.id == booking_id).first()
    if not booking:
        raise ValueError("Session not found.")

    # Only the student or the mentor can cancel
    mentor_profile = db.query(Mentor).filter(Mentor.user_id == user.id).first()
    is_student = booking.student_id == user.id
    is_mentor = mentor_profile and booking.mentor_id == mentor_profile.id

    if not is_student and not is_mentor:
        raise ValueError("You are not authorised to cancel this session.")

    if booking.status == "cancelled":
        raise ValueError("Session is already cancelled.")

    booking.status = "cancelled"

    # Free up the slot
    if booking.slot_id:
        slot = db.query(MentorSlot).filter(MentorSlot.id == booking.slot_id).first()
        if slot:
            slot.is_booked = False
            slot.booked_by = None
            slot.status = "available"

    db.commit()
    return {"message": "Session cancelled successfully.", "booking_id": booking_id}
