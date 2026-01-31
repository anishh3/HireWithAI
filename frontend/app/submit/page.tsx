"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/storage";
import { getTask, submitCode, type Task } from "@/lib/api";

function SubmitContent() {
  const searchParams = useSearchParams();
  const taskId = Number(searchParams.get("task"));
  const [task, setTask] = useState<Task | null>(null);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{ passed: number; total: number; details: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "candidate") { window.location.href = "/login"; return; }
    if (!taskId) return;
    getTask(taskId).then(setTask);
    const storageKey = `code_${u.candidate_id}_${taskId}`;
    const stored = typeof sessionStorage !== "undefined" ? sessionStorage.getItem(storageKey) : null;
    if (stored) setCode(stored);
  }, [taskId]);

  async function handleSubmit() {
    const u = getUser();
    if (!u || u.role !== "candidate" || !taskId) return;
    setLoading(true);
    setError("");
    try {
      const res = await submitCode(u.candidate_id, taskId, code);
      setResult({ passed: res.passed, total: res.total, details: res.details });
      if (typeof sessionStorage !== "undefined") sessionStorage.removeItem(`code_${u.candidate_id}_${taskId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  if (!task) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-base)", color: "var(--text-tertiary)" }}>
      Loading...
    </div>
  );

  const allPassed = result && result.passed === result.total;

  return (
    <main style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      padding: "var(--space-6)", 
      background: "var(--bg-base)" 
    }}>
      <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "520px", padding: "var(--space-8)" }}>
        {result ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ 
              width: "64px", 
              height: "64px", 
              background: allPassed ? "var(--success-muted)" : "var(--error-muted)", 
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto var(--space-5)",
            }}>
              {allPassed ? (
                <svg width="32" height="32" fill="none" stroke="var(--success)" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ) : (
                <svg width="32" height="32" fill="none" stroke="var(--error)" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              )}
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "var(--space-2)" }}>
              {allPassed ? "All tests passed!" : "Some tests failed"}
            </h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-6)" }}>
              {result.passed} of {result.total} tests passed
            </p>

            {result.details && (
              <div style={{ 
                background: "var(--bg-surface)", 
                borderRadius: "var(--radius-md)", 
                padding: "var(--space-4)", 
                marginBottom: "var(--space-6)",
                textAlign: "left",
              }}>
                <p className="text-label" style={{ marginBottom: "var(--space-2)" }}>Test Details</p>
                <pre style={{ 
                  fontSize: "0.8rem", 
                  color: "var(--text-secondary)", 
                  whiteSpace: "pre-wrap", 
                  margin: 0,
                  fontFamily: "'Fira Code', monospace",
                  lineHeight: 1.6,
                }}>
                  {result.details}
                </pre>
              </div>
            )}

            <div style={{ display: "flex", gap: "var(--space-3)" }}>
              <Link href="/dashboard" className="btn-secondary" style={{ flex: 1, justifyContent: "center", textDecoration: "none" }}>
                Dashboard
              </Link>
              <Link href="/submissions" className="btn-primary" style={{ flex: 1, justifyContent: "center", textDecoration: "none" }}>
                View Submissions
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
              <div style={{ 
                width: "48px", 
                height: "48px", 
                background: "var(--primary-muted)", 
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto var(--space-4)",
              }}>
                <svg width="24" height="24" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "var(--space-2)" }}>Submit Solution</h1>
              <p style={{ color: "var(--text-secondary)" }}>{task.title}</p>
            </div>

            <div style={{ 
              background: "var(--bg-surface)", 
              borderRadius: "var(--radius-md)", 
              padding: "var(--space-4)", 
              marginBottom: "var(--space-6)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
                <p className="text-label">Your Code</p>
                <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>{code.length} chars</span>
              </div>
              <pre style={{ 
                fontSize: "0.8rem", 
                color: "var(--text-secondary)", 
                whiteSpace: "pre-wrap", 
                margin: 0,
                fontFamily: "'Fira Code', monospace",
                maxHeight: "200px",
                overflow: "auto",
                lineHeight: 1.6,
              }}>
                {code || "(No code written)"}
              </pre>
            </div>

            {error && (
              <p style={{ 
                color: "var(--error)", 
                marginBottom: "var(--space-4)", 
                fontSize: "0.875rem", 
                textAlign: "center",
                padding: "var(--space-3)",
                background: "var(--error-muted)",
                borderRadius: "var(--radius-sm)",
              }}>{error}</p>
            )}

            <div style={{ display: "flex", gap: "var(--space-3)" }}>
              <Link href={`/task/${taskId}`} className="btn-secondary" style={{ flex: 1, justifyContent: "center", textDecoration: "none" }}>
                Back to Editor
              </Link>
              <button onClick={handleSubmit} disabled={loading || !code} className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function SubmitPage() {
  return (
    <Suspense fallback={
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-base)", color: "var(--text-tertiary)" }}>
        Loading...
      </div>
    }>
      <SubmitContent />
    </Suspense>
  );
}
