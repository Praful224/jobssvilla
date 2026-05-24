"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Briefcase, Route, Sparkles, Users, Search, Compass, BookOpen, Layers, CheckCircle2, Shield, Heart } from "lucide-react";
import { apiFetch, Job } from "@/lib/api";
import { JobCard } from "@/components/JobCard";
import { SearchBar } from "@/components/SearchBar";
import { TiltCard } from "@/components/TiltCard";
import { CareerDashboardVisual } from "@/components/CareerDashboardVisual";

const quickLinks = [
  { href: "/dashboard", label: "Dashboard Hub", icon: Briefcase, color: "text-cyan-400" },
  { href: "/resume", label: "Resume AI", icon: Sparkles, color: "text-emerald-400" },
  { href: "/mentorship", label: "Mentorship", icon: Users, color: "text-amber-400" },
  { href: "/roadmap", label: "Skills Roadmap", icon: Route, color: "text-rose-400" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLoggedIn(!!localStorage.getItem("token"));
    }
  }, []);

  const searchJobs = async () => {
    setLoading(true);
    setError("");

    try {
      const path = query.trim()
        ? `/jobs/search?q=${encodeURIComponent(query)}`
        : "/jobs";
      const data = await apiFetch<Job[]>(path);
      setJobs(data);
      
      // Smooth scroll to the results section showing the top-to-bottom transition
      setTimeout(() => {
        const el = document.getElementById("jobs-results");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#060608] text-white overflow-hidden cyber-grid">
      {/* Dynamic Ambient Blur Blobs */}
      <div className="ambient-blob-1" />
      <div className="ambient-blob-2" />
      <div className="ambient-blob-3" />

      {/* Premium Glass Header */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sticky top-0 z-30 bg-zinc-950/20 backdrop-blur-md border-b border-white/5">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition duration-300">
            <Compass size={22} className="animate-spin-slow" />
          </div>
          <span className="text-2xl font-bold tracking-tight">
            Jobs<span className="text-emerald-400 group-hover:text-emerald-300 transition">Villa</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="neon-btn rounded-xl bg-emerald-500 px-5 py-3 text-xs font-bold text-zinc-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/10 transition"
            >
              Go to Workspace
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-xl border border-white/10 px-5 py-3 text-xs font-bold text-zinc-300 hover:bg-white/5 transition hover:text-white"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="neon-btn rounded-xl bg-emerald-500 px-5 py-3 text-xs font-bold text-zinc-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/10 transition"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1fr_480px] items-center relative z-10">
        <div className="flex flex-col justify-center">
          <div className="inline-flex self-start rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-xs font-bold text-emerald-300 gap-2 items-center">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            ✨ Live 3D Next-Gen Workflows Active
          </div>
          <h1 className="mt-8 max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight md:text-7xl">
            Welcome to the <br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-300 bg-clip-text text-transparent">
              Next-Gen Pipeline
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
            Experience the future of talent sourcing and career scaling. Search top jobs, evaluate resumes with Gemini AI rating engines, schedule instant 1:1 mentorship bookings, and track applications on fully synced Recruiter Kanban pipelines.
          </p>

          {/* Search Box with 3D Cyber Border */}
          <div className="mt-10 max-w-3xl cyber-border-flow rounded-3xl p-0.5">
            <div className="glass-3d bg-zinc-950/70 p-2.5 rounded-3xl flex items-center">
              <Search className="text-zinc-500 ml-4 shrink-0" size={20} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search job roles, companies, or programming skills..."
                className="flex-1 bg-transparent px-4 py-3.5 text-sm text-white outline-none placeholder:text-zinc-500"
              />
              <button
                onClick={searchJobs}
                className="neon-btn rounded-2xl bg-emerald-500 px-7 py-3.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400 shrink-0 shadow-lg shadow-emerald-500/20"
              >
                Search Jobs
              </button>
            </div>
          </div>

          {/* Interactive Tilt Quicklinks */}
          <div className="mt-8">
            <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase mb-3">Instant Access Hub</p>
            <div className="flex flex-wrap gap-3">
              {quickLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <TiltCard
                      maxTilt={20}
                      scale={1.05}
                      className="glass-3d bg-white/[0.01] flex items-center gap-3 border border-white/5 px-5 py-3.5 rounded-2xl text-xs font-bold text-zinc-200 card-glow-cyan"
                    >
                      <Icon size={16} className={item.color} />
                      {item.label}
                    </TiltCard>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: FastAPI Live Sandbox Component */}
        <div className="w-full relative">
          {/* Neon background light burst */}
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-cyan-500/10 blur-[80px] -z-10 rounded-full" />
          <TiltCard maxTilt={8} scale={1.01} className="w-full">
            <CareerDashboardVisual />
          </TiltCard>
        </div>
      </section>

      {/* Feature Showcase Grid (FastAPI website style showcase) */}
      <section className="mx-auto max-w-7xl px-6 py-20 border-t border-white/5 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold md:text-5xl bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Living in the Next Generation
          </h2>
          <p className="mt-4 text-zinc-400 text-sm md:text-base leading-relaxed">
            Our ecosystem integrates all career features into one synchronous live database pipeline. No mock static files, no disconnected paths.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "AI Core Resume Evaluator",
              desc: "Get instantaneous ATS scoring, match analytics, and dynamic keyword additions using Google Gemini flash LLMs.",
              icon: Sparkles,
              color: "from-emerald-500 to-teal-500",
              link: "/resume",
            },
            {
              title: "Interactive Recruiter Kanban",
              desc: "Drag candidates across statuses to trigger automatic candidate profile notification logs on their active portal.",
              icon: Layers,
              color: "from-cyan-500 to-blue-500",
              link: "/recruiter",
            },
            {
              title: "Expert 1:1 Mentorship",
              desc: "Schedule mock consultation slots and instantly generate functional Google Meet rooms.",
              icon: Users,
              color: "from-amber-500 to-orange-500",
              link: "/mentorship",
            },
            {
              title: "Professional Community Circles",
              desc: "Write posts, share tips, and experience persisted likes that sync active engagement variables.",
              icon: Heart,
              color: "from-rose-500 to-pink-500",
              link: "/community",
            },
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <Link href={feat.link} key={i}>
                <TiltCard className="h-full glass-3d bg-white/[0.01] border border-white/5 p-6 rounded-3xl flex flex-col justify-between card-glow-cyan">
                  <div className="space-y-4">
                    <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${feat.color} flex items-center justify-center text-zinc-950 shadow-lg shadow-cyan-500/10`}>
                      <Icon size={22} />
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{feat.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{feat.desc}</p>
                  </div>
                  <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-emerald-400 group">
                    Launch Tool <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
                  </div>
                </TiltCard>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Results / Opportunities Section */}
      <section id="jobs-results" className="mx-auto max-w-7xl px-6 pb-24 relative z-10">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5 mb-8">
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Briefcase size={22} className="text-emerald-400" />
            {query ? `Search Results for "${query}"` : "Active Career Opportunities"}
          </h2>
          {loading ? (
            <span className="text-xs text-zinc-400 bg-white/5 px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
              <RefreshIcon /> Querying SQLite...
            </span>
          ) : null}
        </div>
        {error ? <p className="mt-3 text-sm text-rose-300 font-semibold">{error}</p> : null}
        
        {jobs.length === 0 && !loading ? (
          <div className="h-64 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-zinc-950/20 backdrop-blur-sm">
            <Briefcase size={40} className="text-zinc-700 mb-3" />
            <span className="text-zinc-500 text-sm font-semibold">No active listings match.</span>
            <span className="text-zinc-600 text-xs mt-1">Submit opportunities in the Recruiter dashboard or run a new search.</span>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <TiltCard key={job.id} maxTilt={10} scale={1.02}>
                <JobCard job={job} />
              </TiltCard>
            ))}
          </div>
        )}
      </section>

      {/* High-tech Footer */}
      <footer className="mx-auto max-w-7xl px-6 py-10 border-t border-white/5 text-center text-xs text-zinc-600 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-emerald-500 text-zinc-950 flex items-center justify-center font-bold">V</div>
            <span className="font-semibold text-zinc-400">JobsVilla Next-Gen</span>
          </div>
          <p>© 2026 JobsVilla Careers. Powered by FastAPI, SQLAlchemy & SQLite.</p>
        </div>
      </footer>
    </div>
  );
}

function RefreshIcon() {
  return (
    <svg className="animate-spin h-3.5 w-3.5 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
