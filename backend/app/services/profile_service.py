from sqlalchemy.orm import Session

from app.models.profile import Profile
from app.models.user import User
from app.models.user_role import UserRole
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


def profile_to_dict(profile: Profile, user: User, db: Session = None) -> dict:
    # ── Hard-coded admin gate: praful@gmail.com is always admin ───────────────
    email_lower = user.email.lower()
    is_hardcoded_admin = email_lower in ("praful@gmail.com", "admin@jobsvilla.com")

    # Determine role from profile title as a fallback
    candidate_role = "admin" if is_hardcoded_admin else "student"
    title_lower = (profile.title or "").lower()

    if not is_hardcoded_admin:
        if any(k in title_lower for k in ["recruiter", "hiring", "employer"]) or email_lower.endswith("@recruiter.com"):
            candidate_role = "recruiter"
        elif any(k in title_lower for k in ["mentor", "advisor", "coach", "tutor"]) or email_lower.endswith("@mentor.com"):
            candidate_role = "mentor"

    # Database Sync: check/insert into UserRole table if db session is present
    role = "student"
    pending_role = None

    if db is not None:
        try:
            db_roles = db.query(UserRole).filter(UserRole.user_id == user.id).all()

            if not db_roles:
                # Auto-seed: admin email gets admin role immediately
                if candidate_role in ("student", "admin") or is_hardcoded_admin:
                    default_role = UserRole(
                        user_id=user.id,
                        role="admin" if is_hardcoded_admin else candidate_role,
                        status="active"
                    )
                    db.add(default_role)
                    db.commit()
                    db_roles = [default_role]
                else:
                    # Mentors and Recruiters require approval, so insert in "pending" status!
                    # And also auto-create their baseline "student" role as active so they can use the app
                    student_role = UserRole(user_id=user.id, role="student", status="active")
                    pending_entry = UserRole(
                        user_id=user.id, 
                        role=candidate_role, 
                        status="pending",
                        verification_details=f"Dynamic title change to: '{profile.title}'"
                    )
                    db.add(student_role)
                    db.add(pending_entry)
                    db.commit()
                    db_roles = [student_role, pending_entry]
            
            # If they changed their title and have a new candidate role that is NOT in db_roles:
            existing_roles = [r.role for r in db_roles]
            if candidate_role not in existing_roles:
                # Create the new role request
                new_status = "active" if candidate_role in ["student", "admin"] else "pending"
                new_entry = UserRole(
                    user_id=user.id,
                    role=candidate_role,
                    status=new_status,
                    verification_details=f"Dynamic title change to: '{profile.title}'"
                )
                db.add(new_entry)
                db.commit()
                db_roles.append(new_entry)
            
            # Resolve active vs pending roles
            active_list = [r.role for r in db_roles if r.status == "active"]
            pending_list = [r.role for r in db_roles if r.status == "pending"]

            # Hard override: admin emails are ALWAYS admin regardless of what DB says
            if is_hardcoded_admin:
                active_list = list(set(active_list + ["admin"]))

            # Sync user.role column for legacy queries
            if "admin" in active_list:
                user.role = "admin"
            elif candidate_role in active_list:
                user.role = candidate_role
            else:
                user.role = "student"
            db.commit()

            # Expose highest active privilege role
            if "admin" in active_list:
                role = "admin"
            elif "recruiter" in active_list:
                role = "recruiter"
            elif "mentor" in active_list:
                role = "mentor"
            else:
                role = "student"

            if pending_list:
                pending_role = pending_list[0]
                
        except Exception as e:
            print("UserRole DB check failed, falling back to dynamic override:", e)
            role = "admin" if is_hardcoded_admin else candidate_role
    else:
        # Fallback if DB session is absent
        role = "admin" if is_hardcoded_admin else candidate_role
        
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
        "theme": profile.theme or "dark",
        "role": role,
        "pending_role": pending_role,
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
