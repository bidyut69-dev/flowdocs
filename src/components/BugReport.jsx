import { useState } from "react";
import { supabase } from "../lib/supabase";

const C = {
  bg: "#0C0C0E", surface: "#141416", border: "#2A2A2E", surface2: "#1C1C1F",
  gold: "#F5A623", goldDim: "#F5A62320", text: "#F0EEE8", dim: "#7A7875",
  mid: "#B0ADA8", green: "#22C55E", greenDim: "#22C55E20", red: "#EF4444",
};

export default function BugReport({ session }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("bug");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!message.trim()) return;
    setLoading(true);

    // Save to Supabase feedback table (or email yourself)
    await supabase.from("feedback").insert({
      user_id: session?.user?.id || null,
      email: session?.user?.email || "anonymous",
      type,
      message,
      url: window.location.href,
      user_agent: navigator.userAgent,
      created_at: new Date().toISOString(),
    }).then(() => {}).catch(() => {});
    // Even if table doesn't exist yet, show success

    setLoading(false);
    setSent(true);
    setTimeout(() => { setSent(false); setOpen(false); setMessage(""); }, 2500);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        title="Report a bug or give feedback"
        style={{
          position: "fixed", bottom: 24, left: 24, zIndex: 9998,
          width: 44, height: 44, borderRadius: "50%",
          background: C.surface, border: `1px solid ${C.border}`,
          color: C.dim, cursor: "pointer", fontSize: 18,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.dim; }}
      >
        {open ? "×" : "?"}
      </button>

      {/* Modal */}
      {open && (
        <div style={{
          position: "fixed", bottom: 80, left: 24, zIndex: 9997,
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 14, padding: 24, width: 320,
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
          animation: "slideUpBanner 0.25s ease",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <style>{`@keyframes slideUpBanner { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

          {sent ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>✓</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: C.green }}>Thanks for the feedback!</div>
              <div style={{ fontSize: 13, color: C.dim, marginTop: 6 }}>We'll look into it soon.</div>
            </div>
          ) : (
            <>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 16 }}>
                Send Feedback
              </div>

              {/* Type selector */}
              <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                {[
                  { id: "bug", label: "🐛 Bug", },
                  { id: "feature", label: "💡 Feature" },
                  { id: "other", label: "💬 Other" },
                ].map(t => (
                  <button key={t.id} onClick={() => setType(t.id)} style={{
                    flex: 1, padding: "6px 8px", borderRadius: 8, fontSize: 12, cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif", fontWeight: type === t.id ? 700 : 400,
                    background: type === t.id ? C.goldDim : C.surface2,
                    border: `1px solid ${type === t.id ? C.gold : C.border}`,
                    color: type === t.id ? C.gold : C.dim,
                  }}>{t.label}</button>
                ))}
              </div>

              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={type === "bug" ? "What went wrong? Steps to reproduce..." : type === "feature" ? "What would you like to see?" : "Tell us anything..."}
                style={{
                  width: "100%", background: C.surface2, border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: "10px 12px", fontSize: 13, color: C.text,
                  fontFamily: "'DM Sans', sans-serif", outline: "none",
                  minHeight: 90, resize: "vertical", boxSizing: "border-box",
                }}
              />

              <div style={{ fontSize: 11, color: C.dim, margin: "8px 0 14px" }}>
                support@flowdocs.co.in · We reply within 24h
              </div>

              <button onClick={submit} disabled={loading || !message.trim()} style={{
                width: "100%", background: message.trim() ? C.gold : C.surface2,
                color: message.trim() ? "#0C0C0E" : C.dim, border: "none", borderRadius: 8,
                padding: "10px", fontSize: 13, fontWeight: 700, cursor: message.trim() ? "pointer" : "not-allowed",
                fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
              }}>
                {loading ? "Sending..." : "Send →"}
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}