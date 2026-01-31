"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/storage";
import { submit } from "@/lib/api";

export default function SubmitPage() {
  const searchParams = useSearchParams();
  const taskId = Number(searchParams.get("task") || 1);
  const [code, setCode] = useState("");
  const [reflection, setReflection] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ tests_passed: number; tests_total: number; results: any[] } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem(`code_${taskId}`);
    if (stored) setCode(stored);
  }, [taskId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const u = getUser();
    if (!u || u.role !== "candidate") return;

    setLoading(true);
    setError("");
    try {
      const res = await submit(u.candidate_id, taskId, code, reflection);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    const allPassed = result.tests_passed === result.tests_total;
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div className="glass-card" style={{ maxWidth: "600px", width: "100%", padding: "3rem", textAlign: "center" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>{allPassed ? "🎉" : "📝"}</div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            {allPassed ? "All Tests Passed!" : "Submission Received"}
          </h1>
          <p style={{ fontSize: "1.25rem", color: allPassed ? "var(--success)" : "var(--text-muted)", marginBottom: "2rem" }}>
            {result.tests_passed}/{result.tests_total} tests passed
          </p>
          
          {result.results.length > 0 && (
            <div style={{ textAlign: "left", marginBottom: "2rem" }}>
              {result.results.map((r, i) => (
                <div key={i} style={{ padding: "0.75rem", borderRadius: "8px", marginBottom: "0.5rem", background: r.passed ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", border: `1px solid ${r.passed ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}` }}>
                  <span style={{ fontWeight: 600, color: r.passed ? "var(--success)" : "var(--error)" }}>{r.passed ? "✓" : "✗"}</span>
                  <span style={{ marginLeft: "0.5rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>Input: {JSON.stringify(r.input)}</span>
                </div>
              ))}
            </div>
          )}
          
          <Link href="/dashboard" className="btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div className="glass-card" style={{ maxWidth: "600px", width: "100%", padding: "3rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem", textAlign: "center" }}>Submit Your Solution</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem", textAlign: "center" }}>Your code from the editor will be tested automatically</p>

        {!code ? (
          <div style={{ padding: "1.5rem", background: "rgba(239, 68, 68, 0.1)", borderRadius: "10px", border: "1px solid rgba(239, 68, 68, 0.2)", textAlign: "center" }}>
            <p style={{ color: "var(--error)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>No code found</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>Go to the task workspace to write your solution, then click Submit.</p>
            <Link href={`/task/${taskId}`} className="btn-primary">Back to Task</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase" }}>Reflection (optional)</label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={3}
                placeholder="How did you approach this problem?"
                style={{ width: "100%", padding: "1rem", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--bg-input)", color: "white", fontSize: "0.9rem", resize: "vertical" }}
              />
            </div>

            {error && <p style={{ color: "var(--error)", marginBottom: "1rem", textAlign: "center" }}>{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%" }}>
              {loading ? "Submitting..." : "Submit Solution"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
