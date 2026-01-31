"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getEmployerView } from "@/lib/api";

function EmployerContent() {
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
    <main className="main-content" style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <Link href="/recruiter" style={{ 
          display: "inline-flex", 
          alignItems: "center", 
          gap: "var(--space-2)", 
          color: "var(--text-tertiary)", 
          fontSize: "0.85rem",
          transition: "color 0.15s",
        }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Controls */}
      <div className="card" style={{ padding: "var(--space-6)", marginBottom: "var(--space-6)" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "var(--space-5)" }}>Analysis Controls</h2>
        <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 150px" }}>
            <label className="text-label" style={{ display: "block", marginBottom: "var(--space-2)" }}>Candidate ID</label>
            <input 
              type="number" 
              value={candidateId} 
              onChange={(e) => setCandidateId(e.target.value)} 
              placeholder="1" 
              className="input"
            />
          </div>
          <div style={{ flex: "1 1 150px" }}>
            <label className="text-label" style={{ display: "block", marginBottom: "var(--space-2)" }}>Task ID</label>
            <input 
              type="number" 
              value={taskId} 
              onChange={(e) => setTaskId(e.target.value)} 
              placeholder="1" 
              className="input"
            />
          </div>
          <button onClick={handleAnalyze} disabled={loading} className="btn-primary" style={{ padding: "var(--space-3) var(--space-6)" }}>
            {loading ? "Loading..." : "Analyze"}
          </button>
        </div>
      </div>

      {error && (
        <p style={{ 
          color: "var(--error)", 
          marginBottom: "var(--space-4)", 
          padding: "var(--space-3)",
          background: "var(--error-muted)",
          borderRadius: "var(--radius-sm)",
          fontSize: "0.875rem",
        }}>{error}</p>
      )}

      {data && (
        <div className="animate-fade-in">
          {/* Header Card */}
          <div className="card" style={{ padding: "var(--space-6)", marginBottom: "var(--space-4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-5)" }}>
              <div>
                <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "var(--space-1)" }}>{data.email}</h1>
                <p style={{ color: "var(--text-tertiary)", fontSize: "0.875rem" }}>{data.task_title}</p>
              </div>
              {data.submission && (
                <span className="badge badge-success">
                  {data.submission.tests_passed}/{data.submission.tests_total} tests
                </span>
              )}
            </div>
            
            {/* Insight */}
            <div style={{ 
              padding: "var(--space-4)", 
              background: "var(--bg-surface)", 
              borderRadius: "var(--radius-md)",
              borderLeft: "3px solid var(--primary)",
              marginBottom: data.conclusion ? "var(--space-4)" : 0,
            }}>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: "0.9rem" }}>{data.insight}</p>
            </div>
            
            {data.conclusion && (
              <p style={{ color: "var(--accent)", fontWeight: 500, fontSize: "0.9rem" }}>{data.conclusion}</p>
            )}
          </div>

          {/* Metrics Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
            {[
              { label: "Total Time", value: `${Math.round(data.metrics.total_time_seconds / 60)}m` },
              { label: "Edits", value: data.metrics.edit_count },
              { label: "Runs", value: data.metrics.run_count },
              { label: "AI Uses", value: data.metrics.ai_usage_count },
            ].map((m, i) => (
              <div key={i} className="card" style={{ padding: "var(--space-5)", textAlign: "center" }}>
                <p style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "var(--space-1)" }}>{m.value}</p>
                <p className="text-label">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Code */}
          {data.submission?.final_code && (
            <div className="card" style={{ padding: "var(--space-6)" }}>
              <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "var(--space-4)" }}>Submitted Code</h3>
              <pre style={{ 
                background: "#0d0d10", 
                padding: "var(--space-4)", 
                borderRadius: "var(--radius-md)", 
                overflow: "auto", 
                fontSize: "0.8rem", 
                color: "#e4e4e7",
                fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                lineHeight: 1.6,
                border: "1px solid var(--border)",
              }}>
                {data.submission.final_code}
              </pre>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

export default function EmployerPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <Suspense fallback={
        <div style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--text-tertiary)" }}>
          Loading...
        </div>
      }>
        <EmployerContent />
      </Suspense>
    </div>
  );
}
