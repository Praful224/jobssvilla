"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Bookmark,
  BarChart3,
  Briefcase,
  Building2,
  ClipboardList,
  Compass,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Route,
  Settings,
  Sparkles,
  User,
  Users,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/applications", label: "Applications", icon: ClipboardList },
  { href: "/saved-jobs", label: "Saved Jobs", icon: Bookmark },
  { href: "/resume", label: "Resume", icon: Sparkles },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/recruiter", label: "Recruiter", icon: Briefcase },
  { href: "/mentorship", label: "Mentorship", icon: Users },
  { href: "/community", label: "Community", icon: MessageSquare },
  { href: "/roadmap", label: "Roadmap", icon: Route },
  { href: "/settings", label: "Settings", icon: Settings },
];

type AppShellProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
};

export function AppShell({ children, title, subtitle }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-white/10 bg-zinc-950/95 px-5 py-6 lg:block">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-zinc-950">
              <Compass size={22} />
            </div>
            <span className="text-2xl font-semibold tracking-normal">
              Jobs<span className="text-emerald-400">Villa</span>
            </span>
          </Link>

          <nav className="mt-8 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${
                    active
                      ? "bg-white text-zinc-950"
                      : "text-zinc-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/90 px-4 py-4 backdrop-blur md:px-8">
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

              <div className="flex items-center gap-2">
                <Link
                  href="/analytics"
                  className="hidden items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-zinc-200 hover:bg-white/10 md:flex"
                >
                  <BarChart3 size={17} />
                  Analytics
                </Link>
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
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm ${
                      active
                        ? "bg-white text-zinc-950"
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
    </main>
  );
}
