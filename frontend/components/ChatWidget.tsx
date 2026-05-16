"use client";

import { useState } from "react";
import { Bot, Send } from "lucide-react";
import { apiFetch, jsonHeaders } from "@/lib/api";

type ChatMessage = {
  role: "user" | "assistant";
  body: string;
};

export function ChatWidget() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      body: "Share a goal or target role and I will map the next move.",
    },
  ]);
  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    if (!message.trim()) {
      return;
    }

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", body: message },
    ];
    setMessages(nextMessages);
    setMessage("");

    const data = await apiFetch<{ reply: string }>("/ai/career-assistant", {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({ message }),
    });

    setMessages([...nextMessages, { role: "assistant", body: data.reply }]);
  };

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-300 text-zinc-950">
          <Bot size={19} />
        </div>
        <h2 className="font-semibold">Career Assistant</h2>
      </div>

      <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
        {messages.map((item, index) => (
          <div
            key={`${item.role}-${index}`}
            className={`rounded-md px-3 py-2 text-sm leading-6 ${
              item.role === "assistant"
                ? "bg-black text-zinc-300"
                : "bg-emerald-500 text-zinc-950"
            }`}
          >
            {item.body}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              sendMessage();
            }
          }}
          placeholder="Ask about resume, jobs, interviews..."
          className="min-w-0 flex-1 rounded-md border border-white/10 bg-black px-3 py-2 text-sm outline-none"
        />
        <button
          onClick={sendMessage}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white text-zinc-950 hover:bg-zinc-200"
          title="Send"
        >
          <Send size={17} />
        </button>
      </div>
    </section>
  );
}
