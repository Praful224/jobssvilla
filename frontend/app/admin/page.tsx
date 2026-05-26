"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Briefcase,
  Trash2,
  ShieldAlert,
  Sparkles,
  Send,
  MapPin,
  DollarSign,
  RefreshCw,
  BarChart2,
  Bell,
  ShieldCheck,
  Copy,
  Check,
  Users,
  Key,
  Search
} from "lucide-react";
import { apiFetch, getToken, Job, jsonHeaders } from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { TiltCard } from "@/components/TiltCard";
import { motion, AnimatePresence } from "framer-motion";

const emptyJob = {
  company: "",
  role: "",
  location: "",
  salary: "",
  skills: "",
  apply_link: "",
  description: "",
};

interface Candidate {
  id: number;
  name: string;
  email: string;
  role: string;
  hireability_index: number;
  verified_claims_count: number;
}

export default function AdminPage() {
  const router = useRouter();
  
  // Navigation & Workspace Tabs
  const [activeTab, setActiveTab] = useState<"jobs" | "broadcast" | "vetting" | "users">("jobs");
  
  // Job opportunities state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [form, setForm] = useState(emptyJob);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [quickPaste, setQuickPaste] = useState("");

  // Candidate directory state
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  // General Users directory state
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userActionStatus, setUserActionStatus] = useState("");

  // Direct and Global Alert states
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isGlobal, setIsGlobal] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertPriority, setAlertPriority] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState("");
  const [broadcastError, setBroadcastError] = useState("");



  // Vetting Queue State
  const [vettingQueue, setVettingQueue] = useState<any[]>([]);
  const [loadingVetting, setLoadingVetting] = useState(false);
  const [vettingStatusMsg, setVettingStatusMsg] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    loadJobs();
    loadCandidates();
    loadVettingQueue();
    loadAllUsers();
  }, [router]);

  const loadJobs = async () => {
    setRefreshing(true);
    try {
      const data = await apiFetch<Job[]>("/jobs");
      setJobs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load jobs", e);
    } finally {
      setRefreshing(false);
    }
  };

  const loadCandidates = async () => {
    setLoadingCandidates(true);
    try {
      // Retrieve the candidate database entries using authorized session headers
      const data = await apiFetch<Candidate[]>("/recruiter/candidates", { auth: true });
      setCandidates(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load candidates directory", e);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const loadAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await apiFetch<any[]>("/admin/users", { auth: true });
      setAllUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load users directory", e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleToggleBlock = async (userId: number, currentBlockStatus: boolean) => {
    setUserActionStatus("");
    try {
      const res: any = await apiFetch("/admin/toggle-block-user", {
        auth: true,
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ user_id: userId, block: !currentBlockStatus })
      });
      setUserActionStatus(res?.message || "User status updated successfully!");
      loadAllUsers();
      loadCandidates();
      setTimeout(() => setUserActionStatus(""), 3500);
    } catch (e: any) {
      console.error("Failed to block/unblock user", e);
      setUserActionStatus(e.message || "Block action failed.");
      setTimeout(() => setUserActionStatus(""), 3500);
    }
  };

  const loadVettingQueue = async () => {
    setLoadingVetting(true);
    try {
      const data = await apiFetch<any[]>("/admin/pending-verifications", { auth: true });
      setVettingQueue(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load vetting queue", e);
    } finally {
      setLoadingVetting(false);
    }
  };

  const handleVerifyRole = async (id: number, userId: number, role: string, approve: boolean) => {
    setVettingStatusMsg("");
    try {
      const res: any = await apiFetch("/admin/verify-role", {
        auth: true,
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ id, user_id: userId, requested_role: role, approve })
      });
      setVettingStatusMsg(res?.message || `Successfully processed role request!`);
      loadVettingQueue();
      loadCandidates();
      setTimeout(() => setVettingStatusMsg(""), 3500);
    } catch (e) {
      console.error("Vetting action failed", e);
      setVettingStatusMsg("Action failed. Vetting process issue.");
      setTimeout(() => setVettingStatusMsg(""), 3500);
    }
  };

  const handleQuickImport = () => {
    if (!quickPaste.trim()) return;

    let company = "";
    let role = "";
    let location = "";
    let salary = "";
    let skills: string[] = [];
    let description = quickPaste.trim();

    // 1. Check if it's a URL
    if (quickPaste.startsWith("http://") || quickPaste.startsWith("https://")) {
      const url = quickPaste.toLowerCase();
      
      // Attempt to extract company and role from URL slugs
      if (url.includes("linkedin.com/jobs")) {
        const match = url.match(/view\/([a-z0-9-]+)/);
        if (match && match[1]) {
          const parts = match[1].split("-");
          const cleanedParts = parts.filter(p => !/^\d+$/.test(p));
          
          const atIndex = cleanedParts.indexOf("at");
          if (atIndex !== -1) {
            role = cleanedParts.slice(0, atIndex).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
            company = cleanedParts.slice(atIndex + 1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
          } else {
            role = cleanedParts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
          }
        }
      } else {
        try {
          const parsed = new URL(quickPaste);
          const hostnameParts = parsed.hostname.split(".");
          company = hostnameParts.length > 2 ? hostnameParts[1] : hostnameParts[0];
          company = company.charAt(0).toUpperCase() + company.slice(1);
          
          const pathParts = parsed.pathname.split(/[-_/]/).filter(Boolean);
          role = pathParts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        } catch (e) {}
      }
      
      location = "Remote";
    } else {
      // 2. Parse as Raw Text
      const text = quickPaste;
      const lines = text.split("\n");
      lines.forEach(line => {
        const lower = line.toLowerCase();
        if (lower.startsWith("company:") || lower.startsWith("employer:")) {
          company = line.split(":")[1].trim();
        } else if (lower.startsWith("role:") || lower.startsWith("title:") || lower.startsWith("job title:")) {
          role = line.split(":")[1].trim();
        } else if (lower.startsWith("location:") || lower.startsWith("job location:")) {
          location = line.split(":")[1].trim();
        } else if (lower.startsWith("salary:") || lower.startsWith("compensation:")) {
          salary = line.split(":")[1].trim();
        } else if (lower.startsWith("skills:") || lower.startsWith("requirements:")) {
          const skVal = line.split(":")[1].trim();
          skVal.split(/[,|]/).forEach(s => skills.push(s.trim()));
        }
      });

      if (!company) {
        const compMatch = text.match(/(?:at|join|with)\s+([A-Z][a-zA-Z0-9\s]+?)(?:\s+as|\s+in|\s+to|\.|\n|,)/);
        if (compMatch) company = compMatch[1].trim();
      }
      if (!role) {
        const roleMatch = text.match(/(?:seeking|hiring|for a|looking for)\s+([A-Z][a-zA-Z0-9\s-]{4,30}?)(?:\s+to|\s+at|\s+in|\n|,)/);
        if (roleMatch) role = roleMatch[1].trim();
      }
      if (!location) {
        if (text.toLowerCase().includes("remote")) location = "Remote";
        else if (text.toLowerCase().includes("hybrid")) location = "Hybrid";
        else {
          const locMatch = text.match(/(?:located in|based in|in)\s+([A-Z][a-zA-Z\s,]{3,20}?)(?:\.|\n|,)/);
          if (locMatch) location = locMatch[1].trim();
        }
      }
      if (!salary) {
        const salMatch = text.match(/(\$\d+[\d,]*\s*(?:-\s*\$\d+[\d,]*\s*)?(?:\/year|\/hr|k|K)?)/);
        if (salMatch) salary = salMatch[1].trim();
      }

      const popularSkills = [
        "react", "node", "python", "fastapi", "docker", "kubernetes", "typescript", 
        "javascript", "aws", "gcloud", "sql", "sqlite", "postgresql", "mongodb", 
        "golang", "rust", "java", "css", "html", "vue", "angular", "next.js"
      ];
      popularSkills.forEach(s => {
        const regex = new RegExp(`\\b${s}\\b`, 'i');
        if (text.match(regex)) {
          skills.push(s.charAt(0).toUpperCase() + s.slice(1));
        }
      });
    }

    setForm({
      company: company || form.company,
      role: role || form.role,
      location: location || form.location || "Remote",
      salary: salary || form.salary,
      skills: skills.length > 0 ? Array.from(new Set(skills)).join(", ") : form.skills,
      apply_link: quickPaste.startsWith("http") ? quickPaste : form.apply_link,
      description: description.slice(0, 180) + (description.length > 180 ? "..." : "")
    });

    setQuickPaste("");
    setStatusMsg("✨ Form auto-filled successfully!");
    setTimeout(() => setStatusMsg(""), 3000);
  };

  const handlePostOpportunity = async () => {
    if (!form.company || !form.role || !form.apply_link || !form.location) {
      setErrorMsg("Company, Role, Location, and Apply Link are required.");
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }
    try {
      setErrorMsg("");
      setStatusMsg("");
      await apiFetch<Job>("/jobs", {
        auth: true,
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify(form),
      });
      setForm(emptyJob);
      setStatusMsg("Job listing successfully posted!");
      loadJobs();
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (e) {
      setErrorMsg("Failed to publish job opportunity.");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    try {
      await apiFetch(`/jobs/${jobId}`, {
        auth: true,
        method: "DELETE",
      });
      setStatusMsg("Opportunity successfully deleted");
      loadJobs();
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (e) {
      console.error("Failed to delete job", e);
    }
  };

  // Dispatch Alerts using FastAPI endpoints
  const handleSendAlert = async () => {
    if (!alertTitle || !alertMessage) {
      setBroadcastError("Title and message content are required.");
      setTimeout(() => setBroadcastError(""), 3000);
      return;
    }

    setBroadcastStatus("");
    setBroadcastError("");

    try {
      if (isGlobal) {
        // Send a system-wide global broadcast
        await apiFetch("/admin/notifications/broadcast", {
          auth: true,
          method: "POST",
          headers: jsonHeaders(),
          body: JSON.stringify({
            title: alertTitle,
            message: alertMessage,
            priority: alertPriority
          })
        });
        setBroadcastStatus(`System-wide alert broadcasted to all users!`);
      } else {
        if (!selectedCandidate) {
          setBroadcastError("Please select a target candidate for direct alert.");
          return;
        }
        // Send directly to the specified user
        await apiFetch("/admin/notifications/send-to-user", {
          auth: true,
          method: "POST",
          headers: jsonHeaders(),
          body: JSON.stringify({
            user_id: selectedCandidate.id,
            title: alertTitle,
            message: alertMessage,
            priority: alertPriority
          })
        });
        setBroadcastStatus(`Direct alert successfully sent to ${selectedCandidate.name}!`);
      }

      // Reset form
      setAlertTitle("");
      setAlertMessage("");
      setAlertPriority(false);
      setTimeout(() => setBroadcastStatus(""), 3000);
    } catch (e) {
      setBroadcastError(e instanceof Error ? e.message : "Failed to dispatch alert.");
      setTimeout(() => setBroadcastError(""), 3000);
    }
  };



  const filteredCandidates = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppShell
      title="Admin Control Panel"
      subtitle="Super-user command center. Upload external job openings, dispatch broadcast notifications, and sign cryptographic skill badges."
    >
      {/* Authorized Status Indicator bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-1.5 rounded-full border border-cyan-500/20">
          <ShieldAlert size={14} className="animate-pulse" />
          Admin Session Authorized
        </div>
        
        {/* Workspace Tab selectors */}
        <div className="flex rounded-xl bg-zinc-950 p-1 border border-white/5 shadow-inner">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "jobs"
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-zinc-950 shadow-md"
                : "text-zinc-400-force hover:text-white"
            }`}
          >
            Job Postings
          </button>
          <button
            onClick={() => setActiveTab("broadcast")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "broadcast"
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-zinc-950 shadow-md"
                : "text-zinc-400-force hover:text-white"
            }`}
          >
            Broadcast Center
          </button>
          <button
            onClick={() => setActiveTab("vetting")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "vetting"
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-zinc-950 shadow-md"
                : "text-zinc-400-force hover:text-white"
            }`}
          >
            Vetting Queue
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "users"
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-zinc-950 shadow-md"
                : "text-zinc-400-force hover:text-white"
            }`}
          >
            Users Directory
          </button>
        </div>
      </div>

      {/* Dynamic Tab Rendering Panel */}
      {activeTab === "jobs" && (
        <>
          {/* Admin metrics dashboard */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <div className="glass-3d card-glow-cyan p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold tracking-wider text-cyan-300/80 uppercase">Active Opportunities</span>
                <Briefcase className="text-cyan-400" size={20} />
              </div>
              <div className="mt-4">
                <h3 className="text-4xl font-extrabold text-white tracking-tight">{jobs.length}</h3>
                <p className="text-xs text-zinc-400 mt-1">Live listings displayed to students</p>
              </div>
            </div>

            <div className="glass-3d card-glow-emerald p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold tracking-wider text-emerald-300/80 uppercase">Audience Sync</span>
                <Sparkles className="text-emerald-400" size={20} />
              </div>
              <div className="mt-4">
                <h3 className="text-4xl font-extrabold text-white tracking-tight">Active</h3>
                <p className="text-xs text-zinc-400 mt-1">Directly syncing to student boards</p>
              </div>
            </div>

            <div className="glass-3d card-glow-amber p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold tracking-wider text-amber-300/80 uppercase">Catalog Level</span>
                <BarChart2 className="text-amber-400" size={20} />
              </div>
              <div className="mt-4">
                <h3 className="text-4xl font-extrabold text-white tracking-tight">Super</h3>
                <p className="text-xs text-zinc-400 mt-1">Global catalog overrides active</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8 w-full">
            {/* Job posting form */}
            <div className="w-full">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="glass-3d bg-white/[0.03] p-6 rounded-3xl border border-white/10 relative card-glow-cyan"
              >
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-white mb-5 flex items-center gap-2">
                  <Plus size={18} className="text-cyan-400" />
                  Upload Job Link
                </h2>

                {/* Smart Quick Import & Heuristics */}
                <div className="mb-6 p-4 rounded-2xl border border-dashed border-cyan-500/30 bg-cyan-500/[0.02] space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 block">⚡ Smart Quick Import & Auto-Fill</span>
                  <div className="flex gap-2">
                    <input
                      value={quickPaste}
                      onChange={(e) => setQuickPaste(e.target.value)}
                      placeholder="Paste Job URL or Raw job text details here..."
                      className="flex-grow rounded-xl border border-white/10 bg-zinc-950/80 px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500 transition placeholder:text-zinc-650"
                    />
                    <button
                      onClick={handleQuickImport}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-xs font-bold text-zinc-950 shadow-md hover:brightness-110 transition shrink-0 cursor-pointer"
                    >
                      Auto-Fill
                    </button>
                  </div>
                  <p className="text-[9px] text-zinc-500 leading-normal">
                    Tip: Paste a LinkedIn job link, or corporate description paragraph, then click Auto-Fill to populate the form instantly!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3.5">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 block mb-1">
                      Company Name *
                    </label>
                    <input
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      placeholder="e.g. Amazon, Google"
                      className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-xs text-white outline-none hover:border-zinc-700 focus:border-cyan-500 transition placeholder:text-zinc-650"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 block mb-1">
                      Job Role / Title *
                    </label>
                    <input
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      placeholder="e.g. Full Stack Developer"
                      className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-xs text-white outline-none hover:border-zinc-700 focus:border-cyan-500 transition placeholder:text-zinc-650"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 block mb-1">
                      Location *
                    </label>
                    <input
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="e.g. Remote / Bangalore"
                      className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-xs text-white outline-none hover:border-zinc-700 focus:border-cyan-500 transition placeholder:text-zinc-650"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 block mb-1">
                      Salary Range (Optional)
                    </label>
                    <input
                      value={form.salary}
                      onChange={(e) => setForm({ ...form, salary: e.target.value })}
                      placeholder="e.g. $90k - $120k / Year"
                      className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-xs text-white outline-none hover:border-zinc-700 focus:border-cyan-500 transition placeholder:text-zinc-650"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 block mb-1">
                      Skills Required (Comma separated)
                    </label>
                    <input
                      value={form.skills}
                      onChange={(e) => setForm({ ...form, skills: e.target.value })}
                      placeholder="e.g. React, Node.js, Sqlite"
                      className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-xs text-white outline-none hover:border-zinc-700 focus:border-cyan-500 transition placeholder:text-zinc-650"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 block mb-1">
                      Posting / Apply Link *
                    </label>
                    <input
                      value={form.apply_link}
                      onChange={(e) => setForm({ ...form, apply_link: e.target.value })}
                      placeholder="e.g. https://linkedin.com/jobs/view/..."
                      className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-xs text-white outline-none hover:border-zinc-700 focus:border-cyan-500 transition placeholder:text-zinc-650"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 block mb-1">
                      Job Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Briefly describe the requirements, key objectives, or refer details..."
                      rows={3}
                      className="w-full rounded-xl border border-white/10 bg-zinc-950/60 p-4 text-xs text-white outline-none hover:border-zinc-700 focus:border-cyan-500 transition resize-none placeholder:text-zinc-650"
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <button
                    onClick={handlePostOpportunity}
                    className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 py-3.5 text-xs font-bold text-zinc-950 hover:brightness-110 shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Plus size={16} />
                    Publish Opportunity
                  </button>
                  {statusMsg && (
                    <p className="text-center text-xs font-semibold text-emerald-400 mt-2 bg-emerald-500/10 py-2 rounded-xl border border-emerald-500/20">
                      {statusMsg}
                    </p>
                  )}
                  {errorMsg && (
                    <p className="text-center text-xs font-semibold text-red-400 mt-2 bg-red-500/10 py-2 rounded-xl border border-red-500/20">
                      {errorMsg}
                    </p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Live opportunity catalog list */}
            <div className="w-full">
              <div className="glass-3d bg-white/[0.01] p-6 rounded-3xl border border-white/5 relative">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <h2 className="text-sm font-extrabold uppercase tracking-widest text-white">
                    Live Opportunities Catalog ({jobs.length})
                  </h2>
                  <button
                    onClick={loadJobs}
                    disabled={refreshing}
                    className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 uppercase tracking-wider"
                  >
                    <RefreshCw size={10} className={refreshing ? "animate-spin" : ""} />
                    Sync
                  </button>
                </div>

                {jobs.length === 0 ? (
                  <div className="h-60 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                    <Briefcase size={36} className="text-zinc-700 mb-3 animate-pulse" />
                    <span className="text-zinc-500 text-xs uppercase tracking-widest font-bold">No opportunities in directory</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div
                        key={job.id}
                        className="glass-3d bg-zinc-900/40 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative overflow-hidden"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-white leading-tight">
                              {job.role}
                            </h4>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-400 shrink-0">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Live
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-400">
                            <span className="text-cyan-400 font-bold uppercase text-[10px] tracking-wider">{job.company}</span>
                            <span className="flex items-center gap-1">
                              <MapPin size={12} className="text-zinc-500" />
                              {job.location}
                            </span>
                            {job.salary && (
                              <span className="flex items-center gap-1">
                                <DollarSign size={12} className="text-zinc-500" />
                                {job.salary}
                              </span>
                            )}
                          </div>

                          {job.skills && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {job.skills.split(",").map((s) => (
                                <span key={s} className="rounded-md border border-white/5 bg-white/[0.02] px-2 py-0.5 text-[9px] text-zinc-400 font-bold uppercase">
                                  {s.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 sm:self-center shrink-0">
                          <a
                            href={job.apply_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition"
                          >
                            <Send size={12} />
                            View
                          </a>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/20 hover:bg-red-500/10 text-red-400 transition"
                            title="Delete listing"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "broadcast" && (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Candidates Directory Side widget */}
          <div className="lg:col-span-1">
            <div className="glass-3d bg-white/[0.02] p-6 rounded-3xl border border-white/10 relative card-glow-cyan flex flex-col max-h-[640px]">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-white mb-4 flex items-center gap-2">
                <Users size={16} className="text-cyan-400" />
                Candidates Directory
              </h2>

              {/* Live search input */}
              <div className="relative mb-4">
                <Search size={14} className="absolute left-3.5 top-3.5 text-zinc-500" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter name or email..."
                  className="w-full rounded-xl border border-white/5 bg-zinc-950/80 pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-cyan-500 transition placeholder:text-zinc-600"
                />
              </div>

              {loadingCandidates ? (
                <div className="flex-1 flex items-center justify-center py-10">
                  <RefreshCw size={24} className="animate-spin text-cyan-400" />
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl py-10 bg-zinc-950/20">
                  <Users size={24} className="text-zinc-700 mb-2" />
                  <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">No matching candidates</span>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {filteredCandidates.map((cand) => (
                    <button
                      key={cand.id}
                      onClick={() => {
                        setSelectedCandidate(cand);
                        setIsGlobal(false);
                      }}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-1 relative overflow-hidden ${
                        selectedCandidate?.id === cand.id && !isGlobal
                          ? "bg-cyan-500/10 border-cyan-500/40 shadow-lg shadow-cyan-500/5"
                          : "bg-zinc-950/50 border-white/5 hover:border-white/10"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-xs text-white tracking-tight">{cand.name}</span>
                        <span className="text-[9px] font-extrabold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                          Index: {cand.hireability_index}%
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 leading-none truncate">{cand.email}</span>
                      
                      <div className="flex items-center gap-1.5 mt-2">
                        <ShieldCheck size={10} className="text-emerald-400" />
                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">
                          {cand.verified_claims_count} Verified Badges
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Broadcast Alerts Board */}
          <div className="lg:col-span-2">
            <TiltCard maxTilt={1} scale={1} className="glass-3d bg-white/[0.03] p-6 rounded-3xl border border-white/10 card-glow-emerald">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-white mb-5 flex items-center gap-2">
                <Bell size={18} className="text-emerald-400" />
                Alerts Dispatch center
              </h2>

              <div className="space-y-6">
                {/* Target Audience Toggle */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 block mb-2">
                    Alert Target Scope
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setIsGlobal(true);
                        setSelectedCandidate(null);
                      }}
                      className={`flex-1 rounded-xl py-3 text-xs font-bold border transition ${
                        isGlobal
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-md"
                          : "bg-zinc-950/40 border-white/5 text-zinc-400 hover:text-white"
                      }`}
                    >
                      Global Broadcast (All Students)
                    </button>
                    <button
                      onClick={() => {
                        setIsGlobal(false);
                        if (candidates.length > 0 && !selectedCandidate) {
                          setSelectedCandidate(candidates[0]);
                        }
                      }}
                      className={`flex-1 rounded-xl py-3 text-xs font-bold border transition ${
                        !isGlobal
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-md"
                          : "bg-zinc-950/40 border-white/5 text-zinc-400 hover:text-white"
                      }`}
                    >
                      Targeted Alert (Selected User)
                    </button>
                  </div>
                </div>

                {/* Target candidate display if single scope */}
                {!isGlobal && (
                  <div className="p-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-cyan-400">Target Recipient</span>
                      <p className="text-xs font-bold text-white">
                        {selectedCandidate ? `${selectedCandidate.name} (${selectedCandidate.email})` : "Please select a candidate from the left directory panel"}
                      </p>
                    </div>
                    {selectedCandidate && (
                      <span className="text-[9px] font-bold text-zinc-400">ID: {selectedCandidate.id}</span>
                    )}
                  </div>
                )}

                {/* Input Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 block mb-1">
                      Notification Header / Title *
                    </label>
                    <input
                      value={alertTitle}
                      onChange={(e) => setAlertTitle(e.target.value)}
                      placeholder="e.g. Schedule Invitation for Amazon Backend Assessment"
                      className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3.5 text-xs text-white outline-none hover:border-zinc-700 focus:border-emerald-500 transition placeholder:text-zinc-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 block mb-1">
                      Alert message Body *
                    </label>
                    <textarea
                      value={alertMessage}
                      onChange={(e) => setAlertMessage(e.target.value)}
                      placeholder="Type details, next steps, interview scheduling times or updates here..."
                      rows={5}
                      className="w-full rounded-xl border border-white/10 bg-zinc-950/60 p-4 text-xs text-white outline-none hover:border-zinc-700 focus:border-emerald-500 transition resize-none placeholder:text-zinc-600"
                    />
                  </div>

                  {/* Priority check */}
                  <div className="flex items-center gap-3 bg-zinc-950/40 p-4 rounded-xl border border-white/5">
                    <input
                      type="checkbox"
                      id="alertPriority"
                      checked={alertPriority}
                      onChange={(e) => setAlertPriority(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-950 shrink-0"
                    />
                    <label htmlFor="alertPriority" className="text-xs text-zinc-300 font-semibold cursor-pointer select-none">
                      Mark as High Priority Alert (glowing beacon indicator visible to student)
                    </label>
                  </div>
                </div>

                {/* Action button */}
                <div className="pt-2">
                  <button
                    onClick={handleSendAlert}
                    className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-4 text-xs font-bold text-zinc-950 hover:brightness-110 shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 transition"
                  >
                    <Send size={14} className="stroke-[2.5]" />
                    Dispatch Alert Link
                  </button>

                  {broadcastStatus && (
                    <p className="text-center text-xs font-semibold text-emerald-400 mt-4 bg-emerald-500/10 py-3 rounded-xl border border-emerald-500/20 animate-in slide-in-from-bottom duration-200">
                      {broadcastStatus}
                    </p>
                  )}
                  {broadcastError && (
                    <p className="text-center text-xs font-semibold text-red-400 mt-4 bg-red-500/10 py-3 rounded-xl border border-red-500/20 animate-in slide-in-from-bottom duration-200">
                      {broadcastError}
                    </p>
                  )}
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      )}



      {activeTab === "vetting" && (
        <div className="space-y-6">
          <div className="glass-3d bg-white/[0.02] p-6 rounded-3xl border border-white/10 relative card-glow-emerald">
            <div className="flex items-center justify-between gap-4 mb-5 border-b border-white/5 pb-3">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-400" />
                Vetting & Verification Queue ({vettingQueue.length})
              </h2>
              <button
                onClick={loadVettingQueue}
                disabled={loadingVetting}
                className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-400 uppercase tracking-wider disabled:opacity-50"
              >
                <RefreshCw size={10} className={loadingVetting ? "animate-spin" : ""} />
                Refresh Queue
              </button>
            </div>

            {vettingStatusMsg && (
              <div className="mb-4 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs font-semibold text-emerald-400 animate-in fade-in duration-200">
                {vettingStatusMsg}
              </div>
            )}

            {loadingVetting ? (
              <div className="py-20 flex flex-col items-center justify-center text-zinc-400 gap-2">
                <RefreshCw size={24} className="animate-spin text-emerald-400" />
                <span className="text-[10px] uppercase font-bold tracking-widest">Scanning Vetting databases...</span>
              </div>
            ) : vettingQueue.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-zinc-950/20">
                <ShieldCheck size={36} className="text-zinc-700 mb-3 animate-pulse" />
                <span className="text-zinc-500 text-xs uppercase tracking-widest font-bold">No Pending Verification Requests</span>
                <span className="text-zinc-600 text-[10px] mt-1">Mentors and Recruiters are currently fully vetted.</span>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {vettingQueue.map((req) => (
                  <div
                    key={req.id}
                    className="glass-3d bg-zinc-900/60 p-5 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-white/10 transition-all gap-4 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-cyan-500" />
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider shrink-0 border ${
                          req.requested_role === "recruiter"
                            ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        }`}>
                          Registering as: {req.requested_role}
                        </span>
                        <span className="text-[9px] text-zinc-500 font-medium">
                          {new Date(req.requested_at).toLocaleDateString()}
                        </span>
                      </div>
 
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white leading-none">{req.name}</h4>
                        <p className="text-xs text-zinc-400">{req.email}</p>
                      </div>
 
                      {req.details && (
                        <div className="rounded-xl bg-zinc-950/60 p-3 border border-white/5">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Application Notes</p>
                          <p className="text-xs text-zinc-300 italic">"{req.details}"</p>
                        </div>
                      )}
                    </div>
 
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5 shrink-0">
                      <button
                        onClick={() => handleVerifyRole(req.id, req.user_id, req.requested_role, true)}
                        className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 py-2.5 text-xs font-bold text-zinc-950 active:scale-95 transition-all shadow-md shadow-emerald-500/10 text-center"
                      >
                        Approve Access
                      </button>
                      <button
                        onClick={() => handleVerifyRole(req.id, req.user_id, req.requested_role, false)}
                        className="flex-1 rounded-xl border border-red-500/30 bg-red-500/5 hover:bg-red-500/15 py-2.5 text-xs font-bold text-red-400 active:scale-95 transition-all text-center"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="glass-3d bg-white/[0.02] p-6 rounded-3xl border border-white/10 relative card-glow-cyan">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 border-b border-white/5 pb-3">
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-white flex items-center gap-2">
                  <Users size={18} className="text-cyan-400" />
                  Users Administration Directory ({allUsers.length})
                </h2>
                <p className="text-[11px] text-zinc-400 mt-1">Manage and moderate active user accounts, roles, and suspension blocks.</p>
              </div>
              <button
                onClick={loadAllUsers}
                disabled={loadingUsers}
                className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-400 uppercase tracking-wider disabled:opacity-50"
              >
                <RefreshCw size={10} className={loadingUsers ? "animate-spin" : ""} />
                Refresh Directory
              </button>
            </div>

            {/* User Search Input */}
            <div className="relative mb-5">
              <Search size={14} className="absolute left-3.5 top-3.5 text-zinc-500" />
              <input
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search user name, email, or role..."
                className="w-full rounded-xl border border-white/5 bg-zinc-950/80 pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-cyan-500 transition placeholder:text-zinc-650"
              />
            </div>

            {userActionStatus && (
              <div className="mb-4 p-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 text-xs font-semibold text-cyan-400 animate-in fade-in duration-200">
                {userActionStatus}
              </div>
            )}

            {loadingUsers ? (
              <div className="py-20 flex flex-col items-center justify-center text-zinc-400 gap-2">
                <RefreshCw size={24} className="animate-spin text-cyan-400" />
                <span className="text-[10px] uppercase font-bold tracking-widest">Scanning Users database...</span>
              </div>
            ) : allUsers.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-zinc-950/20">
                <Users size={36} className="text-zinc-700 mb-3 animate-pulse" />
                <span className="text-zinc-500 text-xs uppercase tracking-widest font-bold">No Users Found</span>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {allUsers
                  .filter(
                    (u) =>
                      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                      u.role.toLowerCase().includes(userSearchQuery.toLowerCase())
                  )
                  .map((u) => {
                    const isBlocked = u.role === "blocked";
                    return (
                      <div
                        key={u.id}
                        className={`glass-3d p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 relative overflow-hidden ${
                          isBlocked
                            ? "bg-red-500/[0.02] border-red-500/20"
                            : "bg-zinc-900/60 border-white/5 hover:border-white/10"
                        }`}
                      >
                        <div className={`absolute top-0 left-0 bottom-0 w-1 ${isBlocked ? "bg-red-500" : "bg-cyan-500"}`} />
                        
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-start gap-2">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wider shrink-0 border ${
                              isBlocked
                                ? "bg-red-500/10 border-red-500/30 text-red-400"
                                : u.role === "admin"
                                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                                : "bg-zinc-500/10 border-white/10 text-zinc-300"
                            }`}>
                              Role: {u.role}
                            </span>
                            <span className="text-[9px] text-zinc-500 font-bold">ID: {u.id}</span>
                          </div>

                          <div className="space-y-0.5">
                            <h4 className="text-sm font-bold text-white leading-none">{u.name}</h4>
                            <p className="text-xs text-zinc-400 truncate" title={u.email}>{u.email}</p>
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-2 border-t border-white/5">
                          <button
                            onClick={() => handleToggleBlock(u.id, isBlocked)}
                            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer ${
                              isBlocked
                                ? "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-md shadow-emerald-500/10"
                                : "bg-red-500 hover:bg-red-400 text-white shadow-md shadow-red-500/10"
                            }`}
                          >
                            {isBlocked ? "Unblock Account" : "Block Account"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
