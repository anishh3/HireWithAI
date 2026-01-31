const USER_KEY = "hirewithai_user";

export type StoredUser = { role: "candidate"; candidate_id: number; email: string } | { role: "recruiter" };

export function getUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const s = localStorage.getItem(USER_KEY);
  if (!s) return null;
  try {
    const parsed = JSON.parse(s);
    if (parsed?.role === "candidate" && parsed.candidate_id && parsed.email) return parsed;
    if (parsed?.role === "recruiter") return { role: "recruiter" };
    return null;
  } catch { return null; }
}

export function getCandidate() {
  const u = getUser();
  return u?.role === "candidate" ? { candidate_id: u.candidate_id, email: u.email } : null;
}

export function setCandidate(c: { candidate_id: number; email: string }) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify({ role: "candidate", ...c }));
}

export function setRecruiter() {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify({ role: "recruiter" }));
}

export function clearUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_KEY);
  // Clear all code storage to prevent leaking between accounts
  sessionStorage.clear();
}
