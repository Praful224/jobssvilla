"use client";

import { useState } from "react";
import { Sparkles, Route, Activity, TrendingUp, CheckCircle2, ChevronRight, Award, Compass, Search } from "lucide-react";

export function CareerDashboardVisual() {
  const [activeTab, setActiveTab] = useState<"ats" | "roadmap" | "pipeline">("ats");
  
  // Tab 1: ATS State
  const [atsScore, setAtsScore] = useState(88);
  const [atsOptimized, setAtsOptimized] = useState(false);

  // Tab 3: Pipeline State
  const [pipelineStep, setPipelineStep] = useState(2); // 0: Applied, 1: Screened, 2: Interviewing, 3: Offered

  const toggleAtsOptimization = () => {
    setAtsOptimized(!atsOptimized);
    setAtsScore(atsOptimized ? 68 : 94);
  };

  return (
    <div className="glass-3d bg-zinc-950/60 rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative">
      {/* Visual Widget Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-zinc-900/40">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Interactive Career Cockpit</span>
        </div>
        <div className="flex items-center gap-1 bg-zinc-900/60 border border-white/5 p-1 rounded-full">
          <button
            onClick={() => setActiveTab("ats")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide transition ${
              activeTab === "ats"
                ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/10"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Sparkles size={12} />
            ATS Radar
          </button>
          <button
            onClick={() => setActiveTab("roadmap")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide transition ${
              activeTab === "roadmap"
                ? "bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/10"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Route size={12} />
            Roadmap Orbit
          </button>
          <button
            onClick={() => setActiveTab("pipeline")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide transition ${
              activeTab === "pipeline"
                ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/10"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Activity size={12} />
            Pipeline Graph
          </button>
        </div>
      </div>

      {/* Main Interactive Screen */}
      <div className="p-6 min-h-[420px] flex flex-col justify-between">
        
        {/* TAB 1: ATS SCORE GAUGE */}
        {activeTab === "ats" && (
          <div className="flex-1 flex flex-col justify-between gap-6">
            <div className="text-center md:text-left">
              <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest block mb-1">AI Resume Rating Engine</span>
              <h3 className="text-lg font-bold text-white">Live ATS Evaluation Gauge</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Evaluates resume matches using Gemini-1.5 flash logic to compare skills against high-paying vacancies.
              </p>
            </div>

            {/* Glowing 3D Radial Dial */}
            <div className="flex flex-col items-center justify-center relative py-4">
              <div className="relative h-44 w-44 flex items-center justify-center">
                {/* Outer rotating cyber ring */}
                <div className="absolute inset-0 rounded-full border border-dashed border-zinc-700 animate-spin-slow" />
                
                {/* Visual Glass Dial background */}
                <div className="absolute inset-2 rounded-full bg-zinc-900/60 backdrop-blur-md border border-white/5 shadow-inner" />
                
                {/* Main Progress Ring */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Underlay track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="rgba(255,255,255,0.03)"
                    strokeWidth="5"
                    fill="transparent"
                  />
                  {/* Dynamic Glowing Value indicator */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={atsScore >= 85 ? "#10b981" : "#f59e0b"}
                    strokeWidth="5.5"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * atsScore) / 100}
                    className="transition-all duration-1000 ease-out"
                    style={{
                      filter: `drop-shadow(0 0 8px ${atsScore >= 85 ? "rgba(16,185,129,0.5)" : "rgba(245,158,11,0.5)"})`
                    }}
                  />
                </svg>

                {/* Score numbers inside dial */}
                <div className="absolute flex flex-col items-center text-center">
                  <span className="text-5xl font-black tracking-tight text-white transition-all duration-500">
                    {atsScore}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-widest mt-0.5">
                    ATS RATING
                  </span>
                </div>
              </div>
            </div>

            {/* Controls & Keyword Grid */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/40 border border-white/5 p-3 rounded-2xl">
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold block uppercase">Interactive Optimization</span>
                  <span className="text-xs text-zinc-200 font-semibold">
                    {atsOptimized ? "Keywords injected successfully!" : "Missing keywords found"}
                  </span>
                </div>
                <button
                  onClick={toggleAtsOptimization}
                  className={`neon-btn px-4 py-2 rounded-xl text-[10px] font-bold transition uppercase ${
                    atsOptimized
                      ? "bg-emerald-500 text-zinc-950"
                      : "border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                  }`}
                >
                  {atsOptimized ? "Undo Optimizer" : "Auto-Optimize (Gemini)"}
                </button>
              </div>

              {/* Dynamic tag array */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-950/40 p-3 rounded-xl border border-emerald-500/10">
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wide block mb-1.5">Matched Keywords</span>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[9px] bg-emerald-500/5 px-2 py-0.5 rounded text-emerald-300 border border-emerald-500/10">FastAPI</span>
                    <span className="text-[9px] bg-emerald-500/5 px-2 py-0.5 rounded text-emerald-300 border border-emerald-500/10">React</span>
                    {atsOptimized && (
                      <>
                        <span className="text-[9px] bg-emerald-500/10 px-2 py-0.5 rounded text-cyan-300 border border-cyan-500/20 animate-pulse">Docker</span>
                        <span className="text-[9px] bg-emerald-500/10 px-2 py-0.5 rounded text-cyan-300 border border-cyan-500/20 animate-pulse">CI/CD</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-zinc-950/40 p-3 rounded-xl border border-rose-500/10">
                  <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wide block mb-1.5">Missing Gaps</span>
                  <div className="flex flex-wrap gap-1">
                    {!atsOptimized ? (
                      <>
                        <span className="text-[9px] bg-rose-500/5 px-2 py-0.5 rounded text-rose-300 border border-rose-500/10">Docker</span>
                        <span className="text-[9px] bg-rose-500/5 px-2 py-0.5 rounded text-rose-300 border border-rose-500/10">CI/CD</span>
                      </>
                    ) : (
                      <span className="text-[9px] text-zinc-500 italic">No gaps remaining!</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INTERACTIVE CAREER ROADMAP ORBIT */}
        {activeTab === "roadmap" && (
          <div className="flex-1 flex flex-col justify-between gap-5">
            <div>
              <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest block mb-1">Autopilot Career Orbit</span>
              <h3 className="text-lg font-bold text-white">Full-Stack FastAPI Roadmap</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Interactive skill landmarks generated dynamically based on active vacancies and developer profiles.
              </p>
            </div>

            {/* Orbit Node Diagram */}
            <div className="flex-1 flex flex-col justify-center relative py-6">
              {/* Main SVG connecting lines with pulsing lights */}
              <div className="space-y-4 relative z-10">
                {[
                  { stage: "Node 01: Core Systems", skill: "Asynchronous Python & Uvicorn", complete: true, color: "border-emerald-500/30 text-emerald-300 bg-emerald-500/5" },
                  { stage: "Node 02: RESTful Schema", skill: "FastAPI Pydantic & SQLAlchemy Models", complete: true, color: "border-emerald-500/30 text-emerald-300 bg-emerald-500/5" },
                  { stage: "Node 03: Deployment Container", skill: "Docker Orchestration & CI/CD Pipelines", complete: false, active: true, color: "border-cyan-500/40 text-cyan-300 bg-cyan-500/5 animate-pulse" },
                  { stage: "Node 04: AI Core Integrations", skill: "Gemini APIs & Vector Embedding Vaults", complete: false, color: "border-zinc-800 text-zinc-500" }
                ].map((node, i) => (
                  <div key={i} className="relative flex items-center gap-4">
                    {/* Vertical connecting line */}
                    {i < 3 && (
                      <div className="absolute left-5.5 top-10 bottom-[-20px] w-[2px] bg-gradient-to-b from-emerald-500 to-zinc-800" />
                    )}

                    {/* Step marker */}
                    <div className={`h-11 w-11 rounded-xl border flex items-center justify-center text-xs font-bold shrink-0 relative ${
                      node.complete 
                        ? "bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md shadow-emerald-500/20" 
                        : node.active
                        ? "bg-cyan-500 text-zinc-950 border-cyan-400 shadow-md shadow-cyan-500/20"
                        : "bg-zinc-900 border-zinc-800 text-zinc-500"
                    }`}>
                      {node.complete ? <CheckCircle2 size={16} /> : `0${i+1}`}
                    </div>

                    {/* Content block */}
                    <div className={`flex-1 border p-3 rounded-2xl transition duration-300 ${node.color}`}>
                      <span className="text-[8px] font-bold uppercase tracking-widest block mb-0.5 opacity-60">{node.stage}</span>
                      <span className="text-xs font-semibold block">{node.skill}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-2 border-t border-white/5">
              <span>ACTIVE TARGET: FASTAPI ARCHITECT</span>
              <span className="text-emerald-400 font-bold">50% PROGRESS COMPLETE</span>
            </div>
          </div>
        )}

        {/* TAB 3: PIPELINE GRAPH STATUS */}
        {activeTab === "pipeline" && (
          <div className="flex-1 flex flex-col justify-between gap-6">
            <div>
              <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest block mb-1">Corporate Tracker</span>
              <h3 className="text-lg font-bold text-white">Interactive Sourcing Pipeline</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Monitor applicant statuses as recruiters progress profiles across active columns on their synced Kanban.
              </p>
            </div>

            {/* Sourcing Graph Visualization */}
            <div className="flex-1 flex flex-col justify-center gap-5 my-3">
              <div className="relative">
                {/* Horizontal connection line */}
                <div className="absolute top-5 left-0 right-0 h-[2px] bg-zinc-800 -z-10" />
                <div 
                  className="absolute top-5 left-0 h-[2px] bg-gradient-to-r from-emerald-500 to-amber-500 -z-10 transition-all duration-700" 
                  style={{ width: `${(pipelineStep / 3) * 100}%` }}
                />

                <div className="flex justify-between items-center relative z-10">
                  {["Applied", "Screening", "Interview", "Offer"].map((step, idx) => {
                    const isDone = idx < pipelineStep;
                    const isActive = idx === pipelineStep;
                    
                    return (
                      <button
                        key={step}
                        onClick={() => setPipelineStep(idx)}
                        className="flex flex-col items-center gap-2 cursor-pointer group outline-none"
                      >
                        <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center transition duration-300 ${
                          isDone 
                            ? "bg-emerald-500 border-emerald-400 text-zinc-950 shadow-md shadow-emerald-500/10" 
                            : isActive 
                            ? "bg-amber-500 border-amber-400 text-zinc-950 shadow-md shadow-amber-500/10 animate-pulse"
                            : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                        }`}>
                          {idx + 1}
                        </div>
                        <span className={`text-[10px] font-bold tracking-tight transition ${
                          isActive ? "text-amber-400 font-extrabold" : isDone ? "text-emerald-400" : "text-zinc-500"
                        }`}>
                          {step}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Details Card */}
              <div className="glass-3d bg-zinc-900/40 p-4.5 border border-white/5 rounded-2xl space-y-2 mt-4 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold text-amber-400 uppercase tracking-widest">Active Application State</span>
                  <span className="text-[9px] text-zinc-500 font-mono">ID: app_9482</span>
                </div>
                <div className="text-xs font-semibold text-zinc-200">
                  {pipelineStep === 0 && "Your profile has been submitted and registered in the SQLite DB."}
                  {pipelineStep === 1 && "Recruiter has validated your resume credentials with Gemini AI Core."}
                  {pipelineStep === 2 && "Active round initiated. Look out for WebSocket notification logs."}
                  {pipelineStep === 3 && "Congratulations! Sourcing complete. Offer letter dispatched to vault."}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-bold pt-1.5">
                  <TrendingUp size={12} className="text-emerald-400" />
                  Estimated Success Prob: <span className="text-emerald-400">92%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => setPipelineStep(Math.max(0, pipelineStep - 1))}
                className="flex-1 py-2 px-3 border border-white/10 hover:bg-white/5 text-zinc-300 rounded-xl text-[10px] font-extrabold uppercase transition"
              >
                Previous Step
              </button>
              <button
                onClick={() => setPipelineStep(Math.min(3, pipelineStep + 1))}
                className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-[10px] font-extrabold uppercase transition shadow-md shadow-amber-500/10"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
