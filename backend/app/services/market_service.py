from sqlalchemy.orm import Session

from app.models.company import Company, Review
from app.models.community import Post, PostLike, Comment
from app.models.mentor import Interview, Mentor
from app.models.user import User
from app.schemas.company import CompanyCreate, ReviewCreate
from app.schemas.community import PostCreate
from app.schemas.mentor import InterviewCreate, MentorCreate


def list_companies(db: Session) -> list[Company]:
    return db.query(Company).order_by(Company.name.asc()).all()


def create_company(db: Session, user: User, payload: CompanyCreate) -> Company:
    company = Company(**payload.model_dump(), created_by=user.email)
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


def create_review(db: Session, user: User, payload: ReviewCreate) -> Review:
    review = Review(**payload.model_dump(), user_id=user.id)
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


def list_mentors(db: Session) -> list[Mentor]:
    # Dynamic DB Healing: Link legacy mentors with NULL user_id to users with same name case-insensitively
    unlinked_mentors = db.query(Mentor).filter(Mentor.user_id == None).all()
    if unlinked_mentors:
        from app.models.user import User
        for m in unlinked_mentors:
            user = db.query(User).filter(User.name.ilike(m.name)).first()
            if user:
                m.user_id = user.id
        db.commit()

    raw_mentors = db.query(Mentor).order_by(Mentor.created_at.desc()).all()
    seen_users = set()
    deduped_mentors = []
    for m in raw_mentors:
        if m.user_id is None:
            deduped_mentors.append(m)
        elif m.user_id not in seen_users:
            seen_users.add(m.user_id)
            deduped_mentors.append(m)
    return deduped_mentors


def create_mentor(db: Session, user: User, payload: MentorCreate) -> Mentor:
    mentor = db.query(Mentor).filter(Mentor.user_id == user.id).first()
    if mentor:
        # Update existing mentor portfolio coordinates!
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(mentor, key, value)
    else:
        # Create a new mentor portfolio entry
        mentor = Mentor(**payload.model_dump(), user_id=user.id)
        db.add(mentor)
    db.commit()
    db.refresh(mentor)
    return mentor


def create_interview(db: Session, user: User, payload: InterviewCreate) -> Interview:
    import uuid
    from datetime import datetime, timezone
    from app.services.notification_service import create_notification

    # ── Guard 1: Self-booking prevention ──────────────────────────────────────
    if payload.mentor_id:
        mentor = db.query(Mentor).filter(
            Mentor.id == payload.mentor_id
        ).first()

        if not mentor:
            raise ValueError("Mentor not found")

        # Prevent mentors booking themselves
        if mentor.user_id == user.id or (mentor.name and user.name and mentor.name.strip().lower() == user.name.strip().lower()):
            raise ValueError(
                "You cannot book your own mentorship session."
            )

        mentor_name = mentor.name
        mentor_title = mentor.title
        mentor_company = mentor.company or "JobsVilla"

    # ── Guard 2: Double-booking prevention with row-level lock ─────────────────
    # Check if this student already has a non-cancelled booking with the
    # same mentor at the same scheduled time.
    if payload.mentor_id and payload.scheduled_for:
        existing = (
            db.query(Interview)
            .filter(
                Interview.user_id == user.id,
                Interview.mentor_id == payload.mentor_id,
                Interview.scheduled_for == payload.scheduled_for,
                Interview.status != "cancelled",
            )
            .with_for_update()   # Row-level lock: prevents race conditions
            .first()
        )
        if existing:
            raise ValueError("You already have a session booked at this time with this mentor.")

    # ── Meet link: UUID-based so it is unique and future-proof ────────────────
    room_id = str(uuid.uuid4())
    meet_url = f"https://jobsvilla.live/meeting/{room_id}"

    # ── Store booking time in UTC ISO format ──────────────────────────────────
    booked_at_utc = datetime.now(timezone.utc).isoformat()

    mentor_name = "your mentor"
    mentor_obj = None
    if payload.mentor_id:
        mentor_obj = mentor
        if mentor_obj:
            mentor_name = mentor_obj.name

    try:
        interview = Interview(
            user_id=user.id,
            mentor_id=payload.mentor_id,
            interview_type=payload.interview_type or "mock",
            scheduled_for=payload.scheduled_for,
            status="confirmed",        # lowercase standardised status
            feedback=f"Meeting Link: {meet_url}",
            candidate_notes=f"Booked at: {booked_at_utc}",
        )
        db.add(interview)
        db.commit()
        db.refresh(interview)
    except Exception:
        db.rollback()
        raise

    # ── Notifications ─────────────────────────────────────────────────────────
    if mentor_obj and mentor_obj.user_id:
        create_notification(
            db,
            mentor_obj.user_id,
            "📅 New Session Booked",
            f"{user.name} booked a {payload.interview_type or 'mock'} session with you for {payload.scheduled_for}. "
            f"Room: {meet_url}",
        )

    create_notification(
        db,
        user.id,
        "✅ Session Confirmed",
        f"Your {payload.interview_type or 'mock'} session with {mentor_name} is confirmed for {payload.scheduled_for}. "
        f"Room: {meet_url}",
    )

    return interview


def list_interviews(db: Session, user: User) -> list[dict]:
    # Fetch interviews booked by this user as a student
    interviews_as_student = db.query(Interview).filter(Interview.user_id == user.id).all()
    
    # Fetch interviews booked with this user as a mentor
    interviews_as_mentor = []
    mentor_profile = db.query(Mentor).filter(Mentor.user_id == user.id).first()
    if mentor_profile:
        interviews_as_mentor = db.query(Interview).filter(Interview.mentor_id == mentor_profile.id).all()
        
    result = []
    for interview in interviews_as_student:
        mentor = db.query(Mentor).filter(Mentor.id == interview.mentor_id).first() if interview.mentor_id else None
        result.append({
            "id": interview.id,
            "mentor_id": interview.mentor_id,
            "mentor_name": mentor.name if mentor else "AI Career Coach",
            "mentor_title": mentor.title if mentor else "Principal AI Systems",
            "mentor_company": mentor.company if mentor else "JobsVilla",
            "interview_type": interview.interview_type,
            "scheduled_for": interview.scheduled_for,
            "status": interview.status,
            "feedback": interview.feedback,
            "created_at": interview.created_at,
            "role_in_interview": "student"
        })
        
    for interview in interviews_as_mentor:
        student = db.query(User).filter(User.id == interview.user_id).first()
        result.append({
            "id": interview.id,
            "mentor_id": mentor_profile.id,
            "mentor_name": mentor_profile.name,
            "mentor_title": mentor_profile.title,
            "mentor_company": mentor_profile.company,
            "student_name": student.name if student else "Anonymous Student",
            "student_email": student.email if student else "N/A",
            "interview_type": interview.interview_type,
            "scheduled_for": interview.scheduled_for,
            "status": interview.status,
            "feedback": interview.feedback,
            "created_at": interview.created_at,
            "role_in_interview": "mentor"
        })
        
    return result



def list_posts(db: Session) -> list[dict]:
    posts = db.query(Post).order_by(Post.created_at.desc()).limit(50).all()
    result = []
    for post in posts:
        author = db.query(User).filter(User.id == post.user_id).first()
        likes_count = db.query(PostLike).filter(PostLike.post_id == post.id).count()
        result.append({
            "id": post.id,
            "user_id": post.user_id,
            "title": post.title,
            "body": post.body,
            "tags": post.tags,
            "created_at": post.created_at,
            "author_name": author.name if author else "Anonymous",
            "likes_count": likes_count
        })
    return result


def create_post(db: Session, user: User, payload: PostCreate) -> Post:
    post = Post(**payload.model_dump(), user_id=user.id)
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


def like_post(db: Session, user: User, post_id: int) -> dict:
    # Toggle like logic
    like = db.query(PostLike).filter(PostLike.post_id == post_id, PostLike.user_id == user.id).first()
    if like:
        db.delete(like)
        db.commit()
        likes_count = db.query(PostLike).filter(PostLike.post_id == post_id).count()
        return {"liked": False, "likes_count": likes_count}
    else:
        like = PostLike(post_id=post_id, user_id=user.id)
        db.add(like)
        db.commit()
        likes_count = db.query(PostLike).filter(PostLike.post_id == post_id).count()
        return {"liked": True, "likes_count": likes_count}


def list_comments(db: Session, post_id: int) -> list[dict]:
    comments = db.query(Comment).filter(Comment.post_id == post_id).order_by(Comment.created_at.asc()).all()
    result = []
    for comment in comments:
        author = db.query(User).filter(User.id == comment.user_id).first()
        result.append({
            "id": comment.id,
            "post_id": comment.post_id,
            "user_id": comment.user_id,
            "body": comment.body,
            "created_at": comment.created_at,
            "author_name": author.name if author else "Anonymous"
        })
    return result


def create_comment(db: Session, user: User, post_id: int, body: str) -> dict:
    comment = Comment(post_id=post_id, user_id=user.id, body=body)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return {
        "id": comment.id,
        "post_id": comment.post_id,
        "user_id": comment.user_id,
        "body": comment.body,
        "created_at": comment.created_at,
        "author_name": user.name
    }

