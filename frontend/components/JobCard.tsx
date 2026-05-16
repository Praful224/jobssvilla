"use client";

import { BookmarkPlus, Briefcase, Send } from "lucide-react";
import type { Job } from "@/lib/api";

type JobCardProps = {
  job: Job;
  onSave?: (job: Job) => void;
  onTrack?: (job: Job) => void;
};

export function JobCard({ job, onSave, onTrack }: JobCardProps) {
  const skills = job.skills
    ?.split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)
    .slice(0, 4);

  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.04] p-5 transition hover:border-emerald-400/40 hover:bg-white/[0.07]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-cyan-400 text-zinc-950">
            <Briefcase size={21} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-xl font-semibold text-white">
              {job.role}
            </h3>
            <p className="mt-1 text-sm text-zinc-400">{job.company}</p>
          </div>
        </div>
        {job.salary ? (
          <span className="shrink-0 rounded-md bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-200">
            {job.salary}
          </span>
        ) : null}
      </div>

      <p className="mt-4 text-sm text-zinc-400">{job.location}</p>
      {job.description ? (
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-300">
          {job.description}
        </p>
      ) : null}

      {skills?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-zinc-300"
            >
              {skill}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <a
          href={job.apply_link}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200"
        >
          <Send size={16} />
          Apply
        </a>
        {onTrack ? (
          <button
            onClick={() => onTrack(job)}
            className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-zinc-200 hover:bg-white/10"
          >
            <Briefcase size={16} />
            Track
          </button>
        ) : null}
        {onSave ? (
          <button
            onClick={() => onSave(job)}
            className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-zinc-200 hover:bg-white/10"
          >
            <BookmarkPlus size={16} />
            Save
          </button>
        ) : null}
      </div>
    </article>
  );
}
