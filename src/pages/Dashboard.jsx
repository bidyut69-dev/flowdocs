import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { downloadPDF, generateAuditTrail } from "../lib/pdf";
import { sendSigningEmail } from "../lib/email";
import UpgradeModal from "../components/UpgradeModal";
import AIDocModal from "../components/AIDocModal";
import Templates from "./Templates";

// ── THEME ──────────────────────────────────────────────────────────────
const C = {
  bg: "#0C0C0E", surface: "#141416", surface2: "#1C1C1F", border: "#2A2A2E",
  gold: "#F5A623", goldDim: "#F5A62320", text: "#F0EEE8", dim: "#7A7875",
  mid: "#B0ADA8", green: "#22C55E", greenDim: "#22C55E20", red: "#EF4444",
  redDim: "#EF444420", blue: "#60A5FA", blueDim: "#60A5FA20",
};

// ── SHARED STYLES ──────────────────────────────────────────────────────
const btn = (variant = "primary") => ({
  background: variant === "primary" ? C.gold : "transparent",
  color: variant === "primary" ? "#0C0C0E" : C.mid,
  border: variant === "primary" ? "none" : `1px solid ${C.border}`,
  borderRadius: 8, padding: variant === "primary" ? "10px 20px" : "8px 14px",
  fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
  transition: "all 0.15s", display: "inline-flex", alignItems: "center", gap: 6,
});
const input = {
  width: "100%", background: C.surface2, border: `1px solid ${C.border}`,
  borderRadius: 8, padding: "10px 12px", fontSize: 13.5, color: C.text,
  fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box",
};
const label = {
  fontSize: 10, color: C.dim, letterSpacing: 1.5, textTransform: "uppercase",
  fontFamily: "'DM Mono', monospace", display: "block", marginBottom: 6, marginTop: 14,
};
const card = {
  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20,
};
const badge = (status) => {
  const map = {
    signed: { bg: C.greenDim, color: C.green },
    paid: { bg: C.greenDim, color: C.green },
    pending: { bg: C.goldDim, color: C.gold },
    overdue: { bg: C.redDim, color: C.red },
    draft: { bg: C.surface2, color: C.dim },
  };
  const s = map[status] || map.draft;
  return {
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "4px 10px", borderRadius: 20, fontSize: 11.5,
    fontWeight: 600, fontFamily: "'DM Mono', monospace",
    background: s.bg, color: s.color,
  };
};

// ── TOAST ──────────────────────────────────────────────────────────────
function Toast({ msg, onClose }) {
  useEffect(() => { if (msg) { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); } }, [msg, onClose]);
  if (!msg) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: C.surface, border: `1px solid ${msg.ok ? C.green : C.red}`,
      color: msg.ok ? C.green : C.red, borderRadius: 10, padding: "12px 20px",
      fontSize: 13.5, fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
      animation: "slideUp 0.25s ease",
    }}>
      {msg.text}
    </div>
  );
}

// ── MODAL ──────────────────────────────────────────────────────────────
function Modal({ title, sub, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)",
    }} onClick={onClose}>
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16,
        padding: 32, width: 500, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto",
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: C.text }}>{title}</div>
            {sub && <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>{sub}</div>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.dim, cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── STAT CARD ──────────────────────────────────────────────────────────
function StatCard({ label: lbl, value, sub, accent }) {
  const accentMap = { gold: C.gold, green: C.green, blue: C.blue, red: C.red };
  return (
    <div style={{ ...card, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: accentMap[accent] || C.gold }} />
      <div style={{ fontSize: 10, color: C.dim, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>{lbl}</div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 700, color: C.text, margin: "8px 0 4px" }}>{value}</div>
      <div style={{ fontSize: 12, color: C.dim }}>{sub}</div>
    </div>
  );
}

// ── DASHBOARD MAIN ─────────────────────────────────────────────────────
export default function Dashboard({ session }) {
  const [page, setPage] = useState("dashboard");
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null); // "newDoc" | "newClient"

  const showToast = (text, ok = true) => setToast({ text, ok });

  // New Doc form state
  const [docForm, setDocForm] = useState({ title: "", type: "Proposal", client_id: "", amount: "", description: "" });
  const [invoiceItems, setInvoiceItems] = useState([{ description: "", qty: 1, rate: "" }]);

  // New Client form state
  const [clientForm, setClientForm] = useState({ name: "", email: "", company: "", country: "" });

  // ── Fetch data ──
  const fetchAll = async () => {
    setLoading(true);
    const uid = session.user.id;

    const [{ data: prof }, { data: docs }, { data: cls }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).single(),
      supabase.from("documents").select("*, clients(name, email, company)").eq("user_id", uid).order("created_at", { ascending: false }),
      supabase.from("clients").select("*").eq("user_id", uid).order("name"),
    ]);

    if (prof) setProfile(prof);
    if (docs) setDocuments(docs);
    if (cls) setClients(cls);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Create Document ──
  const createDoc = async () => {
    if (!docForm.title) return showToast("Enter document title", false);
    const content = docForm.type === "Invoice"
      ? { items: invoiceItems.filter(i => i.description) }
      : { description: docForm.description };

    const { data, error } = await supabase.from("documents").insert({
      user_id: session.user.id,
      client_id: docForm.client_id || null,
      title: docForm.title,
      type: docForm.type,
      status: "draft",
      amount: docForm.amount ? parseFloat(docForm.amount) : null,
      content,
    }).select("*, clients(name, email, company)").single();

    if (error) return showToast(error.message, false);
    setDocuments([data, ...documents]);
    setModal(null);
    setDocForm({ title: "", type: "Proposal", client_id: "", amount: "", description: "" });
    setInvoiceItems([{ description: "", qty: 1, rate: "" }]);
    showToast("✓ Document created!");
  };

  // ── Create Client ──
  const createClient = async () => {
    if (!clientForm.name) return showToast("Enter client name", false);
    const { data, error } = await supabase.from("clients").insert({
      user_id: session.user.id, ...clientForm
    }).select().single();
    if (error) return showToast(error.message, false);
    setClients([data, ...clients]);
    setModal(null);
    setClientForm({ name: "", email: "", company: "", country: "" });
    showToast("✓ Client added!");
  };

  // ── Send Document (email + status update) ──
  const sendDoc = async (doc) => {
    const client = clients.find(c => c.id === doc.client_id);
    if (!client?.email) return showToast("Add client email first", false);

    const signingUrl = `${window.location.origin}/sign/${doc.sign_token}`;
    const emailOk = await sendSigningEmail({
      to: client.email,
      clientName: client.name,
      docTitle: doc.title,
      signingUrl,
      fromName: profile?.name || "FlowDocs User",
    });

    const { error } = await supabase.from("documents").update({ status: "pending" }).eq("id", doc.id);
    if (!error) {
      setDocuments(documents.map(d => d.id === doc.id ? { ...d, status: "pending" } : d));
      showToast(emailOk ? "✓ Document sent via email!" : "✓ Status updated! (Add Resend key for email)");
    }
  };

  // ── Download PDF ──
  const handleDownload = (doc) => {
    const client = clients.find(c => c.id === doc.client_id) || doc.clients;
    downloadPDF(doc, profile, client);
    showToast("✓ PDF downloaded!");
  };

  // ── Download Audit Trail ──
  const handleAuditTrail = (doc) => {
    const pdf = generateAuditTrail({
      document: doc,
      signerName: doc.signer_name || "—",
      signerIp: doc.signer_ip || "—",
      signedAt: doc.signed_at,
      signatureUrl: doc.signature_url,
    });
    pdf.save(`AuditTrail-${doc.title.replace(/\s+/g, "-")}.pdf`);
    showToast("✓ Audit trail downloaded!");
  };

  // ── Mark as Paid manually ──
  const markPaid = async (doc) => {
    const { error } = await supabase.from("documents")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", doc.id);
    if (!error) {
      setDocuments(documents.map(d => d.id === doc.id ? { ...d, status: "paid" } : d));
      showToast("✓ Marked as paid!");
    }
  };

  // ── Copy signing link ──
  const copyLink = (doc) => {
    const url = `${window.location.origin}/sign/${doc.sign_token}`;
    navigator.clipboard.writeText(url).then(() => showToast("✓ Signing link copied!"));
  };

  // ── WhatsApp share ──
  const shareWhatsApp = (doc) => {
    const url = `${window.location.origin}/sign/${doc.sign_token}`;
    const client = clients.find(c => c.id === doc.client_id) || doc.clients;
    const msg = `Hi ${client?.name || "there"}, please review and sign this document: *${doc.title}*\n\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // ── Send bulk WhatsApp reminders for all pending docs ──
  const sendBulkWhatsAppReminders = () => {
    const pending = documents.filter(d => d.status === "pending" || d.status === "overdue");
    if (pending.length === 0) return showToast("No pending documents!", false);
    pending.forEach(doc => {
      const url = `${window.location.origin}/sign/${doc.sign_token}`;
      const client = clients.find(c => c.id === doc.client_id) || doc.clients;
      const msg = `Hi ${client?.name || "there"}, just a reminder to review *${doc.title}*. Please take action: ${url}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
    });
    showToast(`✓ Opened ${pending.length} WhatsApp reminder(s)!`);
  };

  // ── Sign out ──
  const signOut = async () => { await supabase.auth.signOut(); };

  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Derived stats ──
  const totalBilled = documents.reduce((s, d) => s + (d.amount || 0), 0);
  const collected = documents.filter(d => d.status === "paid").reduce((s, d) => s + (d.amount || 0), 0);
  const pendingSign = documents.filter(d => d.status === "pending").length;
  const overdue = documents.filter(d => d.status === "overdue").length;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: C.gold, fontFamily: "Syne", fontSize: 18 }}>Loading workspace...</div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        input:focus { border-color: ${C.gold} !important; }
        select:focus { border-color: ${C.gold} !important; }
        textarea:focus { border-color: ${C.gold} !important; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        button:hover { opacity: 0.88; }

        /* ── Mobile Responsive ── */
        .fd-overlay { display: none !important; }
        .fd-sidebar {
          transition: transform 0.25s ease;
        }
        .fd-mobile-header { display: none; }

        @media (max-width: 768px) {
          .fd-sidebar { transform: translateX(-100%); }
          .fd-sidebar.open { transform: translateX(0) !important; }
          .fd-overlay { display: block !important; }
          .fd-main { margin-left: 0 !important; padding: 16px !important; }
          .fd-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .fd-header { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .fd-header-btns { flex-wrap: wrap !important; width: 100% !important; }
          .fd-header-btns button { font-size: 11px !important; padding: 7px 10px !important; }
          .fd-grid2 { grid-template-columns: 1fr !important; }
          .fd-table-wrap { overflow-x: auto !important; -webkit-overflow-scrolling: touch; }
          .fd-table td:nth-child(3), .fd-table th:nth-child(3),
          .fd-table td:nth-child(5), .fd-table th:nth-child(5) { display: none !important; }
          .fd-mobile-header { display: flex !important; align-items: center; justify-content: space-between; padding: 14px 16px; background: ${C.surface}; border-bottom: 1px solid ${C.border}; position: sticky; top: 0; z-index: 8; margin: -16px -16px 16px; }
        }
        @media (max-width: 480px) {
          .fd-stats-grid { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
          .fd-header-btns button { font-size: 10px !important; padding: 6px 8px !important; }
        }
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
            zIndex: 9, display: "none",
          }}
          className="fd-overlay"
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={sidebarOpen ? "fd-sidebar open" : "fd-sidebar"}
        style={{
          width: 220, background: C.surface, borderRight: `1px solid ${C.border}`,
          display: "flex", flexDirection: "column", padding: "24px 0",
          position: "fixed", height: "100vh", zIndex: 10,
          overflowY: "auto",
        }}
      >
        <div style={{ padding: "0 20px 24px", borderBottom: `1px solid ${C.border}`, marginBottom: 16 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: C.gold }}>⚡ FlowDocs</div>
          <div style={{ fontSize: 10, color: C.dim, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>
            {profile?.name || session.user.email}
          </div>
        </div>

        <div style={{ fontSize: 10, color: C.dim, padding: "0 20px 8px", letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>Workspace</div>

        {[
          { id: "dashboard", icon: "⊞", label: "Dashboard" },
          { id: "documents", icon: "◈", label: "Documents" },
          { id: "templates", icon: "⬡", label: "Templates" },
          { id: "esign", icon: "✍", label: "eSign" },
          { id: "invoices", icon: "◎", label: "Invoices" },
          { id: "clients", icon: "👤", label: "Clients" },
        ].map(n => (
          <div key={n.id}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 20px", cursor: "pointer", fontSize: 13.5,
              color: page === n.id ? C.gold : C.dim,
              background: page === n.id ? C.goldDim : "transparent",
              borderLeft: `2px solid ${page === n.id ? C.gold : "transparent"}`,
              transition: "all 0.15s", fontWeight: page === n.id ? 600 : 400,
            }}
            onClick={() => { setPage(n.id); setSidebarOpen(false); }}
          >
            <span style={{ width: 20, textAlign: "center", fontSize: 15 }}>{n.icon}</span> {n.label}
          </div>
        ))}

        <div style={{ marginTop: "auto" }}>
          <div style={{ padding: "0 20px 16px" }}>
            {profile?.plan === "pro" ? (
              <div style={{ background: C.goldDim, border: `1px solid ${C.gold}`, borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, fontFamily: "'DM Mono', monospace" }}>⚡ PRO PLAN</div>
                <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>Unlimited docs</div>
              </div>
            ) : (
              <div style={{ marginBottom: 12 }}>
                <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.dim, fontFamily: "'DM Mono', monospace" }}>FREE PLAN</div>
                  <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{documents.length} / 3 docs used</div>
                  <div style={{ background: C.border, borderRadius: 4, height: 3, marginTop: 6 }}>
                    <div style={{ width: `${Math.min((documents.length / 3) * 100, 100)}%`, height: "100%", background: documents.length >= 3 ? C.red : C.gold, borderRadius: 4 }} />
                  </div>
                </div>
                <button onClick={() => setShowUpgrade(true)} style={{
                  width: "100%", background: C.gold, color: "#0C0C0E", border: "none",
                  borderRadius: 8, padding: "9px", fontSize: 12, fontWeight: 700,
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                }}>⚡ Upgrade to Pro</button>
              </div>
            )}
            <div onClick={signOut} style={{ fontSize: 12, color: C.dim, cursor: "pointer", padding: "8px 0", display: "flex", alignItems: "center", gap: 8 }}>⏏ Sign out</div>
          </div>
        </div>
      </aside>

      {/* ── UPGRADE MODAL ── */}
      {showUpgrade && (
        <UpgradeModal
          session={session}
          profile={profile}
          onClose={() => setShowUpgrade(false)}
          onUpgraded={() => { fetchAll(); setShowUpgrade(false); }}
        />
      )}

      {/* ── AI MODAL ── */}
      {showAI && (
        <AIDocModal
          profile={profile}
          onClose={() => setShowAI(false)}
          onGenerated={(data) => {
            if (data.type === "invoice_items") {
              setDocForm(f => ({ ...f, type: "Invoice", title: data.title, client_id: clients.find(c => c.name === data.clientName)?.id || "" }));
              setInvoiceItems(data.items.map(i => ({ description: i.description, qty: i.qty || 1, rate: i.rate || 0 })));
              setShowAI(false);
              setModal("newDoc");
            } else {
              setDocForm(f => ({ ...f, type: data.type === "nda" ? "NDA" : data.type === "contract" ? "Contract" : "Proposal", title: data.title, description: data.text, client_id: clients.find(c => c.name === data.clientName)?.id || "" }));
            }
          }}
        />
      )}

      {/* ── MAIN ── */}
      <main className="fd-main" style={{ marginLeft: 220, flex: 1, padding: 32, minHeight: "100vh" }}>

        {/* Mobile top bar */}
        <div className="fd-mobile-header">
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, color: C.gold }}>⚡ FlowDocs</div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: `1px solid ${C.border}`, color: C.mid, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 18 }}>☰</button>
        </div>

        {/* ─── DASHBOARD ─── */}
        {page === "dashboard" && (
          <>
            <div className="fd-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, color: C.text }}>
                  Good morning, {profile?.name?.split(" ")[0] || "there"} 👋
                </div>
                <div style={{ fontSize: 13, color: C.dim, marginTop: 4 }}>
                  {pendingSign} pending signature{pendingSign !== 1 ? "s" : ""} · {overdue} overdue
                </div>
              </div>
              <div className="fd-header-btns" style={{ display: "flex", gap: 10 }}>
                {(documents.filter(d => d.status === "pending" || d.status === "overdue").length > 0) && (
                  <button style={{ ...btn("ghost"), borderColor: "#22C55E", color: "#22C55E", background: "#22C55E18", fontSize: 12 }} onClick={sendBulkWhatsAppReminders}>
                    💬 WhatsApp Reminders ({documents.filter(d => d.status === "pending" || d.status === "overdue").length})
                  </button>
                )}
                <button style={{ ...btn("ghost"), borderColor: "#60A5FA", color: "#60A5FA", background: "#60A5FA18" }} onClick={() => setShowAI(true)}>✨ AI Generate</button>
                <button style={btn()} onClick={() => setModal("newDoc")}>+ New Document</button>
              </div>
            </div>

            <div className="fd-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
              <StatCard label="Total Billed" value={`$${totalBilled.toLocaleString()}`} sub="All time" accent="gold" />
              <StatCard label="Collected" value={`$${collected.toLocaleString()}`} sub="Paid invoices" accent="green" />
              <StatCard label="Pending Sign" value={pendingSign} sub="Awaiting response" accent="blue" />
              <StatCard label="Overdue" value={overdue} sub="Action needed" accent="red" />
            </div>

            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 14 }}>Recent Documents</div>
            <DocsTable docs={documents.slice(0, 6)} clients={clients} onSend={sendDoc} onDownload={handleDownload} onCopyLink={copyLink} onWhatsApp={shareWhatsApp} onMarkPaid={markPaid} onAuditTrail={handleAuditTrail} onNew={() => setModal("newDoc")} />
          </>
        )}

        {/* ─── DOCUMENTS ─── */}
        {page === "documents" && (
          <>
            <PageHeader title="Documents" sub={`${documents.length} total`} onNew={() => setModal("newDoc")} btnLabel="+ New Document" />
            <DocsTable docs={documents} clients={clients} onSend={sendDoc} onDownload={handleDownload} onCopyLink={copyLink} onWhatsApp={shareWhatsApp} onMarkPaid={markPaid} onAuditTrail={handleAuditTrail} onNew={() => setModal("newDoc")} />
          </>
        )}

        {/* ─── TEMPLATES ─── */}
        {page === "templates" && (
          <>
            <PageHeader title="Templates" sub="Ready-to-use proposals, contracts & NDAs" onNew={() => setModal("newDoc")} btnLabel="+ Blank Document" />
            <Templates
              session={session}
              profile={profile}
              onUse={(doc) => {
                setDocuments(prev => [doc, ...prev]);
                setPage("documents");
                showToast("✓ Template added to documents!");
              }}
            />
          </>
        )}
        {page === "esign" && (
          <>
            <PageHeader title="eSign" sub="Track signature status in real-time" onNew={() => setModal("newDoc")} btnLabel="+ New Signing Request" />
            <ESignPage docs={documents} clients={clients} onSend={sendDoc} onCopyLink={copyLink} />
          </>
        )}

        {/* ─── INVOICES ─── */}
        {page === "invoices" && (
          <>
            <PageHeader title="Invoices" sub="Billing & payment tracking" onNew={() => { setDocForm(f => ({ ...f, type: "Invoice" })); setModal("newDoc"); }} btnLabel="+ New Invoice" />
            <DocsTable docs={documents.filter(d => d.type === "Invoice")} clients={clients} onSend={sendDoc} onDownload={handleDownload} onCopyLink={copyLink} onWhatsApp={shareWhatsApp} onMarkPaid={markPaid} onAuditTrail={handleAuditTrail} onNew={() => setModal("newDoc")} />
          </>
        )}

        {/* ─── CLIENTS ─── */}
        {page === "clients" && (
          <>
            <PageHeader title="Clients" sub={`${clients.length} active clients`} onNew={() => setModal("newClient")} btnLabel="+ Add Client" />
            <ClientsPage clients={clients} documents={documents} />
          </>
        )}
      </main>

      {/* ── MODALS ── */}

      {/* New Document Modal */}
      {modal === "newDoc" && (
        <Modal title="New Document" sub="Create a proposal, contract, or invoice" onClose={() => setModal(null)}>
          <label style={label}>Document Type</label>
          <select style={{ ...input, color: C.text, background: C.surface2 }}
            value={docForm.type} onChange={e => setDocForm({ ...docForm, type: e.target.value })}>
            <option>Proposal</option><option>Contract</option><option>Invoice</option><option>NDA</option>
          </select>

          <label style={label}>Document Title</label>
          <input style={input} placeholder="e.g. Website Redesign Proposal" value={docForm.title}
            onChange={e => setDocForm({ ...docForm, title: e.target.value })} />

          <label style={label}>Client</label>
          <select style={{ ...input, color: C.text, background: C.surface2 }}
            value={docForm.client_id} onChange={e => setDocForm({ ...docForm, client_id: e.target.value })}>
            <option value="">— Select Client —</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {docForm.type !== "Invoice" && (
            <>
              <label style={label}>Amount (USD)</label>
              <input style={input} placeholder="e.g. 1500" type="number" value={docForm.amount}
                onChange={e => setDocForm({ ...docForm, amount: e.target.value })} />
              <label style={label}>Description</label>
              <textarea style={{ ...input, minHeight: 80, resize: "vertical" }}
                placeholder="Describe the scope of work..."
                value={docForm.description} onChange={e => setDocForm({ ...docForm, description: e.target.value })} />
            </>
          )}

          {docForm.type === "Invoice" && (
            <>
              <label style={label}>Invoice Items</label>
              {invoiceItems.map((item, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 56px 80px 32px", gap: 8, marginBottom: 8 }}>
                  <input style={input} placeholder="Description" value={item.description}
                    onChange={e => { const it = [...invoiceItems]; it[i].description = e.target.value; setInvoiceItems(it); }} />
                  <input style={input} placeholder="Qty" type="number" value={item.qty}
                    onChange={e => { const it = [...invoiceItems]; it[i].qty = e.target.value; setInvoiceItems(it); }} />
                  <input style={input} placeholder="Rate $" type="number" value={item.rate}
                    onChange={e => { const it = [...invoiceItems]; it[i].rate = e.target.value; setInvoiceItems(it); }} />
                  <button onClick={() => setInvoiceItems(invoiceItems.filter((_, j) => j !== i))}
                    style={{ background: C.redDim, border: `1px solid ${C.red}`, color: C.red, borderRadius: 8, cursor: "pointer" }}>×</button>
                </div>
              ))}
              <button style={{ ...btn("ghost"), marginTop: 4, fontSize: 12 }}
                onClick={() => setInvoiceItems([...invoiceItems, { description: "", qty: 1, rate: "" }])}>
                + Add Item
              </button>
            </>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
            <button style={btn("ghost")} onClick={() => setModal(null)}>Cancel</button>
            <button style={btn()} onClick={createDoc}>Create Document →</button>
          </div>
        </Modal>
      )}

      {/* New Client Modal */}
      {modal === "newClient" && (
        <Modal title="Add Client" sub="Add a new client to your workspace" onClose={() => setModal(null)}>
          <label style={label}>Name *</label>
          <input style={input} placeholder="John Smith" value={clientForm.name}
            onChange={e => setClientForm({ ...clientForm, name: e.target.value })} />
          <label style={label}>Email</label>
          <input style={input} type="email" placeholder="john@company.com" value={clientForm.email}
            onChange={e => setClientForm({ ...clientForm, email: e.target.value })} />
          <label style={label}>Company</label>
          <input style={input} placeholder="Acme Corp" value={clientForm.company}
            onChange={e => setClientForm({ ...clientForm, company: e.target.value })} />
          <label style={label}>Country</label>
          <input style={input} placeholder="USA" value={clientForm.country}
            onChange={e => setClientForm({ ...clientForm, country: e.target.value })} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
            <button style={btn("ghost")} onClick={() => setModal(null)}>Cancel</button>
            <button style={btn()} onClick={createClient}>Add Client →</button>
          </div>
        </Modal>
      )}

      <Toast msg={toast} onClose={() => setToast(null)} />
    </div>
  );
}

// ── PAGE HEADER ─────────────────────────────────────────────────────────
function PageHeader({ title, sub, onNew, btnLabel }) {
  return (
    <div className="fd-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
      <div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, color: C.text }}>{title}</div>
        <div style={{ fontSize: 13, color: C.dim, marginTop: 4 }}>{sub}</div>
      </div>
      <button style={btn()} onClick={onNew}>{btnLabel}</button>
    </div>
  );
}

// ── DOCUMENTS TABLE ─────────────────────────────────────────────────────
function DocsTable({ docs, clients, onSend, onDownload, onCopyLink, onWhatsApp, onMarkPaid, onAuditTrail, onNew }) {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? docs : docs.filter(d => d.type === filter || d.status === filter.toLowerCase());

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: C.dim }}>{filtered.length} document{filtered.length !== 1 ? "s" : ""}</div>
        <div style={{ display: "flex", gap: 4, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 4 }}>
          {["All", "Proposal", "Contract", "Invoice"].map(f => (
            <button key={f}
              style={{
                padding: "5px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer", border: "none",
                background: filter === f ? C.surface2 : "transparent", color: filter === f ? C.text : C.dim,
                fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
              }}
              onClick={() => setFilter(f)}
            >{f}</button>
          ))}
        </div>
      </div>

      <div className="fd-table-wrap" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        <table className="fd-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Document", "Type", "Status", "Amount", "Date", "Actions"].map(h => (
                <th key={h} style={{
                  textAlign: "left", padding: "12px 16px", fontSize: 10, color: C.dim,
                  textTransform: "uppercase", letterSpacing: 1, fontFamily: "'DM Mono', monospace", fontWeight: 500,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: 48, color: C.dim, fontSize: 13 }}>
                No documents yet. <span style={{ color: C.gold, cursor: "pointer" }} onClick={onNew}>Create one →</span>
              </td></tr>
            ) : filtered.map(doc => {
              const client = clients.find(c => c.id === doc.client_id) || doc.clients;
              return (
                <tr key={doc.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{doc.title}</div>
                    <div style={{ fontSize: 12, color: C.dim, marginTop: 2 }}>{client?.name || "—"}</div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 11, color: C.dim, fontFamily: "'DM Mono', monospace" }}>{doc.type}</span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={badge(doc.status)}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                      {doc.status?.charAt(0).toUpperCase() + doc.status?.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: C.text }}>
                      {doc.amount ? `$${Number(doc.amount).toFixed(2)}` : "—"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 11, color: C.dim, fontFamily: "'DM Mono', monospace" }}>
                      {new Date(doc.created_at).toLocaleDateString("en-IN")}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {doc.status === "draft" && (
                        <button style={{ ...btn("ghost"), fontSize: 11.5, padding: "5px 10px", color: C.gold, borderColor: C.gold, background: C.goldDim }}
                          onClick={() => onSend(doc)}>Send ↗</button>
                      )}
                      {(doc.status === "pending" || doc.status === "overdue") && doc.type === "Invoice" && (
                        <button style={{ ...btn("ghost"), fontSize: 11.5, padding: "5px 10px", color: C.green, borderColor: C.green, background: C.greenDim }}
                          onClick={() => onMarkPaid?.(doc)}>✓ Paid</button>
                      )}
                      {doc.sign_token && (
                        <>
                          <button style={{ ...btn("ghost"), fontSize: 11.5, padding: "5px 10px" }}
                            onClick={() => onCopyLink(doc)}>Copy Link</button>
                          <button style={{ ...btn("ghost"), fontSize: 11.5, padding: "5px 10px", color: "#22C55E", borderColor: "#22C55E", background: "#22C55E18" }}
                            onClick={() => onWhatsApp(doc)}>💬</button>
                        </>
                      )}
                      {doc.status === "signed" && (
                        <button style={{ ...btn("ghost"), fontSize: 11.5, padding: "5px 10px", color: "#60A5FA", borderColor: "#60A5FA", background: "#60A5FA18" }}
                          onClick={() => onAuditTrail?.(doc)}>🔏 Audit</button>
                      )}
                      <button style={{ ...btn("ghost"), fontSize: 11.5, padding: "5px 10px" }}
                        onClick={() => onDownload(doc)}>PDF ↓</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ── ESIGN PAGE ──────────────────────────────────────────────────────────
function ESignPage({ docs, clients, onSend, onCopyLink }) {
  const signingDocs = docs.filter(d => ["pending", "signed", "draft"].includes(d.status));
  return (
    <div>
      {signingDocs.length === 0 ? (
        <div style={{ textAlign: "center", padding: 64, color: C.dim }}>No documents to track yet.</div>
      ) : signingDocs.map(doc => {
        const client = clients.find(c => c.id === doc.client_id) || doc.clients;
        const progress = doc.status === "signed" ? 100 : doc.status === "pending" ? 50 : 0;
        const hasEmail = !!client?.email;
        return (
          <div key={doc.id} style={{ ...card, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, color: C.text }}>{doc.title}</div>
                <div style={{ fontSize: 12, color: C.dim, marginTop: 3 }}>
                  {client?.name || "No client"} · {doc.type}
                  {doc.signed_at && ` · Signed ${new Date(doc.signed_at).toLocaleDateString()}`}
                </div>
              </div>
              <span style={badge(doc.status)}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                {doc.status === "signed" ? "Complete" : doc.status === "pending" ? "In Progress" : "Not Sent"}
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ background: C.surface2, borderRadius: 4, height: 4, marginBottom: 14, overflow: "hidden" }}>
              <div style={{ width: `${progress}%`, height: "100%", background: C.gold, borderRadius: 4, transition: "width 0.5s" }} />
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ flex: 1, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {client && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "5px 12px",
                    background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 20, fontSize: 12, color: C.mid,
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: doc.status === "signed" ? C.green : C.dim }} />
                    {client.name} {doc.status === "signed" ? "✓ Signed" : "· Waiting"}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                {doc.status === "draft" && (
                  <>
                    {hasEmail ? (
                      <button style={{ ...btn(), fontSize: 12, padding: "7px 14px" }} onClick={() => onSend(doc)}>
                        📧 Send via Email →
                      </button>
                    ) : (
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: C.dim }}>No email — share link:</span>
                        <button style={{ ...btn(), fontSize: 12, padding: "7px 14px" }} onClick={() => onSend(doc)}>
                          Send & Get Link →
                        </button>
                      </div>
                    )}
                  </>
                )}
                {(doc.status === "pending" || doc.status === "draft") && doc.sign_token && (
                  <button style={{ ...btn("ghost"), fontSize: 12, padding: "7px 14px" }} onClick={() => onCopyLink(doc)}>
                    🔗 Copy Link
                  </button>
                )}
              </div>
            </div>

            {/* No email warning */}
            {doc.status === "draft" && !hasEmail && (
              <div style={{ marginTop: 10, background: C.goldDim, border: `1px solid ${C.gold}`, borderRadius: 8, padding: "8px 12px", fontSize: 12, color: C.gold }}>
                ⚠️ Client email not added — you can still share the signing link via WhatsApp or manually.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── CLIENTS PAGE ────────────────────────────────────────────────────────
function ClientsPage({ clients, documents }) {
  return (
    <div>
      {clients.length === 0 ? (
        <div style={{ textAlign: "center", padding: 64, color: C.dim }}>No clients yet. Add your first client!</div>
      ) : clients.map(c => {
        const clientDocs = documents.filter(d => d.client_id === c.id);
        const total = clientDocs.reduce((s, d) => s + (d.amount || 0), 0);
        const colors = ["#3B82F6", "#F5A623", "#22C55E", "#A78BFA", "#F43F5E"];
        const color = colors[clients.indexOf(c) % colors.length];
        return (
          <div key={c.id} style={{
            ...card, display: "flex", alignItems: "center", gap: 16, marginBottom: 12,
            cursor: "pointer", transition: "border-color 0.15s",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10, flexShrink: 0,
              background: color + "20", color, display: "flex", alignItems: "center",
              justifyContent: "center", fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800,
            }}>{c.name[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{c.name}</div>
              <div style={{ fontSize: 12, color: C.dim, marginTop: 2 }}>
                {c.company && `${c.company} · `}{c.country || ""}{c.email && ` · ${c.email}`}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: C.text }}>${total.toFixed(2)}</div>
              <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{clientDocs.length} document{clientDocs.length !== 1 ? "s" : ""}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}