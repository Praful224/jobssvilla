"use client";

import { useState } from "react";
import { FileText, Save, Sparkles } from "lucide-react";
import {
  apiFetch,
  jsonHeaders,
  ResumeAnalysis,
  ResumeRecord,
} from "@/lib/api";

type ResumeBuilderProps = {
  initialResume?: ResumeRecord;
};

export function ResumeBuilder({ initialResume }: ResumeBuilderProps) {
  const [fileName, setFileName] = useState(initialResume?.file_name || "");
  const [targetRole, setTargetRole] = useState("");
  const [skills, setSkills] = useState(initialResume?.skills || "");
  const [content, setContent] = useState(initialResume?.content || "");
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [status, setStatus] = useState("");

  const analyze = async () => {
    setStatus("Analyzing resume");
    const data = await apiFetch<ResumeAnalysis>("/resume/analyze", {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({
        content,
        target_role: targetRole,
      }),
    });
    setAnalysis(data);
    setStatus("Analysis ready");
  };

  const save = async () => {
    setStatus("Saving resume");
    const data = await apiFetch<ResumeRecord>("/resume", {
      auth: true,
      method: "PUT",
      headers: jsonHeaders(),
      body: JSON.stringify({
        file_name: fileName,
        content,
        skills,
        target_role: targetRole,
      }),
    });
    setAnalysis({
      ats_score: data.ats_score || 0,
      keyword_score: data.keyword_score || 0,
      matched_keywords: [],
      missing_keywords: [],
      suggestions: data.suggestions?.split("\n").filter(Boolean) || [],
    });
    setStatus("Resume saved");
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={fileName}
            onChange={(event) => setFileName(event.target.value)}
            placeholder="Resume file name"
            className="rounded-md border border-white/10 bg-black px-3 py-3 text-sm outline-none"
          />
          <input
            value={targetRole}
            onChange={(event) => setTargetRole(event.target.value)}
            placeholder="Target role"
            className="rounded-md border border-white/10 bg-black px-3 py-3 text-sm outline-none"
          />
        </div>
        <input
          value={skills}
          onChange={(event) => setSkills(event.target.value)}
          placeholder="Skills"
          className="mt-3 w-full rounded-md border border-white/10 bg-black px-3 py-3 text-sm outline-none"
        />
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={16}
          placeholder="Paste resume text"
          className="mt-3 w-full resize-y rounded-md border border-white/10 bg-black px-3 py-3 text-sm leading-6 outline-none"
        />

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={analyze}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-3 text-sm font-medium text-zinc-950 hover:bg-emerald-400"
          >
            <Sparkles size={17} />
            Analyze
          </button>
          <button
            onClick={save}
            className="inline-flex items-center gap-2 rounded-md border border-white/10 px-4 py-3 text-sm text-zinc-200 hover:bg-white/10"
          >
            <Save size={17} />
            Save
          </button>
          {status ? (
            <span className="self-center text-sm text-zinc-400">{status}</span>
          ) : null}
        </div>
      </section>

      <aside className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-400 text-zinc-950">
            <FileText size={20} />
          </div>
          <div>
            <h2 className="font-semibold">ATS Score</h2>
            <p className="text-sm text-zinc-400">
              {analysis?.ats_score ?? initialResume?.ats_score ?? 0}/100
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <p className="text-sm text-zinc-400">Keyword score</p>
            <p className="mt-1 text-3xl font-semibold">
              {analysis?.keyword_score ?? initialResume?.keyword_score ?? 0}%
            </p>
          </div>

          {analysis?.matched_keywords.length ? (
            <div>
              <p className="text-sm text-zinc-400">Matched</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {analysis.matched_keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-md bg-emerald-400/10 px-2 py-1 text-xs text-emerald-200"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {(analysis?.suggestions || initialResume?.suggestions?.split("\n")) ? (
            <div>
              <p className="text-sm text-zinc-400">Suggestions</p>
              <ul className="mt-2 space-y-2 text-sm text-zinc-300">
                {(analysis?.suggestions ||
                  initialResume?.suggestions?.split("\n").filter(Boolean) ||
                  []
                ).map((suggestion) => (
                  <li key={suggestion} className="rounded-md bg-black p-3">
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
