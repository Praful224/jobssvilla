from sqlalchemy.orm import Session

from app.models.application import Application
from app.models.community import SkillGap
from app.models.job import Job
from app.models.user import User
from app.schemas.community import CareerAssistantRequest, SkillGapRequest


ROLE_SKILL_MAP = {
    "devops": ["linux", "docker", "kubernetes", "aws", "terraform", "ci/cd"],
    "frontend": ["html", "css", "typescript", "react", "next.js", "testing"],
    "backend": ["python", "fastapi", "sql", "postgresql", "docker", "apis"],
    "ai": ["python", "ml", "llm", "vector database", "prompting", "evaluation"],
}


def recommendations(db: Session, user: User) -> list[Job]:
    applications = (
        db.query(Application)
        .filter(Application.user_id == user.id)
        .order_by(Application.updated_at.desc())
        .limit(5)
        .all()
    )
    interests = " ".join(
        f"{application.role} {application.company} {application.location or ''}"
        for application in applications
    ).lower()

    query = db.query(Job)
    if interests:
        for keyword in ["devops", "cloud", "python", "react", "ai", "security"]:
            if keyword in interests:
                query = query.filter(Job.skills.ilike(f"%{keyword}%"))
                break

    return query.order_by(Job.id.desc()).limit(10).all()


def skill_gap(db: Session, user: User, payload: SkillGapRequest) -> dict:
    role_key = payload.target_role.lower()
    required = []
    for key, skills in ROLE_SKILL_MAP.items():
        if key in role_key:
            required = skills
            break
    if not required:
        required = ROLE_SKILL_MAP["backend"]

    current = {
        skill.strip().lower()
        for skill in (payload.current_skills or "").split(",")
        if skill.strip()
    }
    missing = [skill for skill in required if skill not in current]
    roadmap = [
        f"Build one portfolio project using {skill}."
        for skill in missing[:4]
    ]

    record = SkillGap(
        user_id=user.id,
        target_role=payload.target_role,
        current_skills=payload.current_skills,
        missing_skills=", ".join(missing),
        roadmap="\n".join(roadmap),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "target_role": payload.target_role,
        "required_skills": required,
        "missing_skills": missing,
        "roadmap": roadmap,
    }


def career_assistant(payload: CareerAssistantRequest) -> dict:
    target = payload.target_role or "your next role"
    return {
        "reply": (
            f"For {target}, focus on proof of work: one strong project, "
            "a keyword-aligned resume, and 5-10 targeted applications per week. "
            "Share the job description and resume text to get a sharper plan."
        )
    }
