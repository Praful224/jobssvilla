import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.database import Base, engine

from app.models.application import Application, SavedJob
from app.models.community import Message, Post, SkillGap
from app.models.company import Company, Review
from app.models.mentor import Interview, Mentor
from app.models.notification import Notification
from app.models.profile import Profile
from app.models.resume import Resume
from app.models.user import User
from app.models.job import Job

from app.routes.ai import router as ai_router
from app.routes.analytics import router as analytics_router
from app.routes.applications import router as applications_router
from app.routes.auth import router as auth_router
from app.routes.job import router as job_router
from app.routes.market import router as market_router
from app.routes.notifications import router as notifications_router
from app.routes.profile import router as profile_router
from app.routes.recruiter import router as recruiter_router
from app.routes.resume import router as resume_router
from app.routes.saved_jobs import router as saved_jobs_router


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="JobsVilla API",
    description="Career platform APIs for jobs, profiles, applications, resume intelligence, mentorship, community, and recruiter workflows.",
    version="0.2.0",
)

cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "BACKEND_CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https://.*\.app\.github\.dev",
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
app.include_router(job_router)
app.include_router(profile_router)
app.include_router(applications_router)
app.include_router(saved_jobs_router)
app.include_router(notifications_router)
app.include_router(resume_router)
app.include_router(recruiter_router)
app.include_router(market_router)
app.include_router(analytics_router)
app.include_router(ai_router)
