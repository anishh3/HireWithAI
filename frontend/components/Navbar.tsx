"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUser, clearUser } from "@/lib/storage";

export default function Navbar() {
  const pathname = usePathname();
  const user = getUser();

  if (!user || pathname === "/" || pathname === "/login" || pathname === "/signup") return null;

  return (
    <nav style={{
      height: "60px",
      borderBottom: "1px solid var(--border)",
      background: "var(--bg-card)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 2rem",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <Link href="/" style={{ fontSize: "1.25rem", fontWeight: 700 }}>HireWithAI</Link>
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <Link href={user.role === "recruiter" ? "/recruiter" : "/dashboard"} style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
          {user.role === "recruiter" ? "Dashboard" : "Tasks"}
        </Link>
        <button
          onClick={() => { clearUser(); window.location.href = "/login"; }}
          style={{
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--text-main)",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "var(--bg-input)",
          }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
