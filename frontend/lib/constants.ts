export const PREDEFINED_JDS = {
  cloud: {
    label: "Cloud Engineer",
    color: "#00d4ff",
    icon: "☁️",
    description: "Design, deploy & manage scalable cloud infrastructure on AWS/Azure/GCP with IaC, security, and automation.",
    required: [
      { kw: "AWS", weight: 10, present: false },
      { kw: "EC2", weight: 8, present: false },
      { kw: "VPC", weight: 8, present: false },
      { kw: "S3", weight: 7, present: false },
      { kw: "IAM", weight: 8, present: false },
      { kw: "Terraform", weight: 9, present: false },
      { kw: "Kubernetes", weight: 9, present: false },
      { kw: "Docker", weight: 8, present: false },
      { kw: "CI/CD", weight: 9, present: false },
      { kw: "Security", weight: 8, present: false }
    ],
    preferred: [
      { kw: "GCP", weight: 5, present: false },
      { kw: "CloudFormation", weight: 4, present: false },
      { kw: "Ansible", weight: 4, present: false },
      { kw: "Helm", weight: 6, present: false },
      { kw: "DevSecOps", weight: 6, present: false }
    ],
    missingKeywords: [],
    tips: [
      "Add 'Cost Optimization' – appears in 78% of cloud JDs.",
      "Mention 'Disaster Recovery' or 'DR/HA strategy' – critical for enterprise cloud roles."
    ]
  },
  devops: {
    label: "DevOps Engineer",
    color: "#ff6b35",
    icon: "⚙️",
    description: "Build & maintain CI/CD, IaC, container orchestration, monitoring, and DevSecOps pipelines at scale.",
    required: [
      { kw: "CI/CD", weight: 10, present: false },
      { kw: "Jenkins", weight: 8, present: false },
      { kw: "Terraform", weight: 9, present: false },
      { kw: "Kubernetes", weight: 10, present: false },
      { kw: "Docker", weight: 9, present: false },
      { kw: "Python", weight: 8, present: false },
      { kw: "AWS", weight: 9, present: false },
      { kw: "Prometheus", weight: 7, present: false },
      { kw: "Linux", weight: 8, present: false },
      { kw: "Infrastructure as Code", weight: 9, present: false }
    ],
    preferred: [
      { kw: "Agile / Scrum", weight: 5, present: false },
      { kw: "DataDog", weight: 4, present: false },
      { kw: "OpenShift", weight: 6, present: false },
      { kw: "GitOps", weight: 7, present: false }
    ],
    missingKeywords: [],
    tips: [
      "Add 'Agile' or 'Scrum' methodology – appears in 91% of DevOps JDs.",
      "Ansible is requested in 48% of JDs. Even 'Ansible (familiar)' can help."
    ]
  },
  custom: {
    label: "Custom Role",
    color: "#f43f5e",
    icon: "🎯",
    description: "Analyze any custom job description using AI.",
    required: [],
    preferred: [],
    missingKeywords: [],
    tips: ["Paste a job description below and click Scan to extract keywords dynamically."]
  }
};

export const ATS_PLATFORMS = {
  workday: {
    label: "Workday", logo: "W", color: "#cf4520", bg: "#fff1ee",
    used: "Enterprise & Fortune 500",
    scoring: "Keyword frequency + Job Title exact match + Education field match",
    quirks: ["Exact keyword match (no synonyms). 'K8s' ≠ 'Kubernetes'", "Job title seniority match is weighted heavily"],
    titleBonus: true, certBonus: true, educationBonus: true, modifier: 0
  },
  greenhouse: {
    label: "Greenhouse", logo: "G", color: "#3dba6e", bg: "#edfff4",
    used: "Tech startups & growth-stage companies",
    scoring: "Scorecard + Boolean keyword search",
    quirks: ["Every application reaches a human", "Skills section heavily indexed for search"],
    titleBonus: false, certBonus: true, educationBonus: false, modifier: 2
  },
  lever: {
    label: "Lever", logo: "L", color: "#1e40af", bg: "#eff6ff",
    used: "Mid-size tech & professional services",
    scoring: "AI profile card + structured field extraction",
    quirks: ["AI ranking layer runs on structured profile", "Full-text indexed for Boolean search"],
    titleBonus: true, certBonus: false, educationBonus: true, modifier: 1
  },
  taleo: {
    label: "Taleo (Oracle)", logo: "T", color: "#f35e0a", bg: "#fff3eb",
    used: "Large conglomerates & government agencies",
    scoring: "Complex keyword mapping + strict compliance checking",
    quirks: ["Very old system, hates complex formatting/columns", "Strongly relies on standard section headings"],
    titleBonus: true, certBonus: true, educationBonus: true, modifier: -1
  },
  icims: {
    label: "iCIMS", logo: "I", color: "#007bb6", bg: "#e6f5fc",
    used: "Healthcare, retail, and manufacturing enterprises",
    scoring: "Structured resume parsing + portal matching",
    quirks: ["Can parse multi-column tables but prefers raw text", "Custom questionnaires count heavily toward final tiering"],
    titleBonus: true, certBonus: true, educationBonus: false, modifier: 0
  },
  bamboohr: {
    label: "BambooHR", logo: "B", color: "#82ad24", bg: "#f3fbeb",
    used: "Small to mid-sized businesses",
    scoring: "Human-centric viewing + simple keyword tags",
    quirks: ["Hiring managers scan directly in-app", "Keywords are highlighted for review, but no automated auto-rejections"],
    titleBonus: false, certBonus: false, educationBonus: false, modifier: 3
  },
  ashby: {
    label: "Ashby", logo: "A", color: "#fc4c02", bg: "#fff0ea",
    used: "Modern fast-growing tech startups",
    scoring: "Structured data parsing + manual review pipelines",
    quirks: ["Highly advanced parsing of modern web formats", "Extremely clean profile view for recruiters"],
    titleBonus: true, certBonus: true, educationBonus: false, modifier: 2
  },
  smartrecruiters: {
    label: "SmartRecruiters", logo: "S", color: "#00a1e0", bg: "#e6f6fc",
    used: "Global enterprise brands",
    scoring: "Match Score AI + semantic similarity algorithms",
    quirks: ["Uses modern NLP to match synonyms (e.g. 'Node.js' to 'Javascript')", "Assesses match against similar job titles automatically"],
    titleBonus: true, certBonus: true, educationBonus: true, modifier: 2
  },
  zoho: {
    label: "Zoho Recruit", logo: "Z", color: "#e31b23", bg: "#fdf1f1",
    used: "Professional agencies & mid-market firms",
    scoring: "Resume parser API ranking + search scoring",
    quirks: ["Strongly relies on clear chronological order", "Indexes skills list separate from experience context"],
    titleBonus: false, certBonus: true, educationBonus: true, modifier: 1
  },
  other: {
    label: "Other ATS Platform", logo: "*", color: "#64748b", bg: "#f1f5f9",
    used: "Custom or niche proprietary hiring systems",
    scoring: "Fallback parser + general semantic search matching",
    quirks: ["Generic parsing algorithms apply", "Safe fallback with average weights and strict standard formatting"],
    titleBonus: true, certBonus: true, educationBonus: true, modifier: 0
  }
};
