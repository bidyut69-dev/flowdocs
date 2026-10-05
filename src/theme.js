// ── FlowDocs Design Tokens ──────────────────────────────────────────────
// Shared across Landing, Dashboard, SignPage, Auth, Onboarding so every
// page uses the same paper/ink palette and type scale. Import what you
// need: `import { paper, ink, gold } from "../theme";`

export const paper = "#F6F3EC";
export const paperAlt = "#EFEADF";
export const ink = "#1C1A16";
export const inkMid = "#6B6558";
export const inkFaint = "#9A9385";
export const line = "#DDD6C7";
export const gold = "#C8820F";   // text/icons on light backgrounds (AA contrast)
export const goldSoft = "#F5A623"; // fills/buttons/backgrounds
export const stamp = "#1F6B46";  // success / paid / signed states
export const red = "#B3432B";    // errors, overdue — warm ink-red, not SaaS red
export const redDim = "#B3432B15";

export const fontDisplay = "'Fraunces', Georgia, serif";
export const fontBody = "'Source Sans 3', 'Inter', system-ui, sans-serif";

// Shared button/card class names (paired with the <style> block each page
// already injects, or move to a global stylesheet later):
export const sharedStyles = `
  .btn-primary{background:${ink};color:${paper};border:none;padding:13px 28px;border-radius:3px;font-size:14px;font-weight:600;cursor:pointer;font-family:${fontBody};transition:background .2s}
  .btn-primary:hover{background:#000}
  .btn-primary:disabled{opacity:.5;cursor:not-allowed}
  .btn-ghost{background:transparent;color:${ink};border:1px solid ${line};padding:12px 24px;border-radius:3px;font-size:13.5px;font-weight:500;cursor:pointer;font-family:${fontBody};transition:border-color .2s}
  .btn-ghost:hover{border-color:${ink}}
  .doc-card{background:${paper};border:1px solid ${line};border-radius:4px;padding:22px;transition:border-color .2s}
  .doc-card:hover{border-color:${inkFaint}}
`;