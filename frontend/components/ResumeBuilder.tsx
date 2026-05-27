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
  const [activeTab, setActiveTab] = useState<"builder" | "ats-resume-score" | "claims-vault">("builder");
  const [asideMode, setAsideMode] = useState<"preview" | "live-ats">("live-ats");

  // Live real-time scoring states
  const [liveJd, setLiveJd] = useState("");
  const [liveRole, setLiveRole] = useState("");
  const [liveScoreResult, setLiveScoreResult] = useState<any | null>(null);
  const [liveScoring, setLiveScoring] = useState(false);

  // Tab 2: All-in-One ATS Scorer States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [atsResult, setAtsResult] = useState<any | null>(null);
  const [atsRunning, setAtsRunning] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

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

  const getResumeText = (data: any): string => {
    let text = "";
    text += `${data.name || ""}\n`;
    text += `${data.email || ""} | ${data.phone || ""} | ${data.location || ""}\n`;
    text += `${data.linkedin_url || ""} | ${data.github_url || ""} | ${data.portfolio_url || ""}\n\n`;
    text += `PROFESSIONAL SUMMARY\n${data.summary || ""}\n\n`;
    
    text += `TECHNICAL SKILLS\n`;
    if (Array.isArray(data.skills)) {
      data.skills.forEach((s: any) => {
        text += `${s.category || ""}: ${s.items || ""}\n`;
      });
    }
    text += `\n`;
    
    text += `PROFESSIONAL EXPERIENCE\n`;
    if (Array.isArray(data.experience)) {
      data.experience.forEach((e: any) => {
        text += `${e.role || ""} at ${e.company || ""} (${e.duration || ""})\n`;
        if (Array.isArray(e.bullets)) {
          e.bullets.forEach((b: any) => {
            text += `- ${b || ""}\n`;
          });
        }
      });
    }
    text += `\n`;
    
    text += `PROJECTS\n`;
    if (Array.isArray(data.projects)) {
      data.projects.forEach((p: any) => {
        text += `${p.title || ""} (${p.duration || ""})\n`;
        if (Array.isArray(p.bullets)) {
          p.bullets.forEach((b: any) => {
            text += `- ${b || ""}\n`;
          });
        }
      });
    }
    text += `\n`;
    
    text += `EDUCATION\n`;
    if (Array.isArray(data.education)) {
      data.education.forEach((edu: any) => {
        text += `${edu.degree || ""} - ${edu.institution || ""} (${edu.duration || ""})\n`;
        text += `${edu.details || ""}\n`;
      });
    }
    return text;
  };

  const runLiveAtsAnalysis = async () => {
    setLiveScoring(true);
    try {
      const resumeText = getResumeText(resumeData);
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/resume/analyze-jd`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          resume_content: resumeText,
          jd_content: liveJd,
          target_role: liveRole
        })
      });
      if (res.ok) {
        const data = await res.json();
        setLiveScoreResult(data);
      }
    } catch (e) {
      console.error("Live ATS analysis failed", e);
    } finally {
      setLiveScoring(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      runLiveAtsAnalysis();
    }, 1500);
    return () => clearTimeout(delayDebounce);
  }, [resumeData, liveJd, liveRole]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setStatus("Selected file: " + e.target.files[0].name);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (['pdf', 'docx', 'doc', 'txt'].includes(ext || '')) {
        setSelectedFile(file);
        setStatus("Selected file: " + file.name);
      } else {
        setStatus("Unsupported format. Please upload PDF, DOCX, DOC, or TXT.");
      }
    }
  };

  const runAtsResumeAnalysis = async () => {
    if (!selectedFile) {
      setStatus("Please select a resume file (PDF, Word, or TXT) first.");
      return;
    }
    
    setAtsRunning(true);
    setAtsResult(null);
    setStatus("Uploading and diagnosing resume file...");
    
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (jdRole) {
        formData.append("target_role", jdRole);
      }
      if (jdText) {
        formData.append("jd_content", jdText);
      }
      
      const res = await fetch(`${API_BASE_URL}/resume/upload-score`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error("Analysis failed on the server.");
      }
      
      const data = await res.json();
      setAtsResult(data);
      setStatus("ATS compatibility check completed successfully!");
    } catch (e: any) {
      console.error(e);
      setStatus("Analysis failed: " + (e.message || "Unknown error"));
    } finally {
      setAtsRunning(false);
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
          onClick={() => setActiveTab("ats-resume-score")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === "ats-resume-score"
              ? "border-emerald-400 text-emerald-400"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Cpu size={16} />
          ATS Resume Scorer
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
                <div className="resume-accordion-wrapper border border-white/10 rounded-xl overflow-hidden bg-white/[0.01]">
                  <button
                    onClick={() => toggleSection("header")}
                    className="resume-accordion-header w-full flex items-center justify-between p-4 bg-white/5 text-sm font-bold text-white hover:bg-white/10 transition"
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
                <div className="resume-accordion-wrapper border border-white/10 rounded-xl overflow-hidden bg-white/[0.01]">
                  <button
                    onClick={() => toggleSection("summary")}
                    className="resume-accordion-header w-full flex items-center justify-between p-4 bg-white/5 text-sm font-bold text-white hover:bg-white/10 transition"
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
                <div className="resume-accordion-wrapper border border-white/10 rounded-xl overflow-hidden bg-white/[0.01]">
                  <button
                    onClick={() => toggleSection("skills")}
                    className="resume-accordion-header w-full flex items-center justify-between p-4 bg-white/5 text-sm font-bold text-white hover:bg-white/10 transition"
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
                        <div key={idx} className="resume-section-card flex gap-2 items-start p-3 border border-white/5 rounded-lg bg-zinc-950/40 relative">
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
                <div className="resume-accordion-wrapper border border-white/10 rounded-xl overflow-hidden bg-white/[0.01]">
                  <button
                    onClick={() => toggleSection("experience")}
                    className="resume-accordion-header w-full flex items-center justify-between p-4 bg-white/5 text-sm font-bold text-white hover:bg-white/10 transition"
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
                        <div key={idx} className="resume-section-card p-4 border border-white/10 rounded-xl bg-zinc-950/20 space-y-3 relative">
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
                <div className="resume-accordion-wrapper border border-white/10 rounded-xl overflow-hidden bg-white/[0.01]">
                  <button
                    onClick={() => toggleSection("projects")}
                    className="resume-accordion-header w-full flex items-center justify-between p-4 bg-white/5 text-sm font-bold text-white hover:bg-white/10 transition"
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
                        <div key={idx} className="resume-section-card p-4 border border-white/10 rounded-xl bg-zinc-950/20 space-y-3 relative">
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
                <div className="resume-accordion-wrapper border border-white/10 rounded-xl overflow-hidden bg-white/[0.01]">
                  <button
                    onClick={() => toggleSection("education")}
                    className="resume-accordion-header w-full flex items-center justify-between p-4 bg-white/5 text-sm font-bold text-white hover:bg-white/10 transition"
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
                        <div key={idx} className="resume-section-card p-4 border border-white/10 rounded-xl bg-zinc-950/20 space-y-3 relative">
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
                <div className="resume-accordion-wrapper border border-white/10 rounded-xl overflow-hidden bg-white/[0.01]">
                  <button
                    onClick={() => toggleSection("customSections")}
                    className="resume-accordion-header w-full flex items-center justify-between p-4 bg-white/5 text-sm font-bold text-white hover:bg-white/10 transition"
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
                        <div key={section.id || idx} className="resume-section-card p-4 border border-white/10 rounded-xl bg-zinc-950/20 space-y-3 relative">
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
                  className="rounded-xl border border-white/10 hover:border-emerald-400/40 bg-zinc-950 px-5 py-3 text-xs font-bold text-white-force text-white flex items-center gap-2 hover:bg-emerald-400/[0.02] active:scale-95 transition"
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

          {/* PDF Live Previewer & Live ATS Scorer Aside Sidebar */}
          <aside className="space-y-6">
            <div className="glass-3d p-6 rounded-2xl border border-white/10 flex flex-col h-full justify-between min-h-[550px]">
              <div>
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                  <div className="flex rounded-lg bg-zinc-950 p-1 border border-white/5">
                    <button
                      type="button"
                      onClick={() => setAsideMode("preview")}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition ${
                        asideMode === "preview"
                          ? "bg-white/10 text-white"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      PDF Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => setAsideMode("live-ats")}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition flex items-center gap-1 ${
                        asideMode === "live-ats"
                          ? "bg-white/10 text-white animate-pulse"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Cpu size={10} className="text-emerald-400" />
                      Live ATS Scorer
                    </button>
                  </div>
                  
                  {asideMode === "preview" && pdfUrl && (
                    <a
                      href={pdfUrl}
                      download={`${fileName}.pdf`}
                      className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-white transition font-bold"
                    >
                      <Download size={12} />
                      Download PDF
                    </a>
                  )}
                </div>

                {asideMode === "preview" ? (
                  pdfUrl ? (
                    <iframe
                      src={pdfUrl}
                      className="w-full h-[480px] rounded-xl border border-white/10 bg-zinc-950/80"
                    />
                  ) : (
                    <div className="w-full h-[480px] rounded-xl border border-dashed border-white/10 bg-zinc-950/20 flex flex-col items-center justify-center text-center p-6">
                      <FileText size={36} className="text-zinc-600 animate-pulse mb-3" />
                      <h5 className="font-bold text-sm text-zinc-400">No Compiled Output</h5>
                      <p className="text-xs text-zinc-600 mt-2 max-w-[200px] leading-relaxed">
                        Click "Compile PDF" to compile your structured resume template into a gorgeous document!
                      </p>
                    </div>
                  )
                ) : (
                  // Live ATS Scoring Cockpit Panel
                  <div className="space-y-4">
                    {/* Live Scorer Targets */}
                    <div className="p-3 rounded-xl border border-white/5 bg-zinc-950/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">
                          Target JD Matcher Context
                        </span>
                        {liveScoring && (
                          <span className="text-[8px] font-mono text-emerald-400 animate-pulse flex items-center gap-1">
                            <RefreshCw size={8} className="animate-spin" /> Recalculating...
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2">
                          <input
                            value={liveRole}
                            onChange={(e) => setLiveRole(e.target.value)}
                            placeholder="Target Role (e.g. Senior DevOps Engineer)"
                            className="w-full rounded-lg border border-white/10 bg-zinc-950 px-2 py-1.5 text-[10px] text-white outline-none focus:border-emerald-500 transition"
                          />
                        </div>
                        <div className="col-span-2">
                          <textarea
                            value={liveJd}
                            onChange={(e) => setLiveJd(e.target.value)}
                            rows={3}
                            placeholder="Paste Job Description (Optional - blank triggers generic baseline checklists)..."
                            className="w-full rounded-lg border border-white/10 bg-zinc-950 px-2 py-1.5 text-[10px] leading-normal text-zinc-300 outline-none focus:border-emerald-500 transition resize-y font-sans"
                          />
                        </div>
                      </div>
                    </div>

                    {liveScoreResult ? (
                      <div className="space-y-3">
                        {/* Overall Circular Meter Block */}
                        <div className="flex items-center gap-4 p-3 rounded-xl border border-white/5 bg-white/[0.01] relative overflow-hidden">
                          <div className="absolute inset-0 bg-emerald-500/[0.01] blur-md" />
                          <div className={`h-16 w-16 rounded-full border-2 flex flex-col items-center justify-center bg-zinc-950/80 shrink-0 z-10 ${
                            liveScoreResult.ats_score >= 70 ? "border-emerald-400/40" : liveScoreResult.ats_score >= 50 ? "border-cyan-400/40" : "border-red-400/40"
                          }`}>
                            <span className="text-sm font-black text-white">{liveScoreResult.ats_score}%</span>
                            <span className="text-[6px] uppercase tracking-widest font-black text-emerald-400 leading-none">ATS</span>
                          </div>
                          
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold ${
                                liveScoreResult.grade?.startsWith("A") ? "text-emerald-400" : liveScoreResult.grade?.startsWith("B") ? "text-cyan-400" : "text-yellow-400"
                              }`}>
                                Live Grade: {liveScoreResult.grade || "—"}
                              </span>
                              <span className="text-[8px] uppercase tracking-widest font-black text-zinc-500 bg-white/5 border border-white/5 rounded px-1.5 py-0.5">
                                {liveScoreResult.seniority?.jd_level || "Generic"}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-400 truncate">
                              Detected Domain: <span className="text-zinc-200 font-bold">{liveScoreResult.seniority?.jd_domain || liveScoreResult.matched_keywords?.[0] || "Backend"}</span>
                            </p>
                          </div>
                        </div>

                        {/* Domain-Aware Checklist Categories */}
                        {liveScoreResult.missing_by_category && (
                          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                            {/* Category 1: Seniority & Architecture Gaps */}
                            {liveScoreResult.missing_by_category["Seniority & Architecture"]?.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[8px] uppercase font-black text-red-400 tracking-wider flex items-center gap-1">
                                  ⚠️ Architecture & Seniority Gaps (Critical)
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {liveScoreResult.missing_by_category["Seniority & Architecture"].map((kw: string) => (
                                    <span key={kw} className="text-[8px] font-bold bg-red-500/10 border border-red-500/20 text-red-300 rounded px-1.5 py-0.5">
                                      {kw}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Category 2: Core Technical Gaps */}
                            {liveScoreResult.missing_by_category["Core Technical"]?.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[8px] uppercase font-black text-orange-400 tracking-wider flex items-center gap-1">
                                  🔧 Core Tech Skills (Missing)
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {liveScoreResult.missing_by_category["Core Technical"].map((kw: string) => (
                                    <span key={kw} className="text-[8px] font-bold bg-orange-500/10 border border-orange-500/20 text-orange-300 rounded px-1.5 py-0.5">
                                      {kw}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Category 3: Soft Skills / Methodologies */}
                            {liveScoreResult.missing_by_category["Soft Skills & Methodologies"]?.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[8px] uppercase font-black text-cyan-400 tracking-wider flex items-center gap-1">
                                  📋 Delivery & Soft Skills (Missing)
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {liveScoreResult.missing_by_category["Soft Skills & Methodologies"].map((kw: string) => (
                                    <span key={kw} className="text-[8px] font-bold bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 rounded px-1.5 py-0.5">
                                      {kw}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Matched Keywords Box */}
                            {liveScoreResult.matched_keywords?.length > 0 && (
                              <div className="space-y-1 pt-1 border-t border-white/5">
                                <span className="text-[8px] uppercase font-black text-emerald-400 tracking-wider">
                                  ✅ Matched Skills ({liveScoreResult.matched_keywords.length})
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {liveScoreResult.matched_keywords.map((kw: string) => (
                                    <span key={kw} className="text-[8px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded px-1.5 py-0.5">
                                      {kw}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Priority Recommendations Checklist */}
                        {liveScoreResult.action_plan?.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-white/5">
                            <span className="text-[8px] uppercase font-black text-zinc-400 tracking-wider">
                              Real-Time ATS Recommendations
                            </span>
                            <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                              {liveScoreResult.action_plan.slice(0, 3).map((act: any, aIdx: number) => (
                                <div key={aIdx} className="p-2 border border-white/5 rounded-lg bg-zinc-950/40 text-[9px] text-zinc-300 leading-normal flex items-start gap-1.5">
                                  <AlertCircle size={10} className="text-cyan-400 shrink-0 mt-0.5" />
                                  <span>{act.action}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-40 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-4">
                        <Cpu size={24} className="text-zinc-600 animate-bounce mb-2" />
                        <h6 className="text-[10px] font-bold text-zinc-400">Syncing Live Optimizer...</h6>
                        <p className="text-[9px] text-zinc-500 mt-1 max-w-[180px]">
                          Enter summary, skills, or experience to dynamically generate the live ATS compatibility grade.
                        </p>
                      </div>
                    )}
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

      {activeTab === "ats-resume-score" && (
        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          {/* Diagnostic Inputs Panel */}
          <section className="glass-3d bg-white/[0.02] p-6 rounded-2xl border border-white/10 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Cpu size={20} className="text-emerald-400" />
                All-in-One ATS Resume Scorer
              </h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Ingest your resume to score compatibility against the strict parsing pipelines of Workday, Greenhouse, iCIMS, Lever, and LinkedIn Easy Apply.
              </p>
            </div>

            {/* Premium Upload Dropzone */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                1. Upload Resume Document
              </span>
              
              {!selectedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("ats-file-picker")?.click()}
                  className={`h-40 rounded-2xl border border-dashed flex flex-col items-center justify-center p-6 text-center transition cursor-pointer select-none ${
                    isDragOver
                      ? "border-emerald-400 bg-emerald-400/5 shadow-lg shadow-emerald-500/5 scale-[0.99]"
                      : "border-white/15 bg-zinc-950/20 hover:border-emerald-500/40 hover:bg-zinc-950/40"
                  }`}
                >
                  <input
                    id="ats-file-picker"
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <FileText size={28} className={`mb-3 ${isDragOver ? "text-emerald-400 animate-bounce" : "text-zinc-500"}`} />
                  <span className="text-xs text-zinc-300 font-bold">
                    Drag & drop your resume file here
                  </span>
                  <span className="text-[10px] text-zinc-500 mt-1.5 leading-normal max-w-[240px]">
                    Supports standard PDF, Word (.docx, .doc), or plain text formats up to 5MB.
                  </span>
                </div>
              ) : (
                <div className="glass-3d bg-emerald-500/[0.02] border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate leading-tight" title={selectedFile.name}>
                        {selectedFile.name}
                      </p>
                      <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-black mt-1">
                        {(selectedFile.size / 1024).toFixed(1)} KB  •  {selectedFile.name.split('.').pop()?.toUpperCase()} Ready
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setAtsResult(null);
                    }}
                    className="p-2 rounded-xl bg-white/5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition shrink-0"
                    title="Remove File"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Target Job Context (Inputs) */}
            <div className="space-y-4 pt-2 border-t border-white/5">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                2. Target Job Context (Optional)
              </span>

              <div>
                <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">
                  Target Competency Role
                </label>
                <input
                  value={jdRole}
                  onChange={(e) => setJdRole(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-xs text-white outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">
                  Target Job Description Content
                </label>
                <textarea
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  rows={6}
                  placeholder="Paste the corporate description text block to enable matching keyword gap analytics..."
                  className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-xs leading-relaxed text-zinc-300 outline-none focus:border-emerald-500 transition resize-y font-sans"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-4">
              <button
                onClick={runAtsResumeAnalysis}
                disabled={atsRunning || !selectedFile}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3.5 text-xs font-bold text-zinc-950 flex items-center gap-2 hover:brightness-110 active:scale-95 transition disabled:opacity-50"
              >
                {atsRunning ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Cpu size={14} />
                )}
                Analyze ATS Score
              </button>

              {status && (
                <span className="text-[10px] font-bold text-zinc-400 bg-white/5 border border-white/10 rounded-lg px-3 py-2 max-w-sm truncate" title={status}>
                  {status}
                </span>
              )}
            </div>
          </section>

          {/* Diagnostic Results Sidebar */}
          <aside className="space-y-6">
            <div className="glass-3d p-6 rounded-2xl border border-white/10 flex flex-col justify-between h-full min-h-[480px]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-4">
                  ATS Diagnostic Report
                </span>

                {atsResult ? (
                  <div className="space-y-5">
                    {/* ── Main Score Gauge ── */}
                    <div className="flex flex-col items-center py-4 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
                      <div className="absolute inset-0 bg-emerald-500/[0.02] blur-xl" />
                      <div className="relative flex items-center justify-center mb-2">
                        <div className="absolute inset-0 rounded-full bg-emerald-400/10 blur-md animate-pulse" />
                        <div className={`h-24 w-24 rounded-full border-4 flex flex-col items-center justify-center bg-zinc-950/80 z-10 ${
                          atsResult.ats_score >= 70 ? "border-emerald-400/40" : atsResult.ats_score >= 50 ? "border-cyan-400/40" : "border-red-400/40"
                        }`}>
                          <span className="text-2xl font-black text-white">{atsResult.ats_score}%</span>
                          <span className="text-[8px] uppercase tracking-widest font-extrabold text-emerald-400 mt-0.5">ATS SCORE</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-lg font-black ${atsResult.grade?.startsWith("A") ? "text-emerald-400" : atsResult.grade?.startsWith("B") ? "text-cyan-400" : atsResult.grade?.startsWith("C") ? "text-yellow-400" : "text-red-400"}`}>
                          Grade: {atsResult.grade || "—"}
                        </span>
                      </div>
                      <h4 className="mt-1 font-bold text-xs text-zinc-300 uppercase tracking-wider leading-none">
                        {atsResult.ats_score >= 80 ? "🔥 Exceptionally Strong Match" : atsResult.ats_score >= 60 ? "⚡ Good Match" : atsResult.ats_score >= 40 ? "⚠️ Needs Improvement" : "❌ High Rejection Risk"}
                      </h4>
                    </div>

                    {/* ── Knockout Risk Alerts ── */}
                    {atsResult.knockout_risks?.triggered && (
                      <div className="space-y-2">
                        <span className="text-[9px] font-black uppercase text-red-400 tracking-wider block flex items-center gap-1">
                          🚨 Knockout Risk — Auto-Rejection Triggers ({atsResult.knockout_risks.triggers?.length})
                        </span>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {atsResult.knockout_risks.triggers?.map((t: any, i: number) => (
                            <div key={i} className="p-2 rounded-lg bg-red-500/[0.05] border border-red-500/20 space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${t.severity === "CRITICAL" ? "bg-red-500/20 text-red-300" : "bg-orange-500/20 text-orange-300"}`}>
                                  {t.severity}
                                </span>
                                <span className="text-[9px] font-bold text-zinc-300">{t.rule}</span>
                              </div>
                              <p className="text-[9px] text-zinc-400 leading-relaxed">{t.detail}</p>
                              <span className="text-[8px] text-zinc-500">Platforms: {t.platform_impact}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Score Breakdown Bars ── */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block">Score Breakdown</span>
                      {[
                        { label: "Keyword Match", val: atsResult.keyword_score },
                        { label: "Formatting", val: atsResult.formatting_score },
                        { label: "Structure", val: atsResult.structure_score },
                        { label: "Content Quality", val: atsResult.quality_score },
                      ].map(item => (
                        <div key={item.label} className="flex items-center gap-2">
                          <span className="text-[9px] text-zinc-400 w-28 shrink-0">{item.label}</span>
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${item.val >= 70 ? "bg-emerald-500" : item.val >= 50 ? "bg-cyan-500" : "bg-red-500"}`}
                              style={{ width: `${Math.min(item.val, 100)}%` }}
                            />
                          </div>
                          <span className={`text-[10px] font-black w-8 text-right ${item.val >= 70 ? "text-emerald-400" : item.val >= 50 ? "text-cyan-400" : "text-red-400"}`}>
                            {Math.round(item.val)}%
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* ── 7-Platform Compatibility ── */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block">
                        7-Platform ATS Compatibility
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {Object.entries(atsResult.platform_compatibility || {}).map(([key, plat]: [string, any]) => {
                          const name = key === "linkedin_easy_apply" ? "LinkedIn" : key === "smartrecruiters" ? "SmartRecruit" : key.charAt(0).toUpperCase() + key.slice(1);
                          const score = typeof plat === "number" ? plat : plat?.score ?? 0;
                          const grade = typeof plat === "object" && plat?.grade ? plat.grade : score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B+" : score >= 60 ? "B" : score >= 50 ? "C+" : "C";
                          const risk = typeof plat === "object" ? plat?.risk : score < 40 ? "HIGH" : score < 60 ? "MEDIUM" : "LOW";
                          return (
                            <div key={key} className="p-2 rounded-lg border border-white/5 bg-zinc-950/60">
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="text-[8px] font-bold text-zinc-400 truncate">{name}</span>
                                <span className={`text-[8px] font-black px-1 rounded ${risk === "HIGH" ? "bg-red-500/20 text-red-300" : risk === "MEDIUM" ? "bg-yellow-500/20 text-yellow-300" : "bg-emerald-500/20 text-emerald-300"}`}>{grade}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${score >= 70 ? "bg-emerald-500" : score >= 50 ? "bg-cyan-500" : "bg-red-500"}`} style={{ width: `${Math.min(score, 100)}%` }} />
                                </div>
                                <span className={`text-[10px] font-black ${score >= 70 ? "text-emerald-400" : score >= 50 ? "text-cyan-400" : "text-red-400"}`}>{score}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* ── Seniority & YoE ── */}
                    {atsResult.seniority && (
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block">Seniority & Experience</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                            <span className="text-[8px] text-zinc-500 block">Resume Level</span>
                            <span className="text-[10px] font-bold text-cyan-400">{atsResult.seniority.resume_level}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                            <span className="text-[8px] text-zinc-500 block">JD Level</span>
                            <span className="text-[10px] font-bold text-emerald-400">{atsResult.seniority.jd_level}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                            <span className="text-[8px] text-zinc-500 block">Total YoE</span>
                            <span className="text-[10px] font-bold text-white">{atsResult.experience_analysis?.total_years ?? "—"} yrs</span>
                          </div>
                          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                            <span className="text-[8px] text-zinc-500 block">Jobs Detected</span>
                            <span className="text-[10px] font-bold text-white">{atsResult.experience_analysis?.job_count ?? "—"}</span>
                          </div>
                        </div>
                        {(atsResult.experience_analysis?.employment_gaps?.length ?? 0) > 0 && (
                          <div className="text-[9px] text-yellow-400 bg-yellow-500/[0.05] border border-yellow-500/20 rounded-lg px-2 py-1.5 leading-relaxed">
                            ⚠️ {atsResult.experience_analysis.employment_gaps.length} employment gap(s) detected — Workday ML flags these for recruiter review.
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── Content Quality ── */}
                    {atsResult.content_quality && (
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block">Content Quality</span>
                        <div className="grid grid-cols-3 gap-1.5 text-center">
                          <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/5">
                            <span className="text-[8px] text-zinc-500 block">Quantified</span>
                            <span className={`text-[11px] font-black ${(atsResult.content_quality.quantified_bullets_pct ?? 0) >= 40 ? "text-emerald-400" : "text-red-400"}`}>{atsResult.content_quality.quantified_bullets_pct ?? 0}%</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/5">
                            <span className="text-[8px] text-zinc-500 block">Action Verbs</span>
                            <span className="text-[11px] font-black text-cyan-400">{atsResult.content_quality.strong_action_verbs ?? 0}</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/5">
                            <span className="text-[8px] text-zinc-500 block">Passive</span>
                            <span className={`text-[11px] font-black ${(atsResult.content_quality.weak_passive_phrases ?? 0) > 2 ? "text-red-400" : "text-emerald-400"}`}>{atsResult.content_quality.weak_passive_phrases ?? 0}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── Keyword Intelligence ── */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      {(atsResult.matched_keywords?.length ?? 0) > 0 && (
                        <div>
                          <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block mb-1">
                            ✅ Matched Keywords ({atsResult.matched_keywords.length})
                          </span>
                          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pr-1">
                            {atsResult.matched_keywords.map((s: string) => (
                              <span key={s} className="rounded bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 text-[8px] text-emerald-300 font-mono font-bold">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {(atsResult.missing_keywords?.length ?? 0) > 0 && (
                        <div>
                          <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block mb-1">
                            ❌ Missing Keywords ({atsResult.missing_keywords.length})
                          </span>
                          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pr-1">
                            {atsResult.missing_keywords.map((s: string) => (
                              <span key={s} className="rounded bg-red-400/10 border border-red-400/20 px-2 py-0.5 text-[8px] text-red-300 font-mono font-bold">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ── Priority Action Plan ── */}
                    {(atsResult.action_plan?.length ?? 0) > 0 && (
                      <div className="pt-2.5 border-t border-white/5 space-y-1.5">
                        <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block">
                          🎯 Priority Action Plan
                        </span>
                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                          {atsResult.action_plan.map((item: any, i: number) => (
                            <div key={i} className={`p-2 rounded-lg border text-[9px] leading-relaxed ${
                              item.impact === "CRITICAL" ? "bg-red-500/[0.04] border-red-500/20 text-red-300" :
                              item.impact === "HIGH" ? "bg-orange-500/[0.04] border-orange-500/20 text-orange-300" :
                              "bg-zinc-900/60 border-white/5 text-zinc-400"
                            }`}>
                              <span className={`text-[7px] font-black uppercase rounded px-1 mr-1.5 ${
                                item.impact === "CRITICAL" ? "bg-red-500/20 text-red-300" :
                                item.impact === "HIGH" ? "bg-orange-500/20 text-orange-300" :
                                "bg-white/5 text-zinc-500"
                              }`}>{item.impact}</span>
                              {item.action}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Formatting issues */}
                    {(atsResult.formatting_issues?.length ?? 0) > 0 && (
                      <div className="pt-2 border-t border-white/5">
                        <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block mb-1.5">Formatting Issues</span>
                        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                          {atsResult.formatting_issues.map((issue: any, i: number) => (
                            <div key={i} className="text-[9px] text-zinc-400 leading-relaxed pl-3 border-l-2 border-red-500/40 py-0.5">
                              <span className="font-bold text-red-400">[{issue.severity}]</span> {issue.fix}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 min-h-[300px]">
                    <Cpu size={36} className="text-zinc-700 animate-pulse mb-3" />
                    <h5 className="font-bold text-sm text-zinc-400">Diagnosis Pending</h5>
                    <p className="text-xs text-zinc-600 mt-2 max-w-[200px] leading-relaxed">
                      Upload your resume and click "Analyze ATS Score" to run 7-platform diagnostics.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 text-[9px] text-zinc-500 leading-relaxed">
                ⚡ Research-backed engine simulates Workday, Greenhouse, Lever, iCIMS, Taleo, LinkedIn & SmartRecruiters scoring algorithms.
              </div>
            </div>
          </aside>
        </div>
      )}


    </div>
  );
}

