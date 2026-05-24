"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Plus, Heart, Share2, Tag, User, Sparkles, Send, Info } from "lucide-react";
import { apiFetch, getToken, jsonHeaders } from "@/lib/api";
import { AppShell } from "@/components/AppShell";

type CommunityPost = {
  id: number;
  user_id: number;
  title: string;
  body: string;
  tags?: string | null;
  created_at: string;
  author_name: string;
  likes_count: number;
  liked_by_user?: boolean;
};

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Discussion & Comment States
  const [comments, setComments] = useState<Record<number, any[]>>({});
  const [expandedPosts, setExpandedPosts] = useState<Record<number, boolean>>({});
  const [newCommentText, setNewCommentText] = useState<Record<number, string>>({});

  useEffect(() => {
    loadPosts();
  }, []);

  const toggleComments = async (postId: number) => {
    const isExpanded = !expandedPosts[postId];
    setExpandedPosts((prev) => ({ ...prev, [postId]: isExpanded }));

    if (isExpanded) {
      loadComments(postId);
    }
  };

  const loadComments = async (postId: number) => {
    try {
      const data = await apiFetch<any[]>(`/community/posts/${postId}/comments`);
      setComments((prev) => ({ ...prev, [postId]: data || [] }));
    } catch (e) {
      console.error("Failed to load comments", e);
    }
  };

  const submitComment = async (postId: number) => {
    const text = newCommentText[postId]?.trim();
    if (!text) return;

    if (!getToken()) {
      setStatusMsg("Please log in to participate in the discussion.");
      setTimeout(() => setStatusMsg(""), 3000);
      return;
    }

    try {
      const data = await apiFetch<any>(`/community/posts/${postId}/comments`, {
        auth: true,
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ body: text }),
      });
      // Append new comment and clear input
      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), data],
      }));
      setNewCommentText((prev) => ({ ...prev, [postId]: "" }));
    } catch (e) {
      console.error("Failed to add comment", e);
    }
  };

  const loadPosts = async () => {
    try {
      const data = await apiFetch<CommunityPost[]>("/community/posts");
      // Map user liked states dynamically or keep as returned
      setPosts(data);
    } catch (e) {
      console.error("Failed to load community feed", e);
    }
  };

  const publishPost = async () => {
    if (!title || !body) {
      setStatusMsg("Title and Post Body cannot be empty.");
      return;
    }
    setLoading(true);
    try {
      await apiFetch<CommunityPost>("/community/posts", {
        auth: true,
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ title, body, tags }),
      });
      setTitle("");
      setBody("");
      setTags("");
      setStatusMsg("Post successfully published!");
      loadPosts();
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (e) {
      setStatusMsg("Failed to publish post. Ensure you are signed in.");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: number) => {
    if (!getToken()) {
      setStatusMsg("Please log in to like posts.");
      setTimeout(() => setStatusMsg(""), 3000);
      return;
    }
    
    // Optimistic UI updates for high-end micro-interaction
    setPosts((currentPosts) =>
      currentPosts.map((post) => {
        if (post.id === postId) {
          const wasLiked = post.liked_by_user;
          return {
            ...post,
            liked_by_user: !wasLiked,
            likes_count: wasLiked ? post.likes_count - 1 : post.likes_count + 1,
          };
        }
        return post;
      })
    );

    try {
      const response = await apiFetch<{ liked: boolean; likes_count: number }>(
        `/community/posts/${postId}/like`,
        {
          auth: true,
          method: "POST",
        }
      );
      // Sync back with real backend response
      setPosts((currentPosts) =>
        currentPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              liked_by_user: response.liked,
              likes_count: response.likes_count,
            };
          }
          return post;
        })
      );
    } catch (e) {
      console.error("Failed to like post", e);
      // Revert if error occurs
      loadPosts();
    }
  };

  return (
    <AppShell
      title="Next-Gen Developer Feed"
      subtitle="Share strategies, learning roadmaps, system designs, and collaborate with ecosystem builders."
    >
      {statusMsg && (
        <div className="mb-6 p-4 rounded-xl glass-3d border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-sm font-semibold flex items-center gap-2">
          <Info size={16} />
          {statusMsg}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Feed Listing (Left) */}
        <div className="lg:col-span-2 space-y-6">
          {posts.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
              <MessageSquare size={36} className="text-zinc-700 mb-3" />
              <span className="text-zinc-500 text-sm">Nothing shared in the hub yet. Start the conversation!</span>
            </div>
          ) : (
            posts.map((post) => (
              <article
                key={post.id}
                className="glass-3d bg-zinc-900/30 p-6 rounded-2xl border border-white/5 card-glow-cyan flex flex-col justify-between"
              >
                <div>
                  {/* Author Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400 text-zinc-950 shadow-md">
                        <User size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-white leading-tight">
                          {post.author_name}
                        </h3>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          Ecosystem Contributor • {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      Discussion
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-white leading-snug">
                    {post.title}
                  </h2>
                  <p className="mt-3 text-sm text-zinc-300 leading-relaxed font-normal">
                    {post.body}
                  </p>

                  {post.tags && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {post.tags.split(",").map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-xs text-zinc-400 font-medium"
                        >
                          <Tag size={10} className="text-zinc-500" />
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Micro Actions Panel */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold tracking-wide transition border ${
                        post.liked_by_user
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          : "bg-white/5 text-zinc-300 border-white/5 hover:bg-white/10"
                      }`}
                    >
                      <Heart size={14} className={post.liked_by_user ? "fill-rose-400" : ""} />
                      {post.likes_count} Likes
                    </button>
                    <button
                      onClick={() => toggleComments(post.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold tracking-wide transition border ${
                        expandedPosts[post.id]
                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                          : "bg-white/5 text-zinc-300 border-white/5 hover:bg-white/10"
                      }`}
                    >
                      <MessageSquare size={14} />
                      Discuss
                    </button>
                    <button className="inline-flex items-center gap-2 bg-white/5 border border-white/5 hover:bg-white/10 text-zinc-300 px-4 py-2.5 rounded-xl text-xs font-extrabold tracking-wide transition">
                      <Share2 size={14} />
                      Share
                    </button>
                  </div>
                </div>

                {/* Expanded Discussion Tray */}
                {expandedPosts[post.id] && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      Discussion Thread ({comments[post.id]?.length || 0})
                    </h4>

                    {/* Comments List */}
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {(!comments[post.id] || comments[post.id].length === 0) ? (
                        <p className="text-[11px] text-zinc-500 py-2">No comments yet. Start the discussion!</p>
                      ) : (
                        comments[post.id].map((comment: any) => (
                          <div key={comment.id} className="bg-zinc-950/40 p-3 rounded-xl border border-white/5 flex items-start gap-3">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20">
                              {comment.author_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-zinc-200">{comment.author_name}</span>
                                <span className="text-[9px] text-zinc-500">
                                  {new Date(comment.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-300 font-normal leading-relaxed">{comment.body}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Comment Input */}
                    <div className="flex gap-2">
                      <input
                        value={newCommentText[post.id] || ""}
                        onChange={(e) =>
                          setNewCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        placeholder="Write a constructive comment..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            submitComment(post.id);
                          }
                        }}
                        className="w-full rounded-xl border border-white/5 bg-zinc-950/60 hover:bg-zinc-900/60 focus:border-emerald-500/50 px-4 py-2.5 text-xs text-white outline-none transition focus:ring-1 focus:ring-emerald-500/20 placeholder:text-zinc-500 text-zinc-200"
                      />
                      <button
                        onClick={() => submitComment(post.id)}
                        className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2.5 text-xs font-bold text-zinc-950 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 transition"
                      >
                        <Send size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))
          )}
        </div>

        {/* Post Publisher (Right) */}
        <div className="lg:col-span-1">
          <div className="glass-3d bg-white/[0.03] p-6 rounded-2xl border border-white/10 sticky top-28">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <Sparkles size={20} className="text-emerald-400" />
              Publish Post
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                  Topic Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter dynamic header title"
                  className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-sm text-white outline-none hover:border-zinc-700 focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="react, system-design, next-gen"
                  className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-sm text-white outline-none hover:border-zinc-700 focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                  Post Content
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="What is happening in your career journey?"
                  rows={5}
                  className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-sm text-white outline-none hover:border-zinc-700 focus:border-emerald-500 transition resize-none"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={publishPost}
                disabled={loading}
                className="neon-btn w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-3.5 text-sm font-bold text-zinc-950 hover:brightness-110 shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
              >
                <Send size={15} />
                {loading ? "Publishing..." : "Broadcast to Feed"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
