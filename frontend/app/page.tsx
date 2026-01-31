"use client";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div style={{ background: "var(--bg-main)", minHeight: "100vh" }}>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, height: "80px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 10%", zIndex: 1000, background: "rgba(10, 10, 15, 0.8)", backdropFilter: "blur(10px)",
      }}>
        <div style={{ fontSize: "1.5rem", fontWeight: 900, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, var(--primary), var(--accent))", borderRadius: "8px" }} />
          HireWithAI
        </div>
        <Link href="/login" className="btn-primary">Get Started</Link>
      </nav>

      <section style={{ paddingTop: "180px", paddingBottom: "100px", textAlign: "center", position: "relative" }}>
        <div className="radial-glow" style={{ top: "-50px", left: "50%", transform: "translateX(-50%)", width: "800px", height: "500px", opacity: 0.5 }} />
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 2rem", position: "relative" }}>
          <h1 style={{ fontSize: "4rem", lineHeight: 1.1, marginBottom: "1.5rem", fontWeight: 900 }}>
            Hire based on<br />
            <span style={{ background: "linear-gradient(to right, #818cf8, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>how they work.</span>
          </h1>
          <p style={{ fontSize: "1.25rem", color: "var(--text-muted)", marginBottom: "2.5rem", maxWidth: "600px", margin: "0 auto 2.5rem" }}>
            The first technical hiring platform that captures developer workflow signals, not just code correctness.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <Link href="/login" className="btn-primary" style={{ padding: "1rem 2rem", fontSize: "1.1rem" }}>Start Free Assessment</Link>
            <Link href="/login" className="btn-secondary" style={{ padding: "1rem 2rem", fontSize: "1.1rem" }}>View Demo</Link>
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 10%" }}>
        <h2 style={{ fontSize: "2.5rem", textAlign: "center", marginBottom: "4rem" }}>Built for modern hiring</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
          {[
            { icon: "⚡", title: "Workflow DNA", desc: "Track keystrokes, edits, and run cycles to understand problem-solving logic." },
            { icon: "🤖", title: "AI-Native Insights", desc: "Differentiate between copy-pasting and strategic AI leverage." },
            { icon: "🧠", title: "Behavioral Analysis", desc: "Synthesize signals into a readable working-style report." },
          ].map((f, i) => (
            <div key={i} className="glass-card" style={{ padding: "2rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{f.icon}</div>
              <h3 style={{ fontSize: "1.25rem", marginBottom: "0.75rem", fontWeight: 700 }}>{f.title}</h3>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ padding: "40px 10%", borderTop: "1px solid var(--border)", textAlign: "center", color: "var(--text-dim)" }}>
        © 2026 HireWithAI. All rights reserved.
      </footer>
    </div>
  );
}
