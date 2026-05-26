"use client";

import { 
  BookmarkPlus, 
  Briefcase, 
  Send, 
  MapPin, 
  DollarSign, 
  Award, 
  ArrowUpRight,
  Share2,
  Star,
  Trash2,
  ClipboardList,
  Clock,
  Calendar,
  UserCheck
} from "lucide-react";
import type { Job } from "@/lib/api";

type JobCardProps = {
  job: Job;
  onSave?: (job: Job) => void;
  onTrack?: (job: Job) => void;
  onRemove?: () => void;
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

export function JobCard({ job, onSave, onTrack, onRemove, match }: JobCardProps) {
  const theme = getCompanyTheme(job.company || "Company");
  const skills = job.skills
    ?.split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)
    .slice(0, 4);

  return (
    <article
      className="group relative rounded-3xl border border-black/5 dark:border-white/5 bg-white/70 dark:bg-zinc-950/70 p-6 backdrop-blur-2xl transition-all duration-350 hover:bg-white dark:hover:bg-zinc-900/40 shadow-[0_12px_40px_rgba(0,0,0,0.02)] dark:shadow-none hover:shadow-[0_16px_50px_rgba(0,0,0,0.05)] hover:border-black/10 dark:hover:border-white/10 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 text-left"
    >
      {/* 1. LEFT COLUMN: Brand Block & Vertically Aligned Specs */}
      <div className="flex flex-col justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] p-4 relative overflow-hidden h-full">
        {/* Subtle decorative theme accent strip inside sidebar */}
        <div className={`absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b ${theme.gradient} opacity-70`} />
        
        <div>
          {/* Brand Logo & Name Box */}
          <div className="flex items-center gap-3 border-b border-black/5 dark:border-white/5 pb-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-md ${theme.glowRing}`}>
              <Briefcase size={18} className="text-zinc-650 dark:text-zinc-300 group-hover:scale-110 transition duration-300" />
            </div>
            <div className="min-w-0">
              <span className={`text-xs font-black uppercase tracking-widest bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent truncate block max-w-[140px]`} title={job.company}>
                {job.company}
              </span>
              <p className="text-[9px] text-zinc-550 dark:text-zinc-500 uppercase tracking-widest font-black mt-0.5">Employer</p>
            </div>
          </div>

          {/* Specs Attributes (Matching BTRST list) */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 text-[10.5px] font-bold text-zinc-700 dark:text-zinc-300">
              <MapPin size={13} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
              <span className="truncate" title={job.location || "Work from anywhere"}>{job.location || "Work from anywhere"}</span>
            </div>
            <div className="flex items-center gap-2 text-[10.5px] font-bold text-zinc-700 dark:text-zinc-300">
              <Clock size={13} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
              <span>Work anytime</span>
            </div>
            <div className="flex items-center gap-2 text-[10.5px] font-bold text-zinc-700 dark:text-zinc-300">
              <Calendar size={13} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
              <span>Full-time | 40 hrs</span>
            </div>
          </div>
        </div>

        {/* Muted Dynamic Timeline Indicator */}
        <div className="border-t border-black/5 dark:border-white/5 mt-4 pt-3 text-[9.5px] text-zinc-450 dark:text-zinc-550 font-black uppercase tracking-widest">
          Posted recently
        </div>
      </div>

      {/* 2. RIGHT COLUMN: Main Job Specs area */}
      <div className="flex flex-col justify-between min-w-0">
        <div>
          {/* Header Row: Badges, Salary, and Top Action Icons */}
          <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center rounded bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 shrink-0">
                Grant
              </span>
              <span className="inline-flex items-center rounded bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 shrink-0">
                New
              </span>
            </div>

            {/* Quick Actions (BTRST Top Right: Share, Star/Save, Track, Remove) */}
            <div className="flex items-center gap-1.5 shrink-0">
              {job.salary && (
                <span className="text-xs font-black text-zinc-950 dark:text-white mr-2">
                  {job.salary}
                </span>
              )}
              
              {/* Copy/Share Link Action */}
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(job.apply_link || "");
                  alert("Apply link copied to clipboard successfully!");
                }}
                className="p-1.5 rounded-lg border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.02] hover:bg-black/5 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition cursor-pointer"
                title="Copy Apply Link"
              >
                <Share2 size={12.5} />
              </button>

              {/* Bookmark Star Toggle */}
              {onSave && (
                <button
                  onClick={() => onSave(job)}
                  className="p-1.5 rounded-lg border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.02] hover:bg-black/5 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 transition cursor-pointer"
                  title="Bookmark Job"
                >
                  <Star size={12.5} />
                </button>
              )}

              {/* Track Application */}
              {onTrack && (
                <button
                  onClick={() => onTrack(job)}
                  className="p-1.5 rounded-lg border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.02] hover:bg-black/5 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400 hover:text-[#2f54eb] dark:hover:text-emerald-400 transition cursor-pointer"
                  title="Add to Tracked Pipeline"
                >
                  <ClipboardList size={12.5} />
                </button>
              )}

              {/* Delete Bookmark Action (only for bookmarked listings) */}
              {onRemove && (
                <button
                  onClick={onRemove}
                  className="p-1.5 rounded-lg border border-red-500/10 bg-red-500/5 hover:bg-red-500/15 text-red-500 dark:text-red-400 transition cursor-pointer"
                  title="Remove Bookmark"
                >
                  <Trash2 size={12.5} />
                </button>
              )}
            </div>
          </div>

          {/* Job Title Heading */}
          <h2 className="mt-2.5 text-lg lg:text-xl font-black text-zinc-950 dark:text-white tracking-tight hover:text-[#2f54eb] dark:hover:text-emerald-400 transition duration-300">
            {job.role}
          </h2>

          {/* Quick specs row underneath title for responsive layout */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[10.5px] font-bold text-zinc-500 dark:text-zinc-450 border-b border-black/5 dark:border-white/5 pb-2.5">
            <span className="flex items-center gap-1">
              <MapPin size={11} className="text-zinc-400 dark:text-zinc-550" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} className="text-zinc-400 dark:text-zinc-550" />
              Work anytime
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={11} className="text-zinc-400 dark:text-zinc-550" />
              40 hrs/week
            </span>
          </div>

          {/* Interactive Resume Matching Indicators ("You Match!") */}
          <div className="mt-4 flex items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-950 dark:text-white">You match!</span>
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-inner">
                <UserCheck size={11} />
              </div>
              <div className="h-5 w-5 rounded-full bg-gradient-to-br from-[#2f54eb] to-cyan-500 text-white flex items-center justify-center font-extrabold text-[8px] shadow">
                P
              </div>
            </div>

            {/* Matching skill pill tags (green ✓) */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {skills?.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wide"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Description Section ("What you'll be working on") */}
          {job.description && (
            <div className="mt-4">
              <h4 className="text-[10.5px] uppercase font-black tracking-widest text-zinc-950 dark:text-white block mb-1">What you'll be working on</h4>
              <p className="text-[11.5px] leading-relaxed text-zinc-550 dark:text-zinc-400 font-bold">
                {job.description}
              </p>
            </div>
          )}

          {/* Missing Concept Gaps Gaps */}
          {match && match.missing_skills.length > 0 && (
            <div className="mt-4 p-3.5 rounded-2xl border border-red-500/10 bg-red-500/[0.01] dark:bg-red-500/[0.02]">
              <span className="font-extrabold text-red-600 dark:text-red-400 uppercase tracking-widest block mb-1.5 text-[8px]">Skills to master:</span>
              <div className="flex flex-wrap gap-1">
                {match.missing_skills.map((skill) => (
                  <span key={skill} className="rounded-lg bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[8px] uppercase tracking-wide text-red-600 dark:text-red-400 font-bold font-mono">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Primary View Job Action CTA Button */}
        <div className="mt-5 flex justify-end">
          <a
            href={job.apply_link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 dark:bg-zinc-100 hover:bg-zinc-900 dark:hover:bg-zinc-200 px-6 py-2.5 text-xs font-black text-white-force text-white dark:text-zinc-950 shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-95 cursor-pointer"
          >
            <span>View job</span>
            <ArrowUpRight size={13} className="stroke-[2.5]" />
          </a>
        </div>
      </div>
    </article>
  );
}
