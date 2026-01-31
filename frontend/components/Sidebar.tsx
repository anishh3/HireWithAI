"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clearUser } from "@/lib/storage";

const candidateNav = [
  { label: "Dashboard", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { label: "Submissions", href: "/submissions", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { label: "Settings", href: "/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

export default function Sidebar({ role }: { role: "candidate" | "recruiter" }) {
  const pathname = usePathname();

  const handleLogout = () => {
    clearUser();
    window.location.href = "/login";
  };

  const nav = role === "candidate" ? candidateNav : [];

  return (
    <aside style={{
      width: "220px",
      padding: "var(--space-6) var(--space-4)",
      borderRight: "1px solid var(--border)",
      background: "var(--bg-elevated)",
      display: "flex",
      flexDirection: "column",
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-10)" }}>
        <div style={{ width: "24px", height: "24px", background: "var(--primary)", borderRadius: "var(--radius-sm)" }} />
        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>HireWithAI</span>
      </Link>

      <nav style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", flex: 1 }}>
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "var(--space-3)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: active ? "var(--text-primary)" : "var(--text-tertiary)",
              background: active ? "rgba(255,255,255,0.04)" : "transparent",
              borderLeft: active ? "2px solid var(--primary)" : "2px solid transparent",
              marginLeft: "-2px",
              transition: "all 0.15s ease",
            }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ opacity: active ? 1 : 0.7 }}>
                <path d={item.icon} />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button onClick={handleLogout} style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "var(--space-3)",
        background: "transparent",
        color: "var(--text-tertiary)",
        fontSize: "0.875rem",
        fontWeight: 500,
        borderRadius: "var(--radius-sm)",
        transition: "color 0.15s ease",
        width: "100%",
        textAlign: "left",
      }}>
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ opacity: 0.7 }}>
          <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Sign out
      </button>
    </aside>
  );
}
