# JobsVilla 🚀

JobsVilla is a modern career ecosystem platform built for tech professionals to discover job opportunities, connect with mentors, and prepare for interviews.

The platform provides:
- Daily tech job postings
- JWT-based authentication system
- Secure backend APIs
- Telegram automation for job alerts
- Future mentorship & mock interview system

---

# Features

## Current Features
- FastAPI backend setup
- PostgreSQL database integration
- Dockerized PostgreSQL
- SQLAlchemy ORM models
- User registration API
- Login API
- JWT authentication
- Password hashing
- Protected route support
- Swagger API documentation

---

# Upcoming Features

## Jobs Module
- Create jobs
- Update jobs
- Delete jobs
- Search & filter jobs

## Mentorship Module
- Mentor profiles
- Session booking
- Career guidance

## Mock Interview Module
- DevOps interviews
- DSA interviews
- HR interviews
- Feedback system

## Notifications
- Telegram integration
- Email alerts
- Push notifications

---

# Tech Stack

## Backend
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT Authentication
- Passlib
- Docker

## Frontend (Upcoming)
- Next.js
- Tailwind CSS
- TypeScript
- ShadCN UI

## DevOps
- Docker
- GitHub Actions
- Render/Vercel Deployment

---

# Project Structure

```bash
jobssvilla/
│
├── backend/
│   ├── app/
│   │   ├── config/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   ├── docker-compose.yml
│   └── .gitignore
│
└── frontend/
```

---

# Backend Setup

## Clone Repository

```bash
git clone <your-repo-url>
cd jobssvilla/backend
```

---

# Create Virtual Environment

```bash
python3 -m venv venv
```

Activate venv:

## Linux / Mac

```bash
source venv/bin/activate
```

## Windows

```bash
venv\Scripts\activate
```

---

# Install Dependencies

```bash
pip install -r requirements.txt
```

---

# Start PostgreSQL Docker Container

```bash
docker compose up -d
```

---

# Run FastAPI Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

# Swagger Documentation

Open:

```text
http://127.0.0.1:8000/docs
```

---

# Database Setup

PostgreSQL runs inside Docker container.

Default configuration:

- Database: `jobsvilla`
- Username: `postgres`
- Password: `postgres`
- Port: `5432`

---

# Authentication APIs

## Register User

### POST `/register`

Request:

```json
{
  "name": "Praful",
  "email": "praful@gmail.com",
  "password": "123456"
}
```

---

## Login User

### POST `/login`

Request:

```json
{
  "email": "praful@gmail.com",
  "password": "123456"
}
```

Response:

```json
{
  "access_token": "JWT_TOKEN",
  "token_type": "bearer"
}
```

---

# Protected Routes

Future protected APIs will require:

```text
Authorization: Bearer JWT_TOKEN
```

---

# Docker Commands

## Start Containers

```bash
docker compose up -d
```

## Stop Containers

```bash
docker compose down
```

## View Running Containers

```bash
docker ps
```

---

# Git Workflow

## Add Changes

```bash
git add .
```

## Commit Changes

```bash
git commit -m "your message"
```

## Push Code

```bash
git push origin main
```

---

# Future Roadmap

## Phase 1
- Authentication
- Jobs CRUD APIs
- Telegram automation

## Phase 2
- Frontend UI
- Dashboard
- Job filters

## Phase 3
- Mentorship system
- Booking system

## Phase 4
- Mock interview platform
- Feedback dashboard

## Phase 5
- AI features
- Resume analysis
- ATS scoring

---

# Security Features

- Password hashing
- JWT authentication
- Protected APIs
- SQLAlchemy ORM protection
- Input validation

---

# Deployment Plan

## Frontend
- Vercel

## Backend
- Render/Railway

## Database
- PostgreSQL Docker Container

---

# Author

Praful Chalakh

---

# License

This project is licensed under the MIT License.
