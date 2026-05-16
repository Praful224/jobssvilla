"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getToken, ResumeRecord } from "@/lib/api";
import { AppShell } from "@/components/AppShell";
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
      title="Resume Builder"
      subtitle="Analyze ATS fit, track keywords, and save resume content for matching."
    >
      <ResumeBuilder key={resume?.id || "new"} initialResume={resume} />
    </AppShell>
  );
}
