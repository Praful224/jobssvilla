"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { apiFetch, getToken, jsonHeaders, Profile } from "@/lib/api";
import { AppShell } from "@/components/AppShell";

const emptyProfile: Profile = {
  full_name: "",
  title: "",
  phone: "",
  location: "",
  bio: "",
  skills: "",
  experience: "",
  education: "",
  portfolio_url: "",
  github_url: "",
  linkedin_url: "",
  resume_url: "",
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }

    apiFetch<Profile>("/profile", { auth: true }).then(setProfile);
  }, [router]);

  const updateField = (field: keyof Profile, value: string) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const saveProfile = async () => {
    const data = await apiFetch<Profile>("/profile", {
      auth: true,
      method: "PUT",
      headers: jsonHeaders(),
      body: JSON.stringify(profile),
    });
    setProfile(data);
    setStatus("Profile saved");
  };

  return (
    <AppShell
      title="Profile"
      subtitle="Keep your career identity, skills, links, and resume location in one place."
    >
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-emerald-500 text-4xl font-semibold text-zinc-950">
            {(profile.full_name || profile.name || "U").charAt(0).toUpperCase()}
          </div>
          <h2 className="mt-5 text-2xl font-semibold">
            {profile.full_name || profile.name || "User"}
          </h2>
          <p className="mt-1 text-sm text-zinc-400">{profile.email}</p>
          <p className="mt-4 text-sm text-zinc-300">{profile.title}</p>
          {status ? <p className="mt-4 text-sm text-emerald-300">{status}</p> : null}
        </aside>

        <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={profile.full_name || ""}
              onChange={(event) => updateField("full_name", event.target.value)}
              placeholder="Full name"
              className="rounded-md border border-white/10 bg-black px-3 py-3 text-sm outline-none"
            />
            <input
              value={profile.title || ""}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Professional title"
              className="rounded-md border border-white/10 bg-black px-3 py-3 text-sm outline-none"
            />
            <input
              value={profile.phone || ""}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="Phone"
              className="rounded-md border border-white/10 bg-black px-3 py-3 text-sm outline-none"
            />
            <input
              value={profile.location || ""}
              onChange={(event) => updateField("location", event.target.value)}
              placeholder="Location"
              className="rounded-md border border-white/10 bg-black px-3 py-3 text-sm outline-none"
            />
            <input
              value={profile.github_url || ""}
              onChange={(event) => updateField("github_url", event.target.value)}
              placeholder="GitHub URL"
              className="rounded-md border border-white/10 bg-black px-3 py-3 text-sm outline-none"
            />
            <input
              value={profile.linkedin_url || ""}
              onChange={(event) => updateField("linkedin_url", event.target.value)}
              placeholder="LinkedIn URL"
              className="rounded-md border border-white/10 bg-black px-3 py-3 text-sm outline-none"
            />
            <input
              value={profile.portfolio_url || ""}
              onChange={(event) =>
                updateField("portfolio_url", event.target.value)
              }
              placeholder="Portfolio URL"
              className="rounded-md border border-white/10 bg-black px-3 py-3 text-sm outline-none"
            />
            <input
              value={profile.resume_url || ""}
              onChange={(event) => updateField("resume_url", event.target.value)}
              placeholder="Resume URL"
              className="rounded-md border border-white/10 bg-black px-3 py-3 text-sm outline-none"
            />
          </div>

          <textarea
            value={profile.bio || ""}
            onChange={(event) => updateField("bio", event.target.value)}
            rows={4}
            placeholder="Bio"
            className="mt-3 w-full rounded-md border border-white/10 bg-black px-3 py-3 text-sm outline-none"
          />
          <textarea
            value={profile.experience || ""}
            onChange={(event) => updateField("experience", event.target.value)}
            rows={5}
            placeholder="Experience"
            className="mt-3 w-full rounded-md border border-white/10 bg-black px-3 py-3 text-sm outline-none"
          />
          <textarea
            value={profile.skills || ""}
            onChange={(event) => updateField("skills", event.target.value)}
            rows={3}
            placeholder="Skills"
            className="mt-3 w-full rounded-md border border-white/10 bg-black px-3 py-3 text-sm outline-none"
          />
          <textarea
            value={profile.education || ""}
            onChange={(event) => updateField("education", event.target.value)}
            rows={3}
            placeholder="Education"
            className="mt-3 w-full rounded-md border border-white/10 bg-black px-3 py-3 text-sm outline-none"
          />

          <button
            onClick={saveProfile}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-3 text-sm font-medium text-zinc-950 hover:bg-emerald-400"
          >
            <Save size={17} />
            Save Profile
          </button>
        </section>
      </div>
    </AppShell>
  );
}
