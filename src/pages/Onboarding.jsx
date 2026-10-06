import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

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
const red = "#B3432B";
const redDim = "#B3432B15";

const fontDisplay = "'Playfair Display', 'Fraunces', Georgia, serif";
const fontSans = "'Manrope', 'Inter', system-ui, sans-serif";
const fontMono = "'IBM Plex Mono', 'DM Mono', ui-monospace, monospace";

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
  { id: 1, label: "Template" },
  { id: 2, label: "Client" },
  { id: 3, label: "Price" },
  { id: 4, label: "Send" },
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
    width: "100%", background: card, border: `1px solid ${line}`,
    borderRadius: 12, padding: "13px 15px", fontSize: 14, color: ink,
    fontFamily: fontSans, outline: "none", boxSizing: "border-box",
    transition: "border-color .2s, box-shadow .2s",
  };
  const lbl = {
    fontFamily: fontMono, fontSize: 10, color: inkMid, fontWeight: 500,
    letterSpacing: ".14em", textTransform: "uppercase", display: "block", marginBottom: 8,
  };

  const progressPct = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: fontSans, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, position: "relative", overflow: "hidden" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        .in-focus:focus{border-color:${ink}!important;box-shadow:0 0 0 4px rgba(10,10,10,.06)}
        .btn-dark{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:10px;background:${ink};color:#fff;border:none;padding:14px;border-radius:14px;font-size:14.5px;font-weight:600;cursor:pointer;font-family:${fontSans};box-shadow:0 14px 30px -12px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.14);transition:all .3s cubic-bezier(.22,1,.36,1);outline:1px solid rgba(0,0,0,.3);outline-offset:-1px}
        .btn-dark:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 20px 40px -12px rgba(0,0,0,.65),inset 0 1px 0 rgba(255,255,255,.2)}
        .btn-dark:disabled{opacity:.5;cursor:not-allowed;box-shadow:none;background:${bgAlt};color:${inkFaint};outline:none}
        .btn-light{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:${card};color:${ink};border:1px solid ${line};padding:13px 22px;border-radius:14px;font-size:14px;font-weight:500;cursor:pointer;font-family:${fontSans};transition:all .3s cubic-bezier(.22,1,.36,1)}
        .btn-light:hover{border-color:${inkFaint};transform:translateY(-1px);box-shadow:0 10px 22px -6px rgba(0,0,0,.1)}
        .btn-gold{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:${goldSoft};color:${ink};border:none;padding:14px;border-radius:14px;font-size:14.5px;font-weight:700;cursor:pointer;font-family:${fontSans};box-shadow:0 14px 30px -10px rgba(245,166,35,.5),inset 0 1px 0 rgba(255,255,255,.4);transition:all .3s cubic-bezier(.22,1,.36,1)}
        .btn-gold:hover{transform:translateY(-1px);box-shadow:0 20px 42px -10px rgba(245,166,35,.6)}
        .tpl-opt{padding:18px 20px;border-radius:14px;cursor:pointer;background:${card};border:1px solid ${line};display:flex;justify-content:space-between;align-items:center;transition:all .3s cubic-bezier(.22,1,.36,1)}
        .tpl-opt:hover{border-color:${inkFaint};transform:translateY(-1px)}
        .tpl-opt.sel{border-color:${ink};background:${bg};box-shadow:0 10px 24px -16px rgba(15,15,15,.3), inset 0 1px 0 rgba(255,255,255,.5)}
      `}</style>

      {/* soft gold glow */}
      <div style={{ position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)", width: 700, height: 420, borderRadius: "50%", background: `${goldSoft}10`, filter: "blur(80px)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 600, position: "relative", zIndex: 1 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10, cursor: "pointer" }} onClick={() => nav("/")}>
          <div style={{ width: 32, height: 32, background: ink, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: fontDisplay, boxShadow: "0 6px 14px -6px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.12)" }}>F</div>
          <span style={{ fontFamily: fontDisplay, fontSize: 20, fontWeight: 600, letterSpacing: "-.3px" }}>FlowDocs</span>
        </div>
        <div style={{ textAlign: "center", fontSize: 14, color: inkMid, marginBottom: 32, fontFamily: fontSans }}>
          Welcome, <span style={{ color: ink, fontWeight: 600 }}>{profile?.name?.split(" ")[0] || "there"}</span> — let's send your first proposal.
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontFamily: fontMono, fontSize: 10.5, color: inkMid, fontWeight: 500, letterSpacing: ".16em", textTransform: "uppercase" }}>
              Step 0{step} <span style={{ color: inkFaint }}>of 04</span>
            </div>
            <div style={{ fontFamily: fontMono, fontSize: 10.5, color: ink, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase" }}>
              {STEPS[step - 1].label}
            </div>
          </div>
          <div style={{ width: "100%", height: 4, background: lineSoft, borderRadius: 100, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progressPct}%`, background: `linear-gradient(90deg, ${goldSoft}, ${gold})`, borderRadius: 100, transition: "width .5s cubic-bezier(.22,1,.36,1)", boxShadow: `0 0 10px ${goldSoft}60` }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
            {STEPS.map((s) => (
              <div key={s.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: step > s.id ? stamp : step === s.id ? goldSoft : lineSoft,
                  border: step === s.id ? `2px solid ${gold}30` : "none",
                  boxShadow: step === s.id ? `0 0 0 4px ${goldSoft}20` : "none",
                  transition: "all .3s cubic-bezier(.22,1,.36,1)",
                }} />
                <div style={{ fontFamily: fontMono, fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: step >= s.id ? inkMid : inkFaint, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1 — Choose template */}
        {step === 1 && (
          <div style={{ background: card, border: `1px solid ${line}`, borderRadius: 24, padding: 36, boxShadow: "0 24px 60px -30px rgba(15,15,15,.18)" }}>
            <div style={{ fontFamily: fontMono, fontSize: 10.5, color: inkMid, fontWeight: 500, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 12 }}>§ 01 · Template</div>
            <h2 style={{ fontFamily: fontDisplay, fontSize: 30, fontWeight: 500, letterSpacing: "-.5px", color: ink, lineHeight: 1.1, marginBottom: 10 }}>
              Pick a <span style={{ fontStyle: "italic", color: gold }}>template</span>
            </h2>
            <p style={{ fontSize: 14, color: inkMid, marginBottom: 24, lineHeight: 1.55 }}>
              Pre-filled and ready to send — edit after if needed.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {Object.entries(TEMPLATES).map(([key, t]) => {
                const sel = selected === key;
                return (
                  <div key={key} onClick={() => { setSelected(key); setAmount(t.amount); }} className={"tpl-opt " + (sel ? "sel" : "")}>
                    <div>
                      <div style={{ fontFamily: fontDisplay, fontSize: 16, fontWeight: 500, color: ink, letterSpacing: "-.2px" }}>{t.title}</div>
                      <div style={{ fontFamily: fontMono, fontSize: 10, color: inkMid, marginTop: 4, letterSpacing: ".12em", textTransform: "uppercase" }}>{t.type}</div>
                    </div>
                    <div style={{ fontFamily: fontDisplay, fontSize: 20, fontWeight: 600, color: sel ? gold : ink, letterSpacing: "-.3px" }}>
                      ${t.amount.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => selected && setStep(2)}
              disabled={!selected}
              className="btn-dark"
              style={{ width: "100%", marginTop: 24 }}
            >
              Continue →
            </button>
            <button onClick={async () => { await onComplete(); nav("/dashboard"); }} style={{ width: "100%", marginTop: 12, background: "none", border: "none", color: inkMid, fontSize: 13, cursor: "pointer", fontFamily: fontSans, textDecoration: "underline", textDecorationColor: `${line}`, textUnderlineOffset: 4, padding: 8 }}>
              Skip — go to dashboard
            </button>
          </div>
        )}

        {/* STEP 2 — Client details */}
        {step === 2 && (
          <div style={{ background: card, border: `1px solid ${line}`, borderRadius: 24, padding: 36, boxShadow: "0 24px 60px -30px rgba(15,15,15,.18)" }}>
            <div style={{ fontFamily: fontMono, fontSize: 10.5, color: inkMid, fontWeight: 500, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 12 }}>§ 02 · Client</div>
            <h2 style={{ fontFamily: fontDisplay, fontSize: 30, fontWeight: 500, letterSpacing: "-.5px", color: ink, lineHeight: 1.1, marginBottom: 10 }}>
              Who is this <span style={{ fontStyle: "italic", color: gold }}>for?</span>
            </h2>
            <p style={{ fontSize: 14, color: inkMid, marginBottom: 24, lineHeight: 1.55 }}>Just a name is enough — email is optional.</p>

            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Client Name *</label>
              <input className="in-focus" style={inp} placeholder="e.g. Rahul Sharma or Nova Corp" value={clientName} onChange={e => setClientName(e.target.value)} autoFocus />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={lbl}>
                Client Email <span style={{ color: inkFaint, fontWeight: 400, textTransform: "none", letterSpacing: 0, fontFamily: fontSans, fontSize: 11 }}>(optional)</span>
              </label>
              <input className="in-focus" style={inp} type="email" placeholder="client@email.com" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(1)} className="btn-light" style={{ flex: 1 }}>← Back</button>
              <button
                onClick={() => clientName && setStep(3)}
                disabled={!clientName}
                className="btn-dark"
                style={{ flex: 2 }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Set price */}
        {step === 3 && (
          <div style={{ background: card, border: `1px solid ${line}`, borderRadius: 24, padding: 36, boxShadow: "0 24px 60px -30px rgba(15,15,15,.18)" }}>
            <div style={{ fontFamily: fontMono, fontSize: 10.5, color: inkMid, fontWeight: 500, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 12 }}>§ 03 · Price</div>
            <h2 style={{ fontFamily: fontDisplay, fontSize: 30, fontWeight: 500, letterSpacing: "-.5px", color: ink, lineHeight: 1.1, marginBottom: 10 }}>
              Set your <span style={{ fontStyle: "italic", color: gold }}>price</span>
            </h2>
            <p style={{ fontSize: 14, color: inkMid, marginBottom: 24, lineHeight: 1.55 }}>Pre-filled from template — change if needed.</p>

            <div style={{ background: bgAlt, border: `1px solid ${line}`, borderRadius: 14, padding: "16px 20px", marginBottom: 22 }}>
              <div style={{ fontFamily: fontMono, fontSize: 10, color: inkMid, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 4 }}>Sending to</div>
              <div style={{ fontFamily: fontDisplay, fontSize: 18, fontWeight: 500, letterSpacing: "-.2px", color: ink }}>{clientName}</div>
              {clientEmail && <div style={{ fontSize: 12.5, color: inkMid, marginTop: 2 }}>{clientEmail}</div>}
            </div>

            <label style={lbl}>Amount (USD)</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", color: gold, fontFamily: fontDisplay, fontSize: 24, fontWeight: 500 }}>$</span>
              <input
                className="in-focus"
                style={{ ...inp, paddingLeft: 40, fontSize: 32, fontFamily: fontDisplay, fontWeight: 500, letterSpacing: "-.5px", height: 72 }}
                type="number" value={amount} onChange={e => setAmount(e.target.value)}
              />
            </div>

            {error && (
              <div style={{ background: redDim, border: `1px solid ${red}40`, borderRadius: 12, padding: "11px 15px", fontSize: 13, color: red, marginTop: 16 }}>{error}</div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={() => setStep(2)} className="btn-light" style={{ flex: 1 }}>← Back</button>
              <button onClick={createDoc} disabled={loading} className="btn-dark" style={{ flex: 2 }}>
                {loading ? "Creating…" : "Create & get link →"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — Done */}
        {step === 4 && docCreated && (
          <div style={{ background: card, border: `1px solid ${line}`, borderRadius: 24, padding: 36, textAlign: "center", boxShadow: "0 24px 60px -30px rgba(15,15,15,.18)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", width: 400, height: 240, borderRadius: "50%", background: `${goldSoft}15`, filter: "blur(70px)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <div style={{ width: 68, height: 68, borderRadius: 20, background: stampDim, border: `1px solid ${stamp}30`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", color: stamp, fontSize: 32, fontWeight: 700, boxShadow: `0 10px 24px -10px ${stamp}30` }}>✓</div>
              <div style={{ fontFamily: fontMono, fontSize: 10.5, color: stamp, fontWeight: 600, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 10 }}>§ 04 · Ready</div>
              <h2 style={{ fontFamily: fontDisplay, fontSize: 32, fontWeight: 500, letterSpacing: "-.6px", color: ink, lineHeight: 1.1, marginBottom: 14 }}>
                Proposal <span style={{ fontStyle: "italic", color: gold }}>ready</span>
              </h2>
              <p style={{ fontSize: 14, color: inkMid, lineHeight: 1.65, marginBottom: 28, maxWidth: 420, margin: "0 auto 28px" }}>
                Your proposal for <strong style={{ color: ink, fontWeight: 600 }}>{clientName}</strong> is live. Share the link — no account needed to sign.
              </p>

              <div style={{ background: inkDeep, borderRadius: 14, padding: "14px 18px", marginBottom: 22, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 14px 30px -12px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.06)" }}>
                <span style={{ fontFamily: fontMono, fontSize: 11, color: "#737373" }}>→</span>
                <code style={{ flex: 1, fontFamily: fontMono, fontSize: 12, color: "#E5E5E5", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "left" }}>
                  {window.location.origin}/sign/<span style={{ color: goldSoft }}>{docCreated.sign_token}</span>
                </code>
              </div>

              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <button onClick={copyLink} className={copied ? "btn-dark" : "btn-gold"} style={{ flex: 1, background: copied ? stamp : goldSoft, color: copied ? "#fff" : ink, boxShadow: copied ? `0 14px 30px -12px ${stamp}70, inset 0 1px 0 rgba(255,255,255,.14)` : undefined }}>
                  {copied ? "✓ Copied" : "📋 Copy signing link"}
                </button>
                {clientEmail && (
                  <button className="btn-light" style={{ flex: 1 }}>📧 Email to client</button>
                )}
              </div>

              <button onClick={async () => { await onComplete(); nav("/dashboard"); }} className="btn-dark" style={{ width: "100%" }}>
                Go to dashboard →
              </button>

              <div style={{ fontFamily: fontMono, fontSize: 10.5, color: inkFaint, marginTop: 18, letterSpacing: ".12em", textTransform: "uppercase" }}>
                You'll be notified when {clientName} opens & signs
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
