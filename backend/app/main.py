import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.database import Base, engine

from app.models.application import Application, SavedJob
from app.models.community import Message, Post, SkillGap, PostLike, Comment
from app.models.company import Company, Review
from app.models.mentor import Interview, Mentor, InterviewSlot, MentorSlot, SessionBooking
from app.models.notification import Notification
from app.models.profile import Profile
from app.models.resume import Resume
from app.models.user import User
from app.models.user_role import UserRole
from app.models.job import Job

from app.routes.ai import router as ai_router
from app.routes.dashboard import router as dashboard_router
from app.routes.applications import router as applications_router
from app.routes.auth import router as auth_router
from app.routes.jobs import router as jobs_router
from app.routes.companies import router as companies_router
from app.routes.mentorship import router as mentorship_router
from app.routes.community import router as community_router
from app.routes.notifications import router as notifications_router
from app.routes.profile import router as profile_router
from app.routes.recruiter import router as recruiter_router
from app.routes.resume import router as resume_router
from app.routes.saved_jobs import router as saved_jobs_router
from app.routes.similarity import router as similarity_router
from app.routes.admin import router as admin_router


Base.metadata.create_all(bind=engine)

# ── Incremental migrations (SQLite-compatible ALTER TABLE) ─────────────────
from sqlalchemy import text
with engine.begin() as conn:
    _migrations = [
        # Profile theme column
        "ALTER TABLE profiles ADD COLUMN theme VARCHAR DEFAULT 'dark'",
        # Legacy role column on users
        "ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'student'",
        # New Interview dedicated columns (replaces feedback stuffing)
        "ALTER TABLE interviews ADD COLUMN meeting_link VARCHAR",
        "ALTER TABLE interviews ADD COLUMN google_calendar_url VARCHAR",
        "ALTER TABLE interviews ADD COLUMN ical_url TEXT",
    ]
    for sql in _migrations:
        try:
            conn.execute(text(sql))
        except Exception:
            pass  # Column already exists — safe to ignore

app = FastAPI(

    title="JobsVilla API",
    description="Career platform APIs for jobs, profiles, applications, resume intelligence, mentorship, community, and recruiter workflows.",
    version="0.2.0",
)

cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "BACKEND_CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,http://10.242.218.114:3000,http://192.168.1.15:3000",
    ).split(",")
    if origin.strip()
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?|https://.*\.app\.github\.dev",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():

    return {
        "message": "JobsVilla Backend Running",
        "docs": "/docs",
        "version": "0.2.0",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "jobsvilla-api",
    }


@app.get("/architecture")
def architecture():
    return {
        "frontend": [
            "dashboard",
            "profile",
            "settings",
            "applications",
            "saved-jobs",
            "companies",
            "recruiter",
            "mentorship",
            "community",
            "roadmap",
        ],
        "backend_routes": [
            "/auth",
            "/jobs",
            "/profile",
            "/applications",
            "/notifications",
            "/resume",
            "/recruiter",
            "/mentors",
            "/analytics",
            "/ai",
            "/community",
        ],
        "planned_integrations": [
            "Telegram",
            "Email",
            "LinkedIn OAuth",
            "GitHub OAuth",
            "Payments",
            "S3",
            "Calendar",
            "Video meetings",
            "WhatsApp",
            "ATS export",
        ],
    }


app.include_router(auth_router, prefix="/auth")
app.include_router(auth_router, include_in_schema=False)
app.include_router(jobs_router)
app.include_router(profile_router)
app.include_router(applications_router)
app.include_router(saved_jobs_router)
app.include_router(notifications_router)
app.include_router(resume_router)
app.include_router(similarity_router)
app.include_router(recruiter_router)
app.include_router(companies_router)
app.include_router(mentorship_router)
app.include_router(community_router)
app.include_router(dashboard_router)
app.include_router(ai_router)
app.include_router(admin_router)
