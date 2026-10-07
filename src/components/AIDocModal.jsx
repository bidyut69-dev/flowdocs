import { useState } from "react";
import { generateProposal, generateContract, generateInvoiceItems, generateFollowUpEmail, generateNDA } from "../lib/ai";

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
const red = "#B3432B";
const redDim = "#B3432B15";

const fontDisplay = "'Playfair Display', 'Fraunces', Georgia, serif";
const fontSans = "'Manrope', 'Inter', system-ui, sans-serif";
const fontMono = "'IBM Plex Mono', 'DM Mono', ui-monospace, monospace";

const inp = {
  width: "100%", background: card, border: `1px solid ${line}`,
  borderRadius: 12, padding: "12px 14px", fontSize: 13.5, color: ink,
  fontFamily: fontSans, outline: "none", boxSizing: "border-box", marginTop: 6,
  transition: "border-color .2s, box-shadow .2s",
};

const lbl = {
  fontFamily: fontMono, fontSize: 10, color: inkMid, fontWeight: 500,
  letterSpacing: ".14em", textTransform: "uppercase", display: "block", marginTop: 16,
};

const AI_TYPES = [
  { id: "proposal", icon: "📄", label: "Proposal" },
  { id: "contract", icon: "📋", label: "Contract" },
  { id: "nda",      icon: "🔒", label: "NDA" },
  { id: "invoice",  icon: "◈",  label: "Invoice" },
  { id: "followup", icon: "📧", label: "Follow-up" },
];

export default function AIDocModal({ profile, onGenerated, onClose }) {
  const [type, setType] = useState("proposal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    projectTitle: "", clientName: "", projectType: "Web Development",
    budget: "", timeline: "4 weeks", scope: "", daysSince: "7",
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleGenerate = async () => {
    if (!form.projectTitle) return setError("Enter project title");
    if (!form.clientName && type !== "invoice") return setError("Enter client name");
    setLoading(true); setError(""); setResult("");
    try {
      const providerName = profile?.name || "Service Provider";
      let text = "";
      if (type === "proposal") {
        text = await generateProposal({ projectTitle: form.projectTitle, clientName: form.clientName, projectType: form.projectType, budget: form.budget, timeline: form.timeline, scope: form.scope });
      } else if (type === "contract") {
        text = await generateContract({ projectTitle: form.projectTitle, clientName: form.clientName, providerName, amount: form.budget, timeline: form.timeline, scope: form.scope });
      } else if (type === "nda") {
        text = await generateNDA({ clientName: form.clientName, providerName, projectTitle: form.projectTitle });
      } else if (type === "invoice") {
        const items = await generateInvoiceItems({ projectTitle: form.projectTitle, projectType: form.projectType, amount: form.budget });
        onGenerated?.({ type: "invoice_items", items, title: form.projectTitle, clientName: form.clientName });
        setLoading(false);
        return;
      } else if (type === "followup") {
        text = await generateFollowUpEmail({ clientName: form.clientName, projectTitle: form.projectTitle, daysSince: form.daysSince, senderName: providerName });
      }
      setResult(text);
      onGenerated?.({ type, text, title: form.projectTitle, clientName: form.clientName });
    } catch (err) {
      setError(err.message || "AI generation failed. Check your API key.");
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(10,10,10,0.5)", zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", padding: 16 }}
      onClick={onClose}
    >
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        .ai-input:focus{border-color:${ink}!important;box-shadow:0 0 0 4px rgba(10,10,10,.06)}
      `}</style>
      <div
        style={{ background: card, border: `1px solid ${line}`, borderRadius: 24, width: "100%", maxWidth: 600, maxHeight: "92vh", overflowY: "auto", position: "relative", boxShadow: "0 40px 80px -30px rgba(0,0,0,.4)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "28px 32px 20px", borderBottom: `1px solid ${lineSoft}`, position: "sticky", top: 0, background: card, zIndex: 10, borderRadius: "24px 24px 0 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontFamily: fontMono, fontSize: 10.5, color: gold, fontWeight: 500, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 8 }}>§ AI Draft</div>
              <div style={{ fontFamily: fontDisplay, fontSize: 24, fontWeight: 500, letterSpacing: "-.5px", color: ink, lineHeight: 1.15 }}>
                Draft with <span style={{ fontStyle: "italic", color: gold }}>intention</span>
              </div>
              <div style={{ fontSize: 12, color: inkMid, marginTop: 6, fontFamily: fontMono, letterSpacing: ".08em" }}>Google Gemini · Free</div>
            </div>
            <button
              onClick={onClose}
              style={{ background: lineSoft, border: "none", color: inkMid, cursor: "pointer", fontSize: 18, width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
            >×</button>
          </div>

          <div style={{ display: "flex", gap: 6, marginTop: 18, flexWrap: "wrap" }}>
            {AI_TYPES.map(t => (
              <button
                key={t.id}
                onClick={() => { setType(t.id); setResult(""); setError(""); }}
                style={{
                  padding: "8px 14px", borderRadius: 100, cursor: "pointer",
                  background: type === t.id ? ink : card,
                  border: `1px solid ${type === t.id ? ink : line}`,
                  color: type === t.id ? "#fff" : inkMid,
                  fontFamily: fontMono, fontSize: 11, fontWeight: 500, letterSpacing: ".08em", textTransform: "uppercase",
                  display: "flex", alignItems: "center", gap: 6,
                  boxShadow: type === t.id ? "0 6px 14px -6px rgba(0,0,0,.4)" : "none",
                  transition: "all .3s cubic-bezier(.22,1,.36,1)",
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: "24px 32px 32px" }}>
          {result ? (
            <div>
              <div style={{ background: stampDim, border: `1px solid ${stamp}40`, borderRadius: 14, padding: "14px 18px", marginBottom: 18, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: stamp, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>✓</span>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: stamp }}>Generated. Copy and send it.</div>
              </div>
              <textarea
                readOnly
                value={result}
                style={{ ...inp, minHeight: 320, resize: "vertical", lineHeight: 1.75, fontSize: 12.5, color: inkMid, fontFamily: fontMono, marginTop: 0, background: bgAlt }}
              />
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button
                  onClick={handleCopy}
                  style={{
                    flex: 1, background: copied ? stamp : ink, color: "#fff", border: "none",
                    borderRadius: 12, padding: "13px", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
                    fontFamily: fontSans,
                    boxShadow: "0 10px 22px -10px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.14)",
                    outline: "1px solid rgba(0,0,0,.3)", outlineOffset: -1,
                    transition: "all .3s cubic-bezier(.22,1,.36,1)",
                  }}
                >
                  {copied ? "✓ Copied" : "📋 Copy to clipboard"}
                </button>
                <button
                  onClick={() => setResult("")}
                  style={{
                    flex: 1, background: card, border: `1px solid ${line}`, color: ink,
                    borderRadius: 12, padding: "13px", fontSize: 13.5, fontWeight: 500, cursor: "pointer",
                    fontFamily: fontSans, transition: "all .3s cubic-bezier(.22,1,.36,1)",
                  }}
                >
                  ↺ Regenerate
                </button>
              </div>
            </div>
          ) : (
            <>
              <label style={lbl}>Project Title *</label>
              <input className="ai-input" style={inp} placeholder="e.g. E-commerce Website Redesign" value={form.projectTitle} onChange={set("projectTitle")} />

              {type !== "invoice" && (
                <>
                  <label style={lbl}>Client Name *</label>
                  <input className="ai-input" style={inp} placeholder="e.g. Nova Corp" value={form.clientName} onChange={set("clientName")} />
                </>
              )}

              {["proposal", "contract", "invoice"].includes(type) && (
                <>
                  <label style={lbl}>Project Type</label>
                  <select className="ai-input" style={{ ...inp, color: ink }} value={form.projectType} onChange={set("projectType")}>
                    {["Web Development","Mobile App","UI/UX Design","Graphic Design","Content Writing","SEO & Marketing","Video Editing","Consulting","Other"].map(o => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </>
              )}

              {["proposal", "contract", "invoice"].includes(type) && (
                <>
                  <label style={lbl}>Budget / Amount</label>
                  <input className="ai-input" style={inp} placeholder="e.g. $1500 or ₹50,000" value={form.budget} onChange={set("budget")} />
                </>
              )}

              {["proposal", "contract"].includes(type) && (
                <>
                  <label style={lbl}>Timeline</label>
                  <input className="ai-input" style={inp} placeholder="e.g. 4 weeks" value={form.timeline} onChange={set("timeline")} />
                  <label style={lbl}>Brief Scope (optional)</label>
                  <textarea className="ai-input" style={{ ...inp, minHeight: 80, resize: "vertical" }} placeholder="e.g. Landing page + 5 inner pages, responsive design" value={form.scope} onChange={set("scope")} />
                </>
              )}

              {type === "followup" && (
                <>
                  <label style={lbl}>Days Since Last Contact</label>
                  <input className="ai-input" style={inp} type="number" placeholder="7" value={form.daysSince} onChange={set("daysSince")} />
                </>
              )}

              {error && (
                <div style={{ background: redDim, border: `1px solid ${red}40`, borderRadius: 12, padding: "11px 15px", fontSize: 13, color: red, marginTop: 16 }}>{error}</div>
              )}

              {!import.meta.env.VITE_GEMINI_API_KEY && (
                <div style={{ background: goldGlow, border: `1px solid ${goldSoft}40`, borderRadius: 12, padding: "11px 15px", fontSize: 12.5, color: gold, marginTop: 16, display: "flex", gap: 10, alignItems: "flex-start", lineHeight: 1.5 }}>
                  <span style={{ fontSize: 15 }}>⚠️</span>
                  <div>Add <strong style={{ fontFamily: fontMono, fontWeight: 600 }}>VITE_GEMINI_API_KEY</strong> to .env. Get a free key at aistudio.google.com</div>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading}
                style={{
                  width: "100%", marginTop: 22, background: loading ? bgAlt : ink,
                  color: loading ? inkMid : "#fff", border: "none", borderRadius: 14,
                  padding: "15px", fontSize: 14.5, fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: fontSans,
                  boxShadow: loading ? "none" : "0 14px 30px -12px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.14)",
                  outline: loading ? "none" : "1px solid rgba(0,0,0,.3)", outlineOffset: -1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  transition: "all .3s cubic-bezier(.22,1,.36,1)",
                }}
              >
                {loading ? (
                  <>
                    <span style={{ width: 16, height: 16, border: `2px solid ${line}`, borderTopColor: ink, borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                    AI is writing…
                  </>
                ) : (
                  `✨ Generate ${AI_TYPES.find(t => t.id === type)?.label}`
                )}
              </button>
              <div style={{ fontFamily: fontMono, fontSize: 10, color: inkFaint, textAlign: "center", marginTop: 12, letterSpacing: ".12em", textTransform: "uppercase" }}>
                Free · Google Gemini 1.5 Flash
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
