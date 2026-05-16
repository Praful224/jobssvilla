"use client"

export default function ApplicationsPage() {

  return (

    <main className="min-h-screen bg-black text-white p-10">

      <h1 className="text-5xl font-bold">

        My Applications

      </h1>

      <div className="mt-12 grid md:grid-cols-2 gap-8">

        {[1,2,3].map((item) => (

          <div
            key={item}
            className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl"
          >

            <h2 className="text-3xl font-bold">

              DevOps Engineer

            </h2>

            <p className="text-gray-400 mt-3">

              Google • Bangalore

            </p>

            <div className="mt-6 inline-block bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full">

              Under Review

            </div>

          </div>

        ))}

      </div>

    </main>

  )
}