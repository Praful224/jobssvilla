"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AnalyticsSummary, apiFetch, getToken } from "@/lib/api";

const emptySummary: AnalyticsSummary = {
  total_jobs: 0,
  applications: 0,
  saved_jobs: 0,
  unread_notifications: 0,
  application_status: {},
};

export default function AnalyticsPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<AnalyticsSummary>(emptySummary);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }

    apiFetch<AnalyticsSummary>("/analytics/summary", { auth: true }).then(
      setSummary,
    );
  }, [router]);

  return (
    <AppShell
      title="Analytics"
      subtitle="Candidate-side analytics for jobs, applications, saved roles, and notifications."
    >
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Jobs", summary.total_jobs],
          ["Applications", summary.applications],
          ["Saved", summary.saved_jobs],
          ["Unread", summary.unread_notifications],
        ].map(([label, value]) => (
          <section
            key={label}
            className="rounded-lg border border-white/10 bg-white/[0.04] p-5"
          >
            <p className="text-sm text-zinc-400">{label}</p>
            <p className="mt-3 text-4xl font-semibold">{value}</p>
          </section>
        ))}
      </div>

      <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <h2 className="text-xl font-semibold">Application Status</h2>
        <div className="mt-4 space-y-3">
          {Object.entries(summary.application_status).map(([status, count]) => (
            <div key={status}>
              <div className="flex justify-between text-sm">
                <span>{status}</span>
                <span>{count}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-emerald-400"
                  style={{
                    width: `${Math.min(
                      100,
                      (count / Math.max(1, summary.applications)) * 100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
