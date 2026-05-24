"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { LogIn, Compass, ShieldCheck, Sparkles } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { TiltCard } from "@/components/TiltCard";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loginUser = async (u: string, p: string) => {
    try {
      setLoading(true);
      setError("");

      console.log("API URL:", API_BASE_URL);

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: u,
          password: p,
        }),
      });

      console.log("STATUS:", response.status);

      const data = await response.json();

      console.log("LOGIN RESPONSE:", data);

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      if (!data.access_token) {
        throw new Error("No access token returned from backend");
      }

      localStorage.setItem("token", data.access_token);

      // ── Immediately fetch profile to cache name + role in localStorage ────
      // This ensures the sidebar shows the correct user name/role on first render
      // without waiting for a separate API call in AppShell.
      try {
        const profileRes = await fetch(`${API_BASE_URL}/profile`, {
          headers: { Authorization: `Bearer ${data.access_token}` },
        });
        if (profileRes.ok) {
          const profile = await profileRes.json();
          const displayName = profile?.full_name || profile?.name || u.split("@")[0];
          const resolvedRole = profile?.role || "student";
          localStorage.setItem("jv_user_name", displayName);
          localStorage.setItem("jv_user_role", resolvedRole);
        }
      } catch (_) {
        // Non-critical — AppShell will fetch profile on load as fallback
      }

      console.log("Redirecting...");
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await loginUser(email, password);
  };

  const handleAutofillDemo = async () => {
    const demoEmail = "praful@gmail.com";
    const demoPassword = "123456";

    setEmail(demoEmail);
    setPassword(demoPassword);

    await loginUser(demoEmail, demoPassword);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060608] px-5 text-white cyber-grid">
      <div className="ambient-blob-1" />
      <div className="ambient-blob-2" />

      <section className="relative z-10 w-full max-w-md">
        <TiltCard
          maxTilt={5}
          scale={1}
          className="glass-3d card-glow-cyan rounded-3xl border border-white/10 bg-zinc-950/70 p-8 shadow-2xl"
        >
          <div className="flex flex-col items-center text-center">
            <Link
              href="/"
              className="group mb-6 flex items-center gap-2"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20 transition group-hover:scale-105">
                <Compass
                  size={20}
                  className="animate-spin-slow"
                />
              </div>

              <span className="text-2xl font-bold tracking-tight text-white">
                Jobs
                <span className="text-emerald-400">Villa</span>
              </span>
            </Link>

            <h1 className="bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
              Access Workspace
            </h1>

            <p className="mt-1.5 max-w-[280px] text-xs leading-relaxed text-zinc-400">
              Login to access AI resumes, roadmap copilots,
              and dashboard tools.
            </p>
          </div>


          <form
            onSubmit={handleLogin}
            className="space-y-4"
          >
            <div>
              <input
                type="email"
                required
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/5 bg-zinc-950/60 px-4 py-3.5 text-xs outline-none transition placeholder:text-zinc-500 hover:bg-zinc-900/60 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/5 bg-zinc-950/60 px-4 py-3.5 text-xs outline-none transition placeholder:text-zinc-500 hover:bg-zinc-900/60 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>

            {error && (
              <p className="text-xs font-semibold text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3.5 text-xs font-bold text-zinc-100 transition hover:bg-zinc-800 disabled:opacity-60"
            >
              <LogIn
                size={14}
                className="text-emerald-400"
              />

              {loading
                ? "Authorizing Security..."
                : "Log In to Workspace"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-zinc-500">
            Need an active account?{" "}
            <Link
              href="/register"
              className="font-bold text-emerald-400 transition hover:text-emerald-300"
            >
              Register here
            </Link>
          </p>
        </TiltCard>
      </section>
    </main>
  );
}