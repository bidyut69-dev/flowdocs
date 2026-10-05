import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

// ── Palette ──────────────────────────────────────────────────────────────
// Paper/document vernacular: warm stone paper, ink text, FlowDocs' existing
// gold kept as the one accent (brand continuity across Dashboard/SignPage).
const paper = "#F6F3EC";
const paperAlt = "#EFEADF";
const ink = "#1C1A16";
const inkMid = "#6B6558";
const inkFaint = "#9A9385";
const line = "#DDD6C7";
const gold = "#C8820F"; // darkened slightly for AA contrast on light paper
const goldSoft = "#F5A623";
const stamp = "#1F6B46"; // ink-stamp green, replaces bright SaaS green

function useInView(ref, threshold = 0.15) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, [ref, threshold]);
  return v;
}

function Reveal({ children, delay = 0, y = 16 }) {
  const ref = useRef();
  const v = useInView(ref);
  return (
    <div ref={ref} style={{
      opacity: v ? 1 : 0,
      transform: v ? "none" : `translateY(${y}px)`,
      transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
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
  return <span style={{ color: gold, borderBottom: `2px solid ${goldSoft}60` }}>{txt}<span style={{ borderRight: `2px solid ${gold}`, animation: "blink 1s infinite" }}> </span></span>;
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
      const step = to / 40;
      const t = setInterval(() => {
        cur += step;
        if (cur >= to) { setN(to); clearInterval(t); } else setN(Math.floor(cur));
      }, 30);
    }
  }, [v, to]);
  return <span ref={ref}>{n}{suffix}</span>;
}

const STEPS = [
  { mark: "§1", title: "Create your contract", body: "AI drafts it in 2 minutes — scope, amount, timeline already filled in." },
  { mark: "§2", title: "Generate one link", body: "Contract, signature, and payment live on a single page." },
  { mark: "§3", title: "Send it to your client", body: "Email or WhatsApp. Opens on any device, nothing to install." },
  { mark: "§4", title: "Signed & paid", body: "You're notified the moment it happens. Money secured, work begins." },
];

export default function Landing() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [foundingCount, setFoundingCount] = useState(3);

  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % 4), 3200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    supabase
      .from("site_config")
      .select("value")
      .eq("key", "founding_members_count")
      .single()
      .then(({ data }) => {
        if (data) setFoundingCount(parseInt(data.value) || 3);
      });
  }, []);

  const ledger = [
    { name: "Acme Corp (US)", type: "Contract + Deposit", status: "Paid", amt: "$3,500", c: stamp },
    { name: "Studio Berlin", type: "Proposal", status: "Signed", amt: "€2,200", c: stamp },
    { name: "TechBase UK", type: "Invoice", status: "Pending", amt: "£1,800", c: gold },
  ];

  return (
    <div style={{ background: paper, color: ink, fontFamily: "'Source Sans 3', 'Inter', system-ui, sans-serif", overflowX: "hidden" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes drawSig{from{stroke-dashoffset:240}to{stroke-dashoffset:0}}
        .btn-primary{background:${ink};color:${paper};border:none;padding:14px 30px;border-radius:3px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;transition:background .2s;display:inline-flex;align-items:center;gap:8px}
        .btn-primary:hover{background:#000}
        .btn-ghost{background:transparent;color:${ink};border:1px solid ${line};padding:13px 26px;border-radius:3px;font-size:14px;font-weight:500;cursor:pointer;font-family:inherit;transition:border-color .2s}
        .btn-ghost:hover{border-color:${ink}}
        .step-row{border-top:1px solid ${line};padding:22px 0;cursor:pointer;transition:background .2s}
        .step-row:hover{background:${paperAlt}}
        .step-row:last-child{border-bottom:1px solid ${line}}
        .doc-card{background:${paper};border:1px solid ${line};border-radius:4px;padding:26px;transition:border-color .2s}
        .doc-card:hover{border-color:${inkFaint}}
        ::selection{background:${goldSoft}40}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-track{background:${paper}}
        ::-webkit-scrollbar-thumb{background:${line}}
      `}</style>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: scrolled ? `${paper}F2` : "transparent", backdropFilter: scrolled ? "blur(10px)" : "none", borderBottom: scrolled ? `1px solid ${line}` : "1px solid transparent", transition: "all .25s" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 700, fontSize: 17, fontFamily: "'Fraunces', Georgia, serif" }}>
            <div style={{ width: 26, height: 26, background: ink, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", color: paper, fontWeight: 700, fontSize: 13, fontFamily: "'Fraunces', Georgia, serif" }}>F</div>
            FlowDocs
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-ghost" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => nav("/auth")}>Log in</button>
            <button className="btn-primary" style={{ padding: "8px 18px", fontSize: 13 }} onClick={() => nav("/auth")}>Start free</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: "150px 24px 80px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 64, alignItems: "center" }} className="hero-grid">
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: `1px solid ${line}`, borderRadius: 100, padding: "6px 14px 6px 10px", fontSize: 12.5, color: inkMid, marginBottom: 28 }}>
              <span style={{ background: stamp, width: 6, height: 6, borderRadius: "50%" }} />
              For Indian freelancers billing globally
            </div>

            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(34px,4.8vw,56px)", fontWeight: 600, lineHeight: 1.08, letterSpacing: "-0.5px", marginBottom: 22, color: ink }}>
              Get paid before<br />the work begins.
            </h1>

            <p style={{ fontSize: "clamp(16px,1.6vw,18px)", color: inkMid, lineHeight: 1.65, marginBottom: 8, maxWidth: 440 }}>
              Send one link to your <Typewriter words={["US client.", "UK agency.", "EU startup.", "international client."]} />
            </p>
            <p style={{ fontSize: 15.5, color: inkMid, lineHeight: 1.7, marginBottom: 32, maxWidth: 440 }}>
              They sign the contract. They pay the deposit. <strong style={{ color: ink, fontWeight: 600 }}>You start the work — zero chasing.</strong>
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
              <button className="btn-primary" style={{ fontSize: 15, padding: "15px 32px" }} onClick={() => nav("/auth")}>Start free, no card</button>
              <button className="btn-ghost" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>See how it works</button>
            </div>

            <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
              {["Free forever plan", "IT Act 2000 eSign", "USD · EUR · GBP"].map((t, i) => (
                <span key={i} style={{ fontSize: 13, color: inkMid, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: stamp, fontWeight: 700 }}>✓</span>{t}
                </span>
              ))}
            </div>
          </div>

          {/* Document ledger card */}
          <div style={{ background: paper, border: `1px solid ${line}`, borderRadius: 6, padding: 24, boxShadow: "0 1px 2px rgba(28,26,22,.04)", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, paddingBottom: 18, borderBottom: `1px solid ${line}` }}>
              <div>
                <div style={{ fontSize: 11.5, color: inkFaint, marginBottom: 5, letterSpacing: ".2px" }}>Total earned</div>
                <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Fraunces', Georgia, serif" }}>$12,400</div>
                <div style={{ fontSize: 12.5, color: stamp, marginTop: 4 }}>↑ 34% this month</div>
              </div>
              <svg width="44" height="44" viewBox="0 0 100 100" style={{ opacity: .8 }}>
                <circle cx="50" cy="50" r="46" fill="none" stroke={line} strokeWidth="2" />
                <path d="M50 50 L50 10 A40 40 0 0 1 86 68 Z" fill={goldSoft} opacity="0.85" />
              </svg>
            </div>
            {ledger.map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: i < ledger.length - 1 ? `1px solid ${line}` : "none" }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{r.name}</div>
                  <div style={{ fontSize: 11.5, color: inkFaint }}>{r.type} · {r.amt}</div>
                </div>
                <div style={{ fontSize: 11.5, color: r.c, fontWeight: 600 }}>{r.status}</div>
              </div>
            ))}
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px dashed ${line}`, fontSize: 11.5, color: inkFaint, textAlign: "center" }}>
              Digitally captured via FlowDocs eSign
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: "0 24px 72px" }}>
        <Reveal>
          <div style={{ maxWidth: 1080, margin: "0 auto", borderTop: `1px solid ${line}`, borderBottom: `1px solid ${line}`, display: "grid", gridTemplateColumns: "repeat(4,1fr)", }}>
            {[
              { val: 10, suf: "x", label: "Cheaper than DocuSign" },
              { val: 2, suf: " min", label: "To send your first contract" },
              { val: 8, suf: "", label: "Currencies supported" },
              { val: 100, suf: "%", label: "Legally binding eSign" },
            ].map((s, i) => (
              <div key={i} style={{ padding: "26px 18px", borderLeft: i > 0 ? `1px solid ${line}` : "none", textAlign: "center" }}>
                <div style={{ fontSize: 30, fontWeight: 700, fontFamily: "'Fraunces', Georgia, serif", marginBottom: 6 }}>
                  <CountUp to={s.val} suffix={s.suf} />
                </div>
                <div style={{ fontSize: 12.5, color: inkMid, lineHeight: 1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: "0 24px 90px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Reveal>
            <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(26px,4vw,38px)", fontWeight: 600, letterSpacing: "-0.5px", marginBottom: 12 }}>
              Four clauses. One agreement.
            </h2>
            <p style={{ fontSize: 15.5, color: inkMid, marginBottom: 36 }}>From draft to deposit, without leaving the page.</p>
          </Reveal>

          <div>
            {STEPS.map((s, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div className="step-row" onClick={() => setStep(i)}>
                  <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                    <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, color: step === i ? gold : inkFaint, fontWeight: 600, width: 32, flexShrink: 0, transition: "color .2s" }}>
                      {s.mark}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: ink }}>{s.title}</div>
                      {step === i && (
                        <div style={{ fontSize: 14, color: inkMid, marginTop: 6, lineHeight: 1.6, maxWidth: 440 }}>{s.body}</div>
                      )}
                    </div>
                    {step === i && <div style={{ width: 7, height: 7, borderRadius: "50%", background: gold, flexShrink: 0, marginTop: 7 }} />}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: "0 24px 90px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(26px,4vw,38px)", fontWeight: 600, letterSpacing: "-0.5px", marginBottom: 12 }}>
                Simple terms, no fine print.
              </h2>
              <p style={{ fontSize: 15.5, color: inkMid }}>Start free. Upgrade when the volume justifies it.</p>
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }} className="pricing-grid">
            {/* Free */}
            <Reveal>
              <div className="doc-card">
                <div style={{ fontSize: 13, color: inkMid, fontWeight: 600, marginBottom: 14 }}>Free</div>
                <div style={{ fontSize: 38, fontWeight: 700, fontFamily: "'Fraunces', Georgia, serif", marginBottom: 2 }}>₹0</div>
                <div style={{ fontSize: 13, color: inkFaint, marginBottom: 24 }}>Forever</div>
                {["3 documents / month", "Legal eSign", "Basic templates", "Email support"].map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 9, alignItems: "center", padding: "8px 0", borderTop: `1px solid ${line}`, fontSize: 13.5, color: inkMid }}>
                    <span style={{ color: stamp, fontWeight: 700 }}>✓</span>{f}
                  </div>
                ))}
                <button className="btn-ghost" style={{ width: "100%", marginTop: 22, padding: "12px" }} onClick={() => nav("/auth")}>Start free</button>
              </div>
            </Reveal>

            {/* Pro */}
            <Reveal delay={0.08}>
              <div className="doc-card" style={{ borderColor: ink, borderWidth: 2, position: "relative" }}>
                <div style={{ position: "absolute", top: -11, left: 24, background: ink, color: paper, fontSize: 11, fontWeight: 600, padding: "3px 12px", borderRadius: 100 }}>Most freelancers</div>
                <div style={{ fontSize: 13, color: inkMid, fontWeight: 600, marginBottom: 14 }}>Pro</div>
                <div style={{ fontSize: 38, fontWeight: 700, fontFamily: "'Fraunces', Georgia, serif", marginBottom: 2 }}>₹299<span style={{ fontSize: 14, color: inkFaint, fontWeight: 400 }}>/mo</span></div>
                <div style={{ fontSize: 13, color: inkFaint, marginBottom: 24 }}>For active freelancers</div>
                {["Unlimited documents", "Legal eSign", "GST invoices", "Razorpay payments", "Auto reminders", "9 templates"].map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 9, alignItems: "center", padding: "8px 0", borderTop: `1px solid ${line}`, fontSize: 13.5, color: inkMid }}>
                    <span style={{ color: stamp, fontWeight: 700 }}>✓</span>{f}
                  </div>
                ))}
                <button className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 22, padding: "13px" }} onClick={() => nav("/auth")}>Start 7-day free trial</button>
              </div>
            </Reveal>

            {/* Agency */}
            <Reveal delay={0.16}>
              <div className="doc-card">
                <div style={{ fontSize: 13, color: inkMid, fontWeight: 600, marginBottom: 14 }}>Agency</div>
                <div style={{ fontSize: 38, fontWeight: 700, fontFamily: "'Fraunces', Georgia, serif", marginBottom: 2 }}>₹1,999<span style={{ fontSize: 14, color: inkFaint, fontWeight: 400 }}>/mo</span></div>
                <div style={{ fontSize: 13, color: inkFaint, marginBottom: 24 }}>For teams & agencies</div>
                {["Everything in Pro", "5 team members", "White-label branding", "Client portal", "API access", "Dedicated support"].map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 9, alignItems: "center", padding: "8px 0", borderTop: `1px solid ${line}`, fontSize: 13.5, color: inkMid }}>
                    <span style={{ color: stamp, fontWeight: 700 }}>✓</span>{f}
                  </div>
                ))}
                <button className="btn-ghost" style={{ width: "100%", marginTop: 22, padding: "12px" }}>Contact sales</button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FOUNDING MEMBERS */}
      <section style={{ padding: "0 24px 90px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <Reveal>
            <div style={{ maxWidth: 520, margin: "0 auto", border: `1px solid ${line}`, borderRadius: 6, padding: "40px 36px", textAlign: "center", background: paperAlt }}>
              <div style={{ fontSize: 12.5, color: gold, fontWeight: 600, marginBottom: 18 }}>
                Only 20 founding spots — {20 - foundingCount} left
              </div>

              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(24px,4vw,34px)", fontWeight: 600, marginBottom: 20, letterSpacing: "-0.5px" }}>
                Lock in ₹99/month,<br />forever.
              </h2>

              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 14, marginBottom: 6 }}>
                <div style={{ fontSize: 18, color: inkFaint, textDecoration: "line-through" }}>₹299/mo</div>
                <div style={{ fontSize: 44, fontWeight: 700, fontFamily: "'Fraunces', Georgia, serif", color: gold }}>₹99<span style={{ fontSize: 14, color: inkFaint, fontWeight: 400 }}>/mo</span></div>
              </div>
              <p style={{ fontSize: 13, color: inkMid, marginBottom: 28 }}>Your rate never increases, even when we raise prices.</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "9px 20px", textAlign: "left", marginBottom: 26 }}>
                {["Unlimited documents", "Legal eSign", "GST invoices", "Razorpay payments", "Auto reminders", "9 templates"].map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 7, alignItems: "center", fontSize: 13, color: inkMid }}>
                    <span style={{ color: stamp, fontWeight: 700 }}>✓</span>{f}
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ width: "100%", height: 4, background: line, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min((foundingCount / 20) * 100, 100)}%`, background: gold, borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 12.5, color: inkMid, marginTop: 8 }}>
                  <strong style={{ color: ink }}>{foundingCount} of 20</strong> spots claimed
                </div>
              </div>

              <button className="btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: 15, padding: "14px" }} onClick={() => nav("/auth")}>
                Claim my founding spot
              </button>
              <p style={{ fontSize: 12, color: inkFaint, marginTop: 12 }}>No credit card needed · Cancel anytime</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "0 24px 90px" }}>
        <Reveal>
          <div style={{ maxWidth: 1080, margin: "0 auto", background: ink, borderRadius: 8, padding: "68px 28px", textAlign: "center" }}>
            <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(26px,5vw,44px)", fontWeight: 600, marginBottom: 16, lineHeight: 1.15, color: paper }}>
              Send one link.<br />Signed. Paid. Done.
            </h2>
            <p style={{ fontSize: 15.5, color: "#C8C2B4", marginBottom: 32, maxWidth: 420, margin: "0 auto 32px" }}>
              Indian freelancers use FlowDocs to close international clients — without the back-and-forth.
            </p>
            <button style={{ background: goldSoft, color: ink, border: "none", padding: "15px 38px", borderRadius: 3, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }} onClick={() => nav("/auth")}>
              Start free, no credit card
            </button>
            <div style={{ marginTop: 18, fontSize: 12.5, color: "#8A8476" }}>flowdocs.co.in</div>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${line}`, padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Fraunces', Georgia, serif", marginBottom: 6 }}>FlowDocs</div>
        <div style={{ fontSize: 12.5, color: inkMid, marginBottom: 18 }}>One link. Signed contract. Paid deposit.</div>
        <div style={{ display: "flex", gap: 22, justifyContent: "center", fontSize: 12.5, color: inkMid, flexWrap: "wrap" }}>
          <span style={{ cursor: "pointer" }} onClick={() => nav("/privacy")}>Privacy policy</span>
          <span style={{ cursor: "pointer" }} onClick={() => nav("/terms")}>Terms of service</span>
          <a href="mailto:support@flowdocs.co.in" style={{ color: inkMid, textDecoration: "none" }}>support@flowdocs.co.in</a>
        </div>
        <div style={{ fontSize: 11.5, color: inkFaint, marginTop: 18 }}>© {new Date().getFullYear()} FlowDocs. Built for Indian freelancers.</div>
      </footer>

      <style>{`
        @media (max-width: 860px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}