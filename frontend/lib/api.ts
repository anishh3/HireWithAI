const API = "/api";

export type AuthResponse = { candidate_id: number | null; email: string; role: "candidate" | "recruiter" };
export type Task = { id: number; title: string; description: string; expected_time: number; submitted?: boolean; tests_passed?: number | null; tests_total?: number | null };

export async function signup(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Sign up failed");
  }
  return res.json();
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API}/auth/login/candidate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Login failed");
  }
  return res.json();
}

export async function getTasks(candidateId?: number): Promise<Task[]> {
  const url = candidateId != null ? `${API}/tasks?candidate_id=${candidateId}` : `${API}/tasks`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

export async function getTask(taskId: number): Promise<Task> {
  const res = await fetch(`${API}/tasks/${taskId}`);
  if (!res.ok) throw new Error("Failed to fetch task");
  return res.json();
}

export async function logEvent(candidateId: number, taskId: number, eventType: string, metadata?: Record<string, unknown>) {
  await fetch(`${API}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidate_id: candidateId, task_id: taskId, event_type: eventType, metadata }),
  });
}

export async function submit(candidateId: number, taskId: number, finalCode: string, reflection: string) {
  const res = await fetch(`${API}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidate_id: candidateId, task_id: taskId, final_code: finalCode, reflection }),
  });
  if (!res.ok) throw new Error("Submit failed");
  return res.json();
}

export async function submitCode(candidateId: number, taskId: number, code: string): Promise<{ passed: number; total: number; details: string }> {
  const res = await fetch(`${API}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidate_id: candidateId, task_id: taskId, final_code: code, reflection: "" }),
  });
  if (!res.ok) throw new Error("Submit failed");
  const data = await res.json();
  // Transform response to match frontend expectations
  const details = data.run_error 
    ? `Error: ${data.run_error}` 
    : data.results?.map((r: { input: unknown; expected: unknown; actual: unknown; passed: boolean }) => 
        `Input: ${JSON.stringify(r.input)} → ${r.passed ? '✓' : '✗'} ${r.passed ? '' : `Expected: ${JSON.stringify(r.expected)}, Got: ${JSON.stringify(r.actual)}`}`
      ).join('\n') || '';
  return { passed: data.tests_passed, total: data.tests_total, details };
}

export async function runCode(candidateId: number, taskId: number, code: string) {
  const res = await fetch(`${API}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidate_id: candidateId, task_id: taskId, code }),
  });
  if (!res.ok) throw new Error("Run failed");
  return res.json();
}

export async function getEmployerView(candidateId: number, taskId: number) {
  const res = await fetch(`${API}/employer/${candidateId}/${taskId}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export async function getRecruiterCandidates() {
  const res = await fetch(`${API}/recruiter/candidates`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load candidates");
  return res.json();
}

// Alias for backward compatibility
export const getCandidates = getRecruiterCandidates;

export async function aiChat(taskTitle: string, taskDescription: string, messages: { role: string; content: string }[], currentCode?: string) {
  const res = await fetch(`${API}/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task_title: taskTitle, task_description: taskDescription, messages, current_code: currentCode }),
  });
  if (!res.ok) throw new Error("AI chat failed");
  return res.json();
}
