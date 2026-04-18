import { useState } from "react";
import { supabase } from "../lib/supabase";
import { PROPOSAL_TEMPLATES } from "../lib/templates";

const C = {
  gold: "#F5A623", goldDim: "#F5A62318", text: "#F0EEE8", dim: "#7A7875",
  mid: "#B0ADA8", green: "#22C55E", greenDim: "#22C55E20",
};

const CATEGORIES = ["All", "Design", "Development", "Marketing", "Content", "Business", "Legal"];

export default function Templates({ session, onUse, onEdit, profile, docCount = 0 }) {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState(null);
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);

  const isPaid = profile?.plan === "pro" || profile?.plan === "solo";

  const filtered = PROPOSAL_TEMPLATES.filter(t =>
    (category === "All" || t.category === category) &&
    (t.title.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()))
  );

  const applyTemplate = async (template) => {
    // Free plan limit check
    if (!isPaid && docCount >= 3) {
      alert("Free plan mein sirf 3 documents allowed hain. Pro upgrade karo!");
      return;
    }

    setCreating(true);
    const { data, error } = await supabase.from("documents").insert({
      user_id: session.user.id,
      title: template.title,
      type: template.type,
      status: "draft",
      amount: template.defaultAmount || null,
      content: { description: template.description },
    }).select("*, clients(name, email, company)").single();

    setCreating(false);
    if (!error && data) {
      setSuccess(true);
      onUse?.(data);           // Dashboard documents list mein add karo
      setTimeout(() => {
        setSuccess(false);
        setPreview(null);
        onEdit?.(data);         // Turant edit modal kholo
      }, 600);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Search + Filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          style={{
            flex: 1, minWidth: 200, background: C.surface2, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: "9px 14px", fontSize: 13.5, color: C.text,
            fontFamily: "'DM Sans', sans-serif", outline: "none",
          }}
          placeholder="Search templates..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              padding: "8px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontWeight: category === c ? 700 : 400,
              background: category === c ? C.goldDim : C.surface2,
              border: `1px solid ${category === c ? C.gold : C.border}`,
              color: category === c ? C.gold : C.dim,
            }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Success toast */}
      {success && (
        <div style={{ background: C.greenDim, border: `1px solid ${C.green}`, borderRadius: 10, padding: "12px 18px", marginBottom: 16, fontSize: 14, color: C.green, fontWeight: 600 }}>
          ✓ Template added to your documents!
        </div>
      )}

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        {filtered.map(t => (
          <div key={t.id} style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: 20, transition: "border-color 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.gold}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ fontSize: 28 }}>{t.icon}</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {t.tags.map(tag => (
                  <span key={tag} style={{
                    fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 10,
                    fontFamily: "'DM Mono', monospace",
                    background: tag === "Most Popular" ? C.goldDim : tag === "Legal" ? "#60A5FA18" : C.surface2,
                    color: tag === "Most Popular" ? C.gold : tag === "Legal" ? "#60A5FA" : C.dim,
                    border: `1px solid ${tag === "Most Popular" ? C.gold : tag === "Legal" ? "#60A5FA" : C.border}`,
                  }}>{tag}</span>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>{t.title}</div>
            <div style={{ fontSize: 11, color: C.dim, marginBottom: 12 }}>{t.category} · {t.priceRange}</div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setPreview(t)} style={{
                flex: 1, background: "transparent", border: `1px solid ${C.border}`,
                color: C.mid, borderRadius: 8, padding: "8px", fontSize: 12,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
              }}>Preview</button>
              <button onClick={() => applyTemplate(t)} disabled={creating} style={{
                flex: 1, background: C.goldDim, border: `1px solid ${C.gold}`,
                color: C.gold, borderRadius: 8, padding: "8px", fontSize: 12,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
              }}>Use →</button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {preview && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}
          onClick={() => setPreview(null)}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "85vh", overflowY: "auto", padding: 28 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: C.gold, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>{preview.type}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: C.text }}>{preview.title}</div>
                <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>{preview.category} · {preview.priceRange}</div>
              </div>
              <button onClick={() => setPreview(null)} style={{ background: "none", border: "none", color: C.dim, cursor: "pointer", fontSize: 22 }}>×</button>
            </div>
            <pre style={{ fontSize: 12.5, color: C.mid, lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "'DM Mono', monospace", background: C.surface2, padding: 16, borderRadius: 10, marginBottom: 20 }}>
              {preview.description}
            </pre>
            <button onClick={() => { applyTemplate(preview); setPreview(null); }} disabled={creating} style={{
              width: "100%", background: C.gold, color: "#0C0C0E", border: "none",
              borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 700,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}>
              {creating ? "Creating..." : "Use This Template →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}