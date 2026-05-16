"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
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

type RecruiterDashboard = {
  posted_jobs: Job[];
  total_posted: number;
  message: string;
};

export default function RecruiterPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<RecruiterDashboard>({
    posted_jobs: [],
    total_posted: 0,
    message: "",
  });
  const [form, setForm] = useState(emptyJob);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }

    loadDashboard();
  }, [router]);

  const loadDashboard = async () => {
    const data = await apiFetch<RecruiterDashboard>("/recruiter/dashboard", {
      auth: true,
    });
    setDashboard(data);
  };

  const postJob = async () => {
    await apiFetch<Job>("/recruiter/jobs", {
      auth: true,
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(form),
    });
    setForm(emptyJob);
    setStatus("Job posted");
    loadDashboard();
  };

  return (
    <AppShell
      title="Recruiter Portal"
      subtitle="Post roles, track owned jobs, and prepare for ATS export integrations."
    >
      <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <div className="grid gap-3 md:grid-cols-3">
          {Object.keys(emptyJob).map((field) => (
            <input
              key={field}
              value={form[field as keyof typeof emptyJob]}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  [field]: event.target.value,
                }))
              }
              placeholder={field.replace("_", " ")}
              className="rounded-md border border-white/10 bg-black px-3 py-3 text-sm capitalize outline-none"
            />
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={postJob}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-3 text-sm font-medium text-zinc-950 hover:bg-emerald-400"
          >
            <Plus size={17} />
            Post Job
          </button>
          {status ? <p className="text-sm text-emerald-300">{status}</p> : null}
        </div>
      </section>

      <h2 className="mt-6 text-xl font-semibold">
        Posted Jobs ({dashboard.total_posted})
      </h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dashboard.posted_jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </AppShell>
  );
}
