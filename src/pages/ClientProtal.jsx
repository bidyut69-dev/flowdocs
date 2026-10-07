// src/pages/ClientPortal.jsx
// Route: /portal/:freelancerId/:clientEmail

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { PortalSkeleton } from "../components/Skeleton";

const bg = "#F5F4F2";
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

const sym = (cur) => ({ INR: "₹", USD: "$", EUR: "€", GBP: "£" }[cur] || cur);
const fmt = (amt, cur = "INR") => `${sym(cur)}${Number(amt || 0).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;

const STATUS_COLORS = {
  draft:   { bg: lineSoft,  color: inkMid, border: line },
  pending: { bg: goldGlow,  color: gold,   border: `${goldSoft}40` },
  signed:  { bg: stampDim,  color: stamp,  border: `${stamp}40` },
  paid:    { bg: stampDim,  color: stamp,  border: `${stamp}40` },
  overdue: { bg: redDim,    color: red,    border: `${red}40` },
};

export default function ClientPortal() {
  const { freelancerId, clientEmail } = useParams();
  const [docs, setDocs] = useState([]);
  const [freelancer, setFreelancer] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const APP_URL = import.meta.env.VITE_APP_URL?.replace(/\/$/, "") || window.location.origin;

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data: prof } = await supabase
        .from("profiles")
        .select("id, name, company, email")
        .eq("id", freelancerId)
        .single();

      if (!prof) { setError("Freelancer not found."); setLoading(false); return; }
      setFreelancer(prof);

      const decodedEmail = decodeURIComponent(clientEmail);
      const { data: cl } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", freelancerId)
        .eq("email", decodedEmail)
        .single();

      if (!cl) { setError("Client not found. Contact your service provider."); setLoading(false); return; }
      setClient(cl);

      const { data: documents } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", freelancerId)
        .eq("client_id", cl.id)
        .order("created_at", { ascending: false });

      setDocs(documents || []);
      setLoading(false);
    };
    load();
  }, [freelancerId, clientEmail]);

  const filtered = activeTab === "all" ? docs : docs.filter(d => d.type.toLowerCase() === activeTab || d.status === activeTab);

  const totalBilled   = docs.reduce((s, d) => s + (d.amount || 0), 0);
  const totalPaid     = docs.filter(d => d.status === "paid").reduce((s, d) => s + (d.amount || 0), 0);
  const pendingCount  = docs.filter(d => d.status === "pending").length;

  if (loading) return <PortalSkeleton />;

  if (error) return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fontSans, padding: 24 }}>
      <div style={{ background: card, border: `1px solid ${line}`, borderRadius: 20, padding: 36, textAlign: "center", maxWidth: 420, boxShadow: "0 24px 60px -30px rgba(15,15,15,.18)" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: redDim, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: red, fontSize: 24 }}>⚠</div>
        <div style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: 500, color: ink, marginBottom: 10, letterSpacing: "-.3px" }}>{error}</div>
        <div style={{ fontSize: 13.5, color: inkMid }}>Contact your service provider for access.</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: fontSans, color: ink }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        .doc-card { background: ${card}; border: 1px solid ${line}; border-radius: 18px; padding: 22px; transition: all .5s cubic-bezier(.22,1,.36,1); animation: fadeUp .5s cubic-bezier(.22,1,.36,1) both; }
        .doc-card:hover { transform: translateY(-3px); border-color: #D4D1CA; box-shadow: 0 24px 48px -28px rgba(15,15,15,.22); }
        .tab-btn { padding: 9px 18px; border-radius: 10px; font-size: 12.5px; font-weight: 500; cursor: pointer; border: none; transition: all .3s cubic-bezier(.22,1,.36,1); font-family: ${fontMono}; letterSpacing: .1em; text-transform: uppercase; }
        .action-btn { padding: 10px 18px; border-radius: 11px; font-size: 12.5px; font-weight: 600; cursor: pointer; font-family: ${fontSans}; transition: all .3s cubic-bezier(.22,1,.36,1); display: inline-flex; align-items: center; gap: 7px; text-decoration: none; }
        .action-btn:hover { transform: translateY(-1px); }
      `}</style>

      {/* Header */}
      <div style={{ background: card, borderBottom: `1px solid ${line}`, padding: "22px 28px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, background: ink, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: fontDisplay, boxShadow: "0 6px 14px -6px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.12)" }}>F</div>
            <div>
              <div style={{ fontFamily: fontMono, fontSize: 10, color: gold, fontWeight: 600, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 2 }}>Client Portal</div>
              <div style={{ fontFamily: fontDisplay, fontSize: 18, fontWeight: 600, letterSpacing: "-.3px" }}>FlowDocs</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: fontDisplay, fontSize: 17, fontWeight: 500, letterSpacing: "-.2px" }}>{client?.name}</div>
            <div style={{ fontSize: 12.5, color: inkMid, marginTop: 2 }}>{client?.company || client?.email}</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 20px" }}>

        {/* Freelancer info */}
        <div style={{ background: card, border: `1px solid ${line}`, borderRadius: 18, padding: "20px 24px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          <div>
            <div style={{ fontFamily: fontMono, fontSize: 10.5, color: inkMid, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 4 }}>Your service provider</div>
            <div style={{ fontFamily: fontDisplay, fontSize: 20, fontWeight: 500, letterSpacing: "-.3px", color: ink }}>{freelancer?.name}</div>
            {freelancer?.company && <div style={{ fontSize: 13, color: inkMid, marginTop: 2 }}>{freelancer.company}</div>}
          </div>
          <a href={`mailto:${freelancer?.email}`} className="action-btn" style={{ background: card, color: ink, border: `1px solid ${line}`, boxShadow: "0 3px 10px -2px rgba(0,0,0,.04)" }}>
            ✉ Contact
          </a>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Total Billed", value: fmt(totalBilled), color: ink },
            { label: "Paid", value: fmt(totalPaid), color: stamp },
            { label: "Pending", value: pendingCount, color: gold },
          ].map((s, i) => (
            <div key={i} style={{ background: card, border: `1px solid ${line}`, borderRadius: 16, padding: "22px 20px", textAlign: "center" }}>
              <div style={{ fontFamily: fontDisplay, fontSize: 28, fontWeight: 600, color: s.color, marginBottom: 6, letterSpacing: "-.5px", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontFamily: fontMono, fontSize: 10, color: inkMid, letterSpacing: ".14em", textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 22, background: card, border: `1px solid ${line}`, borderRadius: 14, padding: 6 }}>
          {[["all", "All"], ["proposal", "Proposals"], ["contract", "Contracts"], ["invoice", "Invoices"]].map(([id, label]) => (
            <button
              key={id}
              className="tab-btn"
              onClick={() => setActiveTab(id)}
              style={{
                flex: 1,
                background: activeTab === id ? ink : "transparent",
                color: activeTab === id ? "#fff" : inkMid,
                boxShadow: activeTab === id ? "0 10px 22px -10px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.14)" : "none",
              }}
            >{label}</button>
          ))}
        </div>

        {/* Documents */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "56px 24px", color: inkMid, background: card, border: `1px solid ${line}`, borderRadius: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: bgAlt, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>📄</div>
            <div style={{ fontFamily: fontDisplay, fontSize: 18, color: ink, fontWeight: 500, marginBottom: 6 }}>No documents yet</div>
            <div style={{ fontSize: 13.5, color: inkMid }}>Nothing in this category.</div>
          </div>
        ) : filtered.map((doc, i) => {
          const sc = STATUS_COLORS[doc.status] || STATUS_COLORS.draft;
          const signingUrl = `${APP_URL}/sign/${doc.sign_token}`;
          return (
            <div key={doc.id} className="doc-card" style={{ marginBottom: 14, animationDelay: `${i * 0.05}s` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontFamily: fontDisplay, fontSize: 17, fontWeight: 500, letterSpacing: "-.2px", color: ink, marginBottom: 4 }}>{doc.title}</div>
                  <div style={{ fontFamily: fontMono, fontSize: 10.5, color: inkMid, letterSpacing: ".1em", textTransform: "uppercase" }}>
                    {doc.type} · {new Date(doc.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {doc.due_date && <span style={{ color: new Date(doc.due_date) < new Date() ? red : inkMid }}> · Due: {new Date(doc.due_date).toLocaleDateString("en-IN")}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  {doc.amount > 0 && (
                    <div style={{ fontFamily: fontDisplay, fontSize: 20, fontWeight: 600, color: ink, letterSpacing: "-.3px" }}>
                      {fmt(doc.amount, doc.currency)}
                    </div>
                  )}
                  <span style={{
                    fontSize: 10.5, fontWeight: 600, padding: "4px 11px", borderRadius: 100,
                    background: sc.bg, color: sc.color, fontFamily: fontMono,
                    letterSpacing: ".12em", textTransform: "uppercase",
                    border: `1px solid ${sc.border}`,
                  }}>
                    {doc.status}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(doc.status === "pending" || doc.status === "draft") && (
                  <a href={signingUrl} className="action-btn" style={{
                    background: ink, color: "#fff", border: "none",
                    boxShadow: "0 10px 22px -10px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.14)",
                    outline: "1px solid rgba(0,0,0,.3)", outlineOffset: -1,
                  }}>
                    ✍ Review & Sign
                  </a>
                )}
                {doc.status === "signed" && doc.amount > 0 && (
                  <a href={signingUrl} className="action-btn" style={{
                    background: goldSoft, color: ink, border: "none",
                    boxShadow: "0 10px 22px -10px rgba(245,166,35,.5), inset 0 1px 0 rgba(255,255,255,.4)",
                  }}>
                    💳 Pay Deposit
                  </a>
                )}
                {doc.status === "signed" && (
                  <span className="action-btn" style={{ background: stampDim, color: stamp, border: `1px solid ${stamp}40`, cursor: "default" }}>
                    ✓ Signed
                    {doc.signed_at && ` · ${new Date(doc.signed_at).toLocaleDateString("en-IN")}`}
                  </span>
                )}
                {doc.status === "paid" && (
                  <span className="action-btn" style={{ background: stampDim, color: stamp, border: `1px solid ${stamp}40`, cursor: "default" }}>
                    ✓ Paid
                  </span>
                )}
                <a href={signingUrl} className="action-btn" style={{ background: card, color: ink, border: `1px solid ${line}` }}>
                  👁 View
                </a>
              </div>
            </div>
          );
        })}

        <div style={{ textAlign: "center", marginTop: 36, fontFamily: fontMono, fontSize: 11, color: inkFaint, letterSpacing: ".14em", textTransform: "uppercase" }}>
          Powered by <span style={{ color: ink, fontWeight: 600 }}>FlowDocs</span>
        </div>
      </div>
    </div>
  );
}
