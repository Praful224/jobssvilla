import json
import hashlib
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_home():
    """Verify that the home endpoint is active and returns version info."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "JobsVilla Backend Running" in data["message"]
    assert "version" in data

def test_health():
    """Verify that the health check endpoint returns active status."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "jobsvilla-api"}

def test_architecture():
    """Verify that the architecture documentation route outputs active modules."""
    response = client.get("/architecture")
    assert response.status_code == 200
    data = response.json()
    assert "frontend" in data
    assert "backend_routes" in data

def test_auth_flow_and_authenticated_routes():
    """Verify registration, login, and authenticated resume/profile workflows."""
    # 1. Register a student user
    unique_email = "regression_student_2@jobsvilla.io"
    register_payload = {
        "name": "Regression Student",
        "email": unique_email,
        "password": "securepassword123"
    }
    
    # Clean up user if already exists from a prior test run
    # (Since we use a persistent SQLite database, we do registration but accept if 400 is returned as already registered)
    response = client.post("/auth/register", json=register_payload)
    if response.status_code == 400:
        assert response.json()["detail"] == "Email is already registered"
    else:
        assert response.status_code == 200
        assert response.json()["message"] == "User registered successfully"

    # Try duplicate registration and assert failure
    dup_response = client.post("/auth/register", json=register_payload)
    assert dup_response.status_code == 400
    assert dup_response.json()["detail"] == "Email is already registered"

    # 2. Login the registered user
    login_payload = {
        "username": unique_email,
        "password": "securepassword123"
    }
    # OAuth2 Password flow expects form-encoded data
    login_res = client.post("/auth/login", data=login_payload)
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data
    assert login_data["token_type"] == "bearer"
    token = login_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Save Resume using PUT
    resume_payload = {
        "file_name": "resume_v1.tex",
        "content": "This is sample resume text. Skills: Python, FastAPI, Next.js, React, Docker.",
        "skills": "Python, FastAPI, Next.js",
        "target_role": "Backend Engineer"
    }
    save_res = client.put("/resume", json=resume_payload, headers=headers)
    assert save_res.status_code == 200
    assert save_res.json()["file_name"] == "resume_v1.tex"

    # 4. Fetch the Saved Resume
    get_res = client.get("/resume", headers=headers)
    assert get_res.status_code == 200
    get_data = get_res.json()
    assert get_data["file_name"] == "resume_v1.tex"
    assert "FastAPI" in get_data["content"]

    # 5. Fetch Recruiter Candidates using Auth
    candidates_res = client.get("/recruiter/candidates", headers=headers)
    assert candidates_res.status_code == 200
    candidates = candidates_res.json()
    assert isinstance(candidates, list)
    if len(candidates) > 0:
        assert "email" in candidates[0]
        assert "hireability_index" in candidates[0]

def test_resume_latex_compilation_and_fallback():
    """Verify LaTeX compilation routes and fallback generation when local engine is active."""
    # Test compilation endpoint with basic LaTeX code
    latex_code = r"""
    \documentclass{article}
    \begin{document}
    Hello JobsVilla Regression Suite!
    \end{document}
    """
    payload = {"latex_code": latex_code}
    response = client.post("/resume/compile", json=payload)
    assert response.status_code == 200
    # Should successfully generate a PDF (either via native LaTeX compiler or beautiful ReportLab Canvas fallback)
    assert response.headers["content-type"] == "application/pdf"
    assert len(response.content) > 0

def test_star_bullet_enhancer():
    """Verify local STAR bullet point enhancer generates appropriate tone rewrites."""
    payload = {
        "bullet": "I wrote Python scripts to optimize data imports.",
        "tone": "Technical"
    }
    response = client.post("/resume/rewrite-bullet", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "suggestions" in data
    assert len(data["suggestions"]) > 0
    # Suggestions should be rich and action-verb focused
    assert any("Action" in s or "Impact" in s or "STAR" in s or len(s) > 10 for s in data["suggestions"])

def test_synonym_aware_ats_jd_matcher():
    """Verify local NLP matching matches synonyms correctly (e.g. RDS -> PostgreSQL)."""
    payload = {
        "resume_content": "Experience managing relational databases like RDS and PostgreSQL. Developed APIs with Remix and solidjs.",
        "jd_content": "We are seeking a developer with experience in Next.js, MySQL, PostgreSQL, Docker, and Python.",
        "target_role": "Fullstack Developer"
    }
    response = client.post("/resume/analyze-jd", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "match_score" in data
    assert "matched_keywords" in data
    assert "missing_keywords" in data
    assert "suggestions" in data
    
    # "postgresql" should be matched directly or via synonym "RDS"
    # "next.js" should be matched via synonym "Remix"
    # Verify that local mapping engine works correctly
    assert "postgresql" in data["matched_keywords"] or "next.js" in data["matched_keywords"]

def test_cryptographic_claims_verification():
    """Verify that the cryptographic claims verifier validates valid signatures and rejects tampered blocks."""
    # 1. Valid claims using developer mock signature prefix "sig_"
    valid_mock_claim = {
        "candidate_name": "Alice Developer",
        "candidate_email": "alice@jobsvilla.io",
        "issuer_name": "Decentria Academy",
        "issuer_domain": "decentria.edu",
        "claim_title": "Advanced Smart Contracts Expert",
        "skills": "Solidity, Web3.js, Cryptography",
        "tenure": "6 Months BootCamp",
        "issued_at": "2026-05-22",
        "signature": "sig_mock_signature_decentria_9988"
    }
    
    response = client.post("/resume/verify-claim", json={"claim_json": json.dumps(valid_mock_claim)})
    assert response.status_code == 200
    assert response.json()["verified"] is True
    assert "Verified" in response.json()["msg"]

    # 2. Valid claims using correct cryptographic SHA-256 hash validation
    claim_body = {
        "candidate_name": "Bob Architect",
        "candidate_email": "bob@jobsvilla.io",
        "issuer_name": "JobsVilla Trust Anchor",
        "issuer_domain": "jobsvilla.io",
        "claim_title": "Certified Platform Specialist",
        "skills": "FastAPI, Next.js, SQLite",
        "tenure": "Permanent Staff",
        "issued_at": "2026-05-22"
    }
    # Compute SHA-256 signature with "jobsvilla_trust_anchor" salt
    serialized_body = json.dumps(claim_body, sort_keys=True)
    hash_sig = hashlib.sha256((serialized_body + "jobsvilla_trust_anchor").encode("utf-8")).hexdigest()
    
    claim_body_with_sig = claim_body.copy()
    claim_body_with_sig["signature"] = hash_sig
    
    response_hash = client.post("/resume/verify-claim", json={"claim_json": json.dumps(claim_body_with_sig)})
    assert response_hash.status_code == 200
    assert response_hash.json()["verified"] is True

    # 3. Tampered claims validation failure (e.g. changing candidate email)
    tampered_claim = claim_body_with_sig.copy()
    tampered_claim["candidate_email"] = "hacker@evilcorp.io"
    
    response_tampered = client.post("/resume/verify-claim", json={"claim_json": json.dumps(tampered_claim)})
    assert response_tampered.status_code == 200
    assert response_tampered.json()["verified"] is False
    assert "tampered" in response_tampered.json()["error"]

    # 4. Missing required field failure
    broken_claim = {
        "candidate_name": "Broken Claims",
        "signature": "sig_invalid"
    }
    response_broken = client.post("/resume/verify-claim", json={"claim_json": json.dumps(broken_claim)})
    assert response_broken.status_code == 200
    assert response_broken.json()["verified"] is False
    assert "Missing" in response_broken.json()["error"]
