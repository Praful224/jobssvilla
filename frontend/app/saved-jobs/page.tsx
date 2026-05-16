"use client"

export default function SavedJobsPage() {

  return (

    <main className="min-h-screen bg-black text-white p-10">

      <h1 className="text-5xl font-bold">

        Saved Jobs

      </h1>

      <div className="mt-12 grid md:grid-cols-3 gap-8">

        {[1,2,3].map((item) => (

          <div
            key={item}
            className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl"
          >

            <h2 className="text-3xl font-bold">

              Cloud Engineer

            </h2>

            <p className="text-gray-400 mt-3">

              Microsoft • Hyderabad

            </p>

            <button className="mt-8 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-2xl">

              Apply Now

            </button>

          </div>

        ))}

      </div>

    </main>

  )
}