"use client";

import { useEffect, useState } from "react";
import { CalendarPlus, Plus, Users } from "lucide-react";
import { apiFetch, jsonHeaders, Mentor } from "@/lib/api";
import { AppShell } from "@/components/AppShell";

const emptyMentor = {
  name: "",
  title: "",
  company: "",
  skills: "",
  hourly_rate: "",
  availability: "",
  bio: "",
};

export default function MentorshipPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [form, setForm] = useState(emptyMentor);
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadMentors();
  }, []);

  const loadMentors = async () => {
    const data = await apiFetch<Mentor[]>("/mentors");
    setMentors(data);
  };

  const addMentor = async () => {
    await apiFetch<Mentor>("/mentors", {
      auth: true,
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(form),
    });
    setForm(emptyMentor);
    setStatus("Mentor profile added");
    loadMentors();
  };

  const requestInterview = async (mentor: Mentor) => {
    await apiFetch("/mentors/interviews", {
      auth: true,
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({
        mentor_id: mentor.id,
        interview_type: "mock",
        scheduled_for: "TBD",
      }),
    });
    setStatus(`Interview requested with ${mentor.name}`);
  };

  return (
    <AppShell
      title="Mentorship Market"
      subtitle="Create mentor profiles and request mock interviews from the marketplace."
    >
      <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <div className="grid gap-3 md:grid-cols-3">
          {Object.keys(emptyMentor).map((field) => (
            <input
              key={field}
              value={form[field as keyof typeof emptyMentor]}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  [field]: event.target.value,
                }))
              }
              placeholder={field.replace("_", " ")}
              className="rounded-md border border-white/10 bg-black px-3 py-3 text-sm capitalize outline-none"
            />
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={addMentor}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-3 text-sm font-medium text-zinc-950 hover:bg-emerald-400"
          >
            <Plus size={17} />
            Add Mentor
          </button>
          {status ? <p className="text-sm text-emerald-300">{status}</p> : null}
        </div>
      </section>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mentors.map((mentor) => (
          <article
            key={mentor.id}
            className="rounded-lg border border-white/10 bg-white/[0.04] p-5"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-amber-300 text-zinc-950">
              <Users size={21} />
            </div>
            <h2 className="mt-4 text-xl font-semibold">{mentor.name}</h2>
            <p className="mt-1 text-sm text-zinc-400">{mentor.title}</p>
            <p className="mt-3 text-sm text-zinc-300">{mentor.bio}</p>
            <p className="mt-4 text-sm text-zinc-500">{mentor.skills}</p>
            <button
              onClick={() => requestInterview(mentor)}
              className="mt-5 inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-zinc-200 hover:bg-white/10"
            >
              <CalendarPlus size={16} />
              Request Interview
            </button>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
