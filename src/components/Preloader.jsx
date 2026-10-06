// ── Landing Preloader ───────────────────────────────────────────────────
// GSAP intro: 000→100 counter, brand letters rising, signature drawing,
// then a two-layer curtain (gold, then ink) lifts to reveal the page.
// Calls onReveal as the curtain starts moving and onDone once it's gone.
// Click anywhere to skip.

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const inkDeep = "#151515";
const goldSoft = "#F5A623";
const fontDisplay = "'Playfair Display', 'Fraunces', Georgia, serif";
const fontMono = "'IBM Plex Mono', 'DM Mono', ui-monospace, monospace";

export default function Preloader({ onReveal, onDone }) {
  const root = useRef();
  const count = useRef();
  const tl = useRef();

  useGSAP(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const n = { v: 0 };
    const t = gsap.timeline({
      defaults: { ease: "expo.out" },
      onComplete: () => {
        document.body.style.overflow = prevOverflow;
        onDone?.();
      },
    });
    tl.current = t;

    t.from(".pl-char", { yPercent: 110, duration: 1, stagger: 0.04 })
      .from(".pl-mono", { opacity: 0, y: 8, duration: 0.6 }, "<.2")
      .to(".pl-sig", { strokeDashoffset: 0, duration: 1.3, ease: "power2.inOut" }, "<")
      .to(n, {
        v: 100, duration: 1.4, ease: "power2.inOut",
        onUpdate: () => { if (count.current) count.current.textContent = String(Math.round(n.v)).padStart(3, "0"); },
      }, 0.1)
      .to(".pl-bar", { scaleX: 1, duration: 1.4, ease: "power2.inOut" }, 0.1)
      .add(() => onReveal?.(), "+=0.05")
      .to(".pl-content", { yPercent: -30, opacity: 0, duration: 0.6, ease: "power3.in" }, "<")
      .to(".pl-ink", { yPercent: -100, duration: 1, ease: "expo.inOut" }, "<.15")
      .to(".pl-gold", { yPercent: -100, duration: 1, ease: "expo.inOut" }, "<.1");

    return () => { document.body.style.overflow = prevOverflow; };
  }, { scope: root });

  const skip = () => tl.current?.progress(0.72);

  return (
    <div ref={root} onClick={skip} aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 1000, pointerEvents: "auto" }}>
      <div className="pl-gold" style={{ position: "absolute", inset: 0, background: goldSoft }} />
      <div className="pl-ink" style={{ position: "absolute", inset: 0, background: inkDeep, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: 700, height: 420, borderRadius: "50%", background: `${goldSoft}18`, filter: "blur(90px)" }} />
        <div className="pl-content" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22 }}>
          <div style={{ display: "flex", overflow: "hidden", fontFamily: fontDisplay, fontSize: "clamp(44px,8vw,88px)", fontWeight: 500, letterSpacing: "-2px", color: "#fff", lineHeight: 1.1, paddingBottom: 4 }}>
            {"FlowDocs".split("").map((c, i) => (
              <span key={i} className="pl-char" style={{ display: "inline-block", fontStyle: i >= 4 ? "italic" : "normal", color: i >= 4 ? goldSoft : "#fff" }}>{c}</span>
            ))}
          </div>
          <svg width="220" height="48" viewBox="0 0 220 48">
            <path className="pl-sig" d="M8,32 Q30,6 48,28 Q66,46 86,18 Q108,2 128,26 Q146,42 166,14 L212,28"
              stroke="#E5E5E5" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="300" strokeDashoffset="300" />
          </svg>
          <div className="pl-mono" style={{ fontFamily: fontMono, fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase", color: "#737373" }}>
            Preparing your agreement
          </div>
        </div>

        <div className="pl-content" style={{ position: "absolute", left: 28, right: 28, bottom: 28, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
          <div style={{ flex: 1, maxWidth: 360 }}>
            <div style={{ height: 1, background: "#262626", overflow: "hidden" }}>
              <div className="pl-bar" style={{ height: "100%", background: goldSoft, transform: "scaleX(0)", transformOrigin: "left" }} />
            </div>
            <div style={{ marginTop: 10, fontFamily: fontMono, fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "#525252" }}>Sign · Pay · Done</div>
          </div>
          <div ref={count} style={{ fontFamily: fontDisplay, fontSize: "clamp(56px,10vw,120px)", lineHeight: .85, fontWeight: 500, color: "#fff", letterSpacing: "-3px", fontVariantNumeric: "tabular-nums" }}>000</div>
        </div>
      </div>
    </div>
  );
}
