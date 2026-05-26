"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Bookmark, ClipboardList, Search, Award, BarChart3, RefreshCw, Plus, ArrowUpDown, CheckCircle, AlertCircle, Briefcase, Sparkles, Compass, Users, MessageSquare } from "lucide-react";
import {
  AnalyticsSummary,
  apiFetch,
  getToken,
  Job,
  jsonHeaders,
  Profile,
} from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { JobCard } from "@/components/JobCard";
import { SearchBar } from "@/components/SearchBar";
import { TiltCard } from "@/components/TiltCard";

const emptySummary: AnalyticsSummary = {
  total_jobs: 0,
  applications: 0,
  saved_jobs: 0,
  unread_notifications: 0,
  application_status: {},
};

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary>(emptySummary);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "company" | "location" | "salary">("newest");
  const [focusMode, setFocusMode] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [claimsCount, setClaimsCount] = useState(0);
  const [newJobForm, setNewJobForm] = useState({
    company: "",
    role: "",
    location: "",
    salary: "",
    skills: "",
    apply_link: "",
    description: "",
  });
  const [postError, setPostError] = useState("");
  const [postSuccess, setPostSuccess] = useState("");

  const handlePostOpportunity = async (e: FormEvent) => {
    e.preventDefault();
    if (!newJobForm.company || !newJobForm.role || !newJobForm.apply_link || !newJobForm.location) {
      setPostError("Company, Role, Location, and Apply Link are required.");
      return;
    }
    try {
      setPostError("");
      setPostSuccess("");
      await apiFetch("/jobs", {
        auth: true,
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify(newJobForm),
      });
      setPostSuccess("Opportunity successfully shared with the community!");
      setNewJobForm({
        company: "",
        role: "",
        location: "",
        salary: "",
        skills: "",
        apply_link: "",
        description: "",
      });
      loadDashboard();
      setTimeout(() => {
        setPostSuccess("");
        setShowPostForm(false);
      }, 2000);
    } catch (err) {
      setPostError(err instanceof Error ? err.message : "Failed to post opportunity.");
    }
  };

  const sortedJobs = [...jobs].sort((a, b) => {
    if (sortBy === "company") {
      return a.company.localeCompare(b.company);
    }
    if (sortBy === "location") {
      return a.location.localeCompare(b.location);
    }
    if (sortBy === "salary") {
      const getVal = (s?: string | null) => {
        if (!s) return 0;
        const numbers = s.replace(/[^0-9]/g, "");
        return numbers ? parseInt(numbers, 10) : 0;
      };
      return getVal(b.salary) - getVal(a.salary);
    }
    // Newest: id descending
    return b.id - a.id;
  });

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }

    loadDashboard();

    // Load local storage states for launchers
    if (typeof window !== "undefined") {
      const savedSkills = localStorage.getItem("jobsvilla_completed_skills");
      if (savedSkills) {
        try {
          const parsed = JSON.parse(savedSkills);
          setCompletedCount(Object.keys(parsed).filter(k => parsed[k]).length);
        } catch (e) {
          console.error(e);
        }
      }

      const savedClaims = localStorage.getItem("jobsvilla_verified_claims");
      if (savedClaims) {
        try {
          const parsed = JSON.parse(savedClaims);
          setClaimsCount(Array.isArray(parsed) ? parsed.length : 0);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [router]);

  const loadDashboard = async () => {
    setRefreshing(true);
    try {
      // Fetch each separately so a single endpoint failure doesn't crash the whole dashboard promise chain
      const profilePromise = apiFetch<Profile>("/profile", { auth: true }).catch((err) => {
        console.error("Failed to load profile:", err);
        return null;
      });
      const jobsPromise = apiFetch<Job[]>("/jobs").catch((err) => {
        console.error("Failed to load jobs:", err);
        return [] as Job[];
      });
      const summaryPromise = apiFetch<AnalyticsSummary>("/dashboard/summary", { auth: true }).catch((err) => {
        console.error("Failed to load analytics summary:", err);
        return emptySummary;
      });

      const [profileData, jobsData, summaryData] = await Promise.all([
        profilePromise,
        jobsPromise,
        summaryPromise,
      ]);

      setProfile(profileData || null);
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setSummary(summaryData || emptySummary);
    } catch (e) {
      console.error("Dashboard failed to sync details", e);
    } finally {
      setRefreshing(false);
    }
  };

  const searchJobs = async () => {
    try {
      const path = query.trim()
        ? `/jobs/search?q=${encodeURIComponent(query)}`
        : "/jobs";
      const data = await apiFetch<Job[]>(path);
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const saveJob = async (job: Job) => {
    try {
      await apiFetch("/saved-jobs", {
        auth: true,
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ job_id: job.id }),
      });
      setStatus(`${job.role} saved successfully`);
      loadDashboard();
    } catch (err) {
      console.error("Save job failed:", err);
    }
  };

  const trackApplication = async (job: Job) => {
    try {
      await apiFetch("/applications", {
        auth: true,
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ job_id: job.id }),
      });
      setStatus(`${job.role} added to active pipeline`);
      loadDashboard();
    } catch (err) {
      console.error("Track application failed:", err);
    }
  };



  return (
    <AppShell
    title={`Welcome Back, ${
      profile?.name
        ? profile.name.charAt(0).toUpperCase() + profile.name.slice(1)
        : "Developer"
    }`}
      subtitle="Your premium visual command center console. Monitor applications, analyze skills, and scale your tech stack."
    >
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Workspace Synchronized
        </div>
        
        <button
          onClick={loadDashboard}
          disabled={refreshing}
          className="flex items-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 px-4 py-2 text-xs font-bold text-zinc-300 hover:text-white transition disabled:opacity-60"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin text-emerald-400" : ""} />
          Sync Core Data
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {/* Resume Studio Launcher */}
        <Link href="/resume">
          <TiltCard
            maxTilt={8}
            scale={1.03}
            className="glass-3d bg-zinc-950/60 p-6 rounded-3xl border border-emerald-500/20 card-glow-emerald h-full flex flex-col justify-between group transition-all duration-300 relative overflow-hidden"
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-extrabold tracking-widest text-emerald-400 uppercase">Interactive Workspace</span>
                  <h3 className="mt-1 text-xl font-black text-white tracking-tight group-hover:text-emerald-300 transition-colors">Resume Studio</h3>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-zinc-950 shadow-lg shadow-emerald-500/20">
                  <Sparkles size={18} className="stroke-[2.5] animate-pulse" />
                </div>
              </div>
              <p className="mt-3 text-[11px] text-zinc-400 leading-relaxed">
                Craft high-impact developer resumes inside our sandboxed LaTeX compiler and track ATS skill match scores.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500 uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Compiler Active</span>
              </div>
              <span className="text-emerald-400 font-extrabold flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg text-[9px]">
                {claimsCount > 0 ? `${claimsCount} Claims Vaulted` : "Zero-Trust Ready"}
              </span>
            </div>
          </TiltCard>
        </Link>

        {/* Skills Roadmap Launcher */}
        <Link href="/roadmap">
          <TiltCard
            maxTilt={8}
            scale={1.03}
            className="glass-3d bg-zinc-950/60 p-6 rounded-3xl border border-fuchsia-500/20 card-glow-purple h-full flex flex-col justify-between group transition-all duration-300 relative overflow-hidden"
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-extrabold tracking-widest text-fuchsia-400 uppercase">Career Time Machine</span>
                  <h3 className="mt-1 text-xl font-black text-white tracking-tight group-hover:text-fuchsia-300 transition-colors">Career Roadmap</h3>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-400 to-pink-500 text-zinc-950 shadow-lg shadow-fuchsia-500/20">
                  <Compass size={18} className="stroke-[2.5]" />
                </div>
              </div>
              <p className="mt-3 text-[11px] text-zinc-400 leading-relaxed">
                Navigate interactive technology trees, acquire missing skill sets, and claim digital learning badges.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 space-y-2">
              <div className="flex justify-between text-[9px] font-bold text-zinc-500 uppercase">
                <span>Roadmap Progress</span>
                <span className="text-fuchsia-400 font-bold">
                  {completedCount > 0 ? `${Math.round((completedCount / 9) * 100)}%` : "0%"}
                </span>
              </div>
              <div className="h-1.5 w-full bg-zinc-900 border border-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${completedCount > 0 ? Math.min(100, Math.round((completedCount / 9) * 100)) : 8}%` }}
                />
              </div>
            </div>
          </TiltCard>
        </Link>

        {/* Mentorship Console */}
        <Link href="/mentorship">
          <TiltCard
            maxTilt={8}
            scale={1.03}
            className="glass-3d bg-zinc-950/60 p-6 rounded-3xl border border-amber-500/20 card-glow-amber h-full flex flex-col justify-between group transition-all duration-300 relative overflow-hidden"
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-extrabold tracking-widest text-amber-400 uppercase">Verified Networks</span>
                  <h3 className="mt-1 text-xl font-black text-white tracking-tight group-hover:text-amber-300 transition-colors">Mentorship Hub</h3>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-zinc-950 shadow-lg shadow-amber-500/20">
                  <Users size={18} className="stroke-[2.5]" />
                </div>
              </div>
              <p className="mt-3 text-[11px] text-zinc-400 leading-relaxed">
                Book 1:1 sessions with industry leads or complete verified coding evaluations under guidance.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-[9px] font-bold text-zinc-500 uppercase">AI Mentor Connect</span>
              <span className="text-amber-400 font-extrabold text-[9px] uppercase flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                Active
              </span>
            </div>
          </TiltCard>
        </Link>

        {/* Community Circles Feed */}
        <Link href="/community">
          <TiltCard
            maxTilt={8}
            scale={1.03}
            className="glass-3d bg-zinc-950/60 p-6 rounded-3xl border border-cyan-500/20 card-glow-cyan h-full flex flex-col justify-between group transition-all duration-300 relative overflow-hidden"
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-extrabold tracking-widest text-cyan-400 uppercase">Knowledge Base</span>
                  <h3 className="mt-1 text-xl font-black text-white tracking-tight group-hover:text-cyan-300 transition-colors">Community Feed</h3>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-zinc-950 shadow-lg shadow-cyan-500/20">
                  <MessageSquare size={18} className="stroke-[2.5]" />
                </div>
              </div>
              <p className="mt-3 text-[11px] text-zinc-400 leading-relaxed">
                Share tips, review architectural blueprints, and discover global opportunities posted online.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap gap-1">
              <span className="rounded bg-white/5 border border-white/5 px-2 py-0.5 text-[8px] text-zinc-400 uppercase font-bold tracking-wider hover:text-cyan-400 transition-colors">#nextjs</span>
              <span className="rounded bg-white/5 border border-white/5 px-2 py-0.5 text-[8px] text-zinc-400 uppercase font-bold tracking-wider hover:text-cyan-400 transition-colors">#fastapi</span>
              <span className="rounded bg-white/5 border border-white/5 px-2 py-0.5 text-[8px] text-zinc-400 uppercase font-bold tracking-wider hover:text-cyan-400 transition-colors">#typescript</span>
            </div>
          </TiltCard>
        </Link>
      </div>

      <div className="mt-8 w-full">
        <section className="space-y-6">
          <div className="glass-3d bg-zinc-950/40 p-1.5 rounded-3xl border border-white/5">
            <SearchBar
              value={query}
              onChange={setQuery}
              onSearch={searchJobs}
            />
          </div>
          
          {/* Post Opportunity Collapsible Form */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowPostForm(!showPostForm)}
              className="flex items-center gap-1.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 px-4 py-2.5 text-xs font-bold text-emerald-400 transition shadow-lg shadow-emerald-500/5 hover:scale-[1.02]"
            >
              <Plus size={14} />
              Share an Online Opportunity
            </button>
          </div>

          {showPostForm && (
            <TiltCard maxTilt={1} scale={1} className="glass-3d bg-zinc-950/80 rounded-3xl border border-white/10 p-6 card-glow-cyan relative overflow-hidden transition-all duration-300">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-zinc-100 mb-4 flex items-center gap-2">
                <Plus size={16} className="text-emerald-400 animate-pulse" />
                Post Opportunity Found Online
              </h4>
              <p className="text-[11px] text-zinc-400 mb-5">
                Found a job opening on LinkedIn, Twitter, or a company site? Share it with the community here so others can track and apply!
              </p>
              
              <form onSubmit={handlePostOpportunity} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">Role / Job Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Frontend Engineer (React)"
                      value={newJobForm.role}
                      onChange={(e) => setNewJobForm({...newJobForm, role: e.target.value})}
                      className="w-full rounded-xl border border-white/5 bg-zinc-900/60 px-4 py-3 text-xs outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">Company Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Google"
                      value={newJobForm.company}
                      onChange={(e) => setNewJobForm({...newJobForm, company: e.target.value})}
                      className="w-full rounded-xl border border-white/5 bg-zinc-900/60 px-4 py-3 text-xs outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">Location *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Remote / Bangalore"
                      value={newJobForm.location}
                      onChange={(e) => setNewJobForm({...newJobForm, location: e.target.value})}
                      className="w-full rounded-xl border border-white/5 bg-zinc-900/60 px-4 py-3 text-xs outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">Salary Range (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. $80,000 - $100,000"
                      value={newJobForm.salary}
                      onChange={(e) => setNewJobForm({...newJobForm, salary: e.target.value})}
                      className="w-full rounded-xl border border-white/5 bg-zinc-900/60 px-4 py-3 text-xs outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">Skills (Comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. React, TypeScript, Next.js"
                      value={newJobForm.skills}
                      onChange={(e) => setNewJobForm({...newJobForm, skills: e.target.value})}
                      className="w-full rounded-xl border border-white/5 bg-zinc-900/60 px-4 py-3 text-xs outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">Link to Posting / Apply Link *</label>
                  <input
                    type="url"
                    required
                    placeholder="e.g. https://linkedin.com/jobs/view/..."
                    value={newJobForm.apply_link}
                    onChange={(e) => setNewJobForm({...newJobForm, apply_link: e.target.value})}
                    className="w-full rounded-xl border border-white/5 bg-zinc-900/60 px-4 py-3 text-xs outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">Opportunity Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe the opportunity, key requirements, or add any referral notes..."
                    value={newJobForm.description}
                    onChange={(e) => setNewJobForm({...newJobForm, description: e.target.value})}
                    className="w-full rounded-xl border border-white/5 bg-zinc-900/60 p-4 text-xs outline-none focus:border-emerald-500 transition resize-none"
                  />
                </div>

                {postError && (
                  <div className="flex items-center gap-2 text-xs font-bold text-red-400 bg-red-500/10 px-4 py-2.5 rounded-2xl border border-red-500/20">
                    <AlertCircle size={14} />
                    {postError}
                  </div>
                )}

                {postSuccess && (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-4 py-2.5 rounded-2xl border border-emerald-500/20">
                    <CheckCircle size={14} />
                    {postSuccess}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPostForm(false)}
                    className="rounded-xl border border-white/5 hover:bg-white/5 px-4 py-2.5 text-xs font-bold text-zinc-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2.5 text-xs font-bold text-zinc-950 hover:brightness-110 shadow-lg shadow-emerald-500/10 transition"
                  >
                    Publish Opportunity
                  </button>
                </div>
              </form>
            </TiltCard>
          )}

          {status ? (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-4 py-2.5 rounded-2xl border border-emerald-500/20 max-w-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              {status}
            </div>
          ) : null}

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Award size={16} className="text-emerald-400" />
                <h3 className="font-extrabold text-xs uppercase tracking-widest text-zinc-300">
                  Matching Opportunities ({sortedJobs.length})
                </h3>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                  <ArrowUpDown size={12} />
                  Sort By:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="rounded-xl border border-white/10 bg-zinc-950 px-3 py-1.5 text-xs font-bold text-zinc-300 outline-none hover:border-zinc-700 transition cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="company">Company (A-Z)</option>
                  <option value="location">Location (A-Z)</option>
                  <option value="salary">Salary (High-Low)</option>
                </select>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {Array.isArray(sortedJobs) && sortedJobs.length > 0 ? (
                sortedJobs.map((job) => (
                  <TiltCard key={job.id} maxTilt={6} scale={1.01}>
                    <JobCard
                      job={job}
                      onSave={saveJob}
                      onTrack={trackApplication}
                    />
                  </TiltCard>
                ))
              ) : (
                <div className="md:col-span-2 text-center py-12 border border-dashed border-white/5 rounded-3xl bg-zinc-950/20 backdrop-blur-sm">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">No opportunities currently visible</p>
                  <p className="text-[11px] text-zinc-600 mt-1">Try resetting your search query or sync core data</p>
                </div>
              )}
            </div>

          </div>
        </section>
      </div>
    </AppShell>
  );
}