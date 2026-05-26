import datetime
import random
import string
import urllib.parse
from sqlalchemy.orm import Session
from app.models.mentor import Mentor, Interview, InterviewSlot
from app.models.user import User
from app.schemas.mentor import InterviewCreate, SlotCreate
from app.services.notification_service import create_notification


def list_available_slots(db: Session, mentor_id: int):
    """List available scheduling slots for a specific mentor."""
    return db.query(InterviewSlot).filter(
        InterviewSlot.mentor_id == mentor_id,
        InterviewSlot.status == "available"
    ).all()


def create_mentor_slots(db: Session, mentor_id: int, slots: list[SlotCreate]):
    """Allow a recruiter or mentor to publish availability slots."""
    created_slots = []
    for slot_data in slots:
        slot = InterviewSlot(
            mentor_id=mentor_id,
            start_time=slot_data.start_time,
            end_time=slot_data.end_time,
            status="available"
        )
        db.add(slot)
        created_slots.append(slot)
    db.commit()
    for s in created_slots:
        db.refresh(s)
    return created_slots


def generate_google_calendar_url(title: str, start_iso: str, end_iso: str, details: str) -> str:
    """Generate a one-click Google Calendar web booking link."""
    # Clean ISO strings from separators for Google calendar format (YYYYMMDDTHHMMSSZ)
    clean_start = start_iso.replace("-", "").replace(":", "")
    clean_end = end_iso.replace("-", "").replace(":", "")
    
    # If no Z or timezone exists, append Z to simulate UTC
    if "Z" not in clean_start and "t" not in clean_start.lower():
        clean_start += "Z"
        clean_end += "Z"
    
    base_url = "https://www.google.com/calendar/render"
    params = {
        "action": "TEMPLATE",
        "text": title,
        "dates": f"{clean_start}/{clean_end}",
        "details": details,
        "sf": "true",
        "output": "xml"
    }
    return f"{base_url}?{urllib.parse.urlencode(params)}"


def generate_ical_data_uri(title: str, start_iso: str, end_iso: str, details: str) -> str:
    """Generate a client-side downloadable iCal .ics data URI."""
    clean_start = start_iso.replace("-", "").replace(":", "")
    clean_end = end_iso.replace("-", "").replace(":", "")
    if "Z" not in clean_start and "t" not in clean_start.lower():
        clean_start += "Z"
        clean_end += "Z"
        
    ical_content = (
        "BEGIN:VCALENDAR\n"
        "VERSION:2.0\n"
        "PRODID:-//JobsVilla//Scheduling Engine//EN\n"
        "BEGIN:VEVENT\n"
        f"SUMMARY:{title}\n"
        f"DTSTART:{clean_start}\n"
        f"DTEND:{clean_end}\n"
        f"DESCRIPTION:{details}\n"
        "STATUS:CONFIRMED\n"
        "END:VEVENT\n"
        "END:VCALENDAR"
    )
    encoded_content = urllib.parse.quote(ical_content)
    return f"data:text/calendar;charset=utf-8,{encoded_content}"


def book_interview_session(db: Session, user: User, payload: InterviewCreate) -> Interview:
    """Self-book an available slot, locking it and spawning a calendar event."""
    # Generate Google Meet mock URL
    meet_code = "".join(random.choices(string.ascii_lowercase, k=3)) + "-" + \
                "".join(random.choices(string.ascii_lowercase, k=4)) + "-" + \
                "".join(random.choices(string.ascii_lowercase, k=3))
    meet_url = f"https://meet.google.com/{meet_code}"
    
    mentor_name = "AI Career Coach"
    mentor_title = "Principal Coach"
    mentor_company = "JobsVilla"
    
    start_time = payload.scheduled_for or datetime.datetime.utcnow().isoformat()
    end_time = (datetime.datetime.fromisoformat(start_time.replace("Z", "")) + datetime.timedelta(hours=1)).isoformat() + "Z" if "Z" in start_time else (datetime.datetime.fromisoformat(start_time) + datetime.timedelta(hours=1)).isoformat()
    
    # Process slot lock if slot_id is provided
    if payload.slot_id:
        slot = db.query(InterviewSlot).filter(
            InterviewSlot.id == payload.slot_id,
            InterviewSlot.status == "available"
        ).first()
        if not slot:
            raise ValueError("Requested interview slot is unavailable or already booked.")
        
        slot.status = "booked"
        start_time = slot.start_time
        end_time = slot.end_time
        payload.scheduled_for = start_time
        payload.mentor_id = slot.mentor_id
        
    if payload.mentor_id:
        mentor = db.query(Mentor).filter(Mentor.id == payload.mentor_id).first()
        if mentor:
            mentor_name = mentor.name
            mentor_title = mentor.title
            mentor_company = mentor.company or "JobsVilla"

    title = f"JobsVilla 1:1 {payload.interview_type.upper()} with {mentor_name}"
    details = f"Google Meet Room: {meet_url}\nMentor details: {mentor_title} at {mentor_company}"
    
    gcal_url = generate_google_calendar_url(title, start_time, end_time, details)
    ical_uri = generate_ical_data_uri(title, start_time, end_time, details)
    
    feedback_text = (
        f"Google Meet Link: {meet_url} | "
        f"Google Cal: {gcal_url} | "
        f"iCal: {ical_uri}"
    )

    interview = Interview(
        user_id=user.id,
        mentor_id=payload.mentor_id,
        interview_type=payload.interview_type or "mock",
        scheduled_for=payload.scheduled_for,
        status="Scheduled",
        feedback=feedback_text,
        candidate_notes=payload.candidate_notes  # Hidden from recruiters
    )
    
    db.add(interview)
    db.commit()
    db.refresh(interview)
    
    # Trigger unified priority notification alert
    create_notification(
        db,
        user.id,
        "Mentorship Scheduled",
        f"Your {payload.interview_type or 'mock'} interview with {mentor_name} is successfully scheduled.",
        channel="in_app"
    )
    
    return interview
