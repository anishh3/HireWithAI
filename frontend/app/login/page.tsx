"use client";
import { useState } from "react";
import Link from "next/link";
import { login } from "@/lib/api";
import { setCandidate, setRecruiter } from "@/lib/storage";

export default function LoginPage() {
  const [role, setRole] = useState<"candidate" | "recruiter">("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (role === "recruiter") {
      setRecruiter();
      window.location.href = "/recruiter";
      return;
    }

    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      setCandidate({ candidate_id: res.candidate_id!, email: res.email });
      window.location.href = "/dashboard";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1.5rem", background: "var(--bg-main)", position: "relative",
    }}>
      <div className="radial-glow" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "600px", height: "600px", opacity: 0.3 }} />
      
      <div className="glass-card animate-slide-up" style={{ width: "100%", maxWidth: "420px", padding: "3rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: "56px", height: "56px", background: "linear-gradient(135deg, var(--primary), var(--accent))", borderRadius: "14px", margin: "0 auto 1.5rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem" }}>✨</div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.5rem" }}>Welcome back</h1>
          <p style={{ color: "var(--text-muted)" }}>Sign in to continue</p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", background: "rgba(255,255,255,0.03)", padding: "0.375rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
          {(["candidate", "recruiter"] as const).map((r) => (
            <button key={r} type="button" onClick={() => setRole(r)} style={{
              flex: 1, padding: "0.75rem", borderRadius: "8px", fontWeight: 600,
              background: role === r ? "var(--primary)" : "transparent",
              color: role === r ? "white" : "var(--text-muted)",
              textTransform: "capitalize",
            }}>{r}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {role === "candidate" ? (
            <>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase" }}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@company.com" style={{
                  width: "100%", padding: "0.875rem 1rem", borderRadius: "10px", border: "1px solid var(--border)",
                  background: "var(--bg-input)", color: "white", fontSize: "1rem",
                }} />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase" }}>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" style={{
                  width: "100%", padding: "0.875rem 1rem", borderRadius: "10px", border: "1px solid var(--border)",
                  background: "var(--bg-input)", color: "white", fontSize: "1rem",
                }} />
              </div>
            </>
          ) : (
            <div style={{ padding: "1.5rem", background: "rgba(99, 102, 241, 0.05)", borderRadius: "12px", border: "1px dashed rgba(99, 102, 241, 0.3)", marginBottom: "1.5rem", textAlign: "center" }}>
              <p style={{ color: "var(--accent)", fontWeight: 600 }}>Recruiter access enabled</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>No login required</p>
            </div>
          )}

          {error && <p style={{ color: "var(--error)", marginBottom: "1rem", fontSize: "0.875rem", textAlign: "center" }}>{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", padding: "0.875rem" }}>
            {loading ? "Signing in..." : role === "recruiter" ? "Enter Dashboard" : "Sign in"}
          </button>

          {role === "candidate" && (
            <p style={{ marginTop: "1.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Don&apos;t have an account? <Link href="/signup" style={{ color: "var(--primary)", fontWeight: 600 }}>Sign up</Link>
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
