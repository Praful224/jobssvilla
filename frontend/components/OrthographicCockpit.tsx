"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function OrthographicCockpit() {
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

  return (
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
  );
}
