"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Briefcase, 
  Bookmark, 
  ClipboardList, 
  Building2, 
  RefreshCw, 
  ArrowUpDown, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Search, 
  MapPin, 
  DollarSign, 
  ExternalLink 
} from "lucide-react";
import { 
  apiFetch, 
  getToken, 
  Job, 
  Application, 
  Company, 
  jsonHeaders 
} from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { JobCard } from "@/components/JobCard";
import { SearchBar } from "@/components/SearchBar";
import { TiltCard } from "@/components/TiltCard";
import { Kanban } from "@/components/Kanban";

const emptyForm = {
  company: "",
  role: "",
  location: "",
  status: "Applied",
  source: "JobsVilla",
  notes: "",
};

const emptyCompany = {
  name: "",
  website: "",
  industry: "",
  size: "",
  location: "",
  description: "",
  logo_url: "",
};

export default function JobsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Active Tab Lifecycle
  const currentTab = searchParams.get("tab") || "browse";
  const [activeTab, setActiveTab] = useState<string>(currentTab);

  // Browse Listings State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "company" | "location" | "salary">("newest");

  // Saved Jobs State
  const [savedJobs, setSavedJobs] = useState<(Job & { job_id: number })[]>([]);
  const [matches, setMatches] = useState<any[]>([]);

  // Applications State
  const [applications, setApplications] = useState<Application[]>([]);
  const [appForm, setAppForm] = useState(emptyForm);

  // Companies State
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyForm, setCompanyForm] = useState(emptyCompany);
  const [showAddCompany, setShowAddCompany] = useState(false);

  // General Status Panel Banner
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Watch URL params to sync tabs
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["browse", "saved", "applications", "companies"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    loadDataForTab(activeTab);
  }, [activeTab, router]);

  const loadDataForTab = async (tab: string) => {
    setLoading(true);
    try {
      if (tab === "browse") {
        const data = await apiFetch<Job[]>("/jobs");
        setJobs(Array.isArray(data) ? data : []);
        try {
          const matchData = await apiFetch<any[]>("/profile/matches", { auth: true });
          setMatches(Array.isArray(matchData) ? matchData : []);
        } catch (mErr) {
          console.error("Failed to load profile similarity matches:", mErr);
        }
      } else if (tab === "saved") {
        const data = await apiFetch<(Job & { job_id: number })[]>("/saved-jobs", { auth: true });
        setSavedJobs(Array.isArray(data) ? data : []);
        try {
          const matchData = await apiFetch<any[]>("/profile/matches", { auth: true });
          setMatches(Array.isArray(matchData) ? matchData : []);
        } catch (mErr) {
          console.error("Failed to load profile similarity matches:", mErr);
        }
      } else if (tab === "applications") {
        const data = await apiFetch<Application[]>("/applications", { auth: true });
        setApplications(Array.isArray(data) ? data : []);
      } else if (tab === "companies") {
        const data = await apiFetch<Company[]>("/companies");
        setCompanies(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(`Error loading data for tab ${tab}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/jobs?tab=${tab}`);
  };

  // Browse Listings handlers
  const handleSyncOpportunities = async () => {
    setRefreshing(true);
    await loadDataForTab("browse");
    setRefreshing(false);
    showBanner("Opportunities board synchronized");
  };

  const handleSearchJobs = async () => {
    setRefreshing(true);
    try {
      const path = query.trim()
        ? `/jobs/search?q=${encodeURIComponent(query)}`
        : "/jobs";
      const data = await apiFetch<Job[]>(path);
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSaveJob = async (job: Job) => {
    try {
      await apiFetch("/saved-jobs", {
        auth: true,
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ job_id: job.id }),
      });
      showBanner(`Saved "${job.role}" to bookmarks`);
    } catch (err) {
      console.error("Save job failed:", err);
    }
  };

  const handleTrackApplication = async (job: Job) => {
    try {
      await apiFetch("/applications", {
        auth: true,
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ job_id: job.id }),
      });
      showBanner(`Added "${job.role}" to active tracker`);
    } catch (err) {
      console.error("Track application failed:", err);
    }
  };

  // Saved Jobs handlers
  const handleRemoveSaved = async (jobId: number, roleName: string) => {
    try {
      await apiFetch(`/saved-jobs/${jobId}`, {
        auth: true,
        method: "DELETE",
      });
      showBanner(`Removed "${roleName}" from saved list`);
      loadDataForTab("saved");
    } catch (err) {
      console.error("Remove bookmark failed:", err);
    }
  };

  // Applications trackers
  const handleAddApplicationManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appForm.company || !appForm.role) return;
    try {
      await apiFetch<Application>("/applications", {
        auth: true,
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify(appForm),
      });
      setAppForm(emptyForm);
      showBanner("Application added successfully");
      loadDataForTab("applications");
    } catch (err) {
      console.error("Add manual application failed:", err);
    }
  };

  const handleApplicationStatusChange = async (app: Application, newStatus: string) => {
    try {
      await apiFetch<Application>(`/applications/${app.id}`, {
        auth: true,
        method: "PATCH",
        headers: jsonHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      loadDataForTab("applications");
    } catch (err) {
      console.error("Update status failed:", err);
    }
  };

  // Companies catalog builders
  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyForm.name) return;
    try {
      await apiFetch<Company>("/companies", {
        auth: true,
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify(companyForm),
      });
      setCompanyForm(emptyCompany);
      setShowAddCompany(false);
      showBanner("Company profile published successfully");
      loadDataForTab("companies");
    } catch (err) {
      console.error("Publish company profile failed:", err);
    }
  };

  const showBanner = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(""), 4000);
  };

  // Sort browse jobs list
  const sortedJobs = [...jobs].sort((a, b) => {
    if (sortBy === "company") return a.company.localeCompare(b.company);
    if (sortBy === "location") return a.location.localeCompare(b.location);
    if (sortBy === "salary") {
      const getVal = (s?: string | null) => {
        if (!s) return 0;
        const numbers = s.replace(/[^0-9]/g, "");
        return numbers ? parseInt(numbers, 10) : 0;
      };
      return getVal(b.salary) - getVal(a.salary);
    }
    return b.id - a.id; // Newest first
  });

  return (
    <AppShell
      title="Job Hub Workspace"
      subtitle="Your unified recruiter-candidate console. Explore postings, track application stages, and interact with employer profiles."
    >
      {/* Dynamic Tab Selector Pillars */}
      <div className="flex border-b border-white/10 gap-1.5 mb-6 overflow-x-auto pb-px">
        <button
          onClick={() => handleTabChange("browse")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 rounded-t-xl shrink-0 ${
            activeTab === "browse"
              ? "border-emerald-400 text-emerald-400 bg-emerald-500/[0.04]"
              : "border-transparent text-zinc-400 hover:text-white hover:bg-white/[0.02]"
          }`}
        >
          <Briefcase size={14} />
          Opportunities Catalog
        </button>
        <button
          onClick={() => handleTabChange("saved")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 rounded-t-xl shrink-0 ${
            activeTab === "saved"
              ? "border-emerald-400 text-emerald-400 bg-emerald-500/[0.04]"
              : "border-transparent text-zinc-400 hover:text-white hover:bg-white/[0.02]"
          }`}
        >
          <Bookmark size={14} />
          Bookmarked Jobs ({savedJobs.length})
        </button>
        <button
          onClick={() => handleTabChange("applications")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 rounded-t-xl shrink-0 ${
            activeTab === "applications"
              ? "border-emerald-400 text-emerald-400 bg-emerald-500/[0.04]"
              : "border-transparent text-zinc-400 hover:text-white hover:bg-white/[0.02]"
          }`}
        >
          <ClipboardList size={14} />
          Applications Pipeline
        </button>
        <button
          onClick={() => handleTabChange("companies")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 rounded-t-xl shrink-0 ${
            activeTab === "companies"
              ? "border-emerald-400 text-emerald-400 bg-emerald-500/[0.04]"
              : "border-transparent text-zinc-400 hover:text-white hover:bg-white/[0.02]"
          }`}
        >
          <Building2 size={14} />
          Verified Employer Index
        </button>
      </div>

      {/* Floating dynamic status banners */}
      {status && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-zinc-950 p-4 text-xs font-bold text-emerald-400 uppercase tracking-widest shadow-2xl animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{status}</span>
        </div>
      )}

      {loading && !refreshing ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
          <div className="h-8 w-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin mb-3" />
          <p className="text-xs uppercase tracking-widest font-bold">Synchronizing Records...</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* TAB 1: BROWSE OPPORTUNITIES */}
          {activeTab === "browse" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 w-fit">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Real-time Opportunities List
                </div>
                <button
                  onClick={handleSyncOpportunities}
                  disabled={refreshing}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 px-4 py-2.5 text-xs font-bold text-zinc-300 hover:text-white transition disabled:opacity-60"
                >
                  <RefreshCw size={13} className={refreshing ? "animate-spin text-emerald-400" : ""} />
                  Sync Opportunities
                </button>
              </div>

              {/* Search Console */}
              <div className="glass-3d bg-zinc-950/40 p-1.5 rounded-3xl border border-white/5 shadow-lg">
                <SearchBar
                  value={query}
                  onChange={setQuery}
                  onSearch={handleSearchJobs}
                />
              </div>

              {/* Sort controls */}
              <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400">
                  Opportunities Index ({sortedJobs.length})
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                    <ArrowUpDown size={12} />
                    Sort:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="rounded-xl border border-white/10 bg-zinc-950 px-3 py-1.5 text-[11px] font-bold text-zinc-300 outline-none hover:border-zinc-700 transition cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="company">Company (A-Z)</option>
                    <option value="location">Location (A-Z)</option>
                    <option value="salary">Salary (High-Low)</option>
                  </select>
                </div>
              </div>

              {/* Jobs Catalog */}
              <div className="flex flex-col gap-6 w-full">
                {sortedJobs.length > 0 ? (
                  sortedJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onSave={handleSaveJob}
                      onTrack={handleTrackApplication}
                      match={matches.find((m) => m.job_id === job.id)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-20 border border-dashed border-black/10 dark:border-white/5 rounded-3xl bg-black/[0.01] dark:bg-zinc-950/20 backdrop-blur-sm">
                    <Briefcase size={36} className="mx-auto text-zinc-400 dark:text-zinc-700 mb-3" />
                    <p className="text-xs text-foreground uppercase tracking-widest font-bold">No active opportunities found</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-600 mt-1">Try modifying your search query or trigger a Sync</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SAVED JOBS */}
          {activeTab === "saved" && (
            <div className="space-y-6">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 border-b border-white/5 pb-4">
                Saved & Bookmarked Board ({savedJobs.length})
              </h3>
              <div className="flex flex-col gap-6 w-full">
                {savedJobs.length > 0 ? (
                  savedJobs.map((job) => (
                    <JobCard
                      key={job.job_id}
                      job={{ ...job, id: job.job_id }}
                      onTrack={() => handleTrackApplication({ ...job, id: job.job_id })}
                      onRemove={() => handleRemoveSaved(job.job_id, job.role)}
                      match={matches.find((m) => m.job_id === job.job_id)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-20 border border-dashed border-black/10 dark:border-white/5 rounded-3xl bg-black/[0.01] dark:bg-zinc-950/20 backdrop-blur-sm">
                    <Bookmark size={36} className="mx-auto text-zinc-450 dark:text-zinc-700 mb-3" />
                    <p className="text-xs text-foreground uppercase tracking-widest font-bold">No saved jobs</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-600 mt-1">Click the bookmark icon on jobs to save them here</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: APPLICATIONS KANBAN */}
          {activeTab === "applications" && (
            <div className="space-y-8">
              {/* Form Expander */}
              <div className="glass-3d bg-zinc-950/50 p-6 rounded-3xl border border-white/5 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Plus size={16} className="text-emerald-400" />
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-zinc-200">Manual Tracker Quick-Add</h4>
                </div>
                <form onSubmit={handleAddApplicationManual} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <input
                    required
                    value={appForm.company}
                    onChange={(e) => setAppForm(c => ({ ...c, company: e.target.value }))}
                    placeholder="Company Name"
                    className="w-full rounded-xl border border-white/5 bg-zinc-950/60 focus:border-emerald-500/40 px-4 py-3 text-xs outline-none transition placeholder:text-zinc-500"
                  />
                  <input
                    required
                    value={appForm.role}
                    onChange={(e) => setAppForm(c => ({ ...c, role: e.target.value }))}
                    placeholder="Job Role / Title"
                    className="w-full rounded-xl border border-white/5 bg-zinc-950/60 focus:border-emerald-500/40 px-4 py-3 text-xs outline-none transition placeholder:text-zinc-500"
                  />
                  <input
                    value={appForm.location}
                    onChange={(e) => setAppForm(c => ({ ...c, location: e.target.value }))}
                    placeholder="Location (e.g. Remote, SF)"
                    className="w-full rounded-xl border border-white/5 bg-zinc-950/60 focus:border-emerald-500/40 px-4 py-3 text-xs outline-none transition placeholder:text-zinc-500"
                  />
                  <select
                    value={appForm.status}
                    onChange={(e) => setAppForm(c => ({ ...c, status: e.target.value }))}
                    className="w-full rounded-xl border border-white/5 bg-zinc-950/60 focus:border-emerald-500/40 px-4 py-3 text-xs outline-none transition cursor-pointer text-zinc-300"
                  >
                    {["Applied", "Under Review", "Interview", "Offer", "Rejected"].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <input
                    value={appForm.source}
                    onChange={(e) => setAppForm(c => ({ ...c, source: e.target.value }))}
                    placeholder="Source Channel"
                    className="w-full rounded-xl border border-white/5 bg-zinc-950/60 focus:border-emerald-500/40 px-4 py-3 text-xs outline-none transition placeholder:text-zinc-500"
                  />
                  <input
                    value={appForm.notes}
                    onChange={(e) => setAppForm(c => ({ ...c, notes: e.target.value }))}
                    placeholder="Initial Rehearsal Notes"
                    className="w-full rounded-xl border border-white/5 bg-zinc-950/60 focus:border-emerald-500/40 px-4 py-3 text-xs outline-none transition placeholder:text-zinc-500"
                  />
                  <div className="col-span-full mt-2 flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-6 py-3 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/10"
                    >
                      <Plus size={14} className="stroke-[2.5]" />
                      Add to Dashboard Pipeline
                    </button>
                  </div>
                </form>
              </div>

              {/* Kanban Interactive Dashboard */}
              <div className="mt-2">
                <Kanban 
                  applications={applications} 
                  onStatusChange={handleApplicationStatusChange} 
                />
              </div>
            </div>
          )}

          {/* TAB 4: EMPLOYER PROFILES */}
          {activeTab === "companies" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400">
                  Verified Industry Spotlights ({companies.length})
                </h3>
                <button
                  onClick={() => setShowAddCompany(!showAddCompany)}
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/15 px-4 py-2 text-xs font-bold text-emerald-400 transition"
                >
                  <Plus size={13} />
                  Publish Company Profile
                </button>
              </div>

              {/* Recruiter Drawer Component */}
              {showAddCompany && (
                <div className="glass-3d bg-zinc-950/60 p-6 rounded-3xl border border-white/10 shadow-2xl animate-in slide-in-from-top duration-300">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-zinc-200 mb-4">Publish Employer Brand Profile</h4>
                  <form onSubmit={handleAddCompany} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <input
                      required
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm(c => ({ ...c, name: e.target.value }))}
                      placeholder="Employer Name (e.g. Stripe)"
                      className="w-full rounded-xl border border-white/5 bg-zinc-950/60 px-4 py-3 text-xs outline-none focus:border-emerald-500/40"
                    />
                    <input
                      value={companyForm.website}
                      onChange={(e) => setCompanyForm(c => ({ ...c, website: e.target.value }))}
                      placeholder="Website Domain (e.g. stripe.com)"
                      className="w-full rounded-xl border border-white/5 bg-zinc-950/60 px-4 py-3 text-xs outline-none focus:border-emerald-500/40"
                    />
                    <input
                      value={companyForm.industry}
                      onChange={(e) => setCompanyForm(c => ({ ...c, industry: e.target.value }))}
                      placeholder="Industry Pillar (e.g. FinTech)"
                      className="w-full rounded-xl border border-white/5 bg-zinc-950/60 px-4 py-3 text-xs outline-none focus:border-emerald-500/40"
                    />
                    <input
                      value={companyForm.size}
                      onChange={(e) => setCompanyForm(c => ({ ...c, size: e.target.value }))}
                      placeholder="Employee Size (e.g. 5000+)"
                      className="w-full rounded-xl border border-white/5 bg-zinc-950/60 px-4 py-3 text-xs outline-none focus:border-emerald-500/40"
                    />
                    <input
                      value={companyForm.location}
                      onChange={(e) => setCompanyForm(c => ({ ...c, location: e.target.value }))}
                      placeholder="Location HQ"
                      className="w-full rounded-xl border border-white/5 bg-zinc-950/60 px-4 py-3 text-xs outline-none focus:border-emerald-500/40"
                    />
                    <input
                      value={companyForm.logo_url}
                      onChange={(e) => setCompanyForm(c => ({ ...c, logo_url: e.target.value }))}
                      placeholder="Logo Artwork URL"
                      className="w-full rounded-xl border border-white/5 bg-zinc-950/60 px-4 py-3 text-xs outline-none focus:border-emerald-500/40"
                    />
                    <textarea
                      value={companyForm.description}
                      onChange={(e) => setCompanyForm(c => ({ ...c, description: e.target.value }))}
                      placeholder="Brand culture, mission statement and engineering pillars..."
                      className="col-span-full w-full rounded-xl border border-white/5 bg-zinc-950/60 px-4 py-3 text-xs outline-none focus:border-emerald-500/40 h-20 resize-none"
                    />
                    <div className="col-span-full flex justify-end gap-2.5 mt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddCompany(false)}
                        className="rounded-xl border border-white/10 hover:bg-white/5 px-4 py-2.5 text-xs font-bold text-zinc-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-6 py-2.5 text-xs font-bold text-zinc-950 transition shadow-lg"
                      >
                        Publish Brand Spotlight
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Companies Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {companies.length > 0 ? (
                  companies.map((company) => (
                    <TiltCard key={company.id} maxTilt={3} scale={1.01}>
                      <article className="glass-3d bg-zinc-950/60 p-6 rounded-3xl border border-white/5 shadow-md flex flex-col justify-between h-full relative overflow-hidden group hover:border-cyan-500/20 transition-all card-glow-cyan">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-bl-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div>
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-md">
                              {company.logo_url ? (
                                <img src={company.logo_url} alt={company.name} className="h-6 w-6 object-contain rounded" />
                              ) : (
                                <Building2 size={20} />
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                              Verified Brand
                            </div>
                          </div>

                          <h2 className="mt-4 text-lg font-bold text-white flex items-center gap-1.5">
                            {company.name}
                          </h2>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mt-0.5">{company.industry}</p>
                          <p className="mt-3 text-xs text-zinc-400 leading-relaxed line-clamp-3">{company.description || "No engineering culture overview described yet."}</p>
                        </div>

                        <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between gap-2 text-[11px] text-zinc-500 font-semibold">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} className="text-zinc-600" />
                            {company.location || "Silicon Valley, CA"}
                          </span>
                          {company.website && (
                            <a
                              href={`https://${company.website}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
                            >
                              Visit Brand
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </article>
                    </TiltCard>
                  ))
                ) : (
                  <div className="col-span-full text-center py-20 border border-dashed border-white/5 rounded-3xl bg-zinc-950/20 backdrop-blur-sm">
                    <Building2 size={36} className="mx-auto text-zinc-700 mb-3" />
                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">No registered brands</p>
                    <p className="text-[11px] text-zinc-600 mt-1">recruiter accounts can publish brand pages above</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </AppShell>
  );
}
