import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

// ── Palette ──────────────────────────────────────────────────────────────
// Soft warm stone background with crisp white cards (tasteskill-inspired),
// FlowDocs brand gold kept as the single accent across all pages.
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
const goldGlow = "#F5A62310";
const stamp = "#1F6B46";

const fontDisplay = "'Playfair Display', 'Fraunces', Georgia, serif";
const fontSans = "'Manrope', 'Inter', system-ui, -apple-system, sans-serif";
const fontMono = "'IBM Plex Mono', 'DM Mono', ui-monospace, monospace";

function useInView(ref, threshold = 0.15) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, [ref, threshold]);
  return v;
}

function Reveal({ children, delay = 0, y = 20 }) {
  const ref = useRef();
  const v = useInView(ref);
  return (
    <div ref={ref} style={{
      opacity: v ? 1 : 0,
      transform: v ? "none" : `translateY(${y}px)`,
      transition: `opacity .7s cubic-bezier(.22,1,.36,1) ${delay}s, transform .7s cubic-bezier(.22,1,.36,1) ${delay}s`,
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
  return (
    <span style={{ color: gold, fontStyle: "italic", fontFamily: fontDisplay, fontWeight: 500 }}>
      {txt}
      <span style={{ display: "inline-block", width: 2, height: "0.9em", background: gold, marginLeft: 2, verticalAlign: "middle", animation: "blink 1s infinite" }} />
    </span>
  );
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
  { title: "Draft with AI", body: "Scope, amount, timeline — filled in automatically from one short brief." },
  { title: "Generate one link", body: "Contract, signature, and payment live on a single page. No PDFs. No downloads." },
  { title: "Send it anywhere", body: "Email, WhatsApp, Slack. Opens on any device. Nothing to install." },
  { title: "Signed and paid", body: "You're notified the second it happens. Money secured. Work begins." },
];

export default function Landing() {
  const nav = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [foundingCount, setFoundingCount] = useState(3);
  const [copied, setCopied] = useState(false);

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

  const copyLink = () => {
    navigator.clipboard?.writeText("flowdocs.co.in/sign/acme-corp");
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div style={{ background: bg, color: ink, fontFamily: fontSans, overflowX: "hidden", minHeight: "100vh" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes ping{75%,100%{transform:scale(2);opacity:0}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes drawSig{from{stroke-dashoffset:260}to{stroke-dashoffset:0}}
        .mono{font-family:${fontMono};font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.16em;color:${inkMid}}
        .mono-sm{font-family:${fontMono};font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.14em;color:${inkFaint}}
        .btn-dark{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:10px;background:${ink};color:#fff;border:none;padding:14px 26px;border-radius:14px;font-size:14.5px;font-weight:600;cursor:pointer;font-family:${fontSans};box-shadow:0 14px 30px -12px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.14);transition:all .3s cubic-bezier(.22,1,.36,1);outline:1px solid rgba(0,0,0,.3);outline-offset:-1px}
        .btn-dark:hover{transform:translateY(-1px);box-shadow:0 20px 40px -12px rgba(0,0,0,.65),inset 0 1px 0 rgba(255,255,255,.2)}
        .btn-dark:active{transform:scale(.985)}
        .btn-light{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#fff;color:${ink};border:1px solid ${line};padding:13px 24px;border-radius:14px;font-size:14px;font-weight:500;cursor:pointer;font-family:${fontSans};box-shadow:0 3px 10px -2px rgba(0,0,0,.04);transition:all .3s cubic-bezier(.22,1,.36,1)}
        .btn-light:hover{border-color:${inkFaint};transform:translateY(-1px);box-shadow:0 10px 22px -6px rgba(0,0,0,.1)}
        .btn-gold{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:${goldSoft};color:${ink};border:none;padding:14px 28px;border-radius:14px;font-size:15px;font-weight:700;cursor:pointer;font-family:${fontSans};box-shadow:0 14px 30px -10px rgba(245,166,35,.5),inset 0 1px 0 rgba(255,255,255,.4);transition:all .3s cubic-bezier(.22,1,.36,1)}
        .btn-gold:hover{transform:translateY(-1px);box-shadow:0 20px 42px -10px rgba(245,166,35,.6),inset 0 1px 0 rgba(255,255,255,.5)}
        .card{background:${card};border:1px solid ${line};border-radius:20px;transition:all .5s cubic-bezier(.22,1,.36,1)}
        .card:hover{transform:translateY(-4px);border-color:#D4D1CA;box-shadow:0 24px 48px -28px rgba(15,15,15,.22),0 2px 6px -2px rgba(15,15,15,.06)}
        .link-ul{color:${ink};font-weight:600;text-decoration:underline;text-decoration-color:${goldSoft}80;text-underline-offset:6px;text-decoration-thickness:2px;transition:all .3s}
        .link-ul:hover{color:${gold};text-decoration-color:${goldSoft}}
        .nav-link{position:relative;color:${inkMid};font-size:13.5px;font-weight:500;text-decoration:none;transition:color .2s;padding:8px 2px}
        .nav-link:hover{color:${ink}}
        .nav-link::after{content:"";position:absolute;left:50%;bottom:4px;transform:translateX(-50%);width:0;height:1.5px;background:${ink};border-radius:2px;transition:width .5s cubic-bezier(.16,1,.3,1)}
        .nav-link:hover::after{width:100%}
        .doc-card{position:absolute;background:${card};border:1px solid ${line};border-radius:16px;padding:18px;box-shadow:0 22px 50px -24px rgba(15,15,15,.25),0 2px 8px -2px rgba(15,15,15,.06);transition:all .55s cubic-bezier(.22,1,.36,1);will-change:transform}
        .doc-card:hover{z-index:50;box-shadow:0 46px 70px -20px rgba(15,15,15,.4)}
        ::selection{background:${goldSoft}40;color:${ink}}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:${bg}}
        ::-webkit-scrollbar-thumb{background:${line};border-radius:4px}
        ::-webkit-scrollbar-thumb:hover{background:${inkFaint}}
        a{color:inherit;text-decoration:none}
      `}</style>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: scrolled ? `${bg}EE` : "transparent", backdropFilter: scrolled ? "saturate(180%) blur(14px)" : "none", borderBottom: `1px solid ${scrolled ? line : "transparent"}`, transition: "all .3s" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 18 }}>
            <div style={{ width: 30, height: 30, background: ink, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: fontDisplay, boxShadow: "0 6px 14px -6px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.12)" }}>F</div>
            <span style={{ fontFamily: fontDisplay, fontWeight: 600, letterSpacing: "-.3px" }}>FlowDocs</span>
          </div>
          <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <a className="nav-link" href="#how-it-works">How it works</a>
            <a className="nav-link" href="#pricing">Pricing</a>
            <a className="nav-link" href="#founding">Founding</a>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="btn-light" style={{ padding: "9px 16px", fontSize: 13, borderRadius: 12 }} onClick={() => nav("/auth")}>Log in</button>
            <button className="btn-dark" style={{ padding: "9px 18px", fontSize: 13, borderRadius: 12 }} onClick={() => nav("/auth")}>Start free →</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", padding: "140px 28px 80px" }}>
        {/* soft gold glow */}
        <div style={{ position: "absolute", top: 120, left: "50%", transform: "translateX(-50%)", width: 760, height: 480, borderRadius: "50%", background: `${goldSoft}10`, filter: "blur(80px)", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 60, alignItems: "center" }} className="hero-grid">
          <div>
            {/* eyebrow */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "7px 14px 7px 12px", background: card, border: `1px solid ${line}`, borderRadius: 100, marginBottom: 32, boxShadow: "0 2px 10px -2px rgba(0,0,0,.04)" }}>
              <span style={{ position: "relative", width: 7, height: 7 }}>
                <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `${goldSoft}70`, animation: "ping 1.5s cubic-bezier(0,0,.2,1) infinite" }} />
                <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: goldSoft }} />
              </span>
              <span className="mono" style={{ color: inkDeep, fontSize: 10.5 }}>For Indian Freelancers · Billing Globally</span>
            </div>

            <h1 style={{ fontFamily: fontDisplay, fontSize: "clamp(44px,5.6vw,76px)", fontWeight: 500, lineHeight: 1.02, letterSpacing: "-1.5px", marginBottom: 24, color: ink }}>
              Get paid<br />
              <span style={{ fontStyle: "italic", fontWeight: 500 }}>before</span> the<br />
              work begins.
            </h1>

            <p style={{ fontSize: 18.5, color: inkMid, lineHeight: 1.55, marginBottom: 10, maxWidth: 480, fontWeight: 400 }}>
              Send one link to your <Typewriter words={["US client.", "UK agency.", "EU startup.", "Dubai founder."]} />
            </p>
            <p style={{ fontSize: 16, color: inkMid, lineHeight: 1.65, marginBottom: 36, maxWidth: 480 }}>
              They sign the contract. They pay the deposit.{" "}
              <span className="link-ul">You start the work — zero chasing.</span>
            </p>

            {/* copy-link block (tasteskill-style terminal) */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 14px 14px 18px", background: inkDeep, borderRadius: 16, maxWidth: 480, marginBottom: 28, boxShadow: "0 14px 30px -12px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.06)", cursor: "pointer" }} onClick={copyLink}>
              <span className="mono-sm" style={{ color: "#737373", fontSize: 10 }}>→</span>
              <code style={{ flex: 1, fontFamily: fontMono, fontSize: 13, color: "#E5E5E5", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                flowdocs.co.in/sign/<span style={{ color: goldSoft }}>acme-corp</span>
              </code>
              <button style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.06)", color: "#fff", border: "1px solid rgba(255,255,255,.08)", padding: "7px 12px", borderRadius: 9, fontSize: 11.5, fontFamily: fontMono, fontWeight: 500, cursor: "pointer", textTransform: "uppercase", letterSpacing: ".1em" }}>
                {copied ? <span style={{ color: "#4ADE80" }}>✓ Copied</span> : "Copy"}
              </button>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
              <button className="btn-dark" onClick={() => nav("/auth")}>Start free — no card <span style={{ opacity: .6 }}>→</span></button>
              <button className="btn-light" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>See how it works</button>
            </div>

            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {["Free forever plan", "IT Act 2000 eSign", "USD · EUR · GBP"].map((t, i) => (
                <span key={i} className="mono-sm" style={{ display: "flex", alignItems: "center", gap: 6, color: inkMid }}>
                  <span style={{ color: stamp, fontSize: 11 }}>✓</span>{t}
                </span>
              ))}
            </div>
          </div>

          {/* Scattered rotated document cards */}
          <div style={{ position: "relative", height: 540, display: "flex", alignItems: "center", justifyContent: "center" }} className="hero-cards">
            {/* contract card — back-left */}
            <div className="doc-card" style={{ width: 300, left: "0%", top: "6%", transform: "rotate(-5deg)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span className="mono-sm" style={{ color: inkFaint }}>Contract · §001</span>
                <span style={{ fontSize: 9, fontFamily: fontMono, color: stamp, border: `1px solid ${stamp}30`, padding: "3px 7px", borderRadius: 100, letterSpacing: ".1em", textTransform: "uppercase" }}>✓ Signed</span>
              </div>
              <div style={{ fontFamily: fontDisplay, fontSize: 18, fontWeight: 500, marginBottom: 4, letterSpacing: "-.3px" }}>Brand Identity Design</div>
              <div style={{ fontSize: 12, color: inkMid, marginBottom: 14 }}>For Acme Corp · United States</div>
              <div style={{ height: 1, background: line, marginBottom: 14 }} />
              {["Logo + wordmark", "Brand guidelines PDF", "4 weeks delivery"].map((t, i) => (
                <div key={i} style={{ fontSize: 12, color: inkMid, marginBottom: 5, display: "flex", gap: 6 }}>
                  <span style={{ color: inkFaint, fontFamily: fontMono, fontSize: 10 }}>0{i + 1}</span>{t}
                </div>
              ))}
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px dashed ${line}`, display: "flex", justifyContent: "space-between" }}>
                <span className="mono-sm">Total</span>
                <span style={{ fontFamily: fontDisplay, fontSize: 18, fontWeight: 600 }}>$3,500</span>
              </div>
            </div>

            {/* signature card — center-front */}
            <div className="doc-card" style={{ width: 260, left: "28%", top: "48%", transform: "rotate(2deg)", zIndex: 10 }}>
              <div className="mono-sm" style={{ marginBottom: 10, color: inkFaint }}>eSignature · verified</div>
              <svg width="100%" height="70" viewBox="0 0 220 70" style={{ marginBottom: 10 }}>
                <path d="M10,45 Q35,15 55,42 Q75,65 95,30 Q120,10 145,38 Q165,58 185,25 L205,40"
                      stroke={ink} strokeWidth="2.2" fill="none" strokeLinecap="round"
                      strokeDasharray="260" style={{ animation: "drawSig 2.5s ease-out forwards" }} />
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: `1px solid ${line}`, paddingTop: 10 }}>
                <div>
                  <div style={{ fontFamily: fontDisplay, fontSize: 14, fontWeight: 500 }}>Priya Sharma</div>
                  <div className="mono-sm" style={{ fontSize: 9.5 }}>oct 06, 2026 · 14:32 IST</div>
                </div>
                <div style={{ fontSize: 10, color: stamp, fontWeight: 600 }}>✓ Aadhaar</div>
              </div>
            </div>

            {/* payment card — top-right */}
            <div className="doc-card" style={{ width: 240, right: "0%", top: "0%", transform: "rotate(4deg)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span className="mono-sm">Deposit · 50%</span>
                <div style={{ width: 24, height: 24, borderRadius: 7, background: `${goldSoft}18`, display: "flex", alignItems: "center", justifyContent: "center", color: gold, fontSize: 12, fontWeight: 700 }}>$</div>
              </div>
              <div style={{ fontFamily: fontDisplay, fontSize: 30, fontWeight: 600, letterSpacing: "-.5px", marginBottom: 2 }}>$1,750</div>
              <div style={{ fontSize: 11.5, color: stamp, fontWeight: 500, marginBottom: 14 }}>↑ Received · 2 min ago</div>
              <div style={{ height: 4, background: lineSoft, borderRadius: 100, overflow: "hidden", marginBottom: 6 }}>
                <div style={{ width: "50%", height: "100%", background: `linear-gradient(90deg,${goldSoft},${gold})`, borderRadius: 100 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: inkFaint, fontFamily: fontMono }}>
                <span>50% paid</span><span>$1,750 due</span>
              </div>
            </div>

            {/* ledger card — bottom-right */}
            <div className="doc-card" style={{ width: 230, right: "4%", bottom: "4%", transform: "rotate(-3deg)" }}>
              <div className="mono-sm" style={{ marginBottom: 12 }}>This month</div>
              <div style={{ fontFamily: fontDisplay, fontSize: 26, fontWeight: 600, letterSpacing: "-.5px" }}>$12,400</div>
              <div style={{ fontSize: 11, color: stamp, marginBottom: 14, fontWeight: 500 }}>↑ 34% vs last month</div>
              {[["Studio Berlin", "€2.2k"], ["TechBase UK", "£1.8k"], ["Acme (US)", "$3.5k"]].map(([n, a], i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderTop: i > 0 ? `1px solid ${lineSoft}` : "none", fontSize: 11.5 }}>
                  <span style={{ color: inkMid }}>{n}</span>
                  <span style={{ fontFamily: fontMono, fontWeight: 600, color: ink }}>{a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ padding: "20px 28px 100px" }}>
        <Reveal>
          <div style={{ maxWidth: 1200, margin: "0 auto", background: card, border: `1px solid ${line}`, borderRadius: 24, padding: "8px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", boxShadow: "0 1px 2px rgba(0,0,0,.03)" }} className="stats-grid">
            {[
              { val: 10, suf: "×", label: "Cheaper than DocuSign" },
              { val: 2, suf: " min", label: "To send first contract" },
              { val: 8, suf: "", label: "Currencies supported" },
              { val: 100, suf: "%", label: "Legally binding eSign" },
            ].map((s, i) => (
              <div key={i} style={{ padding: "28px 20px", borderLeft: i > 0 ? `1px solid ${lineSoft}` : "none", textAlign: "center" }}>
                <div style={{ fontFamily: fontDisplay, fontSize: 42, fontWeight: 600, letterSpacing: "-1px", lineHeight: 1, marginBottom: 10, color: ink }}>
                  <CountUp to={s.val} suffix={s.suf} />
                </div>
                <div className="mono-sm" style={{ color: inkMid }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: "0 28px 110px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20, marginBottom: 48 }}>
              <div>
                <div className="mono" style={{ marginBottom: 14 }}>§ 01 · How it works</div>
                <h2 style={{ fontFamily: fontDisplay, fontSize: "clamp(34px,4.6vw,54px)", fontWeight: 500, letterSpacing: "-1px", lineHeight: 1.05, maxWidth: 640 }}>
                  Four clauses. <span style={{ fontStyle: "italic", color: gold }}>One</span> agreement.
                </h2>
              </div>
              <p style={{ fontSize: 15.5, color: inkMid, maxWidth: 320, lineHeight: 1.6 }}>
                From draft to deposit, without a single back-and-forth email.
              </p>
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }} className="steps-grid">
            {STEPS.map((s, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="card" style={{ padding: "28px 24px 32px", height: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: fontMono, fontSize: 12, fontWeight: 600, color: gold, letterSpacing: ".1em" }}>0{i + 1}</span>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: bgAlt, display: "flex", alignItems: "center", justifyContent: "center", color: inkMid }}>
                      {["✎", "⌁", "→", "✓"][i]}
                    </div>
                  </div>
                  <div style={{ fontFamily: fontDisplay, fontSize: 20, fontWeight: 500, letterSpacing: "-.3px", color: ink, marginTop: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 13.5, color: inkMid, lineHeight: 1.65 }}>{s.body}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "0 28px 110px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div className="mono" style={{ marginBottom: 14 }}>§ 02 · Pricing</div>
              <h2 style={{ fontFamily: fontDisplay, fontSize: "clamp(34px,4.6vw,54px)", fontWeight: 500, letterSpacing: "-1px", lineHeight: 1.05, marginBottom: 16 }}>
                Simple terms, <span style={{ fontStyle: "italic", color: gold }}>no</span> fine print.
              </h2>
              <p style={{ fontSize: 15.5, color: inkMid, maxWidth: 500, margin: "0 auto" }}>Start free. Upgrade when the volume justifies it.</p>
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="pricing-grid">
            {/* Free */}
            <Reveal>
              <div className="card" style={{ padding: 30, display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <span className="mono" style={{ color: inkDeep }}>Free</span>
                  <span className="mono-sm">forever</span>
                </div>
                <div style={{ fontFamily: fontDisplay, fontSize: 54, fontWeight: 500, letterSpacing: "-1.5px", lineHeight: 1 }}>₹0</div>
                <div style={{ fontSize: 13, color: inkMid, marginTop: 6, marginBottom: 24 }}>Dip a toe in. No card needed.</div>
                <div style={{ height: 1, background: lineSoft, marginBottom: 18 }} />
                <div style={{ flex: 1 }}>
                  {["3 documents / month", "Legal eSign", "Basic templates", "Email support"].map((f, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", fontSize: 13.5, color: inkMid }}>
                      <span style={{ color: stamp, fontWeight: 700 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <button className="btn-light" style={{ width: "100%", marginTop: 24 }} onClick={() => nav("/auth")}>Start free</button>
              </div>
            </Reveal>

            {/* Pro — featured */}
            <Reveal delay={0.08}>
              <div className="card" style={{ padding: 30, display: "flex", flexDirection: "column", height: "100%", border: `1.5px solid ${ink}`, position: "relative", background: card }}>
                <div style={{ position: "absolute", top: -12, left: 24, background: ink, color: "#fff", fontSize: 10, fontWeight: 600, padding: "5px 12px", borderRadius: 100, fontFamily: fontMono, letterSpacing: ".14em", textTransform: "uppercase", boxShadow: "0 6px 14px -4px rgba(0,0,0,.3)" }}>Most Picked</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <span className="mono" style={{ color: inkDeep }}>Pro</span>
                  <span style={{ fontSize: 10, color: gold, background: goldGlow, border: `1px solid ${goldSoft}40`, padding: "3px 9px", borderRadius: 100, fontFamily: fontMono, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase" }}>7-day trial</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontFamily: fontDisplay, fontSize: 54, fontWeight: 500, letterSpacing: "-1.5px", lineHeight: 1 }}>₹750</span>
                  <span style={{ fontSize: 15, color: inkFaint }}>/mo</span>
                </div>
                <div style={{ fontSize: 13, color: inkMid, marginTop: 6, marginBottom: 24 }}>Everything active freelancers need.</div>
                <div style={{ height: 1, background: lineSoft, marginBottom: 18 }} />
                <div style={{ flex: 1 }}>
                  {["Unlimited documents", "Legal eSign", "GST invoices", "Razorpay payments", "Auto reminders", "9 templates"].map((f, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", fontSize: 13.5, color: inkMid }}>
                      <span style={{ color: stamp, fontWeight: 700 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <button className="btn-dark" style={{ width: "100%", marginTop: 24 }} onClick={() => nav("/auth")}>Start trial →</button>
              </div>
            </Reveal>

            {/* Agency */}
            <Reveal delay={0.16}>
              <div className="card" style={{ padding: 30, display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <span className="mono" style={{ color: inkDeep }}>Agency</span>
                  <span className="mono-sm">for teams</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontFamily: fontDisplay, fontSize: 54, fontWeight: 500, letterSpacing: "-1.5px", lineHeight: 1 }}>₹1,999</span>
                  <span style={{ fontSize: 15, color: inkFaint }}>/mo</span>
                </div>
                <div style={{ fontSize: 13, color: inkMid, marginTop: 6, marginBottom: 24 }}>For studios running 10+ clients.</div>
                <div style={{ height: 1, background: lineSoft, marginBottom: 18 }} />
                <div style={{ flex: 1 }}>
                  {["Everything in Pro", "5 team members", "White-label branding", "Client portal", "API access", "Dedicated support"].map((f, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", fontSize: 13.5, color: inkMid }}>
                      <span style={{ color: stamp, fontWeight: 700 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <button className="btn-light" style={{ width: "100%", marginTop: 24 }}>Contact sales</button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FOUNDING MEMBERS */}
      <section id="founding" style={{ padding: "0 28px 110px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>
            <div style={{ position: "relative", maxWidth: 620, margin: "0 auto", background: inkDeep, border: `1px solid #262626`, borderRadius: 28, padding: "48px 44px", textAlign: "center", overflow: "hidden", boxShadow: "0 40px 80px -30px rgba(0,0,0,.5)" }}>
              {/* gold glow */}
              <div style={{ position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)", width: 480, height: 320, borderRadius: "50%", background: `${goldSoft}22`, filter: "blur(80px)", pointerEvents: "none" }} />

              <div style={{ position: "relative" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px 6px 10px", background: "rgba(245,166,35,.1)", border: `1px solid ${goldSoft}30`, borderRadius: 100, marginBottom: 22 }}>
                  <span style={{ position: "relative", width: 6, height: 6 }}>
                    <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `${goldSoft}70`, animation: "ping 1.5s cubic-bezier(0,0,.2,1) infinite" }} />
                    <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: goldSoft }} />
                  </span>
                  <span style={{ fontFamily: fontMono, fontSize: 10.5, color: goldSoft, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase" }}>
                    Only {20 - foundingCount} spots left
                  </span>
                </div>

                <h2 style={{ fontFamily: fontDisplay, fontSize: "clamp(32px,4.8vw,46px)", fontWeight: 500, lineHeight: 1.1, letterSpacing: "-1px", color: "#fff", marginBottom: 24 }}>
                  Lock in <span style={{ fontStyle: "italic", color: goldSoft }}>₹99</span>/month,<br />forever.
                </h2>

                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 16, marginBottom: 8 }}>
                  <div style={{ fontSize: 20, color: "#525252", textDecoration: "line-through", fontFamily: fontDisplay }}>₹750</div>
                  <div style={{ fontFamily: fontDisplay, fontSize: 60, fontWeight: 600, color: goldSoft, letterSpacing: "-2px", lineHeight: 1 }}>
                    ₹99<span style={{ fontSize: 16, color: "#737373", fontWeight: 400 }}>/mo</span>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "#A3A3A3", marginBottom: 32 }}>Your rate never increases. Even when we raise prices.</p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", textAlign: "left", marginBottom: 32, padding: "0 10px" }}>
                  {["Unlimited documents", "Legal eSign", "GST invoices", "Razorpay payments", "Auto reminders", "9 templates"].map((f, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "#D4D4D4" }}>
                      <span style={{ color: goldSoft, fontWeight: 700 }}>✓</span>{f}
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: 28 }}>
                  <div style={{ width: "100%", height: 6, background: "#262626", borderRadius: 100, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min((foundingCount / 20) * 100, 100)}%`, background: `linear-gradient(90deg,${goldSoft},${gold})`, borderRadius: 100, boxShadow: `0 0 12px ${goldSoft}80` }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12, fontFamily: fontMono, color: "#A3A3A3", letterSpacing: ".1em", textTransform: "uppercase" }}>
                    <span><strong style={{ color: "#fff" }}>{foundingCount}</strong> / 20 claimed</span>
                    <span>{20 - foundingCount} remaining</span>
                  </div>
                </div>

                <button className="btn-gold" style={{ width: "100%", padding: "16px" }} onClick={() => nav("/auth")}>
                  Claim my founding spot →
                </button>
                <p style={{ fontSize: 11.5, color: "#737373", marginTop: 14, fontFamily: fontMono, letterSpacing: ".1em", textTransform: "uppercase" }}>No credit card · Cancel anytime</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "0 28px 100px" }}>
        <Reveal>
          <div style={{ maxWidth: 1200, margin: "0 auto", background: card, border: `1px solid ${line}`, borderRadius: 28, padding: "80px 32px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)", width: 600, height: 400, borderRadius: "50%", background: `${goldSoft}15`, filter: "blur(90px)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <div className="mono" style={{ marginBottom: 20 }}>§ 03 · Ready?</div>
              <h2 style={{ fontFamily: fontDisplay, fontSize: "clamp(38px,6vw,68px)", fontWeight: 500, letterSpacing: "-1.5px", lineHeight: 1.02, marginBottom: 22, color: ink }}>
                Send one link.<br />
                <span style={{ fontStyle: "italic", color: gold }}>Signed. Paid. Done.</span>
              </h2>
              <p style={{ fontSize: 16, color: inkMid, marginBottom: 36, maxWidth: 460, margin: "0 auto 36px", lineHeight: 1.6 }}>
                Indian freelancers use FlowDocs to close international clients — without the back-and-forth.
              </p>
              <div style={{ display: "inline-flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                <button className="btn-dark" style={{ padding: "16px 32px", fontSize: 15 }} onClick={() => nav("/auth")}>Start free, no card →</button>
                <button className="btn-light" style={{ padding: "15px 28px", fontSize: 14 }} onClick={() => nav("/auth")}>Browse templates</button>
              </div>
              <div className="mono-sm" style={{ marginTop: 24, color: inkFaint }}>flowdocs.co.in</div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${line}`, padding: "48px 28px 36px", background: bgAlt }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 32, marginBottom: 36 }} className="footer-grid">
            <div style={{ maxWidth: 320 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, background: ink, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: fontDisplay }}>F</div>
                <span style={{ fontFamily: fontDisplay, fontSize: 18, fontWeight: 600, letterSpacing: "-.3px" }}>FlowDocs</span>
              </div>
              <p style={{ fontSize: 13, color: inkMid, lineHeight: 1.6 }}>One link. Signed contract. Paid deposit. Built for Indian freelancers billing clients worldwide.</p>
            </div>
            <div style={{ display: "flex", gap: 56, flexWrap: "wrap" }}>
              <div>
                <div className="mono-sm" style={{ marginBottom: 14 }}>Product</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: inkMid }}>
                  <a href="#how-it-works">How it works</a>
                  <a href="#pricing">Pricing</a>
                  <a href="#founding">Founding members</a>
                </div>
              </div>
              <div>
                <div className="mono-sm" style={{ marginBottom: 14 }}>Legal</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: inkMid }}>
                  <span style={{ cursor: "pointer" }} onClick={() => nav("/privacy")}>Privacy policy</span>
                  <span style={{ cursor: "pointer" }} onClick={() => nav("/terms")}>Terms of service</span>
                </div>
              </div>
              <div>
                <div className="mono-sm" style={{ marginBottom: 14 }}>Contact</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: inkMid }}>
                  <a href="mailto:support@flowdocs.co.in">support@flowdocs.co.in</a>
                </div>
              </div>
            </div>
          </div>
          <div style={{ paddingTop: 24, borderTop: `1px solid ${line}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div className="mono-sm">© {new Date().getFullYear()} FlowDocs · Built in India</div>
            <div className="mono-sm">Made for freelancers, by freelancers</div>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 960px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .hero-cards { height: 460px !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: repeat(2,1fr) !important; }
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .nav-desktop { display: none !important; }
        }
        @media (max-width: 560px) {
          .hero-cards { height: 420px !important; }
          .hero-cards .doc-card { transform: scale(.82) rotate(var(--r,0)) !important; transform-origin: center !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
