import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { downloadPDF } from "../lib/pdf";
import { sendSigningEmail, sendReminderEmail } from "../lib/email";
import UpgradeModal from "../components/UpgradeModal";
import AIDocModal from "../components/AIDocModal";
import Templates from "./Templates";

// ── THEME ──────────────────────────────────────────────────────────────
const C = {
  bg: "#0C0C0E", surface: "#141416", surface2: "#1C1C1F", border: "#2A2A2E",
  gold: "#F5A623", goldDim: "#F5A62320", text: "#F0EEE8", dim: "#7A7875",
  mid: "#B0ADA8", green: "#22C55E", greenDim: "#22C55E20", red: "#EF4444",
  redDim: "#EF444420", blue: "#60A5FA", blueDim: "#60A5FA20",
  purple: "#A78BFA", purpleDim: "#A78BFA20",
};

const APP_URL = import.meta.env.VITE_APP_URL?.replace(/\/$/, "") || window.location.origin;

// ── CURRENCIES ─────────────────────────────────────────────────────────
const CURRENCIES = {
  INR: { symbol: "₹", name: "Indian Rupee" },
  USD: { symbol: "$", name: "US Dollar" },
  EUR: { symbol: "€", name: "Euro" },
  GBP: { symbol: "£", name: "British Pound" },
  AED: { symbol: "د.إ", name: "UAE Dirham" },
  CAD: { symbol: "CA$", name: "Canadian Dollar" },
  AUD: { symbol: "A$", name: "Australian Dollar" },
  SGD: { symbol: "S$", name: "Singapore Dollar" },
};
const fmtCur = (amount, cur = "INR") => `${CURRENCIES[cur]?.symbol || "₹"}${Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

// ── GST HELPERS ────────────────────────────────────────────────────────
const INDIAN_STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh","Chandigarh","Puducherry","Lakshadweep","Andaman & Nicobar"];

const calcGST = (subtotal, taxType, taxRate = 18) => {
  if (taxType === "cgst_sgst") return { cgst: subtotal * taxRate / 200, sgst: subtotal * taxRate / 200, igst: 0, total: subtotal * (1 + taxRate / 100) };
  if (taxType === "igst") return { cgst: 0, sgst: 0, igst: subtotal * taxRate / 100, total: subtotal * (1 + taxRate / 100) };
  return { cgst: 0, sgst: 0, igst: 0, total: subtotal };
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
function Modal({ title, sub, onClose, children, width = 500 }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)",
    }} onClick={onClose}>
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16,
        padding: 32, width, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto",
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
  const accentMap = { gold: C.gold, green: C.green, blue: C.blue, red: C.red, purple: C.purple };
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
  const [modal, setModal] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showToast = (text, ok = true) => setToast({ text, ok });

  // New Doc form state
  const [docForm, setDocForm] = useState({
    title: "", type: "Proposal", client_id: "", amount: "", description: "",
    currency: "INR", tax_type: "none", tax_rate: "18", hsn_sac: "",
    due_date: "", recurring_frequency: "", notes: "",
  });
  const [invoiceItems, setInvoiceItems] = useState([{ description: "", qty: 1, rate: "" }]);

  // New Client form state
  const [clientForm, setClientForm] = useState({ name: "", email: "", company: "", country: "", phone: "", gstin: "", state: "", address: "" });

  // Edit document state
  const [editDoc, setEditDoc] = useState(null);
  const [editForm, setEditForm] = useState({});

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

    // Free plan limit check
    if (profile?.plan !== "pro" && profile?.plan !== "solo" && documents.length >= 3) {
      setModal(null);
      setShowUpgrade(true);
      showToast("Free plan mein sirf 3 documents — Pro upgrade karo!", false);
      return;
    }

    const invItems = invoiceItems.filter(i => i.description);
    const subtotal = docForm.type === "Invoice"
      ? invItems.reduce((s, i) => s + (i.qty || 1) * (i.rate || 0), 0)
      : parseFloat(docForm.amount) || 0;

    const gst = calcGST(subtotal, docForm.tax_type, parseFloat(docForm.tax_rate) || 18);
    const content = docForm.type === "Invoice"
      ? { items: invItems }
      : { description: docForm.description };

    const { data, error } = await supabase.from("documents").insert({
      user_id: session.user.id,
      client_id: docForm.client_id || null,
      title: docForm.title,
      type: docForm.type,
      status: "draft",
      amount: gst.total,
      subtotal,
      currency: docForm.currency,
      tax_type: docForm.tax_type,
      tax_rate: parseFloat(docForm.tax_rate) || 18,
      tax_amount: gst.cgst + gst.sgst + gst.igst,
      hsn_sac: docForm.hsn_sac || null,
      due_date: docForm.due_date || null,
      recurring_frequency: docForm.recurring_frequency || null,
      recurring_active: !!docForm.recurring_frequency,
      recurring_next_date: docForm.recurring_frequency ? docForm.due_date : null,
      notes: docForm.notes || null,
      content,
    }).select("*, clients(name, email, company)").single();

    if (error) return showToast(error.message, false);
    setDocuments([data, ...documents]);
    setModal(null);
    setDocForm({ title: "", type: "Proposal", client_id: "", amount: "", description: "", currency: "INR", tax_type: "none", tax_rate: "18", hsn_sac: "", due_date: "", recurring_frequency: "", notes: "" });
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
    setClientForm({ name: "", email: "", company: "", country: "", phone: "", gstin: "", state: "", address: "" });
    showToast("✓ Client added!");
  };

  // ── Edit Document ──
  const openEditDoc = (doc) => {
    setEditDoc(doc);
    setEditForm({
      title: doc.title,
      client_id: doc.client_id || "",
      description: doc.content?.description || "",
      amount: doc.amount || "",
      currency: doc.currency || "INR",
      tax_type: doc.tax_type || "none",
      tax_rate: doc.tax_rate || "18",
      hsn_sac: doc.hsn_sac || "",
      due_date: doc.due_date || "",
      notes: doc.notes || "",
      status: doc.status,
    });
    setModal("editDoc");
  };

  const saveEditDoc = async () => {
    if (!editDoc) return;
    const subtotal = parseFloat(editForm.amount) || editDoc.subtotal || 0;
    const gst = calcGST(subtotal, editForm.tax_type, parseFloat(editForm.tax_rate) || 18);

    const { error } = await supabase.from("documents").update({
      title: editForm.title,
      client_id: editForm.client_id || null,
      content: editDoc.type === "Invoice" ? editDoc.content : { description: editForm.description },
      amount: gst.total,
      subtotal,
      currency: editForm.currency,
      tax_type: editForm.tax_type,
      tax_rate: parseFloat(editForm.tax_rate) || 18,
      tax_amount: gst.cgst + gst.sgst + gst.igst,
      hsn_sac: editForm.hsn_sac || null,
      due_date: editForm.due_date || null,
      notes: editForm.notes || null,
      status: editForm.status,
    }).eq("id", editDoc.id);

    if (error) return showToast(error.message, false);
    await fetchAll();
    setModal(null);
    setEditDoc(null);
    showToast("✓ Document updated!");
  };

  // ── Send Document (email + status update) ──
  const sendDoc = async (doc) => {
    const client = clients.find(c => c.id === doc.client_id);
    if (!client?.email) return showToast("Client ka email add karo pehle", false);

    const signingUrl = `${APP_URL}/sign/${doc.sign_token}`;
    let emailOk = false;
    try {
      emailOk = await sendSigningEmail({
        to: client.email,
        clientName: client.name,
        docTitle: doc.title,
        signingUrl,
        fromName: profile?.name || "FlowDocs User",
      });
    } catch (e) {
      console.error("Email error:", e);
    }

    const { error } = await supabase.from("documents").update({
      status: "pending",
    }).eq("id", doc.id);

    if (error) return showToast("Status update failed: " + error.message, false);
    setDocuments(documents.map(d => d.id === doc.id ? { ...d, status: "pending" } : d));
    if (emailOk) {
      showToast(`✓ Email sent to ${client.email}!`);
    } else {
      showToast("✓ Status → Pending! (Email bhejne ke liye Resend API key set karo)", true);
    }
  };

  // ── Send Reminder ──
  const sendReminder = async (doc) => {
    const client = clients.find(c => c.id === doc.client_id) || doc.clients;
    if (!client) return showToast("Client nahi mila", false);

    const signingUrl = doc.sign_token
      ? `${APP_URL}/sign/${doc.sign_token}`
      : null;

    // WhatsApp reminder (always works)
    if (client.phone) {
      const isInvoice = doc.type === "Invoice";
      const cur = doc.currency || profile?.default_currency || "INR";
      const msg = encodeURIComponent(
        `Hi ${client.name},\n\n` +
        (isInvoice
          ? `Aapka invoice abhi tak unpaid hai:\n\n📄 *${doc.title}*\n💰 ${fmtCur(doc.amount, cur)}\n\nKindly payment kar dijiye. Reminder as requested.\n\n` +
            (profile?.upi_id ? `UPI: ${profile.upi_id}\n` : "") +
            (profile?.bank_account ? `Bank: ${profile.bank_name || ""} | A/C: ${profile.bank_account} | IFSC: ${profile.bank_ifsc || ""}\n` : "")
          : `Aapne abhi tak sign nahi kiya:\n\n📄 *${doc.title}*\n\n👉 Sign karo: ${signingUrl}`) +
        `\nPowered by FlowDocs`
      );
      const phone = client.phone.replace(/[^0-9]/g, "");
      window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
    }

    // Email reminder
    let emailOk = false;
    if (client.email) {
      try {
        emailOk = await sendReminderEmail({
          to: client.email,
          clientName: client.name,
          docTitle: doc.title,
          signingUrl: signingUrl || APP_URL,
          fromName: profile?.name || "FlowDocs User",
          amount: doc.amount,
          currency: doc.currency || profile?.default_currency || "INR",
          isInvoice: doc.type === "Invoice",
          dueDate: doc.due_date,
          upiId: profile?.upi_id,
          bankName: profile?.bank_name,
          bankAccount: profile?.bank_account,
          bankIfsc: profile?.bank_ifsc,
        });
      } catch (e) {
        console.error("Reminder email error:", e);
      }
    }

    // Log reminder in DB
    await supabase.from("reminder_log").insert({
      document_id: doc.id,
      type: "manual",
      sent_at: new Date().toISOString(),
    }).then(() => {});

    showToast(
      client.phone
        ? `✓ WhatsApp reminder open hua${emailOk ? " + email bhi gaya!" : ""}`
        : emailOk
        ? "✓ Reminder email sent!"
        : "Client ka phone/email add karo reminder ke liye",
      !!(client.phone || emailOk)
    );
  };

  // ── Bulk Remind (all pending/overdue) ──
  const bulkRemind = async () => {
    const targets = documents.filter(d => ["pending", "overdue"].includes(d.status));
    if (targets.length === 0) return showToast("Koi pending/overdue document nahi", false);
    for (const doc of targets) {
      await sendReminder(doc);
      await new Promise(r => setTimeout(r, 600));
    }
    showToast(`✓ ${targets.length} documents ke liye reminders bheje!`);
  };

  // ── WhatsApp Share ──
  const shareWhatsApp = (doc) => {
    const client = clients.find(c => c.id === doc.client_id);
    const url = `${APP_URL}/sign/${doc.sign_token}`;
    const msg = encodeURIComponent(
      `Hi ${client?.name || ""},\n\n${profile?.name || "I"} has sent you a ${doc.type} to review and sign:\n\n📄 *${doc.title}*${doc.amount ? `\n💰 ${fmtCur(doc.amount, doc.currency || "INR")}` : ""}\n\n👉 View & Sign: ${url}\n\nPowered by FlowDocs`
    );
    const phone = client?.phone ? client.phone.replace(/[^0-9]/g, "") : "";
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
    showToast("✓ Opening WhatsApp...");
  };

  // ── Download PDF ──
  const handleDownload = async (doc) => {
    try {
      const client = clients.find(c => c.id === doc.client_id) || doc.clients;

      // signature_url ya signature_data — jo bhi available ho
      let signatureDataUrl = doc.signature_url || doc.signature_data || null;

      // Agar public URL hai (https://) toh base64 mein convert karo
      if (signatureDataUrl && signatureDataUrl.startsWith("http")) {
        try {
          const res = await fetch(signatureDataUrl);
          const blob = await res.blob();
          signatureDataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.warn("Signature URL fetch failed, trying base64:", e);
          signatureDataUrl = doc.signature_data || null;
        }
      }

      const ok = downloadPDF(doc, profile, client, signatureDataUrl);
      if (ok) showToast("✓ PDF downloaded!");
      else showToast("PDF generation failed. Check console.", false);
    } catch (err) {
      console.error("Download error:", err);
      showToast("PDF download failed: " + (err.message || "Unknown error"), false);
    }
  };

  // ── Copy signing link ──
  const copyLink = (doc) => {
    const url = `${APP_URL}/sign/${doc.sign_token}`;
    navigator.clipboard.writeText(url).then(() => showToast("✓ Signing link copied!"));
  };

  // ── Mark as Paid ──
  const markPaid = async (doc) => {
    const client = clients.find(c => c.id === doc.client_id) || doc.clients;
    const cur = doc.currency || profile?.default_currency || "INR";
    const confirmed = window.confirm(
      `"${doc.title}" ko paid mark karna hai?\n` +
      `Client: ${client?.name || "Unknown"}\n` +
      `Amount: ${CURRENCIES[cur]?.symbol || "₹"}${Number(doc.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}\n\n` +
      `Confirm karo ki payment actually receive ho gayi hai.`
    );
    if (!confirmed) return;

    const { error } = await supabase.from("documents").update({
      status: "paid", paid_at: new Date().toISOString()
    }).eq("id", doc.id);
    if (!error) {
      setDocuments(documents.map(d => d.id === doc.id ? { ...d, status: "paid" } : d));
      showToast("✓ Invoice marked as paid!");
    } else {
      showToast("Update failed: " + error.message, false);
    }
  };

  // ── Sign out ──
  const signOut = async () => { await supabase.auth.signOut(); };

  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showAI, setShowAI] = useState(false);

  // ── Derived stats ──
  const defaultCur = profile?.default_currency || "INR";
  const totalBilled = documents.reduce((s, d) => s + (d.amount || 0), 0);
  const collected = documents.filter(d => d.status === "paid").reduce((s, d) => s + (d.amount || 0), 0);
  const pendingSign = documents.filter(d => d.status === "pending").length;
  const overdue = documents.filter(d => d.status === "overdue").length;

  // ── Analytics data ──
  const monthlyRevenue = {};
  documents.filter(d => d.status === "paid").forEach(d => {
    const m = new Date(d.paid_at || d.updated_at).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    monthlyRevenue[m] = (monthlyRevenue[m] || 0) + (d.amount || 0);
  });

  const clientRevenue = {};
  documents.forEach(d => {
    const cName = clients.find(c => c.id === d.client_id)?.name || d.clients?.name || "Unknown";
    if (!clientRevenue[cName]) clientRevenue[cName] = { total: 0, paid: 0, docs: 0 };
    clientRevenue[cName].total += (d.amount || 0);
    if (d.status === "paid") clientRevenue[cName].paid += (d.amount || 0);
    clientRevenue[cName].docs += 1;
  });

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: C.gold, fontFamily: "Syne", fontSize: 18 }}>Loading workspace...</div>
    </div>
  );

  const navItems = [
    { id: "dashboard", icon: "⊞", label: "Dashboard" },
    { id: "documents", icon: "◈", label: "Documents" },
    { id: "templates", icon: "⬡", label: "Templates" },
    { id: "esign", icon: "✍", label: "eSign" },
    { id: "invoices", icon: "◎", label: "Invoices" },
    { id: "clients", icon: "👤", label: "Clients" },
    { id: "analytics", icon: "📊", label: "Analytics" },
    { id: "settings", icon: "⚙", label: "Settings" },
  ];

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
        @media (max-width: 768px) {
          .fd-sidebar { transform: translateX(-100%); transition: transform 0.25s ease; }
          .fd-sidebar.open { transform: translateX(0); }
          .fd-main { margin-left: 0 !important; padding: 16px !important; }
          .fd-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .fd-hamburger { display: flex !important; }
          .fd-overlay { display: block !important; }
        }
      `}</style>

      {/* ── MOBILE HAMBURGER ── */}
      <button className="fd-hamburger" onClick={() => setSidebarOpen(true)} style={{
        display: "none", position: "fixed", top: 14, left: 14, zIndex: 20,
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
        padding: "8px 10px", cursor: "pointer", color: C.gold, fontSize: 20,
        alignItems: "center", justifyContent: "center",
      }}>☰</button>

      {/* ── MOBILE OVERLAY ── */}
      {sidebarOpen && (
        <div className="fd-overlay" onClick={() => setSidebarOpen(false)} style={{
          display: "none", position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 14,
        }} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`fd-sidebar ${sidebarOpen ? "open" : ""}`} style={{
        width: 220, background: C.surface, borderRight: `1px solid ${C.border}`,
        display: "flex", flexDirection: "column", padding: "24px 0",
        position: "fixed", height: "100vh", zIndex: 15,
      }}>
        <div style={{ padding: "0 20px 24px", borderBottom: `1px solid ${C.border}`, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: C.gold }}>⚡ FlowDocs</div>
            <div style={{ fontSize: 10, color: C.dim, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>
              {profile?.name || session.user.email}
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ display: "none", background: "none", border: "none", color: C.dim, cursor: "pointer", fontSize: 18 }}
            className="fd-hamburger">×</button>
        </div>

        <div style={{ fontSize: 10, color: C.dim, padding: "0 20px 8px", letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>Workspace</div>

        {navItems.map(n => (
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

        {/* ─── DASHBOARD ─── */}
        {page === "dashboard" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, color: C.text }}>
                  Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {profile?.name?.split(" ")[0] || "there"} 👋
                </div>
                <div style={{ fontSize: 13, color: C.dim, marginTop: 4 }}>
                  {pendingSign} pending signature{pendingSign !== 1 ? "s" : ""} · {overdue} overdue
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button style={{ ...btn("ghost"), borderColor: "#60A5FA", color: "#60A5FA", background: "#60A5FA18" }} onClick={() => setShowAI(true)}>✨ AI Generate</button>
                <button style={{ ...btn("ghost"), borderColor: C.gold, color: C.gold, background: C.goldDim }} onClick={bulkRemind}>📣 Remind All</button>
                <button style={btn()} onClick={() => setModal("newDoc")}>+ New Document</button>
              </div>
            </div>

            <div className="fd-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
              <StatCard label="Total Billed" value={fmtCur(totalBilled, defaultCur)} sub="All time" accent="gold" />
              <StatCard label="Collected" value={fmtCur(collected, defaultCur)} sub="Paid invoices" accent="green" />
              <StatCard label="Pending Sign" value={pendingSign} sub="Awaiting response" accent="blue" />
              <StatCard label="Overdue" value={overdue} sub="Action needed" accent="red" />
            </div>

            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 14 }}>Recent Documents</div>
            <DocsTable docs={documents.slice(0, 6)} clients={clients} profile={profile} onSend={sendDoc} onDownload={handleDownload} onCopyLink={copyLink} onWhatsApp={shareWhatsApp} onEdit={openEditDoc} onMarkPaid={markPaid} onRemind={sendReminder} onNew={() => setModal("newDoc")} />
          </>
        )}

        {/* ─── DOCUMENTS ─── */}
        {page === "documents" && (
          <>
            <PageHeader title="Documents" sub={`${documents.length} total`} onNew={() => setModal("newDoc")} btnLabel="+ New Document" />
            <DocsTable docs={documents} clients={clients} profile={profile} onSend={sendDoc} onDownload={handleDownload} onCopyLink={copyLink} onWhatsApp={shareWhatsApp} onEdit={openEditDoc} onMarkPaid={markPaid} onRemind={sendReminder} onNew={() => setModal("newDoc")} full />
          </>
        )}

        {/* ─── TEMPLATES ─── */}
        {page === "templates" && (
          <>
            <PageHeader title="Templates" sub="Ready-to-use proposals, contracts & NDAs" onNew={() => setModal("newDoc")} btnLabel="+ Blank Document" />
            <Templates
              session={session}
              profile={profile}
              docCount={documents.length}
              onUse={(doc) => {
                setDocuments(prev => [doc, ...prev]);
              }}
              onEdit={(doc) => {
                setPage("documents");
                openEditDoc(doc);
              }}
            />
          </>
        )}

        {page === "esign" && (
          <>
            <PageHeader title="eSign" sub="Track signature status in real-time" onNew={() => setModal("newDoc")} btnLabel="+ New Signing Request" />
            <ESignPage docs={documents} clients={clients} onSend={sendDoc} onCopyLink={copyLink} onWhatsApp={shareWhatsApp} />
          </>
        )}

        {page === "invoices" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, color: C.text }}>Invoices</div>
                <div style={{ fontSize: 13, color: C.dim, marginTop: 4 }}>Billing & payment tracking with GST</div>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button style={{ ...btn("ghost"), borderColor: C.green, color: C.green, background: C.greenDim }}
                  onClick={bulkRemind}>
                  💸 Get Paid Faster
                </button>
                <button style={btn()} onClick={() => { setDocForm(f => ({ ...f, type: "Invoice" })); setModal("newDoc"); }}>+ New Invoice</button>
              </div>
            </div>
            {/* Get Paid Faster tip */}
            {documents.filter(d => d.type === "Invoice" && ["pending", "overdue"].includes(d.status)).length > 0 && (
              <div style={{ background: C.goldDim, border: `1px solid ${C.gold}50`, borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div style={{ fontSize: 13, color: C.gold }}>
                  💰 <strong>{documents.filter(d => d.type === "Invoice" && ["pending", "overdue"].includes(d.status)).length}</strong> unpaid invoice{documents.filter(d => d.type === "Invoice" && ["pending", "overdue"].includes(d.status)).length !== 1 ? "s" : ""} pending —{" "}
                  {fmtCur(documents.filter(d => d.type === "Invoice" && ["pending", "overdue"].includes(d.status)).reduce((s, d) => s + (d.amount || 0), 0), defaultCur)} outstanding
                </div>
                <button style={{ ...btn(), fontSize: 12, padding: "7px 14px" }} onClick={bulkRemind}>Send All Reminders →</button>
              </div>
            )}
            <DocsTable docs={documents.filter(d => d.type === "Invoice")} clients={clients} profile={profile} onSend={sendDoc} onDownload={handleDownload} onCopyLink={copyLink} onWhatsApp={shareWhatsApp} onEdit={openEditDoc} onMarkPaid={markPaid} onRemind={sendReminder} onNew={() => setModal("newDoc")} full />
          </>
        )}

        {/* ─── CLIENTS ─── */}
        {page === "clients" && (
          <>
            <PageHeader title="Clients" sub={`${clients.length} active clients`} onNew={() => setModal("newClient")} btnLabel="+ Add Client" />
            <ClientsPage clients={clients} documents={documents} profile={profile} />
          </>
        )}

        {/* ─── ANALYTICS ─── */}
        {page === "analytics" && (
          <>
            <PageHeader title="Analytics" sub="Revenue insights & reports" />
            <AnalyticsPage documents={documents} clients={clients} profile={profile} monthlyRevenue={monthlyRevenue} clientRevenue={clientRevenue} />
          </>
        )}

        {/* ─── SETTINGS ─── */}
        {page === "settings" && (
          <>
            <PageHeader title="Settings" sub="Business profile & GST settings" />
            <SettingsPage profile={profile} onUpdate={fetchAll} showToast={showToast} session={session} />
          </>
        )}
      </main>

      {/* ── MODALS ── */}

      {/* New Document Modal */}
      {modal === "newDoc" && (
        <Modal title="New Document" sub="Create a proposal, contract, or invoice" onClose={() => setModal(null)} width={560}>
          <label style={label}>Document Type</label>
          <select style={{ ...input, color: C.text, background: C.surface2 }}
            value={docForm.type} onChange={e => setDocForm({ ...docForm, type: e.target.value })}>
            <option>Proposal</option><option>Contract</option><option>Invoice</option><option>NDA</option>
          </select>

          <label style={label}>Document Title</label>
          <input style={input} placeholder="e.g. Website Redesign Proposal" value={docForm.title}
            onChange={e => setDocForm({ ...docForm, title: e.target.value })} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={label}>Client</label>
              <select style={{ ...input, color: C.text, background: C.surface2 }}
                value={docForm.client_id} onChange={e => setDocForm({ ...docForm, client_id: e.target.value })}>
                <option value="">— Select Client —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={label}>Currency</label>
              <select style={{ ...input, color: C.text, background: C.surface2 }}
                value={docForm.currency} onChange={e => setDocForm({ ...docForm, currency: e.target.value })}>
                {Object.entries(CURRENCIES).map(([code, { name, symbol }]) => (
                  <option key={code} value={code}>{symbol} {code} — {name}</option>
                ))}
              </select>
            </div>
          </div>

          {docForm.type !== "Invoice" && (
            <>
              <label style={label}>Amount ({CURRENCIES[docForm.currency]?.symbol})</label>
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
                  <input style={input} placeholder={`Rate ${CURRENCIES[docForm.currency]?.symbol}`} type="number" value={item.rate}
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

          {/* GST Section */}
          <div style={{ marginTop: 14, padding: 14, background: C.surface2, borderRadius: 10, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, fontFamily: "'DM Mono', monospace", marginBottom: 10 }}>🏛 GST / TAX SETTINGS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ ...label, marginTop: 0 }}>Tax Type</label>
                <select style={{ ...input, color: C.text, background: C.bg }} value={docForm.tax_type}
                  onChange={e => setDocForm({ ...docForm, tax_type: e.target.value })}>
                  <option value="none">No Tax</option>
                  <option value="cgst_sgst">CGST + SGST (Intra-state)</option>
                  <option value="igst">IGST (Inter-state)</option>
                  <option value="custom">Custom Tax</option>
                </select>
              </div>
              <div>
                <label style={{ ...label, marginTop: 0 }}>Tax Rate (%)</label>
                <select style={{ ...input, color: C.text, background: C.bg }} value={docForm.tax_rate}
                  onChange={e => setDocForm({ ...docForm, tax_rate: e.target.value })}>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18% (Standard)</option>
                  <option value="28">28%</option>
                </select>
              </div>
            </div>
            <label style={label}>HSN/SAC Code (optional)</label>
            <input style={{ ...input, background: C.bg }} placeholder="e.g. 998314 (IT Services)" value={docForm.hsn_sac}
              onChange={e => setDocForm({ ...docForm, hsn_sac: e.target.value })} />

            {/* Preview tax calculation */}
            {docForm.tax_type !== "none" && (() => {
              const sub = docForm.type === "Invoice"
                ? invoiceItems.reduce((s, i) => s + (i.qty || 1) * (i.rate || 0), 0)
                : parseFloat(docForm.amount) || 0;
              const gst = calcGST(sub, docForm.tax_type, parseFloat(docForm.tax_rate));
              const sym = CURRENCIES[docForm.currency]?.symbol || "₹";
              return (
                <div style={{ marginTop: 10, padding: 10, background: C.bg, borderRadius: 8, fontSize: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: C.dim, marginBottom: 4 }}>
                    <span>Subtotal</span><span>{sym}{sub.toFixed(2)}</span>
                  </div>
                  {gst.cgst > 0 && <div style={{ display: "flex", justifyContent: "space-between", color: C.dim, marginBottom: 4 }}>
                    <span>CGST ({docForm.tax_rate / 2}%)</span><span>{sym}{gst.cgst.toFixed(2)}</span>
                  </div>}
                  {gst.sgst > 0 && <div style={{ display: "flex", justifyContent: "space-between", color: C.dim, marginBottom: 4 }}>
                    <span>SGST ({docForm.tax_rate / 2}%)</span><span>{sym}{gst.sgst.toFixed(2)}</span>
                  </div>}
                  {gst.igst > 0 && <div style={{ display: "flex", justifyContent: "space-between", color: C.dim, marginBottom: 4 }}>
                    <span>IGST ({docForm.tax_rate}%)</span><span>{sym}{gst.igst.toFixed(2)}</span>
                  </div>}
                  <div style={{ display: "flex", justifyContent: "space-between", color: C.gold, fontWeight: 700, borderTop: `1px solid ${C.border}`, paddingTop: 6, marginTop: 4 }}>
                    <span>Total</span><span>{sym}{gst.total.toFixed(2)}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Due Date + Recurring */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={label}>Due Date</label>
              <input style={input} type="date" value={docForm.due_date}
                onChange={e => setDocForm({ ...docForm, due_date: e.target.value })} />
            </div>
            <div>
              <label style={label}>Recurring</label>
              <select style={{ ...input, color: C.text, background: C.surface2 }} value={docForm.recurring_frequency}
                onChange={e => setDocForm({ ...docForm, recurring_frequency: e.target.value })}>
                <option value="">One-time</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <label style={label}>Notes (Internal)</label>
          <input style={input} placeholder="Private notes about this document..." value={docForm.notes}
            onChange={e => setDocForm({ ...docForm, notes: e.target.value })} />

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
            <button style={btn("ghost")} onClick={() => setModal(null)}>Cancel</button>
            <button style={btn()} onClick={createDoc}>Create Document →</button>
          </div>
        </Modal>
      )}

      {/* Edit Document Modal */}
      {modal === "editDoc" && editDoc && (
        <Modal title="Edit Document" sub={editDoc.title} onClose={() => { setModal(null); setEditDoc(null); }} width={560}>
          <label style={label}>Title</label>
          <input style={input} value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />

          <label style={label}>Client</label>
          <select style={{ ...input, color: C.text }} value={editForm.client_id || ""}
            onChange={e => setEditForm({ ...editForm, client_id: e.target.value })}>
            <option value="">— Select Client —</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ""}</option>)}
          </select>
          {!editForm.client_id && (
            <div style={{ fontSize: 11, color: C.gold, marginTop: 4 }}>⚠ Client select karo taaki email + WhatsApp kaam kare</div>
          )}

          <label style={label}>Status</label>
          <select style={{ ...input, color: C.text }} value={editForm.status}
            onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="signed">Signed</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>

          {editDoc.type !== "Invoice" && (
            <>
              <label style={label}>Description</label>
              <textarea style={{ ...input, minHeight: 120, resize: "vertical" }}
                value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
            </>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={label}>Amount</label>
              <input style={input} type="number" value={editForm.amount}
                onChange={e => setEditForm({ ...editForm, amount: e.target.value })} />
            </div>
            <div>
              <label style={label}>Currency</label>
              <select style={{ ...input, color: C.text }} value={editForm.currency}
                onChange={e => setEditForm({ ...editForm, currency: e.target.value })}>
                {Object.entries(CURRENCIES).map(([code, { symbol }]) => (
                  <option key={code} value={code}>{symbol} {code}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={label}>Tax Type</label>
              <select style={{ ...input, color: C.text }} value={editForm.tax_type}
                onChange={e => setEditForm({ ...editForm, tax_type: e.target.value })}>
                <option value="none">No Tax</option>
                <option value="cgst_sgst">CGST + SGST</option>
                <option value="igst">IGST</option>
              </select>
            </div>
            <div>
              <label style={label}>Tax Rate (%)</label>
              <input style={input} type="number" value={editForm.tax_rate}
                onChange={e => setEditForm({ ...editForm, tax_rate: e.target.value })} />
            </div>
          </div>

          <label style={label}>Due Date</label>
          <input style={input} type="date" value={editForm.due_date}
            onChange={e => setEditForm({ ...editForm, due_date: e.target.value })} />

          <label style={label}>Notes</label>
          <input style={input} value={editForm.notes || ""} placeholder="Internal notes..."
            onChange={e => setEditForm({ ...editForm, notes: e.target.value })} />

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
            <button style={btn("ghost")} onClick={() => { setModal(null); setEditDoc(null); }}>Cancel</button>
            <button style={btn()} onClick={saveEditDoc}>Save Changes →</button>
          </div>
        </Modal>
      )}

      {/* New Client Modal */}
      {modal === "newClient" && (
        <Modal title="Add Client" sub="Add a new client to your workspace" onClose={() => setModal(null)} width={560}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={label}>Name *</label>
              <input style={input} placeholder="John Smith" value={clientForm.name}
                onChange={e => setClientForm({ ...clientForm, name: e.target.value })} />
            </div>
            <div>
              <label style={label}>Email</label>
              <input style={input} type="email" placeholder="john@company.com" value={clientForm.email}
                onChange={e => setClientForm({ ...clientForm, email: e.target.value })} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={label}>Company</label>
              <input style={input} placeholder="Acme Corp" value={clientForm.company}
                onChange={e => setClientForm({ ...clientForm, company: e.target.value })} />
            </div>
            <div>
              <label style={label}>Phone (with country code)</label>
              <input style={input} placeholder="+91 9876543210" value={clientForm.phone}
                onChange={e => setClientForm({ ...clientForm, phone: e.target.value })} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={label}>Country</label>
              <input style={input} placeholder="India" value={clientForm.country}
                onChange={e => setClientForm({ ...clientForm, country: e.target.value })} />
            </div>
            <div>
              <label style={label}>State</label>
              <select style={{ ...input, color: C.text, background: C.surface2 }} value={clientForm.state}
                onChange={e => setClientForm({ ...clientForm, state: e.target.value })}>
                <option value="">— Select State —</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* GST Section for Client */}
          <div style={{ marginTop: 14, padding: 14, background: C.surface2, borderRadius: 10, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, fontFamily: "'DM Mono', monospace", marginBottom: 10 }}>🏛 GST DETAILS (Optional)</div>
            <label style={{ ...label, marginTop: 0 }}>Client GSTIN</label>
            <input style={{ ...input, background: C.bg }} placeholder="e.g. 27AABCT1234F1Z5" value={clientForm.gstin}
              onChange={e => setClientForm({ ...clientForm, gstin: e.target.value })} />
            <label style={label}>Address</label>
            <input style={{ ...input, background: C.bg }} placeholder="Full business address" value={clientForm.address}
              onChange={e => setClientForm({ ...clientForm, address: e.target.value })} />
          </div>

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
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
      <div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, color: C.text }}>{title}</div>
        <div style={{ fontSize: 13, color: C.dim, marginTop: 4 }}>{sub}</div>
      </div>
      {onNew && <button style={btn()} onClick={onNew}>{btnLabel}</button>}
    </div>
  );
}

// ── DOCUMENTS TABLE ─────────────────────────────────────────────────────
function DocsTable({ docs, clients, profile, onSend, onDownload, onCopyLink, onWhatsApp, onEdit, onMarkPaid, onRemind, onNew }) {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? docs : docs.filter(d => d.type === filter || d.status === filter.toLowerCase());

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 13, color: C.dim }}>{filtered.length} document{filtered.length !== 1 ? "s" : ""}</div>
        <div style={{ display: "flex", gap: 4, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 4, flexWrap: "wrap" }}>
          {["All", "Proposal", "Contract", "Invoice", "NDA"].map(f => (
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

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
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
              const cur = doc.currency || profile?.default_currency || "INR";
              return (
                <tr key={doc.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: C.text, cursor: "pointer" }} onClick={() => onEdit?.(doc)}>{doc.title}</div>
                    <div style={{ fontSize: 12, color: C.dim, marginTop: 2 }}>
                      {client?.name || "—"}
                      {doc.invoice_number && <span style={{ marginLeft: 6, fontSize: 10, color: C.gold, fontFamily: "'DM Mono', monospace" }}>{doc.invoice_number}</span>}
                      {doc.recurring_active && <span style={{ marginLeft: 6, fontSize: 9, background: C.purpleDim, color: C.purple, padding: "1px 6px", borderRadius: 10 }}>🔄 {doc.recurring_frequency}</span>}
                    </div>
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
                      {doc.amount ? fmtCur(doc.amount, cur) : "—"}
                    </span>
                    {doc.tax_type && doc.tax_type !== "none" && (
                      <div style={{ fontSize: 9, color: C.dim, fontFamily: "'DM Mono', monospace" }}>
                        +{doc.tax_type === "cgst_sgst" ? "GST" : "IGST"} {doc.tax_rate}%
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 11, color: C.dim, fontFamily: "'DM Mono', monospace" }}>
                      {new Date(doc.created_at).toLocaleDateString("en-IN")}
                    </span>
                    {doc.due_date && (
                      <div style={{ fontSize: 9, color: new Date(doc.due_date) < new Date() ? C.red : C.dim }}>
                        Due: {new Date(doc.due_date).toLocaleDateString("en-IN")}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {doc.status === "draft" && (
                        <button style={{ ...btn("ghost"), fontSize: 11.5, padding: "5px 10px", color: C.gold, borderColor: C.gold, background: C.goldDim }}
                          onClick={() => onSend(doc)}>Send ↗</button>
                      )}
                      {(doc.status === "pending" || doc.status === "overdue") && (
                        <button style={{ ...btn("ghost"), fontSize: 11.5, padding: "5px 10px", color: C.gold, borderColor: C.gold, background: C.goldDim }}
                          onClick={() => onRemind?.(doc)}>📣 Remind</button>
                      )}
                      {(doc.status === "pending" || doc.status === "signed") && doc.type === "Invoice" && (
                        <button style={{ ...btn("ghost"), fontSize: 11.5, padding: "5px 10px", color: C.green, borderColor: C.green, background: C.greenDim }}
                          onClick={() => onMarkPaid(doc)}>✓ Paid</button>
                      )}
                      <button style={{ ...btn("ghost"), fontSize: 11.5, padding: "5px 10px", color: "#25D366", borderColor: "#25D366", background: "#25D36618" }}
                        onClick={() => onWhatsApp(doc)} title="Share on WhatsApp">WA</button>
                      {doc.sign_token && (
                        <button style={{ ...btn("ghost"), fontSize: 11.5, padding: "5px 10px" }}
                          onClick={() => onCopyLink(doc)}>🔗</button>
                      )}
                      <button style={{ ...btn("ghost"), fontSize: 11.5, padding: "5px 10px" }}
                        onClick={() => onDownload(doc)}>PDF</button>
                      <button style={{ ...btn("ghost"), fontSize: 11.5, padding: "5px 10px" }}
                        onClick={() => onEdit(doc)}>✎</button>
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
function ESignPage({ docs, clients, onSend, onCopyLink, onWhatsApp }) {
  const signingDocs = docs.filter(d => ["pending", "signed", "draft"].includes(d.status));
  return (
    <div>
      {signingDocs.length === 0 ? (
        <div style={{ textAlign: "center", padding: 64, color: C.dim }}>No documents to track yet.</div>
      ) : signingDocs.map(doc => {
        const client = clients.find(c => c.id === doc.client_id) || doc.clients;
        const progress = doc.status === "signed" ? 100 : doc.status === "pending" ? 50 : 0;
        return (
          <div key={doc.id} style={{ ...card, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
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
              {doc.status === "draft" && (
                <button style={{ ...btn(), fontSize: 12, padding: "7px 14px" }} onClick={() => onSend(doc)}>Send Request →</button>
              )}
              {doc.status === "pending" && (
                <>
                  <button style={{ ...btn("ghost"), fontSize: 12, padding: "7px 14px", color: "#25D366", borderColor: "#25D366" }} onClick={() => onWhatsApp(doc)}>📱 WhatsApp</button>
                  <button style={{ ...btn("ghost"), fontSize: 12, padding: "7px 14px" }} onClick={() => onCopyLink(doc)}>Copy Link</button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── CLIENTS PAGE ────────────────────────────────────────────────────────
function ClientsPage({ clients, documents, profile }) {
  return (
    <div>
      {clients.length === 0 ? (
        <div style={{ textAlign: "center", padding: 64, color: C.dim }}>No clients yet. Add your first client!</div>
      ) : clients.map(c => {
        const clientDocs = documents.filter(d => d.client_id === c.id);
        const total = clientDocs.reduce((s, d) => s + (d.amount || 0), 0);
        const colors = ["#3B82F6", "#F5A623", "#22C55E", "#A78BFA", "#F43F5E"];
        const color = colors[clients.indexOf(c) % colors.length];
        const cur = profile?.default_currency || "INR";
        return (
          <div key={c.id} style={{
            ...card, display: "flex", alignItems: "center", gap: 16, marginBottom: 12,
            cursor: "pointer", transition: "border-color 0.15s", flexWrap: "wrap",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10, flexShrink: 0,
              background: color + "20", color, display: "flex", alignItems: "center",
              justifyContent: "center", fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800,
            }}>{c.name[0]}</div>
            <div style={{ flex: 1, minWidth: 150 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{c.name}</div>
              <div style={{ fontSize: 12, color: C.dim, marginTop: 2 }}>
                {c.company && `${c.company} · `}{c.country || ""}{c.email && ` · ${c.email}`}
                {c.gstin && <span style={{ marginLeft: 6, fontSize: 10, color: C.gold, fontFamily: "'DM Mono', monospace" }}>GST: {c.gstin}</span>}
              </div>
              {c.phone && <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>📱 {c.phone}</div>}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: C.text }}>{fmtCur(total, cur)}</div>
              <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{clientDocs.length} document{clientDocs.length !== 1 ? "s" : ""}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── ANALYTICS PAGE ──────────────────────────────────────────────────────
function AnalyticsPage({ documents, profile, monthlyRevenue, clientRevenue }) {
  const cur = profile?.default_currency || "INR";
  const totalBilled = documents.reduce((s, d) => s + (d.amount || 0), 0);
  const totalPaid = documents.filter(d => d.status === "paid").reduce((s, d) => s + (d.amount || 0), 0);
  const totalPending = documents.filter(d => ["pending", "draft"].includes(d.status)).reduce((s, d) => s + (d.amount || 0), 0);
  const totalOverdue = documents.filter(d => d.status === "overdue").reduce((s, d) => s + (d.amount || 0), 0);
  const taxCollected = documents.filter(d => d.status === "paid").reduce((s, d) => s + (d.tax_amount || 0), 0);

  const typeBreakdown = {};
  documents.forEach(d => { typeBreakdown[d.type] = (typeBreakdown[d.type] || 0) + 1; });

  const maxMonthly = Math.max(...Object.values(monthlyRevenue), 1);

  return (
    <div>
      {/* Revenue Summary */}
      <div className="fd-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Revenue" value={fmtCur(totalPaid, cur)} sub="Collected" accent="green" />
        <StatCard label="Outstanding" value={fmtCur(totalPending, cur)} sub="Pending payment" accent="gold" />
        <StatCard label="Overdue" value={fmtCur(totalOverdue, cur)} sub="Action needed" accent="red" />
        <StatCard label="Tax Collected" value={fmtCur(taxCollected, cur)} sub="GST/IGST" accent="purple" />
      </div>

      {/* Monthly Revenue Chart */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16 }}>Monthly Revenue</div>
        {Object.keys(monthlyRevenue).length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: C.dim, fontSize: 13 }}>No paid invoices yet. Revenue chart will appear here.</div>
        ) : (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 160, padding: "0 10px" }}>
            {Object.entries(monthlyRevenue).slice(-12).map(([month, amount]) => (
              <div key={month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 10, color: C.gold, fontFamily: "'DM Mono', monospace" }}>{fmtCur(amount, cur)}</div>
                <div style={{
                  width: "100%", maxWidth: 40, background: `linear-gradient(180deg, ${C.gold}, ${C.gold}40)`,
                  borderRadius: "4px 4px 0 0", transition: "height 0.5s",
                  height: `${Math.max((amount / maxMonthly) * 120, 8)}px`,
                }} />
                <div style={{ fontSize: 10, color: C.dim }}>{month}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Client Revenue */}
        <div style={card}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16 }}>Revenue by Client</div>
          {Object.entries(clientRevenue).sort((a, b) => b[1].total - a[1].total).slice(0, 8).map(([name, data]) => (
            <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
              <div>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{name}</div>
                <div style={{ fontSize: 11, color: C.dim }}>{data.docs} docs · {fmtCur(data.paid, cur)} paid</div>
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: C.gold }}>{fmtCur(data.total, cur)}</div>
            </div>
          ))}
        </div>

        {/* Document Breakdown */}
        <div style={card}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16 }}>Document Breakdown</div>
          {Object.entries(typeBreakdown).map(([type, count]) => {
            const colors = { Proposal: C.blue, Contract: C.gold, Invoice: C.green, NDA: C.purple };
            const pct = documents.length > 0 ? (count / documents.length) * 100 : 0;
            return (
              <div key={type} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: C.text }}>{type}</span>
                  <span style={{ color: C.dim }}>{count} ({pct.toFixed(0)}%)</span>
                </div>
                <div style={{ background: C.surface2, borderRadius: 4, height: 6, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: colors[type] || C.gold, borderRadius: 4, transition: "width 0.5s" }} />
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: 20, padding: 12, background: C.surface2, borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: C.dim, fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>COLLECTION RATE</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 700, color: totalBilled > 0 ? C.green : C.dim }}>
              {totalBilled > 0 ? `${((totalPaid / totalBilled) * 100).toFixed(0)}%` : "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SETTINGS PAGE ────────────────────────────────────────────────────────
function SettingsPage({ profile, onUpdate, showToast, session }) {
  const [form, setForm] = useState({
    name: profile?.name || "",
    company: profile?.company || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    gstin: profile?.gstin || "",
    pan: profile?.pan || "",
    state: profile?.state || "",
    address: profile?.address || "",
    default_currency: profile?.default_currency || "INR",
    bank_name: profile?.bank_name || "",
    bank_account: profile?.bank_account || "",
    bank_ifsc: profile?.bank_ifsc || "",
    upi_id: profile?.upi_id || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update(form).eq("id", session.user.id);
    setSaving(false);
    if (error) return showToast(error.message, false);
    showToast("✓ Settings saved!");
    onUpdate?.();
  };

  return (
    <div style={{ maxWidth: 700 }}>
      {/* Business Info */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16 }}>Business Information</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ ...label, marginTop: 0 }}>Business Name</label>
            <input style={input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label style={{ ...label, marginTop: 0 }}>Company</label>
            <input style={input} value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={label}>Email</label>
            <input style={input} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label style={label}>Phone</label>
            <input style={input} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
        <label style={label}>Default Currency</label>
        <select style={{ ...input, color: C.text }} value={form.default_currency}
          onChange={e => setForm({ ...form, default_currency: e.target.value })}>
          {Object.entries(CURRENCIES).map(([code, { name, symbol }]) => (
            <option key={code} value={code}>{symbol} {code} — {name}</option>
          ))}
        </select>
        <label style={label}>Address</label>
        <textarea style={{ ...input, minHeight: 60, resize: "vertical" }} value={form.address}
          onChange={e => setForm({ ...form, address: e.target.value })} />
      </div>

      {/* GST Details */}
      <div style={{ ...card, marginBottom: 20, borderColor: C.gold }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: C.gold, marginBottom: 4 }}>🏛 GST & Tax Details</div>
        <div style={{ fontSize: 12, color: C.dim, marginBottom: 16 }}>Required for GST-compliant invoices</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ ...label, marginTop: 0 }}>GSTIN</label>
            <input style={input} placeholder="e.g. 27AABCT1234F1Z5" value={form.gstin}
              onChange={e => setForm({ ...form, gstin: e.target.value })} />
          </div>
          <div>
            <label style={{ ...label, marginTop: 0 }}>PAN</label>
            <input style={input} placeholder="e.g. ABCDE1234F" value={form.pan}
              onChange={e => setForm({ ...form, pan: e.target.value })} />
          </div>
        </div>
        <label style={label}>State (Place of Supply)</label>
        <select style={{ ...input, color: C.text }} value={form.state}
          onChange={e => setForm({ ...form, state: e.target.value })}>
          <option value="">— Select State —</option>
          {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Bank / UPI Details */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>💳 Payment Details</div>
        <div style={{ fontSize: 12, color: C.dim, marginBottom: 16 }}>Shown on invoices for bank transfer & UPI payments</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ ...label, marginTop: 0 }}>Bank Name</label>
            <input style={input} placeholder="e.g. HDFC Bank" value={form.bank_name}
              onChange={e => setForm({ ...form, bank_name: e.target.value })} />
          </div>
          <div>
            <label style={{ ...label, marginTop: 0 }}>Account Number</label>
            <input style={input} placeholder="e.g. 12345678901234" value={form.bank_account}
              onChange={e => setForm({ ...form, bank_account: e.target.value })} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={label}>IFSC Code</label>
            <input style={input} placeholder="e.g. HDFC0001234" value={form.bank_ifsc}
              onChange={e => setForm({ ...form, bank_ifsc: e.target.value })} />
          </div>
          <div>
            <label style={label}>UPI ID</label>
            <input style={input} placeholder="e.g. yourname@upi" value={form.upi_id}
              onChange={e => setForm({ ...form, upi_id: e.target.value })} />
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} style={{
        ...btn(), width: "100%", justifyContent: "center", padding: "14px", fontSize: 15,
        opacity: saving ? 0.6 : 1,
      }}>
        {saving ? "Saving..." : "Save Settings →"}
      </button>
    </div>
  );
}