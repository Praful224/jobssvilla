"use client"

import { useState } from "react"

export default function SettingsPage() {

  const [active, setActive] = useState("Account")

  const menus = [
    "Account",
    "Notifications",
    "Applications",
    "Security",
    "Appearance",
    "Privacy",
  ]

  return (

    <main className="min-h-screen bg-black text-white p-10">

      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">

        {/* SIDEBAR */}

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl h-fit">

          <h2 className="text-3xl font-bold">

            Settings

          </h2>

          <div className="mt-8 space-y-3">

            {menus.map((item) => (

              <button
                key={item}
                onClick={() => setActive(item)}
                className={`w-full text-left px-5 py-4 rounded-2xl transition ${
                  active === item
                    ? "bg-blue-600"
                    : "hover:bg-white/10"
                }`}
              >

                {item}

              </button>

            ))}

          </div>

        </div>

        {/* CONTENT */}

        <div className="md:col-span-3 bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-xl">

          <h1 className="text-5xl font-bold">

            {active}

          </h1>

          <div className="mt-10 space-y-6">

            <input
              placeholder="Update setting..."
              className="w-full bg-black/30 border border-white/10 rounded-2xl p-5 outline-none"
            />

            <input
              placeholder="Another setting..."
              className="w-full bg-black/30 border border-white/10 rounded-2xl p-5 outline-none"
            />

            <button className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-2xl">

              Save Changes

            </button>

          </div>

        </div>

      </div>

    </main>

  )
}