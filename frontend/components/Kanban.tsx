"use client";

import { Application } from "@/lib/api";

const statuses = ["Applied", "Under Review", "Interview", "Offer", "Rejected"];

type KanbanProps = {
  applications: Application[];
  onStatusChange?: (application: Application, status: string) => void;
};

export function Kanban({ applications, onStatusChange }: KanbanProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-5">
      {statuses.map((status) => {
        const items = applications.filter((item) => item.status === status);

        return (
          <section
            key={status}
            className="min-h-72 rounded-lg border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-white">{status}</h2>
              <span className="rounded-md bg-white/10 px-2 py-1 text-xs text-zinc-300">
                {items.length}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {items.map((application) => (
                <article
                  key={application.id}
                  className="rounded-md border border-white/10 bg-zinc-950 p-3"
                >
                  <h3 className="text-sm font-medium text-white">
                    {application.role}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-400">
                    {application.company}
                  </p>
                  {application.location ? (
                    <p className="mt-1 text-xs text-zinc-500">
                      {application.location}
                    </p>
                  ) : null}
                  {onStatusChange ? (
                    <select
                      value={application.status}
                      onChange={(event) =>
                        onStatusChange(application, event.target.value)
                      }
                      className="mt-3 w-full rounded-md border border-white/10 bg-black px-2 py-2 text-xs text-white outline-none"
                    >
                      {statuses.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
