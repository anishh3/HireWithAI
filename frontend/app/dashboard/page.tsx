"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getUser } from "@/lib/storage";
import { getTasks, type Task } from "@/lib/api";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "candidate") { window.location.href = "/login"; return; }
    getTasks(u.candidate_id).then(setTasks).catch(() => setTasks([])).finally(() => setLoading(false));
  }, []);

  const task = tasks[0];

  return (
    <div className="app-layout">
      <aside className="dashboard-sidebar">
        <div style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "2rem" }}>HireWithAI</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <div className="nav-item active"><span>📝</span> My Tasks</div>
          <div className="nav-item"><span>👤</span> Profile</div>
        </nav>
      </aside>

      <main className="main-content">
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <header style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>Welcome back</h1>
            <p style={{ color: "var(--text-muted)" }}>Select an assessment to begin.</p>
          </header>

          {loading ? (
            <div className="dashboard-card" style={{ padding: "3rem", textAlign: "center" }}>
              <p style={{ color: "var(--text-muted)" }}>Loading...</p>
            </div>
          ) : task ? (
            <Link href={`/task/${task.id}`} className="dashboard-card" style={{ display: "block", padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div>
                  <span style={{
                    display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.5rem",
                    background: task.submitted ? "rgba(16, 185, 129, 0.1)" : "rgba(99, 102, 241, 0.1)",
                    color: task.submitted ? "var(--success)" : "var(--primary)",
                    border: `1px solid ${task.submitted ? "rgba(16, 185, 129, 0.2)" : "rgba(99, 102, 241, 0.2)"}`,
                  }}>{task.submitted ? "Completed" : "Active"}</span>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>{task.title}</h2>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
                    {task.submitted ? `${task.tests_passed}/${task.tests_total} tests passed` : `${task.expected_time} min`}
                  </p>
                </div>
                <div className={task.submitted ? "btn-secondary" : "btn-primary"} style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
                  {task.submitted ? "View" : "Start"} →
                </div>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>{task.description}</p>
            </Link>
          ) : (
            <div className="dashboard-card" style={{ padding: "3rem", textAlign: "center" }}>
              <p style={{ color: "var(--text-muted)" }}>No assessments assigned.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
