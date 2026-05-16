"use client";

import { useEffect, useMemo, useState } from "react";
import { Code2, Download, FileText, Play, Save } from "lucide-react";
import {
  API_BASE_URL,
  apiFetch,
  getToken,
  jsonHeaders,
  LatexResumeRecord,
  LatexTemplate,
} from "@/lib/api";

export function LatexResumeBuilder() {
  const [templates, setTemplates] = useState<LatexTemplate[]>([]);
  const [title, setTitle] = useState("Praful Resume");
  const [templateName, setTemplateName] = useState("classic");
  const [latexSource, setLatexSource] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.name === templateName),
    [templateName, templates],
  );

  useEffect(() => {
    const loadLatexResume = async () => {
      const templateData = await apiFetch<{ templates: LatexTemplate[] }>(
        "/resume/latex/templates",
      );
      setTemplates(templateData.templates);

      const saved = await apiFetch<LatexResumeRecord>("/resume/latex", {
        auth: true,
      }).catch((): LatexResumeRecord => ({}));

      if (saved.latex_source) {
        setTitle(saved.title || "My Resume");
        setTemplateName(saved.template_name || "classic");
        setLatexSource(saved.latex_source);
        return;
      }

      const firstTemplate = templateData.templates[0];
      if (firstTemplate) {
        setTemplateName(firstTemplate.name);
        setLatexSource(firstTemplate.source);
      }
    };

    loadLatexResume();
  }, []);

  const applyTemplate = (name: string) => {
    const template = templates.find((item) => item.name === name);
    setTemplateName(name);

    if (template) {
      setLatexSource(template.source);
      setStatus(`${template.label} template loaded`);
    }
  };

  const saveDraft = async () => {
    setError("");
    setStatus("Saving LaTeX resume");

    try {
      await apiFetch<LatexResumeRecord>("/resume/latex", {
        auth: true,
        method: "PUT",
        headers: jsonHeaders(),
        body: JSON.stringify({
          title,
          template_name: templateName,
          latex_source: latexSource,
        }),
      });

      setStatus("LaTeX draft saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save draft");
      setStatus("");
    }
  };

  const compilePdf = async () => {
    setError("");
    setStatus("Compiling PDF");

    const headers = new Headers(jsonHeaders());
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/resume/latex/render`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          title,
          latex_source: latexSource,
        }),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF compile failed");
      setStatus("");
      return;
    }

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      const detail =
        typeof data?.detail === "string" ? data.detail : "PDF compile failed";
      setError(detail);
      setStatus("");
      return;
    }

    const blob = await response.blob();
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }

    setPdfUrl(URL.createObjectURL(blob));
    setStatus("PDF ready");
  };

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-300 text-zinc-950">
              <Code2 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">LaTeX Resume PDF</h2>
              <p className="text-sm text-zinc-400">
                Edit a resume template, compile it, preview the PDF, then download it.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={saveDraft}
            className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-zinc-200 hover:bg-white/10"
          >
            <Save size={16} />
            Save Draft
          </button>
          <button
            onClick={compilePdf}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400"
          >
            <Play size={16} />
            Compile PDF
          </button>
          {pdfUrl ? (
            <a
              href={pdfUrl}
              download={`${title || "resume"}.pdf`}
              className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200"
            >
              <Download size={16} />
              Download
            </a>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Resume title"
          className="rounded-md border border-white/10 bg-black px-3 py-3 text-sm outline-none"
        />
        <select
          value={templateName}
          onChange={(event) => applyTemplate(event.target.value)}
          className="rounded-md border border-white/10 bg-black px-3 py-3 text-sm outline-none"
        >
          {templates.map((template) => (
            <option key={template.name} value={template.name}>
              {template.label}
            </option>
          ))}
        </select>
      </div>

      {selectedTemplate ? (
        <p className="mt-3 text-xs text-zinc-500">
          Current template: {selectedTemplate.label}
        </p>
      ) : null}

      <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <textarea
          value={latexSource}
          onChange={(event) => setLatexSource(event.target.value)}
          rows={24}
          spellCheck={false}
          className="min-h-[560px] w-full resize-y rounded-md border border-white/10 bg-black px-4 py-4 font-mono text-sm leading-6 text-zinc-100 outline-none"
        />

        <aside className="rounded-md border border-white/10 bg-black p-3">
          <div className="flex items-center gap-2 text-sm text-zinc-300">
            <FileText size={17} />
            PDF Preview
          </div>
          <div className="mt-3 h-[520px] overflow-hidden rounded-md border border-white/10 bg-zinc-900">
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                title="Resume PDF preview"
                className="h-full w-full bg-white"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-5 text-center text-sm text-zinc-500">
                Compile the LaTeX source to preview the PDF here.
              </div>
            )}
          </div>
        </aside>
      </div>

      {status ? <p className="mt-4 text-sm text-emerald-300">{status}</p> : null}
      {error ? (
        <pre className="mt-4 max-h-64 overflow-auto rounded-md border border-red-400/30 bg-red-950/40 p-4 text-xs leading-5 text-red-100">
          {error}
        </pre>
      ) : null}
    </section>
  );
}
