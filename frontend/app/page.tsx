"use client";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div style={{ background: "var(--bg-base)", minHeight: "100vh", overflow: "hidden", position: "relative" }}>
      {/* Background Glows */}
      <div className="radial-glow" style={{ top: "-20%", right: "-10%", width: "60vw", height: "60vw", opacity: 0.4 }} />
      <div className="radial-glow" style={{ bottom: "-20%", left: "-10%", width: "50vw", height: "50vw", opacity: 0.3 }} />

      {/* Decorative Grid Pattern */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
        pointerEvents: "none",
      }} />

      {/* Large Concentric Circles - Top Left */}
      <svg style={{ position: "absolute", top: "8%", left: "3%", opacity: 0.35 }} width="200" height="200" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="95" stroke="white" strokeWidth="2" />
        <circle cx="100" cy="100" r="65" stroke="white" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="35" stroke="white" strokeWidth="1" />
      </svg>

      {/* Nested Squares - Top Right */}
      <svg style={{ position: "absolute", top: "12%", right: "5%", opacity: 0.3 }} width="150" height="150" viewBox="0 0 150 150" fill="none">
        <rect x="5" y="5" width="140" height="140" stroke="white" strokeWidth="2" />
        <rect x="30" y="30" width="90" height="90" stroke="white" strokeWidth="1.5" />
        <rect x="55" y="55" width="40" height="40" stroke="white" strokeWidth="1" />
      </svg>

      {/* Diamond - Bottom Left */}
      <svg style={{ position: "absolute", bottom: "20%", left: "2%", opacity: 0.25 }} width="220" height="220" viewBox="0 0 220 220" fill="none">
        <path d="M110 10 L210 110 L110 210 L10 110 Z" stroke="white" strokeWidth="2" />
        <path d="M110 50 L170 110 L110 170 L50 110 Z" stroke="white" strokeWidth="1.5" />
      </svg>

      {/* Hexagon - Bottom Right */}
      <svg style={{ position: "absolute", bottom: "10%", right: "3%", opacity: 0.28 }} width="200" height="200" viewBox="0 0 200 200" fill="none">
        <polygon points="100,5 185,50 185,150 100,195 15,150 15,50" stroke="white" strokeWidth="2" fill="none" />
        <polygon points="100,40 155,70 155,130 100,160 45,130 45,70" stroke="white" strokeWidth="1.5" fill="none" />
      </svg>

      {/* Triangle - Middle Left */}
      <svg style={{ position: "absolute", top: "45%", left: "5%", opacity: 0.3 }} width="120" height="120" viewBox="0 0 120 120" fill="none">
        <polygon points="60,10 110,100 10,100" stroke="white" strokeWidth="2" fill="none" />
        <polygon points="60,35 85,85 35,85" stroke="white" strokeWidth="1.5" fill="none" />
      </svg>

      {/* Horizontal accent lines */}
      <div style={{
        position: "absolute",
        top: "35%",
        left: "0",
        width: "300px",
        height: "2px",
        background: "linear-gradient(90deg, rgba(255,255,255,0.4), transparent)",
      }} />
      <div style={{
        position: "absolute",
        top: "65%",
        right: "0",
        width: "350px",
        height: "2px",
        background: "linear-gradient(270deg, rgba(255,255,255,0.35), transparent)",
      }} />
      <div style={{
        position: "absolute",
        top: "80%",
        left: "0",
        width: "200px",
        height: "1px",
        background: "linear-gradient(90deg, rgba(255,255,255,0.25), transparent)",
      }} />

      {/* Floating dots */}
      {[
        { top: "20%", left: "25%", size: 10 },
        { top: "30%", right: "20%", size: 8 },
        { top: "50%", left: "18%", size: 12 },
        { top: "65%", right: "12%", size: 10 },
        { top: "40%", left: "90%", size: 8 },
        { top: "75%", left: "28%", size: 10 },
        { top: "12%", left: "50%", size: 6 },
        { top: "88%", right: "40%", size: 8 },
        { top: "55%", right: "25%", size: 6 },
        { top: "25%", left: "40%", size: 5 },
      ].map((dot, i) => (
        <div key={i} style={{
          position: "absolute",
          top: dot.top,
          left: dot.left,
          right: dot.right,
          width: dot.size,
          height: dot.size,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.35)",
        }} />
      ))}

      {/* Cross marks */}
      <svg style={{ position: "absolute", top: "55%", left: "12%", opacity: 0.4 }} width="40" height="40" viewBox="0 0 40 40">
        <line x1="0" y1="20" x2="40" y2="20" stroke="white" strokeWidth="2" />
        <line x1="20" y1="0" x2="20" y2="40" stroke="white" strokeWidth="2" />
      </svg>
      <svg style={{ position: "absolute", top: "25%", right: "15%", opacity: 0.35 }} width="35" height="35" viewBox="0 0 35 35">
        <line x1="0" y1="17.5" x2="35" y2="17.5" stroke="white" strokeWidth="2" />
        <line x1="17.5" y1="0" x2="17.5" y2="35" stroke="white" strokeWidth="2" />
      </svg>
      <svg style={{ position: "absolute", bottom: "30%", right: "28%", opacity: 0.3 }} width="30" height="30" viewBox="0 0 30 30">
        <line x1="0" y1="15" x2="30" y2="15" stroke="white" strokeWidth="1.5" />
        <line x1="15" y1="0" x2="15" y2="30" stroke="white" strokeWidth="1.5" />
      </svg>

      {/* Corner brackets */}
      <svg style={{ position: "absolute", top: "32%", left: "20%", opacity: 0.4 }} width="50" height="50" viewBox="0 0 50 50" fill="none">
        <path d="M0 20 L0 0 L20 0" stroke="white" strokeWidth="2" />
        <path d="M30 50 L50 50 L50 30" stroke="white" strokeWidth="2" />
      </svg>
      <svg style={{ position: "absolute", bottom: "35%", right: "15%", opacity: 0.35 }} width="50" height="50" viewBox="0 0 50 50" fill="none">
        <path d="M30 0 L50 0 L50 20" stroke="white" strokeWidth="2" />
        <path d="M0 30 L0 50 L20 50" stroke="white" strokeWidth="2" />
      </svg>

      {/* Small decorative squares */}
      <div style={{ position: "absolute", top: "18%", left: "35%", width: "15px", height: "15px", border: "2px solid rgba(255,255,255,0.35)", transform: "rotate(45deg)" }} />
      <div style={{ position: "absolute", top: "70%", right: "35%", width: "12px", height: "12px", border: "2px solid rgba(255,255,255,0.3)", transform: "rotate(45deg)" }} />
      <div style={{ position: "absolute", top: "42%", right: "8%", width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.25)", transform: "rotate(45deg)" }} />

      {/* Navigation */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, height: "72px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 6%", zIndex: 1000, 
        background: "rgba(9, 9, 11, 0.8)", 
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)"
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <div style={{ 
            width: "32px", height: "32px", 
            background: "var(--primary)", 
            borderRadius: "var(--radius-md)",
          }} />
          <span style={{ fontSize: "1.125rem", fontWeight: 700, letterSpacing: "-0.02em" }}>HireWithAI</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-6)" }}>
          <Link href="/login" style={{ color: "var(--text-tertiary)", fontWeight: 500, fontSize: "0.9rem", transition: "color 0.15s" }}>Sign in</Link>
          <Link href="/signup" className="btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: "180px", paddingBottom: "120px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 var(--space-6)" }}>
          <div className="animate-fade-in" style={{ 
            display: "inline-flex", 
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "var(--space-2) var(--space-4)", 
            borderRadius: "100px", 
            background: "var(--primary-muted)", 
            border: "1px solid rgba(99, 102, 241, 0.2)",
            color: "var(--primary)", 
            fontSize: "0.75rem", 
            fontWeight: 600, 
            marginBottom: "var(--space-8)",
            textTransform: "uppercase", 
            letterSpacing: "0.05em"
          }}>
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            The future of technical assessments
          </div>
          
          <h1 className="animate-fade-in" style={{ 
            fontSize: "clamp(2.5rem, 6vw, 4rem)", 
            fontWeight: 700, 
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            marginBottom: "var(--space-6)", 
            color: "var(--text-primary)" 
          }}>
            Hire based on<br />
            <span style={{ color: "var(--text-secondary)" }}>how they solve problems.</span>
          </h1>
          
          <p className="animate-fade-in" style={{ 
            fontSize: "1.125rem", 
            color: "var(--text-tertiary)", 
            marginBottom: "var(--space-8)", 
            maxWidth: "560px", 
            margin: "0 auto var(--space-8)", 
            lineHeight: 1.7 
          }}>
            Move beyond simple pass/fail tests. Capture workflow signals, AI usage patterns, and iterative logic to find the best talent.
          </p>
          
          <div className="animate-fade-in" style={{ display: "flex", gap: "var(--space-4)", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/signup" className="btn-primary" style={{ padding: "var(--space-4) var(--space-8)", fontSize: "1rem" }}>
              Start Free Assessment
            </Link>
            <Link href="/login" className="btn-secondary" style={{ padding: "var(--space-4) var(--space-8)", fontSize: "1rem" }}>
              Recruiter Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "80px 6%", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-12)" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "var(--space-3)", letterSpacing: "-0.02em" }}>High-signal hiring</h2>
          <p style={{ color: "var(--text-tertiary)", fontSize: "1rem" }}>Everything you need to evaluate modern developers.</p>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--space-6)", maxWidth: "1000px", margin: "0 auto" }}>
          {[
            { 
              icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
              title: "Workflow DNA", 
              desc: "Track every keystroke and run cycle to visualize the candidate's thought process and problem-solving approach." 
            },
            { 
              icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
              title: "AI-Native Analysis", 
              desc: "Understand how candidates leverage AI tools versus writing manual logic during their assessment." 
            },
            { 
              icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>,
              title: "Behavioral Insights", 
              desc: "Generate deep reports on problem-solving style, persistence, and refinement patterns." 
            },
          ].map((f, i) => (
            <div key={i} className="card card-hover animate-fade-in" style={{ padding: "var(--space-8)", position: "relative", overflow: "hidden" }}>
              {/* Corner accent */}
              <div style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "120px",
                height: "120px",
                background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)",
                pointerEvents: "none",
              }} />
              <div style={{ 
                width: "48px", height: "48px", 
                background: "var(--primary-muted)", 
                borderRadius: "var(--radius-md)", 
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--primary)",
                marginBottom: "var(--space-5)",
                position: "relative",
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "var(--space-3)" }}>{f.title}</h3>
              <p style={{ color: "var(--text-tertiary)", lineHeight: 1.7, fontSize: "0.9rem" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        padding: "var(--space-10) 6%", 
        borderTop: "1px solid var(--border)", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        color: "var(--text-muted)", 
        fontSize: "0.85rem",
        background: "var(--bg-elevated)",
        flexWrap: "wrap",
        gap: "var(--space-4)",
        position: "relative",
        zIndex: 1,
      }}>
        <div>© 2026 HireWithAI. Built for the modern web.</div>
        <div style={{ display: "flex", gap: "var(--space-6)" }}>
          <Link href="#" style={{ color: "var(--text-tertiary)", transition: "color 0.15s" }}>Twitter</Link>
          <Link href="#" style={{ color: "var(--text-tertiary)", transition: "color 0.15s" }}>LinkedIn</Link>
          <Link href="#" style={{ color: "var(--text-tertiary)", transition: "color 0.15s" }}>Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
