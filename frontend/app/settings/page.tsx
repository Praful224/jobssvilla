"use client";

import { useState } from "react";
import { Bell, Lock, Mail, Moon, Shield } from "lucide-react";
import { AppShell } from "@/components/AppShell";

const sections = [
  { label: "Account", icon: Shield },
  { label: "Notifications", icon: Bell },
  { label: "Email", icon: Mail },
  { label: "Security", icon: Lock },
  { label: "Appearance", icon: Moon },
];

export default function SettingsPage() {
  const [active, setActive] = useState("Account");

  return (
    <AppShell
      title="Settings"
      subtitle="Manage platform preferences for alerts, privacy, and account behavior."
    >
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <div className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.label}
                  onClick={() => setActive(section.label)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm ${
                    active === section.label
                      ? "bg-white text-zinc-950"
                      : "text-zinc-300 hover:bg-white/10"
                  }`}
                >
                  <Icon size={17} />
                  {section.label}
                </button>
              );
            })}
          </div>
        </aside>

        <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-2xl font-semibold">{active}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="flex items-center justify-between rounded-md border border-white/10 bg-black px-4 py-3 text-sm">
              Job alert notifications
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </label>
            <label className="flex items-center justify-between rounded-md border border-white/10 bg-black px-4 py-3 text-sm">
              Application status updates
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </label>
            <label className="flex items-center justify-between rounded-md border border-white/10 bg-black px-4 py-3 text-sm">
              Mentor booking reminders
              <input type="checkbox" className="h-4 w-4" />
            </label>
            <label className="flex items-center justify-between rounded-md border border-white/10 bg-black px-4 py-3 text-sm">
              Community replies
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </label>
          </div>
          <button className="mt-6 rounded-md bg-emerald-500 px-4 py-3 text-sm font-medium text-zinc-950 hover:bg-emerald-400">
            Save Settings
          </button>
        </section>
      </div>
    </AppShell>
  );
}
