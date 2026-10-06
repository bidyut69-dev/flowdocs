// ── App Loader ──────────────────────────────────────────────────────────
// Lightweight, CSS-only brand loader used for the session check and route
// Suspense fallback. No GSAP here so the entry bundle stays small.

const bg = "#F5F4F2";
const ink = "#0A0A0A";
const inkFaint = "#A3A3A3";
const line = "#E7E5E0";
const goldSoft = "#F5A623";
const fontDisplay = "'Playfair Display', 'Fraunces', Georgia, serif";
const fontMono = "'IBM Plex Mono', 'DM Mono', ui-monospace, monospace";

const css = `
  @keyframes fdl-sig{0%{stroke-dashoffset:220}55%,100%{stroke-dashoffset:0}}
  @keyframes fdl-bar{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}}
  @keyframes fdl-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  @keyframes fdl-mark{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}
  .fdl-wrap{animation:fdl-in .5s cubic-bezier(.22,1,.36,1) both}
  .fdl-sig{stroke-dasharray:220;animation:fdl-sig 1.8s cubic-bezier(.65,0,.35,1) infinite alternate}
  .fdl-mark{animation:fdl-mark 2.4s ease-in-out infinite}
  .fdl-bar{animation:fdl-bar 1.3s cubic-bezier(.65,0,.35,1) infinite}
  @media (prefers-reduced-motion: reduce){.fdl-sig,.fdl-mark,.fdl-bar{animation:none}.fdl-sig{stroke-dashoffset:0}}
`;

export default function Loader({ label = "Loading" }) {
  return (
    <div role="status" aria-live="polite" style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{css}</style>
      <div className="fdl-wrap" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="fdl-mark" style={{ width: 38, height: 38, background: ink, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: fontDisplay, fontWeight: 700, fontSize: 19, boxShadow: "0 10px 24px -10px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.14)" }}>F</div>
          <span style={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 24, letterSpacing: "-.4px", color: ink }}>FlowDocs</span>
        </div>
        <svg width="150" height="34" viewBox="0 0 150 34" aria-hidden="true">
          <path className="fdl-sig" d="M6,22 Q22,4 34,20 Q46,34 60,14 Q76,2 90,18 Q102,30 116,10 L144,20"
            stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
        <div style={{ width: 150, height: 2, background: line, borderRadius: 4, overflow: "hidden" }}>
          <div className="fdl-bar" style={{ width: "40%", height: "100%", background: goldSoft, borderRadius: 4 }} />
        </div>
        <div style={{ fontFamily: fontMono, fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: inkFaint }}>{label}</div>
      </div>
    </div>
  );
}
