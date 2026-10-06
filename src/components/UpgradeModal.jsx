import { useState } from "react";
import { supabase } from "../lib/supabase";
import { openRazorpayCheckout, activateProPlan } from "../lib/payment";

const bg = "#F5F4F2";
const bgAlt = "#EFEDE8";
const card = "#FFFFFF";
const inkDark = "#151515";
const ink = "#0A0A0A";
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

const PLANS = {
  solo: {
    id: "solo",
    label: "Solo",
    price: "₹299/mo",
    razorpayPlan: "solo_monthly",
    badge: "Most Popular",
    features: [
      "Unlimited documents",
      "Unlimited eSignatures",
      "Remove FlowDocs branding",
      "5 templates",
      "Email support",
      "1 GB storage",
    ],
  },
  pro: {
    id: "pro",
    label: "Pro",
    price: "₹750/mo",
    razorpayPlan: "pro_monthly",
    badge: "Full Power",
    features: [
      "Everything in Solo",
      "AI document generator",
      "Custom branding + logo",
      "WhatsApp notifications",
      "Auto payment reminders",
      "Audit trail PDF",
      "10 GB storage",
      "Priority support",
    ],
  },
};

export default function UpgradeModal({ session, profile, onClose, onUpgraded }) {
  const [selectedPlan, setSelectedPlan] = useState("solo");
  const [billing, setBilling] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const plan = PLANS[selectedPlan];

  const getAmount = () => {
    if (selectedPlan === "solo") return billing === "annual" ? 2990 : 299;
    return billing === "annual" ? 7500 : 750;
  };

  const getLabel = () => {
    if (billing === "annual") {
      return selectedPlan === "solo" ? "₹2,990/yr" : "₹7,500/yr";
    }
    return plan.price;
  };

  const handleUpgrade = async () => {
    if (!session?.user) return;
    setLoading(true);
    setError("");

    try {
      await openRazorpayCheckout({
        user: { id: session.user.id, email: session.user.email, name: profile?.name },
        plan: plan.razorpayPlan,
        amount: getAmount(),
        onSuccess: async (response) => {
          const ok = await activateProPlan(supabase, session.user.id, response.razorpay_payment_id, selectedPlan);
          setLoading(false);
          if (ok) {
            setSuccess(true);
            setTimeout(() => { onUpgraded?.(); onClose?.(); }, 2500);
          } else {
            setError("Payment received but activation failed. Contact support@flowdocs.co.in");
          }
        },
        onFailure: (msg) => { setLoading(false); setError(msg); },
      });
    } catch {
      setError("Payment could not be initialized. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(10,10,10,0.55)", zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(10px)", padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: card, border: `1px solid ${line}`,
          borderRadius: 24, padding: "36px 32px", width: "100%", maxWidth: 540,
          maxHeight: "92vh", overflowY: "auto", position: "relative",
          boxShadow: "0 40px 80px -30px rgba(0,0,0,.4)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* gold glow */}
        <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 400, height: 240, borderRadius: "50%", background: `${goldSoft}18`, filter: "blur(70px)", pointerEvents: "none" }} />

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16, zIndex: 2,
            background: lineSoft, border: "none", color: inkMid,
            cursor: "pointer", fontSize: 18, width: 32, height: 32, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          ×
        </button>

        <div style={{ position: "relative" }}>
          {success ? (
            <div style={{ textAlign: "center", padding: "28px 0" }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: stampDim, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", color: stamp, fontSize: 30 }}>🎉</div>
              <div style={{ fontFamily: fontDisplay, fontSize: 28, fontWeight: 500, letterSpacing: "-.5px", color: ink, marginBottom: 10 }}>
                Welcome to <span style={{ fontStyle: "italic", color: gold }}>{plan.label}</span>
              </div>
              <div style={{ fontSize: 14, color: inkMid }}>All features are now unlocked.</div>
            </div>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{ fontFamily: fontMono, fontSize: 10.5, color: gold, fontWeight: 500, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 12 }}>§ Upgrade</div>
                <div style={{ fontFamily: fontDisplay, fontSize: 30, fontWeight: 500, letterSpacing: "-.6px", color: ink, lineHeight: 1.1 }}>
                  Choose what <span style={{ fontStyle: "italic", color: gold }}>fits</span> you
                </div>
              </div>

              {/* Billing toggle */}
              <div style={{
                display: "flex", background: bgAlt, borderRadius: 12,
                padding: 5, marginBottom: 22, border: `1px solid ${line}`,
              }}>
                {["monthly", "annual"].map((b) => (
                  <button
                    key={b}
                    onClick={() => setBilling(b)}
                    style={{
                      flex: 1, padding: "9px", borderRadius: 9, border: "none",
                      background: billing === b ? ink : "transparent",
                      color: billing === b ? "#fff" : inkMid,
                      fontFamily: fontMono, fontWeight: 500, fontSize: 11.5,
                      letterSpacing: ".1em", textTransform: "uppercase",
                      cursor: "pointer",
                      boxShadow: billing === b ? "0 6px 14px -6px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.14)" : "none",
                      transition: "all .3s cubic-bezier(.22,1,.36,1)",
                    }}
                  >
                    {b === "monthly" ? "Monthly" : "Annual · Save 17%"}
                  </button>
                ))}
              </div>

              {/* Plan selector */}
              <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                {Object.values(PLANS).map((p) => {
                  const sel = selectedPlan === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPlan(p.id)}
                      style={{
                        flex: 1, padding: "20px 16px", borderRadius: 16, cursor: "pointer",
                        border: `${sel ? 2 : 1}px solid ${sel ? ink : line}`,
                        background: sel ? bg : card,
                        transition: "all .3s cubic-bezier(.22,1,.36,1)", position: "relative",
                        boxShadow: sel ? "0 10px 24px -16px rgba(15,15,15,.3)" : "none",
                      }}
                    >
                      {p.badge && (
                        <div style={{
                          position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)",
                          background: sel ? ink : card,
                          color: sel ? "#fff" : inkMid,
                          fontSize: 9.5, fontWeight: 600, padding: "4px 12px",
                          borderRadius: 100, fontFamily: fontMono,
                          letterSpacing: ".14em", textTransform: "uppercase",
                          border: `1px solid ${sel ? ink : line}`,
                          whiteSpace: "nowrap",
                          boxShadow: sel ? "0 6px 14px -4px rgba(0,0,0,.3)" : "none",
                        }}>
                          {p.badge}
                        </div>
                      )}
                      <div style={{
                        fontFamily: fontDisplay, fontSize: 22, fontWeight: 500,
                        color: ink, marginBottom: 6, letterSpacing: "-.3px",
                      }}>
                        {p.label}
                      </div>
                      <div style={{
                        fontFamily: fontMono, fontSize: 12.5, letterSpacing: ".08em",
                        color: sel ? gold : inkMid, fontWeight: 500,
                      }}>
                        {billing === "annual"
                          ? p.id === "solo" ? "₹2,990/yr" : "₹7,500/yr"
                          : p.price}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Features list */}
              <div style={{ background: bgAlt, border: `1px solid ${line}`, borderRadius: 14, padding: "16px 18px", marginBottom: 22 }}>
                {plan.features.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "7px 0",
                      borderBottom: i < plan.features.length - 1 ? `1px solid ${line}` : "none",
                      fontSize: 13.5, color: inkMid,
                    }}
                  >
                    <span style={{ color: stamp, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>

              {error && (
                <div style={{
                  background: redDim, border: `1px solid ${red}40`,
                  borderRadius: 12, padding: "11px 15px",
                  fontSize: 13, color: red, marginBottom: 18,
                }}>
                  {error}
                </div>
              )}

              <button
                onClick={handleUpgrade}
                disabled={loading}
                style={{
                  width: "100%",
                  background: loading ? bgAlt : ink,
                  color: loading ? inkMid : "#fff",
                  border: "none", borderRadius: 14, padding: "15px",
                  fontSize: 14.5, fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: fontSans,
                  boxShadow: loading ? "none" : "0 14px 30px -12px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.14)",
                  outline: loading ? "none" : "1px solid rgba(0,0,0,.3)", outlineOffset: -1,
                  transition: "all .3s cubic-bezier(.22,1,.36,1)",
                }}
              >
                {loading ? "Opening payment…" : `Upgrade to ${plan.label} — ${getLabel()} →`}
              </button>

              <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 16, flexWrap: "wrap" }}>
                {["🔒 Secure", "↩ Cancel anytime", "📧 Invoice provided"].map((t, i) => (
                  <span key={i} style={{ fontFamily: fontMono, fontSize: 10.5, color: inkFaint, letterSpacing: ".1em", textTransform: "uppercase" }}>{t}</span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
