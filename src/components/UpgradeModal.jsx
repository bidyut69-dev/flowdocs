import { useState } from "react";
import { supabase } from "../lib/supabase";
import { openRazorpayCheckout, activateProPlan } from "../lib/payment";

const C = {
  bg: "#0C0C0E", surface: "#141416", surface2: "#1C1C1F", border: "#2A2A2E",
  gold: "#F5A623", goldDim: "#F5A62318", text: "#F0EEE8", dim: "#7A7875",
  mid: "#B0ADA8", green: "#22C55E", greenDim: "#22C55E20", red: "#EF4444",
};

const PRO_FEATURES = [
  "Unlimited documents & eSignatures",
  "Custom branding + your logo",
  "Multiple signers per document",
  "WhatsApp notifications",
  "Payment reminders",
  "10 GB document storage",
  "Priority email support",
];

export default function UpgradeModal({ session, profile, onClose, onUpgraded }) {
  const [plan, setPlan] = useState("pro_monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleUpgrade = async () => {
    if (!session?.user) return;
    setLoading(true);
    setError("");

    await openRazorpayCheckout({
      user: { id: session.user.id, email: session.user.email, name: profile?.name },
      plan,
      onSuccess: async (response) => {
        const ok = await activateProPlan(supabase, session.user.id, response.razorpay_payment_id);
        setLoading(false);
        if (ok) {
          setSuccess(true);
          setTimeout(() => { onUpgraded?.(); onClose?.(); }, 2500);
        } else {
          setError("Payment received but activation failed. Contact support@flowdocs.app");
        }
      },
      onFailure: (msg) => {
        setLoading(false);
        setError(msg);
      },
    });

    setLoading(false);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(6px)", padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: C.surface, border: `1px solid ${C.gold}`,
        borderRadius: 20, padding: "36px 32px", width: "100%", maxWidth: 480,
        position: "relative", overflow: "hidden",
      }} onClick={e => e.stopPropagation()}>

        {/* Gold top bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: C.gold }} />

        {/* Close */}
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16, background: "none", border: "none",
          color: C.dim, cursor: "pointer", fontSize: 20, lineHeight: 1,
        }}>×</button>

        {success ? (
          // ── Success state ──
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: C.green, marginBottom: 8 }}>
              Welcome to Pro!
            </div>
            <div style={{ fontSize: 14, color: C.mid, lineHeight: 1.7 }}>
              Your account has been upgraded. All Pro features are now unlocked.
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 11, color: C.gold, letterSpacing: 2, fontFamily: "'DM Mono', monospace", marginBottom: 10 }}>UPGRADE TO PRO</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 8 }}>
                Unlock everything
              </div>
              <div style={{ fontSize: 13, color: C.mid }}>vs DocuSign at $30+/month</div>
            </div>

            {/* Plan toggle */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24, background: C.surface2, borderRadius: 10, padding: 4 }}>
              {[
                { id: "pro_monthly", label: "Monthly", price: "₹750/mo" },
                { id: "pro_annual", label: "Annual", price: "₹7,500/yr", badge: "Save 17%" },
              ].map(p => (
                <button key={p.id} onClick={() => setPlan(p.id)} style={{
                  flex: 1, padding: "10px 8px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: plan === p.id ? C.gold : "transparent",
                  color: plan === p.id ? "#0C0C0E" : C.mid,
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13,
                  transition: "all 0.15s", position: "relative",
                }}>
                  {p.label}
                  <span style={{ display: "block", fontSize: 11, fontWeight: 400, marginTop: 2, opacity: 0.85 }}>{p.price}</span>
                  {p.badge && plan === p.id && (
                    <span style={{
                      position: "absolute", top: -8, right: -4,
                      background: C.green, color: "#fff", fontSize: 9, fontWeight: 700,
                      padding: "2px 6px", borderRadius: 10,
                    }}>{p.badge}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Features */}
            <div style={{ marginBottom: 24 }}>
              {PRO_FEATURES.map((f, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 0", borderBottom: i < PRO_FEATURES.length - 1 ? `1px solid ${C.border}` : "none",
                  fontSize: 13.5, color: C.mid,
                }}>
                  <span style={{ color: C.green, fontSize: 13, flexShrink: 0 }}>✓</span> {f}
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: "#EF444420", border: `1px solid ${C.red}`, borderRadius: 8,
                padding: "10px 14px", fontSize: 13, color: C.red, marginBottom: 16,
              }}>{error}</div>
            )}

            {/* CTA */}
            <button onClick={handleUpgrade} disabled={loading} style={{
              width: "100%", background: loading ? C.surface2 : C.gold,
              color: loading ? C.dim : "#0C0C0E", border: "none", borderRadius: 10,
              padding: "14px", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
            }}>
              {loading ? "Opening payment..." : `Upgrade to Pro — ${plan === "pro_monthly" ? "₹750/mo" : "₹7,500/yr"} →`}
            </button>

            <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 16 }}>
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
