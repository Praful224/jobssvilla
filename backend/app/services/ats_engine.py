"""
╔══════════════════════════════════════════════════════════════════════════════════╗
║               COMPREHENSIVE ATS ENGINE  —  Research-Backed Simulation           ║
║                                                                                  ║
║  Sources & Architecture References:                                              ║
║  • Workday: ML Talent Optimization, structured taxonomy, seniority scoring       ║
║  • Greenhouse: Scorecard pipelines, Boolean search, skills-section indexing      ║
║  • Lever: Semantic field extraction, AI profile cards                            ║
║  • Taleo (Oracle): Legacy keyword-density engine, strict section-heading parser  ║
║  • iCIMS: Structured profile matching, knockout questionnaires                   ║
║  • SmartRecruiters: NLP Match Score AI, semantic similarity (SBERT-like)         ║
║  • Jobvite: Social signals, LinkedIn correlation, referral scoring               ║
║  • BambooHR: Human-first, recruiter tag search                                   ║
║  • Ashby: Modern structured parsing, clean pipeline scoring                      ║
║  • LinkedIn Easy Apply: Profile completeness + network proximity + endorsements  ║
║                                                                                  ║
║  NLP Concepts Simulated:                                                         ║
║  • TF-IDF keyword density scoring                                                ║
║  • Semantic synonym / alias ontology matching (ESCO + O*NET inspired)            ║
║  • Section segmentation via header pattern NER                                   ║
║  • Named Entity Recognition: titles, companies, dates, locations                 ║
║  • Experience timeline analysis + employment gap detection                       ║
║  • Seniority-level detection and mismatch penalty                                ║
║  • Education requirement classification (BS/MS/PhD)                              ║
║  • Hard knockout trigger simulation (instant rejection rules)                    ║
║  • Formatting compliance parsing (table/column/scan failure detection)           ║
║  • Quantification signal scoring (numbers, %, $, metrics in bullets)             ║
║  • Action verb quality scoring (passive vs. strong verbs)                        ║
╚══════════════════════════════════════════════════════════════════════════════════╝
"""

from __future__ import annotations

import re
import math
import datetime
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple


# ══════════════════════════════════════════════════════════════════════════════
# 1.  SKILL ONTOLOGY  (ESCO + O*NET + industry research inspired)
#     Each entry: canonical_name -> list of accepted aliases / synonyms
# ══════════════════════════════════════════════════════════════════════════════

SKILL_ONTOLOGY: Dict[str, List[str]] = {
    # ── Cloud Platforms ──────────────────────────────────────────────────────
    "AWS":              ["amazon web services", "amazon aws", "aws cloud", "ec2", "s3", "lambda", "cloudwatch", "cloudfront", "rds", "dynamodb", "sqs", "sns", "eks", "ecs", "fargate", "elasticbeanstalk", "route53"],
    "Azure":            ["microsoft azure", "azure cloud", "azure devops", "aks", "azure functions", "blob storage", "azure ad", "active directory", "arm templates"],
    "GCP":              ["google cloud", "google cloud platform", "gke", "bigquery", "cloud run", "cloud functions", "gcs", "google kubernetes engine", "dataflow", "pub/sub"],
    "Multi-Cloud":      ["hybrid cloud", "cloud agnostic", "multi cloud", "cross-cloud"],
    "OpenStack":        ["open stack", "openstack cloud"],

    # ── Containers & Orchestration ───────────────────────────────────────────
    "Kubernetes":       ["k8s", "kubectl", "kube", "kubernetes cluster", "k8", "k8s cluster", "cka", "ckad", "container orchestration"],
    "Docker":           ["docker container", "dockerfile", "docker compose", "docker swarm", "containerization", "container"],
    "Helm":             ["helm charts", "helm chart", "helmfile"],
    "Istio":            ["service mesh", "istio service mesh"],
    "OpenShift":        ["red hat openshift", "ocp", "okd"],

    # ── Infrastructure as Code ───────────────────────────────────────────────
    "Terraform":        ["tf", "terraform cloud", "hcl", "hashicorp", "infrastructure as code", "iac"],
    "Ansible":          ["ansible playbook", "ansible roles", "ansible tower", "red hat ansible"],
    "Pulumi":           ["pulumi iac"],
    "CloudFormation":   ["aws cloudformation", "cfn", "cloud formation", "sam"],
    "CDK":              ["aws cdk", "cloud development kit"],

    # ── CI/CD ────────────────────────────────────────────────────────────────
    "CI/CD":            ["continuous integration", "continuous delivery", "continuous deployment", "cicd", "ci cd", "build pipeline", "deployment pipeline", "release pipeline"],
    "Jenkins":          ["jenkins pipeline", "jenkinsfile", "jenkins ci"],
    "GitHub Actions":   ["github actions", "gha", "gh actions"],
    "GitLab CI":        ["gitlab-ci", "gitlab ci", ".gitlab-ci.yml", "gitlab pipelines"],
    "ArgoCD":           ["argo cd", "argo", "gitops", "git ops"],
    "CircleCI":         ["circle ci"],
    "Spinnaker":        ["spinnaker cd"],
    "Tekton":           ["tekton pipeline"],

    # ── Monitoring & Observability ───────────────────────────────────────────
    "Prometheus":       ["prom", "promql", "prometheus alertmanager"],
    "Grafana":          ["grafana dashboard", "grafana labs"],
    "Datadog":          ["data dog", "dd-agent", "ddtrace", "apm"],
    "ELK Stack":        ["elasticsearch", "logstash", "kibana", "elk", "elastic stack", "opensearch"],
    "Splunk":           ["splunk siem", "splunk enterprise"],
    "New Relic":        ["newrelic", "new relic apm"],
    "Jaeger":           ["distributed tracing", "opentelemetry", "otel"],
    "PagerDuty":        ["pager duty", "incident management", "on-call"],

    # ── Networking & Security ────────────────────────────────────────────────
    "VPC":              ["virtual private cloud", "vpc peering", "subnets", "nacl", "security groups"],
    "IAM":              ["identity access management", "iam role", "iam policy", "rbac", "least privilege", "sso", "okta", "azure ad"],
    "Zero Trust":       ["zero-trust", "ztna", "zero trust network"],
    "WAF":              ["web application firewall", "aws waf"],
    "DevSecOps":        ["devsecops", "shift left security", "sast", "dast", "sca", "security scanning", "trivy", "snyk", "checkov", "tfsec"],
    "Vault":            ["hashicorp vault", "secrets management", "secret manager"],
    "SSL/TLS":          ["ssl", "tls", "certificate management", "acm"],

    # ── Programming Languages ────────────────────────────────────────────────
    "Python":           ["python3", "python 3", "py", "django", "flask", "fastapi", "boto3", "pandas", "numpy", "pytest"],
    "Go":               ["golang", "go lang"],
    "Java":             ["java 8", "java 11", "java 17", "jvm", "spring boot", "spring", "maven", "gradle"],
    "TypeScript":       ["ts", "typescript"],
    "JavaScript":       ["js", "node.js", "nodejs", "node js", "express.js", "react", "vue", "angular"],
    "Bash":             ["shell scripting", "bash script", "shell script", "sh", "zsh", "unix scripting"],
    "PowerShell":       ["ps1", "powershell scripting"],
    "Ruby":             ["ruby on rails", "rails"],
    "Rust":             ["rust lang"],
    "C#":               ["csharp", "dotnet", ".net", "asp.net"],
    "C++":              ["cpp", "c plus plus"],
    "SQL":              ["structured query language", "pl/sql", "t-sql", "stored procedures", "query optimization"],

    # ── Databases ────────────────────────────────────────────────────────────
    "PostgreSQL":       ["postgres", "psql", "pg", "postgresql database"],
    "MySQL":            ["my sql", "mariadb"],
    "MongoDB":          ["mongo", "mongo db", "nosql document store"],
    "Redis":            ["redis cache", "redis cluster", "elasticache"],
    "Cassandra":        ["apache cassandra", "datastax"],
    "DynamoDB":         ["dynamo db", "aws dynamodb"],
    "Kafka":            ["apache kafka", "kafka streams", "event streaming", "message queue", "msk"],
    "RabbitMQ":         ["rabbit mq", "amqp", "message broker"],

    # ── Architecture & Methodologies ─────────────────────────────────────────
    "Microservices":    ["micro services", "microservice architecture", "service-oriented architecture", "soa"],
    "Serverless":       ["faas", "function as a service", "lambda functions", "serverless framework"],
    "REST API":         ["restful api", "rest apis", "api design", "api development", "openapi", "swagger"],
    "GraphQL":          ["graph ql", "apollo graphql"],
    "gRPC":             ["grpc", "protocol buffers", "protobuf"],
    "Agile":            ["agile methodology", "scrum", "kanban", "sprint", "jira", "confluence"],
    "Site Reliability": ["sre", "site reliability engineering", "toil reduction", "slo", "sla", "sli", "error budget"],
    "FinOps":           ["cloud cost optimization", "cost management", "cloud economics", "reserved instances", "savings plans"],
    "Disaster Recovery":["dr", "ha", "high availability", "business continuity", "rpo", "rto", "failover", "multi-region"],
    "Linux":            ["ubuntu", "centos", "rhel", "debian", "amazon linux", "unix", "posix"],
    "Windows Server":   ["windows server", "active directory", "group policy", "iis"],

    # ── Data Engineering ─────────────────────────────────────────────────────
    "Spark":            ["apache spark", "pyspark", "spark streaming"],
    "Airflow":          ["apache airflow", "dag", "workflow orchestration"],
    "dbt":              ["data build tool", "dbt cloud"],
    "Snowflake":        ["snowflake data warehouse"],
    "Data Lake":        ["s3 data lake", "delta lake", "iceberg", "hudi"],
    "ETL":              ["extract transform load", "data pipeline", "data ingestion"],

    # ── Machine Learning / AI ─────────────────────────────────────────────────
    "MLOps":            ["ml ops", "ml pipeline", "model serving", "kubeflow", "mlflow", "sagemaker"],
    "TensorFlow":       ["tensorflow", "keras"],
    "PyTorch":          ["pytorch", "torch"],

    # ── Soft / Business Skills ────────────────────────────────────────────────
    "Leadership":       ["team lead", "tech lead", "people management", "mentoring", "mentorship", "coaching"],
    "Communication":    ["cross-functional", "stakeholder management", "presentation", "written communication"],
    "Project Management":["pmp", "prince2", "project coordination", "resource planning"],
}

# Flat reverse-lookup: alias -> canonical
_ALIAS_TO_CANONICAL: Dict[str, str] = {}
for _canon, _aliases in SKILL_ONTOLOGY.items():
    _ALIAS_TO_CANONICAL[_canon.lower()] = _canon
    for _alias in _aliases:
        _ALIAS_TO_CANONICAL[_alias.lower()] = _canon


def resolve_skill(token: str) -> Optional[str]:
    """Map any skill token (raw text) to its canonical ontology name."""
    return _ALIAS_TO_CANONICAL.get(token.strip().lower())


# ══════════════════════════════════════════════════════════════════════════════
# 2.  SECTION HEADER PATTERNS  (NER-style regex bank)
# ══════════════════════════════════════════════════════════════════════════════

SECTION_PATTERNS: Dict[str, List[str]] = {
    "contact":        [r"contact", r"personal\s+info", r"contact\s+information", r"personal\s+details"],
    "summary":        [r"summary", r"professional\s+summary", r"profile", r"objective", r"career\s+objective", r"about\s+me", r"executive\s+summary"],
    "experience":     [r"experience", r"work\s+experience", r"employment", r"work\s+history", r"professional\s+experience", r"career\s+history", r"positions?\s+held"],
    "education":      [r"education", r"academic", r"credentials?", r"degrees?", r"qualifications?", r"educational\s+background"],
    "skills":         [r"skills?", r"technical\s+skills?", r"core\s+competencies", r"technologies", r"tools?\s+&?\s+technologies", r"proficiencies", r"expertise"],
    "certifications": [r"certifications?", r"licenses?", r"accreditations?", r"certificates?"],
    "projects":       [r"projects?", r"personal\s+projects?", r"key\s+projects?", r"open\s+source", r"portfolio"],
    "awards":         [r"awards?", r"achievements?", r"honors?", r"recognition"],
    "publications":   [r"publications?", r"research", r"papers?", r"patents?"],
    "languages":      [r"languages?", r"spoken\s+languages?", r"language\s+proficiency"],
    "volunteer":      [r"volunteer", r"community", r"non-?profit", r"social\s+work"],
}


def detect_sections(text: str) -> Dict[str, bool]:
    lines = text.lower().split("\n")
    found: Dict[str, bool] = {k: False for k in SECTION_PATTERNS}
    for line in lines:
        line = line.strip()
        if not line or len(line) > 80:
            continue
        for section, patterns in SECTION_PATTERNS.items():
            if found[section]:
                continue
            for pat in patterns:
                if re.search(rf"\b{pat}\b", line):
                    found[section] = True
                    break
    return found


# ══════════════════════════════════════════════════════════════════════════════
# 3.  CONTACT EXTRACTION
# ══════════════════════════════════════════════════════════════════════════════

def extract_contact_signals(text: str) -> Dict[str, bool]:
    tl = text.lower()
    has_email    = bool(re.search(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", text))
    has_phone    = bool(re.search(r"(\+?\d[\d\s\-().]{7,}\d)", text))
    has_linkedin = "linkedin.com" in tl
    has_github   = "github.com" in tl
    has_location = bool(re.search(
        r"\b([A-Z][a-z]+,?\s+[A-Z]{2}|[A-Z][a-z]+,?\s+[A-Z][a-z]+|remote)\b", text
    ))
    lines = [l for l in text.strip().split("\n") if l.strip()]
    has_name = bool(lines and re.search(r"^[A-Z][a-z]+\s+[A-Z][a-z]+", lines[0]))
    return {
        "email": has_email,
        "phone": has_phone,
        "linkedin": has_linkedin,
        "github": has_github,
        "location": has_location,
        "name_detected": has_name,
    }


# ══════════════════════════════════════════════════════════════════════════════
# 4.  SENIORITY DETECTION
# ══════════════════════════════════════════════════════════════════════════════

SENIORITY_SIGNALS = {
    0: ["intern", "trainee", "apprentice", "co-op", "coop"],
    1: ["junior", "jr.", "jr ", "associate", "entry level", "entry-level", "graduate"],
    2: ["mid", " ii ", "level 2", "intermediate"],
    3: ["senior", "sr.", "sr ", "level 3"],
    4: ["lead", "principal", "staff", "level 4"],
    5: ["director", "vp", "vice president", "head of", "chief", "cto", "ciso", "fellow"],
}

_SENIORITY_LABEL = {0: "Intern", 1: "Junior", 2: "Mid-Level", 3: "Senior", 4: "Lead/Principal", 5: "Director+"}


def detect_seniority(text: str) -> Tuple[int, str]:
    tl = text.lower()
    for band in sorted(SENIORITY_SIGNALS.keys(), reverse=True):
        if any(sig in tl for sig in SENIORITY_SIGNALS[band]):
            return band, _SENIORITY_LABEL[band]
    return 2, "Mid-Level"


# ══════════════════════════════════════════════════════════════════════════════
# 5.  EXPERIENCE TIMELINE ANALYSIS
# ══════════════════════════════════════════════════════════════════════════════

MONTH_MAP = {
    "jan":1,"feb":2,"mar":3,"apr":4,"may":5,"jun":6,
    "jul":7,"aug":8,"sep":9,"oct":10,"nov":11,"dec":12,
    "january":1,"february":2,"march":3,"april":4,"june":6,"july":7,
    "august":8,"september":9,"october":10,"november":11,"december":12
}


def _parse_year_month(token: str) -> Optional[Tuple[int, int]]:
    token = token.strip().lower()
    # Normalize token: replace multiple spaces, slashes, hyphens, commas, apostrophes with spaces
    token = re.sub(r"[/\-,\.\'\’\s]+", " ", token)
    token = re.sub(r"\s+", " ", token).strip()
    
    if not token:
        return None

    def normalize_year(y_str: str) -> int:
        y = int(y_str)
        if len(y_str) <= 2:
            # If 2-digit, assume 2000s if <= 50, else 1900s
            if y <= 50:
                return 2000 + y
            else:
                return 1900 + y
        return y

    words = token.split()
    
    # Case 1: "nov 24" or "11 2024" or "2024 nov"
    if len(words) == 2:
        w1, w2 = words[0], words[1]
        
        # Check if first word is month, second is year
        mo1 = MONTH_MAP.get(w1)
        if not mo1 and w1.isdigit():
            val = int(w1)
            if 1 <= val <= 12:
                mo1 = val
        if w2.isdigit():
            yr2 = normalize_year(w2)
            if mo1:
                return yr2, mo1
                
        # Check if second word is month, first is year
        mo2 = MONTH_MAP.get(w2)
        if not mo2 and w2.isdigit():
            val = int(w2)
            if 1 <= val <= 12:
                mo2 = val
        if w1.isdigit():
            yr1 = normalize_year(w1)
            if mo2:
                return yr1, mo2

    # Case 2: Bare year like "2024" or "24"
    if len(words) == 1:
        w = words[0]
        if w.isdigit():
            if len(w) == 4 or len(w) == 2:
                yr = normalize_year(w)
                return yr, 6  # Default to June for bare years

    return None


def _has_month_indicator(raw_token: str) -> bool:
    raw_token = raw_token.strip().lower()
    for m in MONTH_MAP:
        if m in raw_token:
            return True
    
    # Check for numeric month formats like 11/24, 11-24, 11 24
    cleaned = re.sub(r"[/\-,\.\'\’\s]+", " ", raw_token)
    parts = cleaned.split()
    if len(parts) == 2:
        p1, p2 = parts[0], parts[1]
        if p1.isdigit() and p2.isdigit():
            v1, v2 = int(p1), int(p2)
            if (1 <= v1 <= 12) or (1 <= v2 <= 12):
                return True
    return False


def _isolate_work_sections(text: str) -> str:
    """
    Extract only the work-experience portion of a resume.
    Uses flexible search (re.search on short lines) so PDF-extracted text
    with extra whitespace or encoding noise still matches correctly.
    """
    # Keywords that signal START of work-experience section
    EXP_RE = re.compile(
        r"(?:professional\s+experience|work\s+experience|work\s+history|"
        r"employment(?:\s+history)?|experience|career\s+history|positions?\s+held)",
        re.IGNORECASE,
    )
    # Keywords that signal END of work-experience section (next section)
    STOP_RE = re.compile(
        r"^(?:education|academic|degree|qualification|technical\s+skills?|"
        r"core\s+competencies|skills?|certifications?|projects?|awards?|"
        r"publications?|languages?|volunteer|achievements?|honors?|"
        r"interests?|references?|extracurricular)",
        re.IGNORECASE,
    )

    lines = text.split("\n")
    start_idx: Optional[int] = None
    end_idx   = len(lines)

    for i, line in enumerate(lines):
        stripped = line.strip()
        if not stripped:
            continue
        # Section headers are short — long lines are content, not headings
        if len(stripped) > 70:
            continue

        if start_idx is None:
            if EXP_RE.search(stripped):
                start_idx = i
        else:
            if STOP_RE.search(stripped):
                end_idx = i
                break

    if start_idx is not None:
        return "\n".join(lines[start_idx:end_idx])

    # Fallback: no heading found (common with single-column PDFs) — return all
    return text


def analyze_experience_timeline(text: str) -> Dict:
    """
    Accurately compute total professional YoE.

    Design decisions:
    ─────────────────
    1. Operates on the work-experience section only via _isolate_work_sections().
    2. Bare year-only ranges (e.g. "2020 - 2023", "24 - 26") are only accepted when
       at least one side is month+year or "present". This prevents skill/cert
       years from creating false intervals.
    3. End dates beyond today+12 months are rejected (education future dates).
    4. Overlapping intervals are merged (handles concurrent roles).
    5. Single job tenure capped at 10 years as sanity guard.
    """
    work_text = _isolate_work_sections(text)

    # Any word-based month or 1/2 digit month
    MONTH_PART = r"(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|0?[1-9]|1[0-2])"
    # Year: 4 digits, or 2 digits, optionally prefixed with ' or ’
    YEAR_PART = r"(?:\d{4}|['’]?\d{2})"
    
    # A single date token can be month+year, year+month, or bare year
    DATE_TOKEN = rf"(?:{MONTH_PART}[\s/,\-\'\’]+{YEAR_PART}|{YEAR_PART}[\s/,\-\'\’]+{MONTH_PART}|{YEAR_PART})"
    SEP        = r"\s*(?:[\-\u2013\u2014]|to|until|through)\s*"
    PRESENT    = r"present|current|now|ongoing|active"

    # Full pattern: (date) SEP (date|present)
    full_pat = re.compile(
        rf"({DATE_TOKEN}){SEP}({DATE_TOKEN}|{PRESENT})",
        re.IGNORECASE,
    )

    now = datetime.date.today()
    future_cap = (now.year + 1) * 12 + now.month

    raw_intervals: List[Tuple[int, int]] = []

    for m in full_pat.finditer(work_text):
        left_raw  = m.group(1).strip()
        right_raw = m.group(2).strip().lower()

        right_is_present = right_raw in ("present", "current", "now", "ongoing", "active")
        
        # Require at least one month+year side OR right side is "present"
        if not (_has_month_indicator(left_raw) or
                _has_month_indicator(right_raw) or
                right_is_present):
            continue

        s = _parse_year_month(left_raw)
        e = (now.year, now.month) if right_is_present else _parse_year_month(right_raw)

        if not s or not e:
            continue

        start_abs = s[0] * 12 + s[1]
        end_abs   = e[0] * 12 + e[1]

        if end_abs   < start_abs:          continue   # end before start
        if end_abs   > future_cap:         continue   # far-future → education date
        if start_abs < (2010 * 12):        continue   # before 2010 → junk
        if (end_abs - start_abs) > 10*12:             # cap crazy long tenures
            end_abs = start_abs + 10 * 12

        raw_intervals.append((start_abs, end_abs))

    if not raw_intervals:
        return {
            "total_years_experience": 0,
            "job_count": 0,
            "employment_gaps": [],
            "longest_tenure_months": 0,
            "most_recent_year": None,
        }

    # ── Merge overlapping / adjacent intervals ────────────────────────────
    raw_intervals.sort()
    merged: List[Tuple[int, int]] = [raw_intervals[0]]
    for cur_start, cur_end in raw_intervals[1:]:
        _, prev_end = merged[-1]
        if cur_start <= prev_end + 1:
            merged[-1] = (merged[-1][0], max(prev_end, cur_end))
        else:
            merged.append((cur_start, cur_end))

    # ── Totals, gaps, tenures ─────────────────────────────────────────────
    total_months = 0
    tenures: List[int] = []
    gaps: List[Dict]   = []

    for i, (s_abs, e_abs) in enumerate(merged):
        tenure = e_abs - s_abs
        tenures.append(tenure)
        total_months += tenure
        if i > 0:
            gap = s_abs - merged[i-1][1]
            if gap > 3:
                gaps.append({
                    "gap_months": gap,
                    "after_year": merged[i-1][1] // 12,
                    "severity": "critical" if gap > 12 else "moderate" if gap > 6 else "minor",
                })

    return {
        "total_years_experience": round(total_months / 12, 1),
        "job_count": len(merged),
        "employment_gaps": gaps,
        "longest_tenure_months": max(tenures) if tenures else 0,
        "most_recent_year": merged[-1][1] // 12,
    }



# ══════════════════════════════════════════════════════════════════════════════
# 6.  KEYWORD SCORING  (TF-IDF inspired + ontology-resolved)
# ══════════════════════════════════════════════════════════════════════════════



def _detect_job_domain(text: str) -> str:
    tl = text.lower()
    if any(k in tl for k in ["devops", "sre", "site reliability", "cloud engineer", "infrastructure"]):
        return "DevOps/SRE"
    if any(k in tl for k in ["data engineer", "data pipeline", "etl", "big data", "spark", "airflow", "dbt"]):
        return "Data Engineering"
    if any(k in tl for k in ["machine learning", "mlops", "ai ", "artificial intelligence", "pytorch", "tensorflow", "data scientist"]):
        return "ML/AI"
    if any(k in tl for k in ["frontend", "react", "angular", "vue", "typescript", "javascript", "ui", "web developer"]):
        return "Frontend"
    if any(k in tl for k in ["qa", "testing", "selenium", "cypress", "test automation"]):
        return "QA/Testing"
    if any(k in tl for k in ["manager", "director", "scrum master", "product owner", "product manager"]):
        return "Management"
    return "Backend/Software Engineering"


def score_keywords(resume_text: str, jd_text: str) -> Dict:
    resume_lower = resume_text.lower()
    jd_lower = jd_text.lower()

    # 1. Detect Job Level and Domain from Job Description (JD)
    jd_level_band, jd_level_label = detect_seniority(jd_text)
    jd_domain = _detect_job_domain(jd_text)

    # Categorize skills for level-based weighting
    ARCHITECTURE_SKILLS = {
        "Kubernetes", "Istio", "OpenShift", "Terraform", "Pulumi", "CloudFormation", 
        "CDK", "ArgoCD", "Zero Trust", "DevSecOps", "Vault", "Site Reliability", 
        "FinOps", "Disaster Recovery", "Microservices", "Serverless", "MLOps", "Multi-Cloud"
    }
    
    SOFT_SKILLS = {
        "Leadership", "Communication", "Project Management", "Agile"
    }

    # 2. Extract JD keywords and apply dynamic seniority weights
    jd_skills: Dict[str, float] = {}
    for canon, aliases in SKILL_ONTOLOGY.items():
        count = 0
        for tok in [canon.lower()] + aliases:
            count += len(re.findall(rf"\b{re.escape(tok)}\b", jd_lower))
        if count > 0:
            # Base weight from JD term frequency
            weight = count
            
            # Apply dynamic seniority multipliers
            if jd_level_band >= 3:  # Senior, Lead, Director
                if canon in ARCHITECTURE_SKILLS:
                    weight *= 2.5  # Strongly prioritize architecture and SRE skills
                elif canon in SOFT_SKILLS:
                    weight *= 1.5  # Boost leadership and agile delivery skills
            elif jd_level_band <= 1:  # Intern, Junior
                if canon in ARCHITECTURE_SKILLS:
                    weight *= 0.5  # Architectural patterns are nice-to-have
                else:
                    weight *= 2.0  # Foundational coding/tools are highly weighted
                    
            jd_skills[canon] = weight

    if not jd_skills:
        # Fallback: score against full ontology when no JD provided
        jd_skills = {k: 1.0 for k in SKILL_ONTOLOGY}

    max_weight = max(jd_skills.values()) if jd_skills else 1.0
    weighted_total = 0.0
    weighted_match = 0.0
    matched = []
    missing = []
    
    # Categorized missing lists
    missing_by_category = {
        "Seniority & Architecture": [],
        "Core Technical": [],
        "Soft Skills & Methodologies": []
    }

    for canon, weight in jd_skills.items():
        # Logarithmic normalization of weights to prevent single dominant terms from skewing score
        norm_weight = 1 + math.log(1 + weight / max_weight)
        weighted_total += norm_weight
        
        found = any(
            re.search(rf"\b{re.escape(tok)}\b", resume_lower)
            for tok in [canon.lower()] + SKILL_ONTOLOGY.get(canon, [])
        )
        if found:
            weighted_match += norm_weight
            matched.append(canon)
        else:
            missing.append(canon)
            
            # Classify into specific categories
            if canon in ARCHITECTURE_SKILLS:
                missing_by_category["Seniority & Architecture"].append(canon)
            elif canon in SOFT_SKILLS:
                missing_by_category["Soft Skills & Methodologies"].append(canon)
            else:
                missing_by_category["Core Technical"].append(canon)

    score = round((weighted_match / weighted_total) * 100, 2) if weighted_total else 0.0
    
    return {
        "matched": matched,
        "missing": missing,
        "missing_by_category": missing_by_category,
        "score": score,
        "jd_skill_count": len(jd_skills),
        "job_level": jd_level_label,
        "job_domain": jd_domain
    }


# ══════════════════════════════════════════════════════════════════════════════
# 7.  FORMATTING COMPLIANCE ANALYSIS
# ══════════════════════════════════════════════════════════════════════════════

def analyze_formatting(text: str, has_tables: bool, is_scanned: bool, filename: str = "") -> Dict:
    issues = []
    severity_sum = 0

    if is_scanned:
        issues.append({"code":"SCANNED_PDF","severity":"CRITICAL","detail":"Document is a scanned image with no selectable text. ALL ATS systems will index it as a blank document — instant invisible rejection.","fix":"Re-export directly from Word/Google Docs as standard PDF. Never scan a printed resume."})
        severity_sum += 10

    if has_tables:
        issues.append({"code":"TABLE_LAYOUT","severity":"HIGH","detail":"Multi-column table structure detected. Taleo/Workday read left-to-right in document flow — side-by-side columns produce garbled text, breaking keyword matching entirely.","fix":"Remove all tables. Use single-column layout with simple paragraph text and line breaks."})
        severity_sum += 6

    if filename.lower().endswith(".docx"):
        issues.append({"code":"POTENTIAL_TEXT_BOXES","severity":"MEDIUM","detail":"Word .docx files often use floating text boxes. Content inside text boxes is invisible to ALL ATS parsers — name, contact, skills may not be indexed.","fix":"Paste all content as Unformatted Text into a clean Word doc to strip hidden text boxes."})
        severity_sum += 4

    special_chars = len(re.findall(r"[^\x00-\x7F]", text))
    if special_chars > 20:
        issues.append({"code":"SPECIAL_CHARACTERS","severity":"LOW","detail":f"Found {special_chars} non-ASCII characters (fancy bullets, em-dashes, smart quotes). Taleo and older iCIMS corrupt these, causing keyword boundary breaks.","fix":"Replace fancy characters with standard ASCII alternatives (-, --, \", ')."})
        severity_sum += 2

    lines = [l.strip() for l in text.split("\n") if l.strip()]
    long_lines = [l for l in lines if len(l) > 200]
    if long_lines:
        issues.append({"code":"LONG_LINE_ARTIFACT","severity":"MEDIUM","detail":f"{len(long_lines)} lines exceed 200 characters — typical sign of merged column text from multi-column layout.","fix":"Use single-column layout throughout."})
        severity_sum += 3

    formatting_score = max(0, 100 - min(severity_sum, 50))
    return {"formatting_score": formatting_score, "issues": issues, "is_scanned": is_scanned, "has_tables": has_tables}


# ══════════════════════════════════════════════════════════════════════════════
# 8.  CONTENT QUALITY ANALYSIS
# ══════════════════════════════════════════════════════════════════════════════

STRONG_ACTION_VERBS = [
    "architected","designed","built","developed","deployed","automated","optimized",
    "reduced","increased","improved","scaled","migrated","led","drove","delivered",
    "implemented","established","spearheaded","transformed","engineered","launched",
    "streamlined","created","owned","managed","mentored","integrated","maintained",
    "monitored","configured","secured","provisioned","orchestrated","containerized",
    "modernized","refactored","accelerated","eliminated","saved","achieved","generated",
    "grew","expanded","negotiated","partnered",
]

WEAK_PASSIVE_SIGNALS = [
    "responsible for","duties included","worked on","helped with","assisted",
    "was part of","involved in","participated in","supported","handled",
]


def analyze_content_quality(text: str) -> Dict:
    lines = text.split("\n")
    bullet_lines = [
        l.strip() for l in lines
        if l.strip().startswith(("•", "-", "*", "·", "▪", "›"))
        or re.match(r"^\d+\.", l.strip())
    ]
    quantified = sum(
        1 for b in bullet_lines
        if re.search(r"\d+%|\$\d+|\d+x\b|\d+\s?(ms|s\b|hrs?|hours?|days?|weeks?|months?|years?|users?|requests?|TB|GB|MB|KB|k\b|m\b)", b, re.IGNORECASE)
        or re.search(r"\b\d{2,}\b", b)
    )
    quant_pct = round((quantified / len(bullet_lines)) * 100) if bullet_lines else 0
    tl = text.lower()
    strong_count = sum(1 for v in STRONG_ACTION_VERBS if re.search(rf"\b{v}\b", tl))
    weak_count   = sum(1 for v in WEAK_PASSIVE_SIGNALS if v in tl)
    bullet_count = len(bullet_lines)
    avg_words    = round(sum(len(b.split()) for b in bullet_lines) / len(bullet_lines)) if bullet_lines else 0

    quality_score = 50
    quality_score += min(quant_pct * 0.3, 20)
    quality_score += min(strong_count * 1.5, 15)
    quality_score -= min(weak_count * 3, 15)
    quality_score += 5 if 12 <= avg_words <= 30 else -5
    quality_score += 5 if bullet_count >= 6 else -5
    quality_score = max(0, min(100, round(quality_score)))

    recommendations = []
    if quant_pct < 40:
        recommendations.append(f"Only {quant_pct}% of bullets contain measurable results. Research shows candidates with 60%+ quantified bullets rank 23% higher. Add numbers: 'Reduced deployment time by 40%'.")
    if weak_count > 2:
        recommendations.append(f"Found {weak_count} passive phrases ('responsible for', 'assisted with'). Replace with strong action verbs — ATS semantic rankers penalize passive language.")
    if avg_words < 10:
        recommendations.append("Bullets are too short (<10 words). ATS NLP models need context around keywords — short bullets reduce semantic match confidence.")
    if avg_words > 35:
        recommendations.append("Bullets are too long (>35 words). Taleo's legacy tokenizer truncates content past 25 words — keywords may be ignored.")

    return {
        "quality_score": quality_score,
        "bullet_count": bullet_count,
        "quantified_bullets_pct": quant_pct,
        "strong_action_verbs": strong_count,
        "weak_passive_phrases": weak_count,
        "avg_bullet_words": avg_words,
        "recommendations": recommendations,
    }


# ══════════════════════════════════════════════════════════════════════════════
# 9.  EDUCATION SIGNAL EXTRACTION
# ══════════════════════════════════════════════════════════════════════════════

EDU_LEVELS = {
    "phd":5,"ph.d":5,"doctorate":5,"doctoral":5,
    "master":4,"msc":4,"m.s":4,"mba":4,"m.b.a":4,"m.eng":4,
    "bachelor":3,"bsc":3,"b.s":3,"b.e":3,"b.tech":3,"b.sc":3,"undergraduate":3,
    "associate":2,"a.s":2,"a.a":2,
    "diploma":1,"certificate":1,"bootcamp":1,
    "high school":0,"ged":0,
}

PRESTIGIOUS_SCHOOLS = [
    "mit","stanford","harvard","carnegie mellon","cmu","berkeley","caltech",
    "georgia tech","oxford","cambridge","iit","iim","eth zurich","epfl",
    "columbia","yale","princeton","cornell","upenn","nyu","ucla","michigan",
    "purdue","illinois","uiuc","utexas","ut austin",
]


def analyze_education(text: str) -> Dict:
    tl = text.lower()
    detected_level, level_score = None, 0
    for kw, lvl in sorted(EDU_LEVELS.items(), key=lambda x: -x[1]):
        if kw in tl:
            detected_level, level_score = kw, lvl
            break
    prestige_bonus = any(s in tl for s in PRESTIGIOUS_SCHOOLS)
    stem_fields = ["computer science","software engineering","information technology","electrical engineering","data science","mathematics","physics","computer engineering","systems engineering","cybersecurity"]
    stem_match = any(f in tl for f in stem_fields)
    grad_years = re.findall(r"\b(19[89]\d|20[012]\d)\b", text)
    most_recent = max(int(y) for y in grad_years) if grad_years else None
    return {"highest_degree": detected_level or "not detected","level_score": level_score,"stem_field": stem_match,"prestigious_institution": prestige_bonus,"most_recent_grad_year": most_recent}


# ══════════════════════════════════════════════════════════════════════════════
# 10.  HARD KNOCKOUT TRIGGER SIMULATION
# ══════════════════════════════════════════════════════════════════════════════

@dataclass
class KnockoutResult:
    triggered: bool
    triggers: List[Dict]
    total_risk: str


def evaluate_knockouts(resume_text: str, contact: Dict, sections: Dict, formatting: Dict, experience: Dict, jd_missing: List[str], required_keywords: List[str]) -> KnockoutResult:
    triggers = []

    if formatting["is_scanned"]:
        triggers.append({"rule":"SCANNED_DOCUMENT","severity":"CRITICAL","platform_impact":"ALL ATS","detail":"Scanned image PDF — ATS sees a blank document. Auto-rejected before a human sees it."})

    if not contact["email"]:
        triggers.append({"rule":"NO_EMAIL","severity":"CRITICAL","platform_impact":"Workday, iCIMS, LinkedIn Easy Apply, Taleo","detail":"No parseable email found. These ATS cannot create a candidate profile — submission silently fails."})

    if not sections.get("experience"):
        triggers.append({"rule":"NO_EXPERIENCE_SECTION","severity":"HIGH","platform_impact":"Taleo, Workday, iCIMS","detail":"No 'Work Experience' section heading found. Taleo maps all text to undefined fields, losing job titles and dates."})

    if experience["total_years_experience"] == 0 and experience["job_count"] == 0:
        triggers.append({"rule":"NO_PARSEABLE_DATES","severity":"HIGH","platform_impact":"iCIMS, Taleo, Workday","detail":"No employment date ranges parsed. ATS cannot calculate YoE — application may auto-fail minimum experience requirements."})

    critical_gaps = [g for g in experience.get("employment_gaps",[]) if g["severity"] == "critical"]
    if critical_gaps:
        triggers.append({"rule":"CRITICAL_EMPLOYMENT_GAP","severity":"MEDIUM","platform_impact":"Workday, iCIMS","detail":f"{len(critical_gaps)} employment gap(s) over 12 months. Workday ML flags these for mandatory review and deprioritizes the application."})

    if required_keywords:
        missing_pct = len(jd_missing) / len(required_keywords)
        if missing_pct > 0.7:
            triggers.append({"rule":"BELOW_KEYWORD_THRESHOLD","severity":"HIGH","platform_impact":"Workday, SmartRecruiters, iCIMS","detail":f"{round(missing_pct*100)}% of required JD keywords absent. Enterprise ATS auto-reject threshold is typically 30-40% match."})

    if formatting.get("has_tables"):
        triggers.append({"rule":"TABLE_LAYOUT","severity":"HIGH","platform_impact":"Taleo, older Workday","detail":"Table layout linearized by Taleo's 2003-era tokenizer — produces garbled keyword strings and breaks section detection."})

    if len(resume_text.strip()) < 400:
        triggers.append({"rule":"INSUFFICIENT_CONTENT","severity":"HIGH","platform_impact":"ALL ATS","detail":"<400 characters extracted — indicates parsing failure. ATS cannot read the resume content."})

    sev_scores = {"CRITICAL":4,"HIGH":3,"MEDIUM":2,"LOW":1}
    if not triggers:
        risk = "NONE"
    else:
        max_sev = max(sev_scores.get(t["severity"],1) for t in triggers)
        risk = {4:"CRITICAL",3:"HIGH",2:"MEDIUM",1:"LOW"}.get(max_sev,"LOW")

    return KnockoutResult(triggered=bool(triggers), triggers=triggers, total_risk=risk)


# ══════════════════════════════════════════════════════════════════════════════
# 11.  PLATFORM-SPECIFIC SCORING ENGINES
# ══════════════════════════════════════════════════════════════════════════════

@dataclass
class PlatformScore:
    platform: str
    score: float
    grade: str
    breakdown: Dict
    rejection_risk: str
    platform_notes: List[str]
    tips: List[str]


def _grade(score: float) -> str:
    if score >= 90: return "A+"
    if score >= 80: return "A"
    if score >= 70: return "B+"
    if score >= 60: return "B"
    if score >= 50: return "C+"
    return "C"


def score_workday(keyword_score, structure_score, formatting_score, quality_score, education, experience, contact, seniority_band, jd_seniority_band, sections) -> PlatformScore:
    """Workday: 35% keywords, 20% seniority, 20% experience continuity, 15% YoE, 10% education."""
    seniority_mismatch = abs(seniority_band - jd_seniority_band)
    seniority_score = max(0, 100 - seniority_mismatch * 25)
    yoe = experience["total_years_experience"]
    yoe_score = min(100, yoe / max(jd_seniority_band * 2, 1) * 100)
    edu_score = min(100, education["level_score"] / 5 * 100)
    if education["stem_field"]: edu_score = min(100, edu_score + 10)
    gap_penalty = len([g for g in experience.get("employment_gaps",[]) if g["severity"] in ("moderate","critical")]) * 8
    continuity_score = max(0, 100 - gap_penalty)
    composite = (keyword_score*0.35 + seniority_score*0.20 + continuity_score*0.15 + yoe_score*0.10 + edu_score*0.10 + formatting_score*0.05 + quality_score*0.05)
    if formatting_score < 40:
        composite = max(10, composite * 0.5)
    score = round(min(99, composite), 1)
    return PlatformScore(
        platform="Workday", score=score, grade=_grade(score),
        breakdown={"keyword_match":round(keyword_score,1),"seniority_alignment":round(seniority_score,1),"experience_continuity":round(continuity_score,1),"yoe_match":round(yoe_score,1),"education_match":round(edu_score,1),"formatting":round(formatting_score,1)},
        rejection_risk="HIGH" if score<40 else "MEDIUM" if score<60 else "LOW",
        platform_notes=[
            "Workday uses EXACT keyword matching — 'K8s' does NOT match 'Kubernetes'. Always spell out canonical terms.",
            f"Detected seniority ({_SENIORITY_LABEL.get(seniority_band,'Mid')}) vs required ({_SENIORITY_LABEL.get(jd_seniority_band,'Mid')}) — {'aligned ✓' if seniority_mismatch==0 else f'{seniority_mismatch} band gap ✗'}.",
            "Spell out abbreviations first then add acronym: 'Kubernetes (K8s)'.",
        ],
        tips=["Use exact JD keywords — Workday has no synonym expansion.","Standard section headings: 'Work Experience', 'Education', 'Skills'.","After uploading, manually verify all auto-populated form fields."]
    )


def score_greenhouse(keyword_score, quality_score, contact, sections, formatting_score) -> PlatformScore:
    """Greenhouse: 40% keywords, 25% quality, bonus for LinkedIn/GitHub/skills section."""
    linkedin_bonus = 15 if contact.get("linkedin") else 0
    github_bonus   = 10 if contact.get("github") else 0
    skills_bonus   = 10 if sections.get("skills") else 0
    projects_bonus = 8  if sections.get("projects") else 0
    composite = keyword_score*0.40 + quality_score*0.25 + formatting_score*0.10 + linkedin_bonus + github_bonus + skills_bonus + projects_bonus
    score = round(min(99, composite), 1)
    return PlatformScore(
        platform="Greenhouse", score=score, grade=_grade(score),
        breakdown={"keyword_index_score":round(keyword_score,1),"content_quality":round(quality_score,1),"linkedin_profile":linkedin_bonus,"github_profile":github_bonus,"skills_section":skills_bonus,"projects_section":projects_bonus},
        rejection_risk="LOW" if score>=50 else "MEDIUM",
        platform_notes=[
            "Greenhouse does NOT auto-reject by score — every resume reaches a human. But Boolean keyword search filters first.",
            "LinkedIn URL is cross-referenced during candidate sourcing.",
            "Skills section is parsed separately — list all tools explicitly even if mentioned in bullets.",
        ],
        tips=["Add your LinkedIn URL prominently.","Include a dedicated Skills section with exact tool names.","Open-source GitHub contributions strongly differentiate tech candidates."]
    )


def score_lever(keyword_score, quality_score, contact, experience, sections, formatting_score) -> PlatformScore:
    """Lever: AI profile card, full-text Boolean search, strong project/GitHub signals."""
    github_bonus   = 12 if contact.get("github") else 0
    linkedin_bonus = 8  if contact.get("linkedin") else 0
    projects_bonus = 10 if sections.get("projects") else 0
    yoe_bonus = min(15, experience.get("total_years_experience", 0) * 2)
    composite = keyword_score*0.38 + quality_score*0.25 + formatting_score*0.10 + github_bonus + linkedin_bonus + projects_bonus + yoe_bonus
    score = round(min(99, composite), 1)
    return PlatformScore(
        platform="Lever", score=score, grade=_grade(score),
        breakdown={"keyword_score":round(keyword_score,1),"content_quality":round(quality_score,1),"github_presence":github_bonus,"linkedin_presence":linkedin_bonus,"projects_section":projects_bonus,"experience_bonus":round(yoe_bonus,1)},
        rejection_risk="LOW" if score>=50 else "MEDIUM",
        platform_notes=[
            "Lever generates an AI profile card from extracted fields — job titles, companies, and dates must be clearly formatted.",
            "Startup/tech companies on Lever heavily weight GitHub portfolio and open-source contributions.",
            "Lever's Boolean search supports field-specific queries: 'title:engineer company:google' — make job titles crystal clear.",
        ],
        tips=["Pin your best GitHub repos and include project links in your resume.","Use clean 'Role @ Company | Date — Date' format for all experience entries.","Add a projects section with live URLs."]
    )


def score_icims(keyword_score, structure_score, formatting_score, experience, contact, sections) -> PlatformScore:
    """iCIMS: Structured profile, strict section headings, date format validation, knockout questions."""
    date_score = 80 if experience.get("total_years_experience", 0) > 0 else 30
    section_score = min(100, sum(25 for k in ["experience","skills","education","summary"] if sections.get(k)))
    email_score = 100 if contact.get("email") else 20
    composite = keyword_score*0.30 + section_score*0.25 + date_score*0.20 + email_score*0.10 + formatting_score*0.10 + (100 if not formatting_score < 40 else 30)*0.05
    score = round(min(99, composite), 1)
    return PlatformScore(
        platform="iCIMS", score=score, grade=_grade(score),
        breakdown={"keyword_match":round(keyword_score,1),"section_structure":round(section_score,1),"date_parsing":round(date_score,1),"contact_completeness":round(email_score,1),"formatting":round(formatting_score,1)},
        rejection_risk="HIGH" if score<40 else "MEDIUM" if score<60 else "LOW",
        platform_notes=[
            "iCIMS uses 'knockout questions' — mandatory YES/NO fields that instantly reject you regardless of resume quality.",
            "Strict date format requirement: use '06/2023 - Present' or 'June 2023 - Present' — vague years like '2021-2023' lose precision.",
            "Section headings must be EXACT standard labels — 'Professional Background' may not parse correctly.",
        ],
        tips=["Use standard date format MM/YYYY - MM/YYYY throughout.","Standard headers: 'Work Experience', 'Education', 'Skills', 'Professional Summary'.","Answer all knockout questions truthfully — iCIMS flags inconsistencies between answers and resume content."]
    )


def score_taleo(keyword_score, formatting_score, sections, experience, contact) -> PlatformScore:
    """Taleo (Oracle): Legacy keyword-density engine, VERY strict formatting, no semantic understanding."""
    # Taleo uses simple keyword frequency — exact matches only, no synonyms
    format_penalty = 0
    if formatting_score < 70: format_penalty = 30
    if formatting_score < 40: format_penalty = 60
    section_score = min(100, sum(20 for k in ["experience","education","skills","summary","certifications"] if sections.get(k)))
    composite = keyword_score*0.40 + section_score*0.30 + max(0, formatting_score-format_penalty)*0.20 + (80 if contact.get("email") else 20)*0.10
    score = round(min(99, max(5, composite)), 1)
    return PlatformScore(
        platform="Taleo (Oracle)", score=score, grade=_grade(score),
        breakdown={"exact_keyword_density":round(keyword_score,1),"section_recognition":round(section_score,1),"formatting_compliance":round(max(0,formatting_score-format_penalty),1)},
        rejection_risk="HIGH" if score<40 else "MEDIUM" if score<65 else "LOW",
        platform_notes=[
            "Taleo is a 2003-era legacy system used by many Fortune 500s. NO semantic matching — exact spelling only.",
            "'K8s' will NOT match 'Kubernetes'. 'JS' will NOT match 'JavaScript'. Spell everything out fully.",
            "Tables completely destroy Taleo parsing — cells are merged into a single unreadable text blob.",
            "Maximum keyword repetition strategy: if a JD says 'Kubernetes' 5 times, mention it 3 times in different sections.",
        ],
        tips=["Spell out every acronym in full — Taleo has zero synonym expansion.","Repeat key role keywords naturally across Summary, Skills, and Experience.","Use exact standard section names in ALL CAPS or Title Case.","Never use tables, multi-column layouts, or text boxes."]
    )


def score_linkedin_easy_apply(keyword_score, contact, sections, formatting_score, experience) -> PlatformScore:
    """LinkedIn Easy Apply: Profile completeness + network proximity + keyword index."""
    email_bonus    = 15 if contact.get("email") else 0
    phone_bonus    = 10 if contact.get("phone") else 0
    linkedin_bonus = 20 if contact.get("linkedin") else -10
    location_bonus = 8  if contact.get("location") else 0
    summary_bonus  = 7  if sections.get("summary") else 0
    composite = keyword_score*0.35 + formatting_score*0.15 + email_bonus + phone_bonus + linkedin_bonus + location_bonus + summary_bonus
    score = round(min(99, max(5, composite)), 1)
    return PlatformScore(
        platform="LinkedIn Easy Apply", score=score, grade=_grade(score),
        breakdown={"keyword_index":round(keyword_score,1),"email_present":email_bonus,"phone_present":phone_bonus,"linkedin_url":linkedin_bonus,"location_signal":location_bonus,"summary_present":summary_bonus},
        rejection_risk="HIGH" if score<40 else "MEDIUM" if score<60 else "LOW",
        platform_notes=[
            "LinkedIn pre-populates application fields from your LinkedIn profile — not just the uploaded resume.",
            "Without a LinkedIn URL in the resume, the Easy Apply connector cannot merge profile data.",
            "LinkedIn uses 1st/2nd degree network proximity as a soft-ranking signal for the recruiter view.",
            "Skills with endorsements on your LinkedIn profile boost keyword match confidence by 15-20%.",
        ],
        tips=["Include your full LinkedIn profile URL (linkedin.com/in/username) at the top.","Keep your LinkedIn profile 100% complete — it auto-populates the application form.","Add skills to your LinkedIn profile and collect endorsements from colleagues.","Ensure your current location matches the job posting location or add 'Open to Remote'."]
    )


def score_smartrecruiters(keyword_score, quality_score, formatting_score, contact, sections, experience) -> PlatformScore:
    """SmartRecruiters: NLP Match Score AI — most modern, semantic similarity weighted."""
    # SmartRecruiters uses ML matching — quality and semantic context matter more than exact keywords
    semantic_quality = (keyword_score * 0.6 + quality_score * 0.4)  # simulated semantic blend
    linkedin_bonus = 10 if contact.get("linkedin") else 0
    yoe_bonus = min(10, experience.get("total_years_experience", 0) * 1.5)
    composite = semantic_quality*0.50 + formatting_score*0.15 + linkedin_bonus + yoe_bonus + (8 if sections.get("summary") else 0) + (7 if sections.get("skills") else 0)
    score = round(min(99, composite), 1)
    return PlatformScore(
        platform="SmartRecruiters", score=score, grade=_grade(score),
        breakdown={"semantic_match_score":round(semantic_quality,1),"formatting_compliance":round(formatting_score,1),"linkedin_presence":linkedin_bonus,"experience_depth":round(yoe_bonus,1)},
        rejection_risk="LOW" if score>=55 else "MEDIUM",
        platform_notes=[
            "SmartRecruiters uses AI Match Score — it understands context and synonyms, unlike Taleo/Workday.",
            "A well-written summary with rich context around your skills scores significantly higher than a plain keyword list.",
            "Content quality (quantified achievements, strong action verbs) directly boosts the AI match confidence.",
        ],
        tips=["Write a rich 3-4 sentence Professional Summary contextualizing your top skills.","Quantify achievements — SmartRecruiters AI weights 'reduced costs by 30%' higher than just 'cost reduction'.","Natural language matters more than keyword density here."]
    )


# ══════════════════════════════════════════════════════════════════════════════
# 12.  MAIN ATS ANALYSIS ORCHESTRATOR
# ══════════════════════════════════════════════════════════════════════════════

def run_full_ats_analysis(
    resume_text: str,
    jd_text: str = "",
    target_role: str = "",
    has_tables: bool = False,
    is_scanned: bool = False,
    filename: str = "",
) -> Dict:
    """
    Master orchestrator — runs all analysis layers and returns a complete
    structured report compatible with the frontend ATS Score UI.
    """

    # ── Layer 1: Structural Analysis ─────────────────────────────────────────
    sections = detect_sections(resume_text)
    contact  = extract_contact_signals(resume_text)

    # ── Layer 2: Timeline & Experience ───────────────────────────────────────
    experience = analyze_experience_timeline(resume_text)

    # ── Layer 3: Seniority Detection ─────────────────────────────────────────
    resume_seniority_band, resume_seniority_label = detect_seniority(resume_text)
    jd_seniority_band, jd_seniority_label = detect_seniority(jd_text or target_role)

    # ── Layer 4: Keyword Scoring (TF-IDF + ontology) ─────────────────────────
    effective_jd = jd_text if jd_text.strip() else target_role
    kw_result = score_keywords(resume_text, effective_jd)

    # ── Layer 5: Formatting Compliance ───────────────────────────────────────
    fmt_result = analyze_formatting(resume_text, has_tables, is_scanned, filename)

    # ── Layer 6: Content Quality ─────────────────────────────────────────────
    quality_result = analyze_content_quality(resume_text)

    # ── Layer 7: Education ───────────────────────────────────────────────────
    edu_result = analyze_education(resume_text)

    # ── Layer 8: Knockout Filters ─────────────────────────────────────────────
    required_kws = list(kw_result.get("matched", []) + kw_result.get("missing", []))
    knockout = evaluate_knockouts(
        resume_text, contact, sections, fmt_result, experience,
        kw_result.get("missing", []), required_kws
    )

    # ── Layer 9: Platform Scores ─────────────────────────────────────────────
    kw_s   = kw_result["score"]
    fmt_s  = fmt_result["formatting_score"]
    qual_s = quality_result["quality_score"]
    struct_s = sum(25 for v in [sections.get("experience"), sections.get("skills"), sections.get("education"), sections.get("summary")] if v)

    p_workday = score_workday(kw_s, struct_s, fmt_s, qual_s, edu_result, experience, contact, resume_seniority_band, jd_seniority_band, sections)
    p_greenhouse = score_greenhouse(kw_s, qual_s, contact, sections, fmt_s)
    p_lever = score_lever(kw_s, qual_s, contact, experience, sections, fmt_s)
    p_icims = score_icims(kw_s, struct_s, fmt_s, experience, contact, sections)
    p_taleo = score_taleo(kw_s, fmt_s, sections, experience, contact)
    p_linkedin = score_linkedin_easy_apply(kw_s, contact, sections, fmt_s, experience)
    p_smart = score_smartrecruiters(kw_s, qual_s, fmt_s, contact, sections, experience)

    # ── Layer 10: Composite ATS Score ────────────────────────────────────────
    platform_scores = [p_workday.score, p_greenhouse.score, p_lever.score, p_icims.score, p_taleo.score, p_linkedin.score, p_smart.score]
    composite_ats = round(sum(platform_scores) / len(platform_scores), 1)

    # Letter grade
    if composite_ats >= 90: grade = "A+"
    elif composite_ats >= 80: grade = "A"
    elif composite_ats >= 70: grade = "B+"
    elif composite_ats >= 60: grade = "B"
    elif composite_ats >= 50: grade = "C+"
    elif composite_ats >= 40: grade = "C"
    else: grade = "D"

    # ── Priority Action Plan ──────────────────────────────────────────────────
    action_plan = []
    
    # 1. Knockout Triggers (Absolute Priority)
    if knockout.triggered:
        for t in knockout.triggers:
            if t["severity"] in ("CRITICAL","HIGH"):
                action_plan.append({"priority":1,"action":t["detail"],"impact":"CRITICAL","platform":t["platform_impact"]})

    # 2. Categorized Missing Keywords
    missing_cats = kw_result.get("missing_by_category", {})
    missing_arch = missing_cats.get("Seniority & Architecture", [])
    missing_core = missing_cats.get("Core Technical", [])
    missing_soft = missing_cats.get("Soft Skills & Methodologies", [])
    
    # High seniority/architecture gap
    if missing_arch and jd_seniority_band >= 3:
        action_plan.append({
            "priority": 2,
            "action": f"CRITICAL {jd_seniority_label.upper()} FILTER GAP: Since you are applying for a {jd_seniority_label} role, adding architectural and scaling keywords like '{', '.join(missing_arch[:5])}' is highly critical to passing senior-level filters on Workday, Greenhouse, and Lever.",
            "impact": "HIGH",
            "platform": "Workday, Greenhouse, Lever"
        })
        
    # Core technical skills missing
    if missing_core:
        action_plan.append({
            "priority": 2,
            "action": f"Missing core technical skills matching the {kw_result.get('job_domain', 'technical')} requirements: {', '.join(missing_core[:8])}. Incorporating these is vital to raise keyword match density.",
            "impact": "HIGH",
            "platform": "Taleo, iCIMS, Workday"
        })
        
    # Soft skills / Methodologies missing
    if missing_soft:
        action_plan.append({
            "priority": 3,
            "action": f"Add delivery and soft skill keywords requested in the JD: {', '.join(missing_soft[:4])} (essential for modern collaborative roles).",
            "impact": "MEDIUM",
            "platform": "Lever, SmartRecruiters"
        })

    # 3. Content quality recommendations
    for rec in quality_result["recommendations"]:
        action_plan.append({"priority":3,"action":rec,"impact":"MEDIUM","platform":"SmartRecruiters, Greenhouse"})

    # 4. Formatting issues
    for issue in fmt_result["issues"]:
        if issue["severity"] in ("CRITICAL","HIGH"):
            action_plan.append({"priority":2,"action":issue["fix"],"impact":issue["severity"],"platform":"All ATS"})

    # Sort by priority
    action_plan.sort(key=lambda x: x["priority"])

    return {
        # Core scores
        "ats_score": composite_ats,
        "grade": grade,
        "keyword_score": round(kw_s, 1),
        "formatting_score": round(fmt_s, 1),
        "structure_score": struct_s,
        "quality_score": round(qual_s, 1),

        # Sections detected
        "sections_present": sections,

        # Contact fields
        "contact_fields": contact,

        # Keywords
        "matched_keywords": kw_result["matched"],
        "missing_keywords": kw_result["missing"],
        "missing_by_category": missing_cats,
        "jd_skill_count": kw_result["jd_skill_count"],

        # Formatting issues
        "is_scanned": is_scanned,
        "has_tables": has_tables,
        "formatting_issues": fmt_result["issues"],

        # Content quality
        "content_quality": {
            "score": qual_s,
            "bullet_count": quality_result["bullet_count"],
            "quantified_bullets_pct": quality_result["quantified_bullets_pct"],
            "strong_action_verbs": quality_result["strong_action_verbs"],
            "weak_passive_phrases": quality_result["weak_passive_phrases"],
            "avg_bullet_words": quality_result["avg_bullet_words"],
            "recommendations": quality_result["recommendations"],
        },

        # Experience
        "experience_analysis": {
            "total_years": experience["total_years_experience"],
            "job_count": experience["job_count"],
            "employment_gaps": experience["employment_gaps"],
            "most_recent_year": experience["most_recent_year"],
        },

        # Seniority
        "seniority": {
            "resume_level": resume_seniority_label,
            "resume_band": resume_seniority_band,
            "jd_level": jd_seniority_label,
            "jd_band": jd_seniority_band,
            "mismatch": abs(resume_seniority_band - jd_seniority_band),
        },

        # Education
        "education": edu_result,

        # Knockouts
        "knockout_risks": {
            "triggered": knockout.triggered,
            "total_risk": knockout.total_risk,
            "triggers": knockout.triggers,
        },

        # Platform compatibility (7 platforms)
        "platform_compatibility": {
            "workday":             {"score": p_workday.score, "grade": p_workday.grade, "risk": p_workday.rejection_risk, "notes": p_workday.platform_notes, "tips": p_workday.tips, "breakdown": p_workday.breakdown},
            "greenhouse":          {"score": p_greenhouse.score, "grade": p_greenhouse.grade, "risk": p_greenhouse.rejection_risk, "notes": p_greenhouse.platform_notes, "tips": p_greenhouse.tips, "breakdown": p_greenhouse.breakdown},
            "lever":               {"score": p_lever.score, "grade": p_lever.grade, "risk": p_lever.rejection_risk, "notes": p_lever.platform_notes, "tips": p_lever.tips, "breakdown": p_lever.breakdown},
            "icims":               {"score": p_icims.score, "grade": p_icims.grade, "risk": p_icims.rejection_risk, "notes": p_icims.platform_notes, "tips": p_icims.tips, "breakdown": p_icims.breakdown},
            "taleo":               {"score": p_taleo.score, "grade": p_taleo.grade, "risk": p_taleo.rejection_risk, "notes": p_taleo.platform_notes, "tips": p_taleo.tips, "breakdown": p_taleo.breakdown},
            "linkedin_easy_apply": {"score": p_linkedin.score, "grade": p_linkedin.grade, "risk": p_linkedin.rejection_risk, "notes": p_linkedin.platform_notes, "tips": p_linkedin.tips, "breakdown": p_linkedin.breakdown},
            "smartrecruiters":     {"score": p_smart.score, "grade": p_smart.grade, "risk": p_smart.rejection_risk, "notes": p_smart.platform_notes, "tips": p_smart.tips, "breakdown": p_smart.breakdown},
        },

        # Priority action plan
        "action_plan": action_plan[:10],

        # Summary suggestions (backwards compat)
        "suggestions": [a["action"] for a in action_plan[:6]],
    }
