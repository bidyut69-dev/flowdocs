import { useNavigate } from "react-router-dom";

const C = {
  bg: "#0C0C0E", surface: "#141416", surface2: "#1C1C1F", border: "#2A2A2E",
  gold: "#F5A623", goldDim: "#F5A62318", text: "#F0EEE8", dim: "#7A7875",
  mid: "#B0ADA8", green: "#22C55E",
};

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: ${C.bg}; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%,100% { opacity: 0.4; transform: scale(0.95); }
    50%      { opacity: 1;   transform: scale(1.05); }
  }
  @keyframes floatA {
    0%,100% { transform: translateY(0px) rotate(-1deg); }
    50%      { transform: translateY(-12px) rotate(1deg); }
  }
  @keyframes floatB {
    0%,100% { transform: translateY(0px) rotate(1deg); }
    50%      { transform: translateY(-8px) rotate(-1deg); }
  }
  @keyframes floatC {
    0%,100% { transform: translateY(-4px) rotate(0deg); }
    50%      { transform: translateY(8px) rotate(2deg); }
  }

  .hero-section { animation: fadeUp 0.7s ease both; }
  .hero-section:nth-child(2) { animation-delay: 0.1s; }
  .hero-section:nth-child(3) { animation-delay: 0.2s; }

  .float-a { animation: floatA 5s ease-in-out infinite; }
  .float-b { animation: floatB 6s ease-in-out infinite 0.5s; }
  .float-c { animation: floatC 7s ease-in-out infinite 1s; }

  .feature-card {
    background: ${C.surface};
    border: 1px solid ${C.border};
    border-radius: 14px;
    padding: 28px;
    transition: border-color 0.2s, transform 0.2s;
    cursor: default;
  }
  .feature-card:hover {
    border-color: ${C.gold};
    transform: translateY(-3px);
  }

  .pricing-card {
    background: ${C.surface};
    border: 1px solid ${C.border};
    border-radius: 16px;
    padding: 32px;
    transition: all 0.2s;
    flex: 1;
  }
  .pricing-card.pro {
    border-color: ${C.gold};
    background: linear-gradient(160deg, #1C1A14 0%, ${C.surface} 60%);
    position: relative;
  }

  .btn-primary {
    background: ${C.gold};
    color: #0C0C0E;
    border: none;
    padding: 14px 32px;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .btn-primary:hover { background: #F0B84A; transform: translateY(-2px); box-shadow: 0 8px 24px #F5A62340; }

  .btn-ghost {
    background: transparent;
    color: ${C.mid};
    border: 1px solid ${C.border};
    padding: 12px 24px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .btn-ghost:hover { border-color: ${C.mid}; color: ${C.text}; }

  .step-num {
    width: 36px; height: 36px;
    background: ${C.goldDim};
    border: 1px solid ${C.gold};
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'DM Mono', monospace;
    font-size: 13px; color: ${C.gold}; font-weight: 500;
    flex-shrink: 0;
  }

  .testimonial {
    background: ${C.surface};
    border: 1px solid ${C.border};
    border-radius: 14px;
    padding: 24px;
    flex: 1;
    min-width: 260px;
  }

  .stat-box {
    text-align: center;
    padding: 28px 20px;
    border-right: 1px solid ${C.border};
  }
  .stat-box:last-child { border-right: none; }

  @media (max-width: 768px) {
    .hero-grid { flex-direction: column !important; }
    .features-grid { grid-template-columns: 1fr !important; }
    .pricing-grid { flex-direction: column !important; }
    .stats-row { flex-direction: column !important; }
    .stat-box { border-right: none !important; border-bottom: 1px solid ${C.border}; }
    .stat-box:last-child { border-bottom: none; }
    .steps-row { flex-direction: column !important; }
    .testimonials-row { flex-direction: column !important; }
    .nav-links { display: none !important; }
  }
`;

export default function Landing() {
  const nav = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.text }}>
      <style>{S}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(12,12,14,0.85)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.border}`,
        padding: "0 5vw",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", height: 60, gap: 32 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: C.gold }}>⚡ FlowDocs</div>
          <div className="nav-links" style={{ display: "flex", gap: 28, flex: 1 }}>
            {["Features", "Pricing", "How it Works"].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`}
                style={{ fontSize: 14, color: C.dim, textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => e.target.style.color = C.text}
                onMouseLeave={e => e.target.style.color = C.dim}>
                {l}
              </a>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
            <button className="btn-ghost" style={{ padding: "8px 18px", fontSize: 13 }} onClick={() => nav("/auth")}>Sign In</button>
            <button className="btn-primary" style={{ padding: "8px 18px", fontSize: 13 }} onClick={() => nav("/auth")}>Get Started Free</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 5vw 60px" }}>
        <div className="hero-grid" style={{ display: "flex", gap: 48, alignItems: "center" }}>

          {/* Left */}
          <div style={{ flex: 1 }}>
            <div className="hero-section" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: C.goldDim, border: `1px solid ${C.gold}`,
              borderRadius: 20, padding: "5px 14px", fontSize: 12,
              color: C.gold, fontFamily: "'DM Mono', monospace", marginBottom: 24,
            }}>
              ⚡ Free to start · No credit card
            </div>

            <h1 className="hero-section" style={{
              fontFamily: "'Syne', sans-serif", fontSize: "clamp(36px, 5vw, 58px)",
              fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1.5px",
              color: C.text, marginBottom: 20,
            }}>
              Send Proposals.<br />
              <span style={{ color: C.gold }}>Get Paid Faster.</span>
            </h1>

            <p className="hero-section" style={{
              fontSize: 17, color: C.mid, lineHeight: 1.7, marginBottom: 32, maxWidth: 480,
            }}>
              FlowDocs lets freelancers send proposals, contracts, and invoices —
              and collect legally valid eSignatures — all in one place.
              <strong style={{ color: C.text }}> No DocuSign. No chaos.</strong>
            </p>

            <div className="hero-section" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="btn-primary" onClick={() => nav("/auth")}>Start for Free →</button>
              <button className="btn-ghost" onClick={() => document.getElementById("how-it-works").scrollIntoView({ behavior: "smooth" })}>See how it works</button>
            </div>

            <div className="hero-section" style={{ display: "flex", gap: 20, marginTop: 28, flexWrap: "wrap" }}>
              {[
                { icon: "✓", text: "Legally valid eSign" },
                { icon: "✓", text: "PDF in seconds" },
                { icon: "✓", text: "Free plan available" },
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.mid }}>
                  <span style={{ color: C.green, fontWeight: 700 }}>{f.icon}</span> {f.text}
                </div>
              ))}
            </div>
          </div>

          {/* Right — floating UI cards */}
          <div style={{ flex: 1, position: "relative", minHeight: 340, display: "flex", alignItems: "center", justifyContent: "center" }}>

            {/* Main dashboard card */}
            <div className="float-a" style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 16, padding: "20px 22px", width: 280,
              boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: C.gold, fontFamily: "'DM Mono', monospace" }}>TOTAL BILLED</div>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, marginTop: 3 }} />
              </div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: C.text, marginBottom: 4 }}>$12,400</div>
              <div style={{ fontSize: 12, color: C.green }}>↑ 22% this month</div>
              <div style={{ height: 1, background: C.border, margin: "16px 0" }} />
              {[
                { name: "Nova Corp", type: "Contract", status: "signed", color: C.green },
                { name: "StartX", type: "Proposal", status: "pending", color: C.gold },
                { name: "Blue Ridge", type: "Invoice", status: "paid", color: C.green },
              ].map((d, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{d.name}</div>
                    <div style={{ fontSize: 10, color: C.dim }}>{d.type}</div>
                  </div>
                  <div style={{ fontSize: 10, color: d.color, background: d.color + "20", borderRadius: 10, padding: "2px 8px", fontFamily: "'DM Mono', monospace" }}>
                    {d.status}
                  </div>
                </div>
              ))}
            </div>

            {/* Floating sign card */}
            <div className="float-b" style={{
              position: "absolute", top: 10, right: -20,
              background: C.surface, border: `1px solid ${C.green}`,
              borderRadius: 12, padding: "14px 18px", width: 170,
              boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
            }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>✍️</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.green }}>Document Signed!</div>
              <div style={{ fontSize: 11, color: C.dim, marginTop: 3 }}>Nova Corp · just now</div>
            </div>

            {/* Floating invoice card */}
            <div className="float-c" style={{
              position: "absolute", bottom: 20, right: 10,
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 12, padding: "14px 18px", width: 155,
              boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
            }}>
              <div style={{ fontSize: 11, color: C.dim, marginBottom: 4, fontFamily: "'DM Mono', monospace" }}>INVOICE PAID</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: C.gold }}>$3,500</div>
              <div style={{ fontSize: 11, color: C.mid, marginTop: 2 }}>Blue Ridge Co</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto 80px", padding: "0 5vw" }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
          <div className="stats-row" style={{ display: "flex" }}>
            {[
              { value: "$0", label: "Setup cost" },
              { value: "2 min", label: "To send a proposal" },
              { value: "100%", label: "Legally valid signatures" },
              { value: "3x", label: "Faster than DocuSign workflow" },
            ].map((s, i) => (
              <div key={i} className="stat-box" style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, color: C.gold, marginBottom: 6 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: C.dim }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ maxWidth: 1100, margin: "0 auto 80px", padding: "0 5vw" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 11, color: C.gold, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 12 }}>Features</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, color: C.text, letterSpacing: "-0.5px" }}>
            Everything a freelancer needs
          </h2>
        </div>

        <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { icon: "📄", title: "Smart Proposals", desc: "Create professional proposals in minutes. Clients view online — no PDF downloads needed." },
            { icon: "✍️", title: "eSignatures", desc: "Legally binding signatures collected online. Works on mobile, tablet, desktop — worldwide." },
            { icon: "◈", title: "Invoice Generation", desc: "Auto-generate GST-ready invoices. Track paid, pending, and overdue — all in one dashboard." },
            { icon: "📋", title: "Contracts & NDAs", desc: "Use ready-made templates or create your own. Send, track, and store securely." },
            { icon: "🔔", title: "Email Notifications", desc: "Auto-notify clients when you send a document. Get notified the instant they sign." },
            { icon: "🔗", title: "Shareable Links", desc: "Every document gets a unique signing link. Share via WhatsApp, email, or anywhere." },
          ].map((f, i) => (
            <div key={i} className="feature-card">
              <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13.5, color: C.mid, lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ maxWidth: 1100, margin: "0 auto 80px", padding: "0 5vw" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 11, color: C.gold, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 12 }}>Process</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, color: C.text, letterSpacing: "-0.5px" }}>
            From proposal to payment in 4 steps
          </h2>
        </div>

        <div className="steps-row" style={{ display: "flex", gap: 16, position: "relative" }}>
          {[
            { n: "01", title: "Create document", desc: "Choose Proposal, Contract, Invoice, or NDA. Fill in the details in under 2 minutes." },
            { n: "02", title: "Add your client", desc: "Add client name and email. All their info saved for future documents." },
            { n: "03", title: "Send signing link", desc: "Client gets a unique link via email. They open it, sign with their finger or mouse." },
            { n: "04", title: "Get paid", desc: "Signed PDF lands in your dashboard instantly. Follow up on invoices with one click." },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, position: "relative" }}>
              <div style={{ position: "absolute", top: -1, left: 0, right: 0, height: 2, background: C.gold, borderRadius: "14px 14px 0 0" }} />
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.gold, marginBottom: 14, letterSpacing: 1 }}>{s.n}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: C.mid, lineHeight: 1.7 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ maxWidth: 1100, margin: "0 auto 80px", padding: "0 5vw" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 11, color: C.gold, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 12 }}>Pricing</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, color: C.text, letterSpacing: "-0.5px" }}>
            Simple, honest pricing
          </h2>
          <p style={{ fontSize: 15, color: C.mid, marginTop: 12 }}>DocuSign charges $30+/month. We don't.</p>
        </div>

        <div className="pricing-grid" style={{ display: "flex", gap: 20 }}>
          {/* Free */}
          <div className="pricing-card">
            <div style={{ fontSize: 11, color: C.dim, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 12 }}>Free</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 40, fontWeight: 800, color: C.text, marginBottom: 4 }}>$0</div>
            <div style={{ fontSize: 13, color: C.dim, marginBottom: 28 }}>Forever free</div>
            {["3 documents/month", "eSignature collection", "PDF download", "Client dashboard", "Email notifications"].map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13.5, color: C.mid }}>
                <span style={{ color: C.green, fontSize: 12 }}>✓</span> {f}
              </div>
            ))}
            <button className="btn-ghost" style={{ width: "100%", justifyContent: "center", marginTop: 24 }} onClick={() => nav("/auth")}>
              Get Started Free
            </button>
          </div>

          {/* Pro */}
          <div className="pricing-card pro">
            <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: C.gold, color: "#0C0C0E", fontSize: 11, fontWeight: 700, padding: "4px 16px", borderRadius: 20, fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap" }}>
              MOST POPULAR
            </div>
            <div style={{ fontSize: 11, color: C.gold, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 12 }}>Pro</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 40, fontWeight: 800, color: C.text }}>$9</div>
              <div style={{ fontSize: 14, color: C.dim }}>/month</div>
            </div>
            <div style={{ fontSize: 13, color: C.dim, marginBottom: 28 }}>vs DocuSign $30+/mo</div>
            {["Unlimited documents", "Unlimited eSignatures", "Custom branding + logo", "Multiple signers", "WhatsApp notifications", "Payment reminders", "10 GB storage", "Priority support"].map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13.5, color: C.mid }}>
                <span style={{ color: C.green, fontSize: 12 }}>✓</span> {f}
              </div>
            ))}
            <button className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 24 }} onClick={() => nav("/auth")}>
              Start Pro Free Trial →
            </button>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto 80px", padding: "0 5vw" }}>
        <div className="testimonials-row" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            { quote: "FlowDocs replaced DocuSign for me. My clients love the clean signing experience, and I love paying $9 instead of $40.", name: "Arjun M.", role: "Freelance Designer, Bangalore" },
            { quote: "Finally a tool built for freelancers billing international clients. The GST invoice + eSign combo is exactly what I needed.", name: "Priya S.", role: "Web Developer, Mumbai" },
            { quote: "Sent my first contract through FlowDocs and got it signed in 10 minutes. My previous workflow took 3 days.", name: "Rohan K.", role: "Content Strategist, Delhi" },
          ].map((t, i) => (
            <div key={i} className="testimonial">
              <div style={{ fontSize: 20, marginBottom: 12, color: C.gold }}>"</div>
              <p style={{ fontSize: 14, color: C.mid, lineHeight: 1.8, marginBottom: 16 }}>{t.quote}</p>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{t.name}</div>
              <div style={{ fontSize: 12, color: C.dim }}>{t.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto 80px", padding: "0 5vw" }}>
        <div style={{
          background: C.surface, border: `1px solid ${C.gold}`,
          borderRadius: 20, padding: "60px 40px", textAlign: "center",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: C.gold }} />
          <div style={{ fontSize: 11, color: C.gold, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 16 }}>Get Started</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, color: C.text, letterSpacing: "-0.5px", marginBottom: 16 }}>
            Ready to get paid faster?
          </h2>
          <p style={{ fontSize: 16, color: C.mid, marginBottom: 32, maxWidth: 480, margin: "0 auto 32px" }}>
            Join freelancers who send proposals and collect signatures in minutes, not days.
          </p>
          <button className="btn-primary" style={{ fontSize: 16, padding: "16px 40px" }} onClick={() => nav("/auth")}>
            Start for Free — No Credit Card →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "32px 5vw" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, color: C.gold }}>⚡ FlowDocs</div>
          <div style={{ display: "flex", gap: 24, fontSize: 13, color: C.dim, flexWrap: "wrap" }}>
            <a href="/privacy" style={{ color: C.dim, textDecoration: "none" }} onMouseEnter={e => e.target.style.color = C.gold} onMouseLeave={e => e.target.style.color = C.dim}>Privacy Policy</a>
            <a href="/terms" style={{ color: C.dim, textDecoration: "none" }} onMouseEnter={e => e.target.style.color = C.gold} onMouseLeave={e => e.target.style.color = C.dim}>Terms of Service</a>
            <a href="mailto:support@flowdocs.app" style={{ color: C.dim, textDecoration: "none" }} onMouseEnter={e => e.target.style.color = C.gold} onMouseLeave={e => e.target.style.color = C.dim}>support@flowdocs.app</a>
          </div>
          <div style={{ fontSize: 12, color: C.dim }}>© {new Date().getFullYear()} FlowDocs. Built for freelancers.</div>
        </div>
      </footer>
    </div>
  );
}
