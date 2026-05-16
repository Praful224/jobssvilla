"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import {
  Bell,
  Briefcase,
  Search,
} from "lucide-react"

export default function DashboardPage() {

  const router = useRouter()

  const [user, setUser] = useState<any>(null)

  const [jobs, setJobs] = useState<any[]>([])

  const [query, setQuery] = useState("")

  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {

    const token = localStorage.getItem("token")

    if (!token) {

      router.push("/login")

      return

    }

    fetchProfile(token)

    fetchJobs()

  }, [])

  const fetchProfile = async (token: string) => {

    try {

      const res = await fetch(

        `${process.env.NEXT_PUBLIC_API_URL}/profile`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await res.json()

      setUser(data)

    } catch (err) {

      console.log(err)

    }

  }

  const fetchJobs = async () => {

    try {

      const res = await fetch(

        `${process.env.NEXT_PUBLIC_API_URL}/jobs`
      )

      const data = await res.json()

      setJobs(data)

    } catch (err) {

      console.log(err)

    }

  }

  const searchJobs = async () => {

    try {

      let url =
        `${process.env.NEXT_PUBLIC_API_URL}/jobs`

      if (query.trim()) {

        url =
          `${process.env.NEXT_PUBLIC_API_URL}/jobs/search/?q=${query}`

      }

      const res = await fetch(url)

      const data = await res.json()

      setJobs(data)

    } catch (err) {

      console.log(err)

    }

  }

  const logout = () => {

    localStorage.removeItem("token")

    router.push("/login")

  }

  return (

    <main className="min-h-screen bg-black text-white overflow-hidden relative">

      {/* BACKGROUND */}

      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />

      <div className="pointer-events-none absolute w-[500px] h-[500px] bg-blue-500/20 blur-3xl rounded-full top-0 left-0" />

      <div className="pointer-events-none absolute w-[400px] h-[400px] bg-purple-500/20 blur-3xl rounded-full bottom-0 right-0" />

      {/* NAVBAR */}

      <nav className="relative z-50 flex items-center justify-between px-10 py-6 border-b border-white/10 backdrop-blur-xl">

        <div className="flex items-center gap-10">

          <h1 className="text-3xl font-bold cursor-pointer">

            Jobs<span className="text-blue-500">Villa</span>

          </h1>

          <div className="hidden md:flex gap-8 text-gray-300">

            <button className="hover:text-white transition">
              Home
            </button>

            <button className="hover:text-white transition">
              Jobs
            </button>

            <button className="hover:text-white transition">
              Companies
            </button>

            <button className="hover:text-white transition">
              Mentorship
            </button>

          </div>

        </div>

        {/* RIGHT NAV */}

        <div className="flex items-center gap-5">

          <Bell className="cursor-pointer text-gray-300 hover:text-white transition" />

          <div className="relative">

            <div
              onClick={() =>
                setShowMenu(!showMenu)
              }
              className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg cursor-pointer hover:scale-105 transition"
            >

              {(user?.name || "U")
                .charAt(0)
                .toUpperCase()}

            </div>

            {showMenu && (

              <div className="absolute right-0 mt-4 w-72 bg-black/90 border border-white/10 backdrop-blur-2xl rounded-3xl p-4 shadow-2xl z-[200]">

                {/* USER */}

                <div className="border-b border-white/10 pb-4">

                  <p className="text-xl font-bold">

                    {user?.name
                      ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
                      : "User"}

                  </p>

                  <p className="text-gray-400 text-sm mt-1">

                    {user?.email}

                  </p>

                </div>

                {/* MENU */}

                <div className="mt-4 space-y-2">

                  <button
                    onClick={() =>
                      router.push("/profile")
                    }
                    className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-2xl transition"
                  >

                    My Profile

                  </button>

                  <button
                    onClick={() =>
                      router.push("/applications")
                    }
                    className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-2xl transition"
                  >

                    Applications

                  </button>

                  <button
                    onClick={() =>
                      router.push("/saved-jobs")
                    }
                    className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-2xl transition"
                  >

                    Saved Jobs

                  </button>

                  <button
                    onClick={() =>
                      router.push("/settings")
                    }
                    className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-2xl transition"
                  >

                    Settings

                  </button>

                  <button className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-2xl transition">

                    Resume

                  </button>

                  <button className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-2xl transition">

                    Notifications

                  </button>

                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-2xl transition"
                  >

                    Logout

                  </button>

                </div>

              </div>

            )}

          </div>

        </div>

      </nav>

      {/* HERO */}

      <section className="relative z-10 px-10 py-20 flex flex-col md:flex-row items-center justify-between gap-16">

        {/* LEFT */}

        <div className="max-w-2xl">

          <h1 className="text-6xl md:text-7xl font-bold leading-tight">

            Welcome Back,
            <span className="text-blue-500">

              {" "}
              {user?.name
                ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
                : "User"}

            </span>

          </h1>

          <p className="mt-8 text-gray-400 text-xl leading-relaxed">

            Discover premium opportunities in
            DevOps, AI/ML, Cloud, Cybersecurity,
            and top product companies.

          </p>

          <div className="flex gap-5 mt-10">

            <button className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-2xl transition">

              Explore Jobs

            </button>

          </div>

        </div>

        {/* RIGHT HERO */}

        <div className="relative">

          <div className="w-[420px] h-[240px] bg-blue-600/20 border border-white/10 backdrop-blur-2xl rounded-[60px]" />

          <div className="absolute top-6 left-0 bg-white/10 border border-white/10 backdrop-blur-xl p-6 rounded-3xl shadow-2xl w-[260px]">

            <p className="text-2xl font-bold">

              DevOps Engineer

            </p>

            <p className="text-blue-400 mt-3">

              ₹18 - ₹30 LPA

            </p>

          </div>

          <div className="absolute bottom-0 right-0 bg-white/10 border border-white/10 backdrop-blur-xl p-6 rounded-3xl shadow-2xl w-[260px]">

            <p className="text-2xl font-bold">

              AI/ML Engineer

            </p>

            <p className="text-purple-400 mt-3">

              ₹25 - ₹45 LPA

            </p>

          </div>

        </div>

      </section>

      {/* SEARCH */}

      <section className="relative z-[100] px-10">

        <div className="relative z-[150] bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-5 flex items-center gap-4 shadow-2xl">

          <Search className="text-gray-400" />

          <input
            type="text"
            placeholder="Search jobs, companies, skills..."
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            onKeyDown={(e) => {

              if (e.key === "Enter") {

                searchJobs()

              }

            }}
            className="flex-1 bg-transparent outline-none text-lg text-white placeholder:text-gray-500 relative z-[200]"
          />

          <button
            onClick={searchJobs}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-2xl transition cursor-pointer relative z-[200]"
          >

            Search

          </button>

        </div>

      </section>

      {/* CATEGORIES */}

      <section className="relative z-10 px-10 mt-20">

        <h2 className="text-4xl font-bold">

          Explore Categories

        </h2>

        <div className="grid md:grid-cols-4 gap-8 mt-10">

          {[
            "DevOps",
            "Cloud",
            "AI/ML",
            "Cyber Security",
          ].map((item) => (

            <div
              key={item}
              className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 hover:bg-white/10 hover:scale-105 transition cursor-pointer"
            >

              <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center">

                <Briefcase />

              </div>

              <h3 className="mt-6 text-2xl font-bold">

                {item}

              </h3>

              <p className="text-gray-400 mt-3">

                1000+ Opportunities

              </p>

            </div>

          ))}

        </div>

      </section>

      {/* JOBS */}

      <section className="relative z-10 px-10 mt-24 pb-24">

        <h2 className="text-4xl font-bold">

          {query
            ? `Search Results for "${query}"`
            : "Latest Opportunities"}

        </h2>

        <div className="grid md:grid-cols-3 gap-8 mt-12">

          {jobs.length === 0 && (

            <div className="col-span-3 text-center py-20">

              <h3 className="text-3xl font-bold text-gray-400">

                No matching opportunities found

              </h3>

              <p className="text-gray-500 mt-4">

                Try searching with different skills,
                company names, or locations.

              </p>

            </div>

          )}

          {jobs.map((job) => (

            <div
              key={job.id}
              className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 hover:bg-white/10 hover:-translate-y-2 transition duration-300 shadow-2xl"
            >

              <div className="flex items-center justify-between">

                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center">

                  <Briefcase />

                </div>

                <p className="text-blue-400 font-bold">

                  {job.salary}

                </p>

              </div>

              <h3 className="mt-6 text-3xl font-bold">

                {job.role}

              </h3>

              <p className="text-gray-300 mt-3 text-lg">

                {job.company}

              </p>

              <p className="text-gray-500 mt-2">

                {job.location}

              </p>

              <div className="mt-6 flex flex-wrap gap-3">

                {job.skills
                  ?.split(",")
                  .slice(0, 3)
                  .map((skill: string) => (

                    <span
                      key={skill}
                      className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm"
                    >

                      {skill}

                    </span>

                  ))}

              </div>

              <a
                href={job.apply_link}
                target="_blank"
                className="mt-8 inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-2xl transition"
              >

                Apply Now

              </a>

            </div>

          ))}

        </div>

      </section>

    </main>

  )
}