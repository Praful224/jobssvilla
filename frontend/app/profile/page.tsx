"use client"

export default function ProfilePage() {

  return (

    <main className="min-h-screen bg-black text-white p-10">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-5xl font-bold">

          My Profile

        </h1>

        <div className="grid md:grid-cols-3 gap-8 mt-12">

          {/* LEFT */}

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">

            <div className="w-28 h-28 rounded-full bg-blue-600 flex items-center justify-center text-5xl font-bold">

              P

            </div>

            <h2 className="text-3xl font-bold mt-6">

              Praful Chalakh

            </h2>

            <p className="text-gray-400 mt-2">

              DevOps & Cloud Engineer

            </p>

            <button className="mt-8 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-2xl">

              Upload Resume

            </button>

          </div>

          {/* RIGHT */}

          <div className="md:col-span-2 space-y-8">

            {/* PERSONAL */}

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">

              <h2 className="text-3xl font-bold">

                Personal Information

              </h2>

              <div className="grid md:grid-cols-2 gap-6 mt-8">

                <input
                  placeholder="Full Name"
                  className="bg-black/30 border border-white/10 rounded-2xl p-4 outline-none"
                />

                <input
                  placeholder="Email"
                  className="bg-black/30 border border-white/10 rounded-2xl p-4 outline-none"
                />

                <input
                  placeholder="Phone"
                  className="bg-black/30 border border-white/10 rounded-2xl p-4 outline-none"
                />

                <input
                  placeholder="Date of Birth"
                  className="bg-black/30 border border-white/10 rounded-2xl p-4 outline-none"
                />

              </div>

            </div>

            {/* EXPERIENCE */}

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">

              <h2 className="text-3xl font-bold">

                Experience

              </h2>

              <textarea
                placeholder="Tell us about your experience..."
                rows={5}
                className="w-full mt-8 bg-black/30 border border-white/10 rounded-2xl p-4 outline-none"
              />

            </div>

            {/* SKILLS */}

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">

              <h2 className="text-3xl font-bold">

                Skills

              </h2>

              <input
                placeholder="DevOps, AWS, Kubernetes..."
                className="w-full mt-8 bg-black/30 border border-white/10 rounded-2xl p-4 outline-none"
              />

            </div>

          </div>

        </div>

      </div>

    </main>

  )
}