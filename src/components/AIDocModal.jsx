import { useState } from "react";
import { generateProposal, generateContract, generateInvoiceItems, generateFollowUpEmail, generateNDA } from "../lib/ai";

const C = {
  bg: "#0C0C0E", surface: "#141416", surface2: "#1C1C1F", border: "#2A2A2E",
  gold: "#F5A623", goldDim: "#F5A62318", text: "#F0EEE8", dim: "#7A7875",
  mid: "#B0ADA8", green: "#22C55E", greenDim: "#22C55E20", red: "#EF4444", redDim: "#EF444420",
  blue: "#60A5FA",
};

const inp = {
  width: "100%", background: C.surface2, border: `1px solid ${C.border}`,
  borderRadius: 8, padding: "10px 12px", fontSize: 13.5, color: C.text,
  fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box", marginTop: 6,
};

const lbl = {
  fontSize: 10, color: C.dim, letterSpacing: 1.5, textTransform: "uppercase",
  fontFamily: "'DM Mono', monospace", display: "block", marginTop: 14,
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
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)", padding: 16 }} onClick={onClose}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, width: "100%", maxWidth: 580, maxHeight: "92vh", overflowY: "auto", position: "relative" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: "24px 28px 20px", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, background: C.surface, zIndex: 10, borderRadius: "20px 20px 0 0" }}>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${C.gold}, ${C.blue})`, marginBottom: 18, marginLeft: -28, marginRight: -28, marginTop: -24 }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: C.text }}>✨ AI Document Generator</div>
              <div style={{ fontSize: 12, color: C.dim, marginTop: 3 }}>Powered by Google Gemini · Free</div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: C.dim, cursor: "pointer", fontSize: 22 }}>×</button>
          </div>

          {/* Type tabs */}
          <div style={{ display: "flex", gap: 6, marginTop: 16, flexWrap: "wrap" }}>
            {AI_TYPES.map(t => (
              <button key={t.id} onClick={() => { setType(t.id); setResult(""); setError(""); }} style={{
                padding: "7px 12px", borderRadius: 8, cursor: "pointer",
                background: type === t.id ? C.goldDim : C.surface2,
                border: `1px solid ${type === t.id ? C.gold : C.border}`,
                color: type === t.id ? C.gold : C.dim,
                fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 5,
              }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 28px 28px" }}>
          {result ? (
            <div>
              <div style={{ background: C.greenDim, border: `1px solid ${C.green}`, borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: C.green, fontSize: 18 }}>✓</span>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.green }}>AI document generated! Copy and use.</div>
              </div>
              <textarea readOnly value={result} style={{ ...inp, minHeight: 300, resize: "vertical", lineHeight: 1.7, fontSize: 12.5, color: C.mid, fontFamily: "'DM Mono', monospace", marginTop: 0 }} />
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button onClick={handleCopy} style={{ flex: 1, background: copied ? C.greenDim : C.goldDim, border: `1px solid ${copied ? C.green : C.gold}`, color: copied ? C.green : C.gold, borderRadius: 8, padding: "11px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  {copied ? "✓ Copied!" : "📋 Copy to Clipboard"}
                </button>
                <button onClick={() => setResult("")} style={{ flex: 1, background: "transparent", border: `1px solid ${C.border}`, color: C.mid, borderRadius: 8, padding: "11px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  ↺ Regenerate
                </button>
              </div>
            </div>
          ) : (
            <>
              <label style={lbl}>Project Title *</label>
              <input style={inp} placeholder="e.g. E-commerce Website Redesign" value={form.projectTitle} onChange={set("projectTitle")} />

              {type !== "invoice" && (
                <>
                  <label style={lbl}>Client Name *</label>
                  <input style={inp} placeholder="e.g. Nova Corp" value={form.clientName} onChange={set("clientName")} />
                </>
              )}

              {["proposal", "contract", "invoice"].includes(type) && (
                <>
                  <label style={lbl}>Project Type</label>
                  <select style={{ ...inp, color: C.text }} value={form.projectType} onChange={set("projectType")}>
                    {["Web Development","Mobile App","UI/UX Design","Graphic Design","Content Writing","SEO & Marketing","Video Editing","Consulting","Other"].map(o => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </>
              )}

              {["proposal", "contract", "invoice"].includes(type) && (
                <>
                  <label style={lbl}>Budget / Amount</label>
                  <input style={inp} placeholder="e.g. $1500 or ₹50,000" value={form.budget} onChange={set("budget")} />
                </>
              )}

              {["proposal", "contract"].includes(type) && (
                <>
                  <label style={lbl}>Timeline</label>
                  <input style={inp} placeholder="e.g. 4 weeks" value={form.timeline} onChange={set("timeline")} />
                  <label style={lbl}>Brief Scope (optional)</label>
                  <textarea style={{ ...inp, minHeight: 72, resize: "vertical" }} placeholder="e.g. Landing page + 5 inner pages, responsive design" value={form.scope} onChange={set("scope")} />
                </>
              )}

              {type === "followup" && (
                <>
                  <label style={lbl}>Days Since Last Contact</label>
                  <input style={inp} type="number" placeholder="7" value={form.daysSince} onChange={set("daysSince")} />
                </>
              )}

              {error && (
                <div style={{ background: C.redDim, border: `1px solid ${C.red}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: C.red, marginTop: 14 }}>{error}</div>
              )}

              {!import.meta.env.VITE_GEMINI_API_KEY && (
                <div style={{ background: "#F5A62318", border: `1px solid ${C.gold}`, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: C.gold, marginTop: 14 }}>
                  ⚠️ Add VITE_GEMINI_API_KEY to .env — Get free key at aistudio.google.com
                </div>
              )}

              <button onClick={handleGenerate} disabled={loading} style={{
                width: "100%", marginTop: 20, background: loading ? C.surface2 : C.gold,
                color: loading ? C.dim : "#0C0C0E", border: "none", borderRadius: 10,
                padding: "14px", fontSize: 15, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'DM Sans', sans-serif",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}>
                {loading ? (
                  <>
                    <span style={{ width: 16, height: 16, border: `2px solid ${C.dim}`, borderTopColor: C.gold, borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                    AI is writing...
                  </>
                ) : (
                  `✨ Generate ${AI_TYPES.find(t => t.id === type)?.label}`
                )}
              </button>
              <div style={{ fontSize: 11, color: C.dim, textAlign: "center", marginTop: 10 }}>Free · Google Gemini 1.5 Flash</div>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}