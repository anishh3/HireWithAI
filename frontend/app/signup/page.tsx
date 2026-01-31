"use client";
import { useState } from "react";
import Link from "next/link";
import { signup } from "@/lib/api";
import { setCandidate } from "@/lib/storage";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }

    setLoading(true);
    try {
      const res = await signup(email.trim(), password);
      setCandidate({ candidate_id: res.candidate_id!, email: res.email });
      window.location.href = "/dashboard";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign up failed");
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
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "var(--space-2)" }}>Create your account</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Get started with your assessment</p>
        </div>

        <form onSubmit={handleSubmit}>
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
          <div style={{ marginBottom: "var(--space-4)" }}>
            <label className="text-label" style={{ display: "block", marginBottom: "var(--space-2)" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="input"
            />
          </div>
          <div style={{ marginBottom: "var(--space-6)" }}>
            <label className="text-label" style={{ display: "block", marginBottom: "var(--space-2)" }}>Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              placeholder="••••••••"
              className="input"
            />
          </div>

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
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p style={{ marginTop: "var(--space-6)", textAlign: "center", color: "var(--text-tertiary)", fontSize: "0.875rem" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--primary)", fontWeight: 500 }}>Sign in</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
