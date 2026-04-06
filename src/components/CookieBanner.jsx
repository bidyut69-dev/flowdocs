import { useState, useEffect } from "react";

const C = {
  bg: "#0C0C0E", surface: "#141416", border: "#2A2A2E", surface2: "#1C1C1F",
  gold: "#F5A623", goldDim: "#F5A62320", text: "#F0EEE8", dim: "#7A7875", mid: "#B0ADA8",
};

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("fd_cookie_consent");
    if (!consent) setTimeout(() => setVisible(true), 1500);
  }, []);

  const accept = (all = true) => {
    localStorage.setItem("fd_cookie_consent", all ? "all" : "essential");
    localStorage.setItem("fd_cookie_date", new Date().toISOString());
    setVisible(false);

    // Load analytics only if accepted all
    if (all && typeof window !== "undefined") {
      window.fd_analytics_enabled = true;
    }
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes slideUpBanner {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 99999,
        padding: "12px 16px", animation: "slideUpBanner 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        background: "rgba(12, 12, 14, 0.85)", backdropFilter: "blur(12px)",
        borderTop: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {!showDetail ? (
            /* Simple banner */
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 280 }}>
                <span style={{ fontSize: 14, color: C.text, fontFamily: "'DM Sans', sans-serif" }}>
                  🍪 We use cookies to improve your experience and analyze usage.{" "}
                  <span style={{ color: C.gold, cursor: "pointer", textDecoration: "underline", fontSize: 13 }}
                    onClick={() => setShowDetail(true)}>Manage preferences</span>
                </span>
              </div>
              <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                <button onClick={() => accept(false)} style={{
                  padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`,
                  background: "transparent", color: C.mid, cursor: "pointer", fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                }}>Essential only</button>
                <button onClick={() => accept(true)} style={{
                  padding: "8px 20px", borderRadius: 8, border: "none",
                  background: C.gold, color: "#0C0C0E", cursor: "pointer", fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                }}>Accept All</button>
              </div>
            </div>
          ) : (
            /* Detailed preferences */
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: C.text }}>Cookie Preferences</div>
                <button onClick={() => setShowDetail(false)} style={{ background: "none", border: "none", color: C.dim, cursor: "pointer", fontSize: 18 }}>×</button>
              </div>
              {[
                { name: "Essential", desc: "Required for login, security, and basic functionality.", locked: true },
                { name: "Analytics", desc: "Helps us understand how you use FlowDocs (PostHog/Google Analytics).", locked: false },
                { name: "Preferences", desc: "Remembers your settings and UI preferences.", locked: false },
              ].map((cookie, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: C.text, marginBottom: 3 }}>{cookie.name}</div>
                    <div style={{ fontSize: 12, color: C.dim }}>{cookie.desc}</div>
                  </div>
                  {cookie.locked ? (
                    <span style={{ fontSize: 11, color: C.dim, fontFamily: "'DM Mono', monospace", marginTop: 4, flexShrink: 0 }}>Always on</span>
                  ) : (
                    <div style={{ width: 40, height: 22, background: C.gold, borderRadius: 11, cursor: "pointer", flexShrink: 0, position: "relative" }}>
                      <div style={{ position: "absolute", right: 2, top: 2, width: 18, height: 18, background: "#0C0C0E", borderRadius: "50%" }} />
                    </div>
                  )}
                </div>
              ))}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
                <button onClick={() => accept(false)} style={{
                  padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`,
                  background: "transparent", color: C.mid, cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                }}>Save Preferences</button>
                <button onClick={() => accept(true)} style={{
                  padding: "8px 20px", borderRadius: 8, border: "none",
                  background: C.gold, color: "#0C0C0E", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                }}>Accept All</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}