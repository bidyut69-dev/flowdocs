import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { supabase } from "../lib/supabase";
import Preloader from "../components/Preloader";
import { SkeletonStyles } from "../components/Skeleton";
import { Check, EnvelopeSimple, LinkSimple, SlackLogo, Sparkle, WhatsappLogo } from "@phosphor-icons/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

// ── Palette ──────────────────────────────────────────────────────────────
// Soft warm stone background with crisp white cards (tasteskill-inspired),
// FlowDocs brand gold kept as the single accent across all pages.
// Motion: GSAP ScrollTrigger + SplitText (gsap.com), spotlight/bento cards
// and marquee (21st.dev), grain + CSS 3D pointer tilt on the document stack
// (threeui-style depth, no WebGL so mobile stays fast).
// Taste Skill rules apply: no em dashes, max 3 eyebrows, hero <= 4 elements,
// no glows, one label per CTA intent, icons from Phosphor.
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

const fontDisplay = "'Playfair Display', Georgia, serif";
const fontSans = "'Manrope', 'Inter', system-ui, -apple-system, sans-serif";
const fontMono = "'IBM Plex Mono', ui-monospace, monospace";

const MOTION = "(prefers-reduced-motion: no-preference)";
const PRELOADER_KEY = "fd_preloader_seen";

// Show the preloader once per browser session, never for reduced motion.
function shouldShowPreloader() {
  try {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
    return sessionStorage.getItem(PRELOADER_KEY) !== "1";
  } catch {
    return false;
  }
}

// Elastic magnetic pull toward the cursor (fine pointers only).
function Magnetic({ children, strength = 0.35 }) {
  const ref = useRef();
  useGSAP(() => {
    const el = ref.current;
    if (!window.matchMedia("(pointer: fine)").matches || !window.matchMedia(MOTION).matches) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "elastic.out(1,0.35)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "elastic.out(1,0.35)" });
    const move = (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => { xTo(0); yTo(0); };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, { scope: ref });
  return <span ref={ref} style={{ display: "inline-flex", willChange: "transform" }}>{children}</span>;
}

// Updates --mx/--my on every .spot card in the grid so the border glow
// follows the cursor across neighbouring cards.
function trackSpotlight(e) {
  e.currentTarget.querySelectorAll(".spot").forEach(el => {
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
}

const STEPS = [
  { title: "Draft with AI", body: "Scope, amount and timeline, filled in from one short brief." },
  { title: "Generate one link", body: "Contract, signature, and payment live on a single page. No PDFs. No downloads." },
  { title: "Send it anywhere", body: "Email, WhatsApp, Slack. Opens on any device. Nothing to install." },
  { title: "Signed and paid", body: "You're notified the second it happens. Money secured. Work begins." },
];

const CURRENCIES = [
  ["$", "USD", "United States"], ["£", "GBP", "United Kingdom"], ["€", "EUR", "Europe"],
  ["د.إ", "AED", "UAE"], ["C$", "CAD", "Canada"], ["A$", "AUD", "Australia"],
  ["S$", "SGD", "Singapore"], ["₹", "INR", "India"],
];

const PLANS = [
  { name: "Free", tag: "forever", price: "₹0", per: "", blurb: "Dip a toe in. No card needed.", cta: "Start free",
    features: ["3 documents / month", "eSignature with audit trail", "Basic templates", "Email support"] },
  { name: "Solo", tag: "for starters", price: "₹299", per: "/mo", blurb: "No limits, no FlowDocs branding.", cta: "Get Solo",
    features: ["Unlimited documents", "Unlimited eSignatures", "Remove FlowDocs branding", "5 templates", "1 GB storage", "Email support"] },
  { name: "Pro", tag: "7-day trial", price: "₹750", per: "/mo", blurb: "Everything active freelancers need.", cta: "Start trial", featured: true,
    features: ["Unlimited documents", "eSignature with audit trail", "GST invoices", "Razorpay payments", "Auto reminders", "9 templates"] },
  { name: "Agency", tag: "for teams", price: "₹1,999", per: "/mo", blurb: "For studios running 10+ clients.", cta: "Contact sales", noNav: true,
    features: ["Everything in Pro", "5 team members", "White-label branding", "Client portal", "API access", "Dedicated support"] },
];

// Inline SVG film grain, tiled over the page on a fixed, non-interactive layer.
const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

export default function Landing() {
  const nav = useNavigate();
  const root = useRef();
  const heroTl = useRef();
  const [showPre, setShowPre] = useState(shouldShowPreloader);
  const [revealed, setRevealed] = useState(() => !showPre);
  const [scrolled, setScrolled] = useState(false);
  const [foundingCount, setFoundingCount] = useState(3);

  // Solid nav once scrolled. ScrollTrigger toggles state only when crossing
  // the threshold (no scroll listener, no per-frame re-render).
  useGSAP(() => {
    ScrollTrigger.create({ start: 10, end: "max", onToggle: (self) => setScrolled(self.isActive) });
  });

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

  // Fonts change text metrics, so re-measure pins/triggers once they land.
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  useEffect(() => {
    if (revealed) heroTl.current?.play();
  }, [revealed]);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add({ motion: MOTION, desktop: "(min-width: 961px)", fine: "(pointer: fine)" }, (ctx) => {
      const { motion, desktop, fine } = ctx.conditions;
      if (!motion) return;

      // ── Hero intro (paused until the preloader lifts) ──
      const heading = SplitText.create(".hero-h1", { type: "words", mask: "words" });
      const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
      tl.from(".hero-eyebrow", { y: 16, opacity: 0, duration: 0.9 })
        .from(heading.words, { yPercent: 110, duration: 1.2, stagger: 0.06 }, "<.05")
        .from(".hero-fade", { y: 22, opacity: 0, duration: 1, stagger: 0.08 }, "<.35")
        .from(".hero-card", {
          y: 140, opacity: 0, scale: 0.9,
          rotation: (i, el) => Number(el.dataset.rot) * 4,
          duration: 1.4, stagger: 0.1,
        }, 0.25)
        .from(".hero-sig", { strokeDashoffset: 260, duration: 1.8, ease: "power2.inOut" }, "<.6");
      heroTl.current = tl;
      if (revealed) tl.play();

      // Resting rotation for the scattered cards (owned by GSAP so tweens compose).
      gsap.set(".hero-card", { rotation: (i, el) => Number(el.dataset.rot) });

      // Pointer depth: layers drift at different depths and the whole stack
      // tilts in 3D (max ~6deg). Desktop mouse only.
      if (fine) {
        const stage = root.current.querySelector(".hero-stage");
        const rx = gsap.quickTo(stage, "rotationX", { duration: 1, ease: "power3.out" });
        const ry = gsap.quickTo(stage, "rotationY", { duration: 1, ease: "power3.out" });
        const layers = gsap.utils.toArray(".hero-layer").map(el => ({
          d: Number(el.dataset.depth),
          x: gsap.quickTo(el, "x", { duration: 1, ease: "power3.out" }),
          y: gsap.quickTo(el, "y", { duration: 1, ease: "power3.out" }),
        }));
        const hero = root.current.querySelector(".hero");
        const move = (e) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          layers.forEach(l => { l.x(nx * 60 * l.d); l.y(ny * 46 * l.d); });
          ry(nx * 10); rx(-ny * 8);
        };
        hero.addEventListener("pointermove", move);
        ctx.add(() => () => hero.removeEventListener("pointermove", move));
      }

      // Hero drifts apart as you scroll away.
      gsap.to(".hero-cards", { yPercent: -14, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".hero-copy", { yPercent: 8, opacity: 0.35, ease: "none", scrollTrigger: { trigger: ".hero", start: "center top", end: "bottom top", scrub: true } });

      // ── Scroll progress + auto-hiding nav ──
      gsap.to(".scroll-progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
      const navHide = gsap.to(".site-nav", { yPercent: -110, duration: 0.45, ease: "power3.out", paused: true });
      ScrollTrigger.create({
        start: 0, end: "max",
        onUpdate: (self) => {
          if (self.direction === 1 && self.scroll() > 320) navHide.play();
          else if (self.direction === -1) navHide.reverse();
        },
      });

      // ── Section headings: masked word rise ──
      gsap.utils.toArray("[data-split]").forEach(el => {
        const s = SplitText.create(el, { type: "words", mask: "words" });
        gsap.from(s.words, { yPercent: 110, duration: 1.1, stagger: 0.05, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
      });

      // ── Generic reveals, batched so siblings stagger together ──
      const reveals = gsap.utils.toArray("[data-reveal]");
      gsap.set(reveals, { opacity: 0, y: 36 });
      ScrollTrigger.batch(reveals, {
        start: "top 90%", once: true,
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1, stagger: 0.09, ease: "expo.out", overwrite: true, clearProps: "transform" }),
      });

      // ── Count-ups ──
      gsap.utils.toArray(".count").forEach(el => {
        const to = Number(el.dataset.to);
        const suf = el.dataset.suf || "";
        const n = { v: 0 };
        el.textContent = `0${suf}`;
        gsap.to(n, {
          v: to, duration: 1.8, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
          onUpdate: () => { el.textContent = `${Math.round(n.v)}${suf}`; },
        });
        ctx.add(() => () => { el.textContent = `${to}${suf}`; });
      });

      // ── How it works: pinned horizontal track on desktop ──
      if (desktop) {
        const track = root.current.querySelector(".steps-track");
        const dist = () => Math.max(0, track.scrollWidth - track.parentElement.clientWidth);
        const steps = gsap.timeline({
          scrollTrigger: {
            trigger: ".steps-pin", start: "top top", end: () => `+=${dist() + window.innerHeight * 0.4}`,
            pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
          },
        });
        steps.to(track, { x: () => -dist(), ease: "none" }, 0)
          .to(".steps-progress", { scaleX: 1, ease: "none" }, 0);
        gsap.utils.toArray(".step-card").forEach((el, i) => {
          steps.fromTo(el.querySelector(".step-num"), { color: inkFaint }, { color: gold, duration: 0.05 }, i / STEPS.length * 0.95);
        });
      }

      // ── Final CTA: words fill in as you scroll ──
      const cta = SplitText.create(".cta-h2", { type: "words" });
      gsap.fromTo(cta.words, { opacity: 0.12 }, {
        opacity: 1, stagger: 0.1, ease: "none",
        scrollTrigger: { trigger: ".cta-h2", start: "top 85%", end: "top 35%", scrub: true },
      });
    });

    return () => mm.revert();
  }, { scope: root });

  const finishPreloader = () => {
    try { sessionStorage.setItem(PRELOADER_KEY, "1"); } catch { /* storage blocked */ }
    setShowPre(false);
  };

  return (
    <div ref={root} style={{ background: bg, color: ink, fontFamily: fontSans, overflowX: "clip", minHeight: "100vh" }}>
      <SkeletonStyles />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes marquee{to{transform:translateX(-50%)}}
        .mono{font-family:${fontMono};font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.16em;color:${inkMid}}
        .mono-sm{font-family:${fontSans};font-size:12.5px;font-weight:500;letter-spacing:0;color:${inkMid}}
        .btn-dark{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:10px;background:${ink};color:#fff;border:none;padding:14px 26px;border-radius:14px;font-size:14.5px;font-weight:600;cursor:pointer;font-family:${fontSans};box-shadow:0 6px 16px -10px rgba(20,18,12,.45),inset 0 1px 0 rgba(255,255,255,.14);transition:box-shadow .3s cubic-bezier(.22,1,.36,1),transform .3s cubic-bezier(.22,1,.36,1);outline:1px solid rgba(0,0,0,.3);outline-offset:-1px;overflow:hidden;isolation:isolate}
        .btn-dark::before{content:"";position:absolute;inset:0;background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.18) 50%,transparent 70%);transform:translateX(-120%);transition:transform .8s cubic-bezier(.22,1,.36,1);z-index:-1}
        .btn-dark:hover::before{transform:translateX(120%)}
        .btn-dark:hover{box-shadow:0 10px 22px -12px rgba(20,18,12,.55),inset 0 1px 0 rgba(255,255,255,.2)}
        .btn-dark:active{transform:scale(.97)}
        .btn-light{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#fff;color:${ink};border:1px solid ${line};padding:13px 24px;border-radius:14px;font-size:14px;font-weight:500;cursor:pointer;font-family:${fontSans};box-shadow:0 3px 10px -2px rgba(0,0,0,.04);transition:all .3s cubic-bezier(.22,1,.36,1)}
        .btn-light:hover{border-color:${inkFaint};box-shadow:0 10px 22px -6px rgba(0,0,0,.1)}
        .btn-light:active{transform:scale(.97)}
        .btn-gold{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:${goldSoft};color:${ink};border:none;padding:14px 28px;border-radius:14px;font-size:15px;font-weight:700;cursor:pointer;font-family:${fontSans};box-shadow:inset 0 1px 0 rgba(255,255,255,.4);transition:all .3s cubic-bezier(.22,1,.36,1)}
        .btn-gold:hover{transform:translateY(-1px);filter:brightness(1.04)}
        .card{position:relative;background:${card};border:1px solid ${line};border-radius:20px;transition:transform .5s cubic-bezier(.22,1,.36,1),box-shadow .5s cubic-bezier(.22,1,.36,1),border-color .5s}
        .card:hover{transform:translateY(-4px);border-color:#D4D1CA;box-shadow:0 24px 48px -28px rgba(15,15,15,.22),0 2px 6px -2px rgba(15,15,15,.06)}
        .spot::before,.spot::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .45s}
        .spot::before{padding:1px;background:radial-gradient(280px circle at var(--mx,-200px) var(--my,-200px),${gold}AA,transparent 60%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
        .spot::after{background:radial-gradient(420px circle at var(--mx,-200px) var(--my,-200px),${goldSoft}12,transparent 45%)}
        .spot-grid:hover .spot::before,.spot-grid:hover .spot::after{opacity:1}
        .link-ul{color:${ink};font-weight:600;text-decoration:underline;text-decoration-color:${goldSoft}80;text-underline-offset:6px;text-decoration-thickness:2px;transition:all .3s}
        .link-ul:hover{color:${gold};text-decoration-color:${goldSoft}}
        .nav-link{position:relative;color:${inkMid};font-size:13.5px;font-weight:500;text-decoration:none;transition:color .2s;padding:8px 2px}
        .nav-link:hover{color:${ink}}
        .nav-link::after{content:"";position:absolute;left:50%;bottom:4px;transform:translateX(-50%);width:0;height:1.5px;background:${ink};border-radius:2px;transition:width .5s cubic-bezier(.16,1,.3,1)}
        .nav-link:hover::after{width:100%}
        .hero-stage{transform-style:preserve-3d}
        .hero-layer{position:absolute;will-change:transform}
        .hero-layer:hover{z-index:50 !important}
        .hero-card{background:${card};border:1px solid ${line};border-radius:16px;padding:18px;box-shadow:0 22px 50px -24px rgba(15,15,15,.25),0 2px 8px -2px rgba(15,15,15,.06);transition:box-shadow .55s cubic-bezier(.22,1,.36,1)}
        .hero-layer:hover .hero-card{box-shadow:0 46px 70px -20px rgba(15,15,15,.4)}
        .marquee{display:flex;width:max-content;animation:marquee 38s linear infinite}
        .marquee-wrap:hover .marquee{animation-play-state:paused}
        .chip{display:inline-flex;align-items:center;gap:10px;padding:10px 18px;margin-right:12px;background:${card};border:1px solid ${line};border-radius:100px;white-space:nowrap;font-size:13.5px;color:${inkMid};transition:border-color .3s,color .3s}
        .chip:hover{border-color:${inkFaint};color:${ink}}
        .steps-progress{transform:scaleX(0);transform-origin:left}
        .scroll-progress{transform:scaleX(0);transform-origin:left}
        ::selection{background:${goldSoft}40;color:${ink}}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:${bg}}
        ::-webkit-scrollbar-thumb{background:${line};border-radius:4px}
        ::-webkit-scrollbar-thumb:hover{background:${inkFaint}}
        a{color:inherit;text-decoration:none}
        @media (prefers-reduced-motion: reduce){
          .marquee{animation:none}
          .card:hover{transform:none}
        }
      `}</style>

      {showPre && <Preloader onReveal={() => setRevealed(true)} onDone={finishPreloader} />}

      {/* Film grain */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 200, pointerEvents: "none", backgroundImage: GRAIN, opacity: 0.06, mixBlendMode: "multiply" }} />

      {/* Scroll progress */}
      <div className="scroll-progress" aria-hidden="true" style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${goldSoft},${gold})`, zIndex: 150 }} />

      {/* NAV */}
      <nav className="site-nav" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: scrolled ? `${bg}E6` : "transparent", backdropFilter: scrolled ? "saturate(180%) blur(14px)" : "none", WebkitBackdropFilter: scrolled ? "saturate(180%) blur(14px)" : "none", borderBottom: `1px solid ${scrolled ? line : "transparent"}`, transition: "background .3s, border-color .3s" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="#top" style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 18 }}>
            <div style={{ width: 30, height: 30, background: ink, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: fontDisplay, boxShadow: "0 6px 14px -6px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.12)" }}>F</div>
            <span style={{ fontFamily: fontDisplay, fontWeight: 600, letterSpacing: "-.3px" }}>FlowDocs</span>
          </a>
          <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <a className="nav-link" href="#how-it-works">How it works</a>
            <a className="nav-link" href="#features">Features</a>
            <a className="nav-link" href="#pricing">Pricing</a>
            <a className="nav-link" href="#founding">Founding</a>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="btn-light nav-login" style={{ padding: "9px 16px", fontSize: 13, borderRadius: 12 }} onClick={() => nav("/auth")}>Log in</button>
            <button className="btn-dark" style={{ padding: "9px 18px", fontSize: 13, borderRadius: 12 }} onClick={() => nav("/auth")}>Start free</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section id="top" className="hero" style={{ position: "relative", padding: "112px 28px 70px" }}>

        <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.1fr)", gap: 60, alignItems: "center" }} className="hero-grid">
          <div className="hero-copy">
            {/* eyebrow */}
            <div className="hero-eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "7px 14px 7px 12px", background: card, border: `1px solid ${line}`, borderRadius: 100, marginBottom: 32, boxShadow: "0 2px 10px -2px rgba(0,0,0,.04)" }}>
              <span className="mono" style={{ color: inkDeep, fontSize: 10.5 }}>For Indian freelancers billing globally</span>
            </div>

            <h1 className="hero-h1" style={{ fontFamily: fontDisplay, fontSize: "clamp(42px,5vw,68px)", fontWeight: 500, lineHeight: 1.06, letterSpacing: "-1.5px", marginBottom: 24, color: ink, maxWidth: "10.5em", textWrap: "balance" }}>
              Get paid <span style={{ fontStyle: "italic", fontWeight: 500, color: gold }}>before</span> the work begins.
            </h1>

            <p className="hero-fade" style={{ fontSize: 18.5, color: inkMid, lineHeight: 1.55, marginBottom: 36, maxWidth: 470, fontWeight: 400 }}>
              Send one link. Your client signs the contract and pays the deposit on the same page.
            </p>

            <div className="hero-fade" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Magnetic><button className="btn-dark" onClick={() => nav("/auth")}>Start free</button></Magnetic>
              <Magnetic strength={0.25}><button className="btn-light" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>See how it works</button></Magnetic>
            </div>

          </div>

          {/* Document stack: the three things a client does on one link (review, sign, pay).
              Layers drift at different depths and the stack tilts in 3D with the pointer. */}
          <div className="hero-cards" style={{ position: "relative", height: 540, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="hero-stage" style={{ position: "relative", width: 600, height: 540, flexShrink: 0, perspective: 1400 }}>
              {/* contract card, back left */}
              <div className="hero-layer" data-depth="0.5" style={{ width: 300, left: 0, top: "6%" }}>
                <div className="hero-card" data-rot="-5">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <span className="mono-sm" style={{ color: inkFaint }}>Contract</span>
                    <span style={{ fontSize: 11, color: stamp, border: `1px solid ${stamp}30`, padding: "3px 8px", borderRadius: 100, display: "inline-flex", alignItems: "center", gap: 4 }}><Check size={11} weight="bold" />Signed</span>
                  </div>
                  <div style={{ fontFamily: fontDisplay, fontSize: 18, fontWeight: 500, marginBottom: 4, letterSpacing: "-.3px" }}>Brand Identity Design</div>
                  <div style={{ fontSize: 12, color: inkMid, marginBottom: 14 }}>For Acme Corp · United States</div>
                  <div style={{ height: 1, background: line, marginBottom: 14 }} />
                  {["Logo + wordmark", "Brand guidelines PDF", "4 weeks delivery"].map((t, i) => (
                    <div key={i} style={{ fontSize: 12, color: inkMid, marginBottom: 5 }}>{t}</div>
                  ))}
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px dashed ${line}`, display: "flex", justifyContent: "space-between" }}>
                    <span className="mono-sm">Total</span>
                    <span style={{ fontFamily: fontDisplay, fontSize: 18, fontWeight: 600 }}>$3,500</span>
                  </div>
                </div>
              </div>

              {/* payment card, top right */}
              <div className="hero-layer" data-depth="0.8" style={{ width: 240, right: 0, top: 0 }}>
                <div className="hero-card" data-rot="4">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span className="mono-sm">Deposit · 50%</span>
                    <div style={{ width: 24, height: 24, borderRadius: 7, background: `${goldSoft}18`, display: "flex", alignItems: "center", justifyContent: "center", color: gold, fontSize: 12, fontWeight: 700 }}>$</div>
                  </div>
                  <div style={{ fontFamily: fontDisplay, fontSize: 30, fontWeight: 600, letterSpacing: "-.5px", marginBottom: 2 }}>$1,750</div>
                  <div style={{ fontSize: 11.5, color: stamp, fontWeight: 500, marginBottom: 14 }}>Received via Razorpay</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: inkMid, borderTop: `1px solid ${lineSoft}`, paddingTop: 10 }}>
                    <span>Balance on delivery</span><span style={{ fontFamily: fontMono }}>$1,750</span>
                  </div>
                </div>
              </div>

              {/* signature card, centre front */}
              <div className="hero-layer" data-depth="1.3" style={{ width: 260, left: "18%", top: "50%", zIndex: 10 }}>
                <div className="hero-card" data-rot="2">
                  <div className="mono-sm" style={{ marginBottom: 10, color: inkFaint }}>eSignature</div>
                  <svg width="100%" height="70" viewBox="0 0 220 70" style={{ marginBottom: 10 }}>
                    <path className="hero-sig" d="M10,45 Q35,15 55,42 Q75,65 95,30 Q120,10 145,38 Q165,58 185,25 L205,40"
                      stroke={ink} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeDasharray="260" />
                  </svg>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: `1px solid ${line}`, paddingTop: 10 }}>
                    <div>
                      <div style={{ fontFamily: fontDisplay, fontSize: 14, fontWeight: 500 }}>Priya Sharma</div>
                      <div className="mono-sm" style={{ fontSize: 11 }}>6 Oct 2026, 2:32 pm IST</div>
                    </div>
                    <div style={{ fontSize: 11, color: stamp, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}><Check size={11} weight="bold" />Timestamped</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* CURRENCY MARQUEE */}
      <section aria-label="Supported currencies" style={{ padding: "10px 0 70px" }}>
        <p style={{ textAlign: "center", marginBottom: 18, fontSize: 14, color: inkMid }}>Bill clients in 8 currencies</p>
        <div className="marquee-wrap" style={{ overflow: "hidden", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)", maskImage: "linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)" }}>
          <div className="marquee">
            {[0, 1].map(k => (
              <div key={k} aria-hidden={k === 1} style={{ display: "flex" }}>
                {CURRENCIES.map(([sym, code, name]) => (
                  <span key={code} className="chip">
                    <span style={{ minWidth: 26, height: 26, padding: "0 6px", borderRadius: 100, background: bgAlt, color: gold, fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{sym}</span>
                    <span style={{ fontFamily: fontMono, fontWeight: 600, color: ink, letterSpacing: ".06em" }}>{code}</span>
                    <span>{name}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ padding: "0 28px 20px" }}>
        <div data-reveal style={{ maxWidth: 1200, margin: "0 auto", background: card, border: `1px solid ${line}`, borderRadius: 24, padding: "8px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", boxShadow: "0 1px 2px rgba(0,0,0,.03)" }} className="stats-grid">
          {[
            { val: 0, suf: "", pre: "₹", label: "To start, no card" },
            { val: 1, suf: "", label: "Link to sign and pay" },
            { val: 8, suf: "", label: "Currencies supported" },
            { val: 4, suf: "", label: "Steps from draft to paid" },
          ].map((s, i) => (
            <div key={i} className="stat-cell" style={{ padding: "28px 20px", borderLeft: i > 0 ? `1px solid ${lineSoft}` : "none", textAlign: "center" }}>
              <div style={{ fontFamily: fontDisplay, fontSize: 42, fontWeight: 600, letterSpacing: "-1px", lineHeight: 1, marginBottom: 10, color: ink, fontVariantNumeric: "tabular-nums" }}>
                {s.pre}<span className="count" data-to={s.val} data-suf={s.suf}>{`${s.val}${s.suf}`}</span>
              </div>
              <div className="mono-sm" style={{ color: inkMid }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS: pinned horizontal scroll on desktop */}
      <section id="how-it-works" className="steps-pin" style={{ padding: "110px 28px 60px" }}>
        <div style={{ maxWidth: 1200, width: "100%", margin: "0 auto" }}>
          <div style={{ marginBottom: 40, maxWidth: 640 }}>
            <h2 data-split style={{ fontFamily: fontDisplay, fontSize: "clamp(34px,4.6vw,54px)", fontWeight: 500, letterSpacing: "-1px", lineHeight: 1.08 }}>
              Four clauses. <span style={{ fontStyle: "italic", color: gold }}>One</span> agreement.
            </h2>
            <p style={{ fontSize: 16, color: inkMid, lineHeight: 1.6, marginTop: 14 }}>
              From draft to deposit, without a single back-and-forth email.
            </p>
            <div className="steps-bar" style={{ height: 2, background: line, borderRadius: 2, overflow: "hidden", marginTop: 22, maxWidth: 320 }}>
              <div className="steps-progress" style={{ height: "100%", background: ink }} />
            </div>
          </div>

          <div style={{ overflow: "visible" }}>
            <div className="steps-track" style={{ display: "flex", gap: 18, width: "max-content" }}>
              {STEPS.map((s, i) => (
                <div key={i} className="step-card card" data-reveal style={{ width: 440, minHeight: 360, padding: 30, display: "flex", flexDirection: "column", gap: 14 }}>
                  <span className="step-num" style={{ fontFamily: fontDisplay, fontSize: 56, fontWeight: 500, lineHeight: 1, color: gold, letterSpacing: "-1px" }}>§{i + 1}</span>
                  <div style={{ fontFamily: fontDisplay, fontSize: 26, fontWeight: 500, letterSpacing: "-.4px", color: ink, marginTop: 6 }}>{s.title}</div>
                  <div style={{ fontSize: 14.5, color: inkMid, lineHeight: 1.65, maxWidth: 360 }}>{s.body}</div>
                  <div style={{ marginTop: "auto", background: bg, border: `1px solid ${lineSoft}`, borderRadius: 14, padding: 16 }}>
                    <StepVisual i={i} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES: bento with spotlight borders */}
      <section id="features" style={{ padding: "60px 28px 110px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 44 }}>
            <h2 data-split style={{ fontFamily: fontDisplay, fontSize: "clamp(34px,4.6vw,54px)", fontWeight: 500, letterSpacing: "-1px", lineHeight: 1.08, maxWidth: 720 }}>
              Everything between <span style={{ fontStyle: "italic", color: gold }}>yes</span> and paid.
            </h2>
          </div>

          <div className="spot-grid bento" onPointerMove={trackSpotlight} style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 16 }}>
            <div data-reveal className="card spot b-wide" style={{ gridColumn: "span 4", padding: 30, minHeight: 260, overflow: "hidden" }}>
              <div className="mono-sm" style={{ marginBottom: 12, color: gold }}>eSignature</div>
              <div style={{ fontFamily: fontDisplay, fontSize: 28, fontWeight: 500, letterSpacing: "-.5px", marginBottom: 10, maxWidth: 420 }}>Signed on any phone, with a record you can show.</div>
              <p style={{ fontSize: 14, color: inkMid, lineHeight: 1.6, maxWidth: 420 }}>Every signature is timestamped, and an audit trail PDF is kept with the signed document.</p>
              <svg viewBox="0 0 300 90" width="300" height="90" aria-hidden="true" className="b-art" style={{ position: "absolute", right: 24, bottom: 18 }}>
                <path d="M10,60 Q40,15 66,52 Q92,86 120,40 Q150,8 180,50 Q204,78 232,32 L290,56" stroke={ink} strokeOpacity=".85" strokeWidth="2.4" fill="none" strokeLinecap="round" />
                <line x1="10" y1="80" x2="290" y2="80" stroke={line} strokeDasharray="4 4" />
              </svg>
            </div>
            <div data-reveal className="card spot b-tall" style={{ gridColumn: "span 2", gridRow: "span 2", padding: 30, minHeight: 260, background: bgAlt, display: "flex", flexDirection: "column" }}>
              <div className="mono-sm" style={{ marginBottom: 12, color: gold }}>AI drafting</div>
              <div style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: 500, letterSpacing: "-.3px", marginBottom: 10 }}>One brief in. A full contract out.</div>
              <p style={{ fontSize: 13.5, color: inkMid, lineHeight: 1.6, marginBottom: 20 }}>Describe the job in a line. Scope, milestones and payment terms come back ready to edit.</p>
              {/* brief in, skeleton lines doubling as "AI is writing" */}
              <div style={{ marginTop: "auto", background: card, border: `1px solid ${line}`, borderRadius: 14, padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, fontSize: 12.5, color: inkMid }}>
                  <Sparkle size={14} weight="fill" color={gold} aria-hidden="true" />
                  "Website for a Pune bakery, ₹40k, 3 weeks"
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {[100, 86, 94, 72, 88, 60].map((w, i) => <div key={i} className="sk" style={{ width: `${w}%`, height: 9, borderRadius: 6 }} />)}
                </div>
              </div>
            </div>
            <div data-reveal className="card spot" style={{ gridColumn: "span 2", padding: 30, minHeight: 220, background: `${goldSoft}14`, borderColor: `${goldSoft}40` }}>
              <div className="mono-sm" style={{ marginBottom: 12, color: gold }}>Razorpay</div>
              <div style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: 500, letterSpacing: "-.3px", marginBottom: 10 }}>Deposits collected on the same page.</div>
              <p style={{ fontSize: 13.5, color: inkMid, lineHeight: 1.6 }}>Your client pays right after signing. No separate invoice to chase.</p>
            </div>
            <div data-reveal className="card spot" style={{ gridColumn: "span 2", padding: 30, minHeight: 220 }}>
              <div className="mono-sm" style={{ marginBottom: 12, color: gold }}>GST invoices</div>
              <div style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: 500, letterSpacing: "-.3px", marginBottom: 10 }}>Compliant invoices, one click.</div>
              <p style={{ fontSize: 13.5, color: inkMid, lineHeight: 1.6 }}>GSTIN plus CGST/SGST or IGST lines, calculated for you.</p>
            </div>
            <div data-reveal className="card spot b-full" style={{ gridColumn: "span 6", padding: "28px 30px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap", background: inkDeep, borderColor: inkDeep, color: "#F5F4F2" }}>
              <div>
                <div className="mono-sm" style={{ marginBottom: 10, color: goldSoft }}>Auto reminders</div>
                <div style={{ fontFamily: fontDisplay, fontSize: 26, fontWeight: 500, letterSpacing: "-.4px" }}>We chase. You don't.</div>
              </div>
              <p style={{ fontSize: 14, color: "#C9C6BF", lineHeight: 1.6, maxWidth: 420 }}>Follow-ups go out when a proposal sits unopened or unsigned, so you never have to send the awkward email.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "0 28px 110px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 data-split style={{ fontFamily: fontDisplay, fontSize: "clamp(34px,4.6vw,54px)", fontWeight: 500, letterSpacing: "-1px", lineHeight: 1.08, marginBottom: 16 }}>
              Simple terms, <span style={{ fontStyle: "italic", color: gold }}>no</span> fine print.
            </h2>
            <p style={{ fontSize: 15.5, color: inkMid, maxWidth: 500, margin: "0 auto" }}>Start free. Upgrade when the volume justifies it.</p>
          </div>

          <div className="spot-grid pricing-grid" onPointerMove={trackSpotlight} style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
            {PLANS.map((p) => (
              <div key={p.name} data-reveal style={{ height: "100%" }}>
                <div className="card spot" style={{ padding: 30, display: "flex", flexDirection: "column", height: "100%", ...(p.featured && { border: `1.5px solid ${ink}` }) }}>
                  {p.featured && (
                    <div style={{ position: "absolute", top: -12, left: 24, background: ink, color: "#fff", fontSize: 10, fontWeight: 600, padding: "5px 12px", borderRadius: 100, fontFamily: fontMono, letterSpacing: ".14em", textTransform: "uppercase", boxShadow: "0 6px 14px -4px rgba(0,0,0,.3)" }}>Most Picked</div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <span className="mono" style={{ color: inkDeep }}>{p.name}</span>
                    {p.featured
                      ? <span style={{ fontSize: 10, color: gold, background: goldGlow, border: `1px solid ${goldSoft}40`, padding: "3px 9px", borderRadius: 100, fontFamily: fontMono, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase" }}>{p.tag}</span>
                      : <span className="mono-sm">{p.tag}</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span style={{ fontFamily: fontDisplay, fontSize: 54, fontWeight: 500, letterSpacing: "-1.5px", lineHeight: 1 }}>{p.price}</span>
                    {p.per && <span style={{ fontSize: 15, color: inkFaint }}>{p.per}</span>}
                  </div>
                  <div style={{ fontSize: 13, color: inkMid, marginTop: 6, marginBottom: 24 }}>{p.blurb}</div>
                  <div style={{ height: 1, background: lineSoft, marginBottom: 18 }} />
                  <div style={{ flex: 1 }}>
                    {p.features.map((f, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", fontSize: 13.5, color: inkMid }}>
                        <Check size={15} weight="bold" color={stamp} aria-hidden="true" style={{ flexShrink: 0 }} />{f}
                      </div>
                    ))}
                  </div>
                  <button className={p.featured ? "btn-dark" : "btn-light"} style={{ width: "100%", marginTop: 24, position: "relative", zIndex: 1 }} onClick={p.noNav ? () => { window.location.href = "mailto:support@flowdocs.co.in?subject=FlowDocs%20Agency%20plan"; } : () => nav("/auth")}>{p.cta}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDING MEMBERS */}
      <section id="founding" style={{ padding: "0 28px 110px" }}>
        <div data-reveal style={{ maxWidth: 620, margin: "0 auto" }}>
          <div>
            <div style={{ position: "relative", background: inkDeep, border: "1px solid #2A2A2A", borderRadius: 28, padding: "48px 44px", textAlign: "center", overflow: "hidden" }} className="founding-inner">

              <div style={{ position: "relative" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px 6px 10px", background: "rgba(245,166,35,.1)", border: `1px solid ${goldSoft}30`, borderRadius: 100, marginBottom: 22 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: goldSoft }} aria-hidden="true" />
                  <span style={{ fontSize: 12.5, color: goldSoft, fontWeight: 600 }}>
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

                <div className="founding-feats" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", textAlign: "left", marginBottom: 32, padding: "0 10px" }}>
                  {["Unlimited documents", "eSignature with audit trail", "GST invoices", "Razorpay payments", "Auto reminders", "9 templates"].map((f, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "#D4D4D4" }}>
                      <Check size={14} weight="bold" color={goldSoft} aria-hidden="true" style={{ flexShrink: 0 }} />{f}
                    </div>
                  ))}
                </div>

                <p style={{ marginBottom: 24, fontSize: 13, color: "#A3A3A3" }}>
                  <strong style={{ color: "#F5F4F2", fontFamily: fontMono }}>{foundingCount}</strong> of 20 founding spots claimed
                </p>

                <button className="btn-gold" style={{ width: "100%", padding: "16px" }} onClick={() => nav("/auth")}>
                  Claim my founding spot
                </button>
                <p style={{ fontSize: 12.5, color: "#8A8A8A", marginTop: 14 }}>No credit card. Cancel anytime.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "0 28px 100px" }}>
        <div data-reveal style={{ maxWidth: 1200, margin: "0 auto", background: card, border: `1px solid ${line}`, borderRadius: 28, padding: "90px 32px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "relative" }}>
            <h2 className="cta-h2" style={{ fontFamily: fontDisplay, fontSize: "clamp(40px,7vw,84px)", fontWeight: 500, letterSpacing: "-2px", lineHeight: 1.02, marginBottom: 22, color: ink }}>
              Send one link.<br />
              <span style={{ fontStyle: "italic", color: gold }}>Signed. Paid. Done.</span>
            </h2>
            <p style={{ fontSize: 16, color: inkMid, maxWidth: 460, margin: "0 auto 36px", lineHeight: 1.6 }}>
              Built for Indian freelancers closing international clients, without the back-and-forth.
            </p>
            <div style={{ display: "inline-flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              <Magnetic><button className="btn-dark" style={{ padding: "16px 32px", fontSize: 15 }} onClick={() => nav("/auth")}>Start free</button></Magnetic>
              <Magnetic strength={0.25}><button className="btn-light" style={{ padding: "15px 28px", fontSize: 14 }} onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}>See pricing</button></Magnetic>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${line}`, padding: "48px 28px 36px", background: bgAlt, overflow: "hidden" }}>
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
                  <a href="#features">Features</a>
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
          {/* oversized wordmark */}
          <div aria-hidden="true" style={{ fontFamily: fontDisplay, fontSize: "clamp(64px,17vw,230px)", fontWeight: 500, letterSpacing: "-.04em", lineHeight: .8, color: ink, opacity: .06, textAlign: "center", userSelect: "none", margin: "8px 0 28px" }}>
            Flow<span style={{ fontStyle: "italic" }}>Docs</span>
          </div>
          <div style={{ paddingTop: 24, borderTop: `1px solid ${line}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div className="mono-sm">© {new Date().getFullYear()} FlowDocs, built in India</div>
            <div className="mono-sm">Made for freelancers, by Bidyut</div>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 960px) {
          .hero-grid { grid-template-columns: minmax(0,1fr) !important; gap: 40px !important; }
          .hero-cards { height: 500px !important; }
          .pricing-grid { grid-template-columns: repeat(2,1fr) !important; row-gap: 28px !important; }
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .stats-grid .stat-cell:nth-child(3) { border-left: none !important; }
          .nav-desktop { display: none !important; }
          .steps-pin { padding-top: 40px !important; }
          .steps-track { width: auto !important; display: grid !important; grid-template-columns: repeat(2,minmax(0,1fr)); }
          .step-card { width: auto !important; }
          .steps-bar { display: none; }
          .bento > * { grid-column: span 3 !important; }
          .bento > .b-wide, .bento > .b-full { grid-column: span 6 !important; }
          .bento > .b-tall { grid-row: auto !important; }
        }
        @media (max-width: 560px) {
          .hero { padding-top: 116px !important; }
          .hero-cards { height: 360px !important; }
          .hero-stage { transform: scale(.55); }
          .nav-login { display: none !important; }
          .steps-track { grid-template-columns: minmax(0,1fr); }
          .step-card { min-height: 0 !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .bento > * { grid-column: span 6 !important; }
          .b-art { position: static !important; margin-top: 18px; width: 100%; }
          .founding-inner { padding: 36px 22px !important; }
          .founding-feats { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// Small product vignettes inside each "How it works" card.
function StepVisual({ i }) {
  if (i === 0) return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ width: 18, height: 18, borderRadius: 6, background: ink, color: goldSoft, display: "flex", alignItems: "center", justifyContent: "center" }}><Sparkle size={11} weight="fill" /></span>
        <span style={{ fontSize: 12.5, color: inkMid }}>"Logo for Acme, $3.5k, 4 weeks"</span>
      </div>
      {[100, 82, 92].map((w, k) => <div key={k} className="sk" style={{ width: `${w}%`, height: 8, borderRadius: 6, marginBottom: 7 }} />)}
    </div>
  );
  if (i === 1) return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, background: inkDeep, borderRadius: 10, padding: "10px 12px" }}>
      <code style={{ flex: 1, minWidth: 0, fontFamily: fontMono, fontSize: 12, color: "#E5E5E5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        flowdocs.co.in/sign/<span style={{ color: goldSoft }}>acme-corp</span>
      </code>
      <span style={{ fontSize: 11, color: "#A3A3A3" }}>Copy</span>
    </div>
  );
  if (i === 2) return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {[
        [<EnvelopeSimple size={14} aria-hidden="true" />, "Email"],
        [<WhatsappLogo size={14} aria-hidden="true" />, "WhatsApp"],
        [<SlackLogo size={14} aria-hidden="true" />, "Slack"],
        [<LinkSimple size={14} aria-hidden="true" />, "Any link"],
      ].map(([icon, t]) => (
        <span key={t} style={{ fontSize: 12, padding: "7px 12px", borderRadius: 100, background: card, border: `1px solid ${line}`, color: inkMid, display: "inline-flex", alignItems: "center", gap: 6 }}>{icon}{t}</span>
      ))}
    </div>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontFamily: fontDisplay, fontSize: 24, fontWeight: 600, letterSpacing: "-.5px" }}>$1,750</div>
        <div style={{ fontSize: 11.5, color: stamp, fontWeight: 500 }}>Deposit received</div>
      </div>
      <span style={{ fontSize: 12, color: stamp, border: `1.5px solid ${stamp}`, padding: "6px 10px", borderRadius: 8, transform: "rotate(-6deg)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}><Check size={12} weight="bold" />Signed</span>
    </div>
  );
}
