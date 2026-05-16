from sqlalchemy.orm import Session

from app.models.profile import Profile
from app.models.user import User
from app.schemas.profile import ProfileUpdate


def get_or_create_profile(db: Session, user: User) -> Profile:
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if profile:
        return profile

    profile = Profile(
        user_id=user.id,
        full_name=user.name,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


def profile_to_dict(profile: Profile, user: User) -> dict:
    return {
        "id": profile.id,
        "user_id": user.id,
        "name": profile.full_name or user.name,
        "email": user.email,
        "full_name": profile.full_name or user.name,
        "title": profile.title,
        "phone": profile.phone,
        "location": profile.location,
        "bio": profile.bio,
        "skills": profile.skills,
        "experience": profile.experience,
        "education": profile.education,
        "portfolio_url": profile.portfolio_url,
        "github_url": profile.github_url,
        "linkedin_url": profile.linkedin_url,
        "resume_url": profile.resume_url,
        "created_at": profile.created_at,
        "updated_at": profile.updated_at,
    }


def update_profile(db: Session, user: User, payload: ProfileUpdate) -> Profile:
    profile = get_or_create_profile(db, user)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile
