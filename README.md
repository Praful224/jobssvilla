# JobsVilla

JobsVilla is a career platform for job discovery, application tracking, profile management, resume analysis, mentorship, community, and recruiter workflows.

## What Is Implemented On `dev`

- Next.js frontend pages: dashboard, profile, settings, applications, saved jobs, companies, recruiter portal, mentorship market, community feed, resume builder, notifications, analytics, and roadmap.
- Shared frontend components: `AppShell`, `JobCard`, `SearchBar`, `ResumeBuilder`, `ChatWidget`, and `Kanban`.
- FastAPI routes: `/auth`, `/jobs`, `/profile`, `/applications`, `/saved-jobs`, `/notifications`, `/resume`, `/recruiter`, `/mentors`, `/companies`, `/analytics`, `/ai`, and `/community/posts`.
- SQLAlchemy models: user, job, profile, application, saved job, notification, resume, company, review, mentor, interview, community post, message, and skill gap.
- Service layer foundations for jobs, profiles, applications, notifications, resume analysis, analytics, AI helper responses, mentorship, companies, and community.
- Codespaces configuration in `.devcontainer/devcontainer.json`.

## Codespaces Setup

Open the repo in GitHub Codespaces on the `dev` branch.

```bash
git checkout dev
```

Create backend environment variables:

```bash
cp backend/.env.example backend/.env
```

Create frontend environment variables:

```bash
cp frontend/.env.example frontend/.env.local
```

In Codespaces, open the **Ports** tab after starting the backend and copy the forwarded URL for port `8000`. Put that URL in `frontend/.env.local`:

```text
NEXT_PUBLIC_API_URL=https://YOUR-CODESPACE-8000-URL.app.github.dev
```

Start PostgreSQL:

```bash
cd backend
docker compose up -d
```

Install backend dependencies and the LaTeX compiler used by the resume PDF builder:

```bash
cd backend
pip install -r requirements.txt
sudo apt-get update
sudo apt-get install -y texlive-latex-base texlive-latex-recommended
```

Run the backend:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

In a second terminal, install and run the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open the forwarded frontend URL for port `3000`. The API docs are available on the forwarded backend URL at `/docs`.

## Important Environment Notes

For Codespaces, the backend allows GitHub preview URLs through CORS using this regex:

```text
https://*.app.github.dev
```

If your frontend cannot reach the backend, update `frontend/.env.local`:

```text
NEXT_PUBLIC_API_URL=https://YOUR-8000-CODESPACE-URL.app.github.dev
```

Then restart the Next.js dev server.

## Main API Routes

- `POST /register` and `POST /login` remain for existing frontend compatibility.
- `POST /auth/register` and `POST /auth/login` are also available for the architecture-style `/auth` group.
- `GET /jobs`, `GET /jobs/search?q=python`, `POST /jobs`
- `GET /profile`, `PUT /profile`
- `GET /applications`, `POST /applications`, `PATCH /applications/{id}`
- `GET /saved-jobs`, `POST /saved-jobs`, `DELETE /saved-jobs/{job_id}`
- `GET /notifications`, `POST /notifications`, `PATCH /notifications/{id}/read`
- `GET /resume`, `PUT /resume`, `POST /resume/analyze`
- `GET /resume/latex/templates`, `GET /resume/latex`, `PUT /resume/latex`, `POST /resume/latex/render`
- `GET /recruiter/dashboard`, `POST /recruiter/jobs`
- `GET /companies`, `POST /companies`, `POST /companies/reviews`
- `GET /mentors`, `POST /mentors`, `POST /mentors/interviews`
- `GET /analytics/summary`
- `GET /ai/recommendations`, `POST /ai/resume-analyzer`, `POST /ai/skill-gap`, `POST /ai/career-assistant`
- `GET /community/posts`, `POST /community/posts`

## Next Feature Layers

The current implementation includes integration-ready placeholders for AI and third-party services. The next production passes should add:

- Real LLM provider integration for resume analysis and career assistant.
- File uploads to S3-compatible storage for resumes and avatars.
- OAuth login/import for LinkedIn and GitHub.
- Email, Telegram, and WhatsApp notification workers.
- Celery/Redis background jobs.
- Proper Alembic migrations instead of `Base.metadata.create_all`.
- Recruiter ATS export and payment integration for mentor bookings.
