import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm the KMIT Club Hub assistant 👋\nAsk me anything about clubs, events, or how to use this platform!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: "user", content: trimmed };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const history = updated
        .slice(1)
        .map((m) => ({ role: m.role, content: m.content }));

      const { data } = await axios.post("/api/chat", { messages: history });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble right now. Please try again!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestion = (q) => {
    const userMsg = { role: "user", content: q };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);

    const history = updated
      .slice(1)
      .map((m) => ({ role: m.role, content: m.content }));

    axios
      .post("/api/chat", { messages: history })
      .then(({ data }) => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      })
      .catch(() => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, please try again!" },
        ]);
      })
      .finally(() => setLoading(false));
  };

  const suggestions = [
    "Which club should I join?",
    "How do I join a club?",
    "Tell me about Recurse",
    "What is Mudra club?",
  ];

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>

      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "fixed",
          bottom: "28px",
          right: "28px",
          zIndex: 9999,
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "#1a1a1a",
          color: "white",
          border: "2px solid #444444",
          cursor: "pointer",
          fontSize: "24px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
        }}
        title="Chat with KMIT Club Hub Assistant"
      >
        {open ? "✕" : "🤖"}
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "100px",
            right: "28px",
            zIndex: 9999,
            width: "370px",
            maxWidth: "calc(100vw - 48px)",
            borderRadius: "20px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
            border: "1px solid #2a2a2a",
            backgroundColor: "#111111",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily: "inherit",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div style={{ width: "38px", height: "38px", borderRadius: "50%", backgroundColor: "rgba(255, 255, 255, 0.2)", border: "1px solid rgba(255, 255, 255, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
              🤖
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#ffffff", fontWeight: 600, fontSize: "14px" }}>Club Hub Assistant</div>
              <div style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "11px", marginTop: "2px" }}>Ask about any of the 12 KMIT clubs</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
              <span style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "11px" }}>Online</span>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "14px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              maxHeight: "340px",
              minHeight: "200px",
              backgroundColor: "#ffffff",
            }}
          >
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: "8px" }}>
                {m.role === "assistant" && (
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "rgba(102, 126, 234, 0.1)", border: "1px solid rgba(102, 126, 234, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>🤖</div>
                )}
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "10px 14px",
                    borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    backgroundColor: m.role === "user" ? "#667eea" : "#f0f0f0",
                    color: m.role === "user" ? "#ffffff" : "#333333",
                    fontSize: "13px",
                    lineHeight: "1.6",
                    whiteSpace: "pre-wrap",
                    border: m.role === "assistant" ? "1px solid rgba(102, 126, 234, 0.1)" : "none",
                  }}
                >
                  {m.content}
                </div>
                {m.role === "user" && (
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "rgba(102, 126, 234, 0.2)", border: "1px solid rgba(102, 126, 234, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>👤</div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-end", gap: "8px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "rgba(102, 126, 234, 0.1)", border: "1px solid rgba(102, 126, 234, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>🤖</div>
                <div style={{ padding: "10px 16px", borderRadius: "18px 18px 18px 4px", backgroundColor: "#f0f0f0", border: "1px solid rgba(102, 126, 234, 0.1)", display: "flex", gap: "4px", alignItems: "center" }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#667eea", animation: `bounce 1s infinite ${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestion chips */}
          {messages.length === 1 && (
            <div style={{ padding: "10px 14px", display: "flex", flexWrap: "wrap", gap: "6px", backgroundColor: "#ffffff", borderTop: "1px solid rgba(102, 126, 234, 0.1)" }}>
              {suggestions.map((q) => (
                <button key={q} onClick={() => handleSuggestion(q)}
                  style={{ fontSize: "11px", padding: "5px 12px", borderRadius: "20px", border: "1px solid rgba(102, 126, 234, 0.3)", backgroundColor: "rgba(102, 126, 234, 0.05)", color: "#667eea", cursor: "pointer", whiteSpace: "nowrap" }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 14px", borderTop: "1px solid rgba(102, 126, 234, 0.1)", backgroundColor: "#ffffff" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything about clubs..."
              disabled={loading}
              style={{ flex: 1, fontSize: "13px", border: "1px solid rgba(102, 126, 234, 0.2)", borderRadius: "20px", padding: "8px 14px", outline: "none", backgroundColor: "#f9f9f9", color: "#333333" }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                opacity: loading || !input.trim() ? 0.6 : 1,
                transition: "opacity 0.2s ease",
                fontSize: "16px",
              }}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}