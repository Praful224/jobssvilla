"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Briefcase, Route, Sparkles, Users } from "lucide-react";
import { apiFetch, Job } from "@/lib/api";
import { JobCard } from "@/components/JobCard";
import { SearchBar } from "@/components/SearchBar";

const quickLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Briefcase },
  { href: "/resume", label: "Resume AI", icon: Sparkles },
  { href: "/mentorship", label: "Mentorship", icon: Users },
  { href: "/roadmap", label: "Roadmap", icon: Route },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchJobs = async () => {
    setLoading(true);
    setError("");

    try {
      const path = query.trim()
        ? `/jobs/search?q=${encodeURIComponent(query)}`
        : "/jobs";
      const data = await apiFetch<Job[]>(path);
      setJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Link href="/" className="text-2xl font-semibold">
          Jobs<span className="text-emerald-400">Villa</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-md border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400"
          >
            Register
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-14 pt-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <div className="inline-flex rounded-md border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200">
            Jobs, resumes, mentorship, and recruiter tools
          </div>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-tight md:text-7xl">
            Build a sharper career pipeline with JobsVilla.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
            Search opportunities, track applications, analyze resumes, and grow
            with mentorship and community workflows.
          </p>

          <div className="mt-8 max-w-3xl">
            <SearchBar
              value={query}
              onChange={setQuery}
              onSearch={searchJobs}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-2 rounded-md border border-white/10 px-4 py-3 text-sm text-zinc-200 hover:bg-white/10"
                >
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <aside className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Platform Flow</h2>
            <ArrowRight className="text-emerald-300" size={20} />
          </div>
          <div className="mt-5 space-y-3 text-sm text-zinc-300">
            {[
              "Profile and skill data",
              "Job search and saved jobs",
              "Application kanban board",
              "Resume analyzer and career assistant",
              "Mentors, companies, and community posts",
            ].map((item) => (
              <div
                key={item}
                className="rounded-md border border-white/10 bg-black px-3 py-3"
              >
                {item}
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold">
            {query ? `Results for "${query}"` : "Latest Opportunities"}
          </h2>
          {loading ? <p className="text-sm text-zinc-400">Loading...</p> : null}
        </div>
        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>
    </main>
  );
}
