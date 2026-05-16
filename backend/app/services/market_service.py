from sqlalchemy.orm import Session

from app.models.company import Company, Review
from app.models.community import Post
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
    return db.query(Mentor).order_by(Mentor.created_at.desc()).all()


def create_mentor(db: Session, user: User, payload: MentorCreate) -> Mentor:
    mentor = Mentor(**payload.model_dump(), user_id=user.id)
    db.add(mentor)
    db.commit()
    db.refresh(mentor)
    return mentor


def create_interview(db: Session, user: User, payload: InterviewCreate) -> Interview:
    interview = Interview(**payload.model_dump(), user_id=user.id)
    db.add(interview)
    db.commit()
    db.refresh(interview)
    return interview


def list_posts(db: Session) -> list[Post]:
    return db.query(Post).order_by(Post.created_at.desc()).limit(50).all()


def create_post(db: Session, user: User, payload: PostCreate) -> Post:
    post = Post(**payload.model_dump(), user_id=user.id)
    db.add(post)
    db.commit()
    db.refresh(post)
    return post
