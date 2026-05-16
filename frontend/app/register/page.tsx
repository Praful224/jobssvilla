"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { apiFetch, jsonHeaders } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const register = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await apiFetch("/register", {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ name, email, password }),
      });
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
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
        <h1 className="mt-8 text-3xl font-semibold">Create Account</h1>

        <form onSubmit={register} className="mt-6 space-y-4">
          <input
            required
            placeholder="Full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-md border border-white/10 bg-black px-4 py-3 text-sm outline-none"
          />
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
            minLength={6}
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
            <UserPlus size={17} />
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <p className="mt-5 text-sm text-zinc-400">
          Already registered?{" "}
          <Link href="/login" className="text-emerald-300">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
