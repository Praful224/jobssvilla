"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus } from "lucide-react";
import {
  apiFetch,
  getToken,
  jsonHeaders,
  NotificationItem,
} from "@/lib/api";
import { AppShell } from "@/components/AppShell";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }

    loadNotifications();
  }, [router]);

  const loadNotifications = async () => {
    const data = await apiFetch<NotificationItem[]>("/notifications", {
      auth: true,
    });
    setNotifications(data);
  };

  const createSample = async () => {
    await apiFetch("/notifications", {
      auth: true,
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({
        title: "Job alert",
        message: message || "A matching role was found for your skills.",
        channel: "in_app",
      }),
    });
    setMessage("");
    loadNotifications();
  };

  const markRead = async (id: number) => {
    await apiFetch(`/notifications/${id}/read`, {
      auth: true,
      method: "PATCH",
    });
    loadNotifications();
  };

  return (
    <AppShell
      title="Notifications"
      subtitle="In-app alerts are ready; email, Telegram, and WhatsApp can plug into this route later."
    >
      <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <div className="flex gap-3">
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Notification message"
            className="min-w-0 flex-1 rounded-md border border-white/10 bg-black px-3 py-3 text-sm outline-none"
          />
          <button
            onClick={createSample}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-3 text-sm font-medium text-zinc-950 hover:bg-emerald-400"
          >
            <Plus size={17} />
            Add
          </button>
        </div>
      </section>

      <div className="mt-5 space-y-3">
        {notifications.map((item) => (
          <article
            key={item.id}
            className="flex items-start justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-4"
          >
            <div>
              <h2 className="font-semibold">{item.title}</h2>
              <p className="mt-1 text-sm text-zinc-400">{item.message}</p>
              <p className="mt-2 text-xs text-zinc-500">{item.channel}</p>
            </div>
            <button
              onClick={() => markRead(item.id)}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-md ${
                item.is_read
                  ? "bg-white/10 text-zinc-500"
                  : "bg-emerald-500 text-zinc-950"
              }`}
              title="Mark read"
            >
              <Check size={17} />
            </button>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
