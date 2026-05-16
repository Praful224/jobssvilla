"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: email,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.access_token) {
        throw new Error(data.detail || "Invalid credentials");
      }

      localStorage.setItem("token", data.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-5 text-white">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.04] p-6">
        <Link href="/" className="text-2xl font-semibold">
          Jobs<span className="text-emerald-400">Villa</span>
        </Link>
        <h1 className="mt-8 text-3xl font-semibold">Login</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Continue to your career workspace.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border border-white/10 bg-black px-4 py-3 text-sm outline-none"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border border-white/10 bg-black px-4 py-3 text-sm outline-none"
          />
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <button
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 py-3 text-sm font-medium text-zinc-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            <LogIn size={17} />
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-5 text-sm text-zinc-400">
          Need an account?{" "}
          <Link href="/register" className="text-emerald-300">
            Register
          </Link>
        </p>
      </section>
    </main>
  );
}
