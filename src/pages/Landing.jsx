import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

// ── THEME ──
const C = {
  bg: "#06060A", surface: "#0E0E14", surface2: "#16161E", surface3: "#1E1E28",
  border: "#24243A", borderHover: "#3A3A5C",
  gold: "#F5A623", goldDim: "#F5A62315", goldGlow: "#F5A62340",
  accent: "#6C63FF", accentDim: "#6C63FF18", accentGlow: "#6C63FF40",
  text: "#F0EEF6", dim: "#6B6B80", mid: "#9B9BB0",
  green: "#22C55E", greenDim: "#22C55E18",
  red: "#EF4444", blue: "#60A5FA",
};

export default function Landing() {
  const nav = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [email, setEmail] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goAuth = () => nav("/auth");

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif", color: C.text, overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: ${C.bg}; }
        ::selection { background: ${C.goldGlow}; color: ${C.text}; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes float1 { 0%,100% { transform: translateY(0) rotate(-1deg); } 50% { transform: translateY(-14px) rotate(1deg); } }
        @keyframes float2 { 0%,100% { transform: translateY(0) rotate(1deg); } 50% { transform: translateY(-10px) rotate(-1deg); } }
        @keyframes float3 { 0%,100% { transform: translateY(-4px); } 50% { transform: translateY(8px); } }
        @keyframes pulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes gradGlow {
          0%,100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }

        .anim-up { animation: fadeUp 0.8s ease both; }
        .anim-up-1 { animation: fadeUp 0.8s ease 0.1s both; }
        .anim-up-2 { animation: fadeUp 0.8s ease 0.2s both; }
        .anim-up-3 { animation: fadeUp 0.8s ease 0.3s both; }

        .feature-card {
          background: ${C.surface};
          border: 1px solid ${C.border};
          border-radius: 16px;
          padding: 32px;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          position: relative;
          overflow: hidden;
        }
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, ${C.gold}, transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .feature-card:hover {
          border-color: ${C.borderHover};
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.4);
        }
        .feature-card:hover::before { opacity: 1; }

        .glow-btn {
          background: linear-gradient(135deg, ${C.gold}, #E8941A);
          color: #0A0A0F;
          border: none;
          padding: 16px 36px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          position: relative;
          overflow: hidden;
        }
        .glow-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent, rgba(255,255,255,0.1), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .glow-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px ${C.goldGlow};
        }
        .glow-btn:hover::after { opacity: 1; }

        .ghost-btn {
          background: transparent;
          color: ${C.mid};
          border: 1px solid ${C.border};
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.25s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }
        .ghost-btn:hover { border-color: ${C.gold}; color: ${C.gold}; }

        .pricing-card {
          background: ${C.surface};
          border: 1px solid ${C.border};
          border-radius: 20px;
          padding: 36px;
          flex: 1;
          transition: all 0.3s;
          position: relative;
        }
        .pricing-card.featured {
          border-color: ${C.gold};
          background: linear-gradient(160deg, #1A180F 0%, ${C.surface} 50%);
        }
        .pricing-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.3);
        }

        .counter { font-variant-numeric: tabular-nums; }
        .gradient-text {
          background: linear-gradient(135deg, ${C.gold} 0%, #FFD700 50%, ${C.gold} 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }

        @media (max-width: 768px) {
          .hero-grid { flex-direction: column !important; }
          .hero-visual { display: none !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .pricing-grid { flex-direction: column !important; }
          .stats-row { grid-template-columns: repeat(2, 1fr) !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .testimonials-row { flex-direction: column !important; }
          .nav-links { display: none !important; }
          .footer-grid { flex-direction: column !important; gap: 24px !important; text-align: center !important; }
          .mob-menu { display: flex !important; }
        }
      `}</style>

      {/* ────── NAVBAR ────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: isScrolled ? "rgba(6,6,10,0.92)" : "transparent",
        backdropFilter: isScrolled ? "blur(20px) saturate(180%)" : "none",
        borderBottom: isScrolled ? `1px solid ${C.border}` : "1px solid transparent",
        transition: "all 0.3s",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", height: 64, padding: "0 24px", gap: 40 }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800, color: C.gold, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <span style={{ width: 28, height: 28, background: `linear-gradient(135deg, ${C.gold}, #E8941A)`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#0A0A0F", fontWeight: 900 }}>F</span>
            FlowDocs
          </div>

          <div className="nav-links" style={{ display: "flex", gap: 32, flex: 1 }}>
            {["Features", "Pricing", "How it Works", "Testimonials"].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`}
                style={{ fontSize: 14, color: C.dim, textDecoration: "none", transition: "color 0.2s", fontWeight: 500 }}
                onMouseEnter={e => e.target.style.color = C.text}
                onMouseLeave={e => e.target.style.color = C.dim}>
                {l}
              </a>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, marginLeft: "auto", alignItems: "center" }}>
            <button className="ghost-btn" style={{ padding: "9px 20px", fontSize: 13 }} onClick={goAuth}>Log In</button>
            <button className="glow-btn" style={{ padding: "9px 20px", fontSize: 13 }} onClick={goAuth}>Start Free</button>
          </div>

          <button className="mob-menu" onClick={() => setMobileMenu(!mobileMenu)} style={{
            display: "none", background: "none", border: "none", color: C.gold, cursor: "pointer",
            fontSize: 22, padding: 4, marginLeft: "auto",
          }}>{mobileMenu ? "✕" : "☰"}</button>
        </div>

        {/* Mobile Menu */}
        {mobileMenu && (
          <div style={{
            background: C.surface, borderTop: `1px solid ${C.border}`, padding: "20px 24px",
            display: "flex", flexDirection: "column", gap: 14,
          }}>
            {["Features", "Pricing", "How it Works"].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`}
                onClick={() => setMobileMenu(false)}
                style={{ fontSize: 15, color: C.mid, textDecoration: "none", padding: "8px 0" }}>
                {l}
              </a>
            ))}
            <button className="glow-btn" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} onClick={goAuth}>Start Free →</button>
          </div>
        )}
      </nav>

      {/* ────── HERO ────── */}
      <section ref={heroRef} style={{ maxWidth: 1200, margin: "0 auto", padding: "140px 24px 80px", position: "relative" }}>
        {/* Background glow orbs */}
        <div style={{ position: "absolute", top: -100, left: -200, width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${C.goldGlow} 0%, transparent 70%)`, filter: "blur(80px)", animation: "gradGlow 6s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 100, right: -100, width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${C.accentGlow} 0%, transparent 70%)`, filter: "blur(80px)", animation: "gradGlow 6s ease-in-out 3s infinite", pointerEvents: "none" }} />

        <div className="hero-grid" style={{ display: "flex", gap: 64, alignItems: "center", position: "relative", zIndex: 1 }}>
          {/* Left */}
          <div style={{ flex: 1.2 }}>
            <div className="anim-up" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: C.goldDim, border: `1px solid ${C.gold}30`,
              borderRadius: 100, padding: "6px 16px 6px 8px", fontSize: 12.5,
              color: C.gold, fontFamily: "'JetBrains Mono', monospace", marginBottom: 28,
            }}>
              <span style={{ background: C.green, width: 7, height: 7, borderRadius: "50%", animation: "pulse 2s ease infinite" }} />
              India's #1 Freelancer Toolkit
            </div>

            <h1 className="anim-up-1" style={{
              fontFamily: "'Outfit', sans-serif", fontSize: "clamp(40px, 5.5vw, 64px)",
              fontWeight: 900, lineHeight: 1.05, letterSpacing: "-2px",
              color: C.text, marginBottom: 24,
            }}>
              Proposal bhejo.<br />
              Sign karwao.<br />
              <span className="gradient-text">Payment lo.</span>
            </h1>

            <p className="anim-up-2" style={{
              fontSize: 18, color: C.mid, lineHeight: 1.8, marginBottom: 36, maxWidth: 520,
              fontWeight: 400,
            }}>
              GST invoices, eSignatures, proposals, contracts — sab ek jagah.
              WhatsApp pe share karo. UPI se payment lo.{" "}
              <strong style={{ color: C.text }}>DocuSign se 10x sasta.</strong>
            </p>

            {/* Email CTA */}
            <div className="anim-up-3" style={{ display: "flex", gap: 10, marginBottom: 24, maxWidth: 480, flexWrap: "wrap" }}>
              <input
                style={{
                  flex: 1, minWidth: 220, background: C.surface2, border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: "14px 18px", fontSize: 14.5, color: C.text,
                  fontFamily: "'Inter', sans-serif", outline: "none", transition: "border-color 0.2s",
                }}
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={e => e.target.style.borderColor = C.gold}
                onBlur={e => e.target.style.borderColor = C.border}
                onKeyDown={e => e.key === "Enter" && goAuth()}
              />
              <button className="glow-btn" style={{ padding: "14px 28px" }} onClick={goAuth}>
                Start Free →
              </button>
            </div>

            <div className="anim-up-3" style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {[
                { icon: "✓", label: "Free forever plan" },
                { icon: "✓", label: "No credit card" },
                { icon: "✓", label: "GST ready" },
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.mid }}>
                  <span style={{ color: C.green, fontWeight: 700, fontSize: 12 }}>{f.icon}</span> {f.label}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Dashboard Preview */}
          <div className="hero-visual" style={{ flex: 1, position: "relative", minHeight: 400 }}>
            {/* Main card */}
            <div style={{
              animation: "float1 6s ease-in-out infinite",
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 20, padding: 24, width: 300,
              boxShadow: "0 32px 80px rgba(0,0,0,0.6)", position: "relative",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.gold}, ${C.accent})`, borderRadius: "20px 20px 0 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 11, color: C.gold, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>TOTAL BILLED</div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 32, fontWeight: 800, color: C.text, marginTop: 4 }}>₹8,45,000</div>
                  <div style={{ fontSize: 12, color: C.green, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>↑ 34% this month</div>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: C.greenDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📊</div>
              </div>
              <div style={{ height: 1, background: C.border, margin: "0 0 16px" }} />
              {[
                { name: "TechServe Pvt Ltd", type: "Invoice", status: "paid", color: C.green, amount: "₹2,50,000" },
                { name: "StartupXYZ", type: "Proposal", status: "signed", color: C.green, amount: "₹1,85,000" },
                { name: "DesignHub", type: "Contract", status: "pending", color: C.gold, amount: "₹75,000" },
              ].map((d, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{d.name}</div>
                    <div style={{ fontSize: 11, color: C.dim }}>{d.type} · {d.amount}</div>
                  </div>
                  <div style={{
                    fontSize: 10, color: d.color, background: d.color + "18",
                    borderRadius: 8, padding: "3px 10px",
                    fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
                  }}>{d.status}</div>
                </div>
              ))}
            </div>

            {/* Floating: Signed notification */}
            <div style={{
              animation: "float2 5s ease-in-out infinite",
              position: "absolute", top: -10, right: -30,
              background: C.surface, border: `1px solid ${C.green}40`,
              borderRadius: 14, padding: "14px 18px", width: 190,
              boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: C.greenDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✍️</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.green }}>Document Signed!</div>
                  <div style={{ fontSize: 10, color: C.dim }}>just now</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: C.mid }}>TechServe Pvt Ltd</div>
            </div>

            {/* Floating: GST Invoice badge */}
            <div style={{
              animation: "float3 7s ease-in-out infinite",
              position: "absolute", bottom: 40, right: 10,
              background: C.surface, border: `1px solid ${C.gold}30`,
              borderRadius: 14, padding: "16px 20px", width: 170,
              boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
            }}>
              <div style={{ fontSize: 10, color: C.gold, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, marginBottom: 6 }}>GST INVOICE</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, color: C.text }}>₹1,47,500</div>
              <div style={{ fontSize: 10, color: C.dim, marginTop: 3 }}>CGST + SGST @18%</div>
              <div style={{ fontSize: 10, color: C.green, marginTop: 2 }}>✓ Paid via UPI</div>
            </div>

            {/* Floating: WhatsApp badge */}
            <div style={{
              animation: "float2 8s ease-in-out 1s infinite",
              position: "absolute", bottom: -10, left: -20,
              background: C.surface, border: `1px solid #25D366`,
              borderRadius: 12, padding: "10px 16px",
              boxShadow: "0 12px 36px rgba(0,0,0,0.4)",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 18 }}>📱</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#25D366" }}>WhatsApp Sent!</div>
                <div style={{ fontSize: 10, color: C.dim }}>Signing link shared</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────── STATS ────── */}
      <section style={{ maxWidth: 1200, margin: "0 auto 100px", padding: "0 24px" }}>
        <div className="stats-row" style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1,
          background: C.border, borderRadius: 20, overflow: "hidden",
          border: `1px solid ${C.border}`,
        }}>
          {[
            { value: "₹0", label: "Setup cost", icon: "💰" },
            { value: "2 min", label: "Send first proposal", icon: "⚡" },
            { value: "100%", label: "Legal eSignatures", icon: "✍️" },
            { value: "10x", label: "Cheaper than DocuSign", icon: "📉" },
          ].map((s, i) => (
            <div key={i} style={{
              background: C.surface, padding: "32px 24px", textAlign: "center",
            }}>
              <div style={{ fontSize: 24, marginBottom: 12 }}>{s.icon}</div>
              <div className="counter" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 36, fontWeight: 800, color: C.gold, marginBottom: 6 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: C.dim, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ────── FEATURES ────── */}
      <section id="features" style={{ maxWidth: 1200, margin: "0 auto 100px", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 12, color: C.gold, letterSpacing: 3, textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: 14, fontWeight: 600 }}>Features</div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: C.text, letterSpacing: "-1px", marginBottom: 12 }}>
            Everything Indian freelancers need
          </h2>
          <p style={{ fontSize: 16, color: C.mid, maxWidth: 560, margin: "0 auto" }}>
            No more juggling between invoicing apps, signing tools, and WhatsApp. One platform. Done.
          </p>
        </div>

        <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { icon: "🧾", title: "GST Invoices", desc: "CGST/SGST/IGST auto-calculation. HSN/SAC codes. GSTIN validation. E-invoice ready. Fully compliant.", tag: "India First", tagColor: C.gold },
            { icon: "✍️", title: "Legal eSignatures", desc: "IT Act 2000 compliant. Draw signature on any device. Legally binding. Audit trail included.", tag: "IT Act 2000", tagColor: C.green },
            { icon: "📱", title: "WhatsApp Sharing", desc: "Share signing links instantly on WhatsApp. 90% open rate vs 20% for email. India ka default.", tag: "90% Open Rate", tagColor: "#25D366" },
            { icon: "💳", title: "UPI + Razorpay", desc: "Add UPI ID and bank details on invoices. Clients pay with one tap. Payment tracking built-in.", tag: "Instant Pay", tagColor: C.blue },
            { icon: "📄", title: "Smart Proposals", desc: "AI-powered proposals in 30 seconds. Professional templates. Multi-currency support. Edit anytime.", tag: "AI Powered", tagColor: C.accent },
            { icon: "📊", title: "Revenue Analytics", desc: "Track billings, collections, overdue. Client-wise breakdown. Tax reports. Export to CSV.", tag: "Insights", tagColor: C.gold },
          ].map((f, i) => (
            <div key={i} className="feature-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ fontSize: 32 }}>{f.icon}</div>
                {f.tag && (
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 8,
                    background: f.tagColor + "15", color: f.tagColor,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{f.tag}</span>
                )}
              </div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: C.mid, lineHeight: 1.8 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ────── HOW IT WORKS ────── */}
      <section id="how-it-works" style={{ maxWidth: 1200, margin: "0 auto 100px", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 12, color: C.gold, letterSpacing: 3, textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: 14, fontWeight: 600 }}>Process</div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: C.text, letterSpacing: "-1px", marginBottom: 12 }}>
            Proposal se payment tak, 4 steps
          </h2>
        </div>

        <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { n: "01", title: "Document Banao", desc: "Proposal, Contract, Invoice, or NDA — 2 minute mein ready. AI se auto-generate karo.", icon: "📝" },
            { n: "02", title: "Client Add Karo", desc: "Name, email, phone, GSTIN — sab save hota hai. Baar baar type nahi karna padta.", icon: "👤" },
            { n: "03", title: "WhatsApp pe Bhejo", desc: "Signing link WhatsApp, email — kahin bhi bhejo. Client phone pe sign kare, done.", icon: "📲" },
            { n: "04", title: "Payment Lo", desc: "Invoice pe UPI/bank details dikhta hai. Mark as paid. Revenue automatic track hota hai.", icon: "💸" },
          ].map((s, i) => (
            <div key={i} style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 16, padding: 28, position: "relative", overflow: "hidden",
              transition: "all 0.3s",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.gold}, transparent)` }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.gold,
                  letterSpacing: 2, fontWeight: 600,
                }}>{s.n}</div>
                <div style={{ fontSize: 24 }}>{s.icon}</div>
              </div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 8 }}>{s.title}</div>
              <div style={{ fontSize: 13.5, color: C.mid, lineHeight: 1.8 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ────── PRICING ────── */}
      <section id="pricing" style={{ maxWidth: 1200, margin: "0 auto 100px", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 12, color: C.gold, letterSpacing: 3, textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: 14, fontWeight: 600 }}>Pricing</div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: C.text, letterSpacing: "-1px", marginBottom: 12 }}>
            Seedha pricing. No hidden fees.
          </h2>
          <p style={{ fontSize: 16, color: C.mid }}>DocuSign = ₹2,500+/month. FlowDocs = ₹0 se shuru.</p>
        </div>

        <div className="pricing-grid" style={{ display: "flex", gap: 20, alignItems: "stretch" }}>
          {/* Free */}
          <div className="pricing-card">
            <div style={{ fontSize: 12, color: C.dim, letterSpacing: 2, fontFamily: "'JetBrains Mono', monospace", marginBottom: 16, fontWeight: 600 }}>FREE</div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 48, fontWeight: 900, color: C.text, marginBottom: 4 }}>₹0</div>
            <div style={{ fontSize: 14, color: C.dim, marginBottom: 32 }}>Forever free to start</div>
            {["3 documents/month", "eSignature collection", "PDF download", "Email notifications", "1 currency"].map((f, i) => (
              <div key={i} style={{
                display: "flex", gap: 10, alignItems: "center", padding: "10px 0",
                borderBottom: `1px solid ${C.border}`, fontSize: 14, color: C.mid,
              }}>
                <span style={{ color: C.green, fontSize: 13, fontWeight: 700 }}>✓</span> {f}
              </div>
            ))}
            <button className="ghost-btn" style={{ width: "100%", justifyContent: "center", marginTop: 28 }} onClick={goAuth}>
              Start Free
            </button>
          </div>

          {/* Pro — Featured */}
          <div className="pricing-card featured">
            <div style={{
              position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
              background: `linear-gradient(135deg, ${C.gold}, #E8941A)`, color: "#0A0A0F",
              fontSize: 11, fontWeight: 700, padding: "5px 20px", borderRadius: 20,
              fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap",
            }}>⚡ MOST POPULAR</div>
            <div style={{ fontSize: 12, color: C.gold, letterSpacing: 2, fontFamily: "'JetBrains Mono', monospace", marginBottom: 16, fontWeight: 600 }}>PRO</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 48, fontWeight: 900, color: C.text }}>₹749</div>
              <div style={{ fontSize: 15, color: C.dim }}>/month</div>
            </div>
            <div style={{ fontSize: 14, color: C.dim, marginBottom: 32 }}>
              Save 17% with annual →{" "}
              <span style={{ color: C.gold, fontWeight: 600 }}>₹7,490/yr</span>
            </div>
            {[
              "Unlimited documents", "Unlimited eSignatures",
              "GST invoicing (CGST/SGST/IGST)", "8 currencies (INR, USD, EUR...)",
              "WhatsApp sharing", "Recurring invoices",
              "Revenue analytics", "Payment reminders",
              "AI document generation", "Priority support",
            ].map((f, i) => (
              <div key={i} style={{
                display: "flex", gap: 10, alignItems: "center", padding: "9px 0",
                borderBottom: `1px solid ${C.border}`, fontSize: 14, color: C.mid,
              }}>
                <span style={{ color: C.green, fontSize: 13, fontWeight: 700 }}>✓</span> {f}
              </div>
            ))}
            <button className="glow-btn" style={{ width: "100%", justifyContent: "center", marginTop: 28 }} onClick={goAuth}>
              Start 7-Day Free Trial →
            </button>
          </div>

          {/* Agency */}
          <div className="pricing-card">
            <div style={{ fontSize: 12, color: C.accent, letterSpacing: 2, fontFamily: "'JetBrains Mono', monospace", marginBottom: 16, fontWeight: 600 }}>AGENCY</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 48, fontWeight: 900, color: C.text }}>₹1,999</div>
              <div style={{ fontSize: 15, color: C.dim }}>/month</div>
            </div>
            <div style={{ fontSize: 14, color: C.dim, marginBottom: 32 }}>For teams & agencies</div>
            {[
              "Everything in Pro", "5 team members",
              "White-label branding", "Client portal",
              "API access", "Custom templates",
              "Dedicated account manager",
            ].map((f, i) => (
              <div key={i} style={{
                display: "flex", gap: 10, alignItems: "center", padding: "10px 0",
                borderBottom: `1px solid ${C.border}`, fontSize: 14, color: C.mid,
              }}>
                <span style={{ color: C.green, fontSize: 13, fontWeight: 700 }}>✓</span> {f}
              </div>
            ))}
            <button className="ghost-btn" style={{ width: "100%", justifyContent: "center", marginTop: 28, borderColor: C.accent, color: C.accent }} onClick={goAuth}>
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* ────── TESTIMONIALS ────── */}
      <section id="testimonials" style={{ maxWidth: 1200, margin: "0 auto 100px", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 12, color: C.gold, letterSpacing: 3, textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: 14, fontWeight: 600 }}>Reviews</div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: C.text, letterSpacing: "-1px" }}>
            Freelancers love FlowDocs
          </h2>
        </div>

        <div className="testimonials-row" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            { quote: "Mera poora invoicing ab FlowDocs pe hai. GST invoices 2 minute mein ban jaata hai. Clients ko WhatsApp pe bhejta hoon, 10 min mein sign ho jaata hai.", name: "Arjun M.", role: "Web Developer, Bangalore", stars: 5 },
            { quote: "DocuSign ke liye $30/month deta tha. Ab FlowDocs se proposal, contract, invoice — sab ₹749 mein. Best investment for my freelance business.", name: "Priya S.", role: "UI/UX Designer, Mumbai", stars: 5 },
            { quote: "Finally ek tool jo Indian freelancers ke liye bana hai. GSTIN, SAC code, CGST/SGST — sab support karta hai. Even my CA is impressed!", name: "Rohan K.", role: "Content Agency, Delhi", stars: 5 },
          ].map((t, i) => (
            <div key={i} style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 16, padding: 28, flex: 1, minWidth: 280,
              transition: "all 0.3s",
            }}>
              <div style={{ display: "flex", gap: 2, marginBottom: 14 }}>
                {Array(t.stars).fill(0).map((_, j) => (
                  <span key={j} style={{ color: C.gold, fontSize: 14 }}>★</span>
                ))}
              </div>
              <p style={{ fontSize: 14.5, color: C.mid, lineHeight: 1.9, marginBottom: 20 }}>"{t.quote}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `linear-gradient(135deg, ${C.gold}40, ${C.accent}40)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Outfit'", fontSize: 16, fontWeight: 700, color: C.gold,
                }}>{t.name[0]}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: C.dim }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ────── FINAL CTA ────── */}
      <section style={{ maxWidth: 1200, margin: "0 auto 100px", padding: "0 24px" }}>
        <div style={{
          background: `linear-gradient(160deg, #1A180F 0%, ${C.surface} 40%, #0F0F1A 100%)`,
          border: `1px solid ${C.gold}40`,
          borderRadius: 24, padding: "80px 40px", textAlign: "center",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)` }} />
          {/* Glow */}
          <div style={{ position: "absolute", top: -50, left: "50%", transform: "translateX(-50%)", width: 400, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${C.goldGlow} 0%, transparent 70%)`, filter: "blur(60px)", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 12, color: C.gold, letterSpacing: 3, fontFamily: "'JetBrains Mono', monospace", marginBottom: 20, fontWeight: 600 }}>GET STARTED TODAY</div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(30px, 5vw, 48px)", fontWeight: 900, color: C.text, letterSpacing: "-1px", marginBottom: 16 }}>
              Payment lena ho fast?<br /><span className="gradient-text">FlowDocs use karo.</span>
            </h2>
            <p style={{ fontSize: 17, color: C.mid, marginBottom: 40, maxWidth: 520, margin: "0 auto 40px" }}>
              10,000+ freelancers already trust FlowDocs for proposals, invoices, and eSignatures.
            </p>
            <button className="glow-btn" style={{ fontSize: 17, padding: "18px 48px" }} onClick={goAuth}>
              Start Free — No Credit Card →
            </button>
          </div>
        </div>
      </section>

      {/* ────── FOOTER ────── */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "40px 24px" }}>
        <div className="footer-grid" style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: C.gold, display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ width: 24, height: 24, background: `linear-gradient(135deg, ${C.gold}, #E8941A)`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#0A0A0F", fontWeight: 900 }}>F</span>
              FlowDocs
            </div>
            <div style={{ fontSize: 13, color: C.dim }}>India ka #1 Freelancer Toolkit</div>
          </div>
          <div style={{ display: "flex", gap: 28, fontSize: 13, color: C.dim, flexWrap: "wrap" }}>
            <a href="/privacy" style={{ color: C.dim, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = C.gold} onMouseLeave={e => e.target.style.color = C.dim}>Privacy Policy</a>
            <a href="/terms" style={{ color: C.dim, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = C.gold} onMouseLeave={e => e.target.style.color = C.dim}>Terms of Service</a>
            <a href="mailto:support@flowdocs.co.in" style={{ color: C.dim, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = C.gold} onMouseLeave={e => e.target.style.color = C.dim}>support@flowdocs.app</a>
          </div>
          <div style={{ fontSize: 12, color: C.dim }}>© {new Date().getFullYear()} FlowDocs. Built with ❤️ for Indian Freelancers.</div>
        </div>
      </footer>
    </div>
  );
}
