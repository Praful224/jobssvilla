"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Briefcase, Sparkles, Users, Search, Compass, Layers, Cpu, Radio, MessageSquare } from "lucide-react";
import { apiFetch, Job } from "@/lib/api";
import { JobCard } from "@/components/JobCard";
import { ATSSimulator } from "@/components/ATSSimulator";
import { motion, AnimatePresence } from "framer-motion";

// Shadcn UI Imports
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Staggered list entry animation configs
const listContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    }
  }
};

const listItemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 280,
      damping: 24
    }
  }
};

const logoCompanies = [
  { name: "Stripe", svg: "S" },
  { name: "Linear", svg: "L" },
  { name: "Vercel", svg: "V" },
  { name: "Supabase", svg: "S" },
  { name: "OpenAI", svg: "O" },
  { name: "Figma", svg: "F" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoggedIn] = useState(
    () => typeof window !== "undefined" && !!localStorage.getItem("token")
  );

  // 3D Perspective Explorer States (No external libraries needed)
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isExploded, setIsExploded] = useState(false);
  const [is3D, setIs3D] = useState(true);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    setCoords({ x, y });
  };

  const tiltStyle = isHovered && is3D
    ? {
        transform: `rotateX(${60 - coords.y * 22}deg) rotateY(${0 + coords.x * 22}deg) rotateZ(-45deg)`,
      }
    : is3D
      ? {
          transform: "rotateX(60deg) rotateY(0deg) rotateZ(-45deg)",
        }
      : {
          transform: "rotateX(0deg) rotateY(0deg) rotateZ(0deg)",
        };

  useEffect(() => {
    let ignore = false;

    const loadDefaultJobs = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await apiFetch<Job[]>("/jobs");
        if (!ignore) {
          setJobs(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Search failed");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadDefaultJobs();

    // Global cursor spotlight tracking listener for glass touch hover effects
    const handleMouseMove = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(
        ".gladia-card, .glass-touch-glow, .glass-3d, .glass-panel, article, .job-card-hover"
      ) as HTMLElement;
      if (target) {
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        target.style.setProperty("--mouse-x", `${x}px`);
        target.style.setProperty("--mouse-y", `${y}px`);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      ignore = true;
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const searchJobs = async () => {
    setLoading(true);
    setError("");

    try {
      const path = query.trim()
        ? `/jobs/search?q=${encodeURIComponent(query)}`
        : "/jobs";
      const data = await apiFetch<Job[]>(path);
      setJobs(data);
      
      if (query.trim()) {
        setTimeout(() => {
          const el = document.getElementById("jobs-results");
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent text-white overflow-hidden">
      {/* Figma Decorative Grid Lines & Glow Backdrops (Directly from Figma export specs) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-80">
        {/* Slanted diagonal lines */}
        <div className="figma-line-slant-left" style={{ left: "calc(50% - 704.5px + 568.92px)", top: "-66.58px" }} />
        <div className="figma-line-slant-left animate-pulse" style={{ left: "calc(50% - 704.5px + 281.9px)", top: "-67px", opacity: 0.12 }} />
        <div className="figma-line-slant-right" style={{ left: "calc(50% - 704.5px - 213.1px)", top: "-66.58px" }} />
        <div className="figma-line-slant-right animate-pulse" style={{ left: "calc(50% - 704.5px + 73.92px)", top: "-67px", opacity: 0.12 }} />

        {/* Vertical lines */}
        <div className="figma-line-vertical-90" style={{ left: "calc(50% - 646px + 1134px)", top: "60.14px" }} />
        <div className="figma-line-vertical-90" style={{ left: "calc(50% - 646px + 158.09px)", top: "60.14px" }} />

        {/* Horizontal lines */}
        <div className="figma-line-horizontal" style={{ left: "calc(50% - 999px + 81px)", top: "calc(50% - 186.5px)" }} />
        <div className="figma-line-horizontal" style={{ left: "calc(50% - 999px + 81px)", top: "calc(50% + 441.5px)" }} />

        {/* Diagonal glowing outline rectangle (Rectangle 860) */}
        <div className="figma-line-rect-860 hidden lg:block" style={{ left: "1068px", top: "393px" }} />

        {/* Huge Blue & Violet Radial Blur Circles */}
        <div className="absolute figma-blur-circle-1" style={{ left: "calc(50% - 527px)", top: "181px" }} />
        <div className="absolute figma-blur-circle-2" style={{ left: "calc(50% - 403.5px - 103.5px)", top: "calc(50% - 403.5px + 62.5px)" }} />
        <div className="absolute figma-blur-circle-radial" style={{ left: "calc(50% - 527px)", top: "calc(50% - 527px)" }} />
      </div>

      {/* Floating Ambient Mesh Glows (Directly from Figma orange/emerald template) */}
      <div className="ambient-blob-1" style={{ zIndex: -1 }} />
      <div className="ambient-blob-2" style={{ zIndex: -1 }} />
      <div className="ambient-blob-orange" style={{ zIndex: -1 }} />

      {/* Premium Figma Header */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sticky top-0 z-30 bg-[#060608]/40 backdrop-blur-md border-b border-white/5">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-zinc-950 shadow-lg shadow-orange-500/20 group-hover:scale-105 transition duration-300 p-1.5">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full stroke-zinc-950">
              <path d="M20 45L50 20L80 45V75C80 77.76 77.76 80 75 80H25C22.24 80 20 77.76 20 75V45Z" strokeWidth="8" strokeLinejoin="round" />
              <path d="M42 80V55H58V80" strokeWidth="8" strokeLinejoin="round" />
              <path d="M36 20V12C36 9.79 37.79 8 40 8H60C62.21 8 64 9.79 64 12V20" strokeWidth="8" />
              <circle cx="50" cy="38" r="6" fill="black" />
            </svg>
          </div>
          <span className="text-xl font-black tracking-tight">
            Jobs<span className="text-orange-500 group-hover:text-orange-400 transition">Villa</span>
          </span>
        </Link>
        
        {/* Figma Center Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-zinc-400">
          <a href="#dashboard-visuals" className="hover:text-white transition">Insights</a>
          <a href="#jobs-results" className="hover:text-white transition">Opportunities</a>
          <a href="/mentorship" className="hover:text-white transition">Mentorship</a>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-white text-zinc-950 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 hover:bg-zinc-200 active:scale-95 shadow-[0_4px_20px_-4px_rgba(255,255,255,0.2)]"
            >
              Go to Workspace <ArrowRight size={12} />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-bold text-zinc-400 hover:text-white transition px-2"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-white text-zinc-950 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 hover:bg-zinc-200 active:scale-95 shadow-[0_4px_20px_-4px_rgba(255,255,255,0.2)]"
              >
                Get Started <ArrowRight size={12} />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto flex flex-col items-center justify-center max-w-5xl px-6 pt-24 pb-20 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex rounded-full border border-orange-500/20 bg-orange-500/5 px-4 py-1.5 text-xs font-bold text-orange-400 gap-2 items-center mb-8"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500 pulse-radar-orange" />
          Innovative AI Career Platform Active
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl font-bold tracking-tight md:text-7xl leading-[1.1] text-center max-w-4xl text-white select-none filter drop-shadow-sm font-sans"
          style={{ letterSpacing: "-0.05em" }}
        >
          <span className="bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
            Forge Your Career Path With
          </span>{" "}
          <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 bg-clip-text text-transparent">
            AI-Powered Intelligence
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-zinc-400 font-medium"
        >
          JobsVilla is a comprehensive career ecosystem connecting talented candidates with elite opportunities. Forge ATS-optimized LaTeX resumes, analyze skill gaps, coordinate with expert mentors, and engage in active community circles.
        </motion.p>

        {/* Figma White CTA Pill Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center w-full relative z-10"
        >
          <Link
            href="/register"
            className="inline-flex items-center gap-3 bg-white text-zinc-950 px-6 py-3 rounded-full text-sm font-black transition-all duration-300 hover:bg-zinc-200 group active:scale-95 shadow-[0_4px_25px_rgba(255,255,255,0.15)] h-14"
          >
            Get started
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950 text-white transition-all duration-300 group-hover:translate-x-1">
              <ArrowRight size={14} />
            </span>
          </Link>
          
          <a
            href="#features"
            className="figma-btn-glass px-8 py-3.5 text-xs font-black tracking-wider uppercase h-14 min-w-[200px] cursor-pointer"
          >
            Explore Features <ArrowRight size={14} className="ml-1.5" />
          </a>
        </motion.div>

        {/* Trusted By Logos Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 pt-10 border-t border-white/5 w-full"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-6">Trusted by top innovative teams</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-40 hover:opacity-60 transition duration-500">
            {logoCompanies.map((c) => (
              <div key={c.name} className="flex items-center gap-2 text-sm font-black text-white tracking-widest">
                <span className="h-6 w-6 rounded bg-zinc-800 text-white flex items-center justify-center text-[10px] font-black">{c.svg}</span>
                {c.name}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Showcase Visual Grid Section (Obsidian Analytics Layout — Inspired by Mockup 2) */}
      <section id="dashboard-visuals" className="mx-auto max-w-7xl px-6 py-20 border-t border-white/5 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="warning" className="mb-4">Career Command Center</Badge>
          <h2 className="text-3xl font-extrabold md:text-5xl bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Navigate Your Career Path. Backed By Deep Insights.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Box 1: ATS Resume-to-Job Semantic Match */}
          <div className="md:col-span-2 relative">
            <Card className="p-6 border border-white/10 card-glow-amber h-full bg-zinc-950/40 backdrop-blur-md flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">ATS Keyword Score</span>
                <CardTitle className="text-lg font-bold text-white mt-2">Resume-to-Job Semantic Match</CardTitle>
                <CardDescription className="text-zinc-400 mt-1">Our advanced NLP matching engine checks keyword overlaps and lists missing concepts automatically.</CardDescription>
              </div>
              
              {/* Premium glowing custom SVG Chart */}
              <div className="mt-8 relative h-36 w-full overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Fill Area */}
                  <path
                    d="M0 120 L0 100 Q80 80 120 70 T240 40 T320 20 L400 20 L400 120 Z"
                    fill="url(#chartGlow)"
                  />
                  {/* Line */}
                  <path
                    d="M0 100 Q80 80 120 70 T240 40 T320 20 L400 20"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Glowing peak dot */}
                  <circle cx="320" cy="20" r="5" fill="#ffffff" />
                </svg>
                {/* Sonar Beacon on the peak dot */}
                <div className="absolute top-[8px] left-[79.5%] h-4 w-4 pulse-radar-orange" />
              </div>
            </Card>
          </div>

          {/* Box 2: Skill Gap Analyser */}
          <Card className="p-6 border border-white/10 card-glow-amber bg-zinc-950/40 backdrop-blur-md flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Profile Calibration</span>
              <CardTitle className="text-lg font-bold text-white mt-2">Skill Gap Analyser</CardTitle>
              <CardDescription className="text-zinc-400 mt-1">Identify missing skills versus your target role and get a personalised learning roadmap to close the gap.</CardDescription>
            </div>
            
            {/* Dots grid indicator */}
            <div className="mt-8 grid grid-cols-8 gap-3 py-4">
              {Array.from({ length: 32 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-3 w-3 rounded-full transition-all duration-500 ${
                    i % 5 === 0 
                      ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" 
                      : i % 7 === 0 
                        ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" 
                        : "bg-zinc-800"
                  }`}
                />
              ))}
            </div>
          </Card>

          {/* Box 3: AI Mock Simulator */}
          <Card className="p-6 border border-white/10 card-glow-amber bg-zinc-950/40 backdrop-blur-md flex flex-col justify-between overflow-hidden relative">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">AI Coach Simulator</span>
              <CardTitle className="text-lg font-bold text-white mt-2">Interactive Mock Interviews</CardTitle>
              <CardDescription className="text-zinc-400 mt-1">Refine your responses with spring-loaded real-time guided coaching for technical roles.</CardDescription>
            </div>
            {/* Glowing Lightning bolt asset matching Mockup 2 */}
            <div className="mt-8 flex justify-center py-4 relative">
              <div className="absolute inset-0 bg-orange-500/10 blur-xl rounded-full" />
              <div className="h-16 w-16 text-orange-500 drop-shadow-[0_0_12px_rgba(249,115,22,0.8)] animate-pulse">
                <Cpu size={56} className="stroke-[1.5]" />
              </div>
            </div>
          </Card>

          {/* Box 4: Active Opportunities Pipeline */}
          <div className="md:col-span-2">
            <Card className="p-6 border border-white/10 card-glow-amber h-full bg-zinc-950/40 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-md">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Live Ecosystem</span>
                <CardTitle className="text-lg font-bold text-white">Active Opportunities Pipeline</CardTitle>
                <CardDescription className="text-zinc-400">
                  Instantly synchronized with active job listings, recruiter search parameters, and live mentor bookings.
                </CardDescription>
              </div>

              {/* Sonar Radar Rings directly from Mockup 2 */}
              <div className="relative h-28 w-28 shrink-0 flex items-center justify-center border border-white/5 rounded-full bg-zinc-900/30">
                <div className="absolute h-24 w-24 rounded-full border border-white/5 animate-ping" />
                <div className="absolute h-16 w-16 rounded-full border border-white/10" />
                <div className="absolute h-8 w-8 rounded-full border border-orange-500/20 bg-orange-500/5 flex items-center justify-center">
                  <Radio size={14} className="text-orange-500 animate-pulse" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Interactive 3D Orthographic Workspace Explorer (Directly from Figma Export specs) ── */}
      <section className="mx-auto max-w-7xl px-6 py-20 border-t border-white/5 relative z-10">
        <div className="grid gap-12 lg:grid-cols-5 items-center">
          {/* Left Side: Explanations and Interactive Controllers */}
          <div className="lg:col-span-2 space-y-6 text-left">
            <Badge variant="warning" className="px-3 py-1 uppercase tracking-wider font-extrabold text-[10px]">
              No Downloads Required
            </Badge>
            <h2 className="text-3xl font-black md:text-5xl text-white tracking-tight leading-tight">
              Interactive 3D Layer Cockpit
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed font-medium">
              Interact with the JobsVilla cockpit workspace in full orthographic 3D projection. Move your cursor over the right viewport to rotate the canvas. Explode the workspace to inspect how our modular glass components stack together cleanly using CSS 3D perspectives.
            </p>

            <div className="flex flex-wrap gap-3.5 pt-4">
              <Button
                onClick={() => setIs3D(!is3D)}
                className={`text-xs font-black uppercase tracking-wider px-5 py-3.5 rounded-full border transition duration-300 ${
                  is3D 
                    ? "bg-orange-500 text-zinc-950 border-orange-400/20 shadow-[0_4px_20px_rgba(249,115,22,0.3)] hover:bg-orange-400" 
                    : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                }`}
              >
                {is3D ? "🔌 Turn Flat 2D" : "📐 Orthographic 3D"}
              </Button>
              <Button
                onClick={() => setIsExploded(!isExploded)}
                disabled={!is3D}
                className={`text-xs font-black uppercase tracking-wider px-5 py-3.5 rounded-full border transition duration-300 ${
                  !is3D 
                    ? "opacity-40 cursor-not-allowed bg-white/5 text-zinc-500 border-white/5" 
                    : isExploded 
                      ? "bg-purple-500 text-white border-purple-400/20 shadow-[0_4px_20px_rgba(168,85,247,0.3)] hover:bg-purple-400" 
                      : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                }`}
              >
                {isExploded ? "💥 Collapse Layers" : "💥 Explode Layers"}
              </Button>
            </div>
            
            <div className="space-y-3 pt-6 border-t border-white/5 text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Powered by vanilla CSS transform-style & 3D perspective grids.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
                <span>Zero canvas libraries, no Three.js, Spline, or heavy packages required.</span>
              </div>
            </div>
          </div>

          {/* Right Side: Interactive 3D Viewport */}
          <div className="lg:col-span-3 flex justify-center items-center h-[520px] bg-zinc-950/20 border border-white/5 rounded-[32px] relative overflow-hidden perspective-2000">
            {/* Viewport ambient mesh blobs */}
            <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-purple-500/5 blur-[80px]" />
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-blue-500/5 blur-[80px]" />

            {/* Interactive perspective canvas container */}
            <div
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => { setIsHovered(false); setCoords({ x: 0, y: 0 }); }}
              className="relative w-[480px] h-[340px] flex items-center justify-center preserve-3d transition-3d cursor-grab active:cursor-grabbing select-none"
              style={tiltStyle}
            >
              {/* Layer 0: Deep Cyber Grid Backdrop */}
              <div className="absolute inset-0 figma-browse-app opacity-30 cyber-grid transition-3d" 
                style={{
                  transform: `translateZ(${isExploded ? "-40px" : "0px"})`,
                  boxShadow: isExploded ? "0 40px 100px rgba(0,0,0,0.8)" : "0 10px 40px rgba(0,0,0,0.5)"
                }}
              />

              {/* Layer 1: Glassmorphic Sidebar */}
              <div className="absolute left-[3%] top-[5%] bottom-[5%] w-[125px] bg-zinc-950/80 border border-white/10 rounded-2xl p-3 flex flex-col justify-between transition-3d z-10"
                style={{
                  transform: `translateZ(${isExploded ? "40px" : "0px"})`,
                  boxShadow: isExploded ? "0 15px 30px rgba(0,0,0,0.6)" : "none"
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <div className="h-4.5 w-4.5 rounded bg-orange-500 flex items-center justify-center font-black text-[8px] text-zinc-950">JV</div>
                    <span className="text-[9px] font-black text-white uppercase tracking-wider">JobsVilla</span>
                  </div>
                  <nav className="space-y-1">
                    {[
                      { l: "Home", a: true },
                      { l: "Resume" },
                      { l: "Roadmap" },
                      { l: "Mentors" },
                    ].map((it, i) => (
                      <div key={i} className={`flex items-center gap-1.5 px-2 py-1 rounded text-[7.5px] font-semibold ${it.a ? "bg-white text-zinc-950 font-extrabold" : "text-zinc-500"}`}>
                        <div className="h-1.5 w-1.5 rounded-full bg-current" />
                        {it.l}
                      </div>
                    ))}
                  </nav>
                </div>
                <div className="border-t border-white/5 pt-2 flex items-center gap-1.5 text-zinc-600 font-extrabold text-[6px] uppercase tracking-widest">
                  VETTING ACTIVE
                </div>
              </div>

              {/* Layer 2: Dashboard Content Panel Area */}
              <div className="absolute left-[30%] right-[3%] top-[5%] bottom-[5%] transition-3d flex flex-col gap-3 preserve-3d"
                style={{ transform: `translateZ(${isExploded ? "80px" : "0px"})` }}
              >
                {/* Search & Header (Sublayer 2.1) */}
                <div className="flex justify-between items-center bg-zinc-950/40 border border-white/10 rounded-xl px-3 py-1.5 backdrop-blur-md transition-3d"
                  style={{
                    transform: `translateZ(${isExploded ? "20px" : "0px"})`,
                    boxShadow: isExploded ? "0 5px 15px rgba(0,0,0,0.4)" : "none"
                  }}
                >
                  <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Dashboard Cockpit</span>
                  <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 text-zinc-950 flex items-center justify-center font-black text-[8px] border border-white/10">U</div>
                </div>

                {/* Analytical charts (Sublayer 2.2) */}
                <div className="flex-1 bg-zinc-950/60 border border-white/10 rounded-2xl p-3 flex flex-col justify-between transition-3d"
                  style={{
                    transform: `translateZ(${isExploded ? "60px" : "0px"})`,
                    boxShadow: isExploded ? "0 20px 40px rgba(0,0,0,0.7)" : "none"
                  }}
                >
                  <div>
                    <span className="text-[6.5px] font-black uppercase text-zinc-500 tracking-wider">Verification Indexes</span>
                    <h4 className="text-[9px] font-black text-white tracking-tight mt-0.5">Confidence Metrics Over Time</h4>
                  </div>
                  {/* Glowing SVG mini line */}
                  <div className="h-12 w-full relative">
                    <svg className="w-full h-full" viewBox="0 0 200 50" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="miniChart" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0 50 L0 30 Q40 20 60 25 T120 15 T160 10 L200 10 L200 50 Z" fill="url(#miniChart)" />
                      <path d="M0 30 Q40 20 60 25 T120 15 T160 10 L200 10" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                      <circle cx="160" cy="10" r="2" fill="#ffffff" />
                    </svg>
                  </div>
                </div>

                {/* Bottom Ticket Stub Card (Sublayer 2.3) */}
                <div className="h-[75px] bg-gradient-to-r from-purple-950/30 to-indigo-950/30 border border-white/15 rounded-2xl p-2 flex justify-between items-center transition-3d relative overflow-hidden"
                  style={{
                    transform: `translateZ(${isExploded ? "100px" : "0px"})`,
                    boxShadow: isExploded ? "0 25px 50px rgba(0,0,0,0.8)" : "none"
                  }}
                >
                  {/* Notches */}
                  <div className="absolute -left-1.5 h-3 w-3 rounded-full bg-[#050505] border border-white/10" />
                  <div className="absolute -right-1.5 h-3 w-3 rounded-full bg-[#050505] border border-white/10" />
                  
                  <div className="space-y-1 pl-2">
                    <Badge className="text-[6px] py-0 bg-white/5 border border-white/10 font-bold tracking-wider uppercase text-purple-400">
                      Mock Session
                    </Badge>
                    <h5 className="text-[8px] font-black text-white leading-none">Ayush Sharma</h5>
                    <p className="text-[6.5px] text-zinc-500 font-semibold leading-none">Elite Tech Consultant</p>
                  </div>
                  
                  {/* Dashed vertical separator */}
                  <div className="h-full border-r border-dashed border-white/20 mx-1.5" />
                  
                  <div className="space-y-1.5 pr-2 text-right">
                    <span className="text-[6.5px] text-zinc-400 font-extrabold block">1:15 PM - 4:50 AM</span>
                    <span className="text-[7px] font-black text-purple-400 block">₹950/hr</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid Section (Meng To website style showcase - Mockup 4) */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20 border-t border-white/5 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="default" className="mb-4">Advanced Workflows</Badge>
          <h2 className="text-3xl font-extrabold md:text-5xl bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Stop Chasing Candidates. Start Getting Approvals.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "AI Resume Evaluator",
              desc: "Get instantaneous ATS scoring, semantic overlaps, and custom synonym enhancement utilizing Gemini LLMs.",
              icon: Sparkles,
              color: "text-emerald-400",
              border: "card-glow-cyan",
              link: "/resume",
            },
            {
              title: "Recruiter Kanban Gate",
              desc: "Move candidates seamlessly across vetting columns to auto-trigger logs on candidate panels.",
              icon: Layers,
              color: "text-orange-400",
              border: "card-glow-amber",
              link: "/recruiter",
            },
            {
              title: "Elite Mentorship Hub",
              desc: "Connect with industry leaders, publish availability, and generate live 1:1 video consultation rooms.",
              icon: Users,
              color: "text-amber-400",
              border: "card-glow-amber",
              link: "/mentorship",
            },
            {
              title: "Community Circles",
              desc: "Join career-focused discussion threads, share insights, upvote advice, and grow your professional network.",
              icon: MessageSquare,
              color: "text-rose-400",
              border: "card-glow-cyan",
              link: "/community",
            },
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <Link href={feat.link} key={i} className="h-full">
                <Card className={`h-full bg-zinc-950/40 border border-white/5 p-6 rounded-3xl flex flex-col justify-between hover:bg-white/[0.02] transition duration-300 ${feat.border}`}>
                  <div className="space-y-4">
                    <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Icon size={20} className={feat.color} />
                    </div>
                    <CardTitle className="text-lg font-bold text-white tracking-tight">{feat.title}</CardTitle>
                    <CardDescription className="text-xs text-zinc-400 leading-relaxed">{feat.desc}</CardDescription>
                  </div>
                  <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-orange-400 group">
                    Launch Tool <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>


      {/* Dynamic Search / Job Opportunities Section */}
      <section id="jobs-results" className="mx-auto max-w-7xl px-6 py-20 border-t border-white/5 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/10 pb-6 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
              <Briefcase size={22} className="text-orange-500" />
              {query ? `Search Results for "${query}"` : "Active Career Opportunities"}
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Live opportunities query from SQLite database.</p>
          </div>
          
          {/* Cyber Search Box */}
          <div className="w-full md:w-96 flex items-center bg-zinc-950/60 border border-white/10 rounded-full px-4 py-2 hover:border-zinc-700 focus-within:border-orange-500 transition duration-300">
            <Search className="text-zinc-500 mr-2 shrink-0" size={16} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") searchJobs(); }}
              placeholder="Search skills, companies, jobs..."
              className="w-full bg-transparent text-xs text-white outline-none placeholder:text-zinc-600"
            />
            <Button
              onClick={searchJobs}
              size="sm"
              className="bg-orange-500 hover:bg-orange-400 text-zinc-950 text-[10px] font-black h-8 px-4 rounded-full ml-2 shadow-[0_4px_12px_rgba(249,115,22,0.3)]"
            >
              Filter
            </Button>
          </div>
        </div>

        {error ? <p className="mt-3 text-sm text-rose-300 font-semibold">{error}</p> : null}
        
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center text-zinc-500 text-xs gap-3">
              <div className="h-5 w-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
              Scanning matching indexes...
            </div>
          ) : jobs.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-zinc-950/20 backdrop-blur-sm">
              <Briefcase size={40} className="text-zinc-700 mb-3" />
              <span className="text-zinc-500 text-sm font-semibold">No active listings match.</span>
              <span className="text-zinc-600 text-xs mt-1">Submit opportunities in the Recruiter dashboard or run a new search.</span>
            </div>
          ) : (
            <motion.div
              variants={listContainerVariants}
              initial="hidden"
              animate="show"
              className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {jobs.map((job) => (
                <motion.div
                  key={job.id}
                  variants={listItemVariants}
                  whileHover={{ y: -4 }}
                  className="h-full"
                >
                  <JobCard job={job} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* High-tech Footer (Directly inspired by Mockup 3) */}
      <footer className="mx-auto max-w-7xl px-6 py-10 border-t border-white/5 text-xs text-zinc-600 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded bg-gradient-to-br from-orange-500 to-amber-500 text-zinc-950 flex items-center justify-center font-bold">V</div>
          <span className="font-extrabold text-zinc-400">JobsVilla Premium</span>
        </div>
        <div className="flex gap-6 text-zinc-500 font-semibold">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#jobs-results" className="hover:text-white transition">Opportunities</a>
          <a href="/mentorship" className="hover:text-white transition">Mentorship</a>
        </div>
        <p>© 2026 JobsVilla Careers. Powered by FastAPI, SQLAlchemy, SQLite & Gemini AI.</p>
      </footer>
    </div>
  );
}