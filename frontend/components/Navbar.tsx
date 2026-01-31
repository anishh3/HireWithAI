"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getUser, clearUser } from "@/lib/storage";

export default function Navbar() {
  const [user, setUser] = useState<{ email?: string; role?: string } | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleLogout = () => {
    clearUser();
    window.location.href = "/login";
  };

  if (!user) return null;

  return (
    <nav style={{
      height: "56px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 var(--space-6)",
      borderBottom: "1px solid var(--border)",
      background: "var(--bg-elevated)",
    }}>
      <Link href={user.role === "recruiter" ? "/recruiter" : "/dashboard"} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <div style={{ width: "24px", height: "24px", background: "var(--primary)", borderRadius: "var(--radius-sm)" }} />
        <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-secondary)" }}>HireWithAI</span>
      </Link>
      
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>{user.email || user.role}</span>
        <button onClick={handleLogout} className="btn-secondary" style={{ padding: "var(--space-2) var(--space-3)", fontSize: "0.8rem" }}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
