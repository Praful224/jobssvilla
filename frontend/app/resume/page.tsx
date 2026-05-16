"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getToken, ResumeRecord } from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { LatexResumeBuilder } from "@/components/LatexResumeBuilder";
import { ResumeBuilder } from "@/components/ResumeBuilder";

export default function ResumePage() {
  const router = useRouter();
  const [resume, setResume] = useState<ResumeRecord | undefined>();

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }

    apiFetch<ResumeRecord>("/resume", { auth: true }).then((data) => {
      setResume(Object.keys(data).length ? data : undefined);
    });
  }, [router]);

  return (
    <AppShell
      title="Resume Studio"
      subtitle="Analyze ATS fit, edit LaTeX templates, compile PDFs, and save resume drafts."
    >
      <div className="space-y-6">
        <ResumeBuilder key={resume?.id || "new"} initialResume={resume} />
        <LatexResumeBuilder />
      </div>
    </AppShell>
  );
}
