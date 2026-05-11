import { useState, useEffect, useRef } from "react";

const gold = "#F5A623";
const green = "#22C55E";
const accent = "#6C63FF";

function useInView(ref, threshold = 0.15) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return v;
}

function Reveal({ children, delay = 0, y = 30 }) {
  const ref = useRef();
  const v = useInView(ref);
  return (
    <div ref={ref} style={{
      opacity: v ? 1 : 0,
      transform: v ? "none" : `translateY(${y}px)`,
      transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
    }}>{children}</div>
  );
}

function Typewriter({ words }) {
  const [i, setI] = useState(0);
  const [ci, setCi] = useState(0);
  const [del, setDel] = useState(false);
  const [txt, setTxt] = useState("");
  useEffect(() => {
    const w = words[i];
    const t = setTimeout(() => {
      if (!del && ci <= w.length) { setTxt(w.slice(0, ci)); setCi(c => c + 1); }
      else if (!del && ci > w.length) { setTimeout(() => setDel(true), 1600); }
      else if (del && ci > 0) { setTxt(w.slice(0, ci)); setCi(c => c - 1); }
      else { setDel(false); setI(x => (x + 1) % words.length); }
    }, del ? 35 : 85);
    return () => clearTimeout(t);
  }, [ci, del, i, words]);
  return <span style={{ color: gold }}>{txt}<span style={{ borderRight: `2.5px solid ${gold}`, animation: "blink 1s infinite" }}> </span></span>;
}

function CountUp({ to, suffix = "" }) {
  const ref = useRef();
  const v = useInView(ref);
  const [n, setN] = useState(0);
  const done = useRef(false);
  useEffect(() => {
    if (v && !done.current) {
      done.current = true;
      let cur = 0;
      const step = to / 50;
      const t = setInterval(() => {
        cur += step;
        if (cur >= to) { setN(to); clearInterval(t); } else setN(Math.floor(cur));
      }, 30);
    }
  }, [v, to]);
  return <span ref={ref}>{n}{suffix}</span>;
}

const STEPS = [
  { icon: "📝", title: "Contract banao", body: "AI se 2 min mein — scope, amount, timeline ready.", color: gold },
  { icon: "🔗", title: "Ek link generate karo", body: "Contract + signature + payment — sab ek jagah.", color: accent },
  { icon: "📲", title: "Client ko bhejo", body: "Email ya WhatsApp pe. Koi bhi device pe kholega.", color: "#60A5FA" },
  { icon: "✅", title: "Signed & Paid", body: "Confirmation tujhe aayega. Kaam shuru karo.", color: green },
];

export default function App() {
  const [step, setStep] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % 4), 2800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const notifications = [
    { top: "12%", right: "-2px", icon: "✍️", title: "Contract Signed!", sub: "Acme Corp · just now", border: green },
    { top: "52%", right: "-2px", icon: "💸", title: "$1,750 received", sub: "Deposit paid", border: gold },
    { top: "78%", left: "-2px", icon: "🌍", title: "USD · EUR · GBP", sub: "Multi-currency", border: accent },
  ];

  return (
    <div style={{ background: "#06060A", color: "#F0EEF6", fontFamily: "Inter,system-ui,sans-serif", overflowX: "hidden" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes floatB{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes gradGlow{0%,100%{opacity:.25}50%{opacity:.55}}
        @keyframes pulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.1)}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes notifIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes badgePop{0%{transform:scale(.8);opacity:0}60%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
        .glow{background:linear-gradient(135deg,${gold},#e8941a);color:#0a0a0f;border:none;padding:15px 32px;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;transition:transform .2s,box-shadow .2s;display:inline-flex;align-items:center;gap:8px}
        .glow:hover{transform:translateY(-2px);box-shadow:0 8px 28px ${gold}50}
        .ghost{background:transparent;color:#9B9BB0;border:1px solid #24243A;padding:13px 26px;border-radius:12px;font-size:14px;font-weight:500;cursor:pointer;font-family:inherit;transition:all .2s}
        .ghost:hover{border-color:${gold};color:${gold}}
        .gtext{background:linear-gradient(135deg,${gold} 0%,#FFD700 50%,${gold} 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 3s linear infinite}
        .step-item{background:#0E0E14;border:1px solid #24243A;border-radius:14px;padding:18px 20px;cursor:pointer;transition:all .3s;position:relative;overflow:hidden}
        .step-item.active{border-color:${gold};background:linear-gradient(135deg,#1A180F,#0E0E14);transform:scale(1.01)}
        .step-item:hover{border-color:#3A3A5C}
        .notif{background:#0E0E14;border-radius:12px;padding:11px 14px;position:absolute;width:170px;box-shadow:0 12px 40px rgba(0,0,0,.5);animation:notifIn .5s ease both}
        .stat-card{background:#0E0E14;border:1px solid #24243A;border-radius:16px;padding:24px 20px;text-align:center;transition:all .3s}
        .stat-card:hover{border-color:${gold}40;transform:translateY(-3px)}
        .feat-card{background:#0E0E14;border:1px solid #24243A;border-radius:16px;padding:24px;transition:all .3s;position:relative;overflow:hidden}
        .feat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,${gold},transparent);opacity:0;transition:opacity .3s}
        .feat-card:hover{border-color:#3A3A5C;transform:translateY(-3px)}
        .feat-card:hover::before{opacity:1}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-track{background:#06060A}
        ::-webkit-scrollbar-thumb{background:${gold}40;border-radius:2px}
      `}</style>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: scrolled ? "rgba(6,6,10,.95)" : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none", borderBottom: scrolled ? "1px solid #24243A" : "1px solid transparent", transition: "all .3s" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 17, color: gold }}>
            <div style={{ width: 26, height: 26, background: `linear-gradient(135deg,${gold},#e8941a)`, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", color: "#0a0a0f", fontWeight: 900, fontSize: 13 }}>F</div>
            FlowDocs
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="ghost" style={{ padding: "8px 16px", fontSize: 13 }}>Log In</button>
            <button className="glow" style={{ padding: "8px 18px", fontSize: 13 }}>Start Free</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100svh", display: "flex", alignItems: "center", padding: "80px 20px 60px", position: "relative", overflow: "hidden" }}>
        {/* BG orbs */}
        <div style={{ position: "absolute", top: "15%", left: "5%", width: 340, height: 340, borderRadius: "50%", background: `radial-gradient(circle,${gold}18 0%,transparent 70%)`, filter: "blur(60px)", animation: "gradGlow 7s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "0%", width: 280, height: 280, borderRadius: "50%", background: `radial-gradient(circle,${accent}18 0%,transparent 70%)`, filter: "blur(60px)", animation: "gradGlow 7s ease-in-out 3.5s infinite", pointerEvents: "none" }} />
        {/* Grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(#24243A28 1px,transparent 1px),linear-gradient(90deg,#24243A28 1px,transparent 1px)`, backgroundSize: "50px 50px", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 48, alignItems: "center", position: "relative", zIndex: 1 }}>

          {/* TOP — text */}
          <div style={{ textAlign: "center", maxWidth: 700 }}>
            {/* Badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${gold}18`, border: `1px solid ${gold}35`, borderRadius: 100, padding: "5px 16px 5px 8px", fontSize: 12, color: gold, marginBottom: 28 }}>
              <span style={{ background: green, width: 7, height: 7, borderRadius: "50%", animation: "pulse 2s ease infinite" }} />
              For Indian Freelancers Billing Globally
            </div>

            <h1 style={{ fontSize: "clamp(38px,8vw,76px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-2.5px", marginBottom: 24 }}>
              <span style={{ display: "block" }}>One Link.</span>
              <span style={{ display: "block" }}>Signed Contract.</span>
              <span className="gtext" style={{ display: "block" }}>Paid Deposit.</span>
            </h1>

            <p style={{ fontSize: "clamp(16px,2.5vw,19px)", color: "#9B9BB0", lineHeight: 1.75, marginBottom: 12 }}>
              Send one link to your{" "}
              <Typewriter words={["US client.", "UK agency.", "EU startup.", "international client."]} />
            </p>
            <p style={{ fontSize: "clamp(15px,2vw,17px)", color: "#6B6B80", lineHeight: 1.7, marginBottom: 36 }}>
              They sign the contract. They pay the deposit.<br />
              <strong style={{ color: "#F0EEF6" }}>You start the work. Zero chasing.</strong>
            </p>

            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
              <button className="glow" style={{ fontSize: 15, padding: "15px 36px" }}>Start Free — No Card →</button>
              <button className="ghost">See How It Works</button>
            </div>

            <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
              {["✓ Free forever plan", "✓ IT Act 2000 eSign", "✓ USD · EUR · GBP"].map((t, i) => (
                <span key={i} style={{ fontSize: 13, color: "#6B6B80" }}>
                  <span style={{ color: green }}>{t[0]}</span>{t.slice(1)}
                </span>
              ))}
            </div>
          </div>

          {/* BOTTOM — hero card visual */}
          <div style={{ position: "relative", width: "100%", maxWidth: 360, height: 400 }}>
            {/* Main floating card */}
            <div style={{ animation: "float 5s ease-in-out infinite", background: "#0E0E14", border: "1px solid #24243A", borderRadius: 20, padding: 22, width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,.7)", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${gold},${accent})`, borderRadius: "20px 20px 0 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 10, color: gold, fontFamily: "monospace", letterSpacing: 1.5, marginBottom: 4 }}>TOTAL EARNED</div>
                  <div style={{ fontSize: 30, fontWeight: 900 }}>$12,400</div>
                  <div style={{ fontSize: 12, color: green, marginTop: 3 }}>↑ 34% this month</div>
                </div>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${green}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📊</div>
              </div>
              <div style={{ height: 1, background: "#24243A", margin: "0 0 14px" }} />
              {[
                { name: "Acme Corp (US)", type: "Contract + Deposit", status: "paid", amt: "$3,500", c: green },
                { name: "Studio Berlin", type: "Proposal", status: "signed", amt: "€2,200", c: green },
                { name: "TechBase UK", type: "Invoice", status: "pending", amt: "£1,800", c: gold },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < 2 ? "1px solid #24243A" : "none" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: "#6B6B80" }}>{r.type} · {r.amt}</div>
                  </div>
                  <div style={{ fontSize: 10, color: r.c, background: r.c + "18", borderRadius: 6, padding: "3px 9px", fontFamily: "monospace", fontWeight: 700 }}>{r.status}</div>
                </div>
              ))}
            </div>

            {/* Floating notifications */}
            {notifications.map((n, i) => (
              <div key={i} className="notif" style={{
                top: n.top, right: n.right, left: n.left,
                border: `1px solid ${n.border}40`,
                animationDelay: `${i * 0.2}s`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: n.border + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{n.icon}</div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: n.border }}>{n.title}</div>
                    <div style={{ fontSize: 10, color: "#6B6B80" }}>{n.sub}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: "0 20px 80px" }}>
        <Reveal>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
            {[
              { val: 10, suf: "x", label: "Cheaper than DocuSign", icon: "📉" },
              { val: 2, suf: " min", label: "Send first contract", icon: "⚡" },
              { val: 8, suf: " FX", label: "Currencies supported", icon: "🌍" },
              { val: 100, suf: "%", label: "Legally binding eSign", icon: "✍️" },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 30, fontWeight: 900, color: gold, marginBottom: 4 }}>
                  <CountUp to={s.val} suffix={s.suf} />
                </div>
                <div style={{ fontSize: 12, color: "#6B6B80" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "0 20px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ fontSize: 11, color: gold, letterSpacing: 3, fontFamily: "monospace", fontWeight: 600, marginBottom: 10 }}>HOW IT WORKS</div>
              <h2 style={{ fontSize: "clamp(26px,5vw,42px)", fontWeight: 900, letterSpacing: "-1px" }}>
                Signed. Paid. <span className="gtext">4 steps.</span>
              </h2>
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, maxWidth: 560, margin: "0 auto" }}>
            {STEPS.map((s, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className={`step-item${step === i ? " active" : ""}`} onClick={() => setStep(i)}>
                  {step === i && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${s.color},transparent)` }} />}
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: step === i ? s.color + "25" : "#16161E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, transition: "all .3s", border: step === i ? `1px solid ${s.color}40` : "1px solid transparent" }}>
                      {s.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: step === i ? s.color : "#6B6B80", fontFamily: "monospace", letterSpacing: 1.5, marginBottom: 2 }}>0{i + 1}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: step === i ? "#F0EEF6" : "#9B9BB0" }}>{s.title}</div>
                      {step === i && <div style={{ fontSize: 13, color: "#9B9BB0", marginTop: 4, lineHeight: 1.6, animation: "badgePop .3s ease" }}>{s.body}</div>}
                    </div>
                    {step === i && <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: s.color, animation: "pulse 1.5s ease infinite", flexShrink: 0 }} />}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Progress bar */}
          <Reveal delay={0.3}>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 24 }}>
              {STEPS.map((s, i) => (
                <div key={i} onClick={() => setStep(i)} style={{ height: 4, width: step === i ? 28 : 8, borderRadius: 2, background: step === i ? gold : "#24243A", transition: "all .3s", cursor: "pointer" }} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* BEFORE vs AFTER */}
      <section style={{ padding: "0 20px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ fontSize: 11, color: gold, letterSpacing: 3, fontFamily: "monospace", fontWeight: 600, marginBottom: 10 }}>WHY FLOWDOCS</div>
              <h2 style={{ fontSize: "clamp(26px,5vw,42px)", fontWeight: 900, letterSpacing: "-1px" }}>
                Pehle vs <span className="gtext">Baad mein</span>
              </h2>
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
            <Reveal delay={0.1}>
              <div style={{ background: "#0E0E14", border: "1px solid #EF444430", borderRadius: 20, padding: 24 }}>
                <div style={{ fontSize: 13, color: "#EF4444", fontWeight: 700, marginBottom: 18, display: "flex", alignItems: "center", gap: 6 }}>😩 Pehle</div>
                {["PDF email karo", "Print → sign → scan → email", "SWIFT transfer ka 5 din wait", "Follow up. Follow up. Follow up."].map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 0", borderBottom: i < 3 ? "1px solid #24243A" : "none", fontSize: 13.5, color: "#9B9BB0" }}>
                    <span style={{ color: "#EF4444", fontWeight: 700, marginTop: 1, flexShrink: 0 }}>✗</span>{t}
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div style={{ background: "linear-gradient(160deg,#1A180F,#0E0E14)", border: `1px solid ${gold}40`, borderRadius: 20, padding: 24 }}>
                <div style={{ fontSize: 13, color: gold, fontWeight: 700, marginBottom: 18, display: "flex", alignItems: "center", gap: 6 }}>🚀 FlowDocs ke saath</div>
                {["Contract banao — 2 min", "Ek link generate karo", "Client sign kare + deposit pay kare", "Tum kaam shuru karo ✓"].map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 0", borderBottom: i < 3 ? "1px solid #24243A" : "none", fontSize: 13.5, color: "#9B9BB0" }}>
                    <span style={{ color: green, fontWeight: 700, marginTop: 1, flexShrink: 0 }}>✓</span>{t}
                  </div>
                ))}
                <div style={{ marginTop: 16, background: `${gold}15`, borderRadius: 10, padding: "12px", fontSize: 13, color: gold, textAlign: "center", fontWeight: 700 }}>
                  ⏱ 15 minutes. Not 5 days.
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "0 20px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ fontSize: 11, color: gold, letterSpacing: 3, fontFamily: "monospace", fontWeight: 600, marginBottom: 10 }}>FEATURES</div>
              <h2 style={{ fontSize: "clamp(26px,5vw,42px)", fontWeight: 900, letterSpacing: "-1px" }}>
                International billing <span className="gtext">made simple</span>
              </h2>
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
            {[
              { icon: "🔗", title: "One-Link Flow", desc: "Sign + pay deposit — ek link. No account needed for client.", tag: "Core", tc: gold },
              { icon: "✍️", title: "Legal eSignatures", desc: "IT Act 2000 compliant. IP + timestamp audit trail.", tag: "IT Act 2000", tc: green },
              { icon: "💳", title: "International Payments", desc: "Stripe, Wise, Razorpay. USD/EUR/GBP → INR.", tag: "8 Currencies", tc: "#60A5FA" },
              { icon: "📄", title: "AI Contracts", desc: "Professional contracts in 30 seconds. Edit anytime.", tag: "AI Powered", tc: accent },
              { icon: "🧾", title: "GST Invoices", desc: "CGST/SGST/IGST auto-calc. GSTIN validation.", tag: "India First", tc: gold },
              { icon: "📊", title: "Revenue Analytics", desc: "Track billings, collections, overdue. CSV export.", tag: "Insights", tc: gold },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div className="feat-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div style={{ fontSize: 28 }}>{f.icon}</div>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 7, background: f.tc + "15", color: f.tc, fontFamily: "monospace" }}>{f.tag}</span>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 7 }}>{f.title}</div>
                  <div style={{ fontSize: 13.5, color: "#9B9BB0", lineHeight: 1.75 }}>{f.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: "0 20px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ fontSize: 11, color: gold, letterSpacing: 3, fontFamily: "monospace", fontWeight: 600, marginBottom: 10 }}>PRICING</div>
              <h2 style={{ fontSize: "clamp(26px,5vw,42px)", fontWeight: 900, letterSpacing: "-1px" }}>
                Seedha pricing. <span className="gtext">No hidden fees.</span>
              </h2>
              <p style={{ fontSize: 15, color: "#6B6B80", marginTop: 10 }}>DocuSign = ₹2,500+/month. FlowDocs = ₹0 se shuru.</p>
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16, alignItems: "start" }}>

            {/* Free */}
            <Reveal delay={0.05}>
              <div style={{ background: "#0E0E14", border: "1px solid #24243A", borderRadius: 20, padding: 28 }}>
                <div style={{ fontSize: 11, color: "#6B6B80", letterSpacing: 2, fontFamily: "monospace", fontWeight: 600, marginBottom: 14 }}>FREE</div>
                <div style={{ fontSize: 44, fontWeight: 900, marginBottom: 4 }}>₹0</div>
                <div style={{ fontSize: 13, color: "#6B6B80", marginBottom: 28 }}>Forever free to start</div>
                {["3 one-link flows/month", "eSignature collection", "PDF download", "Email notifications", "1 currency"].map((f, i, a) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "9px 0", borderBottom: i < a.length - 1 ? "1px solid #24243A" : "none", fontSize: 13.5, color: "#9B9BB0" }}>
                    <span style={{ color: green, fontWeight: 700, fontSize: 12, flexShrink: 0 }}>✓</span>{f}
                  </div>
                ))}
                <button className="ghost" style={{ width: "100%", marginTop: 24, padding: "13px" }}>Start Free</button>
              </div>
            </Reveal>

            {/* Pro */}
            <Reveal delay={0.1}>
              <div style={{ background: "linear-gradient(160deg,#1A180F,#0E0E14)", border: `2px solid ${gold}`, borderRadius: 20, padding: 28, position: "relative" }}>
                <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: `linear-gradient(135deg,${gold},#e8941a)`, color: "#0a0a0f", fontSize: 10, fontWeight: 700, padding: "4px 18px", borderRadius: 20, fontFamily: "monospace", whiteSpace: "nowrap" }}>⚡ MOST POPULAR</div>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${gold},transparent)`, borderRadius: "20px 20px 0 0" }} />
                <div style={{ fontSize: 11, color: gold, letterSpacing: 2, fontFamily: "monospace", fontWeight: 600, marginBottom: 14 }}>PRO</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                  <div style={{ fontSize: 44, fontWeight: 900 }}>₹749</div>
                  <div style={{ fontSize: 14, color: "#6B6B80" }}>/month</div>
                </div>
                <div style={{ fontSize: 13, color: "#6B6B80", marginBottom: 28 }}>Annual pe save 17% → <span style={{ color: gold, fontWeight: 600 }}>₹7,490/yr</span></div>
                {["Unlimited one-link flows", "Unlimited eSignatures", "8 currencies (INR, USD, EUR, GBP...)", "Stripe + Wise + Razorpay", "GST invoicing (CGST/SGST/IGST)", "Deposit + milestone payments", "AI contract generation", "Revenue analytics", "Payment reminders", "Priority support"].map((f, i, a) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderBottom: i < a.length - 1 ? "1px solid #24243A" : "none", fontSize: 13, color: "#9B9BB0" }}>
                    <span style={{ color: green, fontWeight: 700, fontSize: 12, flexShrink: 0 }}>✓</span>{f}
                  </div>
                ))}
                <button className="glow" style={{ width: "100%", justifyContent: "center", marginTop: 24, padding: "14px" }}>Start 7-Day Free Trial →</button>
              </div>
            </Reveal>

            {/* Agency */}
            <Reveal delay={0.15}>
              <div style={{ background: "#0E0E14", border: "1px solid #24243A", borderRadius: 20, padding: 28 }}>
                <div style={{ fontSize: 11, color: accent, letterSpacing: 2, fontFamily: "monospace", fontWeight: 600, marginBottom: 14 }}>AGENCY</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                  <div style={{ fontSize: 44, fontWeight: 900 }}>₹1,999</div>
                  <div style={{ fontSize: 14, color: "#6B6B80" }}>/month</div>
                </div>
                <div style={{ fontSize: 13, color: "#6B6B80", marginBottom: 28 }}>For teams & agencies</div>
                {["Everything in Pro", "5 team members", "White-label branding", "Client portal", "API access", "Custom templates", "Dedicated account manager"].map((f, i, a) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "9px 0", borderBottom: i < a.length - 1 ? "1px solid #24243A" : "none", fontSize: 13.5, color: "#9B9BB0" }}>
                    <span style={{ color: green, fontWeight: 700, fontSize: 12, flexShrink: 0 }}>✓</span>{f}
                  </div>
                ))}
                <button className="ghost" style={{ width: "100%", marginTop: 24, padding: "13px", borderColor: accent, color: accent }}>Contact Sales</button>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "0 20px 80px" }}>
        <Reveal>
          <div style={{ maxWidth: 1100, margin: "0 auto", background: "linear-gradient(160deg,#1A180F 0%,#0E0E14 40%,#0F0F1A 100%)", border: `1px solid ${gold}40`, borderRadius: 24, padding: "64px 28px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${gold},transparent)` }} />
            <div style={{ position: "absolute", top: -40, left: "50%", transform: "translateX(-50%)", width: 300, height: 200, borderRadius: "50%", background: `radial-gradient(circle,${gold}18 0%,transparent 70%)`, filter: "blur(50px)", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 44, marginBottom: 16, animation: "floatB 4s ease-in-out infinite" }}>🚀</div>
              <h2 style={{ fontSize: "clamp(26px,6vw,50px)", fontWeight: 900, letterSpacing: "-1.5px", marginBottom: 16, lineHeight: 1.1 }}>
                Ek link bhejo.<br />
                <span className="gtext">Signed. Paid. Done.</span>
              </h2>
              <p style={{ fontSize: 16, color: "#9B9BB0", marginBottom: 36, maxWidth: 420, margin: "0 auto 36px" }}>
                Indian freelancers use FlowDocs to close international clients — without the back-and-forth.
              </p>
              <button className="glow" style={{ fontSize: 16, padding: "16px 44px" }}>Start Free — No Credit Card →</button>
              <div style={{ marginTop: 16, fontSize: 12, color: "#6B6B80" }}>flowdocs.co.in</div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #24243A", padding: "28px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: gold, marginBottom: 6 }}>FlowDocs</div>
        <div style={{ fontSize: 12, color: "#6B6B80", marginBottom: 16 }}>One Link. Signed Contract. Paid Deposit.</div>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", fontSize: 12, color: "#6B6B80", flexWrap: "wrap" }}>
          {["Privacy Policy", "Terms of Service", "support@flowdocs.co.in"].map((t, i) => (
            <span key={i} style={{ cursor: "pointer" }}>{t}</span>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "#6B6B80", marginTop: 16 }}>© {new Date().getFullYear()} FlowDocs. Built with ❤️ for Indian Freelancers.</div>
      </footer>
    </div>
  );
}