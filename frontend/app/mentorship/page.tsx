"use client";

import { useEffect, useState } from "react";
import {
  CalendarPlus, Plus, Users, Video, Info, X, Clock,
  MessageSquare, Send, Calendar, CheckCircle2, XCircle,
  Trash2, Lock, ChevronDown, ChevronUp, ExternalLink
} from "lucide-react";
import { apiFetch, getToken, jsonHeaders, Mentor } from "@/lib/api";
import { AppShell } from "@/components/AppShell";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

const emptyMentor = {
  name: "", title: "", company: "", skills: "",
  hourly_rate: "", availability: "", bio: "",
};

type MentorSlot = {
  id: number;
  mentor_id: number;
  date: string;
  start_time: string;
  end_time: string;
  consultation_type?: string;
  price?: number;
  status: string;
  is_booked: boolean;
  payment_status?: string;
};

type SessionBooking = {
  id: number;
  role: "student" | "mentor";
  mentor_name?: string;
  mentor_title?: string;
  mentor_company?: string;
  student_name?: string;
  student_email?: string;
  interview_type?: string;
  scheduled_for?: string;
  status: string;
  meeting_link?: string;
  google_calendar_url?: string;
  ical_url?: string;
  payment_status?: string;
  booked_at?: string;
};

type LegacySession = {
  id: number;
  mentor_name: string;
  mentor_title: string;
  mentor_company: string;
  interview_type: string;
  scheduled_for: string;
  status: string;
  feedback?: string | null;
  created_at: string;
  role_in_interview?: string;
  student_name?: string;
  student_email?: string;
};

const CONSULTATION_TYPES = [
  { value: "mock", label: "1:1 Tech Mock Interview" },
  { value: "resume", label: "Resume Review & Deep Dive" },
  { value: "career", label: "Career Strategy Consultation" },
  { value: "system", label: "System Design Coaching" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function MentorshipPage() {
  const [activeTab, setActiveTab] = useState<"market" | "sessions" | "myslots">("market");
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [sessions, setSessions] = useState<SessionBooking[]>([]);
  const [legacySessions, setLegacySessions] = useState<LegacySession[]>([]);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Mentor profile state
  const [form, setForm] = useState(emptyMentor);
  const [hasMentorProfile, setHasMentorProfile] = useState(false);
  const [mySlots, setMySlots] = useState<MentorSlot[]>([]);
  const [userRole, setUserRole] = useState<string>("student");

  // Booking modal state
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [mentorSlots, setMentorSlots] = useState<MentorSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<MentorSlot | null>(null);
  const [freeformDate, setFreeformDate] = useState("");
  const [freeformTime, setFreeformTime] = useState("");
  const [interviewType, setInterviewType] = useState("mock");
  const [bookingMode, setBookingMode] = useState<"slot" | "freeform">("slot");
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Slot creation state (mentor panel)
  const [newSlot, setNewSlot] = useState({
    date: "", start_time: "", end_time: "",
    consultation_type: "mock", price: "",
  });
  const [slotStatusMsg, setSlotStatusMsg] = useState("");

  // Chat state
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMsgText, setNewMsgText] = useState("");
  const [chatPollInterval, setChatPollInterval] = useState<any>(null);

  // ── Load on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    loadMentors();
    if (getToken()) {
      loadMySessions();
      loadLegacySessions();
      loadUserProfile();
    }
  }, []);

  useEffect(() => {
    return () => { if (chatPollInterval) clearInterval(chatPollInterval); };
  }, [chatPollInterval]);

  // ── Data loading ───────────────────────────────────────────────────────────

  const loadMentors = async () => {
    try {
      const data = await apiFetch<Mentor[]>("/mentors", { auth: true });
      setMentors(data);
    } catch (e) {
      console.error("Failed to load mentors", e);
    }
  };

  const loadMySessions = async () => {
    try {
      const data = await apiFetch<SessionBooking[]>("/sessions/my", { auth: true });
      setSessions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load sessions", e);
    }
  };

  const loadLegacySessions = async () => {
    try {
      const data = await apiFetch<LegacySession[]>("/mentors/interviews", { auth: true });
      setLegacySessions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load legacy sessions", e);
    }
  };

  const loadUserProfile = async () => {
    try {
      const data = await apiFetch<any>("/profile", { auth: true });
      setUserRole(data.role || "student");
      if (data.role === "mentor") {
        await loadMentorProfile();
      }
    } catch (e) {
      console.error("Failed to load profile", e);
    }
  };

  const loadMentorProfile = async () => {
    try {
      const myProfile = await apiFetch<any>("/mentors/me", { auth: true });
      if (myProfile?.id) {
        setHasMentorProfile(true);
        setForm({
          name: myProfile.name || "",
          title: myProfile.title || "",
          company: myProfile.company || "",
          skills: myProfile.skills || "",
          hourly_rate: myProfile.hourly_rate || "",
          availability: myProfile.availability || "online",
          bio: myProfile.bio || "",
        });
        // Load mentor's own slots
        const slots = await apiFetch<MentorSlot[]>(
          `/mentors/${myProfile.id}/slots?all_slots=true`, { auth: true }
        );
        setMySlots(Array.isArray(slots) ? slots : []);
      }
    } catch (e) {
      console.error("Failed to load mentor profile", e);
    }
  };

  // When a mentor is selected for booking, fetch their available slots
  const openBookingModal = async (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setSelectedSlot(null);
    setFreeformDate("");
    setFreeformTime("");
    setInterviewType("mock");
    setBookingMode("slot");
    setSlotsLoading(true);
    try {
      const slots = await apiFetch<MentorSlot[]>(`/mentors/${mentor.id}/slots`, { auth: true });
      setMentorSlots(Array.isArray(slots) ? slots : []);
    } catch (e) {
      setMentorSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  // ── Book a session ─────────────────────────────────────────────────────────

  const handleBookSession = async () => {
    if (!selectedMentor) return;

    // Validate based on mode
    if (bookingMode === "slot" && !selectedSlot) {
      setErrorMsg("Please select an available time slot.");
      return;
    }
    if (bookingMode === "freeform" && (!freeformDate || !freeformTime)) {
      setErrorMsg("Please select a date and time.");
      return;
    }

    setErrorMsg("");

    try {
      let body: any;

      if (bookingMode === "slot" && selectedSlot) {
        body = {
          slot_id: selectedSlot.id,
          interview_type: interviewType,
        };
      } else {
        // Freeform: build human-readable datetime with local timezone
        const dateObj = new Date(`${freeformDate}T${freeformTime}`);
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const dateTime =
          dateObj.toLocaleString("en-US", {
            weekday: "long", year: "numeric", month: "long",
            day: "numeric", hour: "numeric", minute: "numeric", hour12: true,
          }) + ` (${tz})`;

        body = {
          mentor_id: selectedMentor.id,
          interview_type: interviewType,
          scheduled_for: dateTime,
        };
      }

      const booking = await apiFetch<SessionBooking>("/sessions/book", {
        auth: true,
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify(body),
      });

      setStatusMsg(`✅ Session booked with ${selectedMentor.name}! Check your sessions tab.`);
      setSelectedMentor(null);
      await loadMySessions();
      setActiveTab("sessions");
      setTimeout(() => setStatusMsg(""), 5000);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Booking failed. Please try again.");
    }
  };

  // ── Cancel a session ───────────────────────────────────────────────────────

  const handleCancelSession = async (bookingId: number) => {
    if (!confirm("Cancel this session?")) return;
    try {
      await apiFetch(`/sessions/${bookingId}/cancel`, { auth: true, method: "POST" });
      setStatusMsg("Session cancelled.");
      loadMySessions();
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Cancel failed.");
    }
  };

  // ── Mentor: Save profile ───────────────────────────────────────────────────

  const addMentorProfile = async () => {
    if (!form.name || !form.title || !form.bio) {
      setStatusMsg("Name, Title, and Bio are required.");
      return;
    }
    try {
      await apiFetch<Mentor>("/mentors", {
        auth: true, method: "POST",
        headers: jsonHeaders(), body: JSON.stringify(form),
      });
      setStatusMsg("✅ Mentor profile updated!");
      setHasMentorProfile(true);
      loadMentors();
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (e) {
      setStatusMsg("Failed to update mentor profile.");
    }
  };

  // ── Mentor: Create a slot ──────────────────────────────────────────────────

  const handleCreateSlot = async () => {
    if (!newSlot.date || !newSlot.start_time || !newSlot.end_time) {
      setSlotStatusMsg("Date, start time, and end time are required.");
      return;
    }
    if (newSlot.start_time >= newSlot.end_time) {
      setSlotStatusMsg("End time must be after start time.");
      return;
    }

    try {
      await apiFetch("/mentors/slots", {
        auth: true, method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({
          ...newSlot,
          price: newSlot.price ? parseFloat(newSlot.price) : 0,
        }),
      });
      setSlotStatusMsg("✅ Slot published! Students can now see and book it.");
      setNewSlot({ date: "", start_time: "", end_time: "", consultation_type: "mock", price: "" });
      loadMentorProfile();
      setTimeout(() => setSlotStatusMsg(""), 4000);
    } catch (e) {
      setSlotStatusMsg(e instanceof Error ? e.message : "Failed to create slot.");
    }
  };

  // ── Mentor: Delete a slot ──────────────────────────────────────────────────

  const handleDeleteSlot = async (slotId: number) => {
    if (!confirm("Cancel this slot?")) return;
    try {
      await apiFetch(`/mentors/slots/${slotId}`, { auth: true, method: "DELETE" });
      setSlotStatusMsg("Slot cancelled.");
      loadMentorProfile();
    } catch (e) {
      setSlotStatusMsg(e instanceof Error ? e.message : "Failed to cancel slot.");
    }
  };

  // ── Chat ───────────────────────────────────────────────────────────────────

  const toggleChat = (sessionId: number) => {
    if (activeChatId === sessionId) {
      setActiveChatId(null);
      setChatMessages([]);
      if (chatPollInterval) { clearInterval(chatPollInterval); setChatPollInterval(null); }
    } else {
      setActiveChatId(sessionId);
      setNewMsgText("");
      loadChatMessages(sessionId);
      if (chatPollInterval) clearInterval(chatPollInterval);
      const interval = setInterval(() => loadChatMessages(sessionId), 3500);
      setChatPollInterval(interval);
    }
  };

  const loadChatMessages = async (sessionId: number) => {
    try {
      const data = await apiFetch<any[]>(`/mentors/interviews/${sessionId}/messages`, { auth: true });
      setChatMessages(data || []);
    } catch (e) {
      console.error("Chat load failed", e);
    }
  };

  const submitChatMessage = async (sessionId: number) => {
    if (!newMsgText.trim()) return;
    const text = newMsgText;
    setNewMsgText("");
    try {
      const msg = await apiFetch<any>(`/mentors/interviews/${sessionId}/messages`, {
        auth: true, method: "POST",
        headers: jsonHeaders(), body: JSON.stringify({ body: text }),
      });
      setChatMessages((c) => [...c, msg]);
    } catch (e) {
      console.error("Chat send failed", e);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getMeetLink = (s: SessionBooking | LegacySession) => {
    if ("meeting_link" in s && s.meeting_link) return s.meeting_link;
    if ("feedback" in s && s.feedback) {
      const m = s.feedback.match(/https:\/\/[^\s|]+/);
      return m ? m[0] : null;
    }
    return null;
  };

  const allSessions = sessions.length > 0 ? sessions : [];
  const totalSessions = allSessions.length + legacySessions.length;

  const statusColor = (status: string) => {
    if (status === "confirmed") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    if (status === "cancelled") return "text-red-400 bg-red-500/10 border-red-500/30";
    if (status === "completed") return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
    return "text-zinc-400 bg-zinc-500/10 border-zinc-500/30";
  };

  const today = new Date().toISOString().split("T")[0];

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <AppShell
      title="Elite 1:1 Professional Mentorship Market"
      subtitle="Connect with technical leaders, book real time slots, and access live 1:1 video consulting rooms."
    >
      {/* Tab Navigation */}
      <div className="flex border-b border-white/10 gap-6 mb-6 flex-wrap">
        {[
          { key: "market", label: "Explore Mentors" },
          { key: "sessions", label: "My Sessions", count: totalSessions },
          ...(userRole === "mentor" ? [{ key: "myslots", label: "My Slots", count: mySlots.length }] : []),
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 text-sm font-medium transition-all relative ${
              activeTab === tab.key ? "text-emerald-400 font-semibold" : "text-zinc-400 hover:text-white"
            }`}
          >
            {tab.label}
            {(tab.count ?? 0) > 0 && (
              <span className="ml-2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-bold">
                {tab.count}
              </span>
            )}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-400 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Global Status / Error Banner */}
      {statusMsg && (
        <div className="mb-6 p-4 rounded-xl glass-3d border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} /> {statusMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/5 text-red-400 text-sm font-semibold flex items-center gap-2">
          <XCircle size={16} /> {errorMsg}
          <button onClick={() => setErrorMsg("")} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* ── TAB: Explore Mentors ─────────────────────────────────────────── */}
      {activeTab === "market" && (
        <div className="space-y-10">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mentors.length === 0 && (
              <div className="col-span-3 h-48 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl">
                <Users size={36} className="text-zinc-700 mb-3" />
                <span className="text-zinc-500 text-sm">No mentors available yet.</span>
              </div>
            )}
            {mentors.map((mentor) => (
              <div key={mentor.id} className="glass-3d p-6 rounded-2xl border border-white/10 card-glow-cyan flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400 text-zinc-950 shadow-md font-black text-lg">
                      {mentor.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white leading-tight">{mentor.name}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {mentor.title}{mentor.company ? ` @ ${mentor.company}` : ""}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-zinc-300 line-clamp-3 leading-relaxed">{mentor.bio}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {mentor.skills?.split(",").map((s) => (
                      <span key={s} className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-xs text-zinc-400 font-medium">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-wider">Hourly Rate</span>
                    <span className="text-sm font-extrabold text-cyan-400">
                      {mentor.hourly_rate ? `₹${mentor.hourly_rate}` : "Free"}
                    </span>
                  </div>
                  <button
                    onClick={() => openBookingModal(mentor)}
                    className="neon-btn rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-xs font-bold text-zinc-950 flex items-center gap-1.5"
                  >
                    <CalendarPlus size={14} /> Book Slot
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Mentor Profile Config (only for approved mentors) */}
          {userRole === "mentor" && (
            <div className="glass-3d bg-white/[0.02] p-8 rounded-2xl border border-white/5 card-glow-emerald mt-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-white/5">
                <div>
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <Plus size={22} className="text-emerald-400" />
                    {hasMentorProfile ? "Configure Mentor Portfolio" : "Register as a Platform Mentor"}
                  </h2>
                  <p className="text-sm text-zinc-400 mt-2">Manage credentials, availability, and consulting rates.</p>
                </div>
                {/* Online/Offline Toggle */}
                <div className="flex items-center gap-3 bg-zinc-950/60 p-3.5 rounded-2xl border border-white/5 shrink-0">
                  <div className="text-left space-y-0.5 pr-2">
                    <span className="text-[9px] uppercase font-bold text-zinc-400 block">Status</span>
                    <span className={`text-[10px] font-black uppercase ${form.availability === "offline" ? "text-red-400" : "text-emerald-400 animate-pulse"}`}>
                      {form.availability === "offline" ? "Offline" : "Online"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm((c) => ({ ...c, availability: c.availability === "offline" ? "online" : "offline" }))}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition ${
                      form.availability === "offline"
                        ? "bg-red-500/10 text-red-400 border border-red-500/30"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    Toggle
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                {Object.keys(emptyMentor).map((field) => {
                  if (field === "availability") return null;
                  return (
                    <div key={field}>
                      <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                        {field.replace("_", " ")}
                      </label>
                      <input
                        value={form[field as keyof typeof emptyMentor]}
                        onChange={(e) => setForm((c) => ({ ...c, [field]: e.target.value }))}
                        placeholder={`Enter ${field.replace("_", " ")}`}
                        className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-sm text-white outline-none hover:border-zinc-700 focus:border-emerald-500 transition"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end pt-4 border-t border-white/5">
                <button
                  onClick={addMentorProfile}
                  className="neon-btn rounded-xl bg-emerald-500 hover:bg-emerald-400 px-6 py-3.5 text-sm font-bold text-zinc-950 flex items-center gap-2"
                >
                  <Plus size={16} />
                  {hasMentorProfile ? "Update Portfolio" : "Register Portfolio"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: My Sessions ─────────────────────────────────────────────── */}
      {activeTab === "sessions" && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white">
            Booked Consultations & Live Rooms ({totalSessions})
          </h2>

          {totalSessions === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl">
              <Video size={36} className="text-zinc-700 mb-3" />
              <span className="text-zinc-500 text-sm">No sessions yet. Book one from the Explore tab!</span>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* New SessionBooking sessions */}
              {allSessions.map((session) => {
                const meetLink = getMeetLink(session);
                const isStudent = session.role === "student";
                return (
                  <div key={`new-${session.id}`} className="glass-3d bg-zinc-900/40 p-6 rounded-2xl border border-white/10 card-glow-amber flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <span className="rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                          {session.interview_type}
                        </span>
                        <div className="flex gap-2 items-center">
                          <span className={`rounded-lg px-2 py-0.5 text-[9px] font-extrabold uppercase border ${isStudent ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"}`}>
                            {isStudent ? "Attending" : "Hosting"}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border ${statusColor(session.status)}`}>
                            {session.status}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4">
                        {isStudent ? (
                          <>
                            <h3 className="text-lg font-bold text-white">{session.mentor_name}</h3>
                            <p className="text-xs text-zinc-400">{session.mentor_title} @ {session.mentor_company}</p>
                          </>
                        ) : (
                          <>
                            <h3 className="text-lg font-bold text-white">Coaching: {session.student_name}</h3>
                            <p className="text-xs text-zinc-400">{session.student_email}</p>
                          </>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-zinc-300">
                          <Clock size={14} className="text-zinc-500" />
                          <span className="font-semibold">{session.scheduled_for || "Time TBD"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-white/5 space-y-2">
                      <div className="flex gap-2">
                        {meetLink ? (
                          <a href={meetLink} target="_blank" rel="noreferrer"
                            className="neon-btn flex-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-2.5 text-xs font-bold text-zinc-950 flex items-center justify-center gap-1.5">
                            <Video size={14} /> Join Room
                          </a>
                        ) : (
                          <div className="flex-1 text-center text-[10px] font-bold text-zinc-500 border border-white/5 rounded-xl bg-zinc-950/40 py-2.5">
                            Link Pending
                          </div>
                        )}
                        {session.google_calendar_url && (
                          <a href={session.google_calendar_url} target="_blank" rel="noreferrer"
                            className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-xs font-bold text-zinc-300 hover:bg-zinc-800 flex items-center gap-1.5 transition">
                            <Calendar size={14} />
                          </a>
                        )}
                        {session.status !== "cancelled" && isStudent && (
                          <button
                            onClick={() => handleCancelSession(session.id)}
                            className="rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/10 transition"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Legacy /mentors/interviews sessions (with chat) */}
              {legacySessions.map((session) => {
                const meetLink = getMeetLink(session);
                const isMentor = session.role_in_interview === "mentor";
                return (
                  <div key={`legacy-${session.id}`} className="glass-3d bg-zinc-900/40 p-6 rounded-2xl border border-white/10 card-glow-amber flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <span className="rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                          {session.interview_type}
                        </span>
                        <div className="flex gap-2 items-center">
                          <span className={`rounded-lg px-2 py-0.5 text-[9px] font-extrabold uppercase border ${isMentor ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/30"}`}>
                            {isMentor ? "Hosting" : "Attending"}
                          </span>
                          <span className="text-[9px] font-bold text-zinc-500">{session.status}</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        {isMentor ? (
                          <>
                            <h3 className="text-lg font-bold text-white">Coaching: {session.student_name}</h3>
                            <p className="text-xs text-zinc-400">{session.student_email}</p>
                          </>
                        ) : (
                          <>
                            <h3 className="text-lg font-bold text-white">{session.mentor_name}</h3>
                            <p className="text-xs text-zinc-400">{session.mentor_title} @ {session.mentor_company}</p>
                          </>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5">
                        <div className="flex items-center gap-2 text-xs text-zinc-300">
                          <Clock size={14} className="text-zinc-500" />
                          <span className="font-semibold">{session.scheduled_for}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-white/5 space-y-2">
                      <div className="flex gap-2">
                        {meetLink ? (
                          <a href={meetLink} target="_blank" rel="noreferrer"
                            className="neon-btn flex-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-2.5 text-xs font-bold text-zinc-950 flex items-center justify-center gap-1.5">
                            <Video size={14} /> Join Room
                          </a>
                        ) : (
                          <div className="flex-1 text-center text-[10px] font-bold text-zinc-500 border border-white/5 rounded-xl bg-zinc-950/40 py-2.5">
                            Link Pending
                          </div>
                        )}
                        <button
                          onClick={() => toggleChat(session.id)}
                          className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                            activeChatId === session.id
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10"
                          }`}
                        >
                          <MessageSquare size={14} /> Chat
                        </button>
                      </div>

                      {/* Chat Panel */}
                      {activeChatId === session.id && (
                        <div className="mt-4 pt-4 border-t border-white/5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                            Live Chat
                          </h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto bg-zinc-950/45 p-2.5 rounded-xl border border-white/5 flex flex-col gap-2">
                            {chatMessages.length === 0 ? (
                              <p className="text-[10px] text-zinc-600 text-center py-4">No messages yet. Start chatting!</p>
                            ) : (
                              chatMessages.map((msg: any) => {
                                const isMe = msg.sender_name !== (isMentor ? session.student_name : session.mentor_name);
                                return (
                                  <div key={msg.id} className={`flex flex-col max-w-[85%] rounded-2xl p-2.5 text-xs ${isMe ? "ml-auto bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-br-none" : "mr-auto bg-zinc-900/60 text-zinc-300 border border-white/5 rounded-bl-none"}`}>
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <span className="text-[9px] font-black text-zinc-400">{msg.sender_name}</span>
                                      <span className="text-[8px] text-zinc-500">{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                    </div>
                                    <p className="font-medium">{msg.body}</p>
                                  </div>
                                );
                              })
                            )}
                          </div>
                          <div className="flex gap-2">
                            <input
                              value={newMsgText}
                              onChange={(e) => setNewMsgText(e.target.value)}
                              onKeyDown={(e) => { if (e.key === "Enter") submitChatMessage(session.id); }}
                              placeholder="Type a message..."
                              className="w-full rounded-xl border border-white/5 bg-zinc-950/60 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50 transition"
                            />
                            <button onClick={() => submitChatMessage(session.id)}
                              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-3.5 py-2 text-xs font-bold text-zinc-950">
                              <Send size={11} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: My Slots (Mentor) ────────────────────────────────────────── */}
      {activeTab === "myslots" && userRole === "mentor" && (
        <div className="space-y-8">
          {/* Create new slot */}
          <div className="glass-3d p-6 rounded-2xl border border-white/10">
            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <CalendarPlus size={20} className="text-emerald-400" />
              Publish New Availability Slot
            </h2>
            <p className="text-xs text-zinc-400 mb-5">
              Create a slot and students can see it and book instantly.
            </p>

            {slotStatusMsg && (
              <div className={`mb-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${slotStatusMsg.startsWith("✅") ? "text-emerald-400 bg-emerald-500/5 border border-emerald-500/20" : "text-red-400 bg-red-500/5 border border-red-500/20"}`}>
                {slotStatusMsg}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1.5">Date</label>
                <input type="date" min={today} value={newSlot.date}
                  onChange={(e) => setNewSlot((c) => ({ ...c, date: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1.5">Start Time</label>
                <input type="time" value={newSlot.start_time}
                  onChange={(e) => setNewSlot((c) => ({ ...c, start_time: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1.5">End Time</label>
                <input type="time" value={newSlot.end_time}
                  onChange={(e) => setNewSlot((c) => ({ ...c, end_time: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1.5">Session Type</label>
                <select value={newSlot.consultation_type}
                  onChange={(e) => setNewSlot((c) => ({ ...c, consultation_type: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition cursor-pointer">
                  {CONSULTATION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1.5">Price (₹)</label>
                <input type="number" min="0" placeholder="0 for free"
                  value={newSlot.price}
                  onChange={(e) => setNewSlot((c) => ({ ...c, price: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition" />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={handleCreateSlot}
                className="neon-btn rounded-xl bg-emerald-500 hover:bg-emerald-400 px-6 py-3 text-sm font-bold text-zinc-950 flex items-center gap-2">
                <Plus size={16} /> Publish Slot
              </button>
            </div>
          </div>

          {/* Existing slots */}
          <div>
            <h3 className="text-base font-bold text-white mb-4">Your Published Slots ({mySlots.length})</h3>
            {mySlots.length === 0 ? (
              <div className="h-40 flex items-center justify-center border border-dashed border-white/10 rounded-2xl">
                <span className="text-zinc-500 text-sm">No slots published yet.</span>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {mySlots.map((slot) => (
                  <div key={slot.id} className={`glass-3d p-5 rounded-2xl border flex flex-col gap-3 ${slot.is_booked ? "border-amber-500/20" : "border-white/10"}`}>
                    <div className="flex justify-between items-start">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg border ${slot.is_booked ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"}`}>
                        {slot.is_booked ? "Booked" : "Available"}
                      </span>
                      {!slot.is_booked && (
                        <button onClick={() => handleDeleteSlot(slot.id)}
                          className="text-zinc-600 hover:text-red-400 transition">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{slot.date}</p>
                      <p className="text-xs text-zinc-400">{slot.start_time} – {slot.end_time}</p>
                      <p className="text-xs text-zinc-500 mt-1 capitalize">{slot.consultation_type?.replace("_", " ")}</p>
                      {slot.price ? (
                        <p className="text-xs font-bold text-cyan-400 mt-1">₹{slot.price}</p>
                      ) : (
                        <p className="text-xs text-zinc-500 mt-1">Free</p>
                      )}
                    </div>
                    {slot.is_booked && (
                      <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold">
                        <Lock size={11} /> Slot is booked
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Booking Modal ────────────────────────────────────────────────── */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="glass-3d bg-zinc-950 border border-white/10 p-6 rounded-2xl w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedMentor(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Book Session with</h3>
            <p className="text-sm text-emerald-400 font-semibold mb-5">{selectedMentor.name}</p>

            {/* Mode selector */}
            <div className="flex gap-2 mb-5">
              {(["slot", "freeform"] as const).map((m) => (
                <button key={m} onClick={() => { setBookingMode(m); setSelectedSlot(null); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${bookingMode === m ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "text-zinc-400 border-white/10 hover:bg-white/5"}`}>
                  {m === "slot" ? "📅 Pick Available Slot" : "✏️ Custom Time"}
                </button>
              ))}
            </div>

            {/* Slot picker */}
            {bookingMode === "slot" && (
              <div className="space-y-3 mb-5">
                <label className="text-[10px] uppercase font-bold text-zinc-400 block">Available Slots</label>
                {slotsLoading ? (
                  <div className="text-center text-zinc-500 text-xs py-6">Loading slots...</div>
                ) : mentorSlots.length === 0 ? (
                  <div className="text-center text-zinc-500 text-xs py-6 border border-dashed border-white/10 rounded-xl">
                    No available slots. Use Custom Time instead.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {mentorSlots.map((slot) => (
                      <button key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        disabled={slot.is_booked}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs transition ${
                          selectedSlot?.id === slot.id
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                            : slot.is_booked
                              ? "opacity-40 cursor-not-allowed border-white/5 text-zinc-500"
                              : "border-white/10 text-zinc-300 hover:border-emerald-500/30 hover:bg-white/5"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold">{slot.date} • {slot.start_time} – {slot.end_time}</span>
                          {slot.is_booked ? (
                            <span className="text-amber-400 font-bold flex items-center gap-1"><Lock size={10} /> Taken</span>
                          ) : (
                            <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 size={10} /> Free</span>
                          )}
                        </div>
                        <div className="mt-1 text-zinc-500 capitalize">
                          {slot.consultation_type?.replace("_", " ")} {slot.price ? `• ₹${slot.price}` : "• Free"}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Freeform time picker */}
            {bookingMode === "freeform" && (
              <div className="space-y-4 mb-5">
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1.5">Select Date</label>
                  <input type="date" min={today} value={freeformDate}
                    onChange={(e) => setFreeformDate(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1.5">Select Time</label>
                  <input type="time" value={freeformTime}
                    onChange={(e) => setFreeformTime(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition" />
                </div>
              </div>
            )}

            {/* Consultation Type */}
            <div className="mb-5">
              <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1.5">Consultation Type</label>
              <select value={interviewType} onChange={(e) => setInterviewType(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition cursor-pointer">
                {CONSULTATION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            {/* Error in modal */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl border border-red-500/30 bg-red-500/5 text-red-400 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setSelectedMentor(null)}
                className="w-full rounded-xl border border-white/10 hover:bg-white/5 py-3 text-xs font-bold text-zinc-300">
                Cancel
              </button>
              <button onClick={handleBookSession}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-3 text-xs font-bold text-zinc-950 flex items-center justify-center gap-1.5 hover:brightness-110">
                <CalendarPlus size={14} /> Book Session
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
