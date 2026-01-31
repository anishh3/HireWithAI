"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getUser } from "@/lib/storage";
import { getTask, logEvent, runCode, aiChat, type Task } from "@/lib/api";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false, loading: () => <div style={{ padding: "2rem", color: "var(--text-muted)" }}>Loading editor...</div> });

type Message = { role: "user" | "assistant"; content: string };

export default function TaskWorkspacePage() {
  const params = useParams();
  const taskId = Number(params.taskId);
  const [task, setTask] = useState<Task | null>(null);
  const [code, setCode] = useState("def fizzbuzz(n):\n    # Write your solution here\n    pass\n");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showAI, setShowAI] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const candidateRef = useRef<{ candidate_id: number; email: string } | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "candidate") { window.location.href = "/login"; return; }
    candidateRef.current = { candidate_id: u.candidate_id, email: u.email };
    getTask(taskId).then(setTask);
    logEvent(u.candidate_id, taskId, "task_started");
    startTimeRef.current = Date.now();

    const stored = typeof sessionStorage !== "undefined" ? sessionStorage.getItem(`code_${taskId}`) : null;
    if (stored) setCode(stored);

    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [taskId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    const v = value || "";
    setCode(v);
    if (typeof sessionStorage !== "undefined") sessionStorage.setItem(`code_${taskId}`, v);
    if (candidateRef.current) {
      logEvent(candidateRef.current.candidate_id, taskId, "code_edit", { chars: v.length });
    }
  }, [taskId]);

  const handleRun = async () => {
    if (!candidateRef.current) return;
    setRunning(true);
    setOutput("Running...");
    try {
      const res = await runCode(candidateRef.current.candidate_id, taskId, code);
      setOutput(res.stderr ? `Error:\n${res.stderr}` : res.stdout || "(No output)");
    } catch (e) {
      setOutput(e instanceof Error ? e.message : "Run failed");
    } finally {
      setRunning(false);
    }
  };

  const handleAskAI = async () => {
    if (!input.trim() || !task || aiLoading) return;
    
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setAiLoading(true);

    // Log AI usage
    if (candidateRef.current) {
      logEvent(candidateRef.current.candidate_id, taskId, "ai_used");
    }

    try {
      const res = await aiChat(task.title, task.description, newMessages);
      if (res.error) {
        setMessages([...newMessages, { role: "assistant", content: `Error: ${res.error}` }]);
      } else {
        setMessages([...newMessages, { role: "assistant", content: res.content }]);
      }
    } catch (e) {
      setMessages([...newMessages, { role: "assistant", content: "Failed to get AI response. Please try again." }]);
    } finally {
      setAiLoading(false);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (!task) return <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>;

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)" }}>
      {/* Left Sidebar */}
      <aside style={{ width: "280px", borderRight: "1px solid var(--border)", padding: "1.5rem", display: "flex", flexDirection: "column", background: "var(--bg-card)" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>{task.title}</h2>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>Expected: {task.expected_time} min</p>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.6, flex: 1 }}>{task.description}</p>
        
        <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>Elapsed: {formatTime(elapsed)}</p>
          <button onClick={() => setShowAI(!showAI)} className="btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
            {showAI ? "Hide AI" : "🤖 Ask AI"}
          </button>
          <Link href={`/submit?task=${taskId}`} className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>Submit</Link>
        </div>
      </aside>

      {/* Main Editor Area */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ flex: 1, minHeight: 0 }}>
          <MonacoEditor
            height="100%"
            language="python"
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }}
          />
        </div>
        <div style={{ height: "180px", borderTop: "1px solid var(--border)", background: "#1e1e1e", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "0.5rem 1rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Terminal</span>
            <button onClick={handleRun} disabled={running} className="btn-secondary" style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem" }}>
              {running ? "Running..." : "▶ Run"}
            </button>
          </div>
          <pre style={{ flex: 1, padding: "1rem", margin: 0, overflow: "auto", fontSize: "0.8rem", color: "#d4d4d4", fontFamily: "monospace" }}>{output || "Click Run to execute your code"}</pre>
        </div>
      </main>

      {/* AI Chat Panel */}
      {showAI && (
        <aside style={{ width: "340px", borderLeft: "1px solid var(--border)", display: "flex", flexDirection: "column", background: "var(--bg-card)" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.25rem" }}>🤖</span>
              <span style={{ fontWeight: 600 }}>AI Assistant</span>
            </div>
            <button onClick={() => setShowAI(false)} style={{ background: "none", color: "var(--text-muted)", fontSize: "1.25rem", padding: "0.25rem" }}>×</button>
          </div>

          <div style={{ flex: 1, overflow: "auto", padding: "1rem" }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem 1rem", color: "var(--text-dim)" }}>
                <p style={{ marginBottom: "0.5rem" }}>Ask questions about the task.</p>
                <p style={{ fontSize: "0.8rem" }}>I can help with syntax, algorithms, and hints - but won't give you the full solution.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {messages.map((m, i) => (
                  <div key={i} style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "12px",
                    background: m.role === "user" ? "var(--primary)" : "var(--bg-input)",
                    color: m.role === "user" ? "white" : "var(--text-main)",
                    alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "90%",
                    fontSize: "0.875rem",
                    lineHeight: 1.5,
                  }}>
                    {m.content}
                  </div>
                ))}
                {aiLoading && (
                  <div style={{ padding: "0.75rem 1rem", borderRadius: "12px", background: "var(--bg-input)", alignSelf: "flex-start", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                    Thinking...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          <div style={{ padding: "1rem", borderTop: "1px solid var(--border)" }}>
            <form onSubmit={(e) => { e.preventDefault(); handleAskAI(); }} style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about the task..."
                disabled={aiLoading}
                style={{
                  flex: 1,
                  padding: "0.75rem 1rem",
                  borderRadius: "10px",
                  border: "1px solid var(--border)",
                  background: "var(--bg-input)",
                  color: "white",
                  fontSize: "0.875rem",
                }}
              />
              <button type="submit" disabled={aiLoading || !input.trim()} className="btn-primary" style={{ padding: "0.75rem 1rem" }}>
                Send
              </button>
            </form>
          </div>
        </aside>
      )}
    </div>
  );
}
