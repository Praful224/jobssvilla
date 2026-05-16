from sqlalchemy.orm import Session

from app.models.resume import Resume
from app.models.user import User
from app.schemas.resume import ResumeAnalyzeRequest, ResumeUpsert

CORE_KEYWORDS = [
    "python",
    "fastapi",
    "react",
    "next.js",
    "typescript",
    "sql",
    "postgresql",
    "docker",
    "kubernetes",
    "aws",
    "ci/cd",
    "terraform",
    "linux",
    "monitoring",
]


def analyze_resume(payload: ResumeAnalyzeRequest) -> dict:
    content = payload.content.lower()
    matched = [keyword for keyword in CORE_KEYWORDS if keyword in content]
    keyword_score = round((len(matched) / len(CORE_KEYWORDS)) * 100, 2)

    structure_score = 0
    for section in ["experience", "projects", "skills", "education"]:
        if section in content:
            structure_score += 10

    ats_score = min(100, round(keyword_score * 0.7 + structure_score, 2))
    missing = [keyword for keyword in CORE_KEYWORDS if keyword not in matched][:6]
    target = payload.target_role or "your target role"

    suggestions = [
        f"Add measurable impact statements for {target}.",
        "Keep skills grouped by backend, frontend, cloud, and tools.",
        "Use exact job keywords when they genuinely match your experience.",
    ]
    if missing:
        suggestions.append(f"Consider adding relevant keywords: {', '.join(missing)}.")

    return {
        "ats_score": ats_score,
        "keyword_score": keyword_score,
        "matched_keywords": matched,
        "missing_keywords": missing,
        "suggestions": suggestions,
    }


def get_latest_resume(db: Session, user: User) -> Resume | None:
    return (
        db.query(Resume)
        .filter(Resume.user_id == user.id)
        .order_by(Resume.updated_at.desc())
        .first()
    )


def upsert_resume(db: Session, user: User, payload: ResumeUpsert) -> Resume:
    analysis = analyze_resume(
        ResumeAnalyzeRequest(
            content=payload.content,
            target_role=payload.target_role,
        )
    )
    resume = get_latest_resume(db, user)
    suggestions = "\n".join(analysis["suggestions"])

    if not resume:
        resume = Resume(user_id=user.id)
        db.add(resume)

    resume.file_name = payload.file_name
    resume.content = payload.content
    resume.skills = payload.skills
    resume.ats_score = analysis["ats_score"]
    resume.keyword_score = analysis["keyword_score"]
    resume.suggestions = suggestions

    db.commit()
    db.refresh(resume)
    return resume
