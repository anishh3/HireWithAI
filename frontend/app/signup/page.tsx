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
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1.5rem", background: "var(--bg-main)", position: "relative",
    }}>
      <div className="radial-glow" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "600px", height: "600px", opacity: 0.3 }} />
      
      <div className="glass-card animate-slide-up" style={{ width: "100%", maxWidth: "420px", padding: "3rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: "56px", height: "56px", background: "linear-gradient(135deg, var(--primary), var(--accent))", borderRadius: "14px", margin: "0 auto 1.5rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem" }}>✨</div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.5rem" }}>Create account</h1>
          <p style={{ color: "var(--text-muted)" }}>Sign up to start your assessment</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase" }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@company.com" style={{
              width: "100%", padding: "0.875rem 1rem", borderRadius: "10px", border: "1px solid var(--border)",
              background: "var(--bg-input)", color: "white", fontSize: "1rem",
            }} />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase" }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="At least 6 characters" style={{
              width: "100%", padding: "0.875rem 1rem", borderRadius: "10px", border: "1px solid var(--border)",
              background: "var(--bg-input)", color: "white", fontSize: "1rem",
            }} />
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase" }}>Confirm Password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required placeholder="••••••••" style={{
              width: "100%", padding: "0.875rem 1rem", borderRadius: "10px", border: "1px solid var(--border)",
              background: "var(--bg-input)", color: "white", fontSize: "1rem",
            }} />
          </div>

          {error && <p style={{ color: "var(--error)", marginBottom: "1rem", fontSize: "0.875rem", textAlign: "center" }}>{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", padding: "0.875rem" }}>
            {loading ? "Creating account..." : "Sign up"}
          </button>

          <p style={{ marginTop: "1.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Already have an account? <Link href="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>Sign in</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
