"use client";
import { useEffect, useState } from "react";
import { getUser } from "@/lib/storage";
import Sidebar from "@/components/Sidebar";

export default function SettingsPage() {
  const [user, setUser] = useState<{ email?: string; role?: string } | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) { window.location.href = "/login"; return; }
    setUser(u);
  }, []);

  if (!user) return null;

  return (
    <div className="app-layout">
      <Sidebar role={user.role as "candidate" | "recruiter" || "candidate"} />
      <main className="main-content">
        <div style={{ maxWidth: "600px" }}>
          <div style={{ marginBottom: "var(--space-8)" }}>
            <h1 className="heading-lg" style={{ marginBottom: "var(--space-2)" }}>Settings</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Manage your account preferences</p>
          </div>

          <div className="card animate-fade-in" style={{ padding: "var(--space-6)" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "var(--space-6)" }}>Profile</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
              <div>
                <label className="text-label" style={{ display: "block", marginBottom: "var(--space-2)" }}>Email</label>
                <div style={{ 
                  padding: "var(--space-3) var(--space-4)", 
                  background: "var(--bg-surface)", 
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                }}>
                  {user.email || "N/A"}
                </div>
              </div>
              
              <div>
                <label className="text-label" style={{ display: "block", marginBottom: "var(--space-2)" }}>Account Type</label>
                <div style={{ 
                  padding: "var(--space-3) var(--space-4)", 
                  background: "var(--bg-surface)", 
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                  textTransform: "capitalize",
                }}>
                  {user.role || "candidate"}
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: "var(--space-6)", marginTop: "var(--space-4)" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "var(--space-4)" }}>Preferences</h2>
            <p style={{ color: "var(--text-tertiary)", fontSize: "0.875rem" }}>
              Additional settings coming soon.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
