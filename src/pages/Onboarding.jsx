import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const C = {
  bg: "#0C0C0E", surface: "#141416", surface2: "#1C1C1F", border: "#2A2A2E",
  gold: "#F5A623", goldDim: "#F5A62318", text: "#F0EEE8", dim: "#7A7875",
  mid: "#B0ADA8", green: "#22C55E", greenDim: "#22C55E20", red: "#EF4444",
};

const TEMPLATES = {
  web: {
    title: "Web Design Proposal",
    type: "Proposal",
    amount: 1500,
    description: `I will design and develop a professional, modern website for your business.

Scope of Work:
• Custom homepage design (desktop + mobile)
• Up to 5 inner pages (About, Services, Contact, Portfolio, Blog)
• Responsive design — looks perfect on all devices
• Contact form integration
• Basic SEO setup (meta tags, sitemap)
• 2 rounds of revisions included

Timeline: 3-4 weeks from project kickoff

What I need from you:
• Brand assets (logo, colors, fonts if available)
• Content (text, images) — or I can help with this
• Reference websites you like

Payment Terms:
50% upfront to begin, 50% on project completion.`,
  },
  logo: {
    title: "Logo Design & Branding Package",
    type: "Proposal",
    amount: 500,
    description: `I will create a professional logo and brand identity for your business.

Deliverables:
• 3 initial logo concepts
• 2 rounds of revisions on chosen concept
• Final files: PNG, SVG, PDF (all sizes)
• Brand color palette + typography guide
• Social media kit (profile picture, cover photo)

Timeline: 1-2 weeks

Process:
1. Discovery call (30 min) — understand your brand
2. Initial concepts delivered in 5 days
3. Revisions & refinements
4. Final delivery

Payment Terms:
Full payment upfront for projects under $500. 50/50 for larger packages.`,
  },
  seo: {
    title: "SEO Audit & Strategy",
    type: "Proposal",
    amount: 800,
    description: `I will conduct a comprehensive SEO audit and build a strategy to improve your search rankings.

What's Included:
• Full technical SEO audit (crawl errors, speed, mobile)
• Keyword research (50+ target keywords)
• Competitor analysis (top 3 competitors)
• On-page SEO recommendations
• Backlink profile analysis
• 90-day content + SEO roadmap

Deliverables:
• Detailed audit report (PDF)
• Priority action list
• Monthly reporting template

Timeline: 7-10 business days

Note: This is an audit + strategy package. Implementation is quoted separately.`,
  },
  social: {
    title: "Social Media Management",
    type: "Proposal",
    amount: 500,
    description: `I will manage your social media presence to grow your audience and engagement.

Monthly Deliverables:
• 20 posts per month (Instagram + LinkedIn)
• 4 Stories per week
• Community management (respond to comments/DMs)
• Monthly performance report
• Hashtag research & optimization

Platforms: Instagram, LinkedIn (Facebook optional)

Content Includes:
• Graphics designed in your brand style
• Captions optimized for engagement
• Scheduling at optimal times

This is a monthly retainer. Minimum 3-month commitment.`,
  },
  app: {
    title: "Mobile App Development",
    type: "Proposal",
    amount: 5000,
    description: `I will design and develop a cross-platform mobile application for iOS and Android.

Scope:
• React Native development (iOS + Android from one codebase)
• Custom UI/UX design
• Backend API integration
• Push notifications
• App Store + Play Store submission support

Features (to be confirmed):
• User authentication
• [Core feature 1]
• [Core feature 2]
• [Core feature 3]

Timeline: 8-12 weeks depending on complexity

Payment Schedule:
• 30% on project start
• 40% at design approval / midpoint
• 30% on final delivery`,
  },
};

const STEPS = [
  { id: 1, label: "Choose template" },
  { id: 2, label: "Add client details" },
  { id: 3, label: "Set your price" },
  { id: 4, label: "Send & done!" },
];

export default function Onboarding({ session, profile, onComplete }) {
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [docCreated, setDocCreated] = useState(null);
  const [copied, setCopied] = useState(false);

  const template = selected ? TEMPLATES[selected] : null;

  const createDoc = async () => {
    if (!clientName) return setError("Enter client name");
    setLoading(true); setError("");

    // Create or find client
    let clientId = null;
    if (clientName) {
      const { data: existing } = await supabase.from("clients")
        .select("id").eq("user_id", session.user.id).eq("name", clientName).single();

      if (existing) {
        clientId = existing.id;
        if (clientEmail) await supabase.from("clients").update({ email: clientEmail }).eq("id", clientId);
      } else {
        const { data: newClient } = await supabase.from("clients").insert({
          user_id: session.user.id, name: clientName, email: clientEmail || null,
        }).select().single();
        clientId = newClient?.id;
      }
    }

    // Create document
    const { data: doc, error: docError } = await supabase.from("documents").insert({
      user_id: session.user.id,
      client_id: clientId,
      title: template.title,
      type: template.type,
      status: "draft",
      amount: parseFloat(amount) || template.amount,
      content: { description: template.description },
    }).select().single();

    setLoading(false);
    if (docError) return setError(docError.message);
    setDocCreated(doc);
    setStep(4);
  };

  const copyLink = () => {
    if (!docCreated?.sign_token) return;
    const url = `${window.location.origin}/sign/${docCreated.sign_token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inp = {
    width: "100%", background: C.surface2, border: `1px solid ${C.border}`,
    borderRadius: 10, padding: "12px 14px", fontSize: 14, color: C.text,
    fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 560 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: C.gold }}>⚡ FlowDocs</div>
          <div style={{ fontSize: 13, color: C.dim, marginTop: 6 }}>
            Welcome, {profile?.name?.split(" ")[0] || "there"}! Let's send your first proposal.
          </div>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: 0, marginBottom: 32, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{
              flex: 1, padding: "12px 8px", textAlign: "center",
              background: step >= s.id ? C.goldDim : "transparent",
              borderRight: i < STEPS.length - 1 ? `1px solid ${C.border}` : "none",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: step >= s.id ? C.gold : C.dim, fontFamily: "'DM Mono', monospace" }}>
                {step > s.id ? "✓" : `0${s.id}`}
              </div>
              <div style={{ fontSize: 11, color: step >= s.id ? C.gold : C.dim, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* STEP 1 — Choose template */}
        {step === 1 && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6 }}>
              Pick a template
            </div>
            <div style={{ fontSize: 13, color: C.dim, marginBottom: 24 }}>
              Pre-filled and ready to send — edit after if needed.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {Object.entries(TEMPLATES).map(([key, t]) => (
                <div key={key} onClick={() => { setSelected(key); setAmount(t.amount); }} style={{
                  padding: "16px 18px", borderRadius: 12, cursor: "pointer",
                  border: `1px solid ${selected === key ? C.gold : C.border}`,
                  background: selected === key ? C.goldDim : C.surface2,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  transition: "all 0.15s",
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: selected === key ? C.gold : C.text }}>{t.title}</div>
                    <div style={{ fontSize: 12, color: C.dim, marginTop: 3 }}>{t.type}</div>
                  </div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: selected === key ? C.gold : C.mid }}>
                    ${t.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => selected && setStep(2)}
              disabled={!selected}
              style={{
                width: "100%", marginTop: 20, background: selected ? C.gold : C.surface2,
                color: selected ? "#0C0C0E" : C.dim, border: "none", borderRadius: 10,
                padding: "14px", fontSize: 15, fontWeight: 700, cursor: selected ? "pointer" : "not-allowed",
                fontFamily: "'DM Sans', sans-serif",
              }}>
              Continue →
            </button>
            <button onClick={async () => { await onComplete(); nav("/dashboard"); }} style={{ width: "100%", marginTop: 10, background: "none", border: "none", color: C.dim, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              Skip — go to dashboard
            </button>
          </div>
        )}

        {/* STEP 2 — Client details */}
        {step === 2 && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6 }}>
              Who is this for?
            </div>
            <div style={{ fontSize: 13, color: C.dim, marginBottom: 24 }}>Just a name is enough — email is optional.</div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: C.dim, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", display: "block", marginBottom: 8 }}>Client Name *</label>
              <input style={inp} placeholder="e.g. Rahul Sharma or Nova Corp" value={clientName} onChange={e => setClientName(e.target.value)} autoFocus />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 11, color: C.dim, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", display: "block", marginBottom: 8 }}>
                Client Email <span style={{ color: C.dim, fontWeight: 400 }}>(optional — to send link)</span>
              </label>
              <input style={inp} type="email" placeholder="client@email.com" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, background: "transparent", border: `1px solid ${C.border}`, color: C.mid, borderRadius: 10, padding: "13px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>← Back</button>
              <button
                onClick={() => clientName && setStep(3)}
                disabled={!clientName}
                style={{ flex: 2, background: clientName ? C.gold : C.surface2, color: clientName ? "#0C0C0E" : C.dim, border: "none", borderRadius: 10, padding: "13px", fontSize: 15, fontWeight: 700, cursor: clientName ? "pointer" : "not-allowed", fontFamily: "'DM Sans', sans-serif' " }}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Set price */}
        {step === 3 && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6 }}>
              Set your price
            </div>
            <div style={{ fontSize: 13, color: C.dim, marginBottom: 24 }}>Pre-filled from template — change if needed.</div>

            <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px", marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: C.dim, marginBottom: 4 }}>Sending to</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{clientName}</div>
              {clientEmail && <div style={{ fontSize: 12, color: C.dim, marginTop: 2 }}>{clientEmail}</div>}
            </div>

            <label style={{ fontSize: 11, color: C.dim, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", display: "block", marginBottom: 8 }}>Amount (USD)</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: C.gold, fontFamily: "'DM Mono', monospace", fontSize: 16 }}>$</span>
              <input style={{ ...inp, paddingLeft: 30, fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 700 }}
                type="number" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>

            {error && <div style={{ background: "#EF444420", border: `1px solid ${C.red}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: C.red, marginTop: 14 }}>{error}</div>}

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, background: "transparent", border: `1px solid ${C.border}`, color: C.mid, borderRadius: 10, padding: "13px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>← Back</button>
              <button onClick={createDoc} disabled={loading} style={{ flex: 2, background: loading ? C.surface2 : C.gold, color: loading ? C.dim : "#0C0C0E", border: "none", borderRadius: 10, padding: "13px", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                {loading ? "Creating..." : "Create & Get Link →"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — Done! */}
        {step === 4 && docCreated && (
          <div style={{ background: C.surface, border: `1px solid ${C.green}`, borderRadius: 16, padding: 28, textAlign: "center" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: C.green, marginBottom: 8 }}>
              Proposal Ready!
            </div>
            <div style={{ fontSize: 14, color: C.mid, lineHeight: 1.7, marginBottom: 28 }}>
              Your proposal for <strong style={{ color: C.text }}>{clientName}</strong> is live. Share the link — no account needed for them to sign.
            </div>

            <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", marginBottom: 20, fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.gold, wordBreak: "break-all" }}>
              {window.location.origin}/sign/{docCreated.sign_token}
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <button onClick={copyLink} style={{
                flex: 1, background: copied ? C.greenDim : C.goldDim,
                border: `1px solid ${copied ? C.green : C.gold}`,
                color: copied ? C.green : C.gold, borderRadius: 10, padding: "13px",
                fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}>
                {copied ? "✓ Copied!" : "📋 Copy Signing Link"}
              </button>
              {clientEmail && (
                <button style={{ flex: 1, background: C.surface2, border: `1px solid ${C.border}`, color: C.mid, borderRadius: 10, padding: "13px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  📧 Email to Client
                </button>
              )}
            </div>

            <button onClick={async () => { await onComplete(); nav("/dashboard"); }} style={{ width: "100%", background: C.gold, color: "#0C0C0E", border: "none", borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              Go to Dashboard →
            </button>

            <div style={{ fontSize: 12, color: C.dim, marginTop: 16 }}>
              You'll be notified when {clientName} opens and signs the proposal.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}