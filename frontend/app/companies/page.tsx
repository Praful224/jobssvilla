"use client";

import { useEffect, useState } from "react";
import { Building2, Plus } from "lucide-react";
import { apiFetch, Company, jsonHeaders } from "@/lib/api";
import { AppShell } from "@/components/AppShell";

const emptyCompany = {
  name: "",
  website: "",
  industry: "",
  size: "",
  location: "",
  description: "",
  logo_url: "",
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [form, setForm] = useState(emptyCompany);
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    const data = await apiFetch<Company[]>("/companies");
    setCompanies(data);
  };

  const addCompany = async () => {
    await apiFetch<Company>("/companies", {
      auth: true,
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(form),
    });
    setForm(emptyCompany);
    setStatus("Company added");
    loadCompanies();
  };

  return (
    <AppShell
      title="Company Pages"
      subtitle="Company profiles and reviews are ready for recruiter and candidate workflows."
    >
      <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <div className="grid gap-3 md:grid-cols-3">
          {Object.keys(emptyCompany).map((field) => (
            <input
              key={field}
              value={form[field as keyof typeof emptyCompany]}
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
            onClick={addCompany}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-3 text-sm font-medium text-zinc-950 hover:bg-emerald-400"
          >
            <Plus size={17} />
            Add Company
          </button>
          {status ? <p className="text-sm text-emerald-300">{status}</p> : null}
        </div>
      </section>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {companies.map((company) => (
          <article
            key={company.id}
            className="rounded-lg border border-white/10 bg-white/[0.04] p-5"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-cyan-400 text-zinc-950">
              <Building2 size={21} />
            </div>
            <h2 className="mt-4 text-xl font-semibold">{company.name}</h2>
            <p className="mt-1 text-sm text-zinc-400">{company.industry}</p>
            <p className="mt-3 text-sm text-zinc-300">{company.description}</p>
            <p className="mt-4 text-sm text-zinc-500">{company.location}</p>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
