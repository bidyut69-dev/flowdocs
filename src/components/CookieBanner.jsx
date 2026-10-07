import { useState, useEffect } from "react";
import { applyAnalyticsConsent } from "../lib/posthog";

const card = "#FFFFFF";
const ink = "#0A0A0A";
const inkMid = "#525252";
const inkFaint = "#A3A3A3";
const line = "#E7E5E0";
const lineSoft = "#EFEDE8";
const gold = "#C8820F";
const goldSoft = "#F5A623";

const fontDisplay = "'Playfair Display', Georgia, serif";
const fontSans = "'Manrope', 'Inter', system-ui, sans-serif";

// Shown after a short delay so it never competes with the first paint or the
// hero CTA. Compact: a corner card on desktop, a slim bar on phones.
const SHOW_AFTER_MS = 3500;

function readConsent() {
  try {
    return localStorage.getItem("fd_cookie_consent");
  } catch {
    return "essential"; // storage blocked: treat as essential, never nag
  }
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    if (readConsent()) return;
    const t = setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    return () => clearTimeout(t);
  }, []);

  const save = (all) => {
    const value = all ? "all" : "essential";
    try {
      localStorage.setItem("fd_cookie_consent", value);
      localStorage.setItem("fd_cookie_date", new Date().toISOString());
    } catch { /* storage blocked: consent applies for this visit only */ }
    applyAnalyticsConsent(value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes cbIn { from { transform: translateY(12px); opacity: 0; } to { transform: none; opacity: 1; } }
        .cb-wrap{position:fixed;z-index:99999;left:16px;bottom:16px;width:360px;max-width:calc(100vw - 32px);animation:cbIn .4s cubic-bezier(.22,1,.36,1)}
        .cb-card{background:${card};border:1px solid ${line};border-radius:16px;box-shadow:0 16px 40px -20px rgba(15,15,15,.3);padding:16px}
        .cb-row{display:flex;gap:8px;margin-top:12px}
        .cb-primary{flex:1;background:${ink};color:#fff;border:none;border-radius:10px;padding:9px 14px;font-size:13px;font-weight:600;cursor:pointer;font-family:${fontSans}}
        .cb-ghost{flex:1;background:${card};color:${ink};border:1px solid ${line};border-radius:10px;padding:9px 14px;font-size:13px;font-weight:500;cursor:pointer;font-family:${fontSans}}
        .cb-primary:active,.cb-ghost:active{transform:scale(.98)}
        .cb-link{background:none;border:none;padding:0;color:${gold};font-weight:600;font-size:12.5px;cursor:pointer;font-family:${fontSans};text-decoration:underline;text-decoration-color:${goldSoft}60;text-underline-offset:3px}
        @media (max-width: 560px){
          .cb-wrap{left:0;right:0;bottom:0;width:auto;max-width:none}
          .cb-card{border-radius:14px 14px 0 0;border-left:none;border-right:none;border-bottom:none;padding:12px 16px calc(12px + env(safe-area-inset-bottom))}
          .cb-compact{display:flex;align-items:center;gap:10px}
          .cb-compact .cb-row{margin-top:0;flex-shrink:0}
          .cb-compact .cb-primary,.cb-compact .cb-ghost{flex:none;padding:8px 12px;font-size:12.5px}
        }
        @media (prefers-reduced-motion: reduce){ .cb-wrap{animation:none} }
      `}</style>
      <div className="cb-wrap" role="dialog" aria-live="polite" aria-label="Cookie preferences">
        <div className="cb-card">
          {!showDetail ? (
            <div className="cb-compact">
              <p style={{ fontSize: 13, color: ink, fontFamily: fontSans, lineHeight: 1.5, flex: 1, margin: 0 }}>
                Analytics cookies help us improve FlowDocs.{" "}
                <button className="cb-link" onClick={() => setShowDetail(true)}>Choose</button>
              </p>
              <div className="cb-row">
                <button className="cb-ghost" onClick={() => save(false)}>Essential only</button>
                <button className="cb-primary" onClick={() => save(true)}>Accept</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontFamily: fontDisplay, fontSize: 18, fontWeight: 500, color: ink }}>Cookie preferences</div>
                <button onClick={() => setShowDetail(false)} aria-label="Back" style={{ background: lineSoft, border: "none", color: inkMid, cursor: "pointer", fontSize: 16, width: 28, height: 28, borderRadius: "50%" }}>×</button>
              </div>
              {[
                { key: "essential", name: "Essential", desc: "Login, security and the signing flow. Always on." },
                { key: "analytics", name: "Analytics", desc: "PostHog usage stats and session replay, so we can fix confusing screens." },
              ].map((c, i) => (
                <div key={c.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "12px 0", borderTop: i ? `1px solid ${lineSoft}` : "none" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: ink }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: inkMid, lineHeight: 1.5, marginTop: 2 }}>{c.desc}</div>
                  </div>
                  {c.key === "essential" ? (
                    <span style={{ fontSize: 11.5, color: inkMid, background: lineSoft, padding: "4px 10px", borderRadius: 100, flexShrink: 0 }}>On</span>
                  ) : (
                    <button
                      role="switch"
                      aria-checked={analytics}
                      aria-label="Analytics cookies"
                      onClick={() => setAnalytics(a => !a)}
                      style={{ width: 40, height: 22, flexShrink: 0, border: "none", borderRadius: 100, cursor: "pointer", position: "relative", background: analytics ? goldSoft : line, transition: "background .2s" }}
                    >
                      <span style={{ position: "absolute", top: 2, left: analytics ? 20 : 2, width: 18, height: 18, background: "#fff", borderRadius: "50%", boxShadow: "0 1px 3px rgba(0,0,0,.2)", transition: "left .2s" }} />
                    </button>
                  )}
                </div>
              ))}
              <div className="cb-row">
                <button className="cb-ghost" onClick={() => save(analytics)}>Save</button>
                <button className="cb-primary" onClick={() => save(true)}>Accept all</button>
              </div>
              <div style={{ fontSize: 11.5, color: inkFaint, marginTop: 10 }}>You can change this any time by clearing site data.</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
