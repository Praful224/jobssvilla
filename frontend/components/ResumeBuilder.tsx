"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  Save, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Download, 
  Code, 
  Cpu, 
  ShieldCheck, 
  Copy, 
  Plus, 
  Trash2, 
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  apiFetch,
  jsonHeaders,
  getToken,
  API_BASE_URL,
  ResumeRecord,
} from "@/lib/api";

type ResumeBuilderProps = {
  initialResume?: ResumeRecord;
};

// Premium, predefined structured ATS starter resume data
const DEFAULT_RESUME_DATA = {
  name: "Praful Kumar",
  email: "praful@email.com",
  phone: "+91 98765 43210",
  location: "Bangalore, India",
  linkedin_url: "https://linkedin.com/in/praful-kumar",
  github_url: "https://github.com/prafulkumar",
  portfolio_url: "https://praful.dev",
  summary: "Highly analytical and security-oriented Software Engineer with strong experience in FastAPI Relational Backends, sandboxed compilation platforms, and cryptography interfaces.",
  skills: [
    { category: "Languages & Frameworks", items: "Python, FastAPI, React, Next.js, SQL, TypeScript" },
    { category: "Cloud & DevOps", items: "Docker, Kubernetes, AWS Services, CI/CD pipelines, Terraform" }
  ],
  experience: [
    {
      role: "Backend Engineering Fellow",
      company: "JobsVilla Inc.",
      duration: "Jan 2026 -- Present",
      bullets: [
        "Spearheaded asynchronous FastAPI microservice routing matrices, improving query load speeds by 42%.",
        "Containerized multi-service grids using Docker private bridge setups, mitigating replica synchronization latency by 35%."
      ]
    }
  ],
  projects: [
    {
      title: "JobsVilla Cryptographic Career System",
      link: "https://github.com/jobsvilla/crypto-core",
      duration: "Fall 2025",
      bullets: [
        "Architected isolated subprocess jails with process execution time-caps of 5.0 seconds.",
        "Developed Ed25519-salted cryptographic profile verified claims, neutralizing talent inflation by 100%."
      ]
    }
  ],
  education: [
    {
      degree: "B.Tech in Computer Science",
      institution: "Indian Institute of Technology",
      duration: "2022 -- 2026",
      details: "GPA: 9.2/10. Specialization in Cryptography and Distributed Systems."
    }
  ],
  custom_sections: []
};

export function ResumeBuilder({ initialResume }: ResumeBuilderProps) {
  const [activeTab, setActiveTab] = useState<"builder" | "jd-matcher" | "claims-vault">("builder");

  // Main structured resume data state
  const [fileName, setFileName] = useState(initialResume?.file_name || "My_Resume");
  const [resumeData, setResumeData] = useState<any>(() => {
    let data: any = DEFAULT_RESUME_DATA;
    if (initialResume?.content) {
      try {
        const parsed = JSON.parse(initialResume.content);
        if (parsed && typeof parsed === "object" && parsed.name) {
          data = parsed;
        }
      } catch (e) {
        console.error("Failed to parse initial resume content JSON:", e);
      }
    }
    if (!data.custom_sections) {
      data.custom_sections = [];
    }
    return data;
  });

  // Accordion active sections
  const [openSections, setOpenSections] = useState<any>({
    header: true,
    summary: true,
    skills: true,
    experience: true,
    projects: true,
    education: true,
    customSections: true,
  });

  const toggleSection = (sec: string) => {
    setOpenSections((prev: any) => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Compiler and Exporter states
  const [compiling, setCompiling] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  // In-line STAR Bullet Enhancer states
  const [enhancingIndex, setEnhancingIndex] = useState<{ type: "exp" | "prj"; itemIdx: number; bulletIdx: number } | null>(null);
  const [enhancedSuggestions, setEnhancedSuggestions] = useState<string[]>([]);
  const [enhancingStatus, setEnhancingStatus] = useState("");

  // Tab 2: JD Matcher States
  const [jdText, setJdText] = useState("");
  const [jdRole, setJdRole] = useState("");
  const [jdMatching, setJdMatching] = useState(false);
  const [jdResult, setJdResult] = useState<any | null>(null);

  // Tab 3: Cryptographic Claims Vault States
  const [claimInput, setClaimInput] = useState("");
  const [claimVerifying, setClaimVerifying] = useState(false);
  const [verifiedClaims, setVerifiedClaims] = useState<any[]>([]);
  const [claimStatus, setClaimStatus] = useState("");

  // Load claims on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedClaims = localStorage.getItem("jobsvilla_verified_claims");
      if (savedClaims) {
        try {
          setVerifiedClaims(JSON.parse(savedClaims));
        } catch (e) {
          console.error("Failed to load claims:", e);
        }
      }
    }
  }, []);

  // Update field helper
  const updateHeaderField = (field: string, val: string) => {
    setResumeData((prev: any) => ({ ...prev, [field]: val }));
  };

  // Skills handlers
  const handleSkillChange = (idx: number, field: "category" | "items", val: string) => {
    setResumeData((prev: any) => {
      const updated = [...prev.skills];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, skills: updated };
    });
  };

  const addSkillCategory = () => {
    setResumeData((prev: any) => ({
      ...prev,
      skills: [...prev.skills, { category: "", items: "" }],
    }));
  };

  const removeSkillCategory = (idx: number) => {
    setResumeData((prev: any) => ({
      ...prev,
      skills: prev.skills.filter((_: any, i: number) => i !== idx),
    }));
  };

  // Experience handlers
  const handleExpChange = (idx: number, field: string, val: any) => {
    setResumeData((prev: any) => {
      const updated = [...prev.experience];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, experience: updated };
    });
  };

  const handleExpBulletChange = (expIdx: number, bIdx: number, val: string) => {
    setResumeData((prev: any) => {
      const updated = [...prev.experience];
      const updatedBullets = [...updated[expIdx].bullets];
      updatedBullets[bIdx] = val;
      updated[expIdx] = { ...updated[expIdx], bullets: updatedBullets };
      return { ...prev, experience: updated };
    });
  };

  const addExpBullet = (expIdx: number) => {
    setResumeData((prev: any) => {
      const updated = [...prev.experience];
      updated[expIdx] = { ...updated[expIdx], bullets: [...updated[expIdx].bullets, ""] };
      return { ...prev, experience: updated };
    });
  };

  const removeExpBullet = (expIdx: number, bIdx: number) => {
    setResumeData((prev: any) => {
      const updated = [...prev.experience];
      updated[expIdx] = {
        ...updated[expIdx],
        bullets: updated[expIdx].bullets.filter((_: any, i: number) => i !== bIdx),
      };
      return { ...prev, experience: updated };
    });
  };

  const addExperience = () => {
    setResumeData((prev: any) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { role: "", company: "", duration: "", bullets: [""] },
      ],
    }));
  };

  const removeExperience = (idx: number) => {
    setResumeData((prev: any) => ({
      ...prev,
      experience: prev.experience.filter((_: any, i: number) => i !== idx),
    }));
  };

  // Project handlers
  const handlePrjChange = (idx: number, field: string, val: any) => {
    setResumeData((prev: any) => {
      const updated = [...prev.projects];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, projects: updated };
    });
  };

  const handlePrjBulletChange = (prjIdx: number, bIdx: number, val: string) => {
    setResumeData((prev: any) => {
      const updated = [...prev.projects];
      const updatedBullets = [...updated[prjIdx].bullets];
      updatedBullets[bIdx] = val;
      updated[prjIdx] = { ...updated[prjIdx], bullets: updatedBullets };
      return { ...prev, projects: updated };
    });
  };

  const addPrjBullet = (prjIdx: number) => {
    setResumeData((prev: any) => {
      const updated = [...prev.projects];
      updated[prjIdx] = { ...updated[prjIdx], bullets: [...updated[prjIdx].bullets, ""] };
      return { ...prev, projects: updated };
    });
  };

  const removePrjBullet = (prjIdx: number, bIdx: number) => {
    setResumeData((prev: any) => {
      const updated = [...prev.projects];
      updated[prjIdx] = {
        ...updated[prjIdx],
        bullets: updated[prjIdx].bullets.filter((_: any, i: number) => i !== bIdx),
      };
      return { ...prev, projects: updated };
    });
  };

  const addProject = () => {
    setResumeData((prev: any) => ({
      ...prev,
      projects: [
        ...prev.projects,
        { title: "", link: "", duration: "", bullets: [""] },
      ],
    }));
  };

  const removeProject = (idx: number) => {
    setResumeData((prev: any) => ({
      ...prev,
      projects: prev.projects.filter((_: any, i: number) => i !== idx),
    }));
  };

  // Education handlers
  const handleEduChange = (idx: number, field: string, val: string) => {
    setResumeData((prev: any) => {
      const updated = [...prev.education];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, education: updated };
    });
  };

  const addEducation = () => {
    setResumeData((prev: any) => ({
      ...prev,
      education: [
        ...prev.education,
        { degree: "", institution: "", duration: "", details: "" },
      ],
    }));
  };

  const removeEducation = (idx: number) => {
    setResumeData((prev: any) => ({
      ...prev,
      education: prev.education.filter((_: any, i: number) => i !== idx),
    }));
  };

  // Custom Sections handlers
  const handleCustomSectionChange = (idx: number, field: "title" | "content", val: string) => {
    setResumeData((prev: any) => {
      const updated = [...(prev.custom_sections || [])];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, custom_sections: updated };
    });
  };

  const addCustomSection = () => {
    setResumeData((prev: any) => ({
      ...prev,
      custom_sections: [
        ...(prev.custom_sections || []),
        { id: Math.random().toString(36).substring(2, 9), title: "", content: "" }
      ]
    }));
  };

  const removeCustomSection = (idx: number) => {
    setResumeData((prev: any) => ({
      ...prev,
      custom_sections: (prev.custom_sections || []).filter((_: any, i: number) => i !== idx)
    }));
  };

  // In-line STAR Bullet Point Enhancer Action
  const triggerStarEnhance = async (type: "exp" | "prj", itemIdx: number, bulletIdx: number, currentText: string) => {
    if (!currentText.trim()) {
      alert("Please enter some initial bullet point text first.");
      return;
    }
    setEnhancingIndex({ type, itemIdx, bulletIdx });
    setEnhancedSuggestions([]);
    setEnhancingStatus("AI STAR engine upgrading bullet point...");
    try {
      const data = await apiFetch<{ suggestions: string[] }>("/resume/rewrite-bullet", {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ bullet: currentText, tone: "Technical" }),
      });
      setEnhancedSuggestions(data.suggestions || []);
      setEnhancingStatus("Enhancements loaded! Select your favorite style below.");
    } catch (e) {
      console.error(e);
      setEnhancingStatus("Enhancement failed. Please try again.");
    }
  };

  const applyEnhancedBullet = (text: string) => {
    if (!enhancingIndex) return;
    const { type, itemIdx, bulletIdx } = enhancingIndex;
    if (type === "exp") {
      handleExpBulletChange(itemIdx, bulletIdx, text);
    } else {
      handlePrjBulletChange(itemIdx, bulletIdx, text);
    }
    // Clear state
    setEnhancingIndex(null);
    setEnhancedSuggestions([]);
    setEnhancingStatus("");
    setStatus("AI-enhanced STAR bullet point applied!");
  };

  // PDF sandboxed compilation
  const compilePdf = async () => {
    setCompiling(true);
    setStatus("Compiling high-fidelity ReportLab PDF...");
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/resume/compile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ latex_code: JSON.stringify(resumeData) }),
      });

      if (!res.ok) {
        throw new Error("ReportLab process compilation failed.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setStatus("Compilation complete! PDF preview synchronized.");
    } catch (e: any) {
      console.error(e);
      setStatus(e.message || "Compilation failed.");
    } finally {
      setCompiling(false);
    }
  };

  // Export to editable Word (.docx)
  const exportDocx = async () => {
    setExportingDocx(true);
    setStatus("Structuring and formatting Word template...");
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/resume/export-docx`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ latex_code: JSON.stringify(resumeData) }),
      });

      if (!res.ok) {
        throw new Error("Word file compilation failed.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${fileName}.docx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);

      setStatus("Success! Beautiful editable Word document downloaded.");
    } catch (e: any) {
      console.error(e);
      setStatus("Failed to export Word file.");
    } finally {
      setExportingDocx(false);
    }
  };

  // Save current builder details back to SQLite
  const saveResumeToDb = async () => {
    setSaving(true);
    setStatus("Saving template layout parameters to server...");
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/resume`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          file_name: fileName,
          content: JSON.stringify(resumeData),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to persist resume data.");
      }

      setStatus("Resume template parameters saved securely!");
    } catch (e: any) {
      console.error(e);
      setStatus("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  // Analyze Alignment against JD using Synonym-aware matcher
  const analyzeJdAlignment = async () => {
    if (!jdText) {
      setStatus("Please provide a target Job Description.");
      return;
    }
    setJdMatching(true);
    setStatus("Computing offline semantic overlap...");
    try {
      const resumeClearText = `
        ${resumeData.name} ${resumeData.summary}
        Skills: ${resumeData.skills.map((s: any) => `${s.category}: ${s.items}`).join(", ")}
        Experience: ${resumeData.experience.map((e: any) => `${e.role} at ${e.company}. ${e.bullets.join(" ")}`).join(" ")}
        Projects: ${resumeData.projects.map((p: any) => `${p.title}. ${p.bullets.join(" ")}`).join(" ")}
        ${(resumeData.custom_sections || []).map((c: any) => `${c.title}: ${c.content}`).join(" ")}
      `;

      const data = await apiFetch<any>("/resume/analyze-jd", {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({
          resume_content: resumeClearText,
          jd_content: jdText,
          target_role: jdRole || "Software Engineer"
        }),
      });
      setJdResult(data);
      setStatus("JD matching matrix synced!");
    } catch (e) {
      console.error(e);
      setStatus("Matching calculation failed.");
    } finally {
      setJdMatching(false);
    }
  };

  // Import Cryptographic Claims to Vault
  const verifyClaimBlock = async () => {
    if (!claimInput.trim()) {
      setClaimStatus("Please paste a cryptographic claim JSON block.");
      return;
    }
    setClaimVerifying(true);
    setClaimStatus("Decrypting and verifying credential signature...");
    try {
      const data = await apiFetch<any>("/resume/verify-claim", {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ claim_json: claimInput })
      });

      if (data.verified) {
        const updated = [...verifiedClaims.filter(c => c.signature !== data.claim.signature), data.claim];
        setVerifiedClaims(updated);
        localStorage.setItem("jobsvilla_verified_claims", JSON.stringify(updated));
        setClaimStatus("SUCCESS: Cryptographic verification validated! Badge applied.");
        setClaimInput("");
      } else {
        setClaimStatus(`REJECTED: ${data.error || "Signature invalid."}`);
      }
    } catch (e: any) {
      setClaimStatus(`ERROR: ${e.message || "Failed to contact verification server."}`);
    } finally {
      setClaimVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual Navigation Tabs */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          onClick={() => setActiveTab("builder")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === "builder"
              ? "border-emerald-400 text-emerald-400"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Sparkles size={16} />
          Interactive Resume Forge
        </button>
        <button
          onClick={() => setActiveTab("jd-matcher")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === "jd-matcher"
              ? "border-emerald-400 text-emerald-400"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Cpu size={16} />
          Synonym-Aware JD Matcher
        </button>
        <button
          onClick={() => setActiveTab("claims-vault")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === "claims-vault"
              ? "border-emerald-400 text-emerald-400"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <ShieldCheck size={16} />
          Verified Claims Vault
          {verifiedClaims.length > 0 && (
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* Main Workspace Panels */}
      {activeTab === "builder" && (
        <div className="grid gap-6 xl:grid-cols-[1fr_450px]">
          {/* Interactive Form Panel */}
          <section className="glass-3d bg-white/[0.02] p-6 rounded-2xl border border-white/10 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles size={20} className="text-emerald-400 animate-pulse" />
                    Structured Resume Forge
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Fill out locked template sections below to construct an ultra-ATS optimized resume.
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <input
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="resume_name"
                    className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 max-w-[140px] font-mono"
                  />
                  <button
                    onClick={saveResumeToDb}
                    disabled={saving}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 flex items-center gap-1 active:scale-95 transition"
                  >
                    {saving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                    Save Progress
                  </button>
                </div>
              </div>

              {/* Form Accordion Sections */}
              <div className="space-y-4">
                
                {/* SECTION 1: HEADER */}
                <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.01]">
                  <button
                    onClick={() => toggleSection("header")}
                    className="w-full flex items-center justify-between p-4 bg-white/5 text-sm font-bold text-white hover:bg-white/10 transition"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      1. Personal Header & Contact Info
                    </span>
                    {openSections.header ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openSections.header && (
                    <div className="p-4 space-y-4 grid md:grid-cols-2 gap-x-4 gap-y-3">
                      <div className="md:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Full Name</label>
                        <input
                          value={resumeData.name}
                          onChange={(e) => updateHeaderField("name", e.target.value)}
                          placeholder="e.g. Praful Kumar"
                          className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Email</label>
                        <input
                          value={resumeData.email}
                          onChange={(e) => updateHeaderField("email", e.target.value)}
                          placeholder="e.g. praful@email.com"
                          className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Phone</label>
                        <input
                          value={resumeData.phone}
                          onChange={(e) => updateHeaderField("phone", e.target.value)}
                          placeholder="e.g. +91 98765 43210"
                          className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Location</label>
                        <input
                          value={resumeData.location}
                          onChange={(e) => updateHeaderField("location", e.target.value)}
                          placeholder="e.g. Bangalore, India"
                          className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">LinkedIn URL</label>
                        <input
                          value={resumeData.linkedin_url}
                          onChange={(e) => updateHeaderField("linkedin_url", e.target.value)}
                          placeholder="https://linkedin.com/in/..."
                          className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">GitHub URL</label>
                        <input
                          value={resumeData.github_url}
                          onChange={(e) => updateHeaderField("github_url", e.target.value)}
                          placeholder="https://github.com/..."
                          className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Portfolio Link</label>
                        <input
                          value={resumeData.portfolio_url}
                          onChange={(e) => updateHeaderField("portfolio_url", e.target.value)}
                          placeholder="https://yourwebsite.dev"
                          className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION 2: PROFESSIONAL SUMMARY */}
                <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.01]">
                  <button
                    onClick={() => toggleSection("summary")}
                    className="w-full flex items-center justify-between p-4 bg-white/5 text-sm font-bold text-white hover:bg-white/10 transition"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      2. Professional Summary
                    </span>
                    {openSections.summary ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openSections.summary && (
                    <div className="p-4">
                      <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Elevator Pitch / Summary</label>
                      <textarea
                        value={resumeData.summary}
                        onChange={(e) => updateHeaderField("summary", e.target.value)}
                        rows={3}
                        placeholder="Write a brief, punchy overview of your core skills and achievements."
                        className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 transition resize-y"
                      />
                    </div>
                  )}
                </div>

                {/* SECTION 3: TECHNICAL SKILLS */}
                <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.01]">
                  <button
                    onClick={() => toggleSection("skills")}
                    className="w-full flex items-center justify-between p-4 bg-white/5 text-sm font-bold text-white hover:bg-white/10 transition"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      3. Technical Skills ({resumeData.skills.length})
                    </span>
                    {openSections.skills ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openSections.skills && (
                    <div className="p-4 space-y-4">
                      {resumeData.skills.map((skill: any, idx: number) => (
                        <div key={idx} className="flex gap-2 items-start p-3 border border-white/5 rounded-lg bg-zinc-950/40 relative">
                          <div className="flex-1 space-y-2">
                            <input
                              value={skill.category}
                              onChange={(e) => handleSkillChange(idx, "category", e.target.value)}
                              placeholder="e.g. Languages & Frameworks"
                              className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-1.5 text-xs text-white font-bold outline-none focus:border-emerald-500 transition"
                            />
                            <input
                              value={skill.items}
                              onChange={(e) => handleSkillChange(idx, "items", e.target.value)}
                              placeholder="e.g. Python, SQL, JavaScript"
                              className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 outline-none focus:border-emerald-500 transition"
                            />
                          </div>
                          <button
                            onClick={() => removeSkillCategory(idx)}
                            className="p-2 rounded bg-white/5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition shrink-0"
                            title="Remove Category"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={addSkillCategory}
                        className="w-full flex items-center justify-center gap-1 py-2 border border-dashed border-white/20 hover:border-emerald-400 text-xs text-zinc-300 hover:text-emerald-400 rounded-lg hover:bg-emerald-400/[0.02] transition font-bold"
                      >
                        <Plus size={14} />
                        Add Skills Group
                      </button>
                    </div>
                  )}
                </div>

                {/* SECTION 4: PROFESSIONAL EXPERIENCE */}
                <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.01]">
                  <button
                    onClick={() => toggleSection("experience")}
                    className="w-full flex items-center justify-between p-4 bg-white/5 text-sm font-bold text-white hover:bg-white/10 transition"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      4. Professional Experience ({resumeData.experience.length})
                    </span>
                    {openSections.experience ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openSections.experience && (
                    <div className="p-4 space-y-6">
                      {resumeData.experience.map((exp: any, idx: number) => (
                        <div key={idx} className="p-4 border border-white/10 rounded-xl bg-zinc-950/20 space-y-3 relative">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Role #{idx + 1}</span>
                            <button
                              onClick={() => removeExperience(idx)}
                              className="p-1.5 rounded bg-white/5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition"
                              title="Delete Role"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          
                          <div className="grid md:grid-cols-3 gap-2">
                            <div>
                              <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Role Title</label>
                              <input
                                value={exp.role}
                                onChange={(e) => handleExpChange(idx, "role", e.target.value)}
                                placeholder="e.g. Backend Engineer"
                                className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 transition"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Company</label>
                              <input
                                value={exp.company}
                                onChange={(e) => handleExpChange(idx, "company", e.target.value)}
                                placeholder="e.g. Google"
                                className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 transition"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Duration</label>
                              <input
                                value={exp.duration}
                                onChange={(e) => handleExpChange(idx, "duration", e.target.value)}
                                placeholder="e.g. Jan 2026 -- Present"
                                className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 transition"
                              />
                            </div>
                          </div>

                          {/* Bullet Points with inline STAR Enhancer */}
                          <div className="space-y-2 pt-2">
                            <span className="text-[9px] uppercase font-extrabold text-zinc-400 tracking-wide block">Impact Bullet Points</span>
                            {exp.bullets.map((bullet: string, bIdx: number) => (
                              <div key={bIdx} className="space-y-1">
                                <div className="flex gap-2 items-center">
                                  <span className="text-zinc-600 text-xs shrink-0">•</span>
                                  <input
                                    value={bullet}
                                    onChange={(e) => handleExpBulletChange(idx, bIdx, e.target.value)}
                                    placeholder="e.g. Led scaling operations to optimize SQL speed."
                                    className="flex-1 rounded-lg border border-white/10 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 outline-none focus:border-emerald-500 transition"
                                  />
                                  
                                  <button
                                    onClick={() => triggerStarEnhance("exp", idx, bIdx, bullet)}
                                    className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-zinc-950 text-[10px] font-bold transition flex items-center gap-1 shrink-0"
                                    title="AI STAR Enhancement"
                                  >
                                    <Cpu size={11} />
                                    AI Upgrade
                                  </button>
                                  
                                  <button
                                    onClick={() => removeExpBullet(idx, bIdx)}
                                    className="p-1.5 rounded bg-white/5 text-zinc-500 hover:text-red-400 transition shrink-0"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>

                                {/* Dynamic inline STAR recommendation list */}
                                {enhancingIndex?.type === "exp" &&
                                  enhancingIndex.itemIdx === idx &&
                                  enhancingIndex.bulletIdx === bIdx && (
                                    <div className="ml-5 p-3 rounded-lg border border-cyan-500/20 bg-zinc-950/80 space-y-2 mt-1 relative overflow-hidden">
                                      <div className="absolute top-0 left-0 bottom-0 w-0.5 bg-cyan-400" />
                                      <div className="text-[10px] font-bold text-cyan-400 flex items-center gap-1">
                                        <Sparkles size={11} className="animate-spin" />
                                        {enhancingStatus}
                                      </div>
                                      
                                      {enhancedSuggestions.length > 0 && (
                                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                          {enhancedSuggestions.map((sug, sIdx) => (
                                            <div
                                              key={sIdx}
                                              onClick={() => applyEnhancedBullet(sug)}
                                              className="p-2 border border-white/5 hover:border-cyan-400/30 hover:bg-cyan-500/[0.02] rounded bg-white/[0.02] cursor-pointer text-[10px] text-zinc-300 leading-relaxed transition"
                                            >
                                              {sug}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      <button 
                                        onClick={() => setEnhancingIndex(null)}
                                        className="text-[9px] font-bold text-zinc-500 hover:text-white"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  )}
                              </div>
                            ))}
                            <button
                              onClick={() => addExpBullet(idx)}
                              className="ml-5 flex items-center gap-1 text-[10px] text-emerald-400 hover:text-white transition font-bold"
                            >
                              <Plus size={11} />
                              Add Bullet Point
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={addExperience}
                        className="w-full flex items-center justify-center gap-1 py-2 border border-dashed border-white/20 hover:border-emerald-400 text-xs text-zinc-300 hover:text-emerald-400 rounded-lg hover:bg-emerald-400/[0.02] transition font-bold"
                      >
                        <Plus size={14} />
                        Add Professional Role
                      </button>
                    </div>
                  )}
                </div>

                {/* SECTION 5: PROJECTS */}
                <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.01]">
                  <button
                    onClick={() => toggleSection("projects")}
                    className="w-full flex items-center justify-between p-4 bg-white/5 text-sm font-bold text-white hover:bg-white/10 transition"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      5. Projects ({resumeData.projects.length})
                    </span>
                    {openSections.projects ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openSections.projects && (
                    <div className="p-4 space-y-6">
                      {resumeData.projects.map((prj: any, idx: number) => (
                        <div key={idx} className="p-4 border border-white/10 rounded-xl bg-zinc-950/20 space-y-3 relative">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Project #{idx + 1}</span>
                            <button
                              onClick={() => removeProject(idx)}
                              className="p-1.5 rounded bg-white/5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition"
                              title="Delete Project"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <div className="grid md:grid-cols-3 gap-2">
                            <div>
                              <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Project Name</label>
                              <input
                                value={prj.title}
                                onChange={(e) => handlePrjChange(idx, "title", e.target.value)}
                                placeholder="e.g. Cryptographic Core"
                                className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 transition"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Project Link / URL</label>
                              <input
                                value={prj.link}
                                onChange={(e) => handlePrjChange(idx, "link", e.target.value)}
                                placeholder="e.g. https://github.com/..."
                                className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 transition"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Duration / Date</label>
                              <input
                                value={prj.duration}
                                onChange={(e) => handlePrjChange(idx, "duration", e.target.value)}
                                placeholder="e.g. Fall 2025"
                                className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 transition"
                              />
                            </div>
                          </div>

                          {/* Project Bullet Points */}
                          <div className="space-y-2 pt-2">
                            <span className="text-[9px] uppercase font-extrabold text-zinc-400 tracking-wide block">Description / Impact</span>
                            {prj.bullets.map((bullet: string, bIdx: number) => (
                              <div key={bIdx} className="space-y-1">
                                <div className="flex gap-2 items-center">
                                  <span className="text-zinc-600 text-xs shrink-0">•</span>
                                  <input
                                    value={bullet}
                                    onChange={(e) => handlePrjBulletChange(idx, bIdx, e.target.value)}
                                    placeholder="e.g. Developed Ed25519 profile validation algorithms."
                                    className="flex-1 rounded-lg border border-white/10 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 outline-none focus:border-emerald-500 transition"
                                  />
                                  
                                  <button
                                    onClick={() => triggerStarEnhance("prj", idx, bIdx, bullet)}
                                    className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-zinc-950 text-[10px] font-bold transition flex items-center gap-1 shrink-0"
                                    title="AI STAR Enhancement"
                                  >
                                    <Cpu size={11} />
                                    AI Upgrade
                                  </button>
                                  
                                  <button
                                    onClick={() => removePrjBullet(idx, bIdx)}
                                    className="p-1.5 rounded bg-white/5 text-zinc-500 hover:text-red-400 transition shrink-0"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>

                                {enhancingIndex?.type === "prj" &&
                                  enhancingIndex.itemIdx === idx &&
                                  enhancingIndex.bulletIdx === bIdx && (
                                    <div className="ml-5 p-3 rounded-lg border border-cyan-500/20 bg-zinc-950/80 space-y-2 mt-1 relative overflow-hidden">
                                      <div className="absolute top-0 left-0 bottom-0 w-0.5 bg-cyan-400" />
                                      <div className="text-[10px] font-bold text-cyan-400 flex items-center gap-1">
                                        <Sparkles size={11} className="animate-spin" />
                                        {enhancingStatus}
                                      </div>
                                      
                                      {enhancedSuggestions.length > 0 && (
                                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                          {enhancedSuggestions.map((sug, sIdx) => (
                                            <div
                                              key={sIdx}
                                              onClick={() => applyEnhancedBullet(sug)}
                                              className="p-2 border border-white/5 hover:border-cyan-400/30 hover:bg-cyan-500/[0.02] rounded bg-white/[0.02] cursor-pointer text-[10px] text-zinc-300 leading-relaxed transition"
                                            >
                                              {sug}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      <button 
                                        onClick={() => setEnhancingIndex(null)}
                                        className="text-[9px] font-bold text-zinc-500 hover:text-white"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  )}
                              </div>
                            ))}
                            <button
                              onClick={() => addPrjBullet(idx)}
                              className="ml-5 flex items-center gap-1 text-[10px] text-emerald-400 hover:text-white transition font-bold"
                            >
                              <Plus size={11} />
                              Add Bullet Point
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={addProject}
                        className="w-full flex items-center justify-center gap-1 py-2 border border-dashed border-white/20 hover:border-emerald-400 text-xs text-zinc-300 hover:text-emerald-400 rounded-lg hover:bg-emerald-400/[0.02] transition font-bold"
                      >
                        <Plus size={14} />
                        Add Project Section
                      </button>
                    </div>
                  )}
                </div>

                {/* SECTION 6: EDUCATION */}
                <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.01]">
                  <button
                    onClick={() => toggleSection("education")}
                    className="w-full flex items-center justify-between p-4 bg-white/5 text-sm font-bold text-white hover:bg-white/10 transition"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      6. Education ({resumeData.education.length})
                    </span>
                    {openSections.education ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openSections.education && (
                    <div className="p-4 space-y-6">
                      {resumeData.education.map((edu: any, idx: number) => (
                        <div key={idx} className="p-4 border border-white/10 rounded-xl bg-zinc-950/20 space-y-3 relative">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Credential #{idx + 1}</span>
                            <button
                              onClick={() => removeEducation(idx)}
                              className="p-1.5 rounded bg-white/5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition"
                              title="Delete Education"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <div className="grid md:grid-cols-3 gap-2">
                            <div className="md:col-span-2">
                              <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Degree & Major</label>
                              <input
                                value={edu.degree}
                                onChange={(e) => handleEduChange(idx, "degree", e.target.value)}
                                placeholder="e.g. B.Tech in Computer Science"
                                className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 transition"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Duration / Years</label>
                              <input
                                value={edu.duration}
                                onChange={(e) => handleEduChange(idx, "duration", e.target.value)}
                                placeholder="e.g. 2022 -- 2026"
                                className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 transition"
                              />
                            </div>
                            <div className="md:col-span-3">
                              <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Institution</label>
                              <input
                                value={edu.institution}
                                onChange={(e) => handleEduChange(idx, "institution", e.target.value)}
                                placeholder="e.g. Indian Institute of Technology"
                                className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 transition"
                              />
                            </div>
                            <div className="md:col-span-3">
                              <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Grade details / Specializations</label>
                              <input
                                value={edu.details}
                                onChange={(e) => handleEduChange(idx, "details", e.target.value)}
                                placeholder="e.g. GPA: 9.2/10. Specialization in Cryptography."
                                className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 outline-none focus:border-emerald-500 transition"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={addEducation}
                        className="w-full flex items-center justify-center gap-1 py-2 border border-dashed border-white/20 hover:border-emerald-400 text-xs text-zinc-300 hover:text-emerald-400 rounded-lg hover:bg-emerald-400/[0.02] transition font-bold"
                      >
                        <Plus size={14} />
                        Add Academic Credential
                      </button>
                    </div>
                  )}
                </div>

                {/* SECTION 7: CUSTOM COLUMNS / SECTIONS */}
                <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.01]">
                  <button
                    onClick={() => toggleSection("customSections")}
                    className="w-full flex items-center justify-between p-4 bg-white/5 text-sm font-bold text-white hover:bg-white/10 transition"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      7. Custom Columns & Sections ({(resumeData.custom_sections || []).length})
                    </span>
                    {openSections.customSections ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openSections.customSections && (
                    <div className="p-4 space-y-6">
                      {(resumeData.custom_sections || []).map((section: any, idx: number) => (
                        <div key={section.id || idx} className="p-4 border border-white/10 rounded-xl bg-zinc-950/20 space-y-3 relative">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Custom Section #{idx + 1}</span>
                            <button
                              onClick={() => removeCustomSection(idx)}
                              className="p-1.5 rounded bg-white/5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition"
                              title="Delete Section"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Section Title</label>
                              <input
                                value={section.title}
                                onChange={(e) => handleCustomSectionChange(idx, "title", e.target.value)}
                                placeholder="e.g. Certifications / Achievements / Languages"
                                className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 transition"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Section Details / Content</label>
                              <textarea
                                value={section.content}
                                onChange={(e) => handleCustomSectionChange(idx, "content", e.target.value)}
                                placeholder="e.g. Google Certified Professional Architect (2026), Fluent in German..."
                                rows={4}
                                className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-zinc-300 outline-none focus:border-emerald-500 transition resize-y font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={addCustomSection}
                        className="w-full flex items-center justify-center gap-1 py-2 border border-dashed border-white/20 hover:border-emerald-400 text-xs text-zinc-300 hover:text-emerald-400 rounded-lg hover:bg-emerald-400/[0.02] transition font-bold"
                      >
                        <Plus size={14} />
                        Add Custom Section
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Form actions for Compiling / Exporting */}
            <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2">
                <button
                  onClick={compilePdf}
                  disabled={compiling}
                  className="neon-btn rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 text-xs font-bold text-zinc-950 flex items-center gap-2 shadow-lg shadow-emerald-500/10 hover:brightness-110 active:scale-95 transition"
                >
                  {compiling ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <FileText size={14} />
                  )}
                  Compile PDF
                </button>
                
                <button
                  onClick={exportDocx}
                  disabled={exportingDocx}
                  className="rounded-xl border border-white/10 hover:border-emerald-400/40 bg-zinc-950 px-5 py-3 text-xs font-bold text-white flex items-center gap-2 hover:bg-emerald-400/[0.02] active:scale-95 transition"
                >
                  {exportingDocx ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Download size={14} className="text-emerald-400" />
                  )}
                  Export Editable Word (.docx)
                </button>
              </div>

              {status && (
                <span className="text-[10px] font-bold text-zinc-400 bg-white/5 border border-white/10 rounded-lg px-3 py-2 max-w-sm truncate" title={status}>
                  {status}
                </span>
              )}
            </div>
          </section>

          {/* PDF Live Previewer Sidebar */}
          <aside className="space-y-6">
            <div className="glass-3d p-6 rounded-2xl border border-white/10 flex flex-col h-full justify-between min-h-[500px]">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    PDF Live Previewer
                  </span>
                  
                  {pdfUrl && (
                    <a
                      href={pdfUrl}
                      download={`${fileName}.pdf`}
                      className="flex items-center gap-1 text-xs text-emerald-400 hover:text-white transition font-bold"
                    >
                      <Download size={14} />
                      Download PDF
                    </a>
                  )}
                </div>

                {pdfUrl ? (
                  <iframe
                    src={pdfUrl}
                    className="w-full h-[480px] rounded-xl border border-white/10 bg-zinc-950/80"
                  />
                ) : (
                  <div className="w-full h-[480px] rounded-xl border border-dashed border-white/10 bg-zinc-950/20 flex flex-col items-center justify-center text-center p-6">
                    <FileText size={36} className="text-zinc-600 animate-pulse mb-3" />
                    <h5 className="font-bold text-sm text-zinc-400">No Compiled Output</h5>
                    <p className="text-xs text-zinc-600 mt-2 max-w-[200px] leading-relaxed">
                      Click "Compile PDF" to compile your structured resume template into a gorgeous double-column document!
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 text-[9px] text-zinc-500 leading-relaxed flex flex-col gap-1">
                <span>📄 Templates enforce locked professional structures for 100% ATS readability success.</span>
                <span>🔗 Dynamic active hyperreferences are clickable in both PDF and Word formats!</span>
              </div>
            </div>
          </aside>
        </div>
      )}

      {activeTab === "jd-matcher" && (
        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          {/* JD Alignment Checker inputs */}
          <section className="glass-3d bg-white/[0.02] p-6 rounded-2xl border border-white/10 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu size={20} className="text-emerald-400" />
              Synonym-Aware ATS Matcher
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Verify compatibility score indices between your credentials and corporate postings. Our local synonym matching mapper identifies relevant equivalents (e.g. maps <em>RDS</em> to <em>PostgreSQL</em>) automatically.
            </p>

            <div className="space-y-4 pt-2">
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                  Target Competency Role
                </label>
                <input
                  value={jdRole}
                  onChange={(e) => setJdRole(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-1">
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                    Job Description Content
                  </label>
                  <textarea
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    rows={12}
                    placeholder="Paste the corporate description text block..."
                    className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-xs leading-relaxed text-zinc-300 outline-none focus:border-emerald-500 transition resize-y"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-4">
              <button
                onClick={analyzeJdAlignment}
                disabled={jdMatching}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 text-sm font-bold text-zinc-950 flex items-center gap-2 hover:brightness-110 active:scale-95 transition"
              >
                {jdMatching ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Cpu size={14} />
                )}
                Analyze JD Fit Index
              </button>

              {status && (
                <span className="text-xs font-semibold text-zinc-300 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 max-w-sm truncate">
                  {status}
                </span>
              )}
            </div>
          </section>

          {/* JD Alignment Results */}
          <aside className="space-y-6">
            <div className="glass-3d p-6 rounded-2xl border border-white/10 flex flex-col justify-between h-full min-h-[480px]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-4">
                  Match Diagnostic Metrics
                </span>

                {jdResult ? (
                  <div className="space-y-4">
                    {/* Glowing circular metric indicator */}
                    <div className="flex flex-col items-center py-4 rounded-2xl bg-white/[0.02] border border-white/5">
                      <div className="relative flex items-center justify-center">
                        {/* Outer pulsing ring */}
                        <div className="absolute inset-0 rounded-full bg-emerald-400/10 blur-md animate-pulse" />
                        <div className="h-24 w-24 rounded-full border-4 border-emerald-400/20 flex flex-col items-center justify-center bg-zinc-950/80 z-10">
                          <span className="text-2xl font-black text-white">{jdResult.score}%</span>
                          <span className="text-[8px] uppercase tracking-widest font-extrabold text-emerald-400 mt-0.5">FIT LEVEL</span>
                        </div>
                      </div>
                      
                      <h4 className="mt-3 font-bold text-sm text-zinc-300 uppercase tracking-wide">
                        {jdResult.score >= 80 ? "🔥 Exceptionally Strong Match" : jdResult.score >= 50 ? "⚡ Good Base Match" : "⚠️ Needs Improvement"}
                      </h4>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-1.5">
                          Matched Concept Synonym Nodes ({jdResult.matched_skills.length})
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {jdResult.matched_skills.map((s: string) => (
                            <span key={s} className="rounded bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 text-[9px] text-emerald-300 uppercase font-mono font-bold">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-1.5">
                          Missing Conceptual Gaps ({jdResult.missing_skills.length})
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {jdResult.missing_skills.map((s: string) => (
                            <span key={s} className="rounded bg-red-400/10 border border-red-400/20 px-2 py-0.5 text-[9px] text-red-300 uppercase font-mono font-bold">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-white/5 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-zinc-400 block">
                          AI Refactoring Recommendations
                        </span>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">
                          For optimum ATS parse rates, add the highlighted missing concepts (like <span className="text-zinc-400 font-bold">{jdResult.missing_skills.slice(0, 3).join(", ") || "none"}</span>) into your Skills section.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 min-h-[300px]">
                    <Cpu size={36} className="text-zinc-700 animate-pulse mb-3" />
                    <h5 className="font-bold text-sm text-zinc-400">Alignment Undiagnosed</h5>
                    <p className="text-xs text-zinc-600 mt-2 max-w-[200px] leading-relaxed">
                      Enter job description details on the left, then click the Fit Index analyzer to execute comparisons.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-zinc-500 leading-relaxed">
                ⚡ Local semantic index matches conceptual equivalences, so exact spelling matches aren't required.
              </div>
            </div>
          </aside>
        </div>
      )}

      {activeTab === "claims-vault" && (
        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          {/* Claim block pasting */}
          <section className="glass-3d bg-white/[0.02] p-6 rounded-2xl border border-white/10 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-400 animate-pulse" />
              Verified Claims Vault
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              JobsVilla operates a decentralized professional trust network. Pasting cryptographically signed credential JSON blocks (issued by verified corporate recruiters or mentors) validates key accomplishments and grants profile verification badges.
            </p>

            <div className="space-y-3 pt-2">
              <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                Signed Claim JSON Block
              </label>
              <textarea
                value={claimInput}
                onChange={(e) => setClaimInput(e.target.value)}
                rows={10}
                placeholder={`Paste the signed JSON block here. Example:
{
  "candidate_name": "Praful",
  "candidate_email": "praful@example.com",
  "issuer_name": "Google",
  "issuer_domain": "google.com",
  "claim_title": "Software Engineering Intern",
  "skills": ["Python", "FastAPI", "Docker"],
  "tenure": "Jan 2026 - May 2026",
  "issued_at": "2026-05-23",
  "signature": "sig_mock_signature_code"
}`}
                className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3.5 text-xs leading-relaxed text-emerald-300 outline-none focus:border-emerald-500 transition resize-y font-mono"
              />
            </div>

            <div className="pt-2 flex items-center justify-between gap-4">
              <button
                onClick={verifyClaimBlock}
                disabled={claimVerifying}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 text-sm font-bold text-zinc-950 flex items-center gap-2 hover:brightness-110 active:scale-95 transition"
              >
                {claimVerifying ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <ShieldCheck size={14} />
                )}
                Verify & Vault Claim
              </button>

              {claimStatus && (
                <span className="text-xs font-semibold text-zinc-300 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 max-w-sm leading-relaxed">
                  {claimStatus}
                </span>
              )}
            </div>
          </section>

          {/* Active verified claims list */}
          <aside className="space-y-6">
            <div className="glass-3d p-6 rounded-2xl border border-white/10 flex flex-col justify-between h-full min-h-[420px]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-4">
                  Verified Talent Badges ({verifiedClaims.length})
                </span>

                {verifiedClaims.length > 0 ? (
                  <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                    {verifiedClaims.map((claim: any, idx: number) => (
                      <div
                        key={idx}
                        className="group relative p-4 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.02] hover:bg-emerald-400/[0.04] transition duration-200 space-y-2 overflow-hidden shadow-md shadow-emerald-500/5"
                      >
                        {/* High-fidelity Neon Pulse badge */}
                        <div className="flex justify-between items-start">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 border border-emerald-400/30 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-emerald-300">
                            <ShieldCheck size={10} className="animate-pulse" />
                            Verified Claims
                          </span>
                          <span className="text-[9px] text-zinc-500 font-bold uppercase">
                            {claim.tenure}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-extrabold text-sm text-white tracking-tight">
                            {claim.claim_title}
                          </h4>
                          <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                            Issued by {claim.issuer_name} (<span className="text-emerald-400 font-bold">{claim.issuer_domain}</span>)
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {claim.skills.map((s: string) => (
                            <span key={s} className="rounded bg-white/5 border border-white/5 px-2 py-0.5 text-[9px] text-zinc-400 uppercase font-bold">
                              {s}
                            </span>
                          ))}
                        </div>

                        <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[8px] text-zinc-500">
                          <span>Issued: {claim.issued_at}</span>
                          <span className="truncate max-w-[140px] text-emerald-400/60 font-mono">
                            Sig: {claim.signature}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 min-h-[250px]">
                    <ShieldCheck size={32} className="text-zinc-700 animate-pulse mb-3" />
                    <h5 className="font-bold text-sm text-zinc-400">Claims Vault Empty</h5>
                    <p className="text-xs text-zinc-600 mt-2 max-w-[200px] leading-relaxed">
                      Verify cryptographically signed claims from former employers to unlock glowing Verified profile badges.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 text-[9px] text-zinc-600 leading-relaxed">
                🔒 Cryptographic claims contain verified digital signatures guaranteeing they cannot be modified.
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
