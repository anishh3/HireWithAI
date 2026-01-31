"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getUser } from "@/lib/storage";
import { getRecruiterCandidates } from "@/lib/api";

type Candidate = {
  candidate_id: number;
  email: string;
  task_id: number;
  task_title: string;
  metrics: { total_time_seconds: number; edit_count: number; run_count: number; ai_usage_count: number };
  insight: string;
  submitted: boolean;
};

export default function RecruiterDashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "recruiter") { window.location.href = "/login"; return; }
    getRecruiterCandidates().then(setCandidates).catch(() => setCandidates([])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-layout">
      <aside className="dashboard-sidebar">
        <div style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "2rem" }}>HireWithAI</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <div className="nav-item active"><span>📊</span> Overview</div>
          <div className="nav-item"><span>👥</span> Candidates</div>
          <div className="nav-item"><span>⚙️</span> Settings</div>
        </nav>
      </aside>

      <main className="main-content">
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <header style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>Hiring Snapshot</h1>
            <p style={{ color: "var(--text-muted)" }}>Candidate insights at a glance</p>
          </header>

          <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
            {[
              { label: "Total Candidates", value: candidates.length },
              { label: "Submitted", value: candidates.filter(c => c.submitted).length },
              { label: "In Progress", value: candidates.filter(c => !c.submitted).length },
            ].map((m, i) => (
              <div key={i} className="dashboard-card" style={{ flex: 1, padding: "1.25rem" }}>
                <p style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: "0.25rem" }}>{m.label}</p>
                <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>{m.value}</p>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="dashboard-card" style={{ padding: "3rem", textAlign: "center" }}>
              <p style={{ color: "var(--text-muted)" }}>Loading candidates...</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="dashboard-card" style={{ padding: "3rem", textAlign: "center" }}>
              <p style={{ color: "var(--text-muted)" }}>No candidate activity yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {candidates.map((c, i) => (
                <Link key={i} href={`/employer?candidate=${c.candidate_id}&task=${c.task_id}`} className="dashboard-card" style={{ display: "block", padding: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <div>
                      <p style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{c.email}</p>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>{c.task_title}</p>
                    </div>
                    <span style={{
                      padding: "0.25rem 0.5rem", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 600,
                      background: c.submitted ? "rgba(16, 185, 129, 0.1)" : "rgba(99, 102, 241, 0.1)",
                      color: c.submitted ? "var(--success)" : "var(--primary)",
                    }}>{c.submitted ? "Submitted" : "In Progress"}</span>
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "0.75rem" }}>{c.insight || "No insights yet."}</p>
                  <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.75rem", color: "var(--text-dim)" }}>
                    <span>{c.metrics.edit_count} edits</span>
                    <span>{c.metrics.run_count} runs</span>
                    <span>{c.metrics.ai_usage_count} AI uses</span>
                    <span>{Math.round(c.metrics.total_time_seconds / 60)}m total</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
