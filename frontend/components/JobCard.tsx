"use client";

import { BookmarkPlus, Briefcase, Send, MapPin, DollarSign, Award, ArrowUpRight } from "lucide-react";
import type { Job } from "@/lib/api";

type JobCardProps = {
  job: Job;
  onSave?: (job: Job) => void;
  onTrack?: (job: Job) => void;
  match?: {
    score: number;
    matched_skills: string[];
    missing_skills: string[];
  };
};

// Generates a stunning HSL theme dynamically based on the company name to guarantee a visually rich, diverse card layout
const getCompanyTheme = (company: string) => {
  const sum = company.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const themes = [
    {
      glow: "shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:border-cyan-500/40",
      gradient: "from-cyan-400 to-blue-500",
      badge: "bg-cyan-500/10 border-cyan-500/20 text-cyan-300",
      glowRing: "border-cyan-500/30 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]",
    },
    {
      glow: "shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:border-emerald-500/40",
      gradient: "from-emerald-400 to-teal-500",
      badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
      glowRing: "border-emerald-500/30 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]",
    },
    {
      glow: "shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:border-violet-500/40",
      gradient: "from-violet-400 to-purple-500",
      badge: "bg-violet-500/10 border-violet-500/20 text-violet-300",
      glowRing: "border-violet-500/30 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]",
    },
    {
      glow: "shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:border-amber-500/40",
      gradient: "from-amber-400 to-rose-500",
      badge: "bg-amber-500/10 border-amber-500/20 text-amber-300",
      glowRing: "border-amber-500/30 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]",
    },
  ];
  return themes[sum % themes.length];
};

export function JobCard({ job, onSave, onTrack, match }: JobCardProps) {
  const theme = getCompanyTheme(job.company || "Company");
  const skills = job.skills
    ?.split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)
    .slice(0, 4);

  return (
    <article
      className={`group relative rounded-3xl border border-white/5 bg-zinc-950/40 p-6 backdrop-blur-xl transition-all duration-300 hover:bg-zinc-900/40 hover:-translate-y-1.5 ${theme.glow}`}
    >
      {/* Mesh Gradient Background Spot */}
      <div className={`absolute -right-16 -top-16 h-32 w-32 rounded-full bg-gradient-to-tr ${theme.gradient} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-10`} />

      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex min-w-0 items-start gap-4">
          {/* Dynamic 3D Floating Logo Container */}
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-zinc-950 text-white transition-all duration-300 ${theme.glowRing}`}
          >
            <Briefcase size={22} className="group-hover:scale-110 transition duration-300 text-zinc-300" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center flex-wrap gap-2">
              <h3 className="truncate text-lg font-bold text-white tracking-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-zinc-300 group-hover:bg-clip-text transition duration-300">
                {job.role}
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
              {match && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider shrink-0 ${
                  match.score >= 80 
                    ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400"
                    : match.score >= 50
                    ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                    : "bg-white/5 border border-white/10 text-zinc-400"
                }`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current animate-ping" />
                  {match.score}% Fit
                </span>
              )}
            </div>
            
            {/* Gradient Text for Company Name */}
            <p className={`mt-1 text-sm font-semibold bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
              {job.company}
            </p>
          </div>
        </div>

        {job.salary ? (
          <span className={`shrink-0 rounded-xl px-3 py-1 text-xs font-bold border ${theme.badge}`}>
            {job.salary}
          </span>
        ) : null}
      </div>

      {/* Location Badge */}
      <div className="mt-4 flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
        <MapPin size={13} className="text-zinc-500 shrink-0" />
        <span>{job.location}</span>
      </div>

      {job.description ? (
        <p className="mt-3.5 line-clamp-3 text-xs leading-relaxed text-zinc-400 font-medium group-hover:text-zinc-300 transition duration-300">
          {job.description}
        </p>
      ) : null}

      {/* Show missing concept gaps if any */}
      {match && match.missing_skills.length > 0 && (
        <div className="mt-4 p-3 rounded-2xl border border-white/5 bg-white/[0.01] text-[10px] leading-relaxed text-zinc-500">
          <span className="font-extrabold text-zinc-400 uppercase tracking-widest block mb-1 text-[8px]">Concept gaps to unlock 100% fit:</span>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {match.missing_skills.map((skill) => (
              <span key={skill} className="rounded bg-red-500/5 border border-red-500/15 px-2 py-0.5 text-[8px] uppercase tracking-wide text-red-400 font-bold font-mono">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Animated Skills Badges */}
      {skills?.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10 px-3 py-1.5 text-[10px] text-zinc-400 hover:text-white font-bold uppercase tracking-wider transition-all duration-200"
            >
              {skill}
            </span>
          ))}
        </div>
      ) : null}

      {/* High-fidelity Interactive CTA Action Row */}
      <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between gap-3 relative z-10">
        <div className="flex gap-2">
          {onTrack ? (
            <button
              onClick={() => onTrack(job)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/5 hover:border-white/10 bg-white/[0.02] hover:bg-white/5 px-4 py-2.5 text-xs font-bold text-zinc-300 hover:text-white transition-all duration-200 active:scale-95"
            >
              <Briefcase size={13} />
              Track
            </button>
          ) : null}
          {onSave ? (
            <button
              onClick={() => onSave(job)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/5 hover:border-white/10 bg-white/[0.02] hover:bg-white/5 px-4 py-2.5 text-xs font-bold text-zinc-300 hover:text-white transition-all duration-200 active:scale-95"
            >
              <BookmarkPlus size={13} />
              Save
            </button>
          ) : null}
        </div>

        <a
          href={job.apply_link}
          target="_blank"
          rel="noreferrer"
          className={`inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r ${theme.gradient} px-5 py-2.5 text-xs font-extrabold text-zinc-950 hover:brightness-110 shadow-lg shadow-cyan-500/10 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-200 active:scale-95`}
        >
          <Send size={13} />
          Apply
          <ArrowUpRight size={13} />
        </a>
      </div>
    </article>
  );
}
