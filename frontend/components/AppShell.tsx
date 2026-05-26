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
  Settings,
  Menu,
  ChevronDown
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

const mainNavItems = [
  { 
    href: "/dashboard", 
    label: "Home", 
    icon: LayoutDashboard,
    description: "Access your consolidated workspace dashboard and console notifications."
  },
  { 
    href: "/jobs", 
    label: "Opportunities", 
    icon: Briefcase,
    description: "Explore high-paying tech jobs and track your active applications."
  },
  { 
    href: "/resume", 
    label: "Resume Forge", 
    icon: Sparkles,
    description: "Create, tailor, and optimize your resumes with our advanced AI ATS score scanner."
  },
  { 
    href: "/roadmap", 
    label: "SkillGraph", 
    icon: Compass,
    description: "Map out customized roadmap steps and identify engineering skill gaps."
  },
  { 
    href: "/mentorship", 
    label: "MentorSphere", 
    icon: Users,
    description: "Book 1:1 sessions and Mock interviews with verified industry mentors."
  },
  { 
    href: "/community", 
    label: "Circles", 
    icon: MessageSquare,
    description: "Network, share posts, and collaborate inside developer community circles."
  },
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
  const [activeTheme, setActiveTheme] = useState<string>("light");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredNavItem, setHoveredNavItem] = useState<any | null>(null);

  // Load and apply theme on initialization
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("jobsvilla_theme") || "light";
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
    <main className="min-h-screen bg-transparent text-zinc-800 dark:text-zinc-50 flex flex-col">
      {/* Premium Glassy Navbar (Cartage-inspired unified structure) */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/70 dark:bg-zinc-950/70 border-b border-black/5 dark:border-white/5 backdrop-blur-md transition-all duration-300 py-3 px-6 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo (Left corner) */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#2f54eb] to-cyan-500 text-white shadow-lg shadow-[#2f54eb]/20 group-hover:scale-105 transition duration-300 p-1.5">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full stroke-white">
                <path d="M20 45L50 20L80 45V75C80 77.76 77.76 80 75 80H25C22.24 80 20 77.76 20 75V45Z" strokeWidth="8" strokeLinejoin="round" />
                <path d="M42 80V55H58V80" strokeWidth="8" strokeLinejoin="round" />
                <path d="M36 20V12C36 9.79 37.79 8 40 8H60C62.21 8 64 9.79 64 12V20" strokeWidth="8" />
                <circle cx="50" cy="38" r="6" fill="white" />
              </svg>
            </div>
            <span className="text-base font-black tracking-tight text-foreground">
              Jobs<span className="text-[#2f54eb] dark:text-emerald-400 group-hover:text-emerald-300 transition-colors">Villa</span>
            </span>
          </Link>

          {/* Desktop Navigation Links (Centered main functionality) */}
          <nav className="relative hidden lg:flex items-center justify-center gap-1.5 flex-grow flex-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname?.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onMouseEnter={() => setHoveredNavItem(item)}
                  onMouseLeave={() => setHoveredNavItem(null)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all duration-300 ${
                    active
                      ? "text-foreground font-black scale-[1.01]"
                      : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  <Icon size={11} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Premium Animated Crystal Tooltip explaining workspace feature on hover */}
            <AnimatePresence>
              {hoveredNavItem && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute top-[125%] left-1/2 -translate-x-1/2 w-80 rounded-2xl border border-black/5 dark:border-white/10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl p-3 shadow-2xl pointer-events-none flex flex-col gap-1 z-50 text-center"
                >
                  <div className="flex items-center justify-center gap-1.5 text-zinc-950 dark:text-white font-extrabold text-[10.5px] uppercase tracking-wider">
                    {(() => {
                      const HoverIcon = hoveredNavItem.icon;
                      return <HoverIcon size={12} className="text-[#2f54eb] dark:text-emerald-400" />;
                    })()}
                    <span>{hoveredNavItem.label}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-bold mt-1">
                    {hoveredNavItem.description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>

          {/* Right Controls: Notification Icon & Profile Toggle Dropdown (Group 2) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Notification Badge */}
            {notifications.length > 0 && (
              <div className="relative p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition cursor-pointer">
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#2f54eb] dark:bg-emerald-400 animate-ping" />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#2f54eb] dark:bg-emerald-400" />
                <Bell size={13} />
              </div>
            )}

            {/* Profile Pill Badge Toggle */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 pl-2 pr-2.5 py-1 rounded-full transition cursor-pointer"
              >
                <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-[#2f54eb] to-cyan-500 text-white flex items-center justify-center font-extrabold text-[10px] shadow-inner">
                  {userInitial}
                </div>
                <span className="hidden sm:inline text-[10px] font-extrabold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider truncate max-w-[80px]">
                  {userName.split(" ")[0]}
                </span>
                <ChevronDown size={11} className={`text-zinc-500 dark:text-zinc-400 transition-transform duration-300 ${profileDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Group 2 Dropdown Panel */}
              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-zinc-950/95 backdrop-blur-2xl p-4 shadow-2xl shadow-black/10 dark:shadow-black/90 flex flex-col gap-2.5 z-50"
                  >
                    <div className="px-2 py-1.5 border-b border-black/5 dark:border-white/5 pb-2.5">
                      <p className="text-xs font-black text-zinc-950 dark:text-white truncate" title={userName}>{userName}</p>
                      <p className="text-[9px] font-bold text-[#2f54eb] dark:text-emerald-400 uppercase tracking-widest mt-0.5">{role}</p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-bold text-zinc-650 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#2f54eb] dark:hover:text-white transition"
                    >
                      <User size={13} className="text-[#2f54eb] dark:text-emerald-400" />
                      <span>Profile Info</span>
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-bold text-zinc-650 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-cyan-500 dark:hover:text-white transition"
                    >
                      <Settings size={13} className="text-cyan-550 dark:text-cyan-400" />
                      <span>Account Settings</span>
                    </Link>

                    {role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-bold text-zinc-650 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-red-500 dark:hover:text-white transition border border-red-550/10 dark:border-red-500/20 bg-red-500/[0.01]"
                      >
                        <ShieldAlert size={13} className="text-red-500 dark:text-red-400" />
                        <span>Admin Control</span>
                      </Link>
                    )}

                    <div className="border-t border-black/5 dark:border-white/5 mt-1 pt-2.5">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-bold text-red-500 dark:text-red-400 hover:bg-red-500/10 transition text-left cursor-pointer"
                      >
                        <LogOut size={13} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition cursor-pointer"
            >
              {mobileMenuOpen ? <X size={14} /> : <Menu size={14} />}
            </button>
          </div>
        </div>

        {/* Mobile slide-down navigation menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden mt-3 flex flex-col gap-1 border-t border-black/5 dark:border-white/5 pt-3"
            >
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname?.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition ${
                      active
                        ? "bg-[#2f54eb] dark:bg-white text-white dark:text-zinc-950 font-extrabold"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-[#2f54eb] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Main Workspace Body Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 pt-24 pb-12 md:px-8">
        {title || subtitle ? (
          <div className="mb-8 border-b border-white/5 pb-6">
            <span className="text-[9px] font-extrabold uppercase tracking-[0.24em] text-emerald-400">
              Workspace Console
            </span>
            {title ? (
              <h1 className="mt-1 text-2xl font-black md:text-3xl text-white tracking-tight leading-none">
                {title}
              </h1>
            ) : null}
            {subtitle ? (
              <p className="mt-2.5 max-w-3xl text-xs font-bold text-zinc-400 leading-relaxed">
                {subtitle}
              </p>
            ) : null}
          </div>
        ) : null}
        
        {children}
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
