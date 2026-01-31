"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getEmployerView } from "@/lib/api";

export default function EmployerPage() {
  const searchParams = useSearchParams();
  const [candidateId, setCandidateId] = useState(searchParams.get("candidate") || "");
  const [taskId, setTaskId] = useState(searchParams.get("task") || "");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    if (!candidateId || !taskId) return;
    setLoading(true);
    setError("");
    try {
      const res = await getEmployerView(Number(candidateId), Number(taskId));
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (candidateId && taskId) handleAnalyze();
  }, []);

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/recruiter" style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>← Back to Dashboard</Link>
      </div>

      <div className="dashboard-card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Analysis Controls</h2>
        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.75rem", color: "var(--text-dim)" }}>Candidate ID</label>
            <input type="number" value={candidateId} onChange={(e) => setCandidateId(e.target.value)} placeholder="1" style={{
              width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-input)", color: "white"
            }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.75rem", color: "var(--text-dim)" }}>Task ID</label>
            <input type="number" value={taskId} onChange={(e) => setTaskId(e.target.value)} placeholder="1" style={{
              width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-input)", color: "white"
            }} />
          </div>
          <button onClick={handleAnalyze} disabled={loading} className="btn-primary" style={{ padding: "0.75rem 1.5rem" }}>
            {loading ? "Loading..." : "Analyze"}
          </button>
        </div>
      </div>

      {error && <p style={{ color: "var(--error)", marginBottom: "1rem" }}>{error}</p>}

      {data && (
        <>
          <div className="dashboard-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.25rem" }}>{data.email}</h1>
                <p style={{ color: "var(--text-dim)", fontSize: "0.875rem" }}>{data.task_title}</p>
              </div>
              {data.submission && (
                <span style={{ padding: "0.25rem 0.75rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600, background: "rgba(16, 185, 129, 0.1)", color: "var(--success)" }}>
                  {data.submission.tests_passed}/{data.submission.tests_total} tests
                </span>
              )}
            </div>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>{data.insight}</p>
            {data.conclusion && <p style={{ marginTop: "1rem", color: "var(--accent)", fontWeight: 500 }}>{data.conclusion}</p>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
            {[
              { label: "Total Time", value: `${Math.round(data.metrics.total_time_seconds / 60)}m` },
              { label: "Edits", value: data.metrics.edit_count },
              { label: "Runs", value: data.metrics.run_count },
              { label: "AI Uses", value: data.metrics.ai_usage_count },
            ].map((m, i) => (
              <div key={i} className="dashboard-card" style={{ padding: "1rem", textAlign: "center" }}>
                <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>{m.value}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>{m.label}</p>
              </div>
            ))}
          </div>

          {data.submission?.final_code && (
            <div className="dashboard-card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "1rem" }}>Submitted Code</h3>
              <pre style={{ background: "#1e1e1e", padding: "1rem", borderRadius: "8px", overflow: "auto", fontSize: "0.8rem", color: "#d4d4d4" }}>{data.submission.final_code}</pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
