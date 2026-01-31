"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getUser } from "@/lib/storage";
import { getTasks, type Task } from "@/lib/api";
import Sidebar from "@/components/Sidebar";

export default function SubmissionsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "candidate") { window.location.href = "/login"; return; }
    getTasks(u.candidate_id).then(setTasks).catch(() => setTasks([])).finally(() => setLoading(false));
  }, []);

  const submittedTasks = tasks.filter(t => t.submitted);

  return (
    <div className="app-layout">
      <Sidebar role="candidate" />
      <main className="main-content">
        <div style={{ maxWidth: "800px" }}>
          <div style={{ marginBottom: "var(--space-8)" }}>
            <h1 className="heading-lg" style={{ marginBottom: "var(--space-2)" }}>Submissions</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Your completed assignments</p>
          </div>

          {loading ? (
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", color: "var(--text-tertiary)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
              Loading submissions...
            </div>
          ) : submittedTasks.length > 0 ? (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              {submittedTasks.map((task) => (
                <div key={task.id} className="card" style={{ padding: "var(--space-6)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-4)" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-3)" }}>
                        <div style={{ 
                          width: "36px", 
                          height: "36px", 
                          background: "var(--success-muted)", 
                          borderRadius: "var(--radius-md)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          <svg width="18" height="18" fill="none" stroke="var(--success)" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                          </svg>
                        </div>
                        <div>
                          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" }}>{task.title}</h2>
                          <span className="badge badge-success" style={{ marginTop: "var(--space-1)" }}>Completed</span>
                        </div>
                      </div>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>{task.description}</p>
                      
                      {task.test_passed !== undefined && task.test_total !== undefined && (
                        <div style={{ 
                          marginTop: "var(--space-4)", 
                          padding: "var(--space-3)", 
                          background: "var(--bg-surface)", 
                          borderRadius: "var(--radius-sm)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "var(--space-2)",
                        }}>
                          <span style={{ 
                            fontSize: "0.8rem", 
                            fontWeight: 600, 
                            color: task.test_passed === task.test_total ? "var(--success)" : "var(--warning)" 
                          }}>
                            {task.test_passed}/{task.test_total} tests passed
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "var(--space-2)" }}>No submissions yet</h3>
              <p style={{ color: "var(--text-tertiary)", fontSize: "0.875rem", marginBottom: "var(--space-4)" }}>
                Complete your assignments to see them here.
              </p>
              <Link href="/dashboard" className="btn-primary" style={{ textDecoration: "none" }}>
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}
