"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getUser } from "@/lib/storage";
import { getTask, logEvent, runCode, aiChat, type Task } from "@/lib/api";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { 
  ssr: false, 
  loading: () => (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1a1f", color: "var(--text-tertiary)" }}>
      Loading editor...
    </div>
  ) 
});

type Message = { role: "user" | "assistant"; content: string };

export default function TaskWorkspacePage() {
  const params = useParams();
  const taskId = Number(params.taskId);
  const [task, setTask] = useState<Task | null>(null);
  const [code, setCode] = useState("");
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
  const prevLengthRef = useRef<number>(0);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "candidate") { window.location.href = "/login"; return; }
    candidateRef.current = { candidate_id: u.candidate_id, email: u.email };
    const storageKey = `code_${u.candidate_id}_${taskId}`;
    getTask(taskId).then(t => {
      setTask(t);
      const stored = typeof sessionStorage !== "undefined" ? sessionStorage.getItem(storageKey) : null;
      let initialCode: string;
      if (stored) {
        initialCode = stored;
        setCode(stored);
      } else {
        const name = t.title.toLowerCase();
        if (name.includes("palindrome")) {
          initialCode = "def is_palindrome(s):\n    # Write your solution here\n    pass\n";
        } else if (name.includes("fibonacci")) {
          initialCode = "def fibonacci(n):\n    # Write your solution here\n    pass\n";
        } else {
          initialCode = "def fizzbuzz(n):\n    # Write your solution here\n    pass\n";
        }
        setCode(initialCode);
      }
      prevLengthRef.current = initialCode.length;
    });
    logEvent(u.candidate_id, taskId, "task_started");
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [taskId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Track tab visibility (time spent outside the tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!candidateRef.current) return;
      
      if (document.hidden) {
        logEvent(candidateRef.current.candidate_id, taskId, "tab_hidden");
      } else {
        logEvent(candidateRef.current.candidate_id, taskId, "tab_visible");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [taskId]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    const v = value || "";
    const prevLen = prevLengthRef.current;
    const added = v.length - prevLen;
    prevLengthRef.current = v.length;
    setCode(v);
    if (typeof sessionStorage !== "undefined" && candidateRef.current) {
      sessionStorage.setItem(`code_${candidateRef.current.candidate_id}_${taskId}`, v);
    }
    if (candidateRef.current) {
      logEvent(candidateRef.current.candidate_id, taskId, "code_edit", { chars_added: added, chars: v.length });
      if (added >= 50) {
        // Extract the pasted content (last N characters added)
        const pastedContent = v.slice(-added);
        const contentPreview = pastedContent.length > 200 ? pastedContent.slice(0, 200) + "..." : pastedContent;
        logEvent(candidateRef.current.candidate_id, taskId, "large_paste", { 
          chars_added: added,
          content_preview: contentPreview
        });
      }
    }
  }, [taskId]);

  const handleRun = async () => {
    if (!candidateRef.current) return;
    setRunning(true);
    setOutput("Running...");
    try {
      const res = await runCode(candidateRef.current.candidate_id, taskId, code);
      setOutput(res.stderr ? `${res.stderr}` : res.stdout || "(No output)");
    } catch (e) {
      setOutput(e instanceof Error ? e.message : "Run failed");
    } finally {
      setRunning(false);
    }
  };

  const handleAskAI = async () => {
    if (!input.trim() || !task || aiLoading) return;
    const userPrompt = input.trim();
    const userMsg: Message = { role: "user", content: userPrompt };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setAiLoading(true);
    if (candidateRef.current) {
      logEvent(candidateRef.current.candidate_id, taskId, "ai_used", { prompt: userPrompt });
    }
    try {
      const res = await aiChat(task.title, task.description, newMessages, code);
      setMessages([...newMessages, { role: "assistant", content: res.error ? `Error: ${res.error}` : res.content }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Failed to get AI response. Please try again." }]);
    } finally {
      setAiLoading(false);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (!task) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-base)", color: "var(--text-tertiary)" }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite", marginRight: "0.5rem" }}>
        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
      </svg>
      Loading workspace...
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg-base)" }}>
      {/* Task Panel */}
      <aside style={{ 
        width: "300px", 
        borderRight: "1px solid var(--border)", 
        display: "flex", 
        flexDirection: "column", 
        background: "var(--bg-elevated)" 
      }}>
        <div style={{ padding: "var(--space-6)", borderBottom: "1px solid var(--border)" }}>
          <Link href="/dashboard" style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "var(--space-2)", 
            color: "var(--text-tertiary)", 
            fontSize: "0.8rem",
            marginBottom: "var(--space-4)",
            transition: "color 0.15s ease",
          }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-2)" }}>{task.title}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
            <span style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "var(--space-1)",
              padding: "var(--space-1) var(--space-2)",
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-sm)",
            }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {task.expected_time} min
            </span>
          </div>
        </div>

        <div style={{ flex: 1, padding: "var(--space-6)", overflowY: "auto" }}>
          <p className="text-label" style={{ marginBottom: "var(--space-2)" }}>Description</p>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>{task.description}</p>
        </div>

        <div style={{ padding: "var(--space-4)", borderTop: "1px solid var(--border)", background: "var(--bg-surface)" }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between", 
            marginBottom: "var(--space-4)",
            padding: "var(--space-3)",
            background: "var(--bg-input)",
            borderRadius: "var(--radius-sm)",
          }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>Time elapsed</span>
            <span style={{ fontSize: "0.9rem", fontWeight: 600, fontFamily: "monospace", color: "var(--text-primary)" }}>{formatTime(elapsed)}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <button onClick={() => setShowAI(!showAI)} className="btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {showAI ? "Hide AI" : "Ask AI"}
            </button>
            <Link href={`/submit?task=${taskId}`} className="btn-primary" style={{ width: "100%", justifyContent: "center", textDecoration: "none" }}>
              Submit Solution
            </Link>
          </div>
        </div>
      </aside>

      {/* Editor Area */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ flex: 1, minHeight: 0 }}>
          <MonacoEditor
            height="100%"
            language="python"
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{ 
              minimap: { enabled: false }, 
              fontSize: 14, 
              padding: { top: 20, bottom: 20 },
              lineHeight: 1.6,
              fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
              cursorBlinking: "smooth",
              smoothScrolling: true,
              renderLineHighlight: "gutter",
            }}
          />
        </div>

        {/* Terminal */}
        <div style={{ 
          height: "180px", 
          borderTop: "1px solid var(--border)", 
          background: "#0d0d10", 
          display: "flex", 
          flexDirection: "column" 
        }}>
          <div style={{ 
            padding: "var(--space-3) var(--space-4)", 
            borderBottom: "1px solid var(--border)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            background: "var(--bg-elevated)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Output</span>
            </div>
            <button onClick={handleRun} disabled={running} className="btn-secondary" style={{ 
              padding: "var(--space-2) var(--space-3)", 
              fontSize: "0.75rem",
              gap: "var(--space-2)",
            }}>
              {running ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                  </svg>
                  Running...
                </>
              ) : (
                <>
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Run Code
                </>
              )}
            </button>
          </div>
          <pre style={{ 
            flex: 1, 
            padding: "var(--space-4)", 
            margin: 0, 
            overflow: "auto", 
            fontSize: "0.8rem", 
            color: output.includes("Error") ? "#f87171" : "#e4e4e7", 
            fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
            lineHeight: 1.6,
          }}>
            {output || "Click 'Run Code' to execute your solution"}
          </pre>
        </div>
      </main>

      {/* AI Panel */}
      {showAI && (
        <aside style={{ 
          width: "360px", 
          borderLeft: "1px solid var(--border)", 
          display: "flex", 
          flexDirection: "column", 
          background: "var(--bg-elevated)" 
        }}>
          <div style={{ 
            padding: "var(--space-4) var(--space-5)", 
            borderBottom: "1px solid var(--border)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            background: "var(--bg-surface)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <div style={{ 
                width: "28px", 
                height: "28px", 
                background: "var(--primary-muted)", 
                borderRadius: "var(--radius-sm)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <svg width="14" height="14" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>AI Assistant</span>
            </div>
            <button onClick={() => setShowAI(false)} style={{ 
              background: "transparent", 
              color: "var(--text-tertiary)", 
              fontSize: "1.25rem", 
              padding: "var(--space-1)",
              lineHeight: 1,
              borderRadius: "var(--radius-sm)",
              transition: "color 0.15s ease",
            }}>
              ×
            </button>
          </div>

          <div style={{ flex: 1, overflow: "auto", padding: "var(--space-4)" }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: "center", padding: "var(--space-8) var(--space-4)" }}>
                <div style={{ 
                  width: "48px", 
                  height: "48px", 
                  background: "var(--bg-surface)", 
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto var(--space-4)",
                }}>
                  <svg width="24" height="24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "var(--space-2)" }}>Ask about the task</p>
                <p style={{ color: "var(--text-tertiary)", fontSize: "0.8rem", lineHeight: 1.5 }}>
                  I can help with syntax, algorithms, and hints—but won&apos;t give full solutions.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {messages.map((m, i) => (
                  <div key={i} style={{
                    padding: "var(--space-3) var(--space-4)",
                    borderRadius: "var(--radius-lg)",
                    background: m.role === "user" ? "var(--primary)" : "var(--bg-surface)",
                    border: m.role === "user" ? "none" : "1px solid var(--border)",
                    color: m.role === "user" ? "white" : "var(--text-primary)",
                    alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "88%",
                    fontSize: "0.875rem",
                    lineHeight: 1.6,
                  }}>
                    {m.content}
                  </div>
                ))}
                {aiLoading && (
                  <div style={{ 
                    padding: "var(--space-3) var(--space-4)", 
                    borderRadius: "var(--radius-lg)", 
                    background: "var(--bg-surface)", 
                    border: "1px solid var(--border)",
                    alignSelf: "flex-start", 
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    color: "var(--text-tertiary)", 
                    fontSize: "0.875rem" 
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                    </svg>
                    Thinking...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          <div style={{ padding: "var(--space-4)", borderTop: "1px solid var(--border)", background: "var(--bg-surface)" }}>
            <form onSubmit={(e) => { e.preventDefault(); handleAskAI(); }} style={{ display: "flex", gap: "var(--space-2)" }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about the task..."
                disabled={aiLoading}
                className="input"
                style={{ flex: 1 }}
              />
              <button type="submit" disabled={aiLoading || !input.trim()} className="btn-primary" style={{ padding: "var(--space-3)" }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </div>
        </aside>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}
