"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  apiFetch,
  Application,
  getToken,
  jsonHeaders,
} from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { Kanban } from "@/components/Kanban";

const emptyForm = {
  company: "",
  role: "",
  location: "",
  status: "Applied",
  source: "JobsVilla",
  notes: "",
};

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }

    loadApplications();
  }, [router]);

  const loadApplications = async () => {
    const data = await apiFetch<Application[]>("/applications", { auth: true });
    setApplications(data);
  };

  const addApplication = async () => {
    await apiFetch<Application>("/applications", {
      auth: true,
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(form),
    });
    setForm(emptyForm);
    setStatus("Application added");
    loadApplications();
  };

  const changeStatus = async (application: Application, nextStatus: string) => {
    await apiFetch<Application>(`/applications/${application.id}`, {
      auth: true,
      method: "PATCH",
      headers: jsonHeaders(),
      body: JSON.stringify({ status: nextStatus }),
    });
    loadApplications();
  };

  return (
    <AppShell
      title="Applications"
      subtitle="Move opportunities through Applied, Review, Interview, Offer, and Rejected states."
    >
      <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <div className="grid gap-3 md:grid-cols-3">
          <input
            value={form.company}
            onChange={(event) =>
              setForm((current) => ({ ...current, company: event.target.value }))
            }
            placeholder="Company"
            className="rounded-md border border-white/10 bg-black px-3 py-3 text-sm outline-none"
          />
          <input
            value={form.role}
            onChange={(event) =>
              setForm((current) => ({ ...current, role: event.target.value }))
            }
            placeholder="Role"
            className="rounded-md border border-white/10 bg-black px-3 py-3 text-sm outline-none"
          />
          <input
            value={form.location}
            onChange={(event) =>
              setForm((current) => ({ ...current, location: event.target.value }))
            }
            placeholder="Location"
            className="rounded-md border border-white/10 bg-black px-3 py-3 text-sm outline-none"
          />
          <select
            value={form.status}
            onChange={(event) =>
              setForm((current) => ({ ...current, status: event.target.value }))
            }
            className="rounded-md border border-white/10 bg-black px-3 py-3 text-sm outline-none"
          >
            {["Applied", "Under Review", "Interview", "Offer", "Rejected"].map(
              (item) => (
                <option key={item}>{item}</option>
              ),
            )}
          </select>
          <input
            value={form.source}
            onChange={(event) =>
              setForm((current) => ({ ...current, source: event.target.value }))
            }
            placeholder="Source"
            className="rounded-md border border-white/10 bg-black px-3 py-3 text-sm outline-none"
          />
          <input
            value={form.notes}
            onChange={(event) =>
              setForm((current) => ({ ...current, notes: event.target.value }))
            }
            placeholder="Notes"
            className="rounded-md border border-white/10 bg-black px-3 py-3 text-sm outline-none"
          />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={addApplication}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-3 text-sm font-medium text-zinc-950 hover:bg-emerald-400"
          >
            <Plus size={17} />
            Add Application
          </button>
          {status ? <p className="text-sm text-emerald-300">{status}</p> : null}
        </div>
      </section>

      <div className="mt-6">
        <Kanban applications={applications} onStatusChange={changeStatus} />
      </div>
    </AppShell>
  );
}
