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
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--space-6)",
      background: "var(--bg-base)",
      position: "relative",
    }}>
      <div className="radial-glow" style={{ top: "20%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", opacity: 0.5 }} />
      
      <div className="glass-card animate-fade-in" style={{ width: "100%", maxWidth: "400px", padding: "var(--space-8)" }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-6)" }}>
            <div style={{ width: "28px", height: "28px", background: "var(--primary)", borderRadius: "var(--radius-sm)" }} />
            <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>HireWithAI</span>
          </Link>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "var(--space-2)" }}>Welcome back</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Sign in to continue to your workspace</p>
        </div>

        <div style={{ 
          display: "flex", 
          gap: "var(--space-1)", 
          marginBottom: "var(--space-6)", 
          background: "var(--bg-input)", 
          padding: "var(--space-1)", 
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)"
        }}>
          {(["candidate", "recruiter"] as const).map((r) => (
            <button 
              key={r} 
              type="button" 
              onClick={() => setRole(r)} 
              style={{
                flex: 1,
                padding: "var(--space-3)",
                borderRadius: "var(--radius-sm)",
                fontWeight: 500,
                fontSize: "0.875rem",
                background: role === r ? "var(--bg-surface)" : "transparent",
                color: role === r ? "var(--text-primary)" : "var(--text-tertiary)",
                border: role === r ? "1px solid var(--border)" : "1px solid transparent",
                textTransform: "capitalize",
                transition: "all 0.15s ease",
              }}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {role === "candidate" ? (
            <>
              <div style={{ marginBottom: "var(--space-4)" }}>
                <label className="text-label" style={{ display: "block", marginBottom: "var(--space-2)" }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                  className="input"
                />
              </div>
              <div style={{ marginBottom: "var(--space-6)" }}>
                <label className="text-label" style={{ display: "block", marginBottom: "var(--space-2)" }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="input"
                />
              </div>
            </>
          ) : (
            <div style={{ 
              padding: "var(--space-5)", 
              background: "var(--primary-muted)", 
              borderRadius: "var(--radius-md)", 
              border: "1px solid rgba(99, 102, 241, 0.2)",
              marginBottom: "var(--space-6)",
              textAlign: "center"
            }}>
              <p style={{ color: "var(--primary)", fontWeight: 500, fontSize: "0.9rem" }}>Recruiter access enabled</p>
              <p style={{ color: "var(--text-tertiary)", fontSize: "0.8rem", marginTop: "var(--space-1)" }}>No login required for demo</p>
            </div>
          )}

          {error && (
            <p style={{ 
              color: "var(--error)", 
              marginBottom: "var(--space-4)", 
              fontSize: "0.875rem", 
              textAlign: "center",
              padding: "var(--space-3)",
              background: "var(--error-muted)",
              borderRadius: "var(--radius-sm)"
            }}>{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", padding: "var(--space-4)" }}>
            {loading ? "Signing in..." : role === "recruiter" ? "Continue to Dashboard" : "Sign in"}
          </button>

          {role === "candidate" && (
            <p style={{ marginTop: "var(--space-6)", textAlign: "center", color: "var(--text-tertiary)", fontSize: "0.875rem" }}>
              Don&apos;t have an account?{" "}
              <Link href="/signup" style={{ color: "var(--primary)", fontWeight: 500 }}>Create one</Link>
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
