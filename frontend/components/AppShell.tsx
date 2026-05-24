"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  LayoutDashboard,
  Briefcase,
  Sparkles,
  Users,
  MessageSquare,
  User,
  ShieldAlert,
  LogOut,
  BarChart3,
  Check,
  X,
  Bell,
  Settings
} from "lucide-react";
import { apiFetch } from "@/lib/api";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/jobs", label: "Opportunities", icon: Briefcase },
  { href: "/resume", label: "Resume Forge", icon: Sparkles },
  { href: "/roadmap", label: "SkillGraph", icon: Compass },
  { href: "/mentorship", label: "MentorSphere", icon: Users },
  { href: "/community", label: "Circles", icon: MessageSquare },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/admin", label: "Admin Control", icon: ShieldAlert },
];

type AppShellProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
};

export function AppShell({ children, title, subtitle }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [role, setRole] = useState<string>("student");
  const [userName, setUserName] = useState<string>("");
  const [userInitial, setUserInitial] = useState<string>("?");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [toasts, setToasts] = useState<any[]>([]);
  const [activeTheme, setActiveTheme] = useState<string>("dark");

  // Load and apply theme on initialization
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("jobsvilla_theme") || "dark";
      setActiveTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);

      // ── Immediately load cached user info so sidebar never shows wrong name ──
      const cachedName = localStorage.getItem("jv_user_name") || "";
      const cachedRole = localStorage.getItem("jv_user_role") || "student";
      if (cachedName) {
        setUserName(cachedName);
        setUserInitial(cachedName.charAt(0).toUpperCase());
      }
      if (cachedRole) {
        setRole(cachedRole);
      }
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      setAuthorized(true);
      // Fetch user profile securely to verify active role credentials & theme
      apiFetch<{ role?: string; theme?: string; name?: string; full_name?: string; email?: string }>("/profile", { auth: true })
        .then((profile) => {
          // ── Role: use API value, always trust backend ───────────────────────
          const resolvedRole = profile?.role || "student";
          setRole(resolvedRole);
          localStorage.setItem("jv_user_role", resolvedRole);

          // ── Name: use full_name → name → fallback ───────────────────────────
          const displayName = profile?.full_name || profile?.name || "User";
          setUserName(displayName);
          setUserInitial(displayName.charAt(0).toUpperCase());
          localStorage.setItem("jv_user_name", displayName);

          // ── Theme ────────────────────────────────────────────────────────────
          if (profile?.theme) {
            setActiveTheme(profile.theme);
            document.documentElement.setAttribute("data-theme", profile.theme);
            localStorage.setItem("jobsvilla_theme", profile.theme);
          }
        })
        .catch((err) => {
          console.error("Failed to load user credentials for role & theme checks:", err);
        });
    }
  }, [router]);

  // Poll for notifications when authorized
  useEffect(() => {
    if (!authorized) return;
    
    let seenIds = new Set<number>();
    
    const fetchNotifications = async () => {
      try {
        const list = await apiFetch<any[]>("/notifications", { auth: true });
        if (Array.isArray(list)) {
          setNotifications(list);
          
          const unread = list.filter((n) => !n.is_read);
          const newUnread = unread.filter((n) => !seenIds.has(n.id));
          
          if (newUnread.length > 0) {
            newUnread.forEach((n) => {
              seenIds.add(n.id);
              setToasts((prev) => {
                if (prev.some((t) => t.id === n.id)) return prev;
                return [...prev, n];
              });
              
              setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== n.id));
              }, 8000);
            });
          }
        }
      } catch (err) {
        console.error("Poller notifications check failed:", err);
      }
    };
    
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 6000);
    
    return () => clearInterval(interval);
  }, [authorized]);

  const markAsRead = async (id: number) => {
    try {
      await apiFetch(`/notifications/${id}/read`, {
        method: "PATCH",
        auth: true
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setToasts((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const logout = () => {
    // Clear all cached user state on logout
    localStorage.removeItem("token");
    localStorage.removeItem("jv_user_name");
    localStorage.removeItem("jv_user_role");
    router.push("/login");
  };

  const filteredNavItems = navItems.filter((item) => {
    if (item.href === "/admin") {
      // Only admin can see the Admin Control panel
      return role === "admin";
    }
    return true;
  });

  if (!authorized) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <div className="relative flex items-center justify-center">
            <div className="h-12 w-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
            <Compass size={20} className="absolute text-emerald-400 animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wider uppercase text-emerald-400">Syncing Pipeline</p>
            <p className="text-xs text-zinc-500 mt-1">Verifying secure credentials...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent text-zinc-50">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-white/10 bg-zinc-950/40 backdrop-blur-md px-5 py-6 lg:flex lg:flex-col lg:justify-between">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-zinc-950">
                <Compass size={22} />
              </div>
              <span className="text-2xl font-semibold tracking-normal">
                Jobs<span className="text-emerald-400">Villa</span>
              </span>
            </Link>

            <nav className="mt-8 space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname?.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${
                      active
                        ? "bg-white text-zinc-950 font-bold"
                        : "text-zinc-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-zinc-950 flex items-center justify-center font-extrabold text-sm border border-white/10">
                {userInitial}
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-bold text-zinc-200 truncate max-w-[130px]">{userName || "Loading..."}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">{role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="h-8 w-8 shrink-0 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-zinc-400 hover:text-red-400 flex items-center justify-center transition"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col bg-transparent">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/30 px-4 py-4 backdrop-blur-lg md:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-emerald-300">
                  JobsVilla
                </p>
                {title ? (
                  <h1 className="mt-1 text-2xl font-semibold md:text-3xl">
                    {title}
                  </h1>
                ) : null}
                {subtitle ? (
                  <p className="mt-1 max-w-3xl text-sm text-zinc-400">
                    {subtitle}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center gap-2 lg:hidden">
                <button
                  onClick={logout}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>

            <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname?.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm ${
                      active
                        ? "bg-white text-zinc-950 font-bold"
                        : "bg-white/5 text-zinc-300"
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>

          <div className="flex-1 px-4 py-6 md:px-8">{children}</div>
        </section>
      </div>

      {/* Dynamic Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="glass-3d bg-zinc-950/90 border border-emerald-500/30 p-4 rounded-xl shadow-2xl flex gap-3 animate-slide-in relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-cyan-400 animate-pulse" />
            
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                {t.title}
              </h4>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                {t.message}
              </p>
            </div>
            
            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={() => markAsRead(t.id)}
                className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:text-white transition cursor-pointer"
                title="Mark Read"
              >
                <Check size={12} />
              </button>
              <button
                onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
                className="p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5 transition cursor-pointer"
                title="Dismiss"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
