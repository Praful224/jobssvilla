import re
import shutil
import subprocess
import tempfile
from pathlib import Path

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.resume import LatexResume
from app.models.user import User
from app.schemas.resume import LatexResumeSave


LATEX_TEMPLATES = {
    "classic": r"""\documentclass[11pt,a4paper]{article}
\usepackage[margin=0.7in]{geometry}
\usepackage[hidelinks]{hyperref}

\pagestyle{empty}
\setlength{\parindent}{0pt}

\begin{document}

{\Huge \textbf{Praful Admin}}\\
\vspace{4pt}
DevOps and Backend Engineer\\
\href{mailto:praful@example.com}{praful@example.com} \quad
+91 9876543210 \quad
\href{https://github.com/Praful224}{github.com/Praful224}

\section*{Summary}
Backend and DevOps engineer building FastAPI, Next.js, Docker, PostgreSQL, and cloud automation projects.

\section*{Skills}
Python, FastAPI, PostgreSQL, Docker, Kubernetes, AWS, Terraform, Linux, CI/CD, Monitoring

\section*{Experience}
\textbf{JobsVilla Platform} \hfill 2026\\
Built a career platform with job discovery, application tracking, resume analysis, mentorship, and community workflows.

\section*{Projects}
\textbf{Cloud Deployment Pipeline}\\
Created Docker-based development workflows and CI/CD automation for backend and frontend services.

\section*{Education}
B.Tech Computer Science

\end{document}
""",
    "compact": r"""\documentclass[10pt,a4paper]{article}
\usepackage[margin=0.55in]{geometry}
\usepackage[hidelinks]{hyperref}
\pagestyle{empty}
\setlength{\parindent}{0pt}

\begin{document}

\begin{center}
{\LARGE \textbf{Praful Admin}}\\
DevOps Engineer | Python | FastAPI | Kubernetes\\
\href{mailto:praful@example.com}{praful@example.com} | +91 9876543210 | Pune, India
\end{center}

\textbf{SUMMARY}\\
Career-focused engineer with hands-on projects in backend APIs, Docker, PostgreSQL, and cloud deployments.

\vspace{6pt}
\textbf{SKILLS}\\
Python, FastAPI, Next.js, PostgreSQL, Docker, Kubernetes, AWS, Terraform, GitHub Actions

\vspace{6pt}
\textbf{EXPERIENCE}\\
\textbf{JobsVilla Career Platform} \hfill 2026\\
- Implemented APIs for jobs, profiles, applications, resumes, notifications, mentors, and community.\\
- Integrated a Next.js dashboard with FastAPI and PostgreSQL.

\vspace{6pt}
\textbf{PROJECTS}\\
\textbf{Resume Builder}\\
- Built LaTeX resume editing and PDF export workflow for job seekers.

\vspace{6pt}
\textbf{EDUCATION}\\
B.Tech Computer Science

\end{document}
""",
}

BLOCKED_LATEX_PATTERNS = [
    r"\\write18",
    r"\\input\b",
    r"\\include\b",
    r"\\openin",
    r"\\openout",
    r"\\read\b",
    r"\\usepackage\{minted\}",
    r"\\immediate",
]


def list_templates() -> dict:
    return {
        "templates": [
            {
                "name": name,
                "label": name.replace("_", " ").title(),
                "source": source,
            }
            for name, source in LATEX_TEMPLATES.items()
        ]
    }


def validate_latex_source(latex_source: str) -> None:
    if len(latex_source) > 50000:
        raise HTTPException(
            status_code=400,
            detail="LaTeX source is too large. Keep it under 50,000 characters.",
        )

    for pattern in BLOCKED_LATEX_PATTERNS:
        if re.search(pattern, latex_source, flags=re.IGNORECASE):
            raise HTTPException(
                status_code=400,
                detail=f"LaTeX command blocked for safety: {pattern}",
            )


def get_latex_resume(db: Session, user: User) -> LatexResume | None:
    return (
        db.query(LatexResume)
        .filter(LatexResume.user_id == user.id)
        .order_by(LatexResume.updated_at.desc())
        .first()
    )


def save_latex_resume(
    db: Session,
    user: User,
    payload: LatexResumeSave,
) -> LatexResume:
    validate_latex_source(payload.latex_source)
    resume = get_latex_resume(db, user)

    if not resume:
        resume = LatexResume(user_id=user.id, latex_source=payload.latex_source)
        db.add(resume)

    resume.title = payload.title or "My Resume"
    resume.template_name = payload.template_name or "classic"
    resume.latex_source = payload.latex_source
    db.commit()
    db.refresh(resume)
    return resume


def find_latex_compiler() -> str | None:
    for compiler in ["pdflatex", "tectonic", "xelatex", "lualatex"]:
        path = shutil.which(compiler)
        if path:
            return path
    return None


def render_latex_pdf(latex_source: str, title: str = "resume") -> tuple[Path, str]:
    validate_latex_source(latex_source)

    compiler = find_latex_compiler()
    if not compiler:
        raise HTTPException(
            status_code=503,
            detail=(
                "No LaTeX compiler found. In Codespaces install one with: "
                "sudo apt-get update && sudo apt-get install -y "
                "texlive-latex-base texlive-latex-recommended"
            ),
        )

    temp_dir = Path(tempfile.mkdtemp(prefix="jobsvilla-latex-"))
    tex_path = temp_dir / "resume.tex"
    pdf_path = temp_dir / "resume.pdf"
    tex_path.write_text(latex_source, encoding="utf-8")

    if Path(compiler).name == "tectonic":
        command = [
            compiler,
            "--outdir",
            str(temp_dir),
            str(tex_path),
        ]
    else:
        command = [
            compiler,
            "-interaction=nonstopmode",
            "-halt-on-error",
            "-no-shell-escape",
            "-output-directory",
            str(temp_dir),
            str(tex_path),
        ]

    try:
        result = subprocess.run(
            command,
            cwd=temp_dir,
            capture_output=True,
            text=True,
            timeout=20,
            check=False,
        )
    except subprocess.TimeoutExpired as exc:
        shutil.rmtree(temp_dir, ignore_errors=True)
        raise HTTPException(
            status_code=408,
            detail="LaTeX compilation timed out.",
        ) from exc

    if result.returncode != 0 or not pdf_path.exists():
        log_excerpt = (result.stdout + "\n" + result.stderr)[-3000:]
        shutil.rmtree(temp_dir, ignore_errors=True)
        raise HTTPException(
            status_code=400,
            detail=f"LaTeX compilation failed:\n{log_excerpt}",
        )

    safe_title = re.sub(r"[^A-Za-z0-9_-]+", "-", title or "resume").strip("-")
    return pdf_path, f"{safe_title or 'resume'}.pdf"
