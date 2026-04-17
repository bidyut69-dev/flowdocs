import { useState } from "react";
import { supabase } from "../lib/supabase";
import { openRazorpayCheckout, activateProPlan } from "../lib/payment";

const C = {
  bg: "#0C0C0E", surface: "#141416", surface2: "#1C1C1F", border: "#2A2A2E",
  gold: "#F5A623", goldDim: "#F5A62318", text: "#F0EEE8", dim: "#7A7875",
  mid: "#B0ADA8", green: "#22C55E", greenDim: "#22C55E20", red: "#EF4444",
};

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

  // Returns amount in paise (Razorpay expects paise)
  const getAmount = () => {
    if (selectedPlan === "solo") return billing === "annual" ? 299000 : 29900;
    return billing === "annual" ? 750000 : 75000;
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
        user: {
          id: session.user.id,
          email: session.user.email,
          name: profile?.name,
        },
        plan: plan.razorpayPlan,
        amount: getAmount(), // ✅ fixed: was declared but never used
        onSuccess: async (response) => {
          const ok = await activateProPlan(
            supabase,
            session.user.id,
            response.razorpay_payment_id,
            selectedPlan  // "solo" ya "pro" — sahi naam pass karo
          );
          setLoading(false);
          if (ok) {
            setSuccess(true);
            setTimeout(() => {
              onUpgraded?.();
              onClose?.();
            }, 2500);
          } else {
            setError(
              "Payment received but activation failed. Contact support@flowdocs.co.in"
            );
          }
        },
        onFailure: (msg) => {
          setLoading(false);
          setError(msg);
        },
      });
    } catch {
      // openRazorpayCheckout threw unexpectedly (e.g. script load failure)
      setError("Payment could not be initialized. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(6px)", padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: C.surface, border: `1px solid ${C.gold}`,
          borderRadius: 20, padding: "32px 28px", width: "100%", maxWidth: 500,
          maxHeight: "92vh", overflowY: "auto", position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gold top bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: C.gold, borderRadius: "20px 20px 0 0",
        }} />

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 14, right: 16,
            background: "none", border: "none", color: C.dim,
            cursor: "pointer", fontSize: 22,
          }}
        >
          ×
        </button>

        {success ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{
              fontFamily: "'Syne', sans-serif", fontSize: 22,
              fontWeight: 800, color: C.green, marginBottom: 8,
            }}>
              Welcome to {plan.label}!
            </div>
            <div style={{ fontSize: 14, color: C.mid }}>All features are now unlocked.</div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{
                fontSize: 11, color: C.gold, letterSpacing: 2,
                fontFamily: "'DM Mono', monospace", marginBottom: 8,
              }}>
                UPGRADE YOUR PLAN
              </div>
              <div style={{
                fontFamily: "'Syne', sans-serif", fontSize: 22,
                fontWeight: 800, color: C.text,
              }}>
                Choose what fits you
              </div>
            </div>

            {/* Billing toggle */}
            <div style={{
              display: "flex", background: C.surface2, borderRadius: 10,
              padding: 4, marginBottom: 20,
            }}>
              {["monthly", "annual"].map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  style={{
                    flex: 1, padding: "8px", borderRadius: 7, border: "none",
                    background: billing === b ? C.gold : "transparent",
                    color: billing === b ? "#0C0C0E" : C.dim,
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 700, fontSize: 13, cursor: "pointer",
                  }}
                >
                  {b === "monthly" ? "Monthly" : "Annual (Save 17%)"}
                </button>
              ))}
            </div>

            {/* Plan selector */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              {Object.values(PLANS).map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  style={{
                    flex: 1, padding: "16px 14px", borderRadius: 12, cursor: "pointer",
                    border: `2px solid ${selectedPlan === p.id ? C.gold : C.border}`,
                    background: selectedPlan === p.id ? C.goldDim : C.surface2,
                    transition: "all 0.15s", position: "relative",
                  }}
                >
                  {p.badge && (
                    <div style={{
                      position: "absolute", top: -10, left: "50%",
                      transform: "translateX(-50%)",
                      background: selectedPlan === p.id ? C.gold : C.border,
                      color: selectedPlan === p.id ? "#0C0C0E" : C.dim,
                      fontSize: 9, fontWeight: 700, padding: "2px 10px",
                      borderRadius: 10, fontFamily: "'DM Mono', monospace",
                      whiteSpace: "nowrap",
                    }}>
                      {p.badge}
                    </div>
                  )}
                  <div style={{
                    fontFamily: "'Syne', sans-serif", fontSize: 18,
                    fontWeight: 800,
                    color: selectedPlan === p.id ? C.gold : C.text,
                    marginBottom: 4,
                  }}>
                    {p.label}
                  </div>
                  <div style={{
                    fontSize: 14,
                    color: selectedPlan === p.id ? C.gold : C.mid,
                    fontFamily: "'DM Mono', monospace",
                  }}>
                    {billing === "annual"
                      ? p.id === "solo" ? "₹2,990/yr" : "₹7,500/yr"
                      : p.price}
                  </div>
                </div>
              ))}
            </div>

            {/* Features list */}
            <div style={{ marginBottom: 20 }}>
              {plan.features.map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "7px 0",
                    borderBottom: i < plan.features.length - 1 ? `1px solid ${C.border}` : "none",
                    fontSize: 13.5, color: C.mid,
                  }}
                >
                  <span style={{ color: C.green, fontSize: 12, flexShrink: 0 }}>✓</span>
                  {f}
                </div>
              ))}
            </div>

            {/* Error message */}
            {error && (
              <div style={{
                background: "#EF444420", border: "1px solid #EF4444",
                borderRadius: 8, padding: "10px 14px",
                fontSize: 13, color: "#EF4444", marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            {/* CTA button */}
            <button
              onClick={handleUpgrade}
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? C.surface2 : C.gold,
                color: loading ? C.dim : "#0C0C0E",
                border: "none", borderRadius: 10, padding: "14px",
                fontSize: 15, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {loading
                ? "Opening payment..."
                : `Upgrade to ${plan.label} — ${getLabel()} →`}
            </button>

            {/* Trust badges */}
            <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 14 }}>
              {["🔒 Secure", "↩ Cancel anytime", "📧 Invoice provided"].map((t, i) => (
                <span key={i} style={{ fontSize: 11, color: C.dim }}>{t}</span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}