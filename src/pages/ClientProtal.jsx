// src/pages/ClientPortal.jsx
// Route: /portal/:freelancerId/:clientEmail
// Client apne saare documents ek jagah dekh sakta hai

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

const C = {
  bg: "#0C0C0E", surface: "#141416", surface2: "#1C1C1F", border: "#2A2A2E",
  gold: "#F5A623", goldDim: "#F5A62318", text: "#F0EEE8", dim: "#7A7875",
  mid: "#B0ADA8", green: "#22C55E", greenDim: "#22C55E18",
  red: "#EF4444", redDim: "#EF444418", blue: "#60A5FA",
};

const sym = (cur) => ({ INR: "₹", USD: "$", EUR: "€", GBP: "£" }[cur] || cur);
const fmt = (amt, cur = "INR") => `${sym(cur)}${Number(amt || 0).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;

const STATUS_COLORS = {
  draft:   { bg: C.surface2, color: C.dim },
  pending: { bg: C.goldDim,  color: C.gold },
  signed:  { bg: C.greenDim, color: C.green },
  paid:    { bg: C.greenDim, color: C.green },
  overdue: { bg: C.redDim,   color: C.red },
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

      // 1. Freelancer profile
      const { data: prof } = await supabase
        .from("profiles")
        .select("id, name, company, email")
        .eq("id", freelancerId)
        .single();

      if (!prof) { setError("Freelancer not found."); setLoading(false); return; }
      setFreelancer(prof);

      // 2. Client by email
      const decodedEmail = decodeURIComponent(clientEmail);
      const { data: cl } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", freelancerId)
        .eq("email", decodedEmail)
        .single();

      if (!cl) { setError("Client not found. Contact your service provider."); setLoading(false); return; }
      setClient(cl);

      // 3. Documents for this client
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

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
      <div style={{ textAlign: "center", color: C.dim }}>
        <div style={{ width: 28, height: 28, border: `3px solid ${C.border}`, borderTopColor: C.gold, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        Loading your documents...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", padding: 24 }}>
      <div style={{ background: C.redDim, border: `1px solid ${C.red}`, borderRadius: 14, padding: 32, textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
        <div style={{ color: C.red, fontWeight: 700, marginBottom: 8 }}>{error}</div>
        <div style={{ fontSize: 13, color: C.dim }}>Contact your service provider for access.</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, system-ui, sans-serif", color: C.text }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        .doc-card { background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 14px; padding: 20px; transition: border-color .2s; animation: fadeUp .4s ease both; }
        .doc-card:hover { border-color: ${C.gold}40; }
        .tab-btn { padding: 7px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all .2s; font-family: inherit; }
        .action-btn { padding: 9px 18px; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all .2s; display: inline-flex; align-items: center; gap: 6px; text-decoration: none; }
      `}</style>

      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "20px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: C.gold, letterSpacing: 2, fontFamily: "monospace", marginBottom: 4 }}>CLIENT PORTAL</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.gold }}>⚡ FlowDocs</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{client?.name}</div>
            <div style={{ fontSize: 12, color: C.dim }}>{client?.company || client?.email}</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 20px" }}>

        {/* Freelancer info */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 22px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: C.dim, marginBottom: 3 }}>Your service provider</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{freelancer?.name}</div>
            {freelancer?.company && <div style={{ fontSize: 13, color: C.dim }}>{freelancer.company}</div>}
          </div>
          <a href={`mailto:${freelancer?.email}`} style={{ fontSize: 13, color: C.gold, textDecoration: "none", border: `1px solid ${C.gold}40`, borderRadius: 8, padding: "7px 14px" }}>
            ✉ Contact
          </a>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total Billed", value: fmt(totalBilled), color: C.gold },
            { label: "Paid", value: fmt(totalPaid), color: C.green },
            { label: "Pending Action", value: pendingCount, color: C.blue },
          ].map((s, i) => (
            <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 18px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: C.dim }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 5 }}>
          {[["all", "All"], ["proposal", "Proposals"], ["contract", "Contracts"], ["invoice", "Invoices"]].map(([id, label]) => (
            <button key={id} className="tab-btn" onClick={() => setActiveTab(id)} style={{
              flex: 1, background: activeTab === id ? C.gold : "transparent",
              color: activeTab === id ? "#0C0C0E" : C.dim,
            }}>{label}</button>
          ))}
        </div>

        {/* Documents */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px", color: C.dim, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
            No documents in this category yet.
          </div>
        ) : filtered.map((doc, i) => {
          const sc = STATUS_COLORS[doc.status] || STATUS_COLORS.draft;
          const signingUrl = `${APP_URL}/sign/${doc.sign_token}`;
          return (
            <div key={doc.id} className="doc-card" style={{ marginBottom: 12, animationDelay: `${i * 0.05}s` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{doc.title}</div>
                  <div style={{ fontSize: 12, color: C.dim }}>
                    {doc.type} · {new Date(doc.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {doc.due_date && <span style={{ color: new Date(doc.due_date) < new Date() ? C.red : C.dim }}> · Due: {new Date(doc.due_date).toLocaleDateString("en-IN")}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {doc.amount > 0 && (
                    <div style={{ fontSize: 16, fontWeight: 800, color: C.gold, fontFamily: "monospace" }}>
                      {fmt(doc.amount, doc.currency)}
                    </div>
                  )}
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: sc.bg, color: sc.color, fontFamily: "monospace" }}>
                    {doc.status?.charAt(0).toUpperCase() + doc.status?.slice(1)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(doc.status === "pending" || doc.status === "draft") && (
                  <a href={signingUrl} className="action-btn" style={{ background: C.gold, color: "#0C0C0E", border: "none" }}>
                    ✍ Review & Sign
                  </a>
                )}
                {doc.status === "signed" && doc.amount > 0 && (
                  <a href={signingUrl} className="action-btn" style={{ background: C.greenDim, color: C.green, border: `1px solid ${C.green}40` }}>
                    💳 Pay Deposit
                  </a>
                )}
                {doc.status === "signed" && (
                  <span className="action-btn" style={{ background: C.greenDim, color: C.green, border: `1px solid ${C.green}40`, cursor: "default" }}>
                    ✓ Signed
                    {doc.signed_at && ` · ${new Date(doc.signed_at).toLocaleDateString("en-IN")}`}
                  </span>
                )}
                {doc.status === "paid" && (
                  <span className="action-btn" style={{ background: C.greenDim, color: C.green, border: `1px solid ${C.green}40`, cursor: "default" }}>
                    ✓ Paid
                  </span>
                )}
                <a href={signingUrl} className="action-btn" style={{ background: "transparent", color: C.mid, border: `1px solid ${C.border}` }}>
                  👁 View
                </a>
              </div>
            </div>
          );
        })}

        <div style={{ textAlign: "center", marginTop: 32, fontSize: 12, color: C.dim }}>
          Powered by <span style={{ color: C.gold }}>⚡ FlowDocs</span>
        </div>
      </div>
    </div>
  );
}