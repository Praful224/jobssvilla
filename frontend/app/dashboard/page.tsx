"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Bookmark, ClipboardList, Search } from "lucide-react";
import {
  AnalyticsSummary,
  apiFetch,
  getToken,
  Job,
  jsonHeaders,
  Profile,
} from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { ChatWidget } from "@/components/ChatWidget";
import { JobCard } from "@/components/JobCard";
import { SearchBar } from "@/components/SearchBar";

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

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }

    loadDashboard();
  }, [router]);

  const loadDashboard = async () => {
    const [profileData, jobsData, summaryData] = await Promise.all([
      apiFetch<Profile>("/profile", { auth: true }),
      apiFetch<Job[]>("/jobs"),
      apiFetch<AnalyticsSummary>("/analytics/summary", { auth: true }),
    ]);

    setProfile(profileData);
    setJobs(jobsData);
    setSummary(summaryData);
  };

  const searchJobs = async () => {
    const path = query.trim()
      ? `/jobs/search?q=${encodeURIComponent(query)}`
      : "/jobs";
    const data = await apiFetch<Job[]>(path);
    setJobs(data);
  };

  const saveJob = async (job: Job) => {
    await apiFetch("/saved-jobs", {
      auth: true,
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({ job_id: job.id }),
    });
    setStatus(`${job.role} saved`);
    loadDashboard();
  };

  const trackApplication = async (job: Job) => {
    await apiFetch("/applications", {
      auth: true,
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({ job_id: job.id }),
    });
    setStatus(`${job.role} added to applications`);
    loadDashboard();
  };

  const stats = [
    {
      label: "Open jobs",
      value: summary.total_jobs,
      icon: Search,
      tone: "bg-cyan-400 text-zinc-950",
    },
    {
      label: "Applications",
      value: summary.applications,
      icon: ClipboardList,
      tone: "bg-emerald-400 text-zinc-950",
    },
    {
      label: "Saved jobs",
      value: summary.saved_jobs,
      icon: Bookmark,
      tone: "bg-amber-300 text-zinc-950",
    },
    {
      label: "Unread alerts",
      value: summary.unread_notifications,
      icon: Bell,
      tone: "bg-rose-300 text-zinc-950",
    },
  ];

  return (
    <AppShell
      title={`Welcome${profile?.name ? `, ${profile.name}` : ""}`}
      subtitle="Track your job pipeline and move from search to interview with fewer loose ends."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <section
              key={item.label}
              className="rounded-lg border border-white/10 bg-white/[0.04] p-5"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-md ${item.tone}`}
              >
                <Icon size={20} />
              </div>
              <p className="mt-5 text-3xl font-semibold">{item.value}</p>
              <p className="mt-1 text-sm text-zinc-400">{item.label}</p>
            </section>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section>
          <SearchBar
            value={query}
            onChange={setQuery}
            onSearch={searchJobs}
          />
          {status ? <p className="mt-3 text-sm text-emerald-300">{status}</p> : null}

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onSave={saveJob}
                onTrack={trackApplication}
              />
            ))}
          </div>
        </section>

        <ChatWidget />
      </div>
    </AppShell>
  );
}
