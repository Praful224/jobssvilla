"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { TiltCard } from "@/components/TiltCard";
import { 
  BookOpen, 
  CheckCircle2, 
  ChevronRight, 
  Compass, 
  Layers, 
  ExternalLink, 
  Award,
  Terminal,
  Cpu,
  Globe,
  Settings,
  HelpCircle,
  Circle,
  X
} from "lucide-react";

type Skill = {
  id: string;
  label: string;
  desc: string;
  topics: string[];
  resources: { name: string; url: string }[];
  quest: string;
};

type Stage = {
  title: string;
  skills: Skill[];
};

type RoleRoadmap = {
  title: string;
  color: string;
  glowClass: string;
  icon: any;
  stages: Stage[];
};

const roadmaps: Record<string, RoleRoadmap> = {
  frontend: {
    title: "Frontend Developer",
    color: "from-emerald-400 via-teal-400 to-cyan-500",
    glowClass: "shadow-emerald-500/10 border-emerald-500/20",
    icon: Globe,
    stages: [
      {
        title: "Stage 1: Web Foundations",
        skills: [
          {
            id: "fe-html-css",
            label: "HTML & CSS Core",
            desc: "Master the building blocks of web page layout, semantic structure, responsive design, and CSS variables.",
            topics: ["Semantic HTML5 Layouts", "Flexbox & CSS Grid Alignment", "Media Queries & Mobile-First", "TailwindCSS & CSS Variables"],
            resources: [
              { name: "MDN Web HTML Guide", url: "https://developer.mozilla.org/en-US/docs/Learn/HTML" },
              { name: "TailwindCSS Documentation", url: "https://tailwindcss.com/docs" }
            ],
            quest: "Build a responsive product layout page using only TailwindCSS grid system."
          },
          {
            id: "fe-js",
            label: "Modern JavaScript",
            desc: "Deep dive into dynamic frontend logic, DOM manipulation, asynchronous programming, and clean ES6+ structures.",
            topics: ["ES6 Modules & Imports", "Promises & Async / Await", "Fetch API & JSON parsing", "DOM Events & Event Bubbling"],
            resources: [
              { name: "JavaScript.info Guide", url: "https://javascript.info/" },
              { name: "MDN Async JS Tutorial", url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous" }
            ],
            quest: "Create a functional search bar that filters an array of job roles with debounce."
          },
          {
            id: "fe-git",
            label: "Git Version Control",
            desc: "Learn to track code history, manage branches, handle merge conflicts, and push to GitHub repositories.",
            topics: ["Commits, Staging & Diffs", "Branching & Merging Strategies", "Resolving Merge Conflicts", "Pull Requests & Code Reviews"],
            resources: [
              { name: "GitHub Git Handbook", url: "https://github.com/git-guides" },
              { name: "Atlassian Git Tutorials", url: "https://www.atlassian.com/git" }
            ],
            quest: "Create a feature branch, resolve a merge conflict manually, and push it to a mock upstream."
          }
        ]
      },
      {
        title: "Stage 2: Single Page Applications",
        skills: [
          {
            id: "fe-react",
            label: "React.js Framework",
            desc: "Learn component architecture, virtual DOM updates, reactive states, side effects, and reusability.",
            topics: ["Functional Components & Props", "useState, useEffect & useRef", "Custom React Hooks", "Virtual DOM & Key attributes"],
            resources: [
              { name: "React Dev Documentation", url: "https://react.dev/" },
              { name: "React Hooks Reference", url: "https://react.dev/reference/react" }
            ],
            quest: "Build an interactive Todo checklist where check items trigger re-renders."
          },
          {
            id: "fe-ts",
            label: "TypeScript Essentials",
            desc: "Bring static type safety, interfaces, strict generics, and compilation checks to JavaScript codebases.",
            topics: ["Interfaces & Custom Types", "Generics & Function Overloads", "React TypeScript Props Typing", "Strict Compiler Settings"],
            resources: [
              { name: "TypeScript Official Handbook", url: "https://www.typescriptlang.org/docs/" },
              { name: "TypeScript React Cheatsheet", url: "https://react-typescript-cheatsheet.netlify.app/" }
            ],
            quest: "Refactor a vanilla JS state handler to be fully type-safe with generic props."
          },
          {
            id: "fe-nextjs",
            label: "Next.js Architecture",
            desc: "Learn routing structures, server side rendering (SSR), static site generation (SSG), and layout hydration.",
            topics: ["Next.js App Router & Layouts", "React Server Components (RSC)", "Dynamic Fetching & Caching", "API Routes in Next.js"],
            resources: [
              { name: "Next.js App Router Docs", url: "https://nextjs.org/docs" },
              { name: "RSC Explainer by Vercel", url: "https://nextjs.org/docs/app/building-your-application/rendering/server-components" }
            ],
            quest: "Deploy a Next.js dynamic routing path `/jobs/[id]` that fetches details from the API base."
          }
        ]
      },
      {
        title: "Stage 3: Enterprise Frontend Engineering",
        skills: [
          {
            id: "fe-state",
            label: "Zustand State Sync",
            desc: "Decouple app states from React context using lightweight, boilerplate-free external stores with local persistence.",
            topics: ["Zustand Store Creation", "Actions & Selective Selectors", "LocalStorage State Persistence", "Async API Syncing"],
            resources: [
              { name: "Zustand Github Guide", url: "https://github.com/pmndrs/zustand" }
            ],
            quest: "Establish a persistent shopping cart state that retains items across browser refreshes."
          },
          {
            id: "fe-styles",
            label: "3D Aesthetics & UI Polish",
            desc: "Integrate 3D translations, dynamic HSL colors, glow blurs, glassmorphism overlays, and smooth CSS transitions.",
            topics: ["CSS 3D Perspective & RotateY", "Glassmorphism Backdrop-Blur", "Keyframe Pulse Glow Animations", "Tailwind Custom Variants"],
            resources: [
              { name: "CSS 3D Transforms (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transforms/Using_CSS_transforms" },
              { name: "Glassmorphism UI Generator", url: "https://glassmorphism.com/" }
            ],
            quest: "Animate a premium card component that tilts dynamically based on mouse cursor coordinates."
          },
          {
            id: "fe-test",
            label: "Frontend Testing",
            desc: "Write unit tests for UI logic and run interactive assertion checks using modern unit test libraries.",
            topics: ["Jest Assertion Framework", "React Testing Library Mocks", "User Event Simulation", "Coverage Reporting Check"],
            resources: [
              { name: "React Testing Library Docs", url: "https://testing-library.com/docs/react-testing-library/intro/" }
            ],
            quest: "Write a test file asserting that clicking a login button triggers correct callback inputs."
          }
        ]
      }
    ]
  },
  backend: {
    title: "Backend Developer",
    color: "from-cyan-400 via-blue-500 to-indigo-600",
    glowClass: "shadow-cyan-500/10 border-cyan-500/20",
    icon: Terminal,
    stages: [
      {
        title: "Stage 1: Core Service Foundations",
        skills: [
          {
            id: "be-python",
            label: "Python Environment Core",
            desc: "Learn core data structures, virtual environments, package management with pip, and modular package architecture.",
            topics: ["Python Virtual Envs (venv)", "Pip & requirements.txt", "Modules, Packages & Imports", "Context Managers & Exceptions"],
            resources: [
              { name: "Python Official Tutorial", url: "https://docs.python.org/3/tutorial/" },
              { name: "Real Python Venv Guide", url: "https://realpython.com/python-virtual-environments-a-primer/" }
            ],
            quest: "Initialize a modular Python package with isolated environment parameters."
          },
          {
            id: "be-fastapi",
            label: "FastAPI Engine",
            desc: "Construct high-performance, asynchronous web servers with Python 3.12+ featuring live Swagger generation.",
            topics: ["APIRouter & Dynamic Routes", "Depends & Dependency Injection", "Uvicorn Async Run Loop", "Startup & Shutdown Lifecycles"],
            resources: [
              { name: "FastAPI Official Documentation", url: "https://fastapi.tiangolo.com/" },
              { name: "Swagger UI Interactive Docs Guide", url: "https://fastapi.tiangolo.com/features/" }
            ],
            quest: "Create a FastAPI backend path that returns service status variables asynchronously."
          },
          {
            id: "be-rest",
            label: "RESTful Principles",
            desc: "Design perfect CRUD APIs complying with HTTP specifications, proper headers, and dynamic response modeling.",
            topics: ["HTTP Methods (GET/POST/PATCH/DELETE)", "Status Codes (200, 201, 400, 401, 422)", "Request/Response Payloads", "Query Params & Headers"],
            resources: [
              { name: "MDN HTTP Overview", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP" }
            ],
            quest: "Develop fully compliant GET, POST, and DELETE endpoints for managing jobs."
          }
        ]
      },
      {
        title: "Stage 2: Persistent Storage & Security",
        skills: [
          {
            id: "be-db",
            label: "SQL, SQLite & SQLAlchemy",
            desc: "Store structured relational data, build relational schemas, and query efficiently using Object-Relational Mappers.",
            topics: ["SQLite Engine Configuration", "SQLAlchemy Declarative Base", "Database Session Injection", "One-to-Many Relationships"],
            resources: [
              { name: "SQLAlchemy 2.0 Docs", url: "https://docs.sqlalchemy.org/en/20/" },
              { name: "SQLite Tutorial", url: "https://www.sqlitetutorial.net/" }
            ],
            quest: "Define a SQLAlchemy user schema and query rows dynamically in a routes handler."
          },
          {
            id: "be-auth",
            label: "Security & JWT Auth",
            desc: "Secure API endpoints with OAuth2, password hashing, and signed JSON Web Tokens containing sub payloads.",
            topics: ["Passlib Hashing (bcrypt)", "Jose JWT Creation & Decoding", "Bearer Token Verification", "Protected Dependents Injection"],
            resources: [
              { name: "FastAPI Security & JWT Docs", url: "https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/" }
            ],
            quest: "Secure a route handler, rejecting all incoming calls lacking a valid Bearer token."
          },
          {
            id: "be-validation",
            label: "Pydantic Schema Validation",
            desc: "Implement strict compile-time data validation and schema checking for raw request bodies and response JSONs.",
            topics: ["Pydantic BaseModel Parsing", "Email & String Formats Validation", "Field Bounds & Custom Validation", "ORM Mode Serialization"],
            resources: [
              { name: "Pydantic Official Documentation", url: "https://docs.pydantic.dev/" }
            ],
            quest: "Validate inbound user registration JSON, returning 422 if the email field is invalid."
          }
        ]
      },
      {
        title: "Stage 3: Production Operations",
        skills: [
          {
            id: "be-docker",
            label: "Docker Containerization",
            desc: "Package web applications, environment configs, and system dependencies into isolated, reproducible container images.",
            topics: ["Writing lightweight Dockerfiles", "Docker Compose configuration", "Port Forwarding & Mounts", "Multi-stage Build caching"],
            resources: [
              { name: "Docker Official Get Started", url: "https://docs.docker.com/get-started/" }
            ],
            quest: "Write a Dockerfile that exposes a FastAPI server through a clean container port."
          },
          {
            id: "be-testing",
            label: "Backend Route Testing",
            desc: "Perform comprehensive testing of routes, authorization gates, and SQL models using isolated testing environments.",
            topics: ["Pytest Automation Framework", "httpx.AsyncClient test fetches", "SQLite Test DB in-memory fixtures", "Assertion checks"],
            resources: [
              { name: "FastAPI Testing Guide", url: "https://fastapi.tiangolo.com/advanced/testing/" }
            ],
            quest: "Write a test asserting that `/login` returns a correct access token upon valid request parameters."
          },
          {
            id: "be-redis",
            label: "Performance Caching",
            desc: "Optimize high-latency database queries and static responses using in-memory high-throughput key-value stores.",
            topics: ["In-memory Cache invalidation", "Redis String caching logic", "JSON caching serializers", "TTL Expiry handlers"],
            resources: [
              { name: "Redis Core Concepts", url: "https://redis.io/docs/latest/develop/data-types/" }
            ],
            quest: "Create a caching decorator that checks in-memory variables prior to triggering deep SQL reads."
          }
        ]
      }
    ]
  },
  ai: {
    title: "AI & Data Science",
    color: "from-violet-400 via-purple-500 to-fuchsia-600",
    glowClass: "shadow-purple-500/10 border-purple-500/20",
    icon: Cpu,
    stages: [
      {
        title: "Stage 1: Core Mathematical Engines",
        skills: [
          {
            id: "ai-math",
            label: "Applied Math & Stats",
            desc: "Master the foundations of machine learning: linear algebra, calculus derivatives, and statistical analytics.",
            topics: ["Matrix Dot Products & Vectors", "Gradient Descent Calculus", "Probability Distributions", "Hypothesis testing"],
            resources: [
              { name: "Khan Academy Linear Algebra", url: "https://www.khanacademy.org/math/linear-algebra" }
            ],
            quest: "Implement gradient descent calculations manually to minimize a simple objective function."
          },
          {
            id: "ai-data",
            label: "Exploratory Data Analysis",
            desc: "Perform deep data preparation, analytics transformations, and file loading using Python data structures.",
            topics: ["Pandas DataFrames Operations", "NumPy Vector Arrays Operations", "Null Data Cleaning & Interpolation", "Feature Correlation checks"],
            resources: [
              { name: "Pandas User Guide", url: "https://pandas.pydata.org/docs/user_guide/index.html" },
              { name: "NumPy Quickstart Guide", url: "https://numpy.org/doc/stable/user/quickstart.html" }
            ],
            quest: "Extract, load, clean, and sort a CSV dataset using a Pandas script."
          },
          {
            id: "ai-sklearn",
            label: "Classical Machine Learning",
            desc: "Build predictive classifiers, decision loops, clustering vectors, and regressors using standard ML tooling.",
            topics: ["Scikit-Learn Regression models", "Decision Trees & Random Forests", "K-Means Clustering classification", "Precision & Recall Metrics"],
            resources: [
              { name: "Scikit-Learn Getting Started", url: "https://scikit-learn.org/stable/getting_started.html" }
            ],
            quest: "Train an interactive classifier predicting candidate status outcomes based on skill matrices."
          }
        ]
      },
      {
        title: "Stage 2: Neural Networks & Language Core",
        skills: [
          {
            id: "ai-deep",
            label: "Neural Architectures",
            desc: "Establish multi-layered Artificial Neural Networks, loss estimators, weights optimizer paths, and learning states.",
            topics: ["PyTorch Tensor Operations", "Backpropagation Feedforward loops", "Activation Functions (ReLU, Sigmoid)", "Loss Minimization Optimization"],
            resources: [
              { name: "PyTorch Basics Tutorial", url: "https://pytorch.org/tutorials/beginner/basics/intro.html" }
            ],
            quest: "Construct a PyTorch Neural Network module consisting of dense linear layers."
          },
          {
            id: "ai-nlp",
            label: "Language Processing (NLP)",
            desc: "Transform unstructured language strings into machine-readable numeric formats and token structures.",
            topics: ["Tokenization & TF-IDF vectors", "Word Embeddings (Word2Vec)", "Transformer attention models", "Cosine Similarity match calculations"],
            resources: [
              { name: "Hugging Face NLP Course", url: "https://huggingface.co/learn/nlp-course/chapter1/1" }
            ],
            quest: "Calculate cosine similarity index metrics between two parsed resume arrays."
          },
          {
            id: "ai-llm",
            label: "Gemini AI Integrations",
            desc: "Harness modern Large Language Models via API keys, utilizing system templates, JSON output schemas, and flash models.",
            topics: ["Gemini REST API Call Payload", "Defining System Instruction templates", "Parsing JSON response formats", "Token count optimization"],
            resources: [
              { name: "Google Gemini API Documentation", url: "https://ai.google.dev/gemini-api/docs" }
            ],
            quest: "Implement a service querying Gemini AI to extract ATS keyword deficiencies from a plain text block."
          }
        ]
      },
      {
        title: "Stage 3: Advanced Semantic Architecture",
        skills: [
          {
            id: "ai-vector",
            label: "Vector Stores & RAG",
            desc: "Embed unstructured knowledge databases into vector coordinates, storing and querying them for semantic search.",
            topics: ["ChromaDB & Pinecone APIs", "Embedding Creation logic", "Similarity-based Nearest Neighbors", "Retrieval-Augmented Generation (RAG)"],
            resources: [
              { name: "ChromaDB Core Quickstart", url: "https://docs.trychroma.com/getting-started" }
            ],
            quest: "Store job descriptions inside a Vector Store and fetch matches dynamically using semantic prompts."
          },
          {
            id: "ai-mlops",
            label: "MLOps Orchestration",
            desc: "Package predictive models and deep LLM tasks into high-performance, asynchronous REST APIs for microservice architectures.",
            topics: ["Model serialization (Joblib)", "Exposing Model Inputs in FastAPI", "Latency checks & Batch scoring", "Metrics logging"],
            resources: [
              { name: "FastAPI Model Serving Guide", url: "https://fastapi.tiangolo.com/" }
            ],
            quest: "Establish a service route that runs real-time resume validation scoring models."
          }
        ]
      }
    ]
  },
  devops: {
    title: "DevOps Engineer",
    color: "from-amber-400 via-rose-500 to-red-600",
    glowClass: "shadow-rose-500/10 border-rose-500/20",
    icon: Settings,
    stages: [
      {
        title: "Stage 1: Core Automation Operations",
        skills: [
          {
            id: "do-linux",
            label: "Linux & Bash Operations",
            desc: "Operate standard Linux file systems, manage system environments, and write scripts automating recurring actions.",
            topics: ["Bash Script Automation", "Linux FS Permissions & Rights", "Process Controls & Cron Scheduling", "SSH secure key pairing"],
            resources: [
              { name: "Linux Command Line Basics", url: "https://linuxjourney.com/" }
            ],
            quest: "Write a shell script checking backend logs, moving backups to clean storage recursively."
          },
          {
            id: "do-network",
            label: "Secure Networking",
            desc: "Master network transport models, routing ports, DNS name resolution, and SSL certificates authentication.",
            topics: ["HTTP/S & Transport protocols", "DNS settings (A, CNAME registers)", "SSL/TLS cert generation (LetsEncrypt)", "Nginx Reverse Proxy routing"],
            resources: [
              { name: "Nginx Core Configuration Guide", url: "https://nginx.org/en/docs/" }
            ],
            quest: "Configure Nginx routing to maps domain inputs to secure local ports."
          },
          {
            id: "do-cicd",
            label: "GitHub Actions CI/CD",
            desc: "Automate build steps, code lint checks, and testing sequences executing upon every main branch commit.",
            topics: ["YAML workflow descriptions", "Setting GitHub Secrets variables", "Runner Environment actions", "Continuous Deploy pipelines"],
            resources: [
              { name: "GitHub Actions Starter Docs", url: "https://docs.github.com/en/actions" }
            ],
            quest: "Define a GitHub workflow validating code quality, running tests on push triggers."
          }
        ]
      },
      {
        title: "Stage 2: Orchestration & Cloud Infrastructure",
        skills: [
          {
            id: "do-docker",
            label: "Docker Bridge Networks",
            desc: "Orchestrate complex container groups, defining secure private bridges, data mounts, and environmental variables.",
            topics: ["Multi-container bridges setup", "Persisted Volume mounts mapping", "Docker Compose configuration", "Environment values variables"],
            resources: [
              { name: "Docker Compose Docs", url: "https://docs.docker.com/compose/" }
            ],
            quest: "Compose a multi-container scheme linking a FastAPI server to a PostgreSQL DB through a bridge."
          },
          {
            id: "do-k8s",
            label: "Kubernetes Systems",
            desc: "Deploy highly scalable microservices, organizing automated recovery, service ports mapping, and load balancer routes.",
            topics: ["Declaring Deployment YAMLs", "Configuring Service routing structures", "Pods scheduling & replicas scaling", "Secrets variables encryption mapping"],
            resources: [
              { name: "Kubernetes Core Basics Guide", url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/" }
            ],
            quest: "Declare a cluster YAML template creating replicas of an exposed web app."
          },
          {
            id: "do-terraform",
            label: "Infrastructure as Code",
            desc: "Define, compile, and provision entire cloud network landscapes cleanly using declarative provisioning languages.",
            topics: ["Terraform HCL syntax patterns", "Declaring Provider connections variables", "Resource maps generation", "Provisioning state locks"],
            resources: [
              { name: "Terraform Official Guide", url: "https://developer.hashicorp.com/terraform/intro" }
            ],
            quest: "Declare a Terraform template spinning up an isolated virtual compute cloud."
          }
        ]
      },
      {
        title: "Stage 3: Advanced Resilience Operations",
        skills: [
          {
            id: "do-cloud",
            label: "Cloud Ecosystems",
            desc: "Organize robust, private subnet environments, security access lists, and server scaling policies on major clouds.",
            topics: ["VPC subnets configuration", "Security Groups configurations variables", "Compute VMs scaling pools", "Object storage mapping"],
            resources: [
              { name: "AWS Get Started Docs", url: "https://aws.amazon.com/getting-started/" },
              { name: "Google Cloud Engine Docs", url: "https://cloud.google.com/docs" }
            ],
            quest: "Deploy a resilient instance behind a load balancer with automated auto-scaling."
          },
          {
            id: "do-metrics",
            label: "Observability Monitoring",
            desc: "Gather machine usage statistics, logging trace points, and displaying real-time alert metrics on gorgeous dashboards.",
            topics: ["Prometheus metrics exports", "Grafana dashboards metrics displays", "Alert Manager notification thresholds", "Log indexing analytics"],
            resources: [
              { name: "Prometheus Monitoring Tutorial", url: "https://prometheus.io/docs/introduction/overview/" },
              { name: "Grafana Official Documentation", url: "https://grafana.com/docs/" }
            ],
            quest: "Build an observability alert triggers pipeline alerting when server RAM consumption exceeds 90%."
          }
        ]
      }
    ]
  }
};

export default function RoadmapPage() {
  const [activeRole, setActiveRole] = useState<string>("frontend");
  const [completedSkills, setCompletedSkills] = useState<Record<string, boolean>>({});
  const [completedSubTopics, setCompletedSubTopics] = useState<Record<string, Record<number, boolean>>>({});
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);

  // Load completed skills and subtopics from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("jobsvilla_completed_skills");
      if (saved) {
        try {
          setCompletedSkills(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse completed skills", e);
        }
      }
      const savedSub = localStorage.getItem("jobsvilla_completed_subtopics");
      if (savedSub) {
        try {
          setCompletedSubTopics(JSON.parse(savedSub));
        } catch (e) {
          console.error("Failed to parse completed subtopics", e);
        }
      }
    }
  }, []);

  const currentRoadmap = roadmaps[activeRole];
  const allSkills = currentRoadmap.stages.flatMap(s => s.skills);
  const totalSkillsCount = allSkills.length;
  const completedSkillsCount = allSkills.filter(s => completedSkills[s.id]).length;
  const progressPercent = totalSkillsCount > 0 
    ? Math.round((completedSkillsCount / totalSkillsCount) * 100) 
    : 0;

  const toggleSkill = (skillId: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation(); // Avoid opening the detail modal when checking/unchecking
    const isNowCompleted = !completedSkills[skillId];
    const updatedSkills = {
      ...completedSkills,
      [skillId]: isNowCompleted
    };
    setCompletedSkills(updatedSkills);
    localStorage.setItem("jobsvilla_completed_skills", JSON.stringify(updatedSkills));

    // Also update all subtopics to match the skill state!
    const targetSkill = allSkills.find(s => s.id === skillId);
    if (targetSkill) {
      const updatedSkillSubs: Record<number, boolean> = {};
      targetSkill.topics.forEach((_, idx) => {
        updatedSkillSubs[idx] = isNowCompleted;
      });
      const updatedSubs = {
        ...completedSubTopics,
        [skillId]: updatedSkillSubs
      };
      setCompletedSubTopics(updatedSubs);
      localStorage.setItem("jobsvilla_completed_subtopics", JSON.stringify(updatedSubs));
    }
  };

  const toggleSubTopic = (skillId: string, topicIdx: number) => {
    const skillSubs = completedSubTopics[skillId] || {};
    const updatedSkillSubs = {
      ...skillSubs,
      [topicIdx]: !skillSubs[topicIdx]
    };
    const updated = {
      ...completedSubTopics,
      [skillId]: updatedSkillSubs
    };
    setCompletedSubTopics(updated);
    localStorage.setItem("jobsvilla_completed_subtopics", JSON.stringify(updated));

    // Get the skill details from roadmaps
    const targetSkill = allSkills.find(s => s.id === skillId);
    if (targetSkill) {
      const allDone = targetSkill.topics.every((_, idx) => updatedSkillSubs[idx]);
      const currentSkillDone = !!completedSkills[skillId];
      if (allDone !== currentSkillDone) {
        const updatedSkills = {
          ...completedSkills,
          [skillId]: allDone
        };
        setCompletedSkills(updatedSkills);
        localStorage.setItem("jobsvilla_completed_skills", JSON.stringify(updatedSkills));
      }
    }
  };

  const RoleIcon = currentRoadmap.icon;

  return (
    <AppShell
      title="Next-Gen Career Roadmap Autopilot"
      subtitle="Follow interactive learning pipelines, track skill checkboxes, and deep-dive into curated documentation to pilot your IT career."
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_360px] items-start">
        {/* Left Side: Interactive Roadmap Tree */}
        <div className="space-y-8">
          {/* Role Selector Tabs */}
          <div className="flex flex-wrap gap-2.5 rounded-2xl bg-zinc-950/40 p-1.5 border border-white/5 backdrop-blur-md">
            {Object.entries(roadmaps).map(([key, roadmap]) => {
              const Icon = roadmap.icon;
              const active = activeRole === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setActiveRole(key);
                    setActiveSkill(null);
                  }}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition duration-300 ${
                    active 
                      ? `bg-gradient-to-r ${roadmap.color} text-zinc-950 shadow-lg`
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={14} />
                  {roadmap.title}
                </button>
              );
            })}
          </div>

          {/* Progress Dashboard Ring / Meter */}
          <TiltCard maxTilt={3} scale={1} className={`glass-3d bg-zinc-950/60 p-6 rounded-3xl border border-white/5 card-glow-cyan ${currentRoadmap.glowClass}`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1.5 text-center sm:text-left">
                <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">Live Metrics Sync</span>
                <h3 className="text-xl font-bold tracking-tight text-white flex items-center justify-center sm:justify-start gap-2">
                  <Award size={18} className="text-emerald-400" />
                  {currentRoadmap.title} Progress
                </h3>
                <p className="text-xs text-zinc-400">
                  Completing milestone skills prepares you for automated backend validation evaluation.
                </p>
              </div>

              <div className="flex items-center gap-5 shrink-0">
                {/* Visual Progress Bar */}
                <div className="text-right space-y-1">
                  <span className="text-3xl font-extrabold text-white tracking-tight">{progressPercent}%</span>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    {completedSkillsCount} of {totalSkillsCount} Skills
                  </p>
                </div>
                <div className="relative flex items-center justify-center h-16 w-16 rounded-full bg-zinc-900 border border-white/5 shadow-inner">
                  {/* Glowing dynamic gauge ring */}
                  <svg className="absolute w-full h-full transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke="rgba(255,255,255,0.03)"
                      strokeWidth="4"
                      fill="transparent"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke="url(#progress-glow)"
                      strokeWidth="4.5"
                      fill="transparent"
                      strokeDasharray="163.3"
                      strokeDashoffset={163.3 - (163.3 * progressPercent) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="progress-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <RoleIcon size={20} className="text-emerald-400 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Glowing Linear Bar */}
            <div className="mt-6 h-2 w-full rounded-full bg-zinc-900 border border-white/5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </TiltCard>

          {/* Inline pipeline pulse styles */}
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes path-dash {
              to {
                stroke-dashoffset: -20;
              }
            }
            .animate-pipeline-dash {
              animation: path-dash 1.2s linear infinite;
            }
          ` }} />

          {/* Serpentine Career Path Time Machine Graph Network */}
          <div className="space-y-12">
            {currentRoadmap.stages.map((stage, sIdx) => (
              <div key={stage.title} className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 border border-white/10 text-emerald-400 shadow-md">
                    <Layers size={14} className="animate-pulse" />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400">{stage.title}</h4>
                  <div className="h-px bg-white/5 flex-1" />
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 relative">
                  {stage.skills.map((skill, kIdx) => {
                    const isCompleted = !!completedSkills[skill.id];
                    const active = activeSkill?.id === skill.id;

                    return (
                      <div key={skill.id} className="relative">
                        {/* Horizontal connector line to the next card (Desktop) */}
                        {kIdx < 2 && (
                          <div className="absolute top-1/2 -right-8 -translate-y-1/2 w-8 h-1 hidden lg:block z-20 pointer-events-none">
                            <svg className="w-full h-full animate-pipeline-dash" overflow="visible">
                              <line
                                x1="0"
                                y1="2"
                                x2="32"
                                y2="2"
                                stroke={isCompleted && completedSkills[stage.skills[kIdx + 1].id] ? "#10b981" : "#a855f7"}
                                strokeWidth="2.5"
                                strokeDasharray="5,5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                        )}

                        {/* Vertical connector line between nodes (Mobile/Tablet stacking) */}
                        {kIdx < 2 && (
                          <div className="absolute left-1/2 -bottom-8 -translate-x-1/2 w-1 h-8 lg:hidden block z-20 pointer-events-none">
                            <svg className="w-full h-full animate-pipeline-dash" overflow="visible">
                              <line
                                x1="2"
                                y1="0"
                                x2="2"
                                y2="32"
                                stroke={isCompleted && completedSkills[stage.skills[kIdx + 1].id] ? "#10b981" : "#a855f7"}
                                strokeWidth="2.5"
                                strokeDasharray="5,5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                        )}

                        {/* Inter-stage vertical pipeline connector (Desktop) */}
                        {kIdx === 2 && sIdx < currentRoadmap.stages.length - 1 && (
                          <div className="absolute left-1/2 -bottom-14 -translate-x-1/2 w-1 h-14 hidden lg:block z-20 pointer-events-none">
                            <svg className="w-full h-full animate-pipeline-dash" overflow="visible">
                              <line
                                x1="2"
                                y1="0"
                                x2="2"
                                y2="56"
                                stroke={isCompleted && completedSkills[currentRoadmap.stages[sIdx + 1].skills[0].id] ? "#10b981" : "#a855f7"}
                                strokeWidth="2.5"
                                strokeDasharray="5,5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                        )}

                        {/* Interactive Hex/Super-elliptical Node Coordinate */}
                        <div
                          onClick={() => setActiveSkill(skill)}
                          className={`group relative glass-3d rounded-3xl border p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between h-44 hover:scale-[1.03] ${
                            active
                              ? isCompleted
                                ? "bg-emerald-500/[0.04] border-emerald-400 shadow-lg shadow-emerald-500/10"
                                : "bg-purple-500/[0.04] border-purple-400 shadow-lg shadow-purple-500/10"
                              : isCompleted
                              ? "bg-zinc-950/40 border-emerald-500/25 hover:border-emerald-500/40 shadow-md shadow-emerald-500/5 hover:bg-emerald-500/[0.02]"
                              : "bg-zinc-950/40 border-white/5 hover:border-purple-500/20 hover:bg-purple-500/[0.01]"
                          }`}
                        >
                          {/* Node status indicator */}
                          <div className="flex items-start justify-between gap-4">
                            <span className={`text-[9px] font-extrabold uppercase tracking-widest ${isCompleted ? "text-emerald-400" : "text-purple-400"}`}>
                              {isCompleted ? "Verified Node" : "Locked Milestone"}
                            </span>

                            <div 
                              onClick={(e) => toggleSkill(skill.id, e)}
                              className={`flex h-6 w-6 items-center justify-center rounded-lg border transition duration-200 cursor-pointer ${
                                isCompleted
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)] hover:bg-emerald-500/20"
                                  : "bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20"
                              }`}
                              title={isCompleted ? "Mark skill as uncompleted" : "Mark skill as completed"}
                            >
                              {isCompleted ? (
                                <CheckCircle2 size={12} className="stroke-[3]" />
                              ) : (
                                <Circle size={12} className="text-purple-400/50 hover:text-purple-400" />
                              )}
                            </div>
                          </div>

                          {/* Skill labels */}
                          <div className="mt-3 space-y-1">
                            <h5 className={`font-extrabold text-sm transition duration-300 ${isCompleted ? "text-white group-hover:text-emerald-300" : "text-zinc-300 group-hover:text-purple-300"}`}>
                              {skill.label}
                            </h5>
                            <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                              {skill.desc}
                            </p>
                          </div>

                          {/* Inspect trigger */}
                          <div className="mt-3 flex items-center justify-between text-[9px] font-bold text-zinc-500 group-hover:text-zinc-300 transition duration-300 uppercase">
                            <span className="flex items-center gap-1">
                              Inspect Coordinate <ChevronRight size={10} className="group-hover:translate-x-0.5 transition" />
                            </span>
                            {isCompleted && (
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Skill Hub Hub (Details sidebar / overlays) */}
        <aside className="sticky top-28 z-10 space-y-5">
          {activeSkill ? (
            <TiltCard maxTilt={2} scale={1} className={`glass-3d bg-zinc-950/70 p-6 rounded-3xl border border-white/10 card-glow-cyan relative overflow-hidden`}>
              <div className="space-y-5">
                {/* Header Icon + Label + Close Button */}
                <div className="flex items-center gap-3 pb-4 border-b border-white/5 relative pr-8">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Concept Deep-Dive</span>
                    <h4 className="font-bold text-sm text-white tracking-tight">{activeSkill.label}</h4>
                  </div>
                  
                  {/* Close button */}
                  <button 
                    onClick={() => setActiveSkill(null)}
                    className="absolute top-0 right-0 p-1.5 rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition"
                    title="Close details"
                  >
                    <X size={12} />
                  </button>
                </div>

                {/* Status Indicator Badge */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Concept Status</span>
                  {completedSkills[activeSkill.id] ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 shadow-[0_0_10px_rgba(16,185,129,0.15)] animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest text-zinc-400 bg-white/5 border border-white/10">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-600 animate-pulse" />
                      In Progress
                    </span>
                  )}
                </div>

                {/* Concept Narrative */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Core Objective</span>
                  <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
                    {activeSkill.desc}
                  </p>
                </div>

                {/* Interactive sub-topics checklist checklist */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block">Milestone Checkpoints</span>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {activeSkill.topics.map((topic, i) => {
                      const isTopicDone = !!(completedSubTopics[activeSkill.id]?.[i]);
                      return (
                        <div 
                          key={i} 
                          onClick={() => toggleSubTopic(activeSkill.id, i)}
                          className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition duration-150 select-none ${
                            isTopicDone 
                              ? "bg-emerald-500/[0.02] border-emerald-500/20 text-emerald-300"
                              : "bg-white/[0.01] border-white/5 text-zinc-400 hover:border-zinc-700 hover:bg-white/[0.02]"
                          }`}
                        >
                          <div className="mt-0.5 shrink-0 flex items-center justify-center">
                            {isTopicDone ? (
                              <CheckCircle2 size={13} className="text-emerald-400 stroke-[3]" />
                            ) : (
                              <Circle size={13} className="text-zinc-600 hover:text-purple-400" />
                            )}
                          </div>
                          <span className="text-xs leading-relaxed">{topic}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Curated Resources Direct Links */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Learning Portals</span>
                  <div className="grid gap-2">
                    {activeSkill.resources.map((res, i) => (
                      <a
                        key={i}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 px-3.5 py-2.5 text-xs font-bold text-zinc-300 hover:text-white transition duration-200"
                      >
                        <span className="truncate">{res.name}</span>
                        <ExternalLink size={12} className="text-zinc-500 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Practical Quest Challenge */}
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] p-4 space-y-3 relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-5 text-emerald-400">
                    <Terminal size={80} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-emerald-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Active Learning Quest</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
                    {activeSkill.quest}
                  </p>

                  {/* Quest Completion Action */}
                  <div className="pt-2 border-t border-emerald-500/10">
                    {completedSkills[activeSkill.id] ? (
                      <button
                        onClick={() => toggleSkill(activeSkill.id)}
                        className="w-full rounded-xl bg-emerald-500/10 border border-emerald-500/25 py-2.5 text-[11px] font-bold text-emerald-400 flex items-center justify-center gap-1.5 shadow-inner hover:bg-emerald-500/20 transition duration-200"
                      >
                        <CheckCircle2 size={13} className="stroke-[3]" />
                        Learning Badge Acquired (Undo)
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleSkill(activeSkill.id)}
                        className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:brightness-110 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-500/10 flex items-center justify-center gap-1.5 transition duration-200 active:scale-95"
                      >
                        <Award size={13} className="animate-bounce" />
                        Complete Quest & Claim Badge
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </TiltCard>
          ) : (
            <div className="h-[480px] flex flex-col items-center justify-center text-center border border-dashed border-white/10 rounded-3xl bg-zinc-950/20 backdrop-blur-sm p-8">
              <div className="h-12 w-12 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-zinc-600 mb-4 animate-pulse">
                <HelpCircle size={22} />
              </div>
              <h5 className="font-bold text-sm text-zinc-400">No Node Inspected</h5>
              <p className="text-xs text-zinc-600 mt-2 max-w-[200px] leading-relaxed">
                Click on any skill block in your roadmap tree to unlock details, tutorials, and practical validation quests.
              </p>
            </div>
          )}
        </aside>
      </div>
    </AppShell>
  );
}
