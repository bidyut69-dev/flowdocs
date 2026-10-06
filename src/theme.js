// ── FlowDocs Design Tokens ──────────────────────────────────────────────
// Shared design system — warm stone background, white rounded-2xl cards,
// Playfair serif display + Manrope sans body + IBM Plex Mono labels.
// Gold accent kept for brand continuity across Landing/Dashboard/SignPage.

// Palette
export const bg = "#F5F4F2";          // warm stone background
export const bgAlt = "#EFEDE8";       // panel / footer tint
export const card = "#FFFFFF";        // card surface
export const ink = "#0A0A0A";         // primary text, dark buttons
export const inkDeep = "#151515";     // dark card variant
export const inkMid = "#525252";      // body copy
export const inkFaint = "#A3A3A3";    // meta / timestamps
export const line = "#E7E5E0";        // card borders
export const lineSoft = "#EFEDE8";    // internal dividers
export const gold = "#C8820F";        // text/icon gold (AA contrast)
export const goldSoft = "#F5A623";    // fills, glow, pills
export const goldGlow = "#F5A62310";
export const stamp = "#1F6B46";       // success / paid / signed
export const red = "#B3432B";         // errors — warm ink red
export const redDim = "#B3432B15";

// Legacy aliases (back-compat for older imports)
export const paper = bg;
export const paperAlt = bgAlt;

// Typography
export const fontDisplay = "'Playfair Display', 'Fraunces', Georgia, serif";
export const fontSans = "'Manrope', 'Inter', system-ui, -apple-system, sans-serif";
export const fontBody = fontSans;
export const fontMono = "'IBM Plex Mono', 'DM Mono', ui-monospace, monospace";

// Shared CSS blobs — inject once per page with <style>{sharedStyles}</style>
export const sharedStyles = `
  *{box-sizing:border-box;margin:0;padding:0}
  .mono{font-family:${fontMono};font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.16em;color:${inkMid}}
  .mono-sm{font-family:${fontMono};font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.14em;color:${inkFaint}}
  .btn-dark{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:10px;background:${ink};color:#fff;border:none;padding:13px 24px;border-radius:14px;font-size:14px;font-weight:600;cursor:pointer;font-family:${fontSans};box-shadow:0 14px 30px -12px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.14);transition:all .3s cubic-bezier(.22,1,.36,1);outline:1px solid rgba(0,0,0,.3);outline-offset:-1px}
  .btn-dark:hover{transform:translateY(-1px);box-shadow:0 20px 40px -12px rgba(0,0,0,.65),inset 0 1px 0 rgba(255,255,255,.2)}
  .btn-dark:active{transform:scale(.985)}
  .btn-dark:disabled{opacity:.55;cursor:not-allowed;transform:none}
  .btn-light{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#fff;color:${ink};border:1px solid ${line};padding:12px 22px;border-radius:14px;font-size:13.5px;font-weight:500;cursor:pointer;font-family:${fontSans};box-shadow:0 3px 10px -2px rgba(0,0,0,.04);transition:all .3s cubic-bezier(.22,1,.36,1)}
  .btn-light:hover{border-color:${inkFaint};transform:translateY(-1px);box-shadow:0 10px 22px -6px rgba(0,0,0,.1)}
  .btn-gold{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:${goldSoft};color:${ink};border:none;padding:13px 26px;border-radius:14px;font-size:14.5px;font-weight:700;cursor:pointer;font-family:${fontSans};box-shadow:0 14px 30px -10px rgba(245,166,35,.5),inset 0 1px 0 rgba(255,255,255,.4);transition:all .3s cubic-bezier(.22,1,.36,1)}
  .btn-gold:hover{transform:translateY(-1px);box-shadow:0 20px 42px -10px rgba(245,166,35,.6),inset 0 1px 0 rgba(255,255,255,.5)}
  .card{background:${card};border:1px solid ${line};border-radius:20px;transition:all .5s cubic-bezier(.22,1,.36,1)}
  .card:hover{transform:translateY(-4px);border-color:#D4D1CA;box-shadow:0 24px 48px -28px rgba(15,15,15,.22),0 2px 6px -2px rgba(15,15,15,.06)}
  .input{width:100%;background:#fff;border:1px solid ${line};border-radius:12px;padding:13px 15px;font-size:14px;color:${ink};font-family:${fontSans};outline:none;transition:border-color .2s, box-shadow .2s}
  .input:focus{border-color:${ink};box-shadow:0 0 0 4px rgba(10,10,10,.06)}
  .input::placeholder{color:${inkFaint}}
  .doc-card{background:${card};border:1px solid ${line};border-radius:16px;padding:20px;transition:all .5s cubic-bezier(.22,1,.36,1)}
  .doc-card:hover{transform:translateY(-2px);border-color:#D4D1CA;box-shadow:0 22px 44px -26px rgba(15,15,15,.22)}
  ::selection{background:${goldSoft}40;color:${ink}}
  ::-webkit-scrollbar{width:5px;height:5px}
  ::-webkit-scrollbar-track{background:${bg}}
  ::-webkit-scrollbar-thumb{background:${line};border-radius:4px}
  ::-webkit-scrollbar-thumb:hover{background:${inkFaint}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
  @keyframes ping{75%,100%{transform:scale(2);opacity:0}}
  @keyframes fadeInUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
  @keyframes spin{to{transform:rotate(360deg)}}
`;
