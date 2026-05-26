"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Briefcase, Users, FileCheck2, User, Mail, Calendar, HelpCircle, Search, ShieldCheck } from "lucide-react";
import { apiFetch, getToken, Job, jsonHeaders } from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { JobCard } from "@/components/JobCard";

const emptyJob = {
  company: "",
  role: "",
  location: "",
  salary: "",
  skills: "",
  apply_link: "",
  description: "",
};

type RecruiterApplicant = {
  id: number;
  job_id?: number | null;
  company: string;
  role: string;
  location?: string | null;
  status: string;
  source: string;
  notes?: string | null;
  applied_at?: string;
  updated_at?: string;
  applicant?: {
    id: number;
    name: string;
    email: string;
  };
};

type RecruiterDashboard = {
  posted_jobs: Job[];
  total_posted: number;
  message: string;
};

const statuses = ["Applied", "Under Review", "Interview", "Offer", "Rejected"];

export default function RecruiterPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<RecruiterDashboard>({
    posted_jobs: [],
    total_posted: 0,
    message: "",
  });
  const [applicants, setApplicants] = useState<RecruiterApplicant[]>([]);
  const [form, setForm] = useState(emptyJob);
  const [statusMsg, setStatusMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"kanban" | "jobs" | "candidates">("kanban");

  // Candidates directory search states
  const [candidates, setCandidates] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }

    loadDashboard();
    loadApplicants();
    loadCandidates();
  }, [router]);

  const loadDashboard = async () => {
    try {
      const data = await apiFetch<RecruiterDashboard>("/recruiter/dashboard", {
        auth: true,
      });
      setDashboard(data);
    } catch (e) {
      console.error("Failed to load recruiter dashboard", e);
    }
  };

  const loadCandidates = async () => {
    setLoadingCandidates(true);
    try {
      const data = await apiFetch<any[]>("/recruiter/candidates", { auth: true });
      setCandidates(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load candidates", e);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const loadApplicants = async () => {
    try {
      const data = await apiFetch<RecruiterApplicant[]>("/recruiter/applications", {
        auth: true,
      });
      setApplicants(data);
    } catch (e) {
      console.error("Failed to load applicants", e);
    }
  };

  const postJob = async () => {
    if (!form.company || !form.role || !form.apply_link) {
      setStatusMsg("Company, Role, and Apply Link are required.");
      return;
    }
    try {
      await apiFetch<Job>("/recruiter/jobs", {
        auth: true,
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify(form),
      });
      setForm(emptyJob);
      setStatusMsg("Job listing successfully posted!");
      loadDashboard();
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (e) {
      setStatusMsg("Failed to post job.");
    }
  };

  const handleStatusChange = async (appId: number, nextStatus: string) => {
    try {
      await apiFetch(`/recruiter/applications/${appId}`, {
        auth: true,
        method: "PATCH",
        headers: jsonHeaders(),
        body: JSON.stringify({ status: nextStatus }),
      });
      // Instantly reload applicants list to sync
      loadApplicants();
    } catch (e) {
      console.error("Failed to update application status", e);
    }
  };

  // Metrics calculation
  const totalApps = applicants.length;
  const interviewCount = applicants.filter(a => a.status === "Interview").length;
  const offerCount = applicants.filter(a => a.status === "Offer").length;

  return (
    <AppShell
      title="Next-Gen Recruiter ATS Portal"
      subtitle="Manage active corporate postings, review real-time applicants, and manage recruitment pipeline."
    >
      {/* Premium Dynamic 3D Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="glass-3d card-glow-cyan p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold tracking-wider text-cyan-300/80 uppercase">Total Applicants</span>
            <Users className="text-cyan-400" size={20} />
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-extrabold text-white tracking-tight">{totalApps}</h3>
            <p className="text-xs text-zinc-400 mt-1">Across all posted campaigns</p>
          </div>
        </div>

        <div className="glass-3d card-glow-amber p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold tracking-wider text-amber-300/80 uppercase">Interviews Scheduled</span>
            <Calendar className="text-amber-400" size={20} />
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-extrabold text-white tracking-tight">{interviewCount}</h3>
            <p className="text-xs text-zinc-400 mt-1">Active candidate loops</p>
          </div>
        </div>

        <div className="glass-3d card-glow-cyan p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold tracking-wider text-emerald-300/80 uppercase">Offers Extended</span>
            <FileCheck2 className="text-emerald-400" size={20} />
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-extrabold text-white tracking-tight">{offerCount}</h3>
            <p className="text-xs text-zinc-400 mt-1">Pipeline closure progress</p>
          </div>
        </div>

        <div className="glass-3d card-glow-amber p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold tracking-wider text-rose-300/80 uppercase">Job Posts</span>
            <Briefcase className="text-rose-400" size={20} />
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-extrabold text-white tracking-tight">{dashboard.total_posted}</h3>
            <p className="text-xs text-zinc-400 mt-1">Active listings in catalog</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-6 mb-6">
        <button
          onClick={() => setActiveTab("kanban")}
          className={`pb-3 text-sm font-medium transition-all relative ${
            activeTab === "kanban"
              ? "text-emerald-400 font-semibold"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Applicant Tracking Board
          {activeTab === "kanban" && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-400 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("jobs")}
          className={`pb-3 text-sm font-medium transition-all relative ${
            activeTab === "jobs"
              ? "text-emerald-400 font-semibold"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Postings & Creation
          {activeTab === "jobs" && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-400 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("candidates")}
          className={`pb-3 text-sm font-medium transition-all relative ${
            activeTab === "candidates"
              ? "text-emerald-400 font-semibold"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Search Candidates
          {activeTab === "candidates" && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-400 rounded-full" />
          )}
        </button>
      </div>

      {activeTab === "kanban" && (
        <div>
          {/* ATS Applicant Kanban Board */}
          <div className="grid gap-6 xl:grid-cols-5 overflow-x-auto pb-4">
            {statuses.map((status) => {
              const statusItems = applicants.filter((item) => item.status === status);

              return (
                <div
                  key={status}
                  className="glass-3d bg-zinc-950/40 rounded-2xl p-4 min-w-[260px] border border-white/5 flex flex-col"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3 mb-4">
                    <h3 className="text-sm font-bold tracking-wider text-zinc-100 flex items-center gap-2">
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-full ${
                          status === "Applied"
                            ? "bg-blue-400"
                            : status === "Under Review"
                            ? "bg-amber-400"
                            : status === "Interview"
                            ? "bg-purple-400"
                            : status === "Offer"
                            ? "bg-emerald-400"
                            : "bg-red-500"
                        }`}
                      />
                      {status}
                    </h3>
                    <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-xs text-zinc-300 font-medium">
                      {statusItems.length}
                    </span>
                  </div>

                  <div className="flex-1 space-y-4">
                    {statusItems.length === 0 ? (
                      <div className="h-32 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                        <HelpCircle size={20} className="text-zinc-600 mb-2" />
                        <span className="text-xs text-zinc-500">No applicants here</span>
                      </div>
                    ) : (
                      statusItems.map((app) => (
                        <div
                          key={app.id}
                          className="glass-3d bg-zinc-900/60 p-4 rounded-xl border border-white/10 card-glow-cyan flex flex-col justify-between"
                        >
                          <div>
                            <span className="text-[10px] tracking-wider uppercase font-bold text-emerald-400 block mb-1">
                              {app.company}
                            </span>
                            <h4 className="text-sm font-bold text-white leading-tight">
                              {app.role}
                            </h4>

                            <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5">
                              <div className="flex items-center gap-2 text-xs text-zinc-300">
                                <User size={13} className="text-zinc-500" />
                                <span className="font-medium truncate">
                                  {app.applicant?.name || "Candidate Name"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-zinc-400">
                                <Mail size={13} className="text-zinc-500" />
                                <span className="truncate">
                                  {app.applicant?.email || "candidate@email.com"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-white/5">
                            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1.5">
                              Transition Status
                            </label>
                            <select
                              value={app.status}
                              onChange={(event) =>
                                handleStatusChange(app.id, event.target.value)
                              }
                              className="w-full rounded-lg border border-white/10 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-200 outline-none hover:border-emerald-500/50 transition cursor-pointer"
                            >
                              {statuses.map((option) => (
                                <option key={option} value={option} className="bg-zinc-950">
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "jobs" && (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Job Creation Form */}
          <div className="lg:col-span-1">
            <div className="glass-3d bg-white/[0.03] p-6 rounded-2xl border border-white/10 relative">
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <Plus size={20} className="text-emerald-400" />
                Post Corporate Opening
              </h2>

              <div className="space-y-4">
                {Object.keys(emptyJob).map((field) => (
                  <div key={field}>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 block mb-1">
                      {field.replace("_", " ")}
                    </label>
                    <input
                      value={form[field as keyof typeof emptyJob]}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          [field]: event.target.value,
                        }))
                      }
                      placeholder={`Enter ${field.replace("_", " ")}`}
                      className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-sm text-white outline-none hover:border-zinc-700 focus:border-emerald-500 transition"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={postJob}
                  className="neon-btn w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-3.5 text-sm font-bold text-zinc-950 hover:brightness-110 shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Post Listing
                </button>
                {statusMsg ? (
                  <p className="text-center text-sm font-semibold text-emerald-400 mt-2">
                    {statusMsg}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Active Job Catalog */}
          <div className="lg:col-span-2">
            <div className="glass-3d bg-white/[0.01] p-6 rounded-2xl border border-white/5">
              <h2 className="text-lg font-bold text-white mb-5">
                Active Listings ({dashboard.total_posted})
              </h2>

              {dashboard.posted_jobs.length === 0 ? (
                <div className="h-60 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                  <Briefcase size={36} className="text-zinc-700 mb-3" />
                  <span className="text-zinc-500 text-sm">No jobs listed yet. Post one on the left!</span>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {dashboard.posted_jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "candidates" && (
        <div className="space-y-6">
          <div className="glass-3d bg-white/[0.02] p-6 rounded-3xl border border-white/10 relative card-glow-cyan">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-5">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users size={20} className="text-cyan-400" />
                  Talent & Candidates Directory
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Search registered professionals, evaluate their predictive hireability metrics, and check verified skill credentials.
                </p>
              </div>
              <button
                onClick={loadCandidates}
                disabled={loadingCandidates}
                className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-400 uppercase tracking-wider disabled:opacity-50"
              >
                <RefreshCw size={10} className={loadingCandidates ? "animate-spin" : ""} />
                Sync Directory
              </button>
            </div>

            {/* Directory Filter input */}
            <div className="relative mb-6 max-w-md">
              <Search size={16} className="absolute left-4 top-3.5 text-zinc-500" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by candidate name, email..."
                className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 pl-11 pr-4 py-3.5 text-xs text-white outline-none focus:border-cyan-500 transition placeholder:text-zinc-600"
              />
            </div>

            {loadingCandidates ? (
              <div className="py-20 flex flex-col items-center justify-center text-zinc-400 gap-2">
                <RefreshCw size={24} className="animate-spin text-cyan-400" />
                <span className="text-[10px] uppercase font-bold tracking-widest">Scanning candidates directory...</span>
              </div>
            ) : (
              <>
                {candidates.filter(
                  (c) =>
                    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.email.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 ? (
                  <div className="py-16 text-center border border-dashed border-white/5 rounded-2xl bg-zinc-950/10">
                    <Users size={32} className="text-zinc-700 mb-2 mx-auto" />
                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">No candidates found</p>
                    <p className="text-[10px] text-zinc-600 mt-1">Try refining your filter or query criteria.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {candidates
                      .filter(
                        (c) =>
                          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((cand) => (
                        <div
                          key={cand.id}
                          className="glass-3d bg-zinc-900/60 p-5 rounded-2xl border border-white/5 hover:border-white/10 hover:shadow-lg hover:shadow-cyan-500/[0.02] flex flex-col justify-between gap-4 transition-all relative overflow-hidden group"
                        >
                          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-1">
                                <h4 className="text-sm font-bold text-white tracking-tight">{cand.name}</h4>
                                <p className="text-xs text-zinc-400 leading-none truncate">{cand.email}</p>
                              </div>
                              
                              <div className="flex flex-col items-end shrink-0">
                                <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                                  {cand.hireability_index}% Match
                                </span>
                              </div>
                            </div>

                            {/* Predictive Hireability Bar */}
                            <div className="space-y-1 pt-1">
                              <div className="flex justify-between text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                                <span>Predictive Hireability</span>
                                <span className="text-cyan-400">{cand.hireability_index}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                                <div
                                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                                  style={{ width: `${cand.hireability_index}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/5 mt-1">
                            <div className="flex items-center gap-1">
                              <ShieldCheck size={12} className="text-emerald-400" />
                              <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider">
                                {cand.verified_claims_count} Verified Badges
                              </span>
                            </div>
                            
                            <a
                              href={`mailto:${cand.email}?subject=Career Opportunity via JobsVilla`}
                              className="rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 px-3 py-1.5 text-[10px] font-bold text-zinc-200 hover:text-white transition cursor-pointer"
                            >
                              Contact
                            </a>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
