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


import os
import requests
import json

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def skill_gap(db: Session, user: User, payload: SkillGapRequest) -> dict:
    required = []
    missing = []
    roadmap = []
    
    if GEMINI_API_KEY:
        try:
            prompt = f"""
            Analyze the skill gap for target role: "{payload.target_role}".
            Current skills of user: "{payload.current_skills or 'None'}".
            Provide the output STRICTLY in JSON format with the following keys. Do not include any markdown fences (like ```json) in your raw output:
            {{
                "required_skills": ["python", "fastapi", "react"],
                "missing_skills": ["fastapi", "react"],
                "roadmap": [
                    "Complete a tutorial on FastAPI basics and route creation.",
                    "Build a React single page application with modern hooks.",
                    "Connect your React frontend with the FastAPI backend."
                ]
            }}
            """
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
            headers = {"Content-Type": "application/json"}
            body = {
                "contents": [{
                    "parts": [{
                        "text": prompt
                    }]
                }]
            }
            res = requests.post(url, headers=headers, json=body, timeout=10)
            if res.status_code == 200:
                data = res.json()
                text_out = data["contents"][0]["parts"][0]["text"].strip()
                if text_out.startswith("```"):
                    lines = text_out.splitlines()
                    if lines[0].startswith("```"):
                        lines = lines[1:]
                    if lines[-1].strip() == "```":
                        lines = lines[:-1]
                    text_out = "\n".join(lines).strip()
                
                parsed = json.loads(text_out)
                if all(k in parsed for k in ["required_skills", "missing_skills", "roadmap"]):
                    required = parsed["required_skills"]
                    missing = parsed["missing_skills"]
                    roadmap = parsed["roadmap"]
        except Exception as e:
            print(f"Gemini API Error in skill gap: {e}")
            
    if not required:
        role_key = payload.target_role.lower()
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
    if GEMINI_API_KEY:
        try:
            prompt = f"""
            You are an elite career assistant, a expert job search strategist, and technical recruiter.
            Answer the following message from a user seeking job search guidance. Provide a clear, premium, encouraging, and highly actionable response:
            Target role: {payload.target_role or "Any Software Engineering Role"}
            Message: {payload.message}
            """
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
            headers = {"Content-Type": "application/json"}
            body = {
                "contents": [{
                    "parts": [{
                        "text": prompt
                    }]
                }]
            }
            res = requests.post(url, headers=headers, json=body, timeout=10)
            if res.status_code == 200:
                data = res.json()
                text_out = data["contents"][0]["parts"][0]["text"].strip()
                return {"reply": text_out}
        except Exception as e:
            print(f"Gemini API Error in career assistant: {e}")

    target = payload.target_role or "your next role"
    return {
        "reply": (
            f"For {target}, focus on proof of work: one strong project, "
            "a keyword-aligned resume, and 5-10 targeted applications per week. "
            "Share the job description and resume text to get a sharper plan."
        )
    }
