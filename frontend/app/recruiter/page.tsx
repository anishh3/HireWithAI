"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getUser } from "@/lib/storage";
import { getCandidates } from "@/lib/api";

type Candidate = {
  id: number;
  email: string;
  task_title: string;
  submitted: boolean;
  metrics: {
    total_time_seconds: number;
    edit_count: number;
    run_count: number;
    refine_cycles: number;
    edits_per_run: number;
    linear_typing_ratio: number;
    linear_typing_edits: number;
    ai_usage_count: number;
    large_paste_count: number;
    context_switch_seconds: number;
    ai_prompts: { prompt: string; timestamp: string }[];
    paste_events: { chars_added: number; content_preview: string; timestamp: string }[];
  };
  insight: string;
  conclusion: string;
};

// Circular Progress Component
function CircularProgress({ value, max = 100, size = 80, strokeWidth = 8, color = "var(--primary)", label }: { 
  value: number; max?: number; size?: number; strokeWidth?: number; color?: string; label: string 
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percent = Math.min((value / max) * 100, 100);
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-2)" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-input)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div style={{ position: "absolute", marginTop: size / 2 - 12, textAlign: "center" }}>
        <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>{Math.round(percent)}%</p>
      </div>
      <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", textTransform: "uppercase", marginTop: "-" + (size / 2 - 10) + "px" }}>{label}</p>
    </div>
  );
}

// Bar Chart Component
function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      {data.map((item, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>{item.label}</span>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>{item.value}</span>
          </div>
          <div style={{ height: "8px", background: "var(--bg-input)", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ 
              height: "100%", 
              width: `${(item.value / maxValue) * 100}%`, 
              background: item.color,
              borderRadius: "4px",
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Donut Chart Component for Activity Breakdown
function DonutChart({ segments, size = 120 }: { segments: { value: number; color: string; label: string }[]; size?: number }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  let currentOffset = 0;
  
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {segments.map((segment, i) => {
          const segmentLength = (segment.value / total) * circumference;
          const offset = currentOffset;
          currentOffset += segmentLength;
          
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
              strokeDashoffset={-offset}
              style={{ transition: "stroke-dasharray 0.5s ease" }}
            />
          );
        })}
      </svg>
      <div style={{ 
        position: "absolute", 
        top: "50%", 
        left: "50%", 
        transform: "translate(-50%, -50%)",
        textAlign: "center",
      }}>
        <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)" }}>{total}</p>
        <p style={{ fontSize: "0.65rem", color: "var(--text-tertiary)", textTransform: "uppercase" }}>Actions</p>
      </div>
    </div>
  );
}

export default function RecruiterDashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "recruiter") { window.location.href = "/login"; return; }
    getCandidates().then(setCandidates).catch(() => setCandidates([])).finally(() => setLoading(false));
  }, []);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.round(s % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const toggleExpand = (id: number) => {
    setExpanded(expanded === id ? null : id);
  };

  // Calculate behavior score
  const getBehaviorScore = (c: Candidate) => {
    let score = 50;
    if (c.metrics.linear_typing_ratio > 0.5) score += 20;
    if (c.metrics.refine_cycles >= 2) score += 15;
    if (c.metrics.large_paste_count === 0) score += 15;
    if (c.metrics.ai_usage_count <= 3) score += 10;
    if (c.metrics.large_paste_count > 2) score -= 30;
    if (c.metrics.ai_usage_count > 8) score -= 20;
    // Penalize if spent too much time away from tab
    const awayPercent = c.metrics.total_time_seconds > 0 
      ? (c.metrics.context_switch_seconds || 0) / c.metrics.total_time_seconds 
      : 0;
    if (awayPercent > 0.3) score -= 15; // More than 30% time away
    if (awayPercent > 0.5) score -= 15; // More than 50% time away
    return Math.max(0, Math.min(100, score));
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside style={{
        width: "220px",
        padding: "var(--space-6) var(--space-4)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-10)",
        background: "var(--bg-elevated)",
        borderRight: "1px solid var(--border)",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <div style={{ width: "24px", height: "24px", background: "var(--primary)", borderRadius: "var(--radius-sm)" }} />
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>HireWithAI</span>
        </Link>
        
        <nav style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            padding: "var(--space-3)",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--text-primary)",
            background: "rgba(255,255,255,0.04)",
            borderLeft: "2px solid var(--primary)",
            marginLeft: "-2px",
          }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Overview
          </div>
          <Link href="/recruiter" className="recruiter-nav-link">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            Candidates
          </Link>
          <Link href="/settings" className="recruiter-nav-link">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content" style={{ background: "var(--bg-base)" }}>
        <div style={{ maxWidth: "1200px" }}>
          <div style={{ marginBottom: "var(--space-8)" }}>
            <h1 className="heading-lg" style={{ marginBottom: "var(--space-2)" }}>Candidate Analysis</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Detailed workflow signals and behavioral insights</p>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-4)", marginBottom: "var(--space-8)" }}>
            {[
              { label: "Total Candidates", value: candidates.length, color: "var(--primary)" },
              { label: "Submitted", value: candidates.filter(c => c.submitted).length, color: "var(--success)" },
              { label: "In Progress", value: candidates.filter(c => !c.submitted).length, color: "var(--warning)" },
              { label: "Avg Time", value: candidates.length ? formatTime(Math.round(candidates.reduce((a, c) => a + c.metrics.total_time_seconds, 0) / candidates.length)) : "—", color: "var(--accent)" },
            ].map((stat, i) => (
              <div key={i} className="card" style={{ padding: "var(--space-5)" }}>
                <p className="text-label" style={{ marginBottom: "var(--space-2)" }}>{stat.label}</p>
                <p style={{ fontSize: "2rem", fontWeight: 700, color: stat.color }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Candidates */}
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", color: "var(--text-tertiary)", padding: "var(--space-6)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
              Loading candidates...
            </div>
          ) : candidates.length > 0 ? (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              {candidates.map((c) => {
                const behaviorScore = getBehaviorScore(c);
                const scoreColor = behaviorScore >= 70 ? "var(--success)" : behaviorScore >= 40 ? "var(--warning)" : "var(--error)";
                
                return (
                  <div key={c.id} className="card" style={{ overflow: "hidden" }}>
                    {/* Header */}
                    <div 
                      onClick={() => toggleExpand(c.id)}
                      style={{ 
                        padding: "var(--space-5)", 
                        cursor: "pointer",
                        borderBottom: expanded === c.id ? "1px solid var(--border)" : "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                          {/* Behavior Score Circle */}
                          <div style={{ position: "relative", width: "50px", height: "50px" }}>
                            <svg width="50" height="50" style={{ transform: "rotate(-90deg)" }}>
                              <circle cx="25" cy="25" r="20" fill="none" stroke="var(--bg-input)" strokeWidth="5" />
                              <circle 
                                cx="25" cy="25" r="20" fill="none" stroke={scoreColor} strokeWidth="5"
                                strokeDasharray={`${(behaviorScore / 100) * 125.6} 125.6`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <span style={{ 
                              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                              fontSize: "0.75rem", fontWeight: 700, color: scoreColor
                            }}>{behaviorScore}</span>
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-1)" }}>{c.email}</p>
                            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                              <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>{c.task_title}</span>
                              <span className={c.submitted ? "badge badge-success" : "badge badge-primary"}>
                                {c.submitted ? "Submitted" : "In Progress"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <svg 
                          width="20" height="20" 
                          fill="none" 
                          stroke="var(--text-tertiary)" 
                          strokeWidth="2" 
                          viewBox="0 0 24 24"
                          style={{ 
                            transform: expanded === c.id ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s ease"
                          }}
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </div>

                      {/* Quick Stats Row */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "var(--space-3)", fontSize: "0.8rem" }}>
                        {[
                          { label: "Edits", value: c.metrics.edit_count, color: "var(--text-primary)" },
                          { label: "Runs", value: c.metrics.run_count, color: "var(--text-primary)" },
                          { label: "AI Uses", value: c.metrics.ai_usage_count, color: c.metrics.ai_usage_count > 5 ? "var(--warning)" : "var(--text-primary)" },
                          { label: "Pastes", value: c.metrics.large_paste_count, color: c.metrics.large_paste_count > 0 ? "var(--error)" : "var(--text-primary)" },
                          { label: "Refines", value: c.metrics.refine_cycles, color: c.metrics.refine_cycles >= 3 ? "var(--success)" : "var(--text-primary)" },
                          { label: "Away", value: formatTime(c.metrics.context_switch_seconds || 0), color: (c.metrics.context_switch_seconds || 0) > 60 ? "var(--warning)" : "var(--text-primary)" },
                          { label: "Total", value: formatTime(c.metrics.total_time_seconds), color: "var(--text-primary)" },
                        ].map((stat, i) => (
                          <div key={i}>
                            <p style={{ color: "var(--text-muted)", marginBottom: "2px" }}>{stat.label}</p>
                            <p style={{ fontWeight: 600, color: stat.color }}>{stat.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expanded === c.id && (
                      <div style={{ padding: "var(--space-6)", background: "var(--bg-surface)" }}>
                        {/* Visualizations Row */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-6)", marginBottom: "var(--space-6)" }}>
                          {/* Activity Breakdown Donut */}
                          <div style={{ 
                            padding: "var(--space-5)", 
                            background: "var(--bg-elevated)", 
                            borderRadius: "var(--radius-lg)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}>
                            <p className="text-label" style={{ marginBottom: "var(--space-4)", alignSelf: "flex-start" }}>Activity Breakdown</p>
                            <DonutChart 
                              segments={[
                                { value: c.metrics.edit_count, color: "#6366f1", label: "Edits" },
                                { value: c.metrics.run_count, color: "#22c55e", label: "Runs" },
                                { value: c.metrics.ai_usage_count, color: "#f59e0b", label: "AI" },
                                { value: c.metrics.large_paste_count, color: "#ef4444", label: "Pastes" },
                              ]}
                            />
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)", marginTop: "var(--space-4)", justifyContent: "center" }}>
                              {[
                                { label: "Edits", color: "#6366f1" },
                                { label: "Runs", color: "#22c55e" },
                                { label: "AI", color: "#f59e0b" },
                                { label: "Pastes", color: "#ef4444" },
                              ].map((item, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color }} />
                                  <span style={{ fontSize: "0.65rem", color: "var(--text-tertiary)" }}>{item.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Key Metrics Bar Chart */}
                          <div style={{ 
                            padding: "var(--space-5)", 
                            background: "var(--bg-elevated)", 
                            borderRadius: "var(--radius-lg)",
                          }}>
                            <p className="text-label" style={{ marginBottom: "var(--space-4)" }}>Workflow Metrics</p>
                            <BarChart data={[
                              { label: "Edits per Run", value: c.metrics.edits_per_run || 0, color: "#6366f1" },
                              { label: "Refine Cycles", value: c.metrics.refine_cycles, color: "#22c55e" },
                              { label: "Manual Edits", value: c.metrics.linear_typing_edits || 0, color: "#a78bfa" },
                              { label: "AI Queries", value: c.metrics.ai_usage_count, color: "#f59e0b" },
                            ]} />
                          </div>

                          {/* Circular Gauges */}
                          <div style={{ 
                            padding: "var(--space-5)", 
                            background: "var(--bg-elevated)", 
                            borderRadius: "var(--radius-lg)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}>
                            <p className="text-label" style={{ marginBottom: "var(--space-4)", alignSelf: "flex-start" }}>Code Authenticity</p>
                            <div style={{ display: "flex", gap: "var(--space-6)", justifyContent: "center", flexWrap: "wrap" }}>
                              {/* Linear Typing Gauge */}
                              <div style={{ position: "relative", textAlign: "center" }}>
                                <svg width="90" height="90" style={{ transform: "rotate(-90deg)" }}>
                                  <circle cx="45" cy="45" r="36" fill="none" stroke="var(--bg-input)" strokeWidth="8" />
                                  <circle 
                                    cx="45" cy="45" r="36" fill="none" 
                                    stroke={c.metrics.linear_typing_ratio > 0.5 ? "#22c55e" : "#f59e0b"} 
                                    strokeWidth="8"
                                    strokeDasharray={`${c.metrics.linear_typing_ratio * 226} 226`}
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                                  <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
                                    {Math.round((c.metrics.linear_typing_ratio || 0) * 100)}%
                                  </p>
                                </div>
                                <p style={{ fontSize: "0.65rem", color: "var(--text-tertiary)", marginTop: "var(--space-2)" }}>Linear Typing</p>
                              </div>

                              {/* Behavior Score Gauge */}
                              <div style={{ position: "relative", textAlign: "center" }}>
                                <svg width="90" height="90" style={{ transform: "rotate(-90deg)" }}>
                                  <circle cx="45" cy="45" r="36" fill="none" stroke="var(--bg-input)" strokeWidth="8" />
                                  <circle 
                                    cx="45" cy="45" r="36" fill="none" 
                                    stroke={scoreColor} 
                                    strokeWidth="8"
                                    strokeDasharray={`${(behaviorScore / 100) * 226} 226`}
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                                  <p style={{ fontSize: "1.25rem", fontWeight: 700, color: scoreColor }}>
                                    {behaviorScore}
                                  </p>
                                </div>
                                <p style={{ fontSize: "0.65rem", color: "var(--text-tertiary)", marginTop: "var(--space-2)" }}>Trust Score</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Time Breakdown - Focus vs Away */}
                        <div style={{ 
                          padding: "var(--space-5)", 
                          background: "var(--bg-elevated)", 
                          borderRadius: "var(--radius-lg)",
                          marginBottom: "var(--space-6)",
                        }}>
                          <p className="text-label" style={{ marginBottom: "var(--space-4)" }}>Time Breakdown</p>
                          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                            {/* Time Bar */}
                            <div style={{ flex: 1 }}>
                              {(() => {
                                const totalTime = c.metrics.total_time_seconds || 1;
                                const awayTime = c.metrics.context_switch_seconds || 0;
                                const focusTime = Math.max(0, totalTime - awayTime);
                                const focusPercent = (focusTime / totalTime) * 100;
                                const awayPercent = (awayTime / totalTime) * 100;
                                
                                return (
                                  <>
                                    <div style={{ 
                                      height: "24px", 
                                      borderRadius: "12px", 
                                      overflow: "hidden", 
                                      display: "flex",
                                      background: "var(--bg-input)",
                                    }}>
                                      <div style={{ 
                                        width: `${focusPercent}%`, 
                                        background: "linear-gradient(90deg, #22c55e, #4ade80)",
                                        transition: "width 0.5s ease",
                                      }} />
                                      <div style={{ 
                                        width: `${awayPercent}%`, 
                                        background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
                                        transition: "width 0.5s ease",
                                      }} />
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "var(--space-3)" }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                                        <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#22c55e" }} />
                                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                                          Focused: <strong>{formatTime(focusTime)}</strong> ({Math.round(focusPercent)}%)
                                        </span>
                                      </div>
                                      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                                        <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#f59e0b" }} />
                                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                                          Away: <strong>{formatTime(awayTime)}</strong> ({Math.round(awayPercent)}%)
                                        </span>
                                      </div>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                            
                            {/* Total Time Display */}
                            <div style={{ 
                              textAlign: "center", 
                              padding: "var(--space-4)",
                              background: "var(--bg-surface)",
                              borderRadius: "var(--radius-md)",
                              minWidth: "100px",
                            }}>
                              <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)" }}>
                                {formatTime(c.metrics.total_time_seconds)}
                              </p>
                              <p style={{ fontSize: "0.65rem", color: "var(--text-tertiary)", textTransform: "uppercase" }}>Total Time</p>
                            </div>
                          </div>
                          
                          {/* Warning if too much time away */}
                          {(c.metrics.context_switch_seconds || 0) > 120 && (
                            <div style={{ 
                              marginTop: "var(--space-3)", 
                              padding: "var(--space-3)", 
                              background: "rgba(245, 158, 11, 0.1)", 
                              borderRadius: "var(--radius-sm)",
                              border: "1px solid rgba(245, 158, 11, 0.2)",
                              display: "flex",
                              alignItems: "center",
                              gap: "var(--space-2)",
                            }}>
                              <span style={{ fontSize: "1rem" }}>⚠️</span>
                              <span style={{ fontSize: "0.8rem", color: "var(--warning)" }}>
                                Candidate spent significant time ({formatTime(c.metrics.context_switch_seconds || 0)}) outside the assessment tab
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Insight */}
                        <div style={{ 
                          padding: "var(--space-4)", 
                          background: "var(--bg-elevated)", 
                          borderRadius: "var(--radius-md)",
                          borderLeft: "3px solid var(--primary)",
                          marginBottom: "var(--space-5)",
                        }}>
                          <p className="text-label" style={{ marginBottom: "var(--space-2)" }}>AI Insight</p>
                          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{c.insight}</p>
                          {c.conclusion && (
                            <p style={{ fontSize: "0.85rem", color: "var(--accent)", marginTop: "var(--space-2)", fontWeight: 500 }}>{c.conclusion}</p>
                          )}
                        </div>

                        {/* AI Prompts & Paste Events Grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                          {/* AI Prompts Section */}
                          <div style={{ 
                            padding: "var(--space-4)", 
                            background: "var(--bg-elevated)", 
                            borderRadius: "var(--radius-md)",
                          }}>
                            <p className="text-label" style={{ marginBottom: "var(--space-3)" }}>
                              AI Prompts ({c.metrics.ai_prompts?.length || 0})
                            </p>
                            {c.metrics.ai_prompts && c.metrics.ai_prompts.length > 0 ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", maxHeight: "200px", overflow: "auto" }}>
                                {c.metrics.ai_prompts.map((p, i) => (
                                  <div key={i} style={{ 
                                    padding: "var(--space-3)", 
                                    background: "var(--bg-surface)", 
                                    borderRadius: "var(--radius-sm)",
                                    border: "1px solid var(--border)",
                                  }}>
                                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>"{p.prompt}"</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>No AI prompts recorded</p>
                            )}
                          </div>

                          {/* Paste Events Section */}
                          <div style={{ 
                            padding: "var(--space-4)", 
                            background: c.metrics.paste_events?.length > 0 ? "rgba(239, 68, 68, 0.05)" : "var(--bg-elevated)", 
                            borderRadius: "var(--radius-md)",
                            border: c.metrics.paste_events?.length > 0 ? "1px solid rgba(239, 68, 68, 0.2)" : "none",
                          }}>
                            <p className="text-label" style={{ marginBottom: "var(--space-3)", color: c.metrics.paste_events?.length > 0 ? "var(--error)" : "var(--text-tertiary)" }}>
                              {c.metrics.paste_events?.length > 0 ? "⚠️ " : ""}Paste Events ({c.metrics.paste_events?.length || 0})
                            </p>
                            {c.metrics.paste_events && c.metrics.paste_events.length > 0 ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", maxHeight: "200px", overflow: "auto" }}>
                                {c.metrics.paste_events.map((p, i) => (
                                  <div key={i} style={{ 
                                    padding: "var(--space-3)", 
                                    background: "var(--bg-base)", 
                                    borderRadius: "var(--radius-sm)",
                                  }}>
                                    <p style={{ fontSize: "0.7rem", color: "var(--error)", fontWeight: 600, marginBottom: "var(--space-1)" }}>
                                      {p.chars_added} characters pasted
                                    </p>
                                    {p.content_preview && (
                                      <pre style={{ 
                                        fontSize: "0.7rem", 
                                        color: "var(--text-tertiary)", 
                                        whiteSpace: "pre-wrap",
                                        margin: 0,
                                        fontFamily: "monospace",
                                      }}>
                                        {p.content_preview.slice(0, 150)}{p.content_preview.length > 150 ? "..." : ""}
                                      </pre>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={{ fontSize: "0.8rem", color: "var(--success)", fontStyle: "italic" }}>✓ No suspicious paste activity</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card" style={{ padding: "var(--space-10)", textAlign: "center" }}>
              <div style={{ 
                width: "48px", 
                height: "48px", 
                background: "var(--bg-surface)", 
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto var(--space-4)",
              }}>
                <svg width="24" height="24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "var(--space-2)" }}>No candidates yet</h3>
              <p style={{ color: "var(--text-tertiary)", fontSize: "0.875rem" }}>
                Candidates will appear here once they start assessments.
              </p>
            </div>
          )}
        </div>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}
