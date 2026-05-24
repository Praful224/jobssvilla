"use client";

import { useEffect, useState } from "react";
import { User, Palette, LogOut, Shield, RefreshCw, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { apiFetch, jsonHeaders } from "@/lib/api";
import { useRouter } from "next/navigation";

const presetThemes = [
  {
    id: "dark",
    name: "Dark Mode",
    desc: "Sleek futuristic charcoal with emerald accents",
    bgClass: "bg-[#090D16]",
    accentClass: "bg-emerald-500",
    textClass: "text-zinc-400",
  },
  {
    id: "light",
    name: "Light Mode",
    desc: "Clean high-contrast modern off-white",
    bgClass: "bg-[#F8FAFC]",
    accentClass: "bg-teal-600",
    textClass: "text-slate-600",
  },
  {
    id: "emerald",
    name: "Emerald Glass",
    desc: "Rich high-fidelity translucent emerald",
    bgClass: "bg-[#022C22]",
    accentClass: "bg-emerald-400",
    textClass: "text-emerald-300",
  },
  {
    id: "ocean",
    name: "Ocean Breeze",
    desc: "Deep oceanic cobalt with cyan-teal glass",
    bgClass: "bg-[#0F172A]",
    accentClass: "bg-cyan-400",
    textClass: "text-cyan-300",
  },
  {
    id: "purple",
    name: "Midnight Purple",
    desc: "Celestial violet with deep indigo neon gradients",
    bgClass: "bg-[#1E1B4B]",
    accentClass: "bg-fuchsia-500",
    textClass: "text-fuchsia-300",
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "theme" | "logout">("profile");
  
  // Profile form states
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  
  // App visual states
  const [activeTheme, setActiveTheme] = useState("dark");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [pendingRole, setPendingRole] = useState<string | null>(null);

  // Fetch active profile on mount
  useEffect(() => {
    setLoading(true);
    apiFetch<any>("/profile", { auth: true })
      .then((data) => {
        if (data) {
          setFullName(data.full_name || "");
          setTitle(data.title || "");
          setPhone(data.phone || "");
          setLocation(data.location || "");
          setPendingRole(data.pending_role || null);
          
          if (data.theme) {
            setActiveTheme(data.theme);
            document.documentElement.setAttribute("data-theme", data.theme);
            localStorage.setItem("jobsvilla_theme", data.theme);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load user profile in settings:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Save profile personalization
  const handleSaveProfile = async () => {
    setSaving(true);
    setStatusMsg("");
    try {
      await apiFetch("/profile", {
        method: "PUT",
        headers: jsonHeaders(),
        auth: true,
        body: JSON.stringify({
          full_name: fullName,
          title,
          phone,
          location,
        }),
      });
      setStatusMsg("Success! Profile details updated successfully.");
    } catch (e: any) {
      console.error(e);
      setStatusMsg("Failed to save profile details.");
    } finally {
      setSaving(false);
    }
  };

  // Immediate theme shifter
  const handleThemeShift = async (themeId: string) => {
    setActiveTheme(themeId);
    document.documentElement.setAttribute("data-theme", themeId);
    localStorage.setItem("jobsvilla_theme", themeId);
    
    // Save to backend database for persistent account sync
    try {
      await apiFetch("/profile", {
        method: "PUT",
        headers: jsonHeaders(),
        auth: true,
        body: JSON.stringify({ theme: themeId }),
      });
    } catch (err) {
      console.error("Backend theme synchronization failed:", err);
    }
  };

  // Sign out triggers
  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("jobsvilla_theme");
    router.push("/login");
  };

  return (
    <AppShell
      title="Console Settings"
      subtitle="Manage your profile personalization coordinates, theme visual properties, and security controls."
    >
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        
        {/* Navigation Sidebar */}
        <aside className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 h-fit space-y-1 glass-3d">
          <button
            onClick={() => { setActiveTab("profile"); setStatusMsg(""); }}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-xs font-extrabold uppercase tracking-wider transition ${
              activeTab === "profile"
                ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/10"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <User size={16} />
            Profile Details
          </button>
          
          <button
            onClick={() => { setActiveTab("theme"); setStatusMsg(""); }}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-xs font-extrabold uppercase tracking-wider transition ${
              activeTab === "theme"
                ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/10"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Palette size={16} />
            Appearance Theme
          </button>
          
          <button
            onClick={() => { setActiveTab("logout"); setStatusMsg(""); }}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-xs font-extrabold uppercase tracking-wider transition ${
              activeTab === "logout"
                ? "bg-red-500/25 border border-red-500/20 text-red-300 shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <LogOut size={16} className="text-red-400" />
            Sign Out
          </button>
        </aside>

        {/* Content Pane */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 glass-3d min-h-[400px] flex flex-col justify-between">
          
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 space-y-2">
              <RefreshCw size={24} className="animate-spin text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Syncing secure preferences...</span>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* TAB 1: PROFILE DETAILS */}
              {activeTab === "profile" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-extrabold text-white uppercase tracking-wider">Profile Personalization</h3>
                    <p className="text-xs text-zinc-500">Update key contact details synced across matching and opportunity grids.</p>
                  </div>
                  
                  <hr className="border-white/10" />

                  {pendingRole && (
                    <div className="p-5 border border-amber-500/20 bg-amber-500/[0.03] rounded-2xl flex items-start gap-4 mb-4 card-glow-amber">
                      <Shield size={24} className="text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-amber-300 uppercase tracking-widest">Verification Pending</h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          Your application to register as a <span className="text-white font-semibold capitalize">{pendingRole}</span> is currently being reviewed by our administrative team. We verify credentials to guarantee secure, high-quality professional interactions on JobsVilla. You will receive access immediately upon activation!
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Full Name</label>
                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Praful Chalakh"
                        className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-xs text-white outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                    
                    <div>
                      <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Professional Title</label>
                      <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Senior Backend Engineer"
                        className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-xs text-white outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                    
                    <div>
                      <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Phone Number</label>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-xs text-white outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                    
                    <div>
                      <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Primary Location</label>
                      <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Bangalore, India"
                        className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-xs text-white outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3.5 text-xs font-bold text-zinc-950 flex items-center gap-2 hover:brightness-110 active:scale-95 transition"
                    >
                      {saving ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={14} />
                      )}
                      Save Coordinates
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: THEME APPEARANCE */}
              {activeTab === "theme" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-extrabold text-white uppercase tracking-wider">Appearance Theme</h3>
                    <p className="text-xs text-zinc-500">Shift the dynamic color space properties across all client panels instantly.</p>
                  </div>
                  
                  <hr className="border-white/10" />
                  
                  <div className="grid md:grid-cols-2 gap-4 pt-2">
                    {presetThemes.map((theme) => {
                      const isActive = activeTheme === theme.id;
                      return (
                        <div
                          key={theme.id}
                          onClick={() => handleThemeShift(theme.id)}
                          className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between h-32 transition duration-200 ${
                            isActive
                              ? "border-emerald-400 bg-white/[0.05] shadow-lg shadow-emerald-500/5 scale-[1.02]"
                              : "border-white/10 bg-white/[0.01] hover:bg-white/[0.03]"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-extrabold text-sm text-white">{theme.name}</h4>
                              <p className="text-[10px] text-zinc-400 mt-1">{theme.desc}</p>
                            </div>
                            {isActive && (
                              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            )}
                          </div>
                          
                          {/* Mini visual theme display swatch */}
                          <div className={`h-8 rounded-lg ${theme.bgClass} border border-white/10 flex items-center px-3 gap-2`}>
                            <span className={`h-3 w-3 rounded-full ${theme.accentClass} shrink-0`} />
                            <span className={`text-[8px] font-bold ${theme.textClass} uppercase tracking-widest`}>
                              Aa
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: SIGN OUT */}
              {activeTab === "logout" && (
                <div className="space-y-4 max-w-md">
                  <div>
                    <h3 className="text-base font-extrabold text-white uppercase tracking-wider">Sign Out</h3>
                    <p className="text-xs text-zinc-500">Terminate your active encrypted browser session safely.</p>
                  </div>
                  
                  <hr className="border-white/10" />
                  
                  <div className="p-5 border border-red-500/20 bg-red-500/[0.01] rounded-2xl space-y-4 mt-2">
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Signing out will immediately invalidate local authentication tokens, close active system gateways, and require credentials for next access.
                    </p>
                    
                    <button
                      onClick={handleSignOut}
                      className="rounded-xl bg-red-500 px-6 py-3.5 text-xs font-bold text-white hover:bg-red-400 active:scale-95 transition flex items-center gap-2"
                    >
                      <LogOut size={14} />
                      Confirm Sign Out
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Status Message Footer */}
          {statusMsg && (
            <div className="mt-6 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] text-xs font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 size={14} className="shrink-0" />
              {statusMsg}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
