"use client"

import { motion } from "framer-motion"
import { useState } from "react"

export default function Home() {

  const [query, setQuery] = useState("")
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const searchJobs = async () => {

    if (!query.trim()) return

    try {

      setLoading(true)
      setError("")

      const url =
        `${process.env.NEXT_PUBLIC_API_URL}/jobs/search?q=${encodeURIComponent(query)}`

      console.log("URL:", url)

      const res = await fetch(url)

      console.log("STATUS:", res.status)

      if (!res.ok) {

        throw new Error("Failed to fetch jobs")

      }

      const data = await res.json()

      console.log("DATA:", data)

      setJobs(data)

    } catch (err) {

      console.log(err)

      setError("Something went wrong")

    } finally {

      setLoading(false)

    }

  }

  return (

    <main className="min-h-screen bg-black text-white overflow-hidden relative">

      {/* BACKGROUND */}

      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />

      {/* GLOW EFFECTS */}

      <div className="pointer-events-none absolute w-[500px] h-[500px] bg-blue-500/20 blur-3xl rounded-full top-10 left-10" />

      <div className="pointer-events-none absolute w-[400px] h-[400px] bg-purple-500/20 blur-3xl rounded-full bottom-10 right-10" />

      {/* NAVBAR */}

      <nav className="relative z-50 flex items-center justify-between px-8 py-6 border-b border-white/10 backdrop-blur-md">

        <h1 className="text-2xl font-bold">

          Jobs<span className="text-blue-500">Villa</span>

        </h1>

        <div className="hidden md:flex items-center gap-8 text-gray-300">

          <a href="#" className="hover:text-white transition">
            Jobs
          </a>

          <a href="#" className="hover:text-white transition">
            Mentorship
          </a>

          <a href="#" className="hover:text-white transition">
            Mock Interviews
          </a>

        </div>

        <button className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl transition">

          Login

        </button>

      </nav>

      {/* HERO */}

      <section className="relative z-50 flex flex-col items-center justify-center min-h-screen px-6 text-center pb-32">

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-6xl md:text-8xl font-bold leading-tight max-w-5xl"
        >

          Build Your Career With
          <span className="text-blue-500"> JobsVilla</span>

        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-gray-400 text-lg md:text-2xl mt-8 max-w-3xl"
        >

          Discover jobs, mentorship, mock interviews,
          and career opportunities in one intelligent platform.

        </motion.p>

        {/* SEARCH */}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
          className="relative z-50 mt-12 w-full max-w-3xl"
        >

          <form
            onSubmit={(e) => {
              e.preventDefault()
              searchJobs()
            }}
            className="flex items-center bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-3 shadow-2xl"
          >

            <input
              type="text"
              placeholder="Search jobs, skills, companies..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-white px-4 text-lg"
            />

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-medium transition cursor-pointer"
            >

              Search

            </button>

          </form>

        </motion.div>

        {/* STATUS */}

        {loading && (

          <p className="mt-8 text-blue-400">

            Searching jobs...

          </p>

        )}

        {error && (

          <p className="mt-8 text-red-400">

            {error}

          </p>

        )}

        {/* JOB RESULTS */}

        <div className="relative z-50 mt-16 w-full max-w-6xl grid md:grid-cols-2 gap-6">

          {jobs.map((job) => (

            <div
              key={job.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl text-left"
            >

              <h2 className="text-2xl font-bold text-white">

                {job.role}

              </h2>

              <p className="text-blue-400 mt-2">

                {job.company}

              </p>

              <p className="text-gray-400 mt-2">

                {job.location}

              </p>

              <p className="text-gray-500 mt-4">

                {job.skills}

              </p>

              <div className="mt-6">

                <a
                  href={job.apply_link}
                  target="_blank"
                  className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl inline-block transition"
                >

                  Apply Now

                </a>

              </div>

            </div>

          ))}

        </div>

      </section>

    </main>

  )
}