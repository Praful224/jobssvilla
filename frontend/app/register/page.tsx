"use client";

import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Compass, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { apiFetch, jsonHeaders } from "@/lib/api";
import { TiltCard } from "@/components/TiltCard";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Custom Vetted Role Selector States
  const [role, setRole] = useState("student");
  const [verificationDetails, setVerificationDetails] = useState("");

  // Registration Lifecycle State
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const register = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await apiFetch("/register", {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          verification_details: verificationDetails,
        }),
      });
      
      // Trigger Success Lifecycle
      setShowSuccess(true);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer for redirection
  useEffect(() => {
    if (!showSuccess) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push("/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showSuccess, router]);

  const isDuplicateEmail = error.toLowerCase().includes("already") || error.toLowerCase().includes("exists") || error.toLowerCase().includes("duplicate");

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#060608] px-5 text-white overflow-hidden cyber-grid">
      {/* Dynamic Ambient Blur Blobs */}
      <div className="ambient-blob-1" />
      <div className="ambient-blob-3" />

      {/* Premium Glassmorphic Success Overlay Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-sm p-1">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl blur-xl opacity-40 animate-pulse" />
            <div className="relative glass-3d bg-zinc-950/80 p-8 rounded-3xl border border-emerald-500/30 text-center shadow-2xl flex flex-col items-center">
              <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/15">
                <CheckCircle2 size={32} className="animate-bounce" />
                <span className="absolute -inset-1 rounded-2xl border border-emerald-500/10 animate-ping opacity-70" />
              </div>

              <h2 className="text-2xl font-extrabold tracking-tight text-white mb-2">
                Registration Successful!
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Your JobsVilla account is created successfully. Redirecting you to login in <span className="font-extrabold text-emerald-400">{countdown}s</span>...
              </p>

              <div className="w-full bg-zinc-900/60 rounded-xl p-1 border border-white/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 pl-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs text-zinc-400 font-semibold">Automatic Ticker</span>
                </div>
                <button
                  onClick={() => router.push("/login")}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition"
                >
                  Login Now
                  <ArrowRight size={12} className="stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="relative z-10 w-full max-w-md">
        <TiltCard maxTilt={3} scale={1} className="glass-3d bg-zinc-950/70 p-8 rounded-3xl border border-white/10 card-glow-cyan shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <Link href="/" className="flex items-center gap-2 group mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition">
                <Compass size={20} className="animate-spin-slow" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Jobs<span className="text-emerald-400">Villa</span>
              </span>
            </Link>

            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed max-w-[280px]">
              Register to access your personal dashboard, track jobs, and build roadmaps.
            </p>
          </div>

          <form onSubmit={register} className="mt-6 space-y-4">
            {/* Duplicate email alert banner */}
            {error && isDuplicateEmail && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-start gap-2.5 text-amber-300 animate-in fade-in duration-200">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold">Email already registered</p>
                  <p className="text-amber-400/90 leading-relaxed mt-0.5">
                    This email is already in use. Please try another email or{" "}
                    <Link href="/login" className="font-bold text-white underline hover:text-amber-200 transition">
                      Log In here
                    </Link>.
                  </p>
                </div>
              </div>
            )}

            {/* Standard error fallback banner */}
            {error && !isDuplicateEmail && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 flex items-start gap-2.5 text-red-400 animate-in fade-in duration-200">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <span className="text-xs font-semibold leading-relaxed">{error}</span>
              </div>
            )}

            <div>
              <input
                required
                placeholder="Full Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-white/5 bg-zinc-950/60 hover:bg-zinc-900/60 focus:border-emerald-500/50 px-4 py-3.5 text-xs outline-none transition focus:ring-1 focus:ring-emerald-500/20 placeholder:text-zinc-500"
              />
            </div>
            <div>
              <input
                type="email"
                required
                placeholder="Email Address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-white/5 bg-zinc-950/60 hover:bg-zinc-900/60 focus:border-emerald-500/50 px-4 py-3.5 text-xs outline-none transition focus:ring-1 focus:ring-emerald-500/20 placeholder:text-zinc-500"
              />
            </div>
            <div>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Password (Min 6 Characters)"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-white/5 bg-zinc-950/60 hover:bg-zinc-900/60 focus:border-emerald-500/50 px-4 py-3.5 text-xs outline-none transition focus:ring-1 focus:ring-emerald-500/20 placeholder:text-zinc-500"
              />
            </div>

            {/* Custom Premium Role Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Registering As
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "student", label: "Student", desc: "Immediate access" },
                  { id: "mentor", label: "Mentor", desc: "Vetted by admin" },
                  { id: "recruiter", label: "Recruiter", desc: "Vetted by admin" },
                ].map((r) => {
                  const isSelected = role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center cursor-pointer ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/5"
                          : "border-white/5 bg-zinc-950/60 hover:bg-zinc-900/60 text-zinc-400"
                      }`}
                    >
                      <span className="text-xs font-bold leading-none">{r.label}</span>
                      <span className={`text-[8px] mt-1 font-medium leading-none ${isSelected ? "text-emerald-400/80" : "text-zinc-500"}`}>
                        {r.desc}
                      </span>
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Verification Justification Textarea (Mentor / Recruiter only) */}
            {(role === "mentor" || role === "recruiter") && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Vetting & Experience Justification
                </label>
                <textarea
                  required
                  placeholder={
                    role === "mentor"
                      ? "Briefly describe your domain expertise, industry experience, or links to LinkedIn/GitHub for mentor authorization."
                      : "Briefly describe your company, hiring domains, or links to your company portal/LinkedIn profile."
                  }
                  value={verificationDetails}
                  onChange={(event) => setVerificationDetails(event.target.value)}
                  className="w-full h-24 rounded-xl border border-white/5 bg-zinc-950/60 hover:bg-zinc-900/60 focus:border-emerald-500/50 px-4 py-3 text-xs outline-none transition focus:ring-1 focus:ring-emerald-500/20 placeholder:text-zinc-500 resize-none leading-relaxed text-zinc-200"
                />
                <p className="text-[9px] text-zinc-500 leading-normal flex items-start gap-1">
                  <span>⚠️</span>
                  <span>
                    Baseline student access is unlocked immediately. Recruiter/Mentor capabilities will activate after administrative approval.
                  </span>
                </p>
              </div>
            )}

            <button
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/10 disabled:opacity-60"
            >
              <UserPlus size={14} className="stroke-[2.5]" />
              {loading ? "Creating Profile..." : "Register Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-zinc-500">
            Already registered?{" "}
            <Link href="/login" className="font-bold text-emerald-400 hover:text-emerald-300 transition">
              Log In here
            </Link>
          </p>
        </TiltCard>
      </section>
    </main>
  );
}
