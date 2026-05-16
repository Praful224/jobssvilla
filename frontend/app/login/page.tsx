"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function LoginPage() {

  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: any) => {

  e.preventDefault()

  try {

    setLoading(true)
    setError("")

    const res = await fetch(

      `${process.env.NEXT_PUBLIC_API_URL}/login`,

      {
        method: "POST",

        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },

        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      }
    )

    const data = await res.json()

    if (data.access_token) {

      localStorage.setItem(
        "token",
        data.access_token
      )

      router.push("/dashboard")

    } else {

      setError("Invalid credentials")

    }

  } catch (err) {

    setError("Login failed")

  } finally {

    setLoading(false)

  }

}

  return (

    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 relative overflow-hidden">

      {/* BACKGROUND */}

      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />

     <div className="pointer-events-none absolute w-[400px] h-[400px] bg-blue-500/20 blur-3xl rounded-full top-10 left-10" />

     <div className="pointer-events-none absolute w-[400px] h-[400px] bg-purple-500/20 blur-3xl rounded-full bottom-10 right-10" />

      {/* LOGIN CARD */}

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-50 w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl"
      >

        <h1 className="text-4xl font-bold text-center">

          Welcome Back

        </h1>

        <p className="text-gray-400 text-center mt-3">

          Login to continue to JobsVilla

        </p>

        <form
          onSubmit={handleLogin}
          className="mt-10 space-y-5"
        >

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 outline-none focus:border-blue-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 outline-none focus:border-blue-500"
          />

          {error && (

            <p className="text-red-400 text-sm">

              {error}

            </p>

          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-medium transition"
          >

            {loading
              ? "Logging in..."
              : "Login"}

          </button>

        </form>

        <p className="text-gray-400 text-center mt-6">

          Don’t have an account?

          <span
            onClick={() =>
              router.push("/register")
            }
            className="text-blue-400 cursor-pointer ml-2"
          >

            Register

          </span>

        </p>

      </motion.div>

    </main>

  )
}