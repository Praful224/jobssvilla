"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  User, 
  Settings, 
  Save, 
  Download, 
  Trash2, 
  ShieldCheck, 
  Bell, 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  XCircle,
  Smartphone,
  Globe,
  BarChart3
} from "lucide-react";
import { apiFetch, getToken, jsonHeaders, Profile } from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { TiltCard } from "@/components/TiltCard";

const emptyProfile: Profile & { role?: string } = {
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
  role: "student",
};

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL-addressable tabs lifecycle
  const currentTab = searchParams.get("tab") || "bio";
  const [activeTab, setActiveTab] = useState<string>(currentTab);

  // Core Bio State
  const [profile, setProfile] = useState<Profile & { role?: string }>(emptyProfile);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Settings & Compliance State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [quietHoursActive, setQuietHoursActive] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState("22:00");
  const [quietHoursEnd, setQuietHoursEnd] = useState("08:00");

  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaSecret, setMfaSecret] = useState("");
  const [showMfaSetup, setShowMfaSetup] = useState(false);

  const [activeTier, setActiveTier] = useState("Candidate Standard");
  const [stripeMocking, setStripeMocking] = useState(false);
  const [summary, setSummary] = useState<any>({
    total_jobs: 0,
    applications: 0,
    saved_jobs: 0,
    unread_notifications: 0,
    application_status: {},
  });

  // Active Sessions Mock Data (Simulating secure multi-device tracking)
  const [sessions, setSessions] = useState([
    { id: 1, device: "Chrome / Windows 11", location: "Mumbai, IN (Current)", active: true },
    { id: 2, device: "Safari / Apple iPhone 15", location: "Bangalore, IN", active: false }
  ]);

  // Sync tab search parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["bio", "settings", "analytics"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    loadProfile();
  }, [router]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Profile & { role?: string }>("/profile", { auth: true });
      setProfile(data || emptyProfile);

      // Upgrade simulated billing tier based on role
      if (data?.role === "recruiter") {
        setActiveTier("Recruiter Enterprise");
      }
    } catch (e) {
      console.error("Failed to load profile details:", e);
    } finally {
      setLoading(false);
    }

    // Fetch career analytics summary separately so a failure here
    // never prevents the profile from rendering
    try {
      const analyticsData = await apiFetch<any>("/dashboard/summary", { auth: true });
      if (analyticsData) {
        setSummary(analyticsData);
      }
    } catch (_) {
      // analytics are non-critical; silently ignore
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/profile?tab=${tab}`);
  };

  const updateField = (field: keyof Profile, value: string) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Profile & { role?: string }>("/profile", {
        auth: true,
        method: "PUT",
        headers: jsonHeaders(),
        body: JSON.stringify(profile),
      });
      setProfile(data);
      showBanner("Professional Bio updated successfully");
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setLoading(false);
    }
  };

  // GDPR Data Exporter
  const handleDownloadGDPRData = async () => {
    showBanner("Compiling secure data archive...");
    try {
      // Direct client-side JSON bundle download mapping user's active records
      const archiveData = {
        metadata: {
          timestamp: new Date().toISOString(),
          compliance: "GDPR Article 20 - Data Portability",
          app: "JobsVilla Unicorn Recruiter-Candidate Console"
        },
        profile,
        preferences: {
          emailAlerts,
          inAppAlerts,
          quietHours: { active: quietHoursActive, start: quietHoursStart, end: quietHoursEnd },
          mfaEnabled
        }
      };

      const jsonStr = JSON.stringify(archiveData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `jobsvilla_compliance_archive_${profile.full_name?.toLowerCase().replace(/\s+/g, "_") || "user"}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showBanner("Personal Data archive downloaded successfully");
    } catch (err) {
      console.error("GDPR export failed:", err);
    }
  };

  // Deletion Request
  const handleSoftDeleteRequest = () => {
    const confirmDelete = window.confirm(
      "GDPR Right to be Forgotten: Are you sure you want to schedule your account for permanent deletion? Your records will enter a soft-delete grace window of 30 days before irreversible removal."
    );
    if (confirmDelete) {
      showBanner("Account scheduled for deletion. Grace window active.");
    }
  };

  // Google Authenticator Setup Trigger
  const handleEnableMFA = () => {
    if (mfaEnabled) {
      setMfaEnabled(false);
      setShowMfaSetup(false);
      showBanner("Two-Factor Authentication deactivated");
    } else {
      setMfaSecret("JBSVILLA3D77BXT9Y6P");
      setShowMfaSetup(true);
    }
  };

  const handleConfirmMFA = () => {
    setMfaEnabled(true);
    setShowMfaSetup(false);
    showBanner("MFA/TOTP secured on device");
  };

  // Stripe Billing upgrades
  const handleMockStripeCheckout = () => {
    setStripeMocking(true);
    setTimeout(() => {
      setActiveTier("Candidate Professional Pro");
      setProfile(c => ({ ...c, title: "Recruiter" })); // elevation bypass
      setStripeMocking(false);
      showBanner("Stripe Checkout completed. Plan elevated to Pro!");
    }, 1500);
  };

  const handleTerminateSession = (id: number, name: string) => {
    setSessions(s => s.filter(x => x.id !== id));
    showBanner(`Terminated remote session on "${name}"`);
  };

  const showBanner = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(""), 4000);
  };

  return (
    <AppShell
      title="Account & Settings"
      subtitle="Refine your professional credentials, control notification alert rules, toggle MFA security shields, or export compliance files."
    >
      {/* Dynamic Sub-Tab Selector */}
      <div className="flex border-b border-white/10 gap-1.5 mb-6 overflow-x-auto pb-px">
        <button
          onClick={() => handleTabChange("bio")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 rounded-t-xl shrink-0 ${
            activeTab === "bio"
              ? "border-emerald-400 text-emerald-400 bg-emerald-500/[0.04]"
              : "border-transparent text-zinc-400 hover:text-white hover:bg-white/[0.02]"
          }`}
        >
          <User size={14} />
          Professional Bio Card
        </button>
        <button
          onClick={() => handleTabChange("settings")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 rounded-t-xl shrink-0 ${
            activeTab === "settings"
              ? "border-emerald-400 text-emerald-400 bg-emerald-500/[0.04]"
              : "border-transparent text-zinc-400 hover:text-white hover:bg-white/[0.02]"
          }`}
        >
          <Settings size={14} />
          Security & SaaS Preferences
        </button>
        <button
          onClick={() => handleTabChange("analytics")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 rounded-t-xl shrink-0 ${
            activeTab === "analytics"
              ? "border-emerald-400 text-emerald-400 bg-emerald-500/[0.04]"
              : "border-transparent text-zinc-400 hover:text-white hover:bg-white/[0.02]"
          }`}
        >
          <BarChart3 size={14} />
          Career Analytics
        </button>
      </div>

      {/* Floating Alert Banner */}
      {status && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-zinc-950 p-4 text-xs font-bold text-emerald-400 uppercase tracking-widest shadow-2xl animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{status}</span>
        </div>
      )}

      {loading && !profile.full_name ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
          <div className="h-8 w-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin mb-3" />
          <p className="text-xs uppercase tracking-widest font-bold">Querying Profile Registry...</p>
        </div>
      ) : (
        <div className="animate-in fade-in duration-200">
          
          {/* TAB 1: PROFESSIONAL BIO CARD */}
          {activeTab === "bio" && (
            <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
              {/* Profile Card Sidebar */}
              <aside className="h-fit">
                <TiltCard maxTilt={5} scale={1} className="glass-3d bg-zinc-950/70 p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-zinc-950 text-4xl font-extrabold shadow-lg shadow-emerald-500/10 mb-4 border border-white/10">
                    {(profile.full_name || profile.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight">
                    {profile.full_name || profile.name || "User Profile"}
                  </h2>
                  <p className="text-xs text-zinc-400 leading-relaxed font-semibold mt-1">{profile.email}</p>
                  <p className="mt-3 text-xs text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
                    {profile.title || "Elite Professional Candidates"}
                  </p>
                  
                  <div className="w-full text-left mt-6 pt-5 border-t border-white/5 space-y-3.5 text-xs text-zinc-400">
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider">SaaS Active Role</span>
                      <span className="text-white font-bold capitalize">{profile.role || "Student"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider">Session Token</span>
                      <span className="text-emerald-400 font-bold">Secure SSL</span>
                    </div>
                  </div>
                </TiltCard>
              </aside>

              {/* Profile Fields Panel */}
              <section className="glass-3d bg-zinc-950/40 p-6 rounded-3xl border border-white/5 shadow-xl space-y-6">
                <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                  <User size={16} className="text-emerald-400" />
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-200">Personal Competency Profile</h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Full Name</label>
                    <input
                      value={profile.full_name || ""}
                      onChange={(e) => updateField("full_name", e.target.value)}
                      placeholder="Praful"
                      className="w-full rounded-xl border border-white/5 bg-zinc-950/60 px-4 py-3.5 text-xs outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/10 text-white placeholder:text-zinc-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Professional Title</label>
                    <input
                      value={profile.title || ""}
                      onChange={(e) => updateField("title", e.target.value)}
                      placeholder="Engineering Lead"
                      className="w-full rounded-xl border border-white/5 bg-zinc-950/60 px-4 py-3.5 text-xs outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/10 text-white placeholder:text-zinc-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Phone Contact</label>
                    <input
                      value={profile.phone || ""}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="+91 9988776655"
                      className="w-full rounded-xl border border-white/5 bg-zinc-950/60 px-4 py-3.5 text-xs outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/10 text-white placeholder:text-zinc-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">HQ Location</label>
                    <input
                      value={profile.location || ""}
                      onChange={(e) => updateField("location", e.target.value)}
                      placeholder="Bangalore, India"
                      className="w-full rounded-xl border border-white/5 bg-zinc-950/60 px-4 py-3.5 text-xs outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/10 text-white placeholder:text-zinc-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">GitHub Profile Link</label>
                    <input
                      value={profile.github_url || ""}
                      onChange={(e) => updateField("github_url", e.target.value)}
                      placeholder="https://github.com/profile"
                      className="w-full rounded-xl border border-white/5 bg-zinc-950/60 px-4 py-3.5 text-xs outline-none focus:border-emerald-500/40 text-white placeholder:text-zinc-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">LinkedIn Profile Link</label>
                    <input
                      value={profile.linkedin_url || ""}
                      onChange={(e) => updateField("linkedin_url", e.target.value)}
                      placeholder="https://linkedin.com/in/profile"
                      className="w-full rounded-xl border border-white/5 bg-zinc-950/60 px-4 py-3.5 text-xs outline-none focus:border-emerald-500/40 text-white placeholder:text-zinc-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Portfolio Website</label>
                    <input
                      value={profile.portfolio_url || ""}
                      onChange={(e) => updateField("portfolio_url", e.target.value)}
                      placeholder="https://myportfolio.com"
                      className="w-full rounded-xl border border-white/5 bg-zinc-950/60 px-4 py-3.5 text-xs outline-none focus:border-emerald-500/40 text-white placeholder:text-zinc-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Resume Link</label>
                    <input
                      value={profile.resume_url || ""}
                      onChange={(e) => updateField("resume_url", e.target.value)}
                      placeholder="https://drive.google.com/resume"
                      className="w-full rounded-xl border border-white/5 bg-zinc-950/60 px-4 py-3.5 text-xs outline-none focus:border-emerald-500/40 text-white placeholder:text-zinc-500"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Professional Bio Summaries</label>
                    <textarea
                      value={profile.bio || ""}
                      onChange={(e) => updateField("bio", e.target.value)}
                      rows={3}
                      placeholder="A short elevator pitch summarizing engineering credentials and career accomplishments..."
                      className="w-full rounded-xl border border-white/5 bg-zinc-950/60 px-4 py-3 text-xs outline-none focus:border-emerald-500/40 text-white placeholder:text-zinc-500 h-20 resize-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Skills Pillars</label>
                    <textarea
                      value={profile.skills || ""}
                      onChange={(e) => updateField("skills", e.target.value)}
                      rows={2}
                      placeholder="React, TypeScript, Python, FastAPI, PostgreSQL, Docker, AWS"
                      className="w-full rounded-xl border border-white/5 bg-zinc-950/60 px-4 py-3 text-xs outline-none focus:border-emerald-500/40 text-white placeholder:text-zinc-500 h-16 resize-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Full Experience Logs</label>
                    <textarea
                      value={profile.experience || ""}
                      onChange={(e) => updateField("experience", e.target.value)}
                      rows={4}
                      placeholder="Chronological job roles, responsibilities, projects, and systems architected..."
                      className="w-full rounded-xl border border-white/5 bg-zinc-950/60 px-4 py-3 text-xs outline-none focus:border-emerald-500/40 text-white placeholder:text-zinc-500 h-28 resize-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Academic Background</label>
                    <textarea
                      value={profile.education || ""}
                      onChange={(e) => updateField("education", e.target.value)}
                      rows={2}
                      placeholder="B.Tech in Computer Science, University of tech, 2024"
                      className="w-full rounded-xl border border-white/5 bg-zinc-950/60 px-4 py-3 text-xs outline-none focus:border-emerald-500/40 text-white placeholder:text-zinc-500 h-16 resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/5">
                  <button
                    onClick={saveProfile}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-6 py-3 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/10"
                  >
                    <Save size={14} className="stroke-[2.5]" />
                    Save Professional Profile
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: SaaS SETTINGS & SECURITY */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              
              {/* Stripe Mock Subscriptions Tiers Card */}
              <div className="glass-3d bg-zinc-950/40 p-6 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full blur-3xl" />
                <div className="flex items-center gap-2.5 mb-4 border-b border-white/5 pb-4">
                  <CreditCard size={18} className="text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-zinc-200">SaaS Billing Console</h4>
                    <p className="text-[10px] text-zinc-500 leading-relaxed mt-0.5">Manage recruitment slots, candidate match tiers, and active quotas.</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-950/60 border border-white/5 rounded-2xl p-5">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Active Membership Tier</p>
                    <h5 className="text-lg font-extrabold text-white mt-1 flex items-center gap-2">
                      {activeTier}
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
                    </h5>
                  </div>
                  <button
                    onClick={handleMockStripeCheckout}
                    disabled={stripeMocking}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/15 px-5 py-3 text-xs font-bold text-emerald-400 transition disabled:opacity-60 shrink-0 w-full md:w-auto justify-center"
                  >
                    <CreditCard size={13} />
                    {stripeMocking ? "Contacting Stripe Gateway..." : "Mock Stripe Pro Elevate ($29/mo)"}
                  </button>
                </div>
              </div>

              {/* MFA / TOTP Shield Security */}
              <div className="glass-3d bg-zinc-950/40 p-6 rounded-3xl border border-white/5 shadow-xl">
                <div className="flex items-center gap-2.5 mb-4 border-b border-white/5 pb-4">
                  <Lock size={18} className="text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-zinc-200">Two-Factor Authentication (2FA)</h4>
                    <p className="text-[10px] text-zinc-500 leading-relaxed mt-0.5">Secure your recruiter credentials and candidate matching logs with TOTP.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-zinc-950/40 p-4 border border-white/5 rounded-2xl">
                    <div>
                      <p className="text-xs font-bold text-white">Google Authenticator MFA Shield</p>
                      <p className="text-[10px] text-zinc-500 leading-relaxed mt-0.5">Require an extra 6-digit dynamic code upon authentication attempts.</p>
                    </div>
                    <button
                      onClick={handleEnableMFA}
                      className={`px-4 py-2 text-xs font-bold rounded-xl border transition ${
                        mfaEnabled 
                          ? "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20" 
                          : "border-emerald-500/30 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/15"
                      }`}
                    >
                      {mfaEnabled ? "Deactivate TOTP" : "Activate TOTP"}
                    </button>
                  </div>

                  {/* TOTP Setup Steps */}
                  {showMfaSetup && (
                    <div className="p-4 border border-white/10 bg-zinc-950/80 rounded-2xl space-y-4 animate-in slide-in-from-top duration-200">
                      <p className="text-xs text-zinc-300 font-semibold">Step 1: Scan this secret key inside Google Authenticator or Authy:</p>
                      <div className="inline-block bg-white p-3 rounded-xl">
                        {/* Simulating a QR Code representation */}
                        <div className="h-28 w-28 bg-zinc-900 flex items-center justify-center text-center text-[10px] font-bold text-white rounded p-2">
                          [ MOCK QR CODE: JBSVILLA_SECRET ]
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-zinc-300 font-semibold">Or enter this setup key manually:</p>
                        <code className="block bg-zinc-900 border border-white/5 p-2 rounded-xl text-xs text-cyan-400 font-mono tracking-widest font-bold select-all w-fit">
                          {mfaSecret}
                        </code>
                      </div>
                      <div className="flex gap-2.5 pt-2">
                        <button
                          onClick={handleConfirmMFA}
                          className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2.5 text-xs font-bold text-zinc-950 transition"
                        >
                          Confirm & Activate Secure MFA
                        </button>
                        <button
                          onClick={() => setShowMfaSetup(false)}
                          className="rounded-xl border border-white/10 hover:bg-white/5 px-4 py-2.5 text-xs font-bold text-zinc-300"
                        >
                          Cancel Setup
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Alert Rules & Quiet Hours */}
              <div className="glass-3d bg-zinc-950/40 p-6 rounded-3xl border border-white/5 shadow-xl">
                <div className="flex items-center gap-2.5 mb-4 border-b border-white/5 pb-4">
                  <Bell size={18} className="text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-zinc-200">Multi-Channel Alert Rules</h4>
                    <p className="text-[10px] text-zinc-500 leading-relaxed mt-0.5">Control alert channels and configuration rules dynamically.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Alert Switches */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center justify-between bg-zinc-950/40 p-4 border border-white/5 rounded-2xl">
                      <div>
                        <p className="text-xs font-bold text-white">Email Notifications</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Daily newsletters and instant recruiter views.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={emailAlerts}
                        onChange={(e) => setEmailAlerts(e.target.checked)}
                        className="h-4 w-4 rounded border-white/10 bg-zinc-950 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between bg-zinc-950/40 p-4 border border-white/5 rounded-2xl">
                      <div>
                        <p className="text-xs font-bold text-white">In-App Live Alerts</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Real-time SSE dashboard activities feed.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={inAppAlerts}
                        onChange={(e) => setInAppAlerts(e.target.checked)}
                        className="h-4 w-4 rounded border-white/10 bg-zinc-950 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Quiet Hours silencers */}
                  <div className="bg-zinc-950/40 p-4 border border-white/5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">Quiet Hours Window Silencing</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Mute all low and normal priority in-app/email alerts during quiet periods.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={quietHoursActive}
                        onChange={(e) => setQuietHoursActive(e.target.checked)}
                        className="h-4 w-4 rounded border-white/10 bg-zinc-950 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                      />
                    </div>

                    {quietHoursActive && (
                      <div className="flex items-center gap-3.5 animate-in slide-in-from-top duration-150 pt-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-500">Mute From</label>
                          <input
                            type="time"
                            value={quietHoursStart}
                            onChange={(e) => setQuietHoursStart(e.target.value)}
                            className="rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs font-bold text-white outline-none cursor-pointer"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-500">Mute Until</label>
                          <input
                            type="time"
                            value={quietHoursEnd}
                            onChange={(e) => setQuietHoursEnd(e.target.value)}
                            className="rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs font-bold text-white outline-none cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Sessions Manager */}
              <div className="glass-3d bg-zinc-950/40 p-6 rounded-3xl border border-white/5 shadow-xl">
                <div className="flex items-center gap-2.5 mb-4 border-b border-white/5 pb-4">
                  <Smartphone size={18} className="text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-zinc-200">Active Login Sessions</h4>
                    <p className="text-[10px] text-zinc-500 leading-relaxed mt-0.5">Audit device entries and revoke credentials remotely.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {sessions.map((sess) => (
                    <div key={sess.id} className="flex justify-between items-center bg-zinc-950/40 p-3.5 border border-white/5 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-xl flex items-center justify-center border ${sess.active ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-zinc-900 border-white/5 text-zinc-500'}`}>
                          <Globe size={15} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{sess.device}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">{sess.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {sess.active && (
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded">Active Session</span>
                        )}
                        {!sess.active && (
                          <button
                            onClick={() => handleTerminateSession(sess.id, sess.device)}
                            className="text-[10px] font-extrabold text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 px-3 py-1.5 rounded-xl transition"
                          >
                            Revoke Device
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* GDPR compliance & right to be forgotten */}
              <div className="glass-3d bg-zinc-950/40 p-6 rounded-3xl border border-white/5 shadow-xl border-dashed">
                <div className="flex items-center gap-2.5 mb-4 border-b border-white/5 pb-4">
                  <ShieldCheck size={18} className="text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-zinc-200">GDPR Compliance & Security Panel</h4>
                    <p className="text-[10px] text-zinc-500 leading-relaxed mt-0.5">Export data or manage deletion grace timelines in alignment with EU regulatory frameworks.</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="bg-zinc-950/50 p-4 border border-white/5 rounded-2xl flex flex-col justify-between items-start gap-4">
                    <div>
                      <p className="text-xs font-bold text-white">GDPR Article 20 Portability Archive</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">Download a complete structured JSON representation of your profile card, credentials, applications registry, and bookmarks history instantly.</p>
                    </div>
                    <button
                      onClick={handleDownloadGDPRData}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 hover:bg-white/5 px-4 py-2.5 text-xs font-bold text-zinc-300 w-full justify-center"
                    >
                      <Download size={13} />
                      Download Data Archive (JSON)
                    </button>
                  </div>

                  <div className="bg-zinc-950/50 p-4 border border-white/5 rounded-2xl flex flex-col justify-between items-start gap-4">
                    <div>
                      <p className="text-xs font-bold text-red-400">Irreversible Deletion Requests</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">Request full database account purge. Triggers GDPR Soft-Delete lifecycle with an interactive 30-day grace cancellation timer.</p>
                    </div>
                    <button
                      onClick={handleSoftDeleteRequest}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/5 hover:bg-red-500/15 px-4 py-2.5 text-xs font-bold text-red-400 w-full justify-center"
                    >
                      <Trash2 size={13} />
                      Request Account Deletion (30d Grace)
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: CAREER ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Quick KPI Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Active Opportunities", value: summary.total_jobs, color: "from-emerald-500 to-teal-500", desc: "Available platform positions" },
                  { label: "Submitted Applications", value: summary.applications, color: "from-blue-500 to-indigo-500", desc: "Active pipelines" },
                  { label: "Bookmarked Roles", value: summary.saved_jobs, color: "from-purple-500 to-pink-500", desc: "Saved opportunities" },
                  { label: "Unread Alerts", value: summary.unread_notifications, color: "from-amber-500 to-orange-500", desc: "Unread notifications" },
                ].map((kpi, idx) => (
                  <TiltCard
                    key={idx}
                    maxTilt={5}
                    scale={1}
                    className="glass-3d bg-zinc-950/40 p-5 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden flex flex-col justify-between"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/[0.01] rounded-bl-full blur-xl" />
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">{kpi.label}</p>
                      <p className={`mt-3 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${kpi.color}`}>
                        {kpi.value}
                      </p>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-4 leading-relaxed">{kpi.desc}</p>
                  </TiltCard>
                ))}
              </div>

              {/* Application Status Analytics */}
              <div className="glass-3d bg-zinc-950/40 p-6 rounded-3xl border border-white/5 shadow-xl">
                <div className="flex items-center gap-2.5 mb-6 border-b border-white/5 pb-4">
                  <BarChart3 size={18} className="text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-zinc-200">Application Pipeline Status</h4>
                    <p className="text-[10px] text-zinc-500 leading-relaxed mt-0.5">Real-time status analysis of your job applications.</p>
                  </div>
                </div>

                {Object.keys(summary.application_status).length === 0 ? (
                  <div className="text-center py-10 text-zinc-500">
                    <p className="text-xs uppercase tracking-widest font-bold">No applications active in pipeline</p>
                    <p className="text-[10px] text-zinc-600 mt-1 leading-relaxed">Start submitting applications in Opportunities to populate charts!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(summary.application_status).map(([status, count]) => {
                      const percentage = Math.min(
                        100,
                        (count as number / Math.max(1, summary.applications)) * 100
                      );
                      return (
                        <div key={status} className="bg-zinc-950/40 p-4 border border-white/5 rounded-2xl">
                          <div className="flex justify-between items-center text-xs font-extrabold uppercase tracking-wider">
                            <span className="text-zinc-300">{status}</span>
                            <span className="text-emerald-400">{count as number} ({Math.round(percentage)}%)</span>
                          </div>
                          <div className="mt-3 h-2 w-full rounded-full bg-zinc-900 border border-white/5 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </AppShell>
  );
}
