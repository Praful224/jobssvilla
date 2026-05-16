"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Plus } from "lucide-react";
import { apiFetch, jsonHeaders, Post } from "@/lib/api";
import { AppShell } from "@/components/AppShell";

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const data = await apiFetch<Post[]>("/community/posts");
    setPosts(data);
  };

  const addPost = async () => {
    await apiFetch<Post>("/community/posts", {
      auth: true,
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({ title, body, tags }),
    });
    setTitle("");
    setBody("");
    setTags("");
    setStatus("Post published");
    loadPosts();
  };

  return (
    <AppShell
      title="Community Feed"
      subtitle="Discuss jobs, learning paths, interview prep, and company experiences."
    >
      <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Title"
            className="rounded-md border border-white/10 bg-black px-3 py-3 text-sm outline-none"
          />
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="Tags"
            className="rounded-md border border-white/10 bg-black px-3 py-3 text-sm outline-none"
          />
        </div>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Post"
          rows={4}
          className="mt-3 w-full rounded-md border border-white/10 bg-black px-3 py-3 text-sm outline-none"
        />
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={addPost}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-3 text-sm font-medium text-zinc-950 hover:bg-emerald-400"
          >
            <Plus size={17} />
            Publish
          </button>
          {status ? <p className="text-sm text-emerald-300">{status}</p> : null}
        </div>
      </section>

      <div className="mt-5 space-y-4">
        {posts.map((post) => (
          <article
            key={post.id}
            className="rounded-lg border border-white/10 bg-white/[0.04] p-5"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-400 text-zinc-950">
                <MessageSquare size={19} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{post.title}</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  {post.body}
                </p>
                {post.tags ? (
                  <p className="mt-3 text-xs text-zinc-500">{post.tags}</p>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
