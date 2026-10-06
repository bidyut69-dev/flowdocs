import { useState } from "react";
import { supabase } from "../lib/supabase";
import { PROPOSAL_TEMPLATES } from "../lib/templates";

const bg = "#F5F4F2";
const bgAlt = "#EFEDE8";
const card = "#FFFFFF";
const ink = "#0A0A0A";
const inkDeep = "#151515";
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

const CATEGORIES = ["All", "Design", "Development", "Marketing", "Content", "Business", "Legal"];

export default function Templates({ session, onUse }) {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState(null);
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [used, setUsed] = useState({});

  const filtered = PROPOSAL_TEMPLATES.filter(t =>
    (category === "All" || t.category === category) &&
    (t.title.toLowerCase().includes(search.toLowerCase()) ||
     t.category.toLowerCase().includes(search.toLowerCase()))
  );

  const handleUseTemplate = async (template) => {
    if (used[template.id] || creating) return;
    setCreating(true);
    setUsed(prev => ({ ...prev, [template.id]: true }));
    const { data, error } = await supabase.from("documents").insert({
      user_id: session.user.id,
      title: template.title,
      type: template.type,
      status: "draft",
      amount: template.defaultAmount || null,
      content: { description: template.description },
    }).select().single();
    setCreating(false);
    if (!error && data) {
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onUse?.(data); }, 1500);
    }
  };

  return (
    <div style={{ fontFamily: fontSans }}>
      <style>{`
        .tpl-card { background: ${card}; border: 1px solid ${line}; border-radius: 18px; padding: 22px; transition: all .5s cubic-bezier(.22,1,.36,1); }
        .tpl-card:hover { transform: translateY(-3px); border-color: #D4D1CA; box-shadow: 0 24px 48px -28px rgba(15,15,15,.22); }
        .tpl-input:focus { border-color: ${ink} !important; box-shadow: 0 0 0 4px rgba(10,10,10,.06); }
      `}</style>

      {/* Search + Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <input
            className="tpl-input"
            style={{
              width: "100%", background: card, border: `1px solid ${line}`, borderRadius: 12,
              padding: "11px 14px 11px 38px", fontSize: 13.5, color: ink,
              fontFamily: fontSans, outline: "none", transition: "all .2s",
            }}
            placeholder="Search templates…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: inkFaint, fontSize: 13 }}>⌕</span>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              style={{
                padding: "9px 14px", borderRadius: 100, fontSize: 12, cursor: "pointer",
                fontFamily: fontMono, fontWeight: 500, letterSpacing: ".08em", textTransform: "uppercase",
                background: category === c ? ink : card,
                border: `1px solid ${category === c ? ink : line}`,
                color: category === c ? "#fff" : inkMid,
                transition: "all .3s cubic-bezier(.22,1,.36,1)",
                boxShadow: category === c ? "0 6px 14px -6px rgba(0,0,0,.4)" : "0 2px 6px -2px rgba(0,0,0,.03)",
              }}
            >{c}</button>
          ))}
        </div>
      </div>

      {success && (
        <div style={{
          background: stampDim, border: `1px solid ${stamp}40`, borderRadius: 14,
          padding: "14px 20px", marginBottom: 20, fontSize: 14, color: stamp, fontWeight: 600,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ width: 22, height: 22, borderRadius: "50%", background: stamp, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>✓</span>
          Template added to your documents.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {filtered.map(t => (
          <div key={t.id} className="tpl-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: bgAlt, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{t.icon}</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {t.tags.map(tag => {
                  const isPopular = tag === "Most Popular";
                  const isLegal = tag === "Legal";
                  return (
                    <span key={tag} style={{
                      fontSize: 9.5, fontWeight: 600, padding: "3px 8px", borderRadius: 100,
                      fontFamily: fontMono, letterSpacing: ".1em", textTransform: "uppercase",
                      background: isPopular ? goldGlow : isLegal ? "#60A5FA14" : lineSoft,
                      color: isPopular ? gold : isLegal ? "#2563EB" : inkMid,
                      border: `1px solid ${isPopular ? `${goldSoft}40` : isLegal ? "#60A5FA40" : line}`,
                    }}>{tag}</span>
                  );
                })}
              </div>
            </div>
            <div style={{ fontFamily: fontDisplay, fontSize: 18, fontWeight: 500, color: ink, marginBottom: 6, letterSpacing: "-.3px", lineHeight: 1.3 }}>{t.title}</div>
            <div style={{ fontFamily: fontMono, fontSize: 10.5, color: inkMid, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 16 }}>
              {t.category} · {t.priceRange}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setPreview(t)}
                style={{
                  flex: 1, background: card, border: `1px solid ${line}`, color: ink,
                  borderRadius: 10, padding: "10px", fontSize: 12.5, cursor: "pointer",
                  fontFamily: fontSans, fontWeight: 500, transition: "all .2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = inkFaint; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = line; }}
              >Preview</button>
              <button
                onClick={() => handleUseTemplate(t)}
                disabled={creating}
                style={{
                  flex: 1, background: ink, color: "#fff", border: "none",
                  borderRadius: 10, padding: "10px", fontSize: 12.5, cursor: creating ? "not-allowed" : "pointer",
                  fontFamily: fontSans, fontWeight: 600, opacity: creating ? .6 : 1,
                  boxShadow: "0 10px 22px -10px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.14)",
                  outline: "1px solid rgba(0,0,0,.3)", outlineOffset: -1,
                  transition: "all .3s cubic-bezier(.22,1,.36,1)",
                }}
              >Use →</button>
            </div>
          </div>
        ))}
      </div>

      {preview && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(10,10,10,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(8px)" }}
          onClick={() => setPreview(null)}
        >
          <div
            style={{
              background: card, border: `1px solid ${line}`, borderRadius: 24,
              width: "100%", maxWidth: 600, maxHeight: "85vh", overflowY: "auto",
              padding: 32, boxShadow: "0 40px 80px -30px rgba(0,0,0,.4)",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <div style={{ fontFamily: fontMono, fontSize: 10.5, color: gold, fontWeight: 500, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 10 }}>§ {preview.type}</div>
                <div style={{ fontFamily: fontDisplay, fontSize: 26, fontWeight: 500, color: ink, letterSpacing: "-.5px", lineHeight: 1.2 }}>{preview.title}</div>
                <div style={{ fontFamily: fontMono, fontSize: 10.5, color: inkMid, marginTop: 8, letterSpacing: ".1em", textTransform: "uppercase" }}>
                  {preview.category} · {preview.priceRange}
                </div>
              </div>
              <button
                onClick={() => setPreview(null)}
                style={{ background: bgAlt, border: "none", color: inkMid, cursor: "pointer", fontSize: 18, width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
              >×</button>
            </div>
            <pre style={{
              fontSize: 12.5, color: inkMid, lineHeight: 1.8, whiteSpace: "pre-wrap",
              fontFamily: fontMono, background: bgAlt, padding: 20, borderRadius: 14, marginBottom: 24,
              border: `1px solid ${line}`,
            }}>{preview.description}</pre>
            <button
              onClick={() => { handleUseTemplate(preview); setPreview(null); }}
              disabled={creating}
              style={{
                width: "100%", background: ink, color: "#fff", border: "none",
                borderRadius: 14, padding: "15px", fontSize: 14.5, fontWeight: 600, cursor: "pointer",
                fontFamily: fontSans, opacity: creating ? .6 : 1,
                boxShadow: "0 14px 30px -12px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.14)",
                outline: "1px solid rgba(0,0,0,.3)", outlineOffset: -1,
              }}
            >
              {creating ? "Creating…" : "Use this template →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
