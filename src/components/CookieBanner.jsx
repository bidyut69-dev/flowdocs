import { useState, useEffect } from "react";

const bg = "#F5F4F2";
const card = "#FFFFFF";
const ink = "#0A0A0A";
const inkMid = "#525252";
const inkFaint = "#A3A3A3";
const line = "#E7E5E0";
const lineSoft = "#EFEDE8";
const gold = "#C8820F";
const goldSoft = "#F5A623";

const fontDisplay = "'Playfair Display', 'Fraunces', Georgia, serif";
const fontSans = "'Manrope', 'Inter', system-ui, sans-serif";
const fontMono = "'IBM Plex Mono', 'DM Mono', ui-monospace, monospace";

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
        .cb-primary{background:${ink};color:#fff;border:none;border-radius:12px;padding:10px 22px;font-size:13px;font-weight:600;cursor:pointer;font-family:${fontSans};box-shadow:0 10px 22px -10px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.14);outline:1px solid rgba(0,0,0,.3);outline-offset:-1px;transition:all .3s cubic-bezier(.22,1,.36,1)}
        .cb-primary:hover{transform:translateY(-1px)}
        .cb-ghost{background:${card};color:${ink};border:1px solid ${line};border-radius:12px;padding:10px 18px;font-size:13px;font-weight:500;cursor:pointer;font-family:${fontSans};transition:all .3s cubic-bezier(.22,1,.36,1)}
        .cb-ghost:hover{border-color:${inkFaint};transform:translateY(-1px)}
      `}</style>
      <div style={{
        position: "fixed", bottom: 16, left: 16, right: 16, zIndex: 99999,
        animation: "slideUpBanner 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        display: "flex", justifyContent: "center", pointerEvents: "none",
      }}>
        <div style={{
          maxWidth: 920, width: "100%", background: card,
          border: `1px solid ${line}`, borderRadius: 20,
          boxShadow: "0 24px 60px -20px rgba(15,15,15,.25)",
          padding: showDetail ? "22px 24px" : "16px 20px",
          pointerEvents: "auto",
        }}>
          {!showDetail ? (
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 280 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${goldSoft}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🍪</div>
                <div>
                  <div style={{ fontSize: 13.5, color: ink, fontFamily: fontSans, lineHeight: 1.5, fontWeight: 500 }}>
                    We use cookies to improve your experience.
                  </div>
                  <div style={{ fontSize: 12.5, color: inkMid, marginTop: 2 }}>
                    <span style={{ color: gold, cursor: "pointer", fontWeight: 600, textDecoration: "underline", textDecorationColor: `${goldSoft}60`, textUnderlineOffset: 3 }} onClick={() => setShowDetail(true)}>Manage preferences</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button className="cb-ghost" onClick={() => accept(false)}>Essential only</button>
                <button className="cb-primary" onClick={() => accept(true)}>Accept all</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                <div>
                  <div style={{ fontFamily: fontMono, fontSize: 10.5, color: inkMid, fontWeight: 500, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 6 }}>§ Cookie preferences</div>
                  <div style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: 500, letterSpacing: "-.3px", color: ink }}>Choose what you share</div>
                </div>
                <button onClick={() => setShowDetail(false)} style={{ background: lineSoft, border: "none", color: inkMid, cursor: "pointer", fontSize: 16, width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
              </div>
              {[
                { name: "Essential", desc: "Required for login, security, and basic functionality.", locked: true },
                { name: "Analytics", desc: "Helps us understand how you use FlowDocs (PostHog / Google Analytics).", locked: false },
                { name: "Preferences", desc: "Remembers your settings and UI preferences.", locked: false },
              ].map((cookie, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "14px 0", borderBottom: i < 2 ? `1px solid ${lineSoft}` : "none" }}>
                  <div style={{ flex: 1, paddingRight: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: ink, marginBottom: 4 }}>{cookie.name}</div>
                    <div style={{ fontSize: 12.5, color: inkMid, lineHeight: 1.5 }}>{cookie.desc}</div>
                  </div>
                  {cookie.locked ? (
                    <span style={{ fontSize: 10, color: inkMid, fontFamily: fontMono, letterSpacing: ".14em", textTransform: "uppercase", background: lineSoft, padding: "4px 10px", borderRadius: 100, flexShrink: 0 }}>Always on</span>
                  ) : (
                    <div style={{ width: 40, height: 22, background: goldSoft, borderRadius: 100, cursor: "pointer", flexShrink: 0, position: "relative", boxShadow: `0 4px 10px -4px ${goldSoft}80` }}>
                      <div style={{ position: "absolute", right: 2, top: 2, width: 18, height: 18, background: "#fff", borderRadius: "50%", boxShadow: "0 2px 4px rgba(0,0,0,.2)" }} />
                    </div>
                  )}
                </div>
              ))}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
                <button className="cb-ghost" onClick={() => accept(false)}>Save preferences</button>
                <button className="cb-primary" onClick={() => accept(true)}>Accept all</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
