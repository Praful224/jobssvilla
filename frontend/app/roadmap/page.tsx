"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";

const groups = [
  {
    title: "Frontend",
    nodes: [
      ["Dashboard", "/dashboard", "existing"],
      ["Profile", "/profile", "existing"],
      ["Applications", "/applications", "existing"],
      ["Saved Jobs", "/saved-jobs", "existing"],
      ["Company pages", "/companies", "new"],
      ["Recruiter portal", "/recruiter", "new"],
      ["Mentorship market", "/mentorship", "new"],
      ["Community feed", "/community", "new"],
      ["Resume builder", "/resume", "new"],
    ],
  },
  {
    title: "API Gateway",
    nodes: [
      ["/auth", "/login", "existing"],
      ["/jobs", "/dashboard", "existing"],
      ["/profile", "/profile", "in progress"],
      ["/applications", "/applications", "in progress"],
      ["/notifications", "/notifications", "in progress"],
      ["/resume", "/resume", "new"],
      ["/recruiter", "/recruiter", "new"],
      ["/mentors", "/mentorship", "new"],
      ["/analytics", "/analytics", "new"],
      ["/ai", "/resume", "new"],
      ["/community", "/community", "new"],
    ],
  },
  {
    title: "Intelligence",
    nodes: [
      ["Resume analyzer", "/resume", "new"],
      ["Recommendation", "/dashboard", "new"],
      ["Career assistant", "/dashboard", "new"],
      ["Skill gap AI", "/resume", "new"],
      ["Vector DB", "/roadmap", "planned"],
      ["LLM API", "/roadmap", "planned"],
    ],
  },
  {
    title: "Integrations",
    nodes: [
      ["Telegram bot", "/notifications", "planned"],
      ["Email service", "/notifications", "planned"],
      ["LinkedIn OAuth", "/profile", "planned"],
      ["GitHub OAuth", "/profile", "planned"],
      ["Payments", "/mentorship", "planned"],
      ["Calendar", "/mentorship", "planned"],
      ["ATS bridge", "/recruiter", "planned"],
    ],
  },
];

const statusClass: Record<string, string> = {
  existing: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  "in progress": "border-amber-300/40 bg-amber-300/10 text-amber-100",
  new: "border-cyan-300/40 bg-cyan-300/10 text-cyan-100",
  planned: "border-white/10 bg-white/[0.04] text-zinc-300",
};

export default function RoadmapPage() {
  return (
    <AppShell
      title="Roadmap"
      subtitle="Clickable feature map for the extended JobsVilla architecture."
    >
      <div className="grid gap-5 xl:grid-cols-2">
        {groups.map((group) => (
          <section
            key={group.title}
            className="rounded-lg border border-white/10 bg-white/[0.04] p-5"
          >
            <h2 className="text-xl font-semibold">{group.title}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {group.nodes.map(([label, href, status]) => (
                <Link
                  key={`${group.title}-${label}`}
                  href={href}
                  className={`rounded-md border px-3 py-3 text-sm transition hover:bg-white/10 ${statusClass[status]}`}
                >
                  <span className="block font-medium">{label}</span>
                  <span className="mt-1 block text-xs opacity-80">{status}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
