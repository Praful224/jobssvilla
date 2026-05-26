"use client";

import { useState } from "react";
import { Terminal, Code, Cpu, Play, CheckCircle2, Activity, FileCode, Check } from "lucide-react";

export function FastAPIPark() {
  const [activeTab, setActiveTab] = useState<"code" | "swagger" | "terminal">("swagger");
  const [statusInput, setStatusInput] = useState("Interviewing");
  const [candidateInput, setCandidateInput] = useState("Sarah Jenkins");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStep, setExecutionStep] = useState(0);
  const [showResponse, setShowResponse] = useState(false);

  const pythonCode = `from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.recruiter import Application
from app.services.ai_service import GeminiAIService

router = APIRouter(prefix="/api/v1/recruiter", tags=["Recruitment"])

@router.patch("/applications/{application_id}")
async def update_application_status(
    application_id: int, 
    status: str,
    db: Session = Depends(get_db)
):
    # 1. Fetch current candidate record
    application = db.query(Application).filter_id(application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # 2. Update status and trigger database commit
    application.status = status
    db.commit()
    
    # 3. Trigger Gemini AI to generate automated interview tips
    ai_tips = await GeminiAIService.generate_tips(application.skills)
    
    # 4. Notify Candidate
    await notify_candidate(application.user_id, f"Pipeline moved to {status}")
    
    return {
        "success": True,
        "message": f"Updated {application.name} to {status}",
        "ai_insights": ai_tips
    }`;

  const triggerExecution = () => {
    setIsExecuting(true);
    setExecutionStep(1);
    setShowResponse(false);

    // Timeline simulation
    setTimeout(() => {
      setExecutionStep(2);
    }, 1000);

    setTimeout(() => {
      setExecutionStep(3);
    }, 2000);

    setTimeout(() => {
      setExecutionStep(4);
    }, 2800);

    setTimeout(() => {
      setIsExecuting(false);
      setShowResponse(true);
    }, 3500);
  };

  return (
    <div className="glass-3d bg-zinc-950/60 rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative">
      {/* High tech neon header bar */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-zinc-900/40">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-3.5 w-3.5 rounded-full bg-rose-500/80 shadow-md shadow-rose-500/20" />
            <span className="h-3.5 w-3.5 rounded-full bg-amber-500/80 shadow-md shadow-amber-500/20" />
            <span className="h-3.5 w-3.5 rounded-full bg-emerald-500/80 shadow-md shadow-emerald-500/20" />
          </div>
          <span className="ml-3 text-xs font-mono text-zinc-500 tracking-wider">FASTAPI AUTOPILOT SANDBOX</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-zinc-900/60 border border-white/5 p-1">
          <button
            onClick={() => setActiveTab("swagger")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide transition ${
              activeTab === "swagger"
                ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/10"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Activity size={12} />
            Swagger Playground
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide transition ${
              activeTab === "code"
                ? "bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/10"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <FileCode size={12} />
            FastAPI Code
          </button>
          <button
            onClick={() => setActiveTab("terminal")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide transition ${
              activeTab === "terminal"
                ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/10"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Terminal size={12} />
            Live Logs
          </button>
        </div>
      </div>

      {/* Main Sandbox Area */}
      <div className="p-6 min-h-[420px] flex flex-col justify-between">
        {activeTab === "code" && (
          <div className="flex-1 font-mono text-xs text-zinc-300 leading-relaxed overflow-x-auto select-all max-h-[380px]">
            <pre className="p-2">
              <code>
                {pythonCode.split("\n").map((line, idx) => {
                  // Basic regex styling for visual aesthetic
                  let styledLine = line
                    .replace(/(async def|def|from|import|async|await|return|if|not|raise|class)/g, '<span class="text-rose-400">$1</span>')
                    .replace(/(update_application_status|generate_tips|notify_candidate|filter_id)/g, '<span class="text-cyan-400">$1</span>')
                    .replace(/(@router\.\w+|APIRouter|Session|Depends)/g, '<span class="text-amber-300">$1</span>')
                    .replace(/(\".*?\"|f\".*?\")/g, '<span class="text-emerald-400">$1</span>')
                    .replace(/(#.*)/g, '<span class="text-zinc-500 italic">$1</span>');

                  return (
                    <div key={idx} className="table-row">
                      <span className="table-cell text-zinc-600 text-right pr-4 select-none w-6">{idx + 1}</span>
                      <span className="table-cell" dangerouslySetInnerHTML={{ __html: styledLine }} />
                    </div>
                  );
                })}
              </code>
            </pre>
          </div>
        )}

        {activeTab === "swagger" && (
          <div className="flex-1 flex flex-col gap-5 justify-center">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold px-2.5 py-1 rounded-md border border-emerald-500/30 uppercase tracking-widest shrink-0">
                  PATCH
                </span>
                <code className="text-zinc-100 text-xs font-mono font-bold tracking-tight bg-zinc-900/60 border border-white/5 px-3 py-1.5 rounded-lg w-full">
                  /api/v1/recruiter/applications/<span className="text-cyan-400">12</span>
                </code>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                Updates applicant status, stores history, notifies candidate, and evaluates matches with Gemini AI.
              </p>
            </div>

            {/* Input fields in beautiful 3D glass widgets */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Candidate Target</label>
                <select
                  value={candidateInput}
                  onChange={(e) => setCandidateInput(e.target.value)}
                  className="bg-transparent text-sm text-white font-semibold outline-none cursor-pointer"
                  disabled={isExecuting}
                >
                  <option value="Sarah Jenkins" className="bg-zinc-950 text-white">Sarah Jenkins (Frontend Dev)</option>
                  <option value="Alex Rivera" className="bg-zinc-950 text-white">Alex Rivera (Data Scientist)</option>
                  <option value="Maya Chen" className="bg-zinc-950 text-white">Maya Chen (FastAPI Architect)</option>
                </select>
              </div>

              <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Pipeline Column</label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  className="bg-transparent text-sm text-white font-semibold outline-none cursor-pointer"
                  disabled={isExecuting}
                >
                  <option value="Shortlisted" className="bg-zinc-950 text-white">Shortlisted</option>
                  <option value="Interviewing" className="bg-zinc-950 text-white">Interviewing</option>
                  <option value="Offered" className="bg-zinc-950 text-white">Offered</option>
                  <option value="Hired" className="bg-zinc-950 text-white">Hired</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 mt-2">
              <button
                onClick={triggerExecution}
                disabled={isExecuting}
                className={`neon-btn flex items-center justify-center gap-2.5 w-full py-4.5 rounded-2xl text-xs font-bold transition shadow-lg ${
                  isExecuting
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5"
                    : "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-emerald-500/10"
                }`}
              >
                <Play size={14} className={isExecuting ? "animate-pulse" : ""} />
                {isExecuting ? "Executing Pipeline Transaction..." : "Test Sandbox Transaction"}
              </button>
            </div>

            {/* Simulated Live Transaction Timeline */}
            {(isExecuting || showResponse) && (
              <div className="mt-4 rounded-2xl border border-white/5 bg-zinc-950/80 p-5 font-mono text-xs text-zinc-400 space-y-3.5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-cyan-500 via-emerald-500 to-amber-500 animate-pulse" />
                <h4 className="text-[10px] font-bold tracking-wider uppercase text-zinc-500 flex items-center gap-2">
                  <Cpu size={12} className="text-cyan-400 animate-spin" />
                  Live Step-by-Step Execution Logs
                </h4>
                <div className="space-y-2">
                  {executionStep >= 1 && (
                    <div className="flex items-start gap-2.5">
                      <span className="text-cyan-400">►</span>
                      <p>
                        <span className="text-cyan-300">GET</span> /api/v1/recruiter/applications/12 - Found 1 record matching candidate <span className="text-emerald-400">"{candidateInput}"</span>
                      </p>
                    </div>
                  )}
                  {executionStep >= 2 && (
                    <div className="flex items-start gap-2.5">
                      <span className="text-emerald-400">✔</span>
                      <p>
                        <span className="text-emerald-300">UPDATE</span> sqlite.db set status = <span className="text-amber-400">"{statusInput}"</span> - Row modified successfully!
                      </p>
                    </div>
                  )}
                  {executionStep >= 3 && (
                    <div className="flex items-start gap-2.5">
                      <span className="text-amber-400">★</span>
                      <p>
                        <span className="text-rose-300">CALL</span> gemini-1.5-flash - AI generated 5 targeted interview guidelines for <span className="text-zinc-200">React & FastAPI</span> stack.
                      </p>
                    </div>
                  )}
                  {executionStep >= 4 && (
                    <div className="flex items-start gap-2.5">
                      <span className="text-purple-400">✦</span>
                      <p>
                        <span className="text-purple-300">PUSH</span> WebSocket notification successfully dispatched to candidate account ID 4!
                      </p>
                    </div>
                  )}
                </div>

                {showResponse && (
                  <div className="pt-4 border-t border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                        <CheckCircle2 size={12} /> Response 200 OK
                      </span>
                      <span className="text-[9px] text-zinc-500 font-bold uppercase">350ms</span>
                    </div>
                    <pre className="bg-zinc-950/80 p-4 rounded-xl border border-white/5 text-[11px] text-zinc-200 leading-normal overflow-x-auto text-left">
                      <code>{`{
  "status": "success",
  "application_id": 12,
  "candidate": "${candidateInput}",
  "new_status": "${statusInput}",
  "database_sync": "committed",
  "ai_coach": {
    "score_match": "88%",
    "key_tips": [
      "Prepare for questions on asynchronous programming in Python",
      "Highlight component state management experience with React hooks"
    ]
  }
}`}</code>
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "terminal" && (
          <div className="flex-1 font-mono text-[11px] text-zinc-400 leading-normal max-h-[380px] overflow-y-auto space-y-2 bg-zinc-950 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">FastAPI Uvicorn Host Out</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <div>[2026-05-21 23:28:54] INFO:     Started server process [1284]</div>
            <div>[2026-05-21 23:28:54] INFO:     Waiting for application startup.</div>
            <div>[2026-05-21 23:28:54] INFO:     Application startup complete.</div>
            <div>[2026-05-21 23:28:54] INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)</div>
            <div className="text-zinc-500 italic mt-3">// Waiting for pipeline events...</div>
            {showResponse && (
              <>
                <div className="text-emerald-400 font-bold mt-2">
                  [2026-05-21 23:30:12] INFO:     127.0.0.1:51240 - "PATCH /api/v1/recruiter/applications/12 HTTP/1.1" 200 OK
                </div>
                <div className="text-zinc-300 pl-4">
                  - Request body: status="{statusInput}"
                </div>
                <div className="text-zinc-300 pl-4">
                  - Gemini AI tokens parsed: 420 prompt / 215 generated
                </div>
                <div className="text-zinc-300 pl-4">
                  - SQL query duration: 0.12ms
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
