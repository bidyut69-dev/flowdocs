import { useState } from "react";
import { supabase } from "../lib/supabase";

const bg = "#F5F4F2";
const bgAlt = "#EFEDE8";
const card = "#FFFFFF";
const ink = "#0A0A0A";
const inkMid = "#525252";
const inkFaint = "#A3A3A3";
const line = "#E7E5E0";
const lineSoft = "#EFEDE8";
const gold = "#C8820F";
const goldSoft = "#F5A623";
const goldGlow = "#F5A62315";
const stamp = "#1F6B46";
const stampDim = "#1F6B4615";

const fontDisplay = "'Playfair Display', 'Fraunces', Georgia, serif";
const fontSans = "'Manrope', 'Inter', system-ui, sans-serif";
const fontMono = "'IBM Plex Mono', 'DM Mono', ui-monospace, monospace";

export default function BugReport({ session }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("bug");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!message.trim()) return;
    setLoading(true);
    await supabase.from("feedback").insert({
      user_id: session?.user?.id || null,
      email: session?.user?.email || "anonymous",
      type,
      message,
      url: window.location.href,
      user_agent: navigator.userAgent,
      created_at: new Date().toISOString(),
    }).then(() => {}).catch(() => {});
    setLoading(false);
    setSent(true);
    setTimeout(() => { setSent(false); setOpen(false); setMessage(""); }, 2500);
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        title="Report a bug or give feedback"
        style={{
          position: "fixed", bottom: 24, left: 24, zIndex: 9998,
          width: 44, height: 44, borderRadius: "50%",
          background: card, border: `1px solid ${line}`,
          color: ink, cursor: "pointer", fontSize: 18,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 10px 24px -8px rgba(15,15,15,.2)",
          transition: "all .3s cubic-bezier(.22,1,.36,1)",
          fontFamily: fontSans, fontWeight: 500,
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = inkFaint; e.currentTarget.style.transform = "translateY(-2px)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = line; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        {open ? "×" : "?"}
      </button>

      {open && (
        <div style={{
          position: "fixed", bottom: 80, left: 24, zIndex: 9997,
          background: card, border: `1px solid ${line}`,
          borderRadius: 20, padding: 24, width: 340,
          boxShadow: "0 24px 60px -20px rgba(15,15,15,.3)",
          animation: "fdBugFade .35s cubic-bezier(.22,1,.36,1)",
          fontFamily: fontSans,
        }}>
          <style>{`@keyframes fdBugFade { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

          {sent ? (
            <div style={{ textAlign: "center", padding: "18px 0 10px" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: stampDim, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: stamp, fontSize: 22, fontWeight: 700 }}>✓</div>
              <div style={{ fontFamily: fontDisplay, fontSize: 18, fontWeight: 500, color: ink, letterSpacing: "-.2px", marginBottom: 4 }}>Thanks for the <span style={{ fontStyle: "italic", color: gold }}>feedback</span></div>
              <div style={{ fontSize: 13, color: inkMid }}>We'll look into it soon.</div>
            </div>
          ) : (
            <>
              <div style={{ fontFamily: fontMono, fontSize: 10.5, color: inkMid, fontWeight: 500, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 10 }}>§ Feedback</div>
              <div style={{ fontFamily: fontDisplay, fontSize: 20, fontWeight: 500, color: ink, letterSpacing: "-.3px", marginBottom: 16 }}>
                Send us a <span style={{ fontStyle: "italic", color: gold }}>note</span>
              </div>

              <div style={{ display: "flex", gap: 5, marginBottom: 14 }}>
                {[
                  { id: "bug", label: "🐛 Bug" },
                  { id: "feature", label: "💡 Feature" },
                  { id: "other", label: "💬 Other" },
                ].map(t => (
                  <button key={t.id} onClick={() => setType(t.id)} style={{
                    flex: 1, padding: "8px 6px", borderRadius: 10, fontSize: 11.5, cursor: "pointer",
                    fontFamily: fontMono, fontWeight: 500, letterSpacing: ".05em",
                    background: type === t.id ? ink : card,
                    border: `1px solid ${type === t.id ? ink : line}`,
                    color: type === t.id ? "#fff" : inkMid,
                    transition: "all .3s cubic-bezier(.22,1,.36,1)",
                  }}>{t.label}</button>
                ))}
              </div>

              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={type === "bug" ? "What went wrong? Steps to reproduce…" : type === "feature" ? "What would you like to see?" : "Tell us anything…"}
                style={{
                  width: "100%", background: card, border: `1px solid ${line}`,
                  borderRadius: 12, padding: "12px 14px", fontSize: 13.5, color: ink,
                  fontFamily: fontSans, outline: "none",
                  minHeight: 100, resize: "vertical", boxSizing: "border-box",
                  transition: "border-color .2s, box-shadow .2s",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = ink; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(10,10,10,.06)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = line; e.currentTarget.style.boxShadow = "none"; }}
              />

              <div style={{ fontFamily: fontMono, fontSize: 10, color: inkFaint, margin: "10px 0 16px", letterSpacing: ".1em", textTransform: "uppercase" }}>
                support@flowdocs.co.in · reply ≤24h
              </div>

              <button
                onClick={submit}
                disabled={loading || !message.trim()}
                style={{
                  width: "100%",
                  background: message.trim() ? ink : lineSoft,
                  color: message.trim() ? "#fff" : inkFaint,
                  border: "none", borderRadius: 12, padding: "12px",
                  fontSize: 13.5, fontWeight: 600,
                  cursor: message.trim() ? "pointer" : "not-allowed",
                  fontFamily: fontSans,
                  boxShadow: message.trim() ? "0 10px 22px -10px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.14)" : "none",
                  outline: message.trim() ? "1px solid rgba(0,0,0,.3)" : "none",
                  outlineOffset: -1,
                  transition: "all .3s cubic-bezier(.22,1,.36,1)",
                }}
              >
                {loading ? "Sending…" : "Send →"}
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
