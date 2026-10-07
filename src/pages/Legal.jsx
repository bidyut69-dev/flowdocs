import { useNavigate } from "react-router-dom";

const bg = "#F5F4F2";
const card = "#FFFFFF";
const ink = "#0A0A0A";
const inkMid = "#525252";
const inkFaint = "#A3A3A3";
const line = "#E7E5E0";
const gold = "#C8820F";
const goldSoft = "#F5A623";

const fontDisplay = "'Playfair Display', 'Fraunces', Georgia, serif";
const fontSans = "'Manrope', 'Inter', system-ui, sans-serif";
const fontMono = "'IBM Plex Mono', 'DM Mono', ui-monospace, monospace";

const COMPANY = "FlowDocs";
const EMAIL = "support@flowdocs.co.in";
const DOMAIN = "flowdocs.co.in";
const DATE = "April 5, 2026";

function LegalLayout({ title, children }) {
  const nav = useNavigate();
  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: fontSans, padding: "32px 20px" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        .legal-content h2 { font-family: ${fontDisplay}; font-size: 24px; font-weight: 500; color: ${ink}; margin: 36px 0 12px; letter-spacing: -.3px; }
        .legal-content h2:first-child { margin-top: 0; }
        .legal-content h3 { font-family: ${fontMono}; font-size: 11.5px; font-weight: 600; color: ${gold}; margin: 20px 0 6px; letter-spacing: .12em; text-transform: uppercase; }
        .legal-content p { color: ${inkMid}; font-size: 14.5px; line-height: 1.75; margin-bottom: 12px; }
        .legal-content li { color: ${inkMid}; font-size: 14.5px; line-height: 1.75; margin-bottom: 6px; }
        .legal-content ul { padding-left: 22px; margin-bottom: 14px; }
        .legal-content a { color: ${gold}; text-decoration: underline; text-decoration-color: ${goldSoft}60; text-underline-offset: 3px; font-weight: 500; transition: color .2s; }
        .legal-content a:hover { color: ${goldSoft}; }
        .legal-content strong { color: ${ink}; font-weight: 600; }
      `}</style>

      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => nav("/")}>
            <div style={{ width: 30, height: 30, background: ink, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: fontDisplay, boxShadow: "0 6px 14px -6px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.12)" }}>F</div>
            <span style={{ fontFamily: fontDisplay, fontSize: 19, fontWeight: 600, letterSpacing: "-.3px", color: ink }}>FlowDocs</span>
          </div>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => nav(-1)}
            style={{
              background: card, border: `1px solid ${line}`, color: ink,
              borderRadius: 12, padding: "9px 18px", cursor: "pointer",
              fontSize: 13, fontFamily: fontSans, fontWeight: 500,
              boxShadow: "0 3px 10px -2px rgba(0,0,0,.04)", transition: "all .3s cubic-bezier(.22,1,.36,1)",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.borderColor = inkFaint; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = line; }}
          >← Back</button>
        </div>

        {/* Title card */}
        <div style={{ background: card, border: `1px solid ${line}`, borderRadius: 24, padding: "36px 40px", marginBottom: 20, boxShadow: "0 2px 10px -2px rgba(0,0,0,.03)" }}>
          <div style={{ fontFamily: fontMono, fontSize: 10.5, color: inkMid, fontWeight: 500, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 14 }}>§ Legal Document</div>
          <h1 style={{ fontFamily: fontDisplay, fontSize: 44, fontWeight: 500, color: ink, letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 12 }}>{title}</h1>
          <div style={{ fontSize: 13, color: inkMid, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            <span>Last updated: <strong style={{ color: ink, fontWeight: 600 }}>{DATE}</strong></span>
            <span style={{ opacity: .5 }}>·</span>
            <span>{COMPANY}</span>
            <span style={{ opacity: .5 }}>·</span>
            <a href={`mailto:${EMAIL}`} style={{ color: gold, textDecoration: "underline", textDecorationColor: `${goldSoft}60`, textUnderlineOffset: 3, fontWeight: 500 }}>{EMAIL}</a>
          </div>
        </div>

        {/* Content */}
        <div className="legal-content" style={{ background: card, border: `1px solid ${line}`, borderRadius: 24, padding: "40px 44px", boxShadow: "0 2px 10px -2px rgba(0,0,0,.03)" }}>
          {children}
        </div>

        <div style={{ textAlign: "center", marginTop: 32, fontFamily: fontMono, fontSize: 11, color: inkFaint, letterSpacing: ".14em", textTransform: "uppercase" }}>
          © {new Date().getFullYear()} {COMPANY}
          <span style={{ margin: "0 10px", opacity: .5 }}>·</span>
          <span style={{ color: inkMid, cursor: "pointer" }} onClick={() => nav("/privacy")}>Privacy</span>
          <span style={{ margin: "0 10px", opacity: .5 }}>·</span>
          <span style={{ color: inkMid, cursor: "pointer" }} onClick={() => nav("/terms")}>Terms</span>
        </div>
      </div>
    </div>
  );
}

export function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy">
      <p>This Privacy Policy explains how {COMPANY} ("we", "our", or "us") collects, uses, and protects your information when you use {DOMAIN}.</p>

      <h2>1. Information We Collect</h2>
      <h3>Account Information</h3>
      <p>When you register, we collect your name, email address, and password (encrypted). We never store plain-text passwords.</p>
      <h3>Document Data</h3>
      <p>Documents, client details, signatures, and invoice data you create are stored securely in our database. This data belongs to you.</p>
      <h3>Usage Data</h3>
      <p>With your consent (via cookie banner), we collect anonymized usage data including pages visited, features used, and general interaction patterns to improve the product.</p>
      <h3>Technical Data</h3>
      <p>IP address, browser type, device type, and timestamps are logged for security and fraud prevention purposes.</p>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To provide and operate the {COMPANY} service</li>
        <li>To send transactional emails (document signing notifications, account verification)</li>
        <li>To process payments and manage subscriptions</li>
        <li>To improve and develop our product</li>
        <li>To prevent fraud and ensure security</li>
        <li>To comply with legal obligations</li>
      </ul>

      <h2>3. Data Sharing</h2>
      <p>We do not sell your data. We share data only with:</p>
      <ul>
        <li><strong>Supabase</strong> — database and authentication infrastructure</li>
        <li><strong>Resend</strong> — transactional email delivery</li>
        <li><strong>Razorpay</strong> — payment processing (we never see your card details)</li>
        <li><strong>Law enforcement</strong> — only when legally required</li>
      </ul>

      <h2>4. Data Security</h2>
      <p>All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Signatures are stored in isolated, access-controlled storage. We implement Row Level Security (RLS) ensuring users can only access their own data.</p>

      <h2>5. Your Rights (GDPR / India DPDP Act)</h2>
      <ul>
        <li><strong>Access</strong> — Request a copy of your data</li>
        <li><strong>Correction</strong> — Update incorrect information</li>
        <li><strong>Deletion</strong> — Request account and data deletion</li>
        <li><strong>Portability</strong> — Export your data in JSON format</li>
        <li><strong>Objection</strong> — Opt out of analytics tracking</li>
      </ul>
      <p>To exercise these rights, email <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. We respond within 30 days.</p>

      <h2>6. Cookies</h2>
      <p>We use essential cookies for authentication sessions. With your consent, we use analytics cookies to understand product usage. You can manage preferences via our cookie banner at any time.</p>

      <h2>7. Data Retention</h2>
      <p>Your data is retained as long as your account is active. Upon deletion request, we purge all personal data within 30 days, except where legally required to retain records.</p>

      <h2>8. Children's Privacy</h2>
      <p>{COMPANY} is not intended for users under 18. We do not knowingly collect data from minors.</p>

      <h2>9. Changes</h2>
      <p>We will notify you of material changes via email or in-app notification at least 14 days before changes take effect.</p>

      <h2>10. Contact</h2>
      <p>Privacy questions: <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
    </LegalLayout>
  );
}

export function TermsOfService() {
  return (
    <LegalLayout title="Terms of Service">
      <p>By using {COMPANY} at {DOMAIN}, you agree to these Terms. Please read them carefully.</p>

      <h2>1. Service Description</h2>
      <p>{COMPANY} provides a document workflow platform enabling users to create proposals, contracts, invoices, and collect electronic signatures. The service is provided "as is" for lawful business purposes.</p>

      <h2>2. Account Responsibilities</h2>
      <ul>
        <li>You must be 18 years or older to use this service</li>
        <li>You are responsible for all activity under your account</li>
        <li>You must not share your login credentials</li>
        <li>You must provide accurate information during registration</li>
        <li>You must notify us immediately of any unauthorized access</li>
      </ul>

      <h2>3. Acceptable Use</h2>
      <p>You may NOT use {COMPANY} to:</p>
      <ul>
        <li>Create fraudulent documents or forge signatures</li>
        <li>Send spam, phishing, or illegal content to clients</li>
        <li>Violate any applicable law or regulation</li>
        <li>Reverse engineer or attempt to access our systems</li>
        <li>Impersonate another person or business</li>
      </ul>

      <h2>4. Electronic Signatures</h2>
      <p>Signatures collected through {COMPANY} are legally valid under the Information Technology Act, 2000 (India), the ESIGN Act (USA), and eIDAS Regulation (EU). You are responsible for ensuring signatories have the legal capacity to sign. We provide the technical infrastructure; we are not a party to any agreement between you and your clients.</p>

      <h2>5. Payment & Subscriptions</h2>
      <ul>
        <li>Free plan: limited to 3 documents per month</li>
        <li>Pro plan: billed monthly or annually, cancel anytime</li>
        <li>Refunds: contact us within 7 days of charge for a full refund</li>
        <li>We reserve the right to modify pricing with 30 days notice</li>
      </ul>

      <h2>6. Data Ownership</h2>
      <p>You own all documents, client data, and content you create. We claim no ownership over your data. We need a limited license to host and transmit your content to provide the service.</p>

      <h2>7. Service Availability</h2>
      <p>We target 99.9% uptime. We are not liable for downtime caused by third-party infrastructure (Supabase, Resend, Vercel) or events outside our control. We will notify users of planned maintenance.</p>

      <h2>8. Limitation of Liability</h2>
      <p>To the maximum extent permitted by law, {COMPANY} is not liable for indirect, incidental, or consequential damages. Our maximum liability is limited to the amount paid by you in the last 3 months.</p>

      <h2>9. Termination</h2>
      <p>We may terminate accounts that violate these Terms. You may delete your account at any time from Settings. Upon termination, your data will be deleted within 30 days.</p>

      <h2>10. Governing Law</h2>
      <p>These Terms are governed by the laws of India. Disputes shall be resolved in the courts of West Bengal, India.</p>

      <h2>11. Changes to Terms</h2>
      <p>We will notify you 14 days before material changes via email. Continued use after changes constitutes acceptance.</p>

      <h2>12. Contact</h2>
      <p>Legal questions: <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
    </LegalLayout>
  );
}
