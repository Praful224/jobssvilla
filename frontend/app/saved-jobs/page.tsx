"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { apiFetch, getToken, Job, jsonHeaders } from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { JobCard } from "@/components/JobCard";

type SavedJob = Job & {
  job_id: number;
  created_at?: string;
};

export default function SavedJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<SavedJob[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }

    loadSavedJobs();
  }, [router]);

  const loadSavedJobs = async () => {
    const data = await apiFetch<SavedJob[]>("/saved-jobs", { auth: true });
    setJobs(data);
  };

  const removeSavedJob = async (job: SavedJob) => {
    await apiFetch(`/saved-jobs/${job.job_id}`, {
      auth: true,
      method: "DELETE",
    });
    setStatus(`${job.role} removed`);
    loadSavedJobs();
  };

  const trackApplication = async (job: SavedJob) => {
    await apiFetch("/applications", {
      auth: true,
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({ job_id: job.job_id }),
    });
    setStatus(`${job.role} added to applications`);
  };

  return (
    <AppShell
      title="Saved Jobs"
      subtitle="Keep strong opportunities close and convert them into applications when ready."
    >
      {status ? <p className="mb-4 text-sm text-emerald-300">{status}</p> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {jobs.map((job) => (
          <div key={job.job_id} className="relative">
            <JobCard
              job={{ ...job, id: job.job_id }}
              onTrack={() => trackApplication(job)}
            />
            <button
              onClick={() => removeSavedJob(job)}
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-black/80 text-zinc-300 hover:bg-red-500 hover:text-white"
              title="Remove"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
