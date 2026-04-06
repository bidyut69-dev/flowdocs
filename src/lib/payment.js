// ── Razorpay Payment Integration ─────────────────────────────────────
// Free plan → Pro plan upgrade flow
// Razorpay free account: razorpay.com → Sign up → Get API keys

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

// Load Razorpay script dynamically
function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ── Main payment function ─────────────────────────────────────────────
export async function openRazorpayCheckout({ user, plan = "pro_monthly", onSuccess, onFailure }) {
  const loaded = await loadRazorpay();
  if (!loaded) {
    onFailure?.("Payment gateway failed to load. Check your internet connection.");
    return;
  }

  const plans = {
    pro_monthly: { amount: 75000, currency: "INR", label: "Pro Monthly", desc: "FlowDocs Pro — Monthly Plan" },
    pro_annual:  { amount: 750000, currency: "INR", label: "Pro Annual", desc: "FlowDocs Pro — Annual Plan (2 months free)" },
    // USD for international (amount in paise/cents × 100)
    pro_monthly_usd: { amount: 900, currency: "USD", label: "Pro Monthly", desc: "FlowDocs Pro — Monthly Plan" },
  };

  const selected = plans[plan] || plans.pro_monthly;

  // NOTE: In production, create order_id from your backend/Supabase Edge Function
  // For now, we use Razorpay's client-side flow (works for testing)
  const options = {
    key: RAZORPAY_KEY,
    amount: selected.amount,         // in paise (₹750 = 75000 paise)
    currency: selected.currency,
    name: "FlowDocs",
    description: selected.desc,
    image: "/android-chrome-192x192.png",

    // Prefill user info
    prefill: {
      name: user?.name || "",
      email: user?.email || "",
    },

    notes: {
      user_id: user?.id || "",
      plan: plan,
    },

    theme: {
      color: "#F5A623",
      backdrop_color: "rgba(12, 12, 14, 0.85)",
    },

    modal: {
      backdropclose: false,
      escape: true,
      animation: true,
    },

    // ── Success handler ──
    handler: async function (response) {
      // response = { razorpay_payment_id, razorpay_order_id, razorpay_signature }
      console.log("Payment success:", response.razorpay_payment_id);

      // TODO: Verify payment on backend (Supabase Edge Function)
      // For now, update plan in Supabase directly
      onSuccess?.(response);
    },
  };

  const rzp = new window.Razorpay(options);

  rzp.on("payment.failed", function (response) {
    console.error("Payment failed:", response.error);
    onFailure?.(response.error.description || "Payment failed. Please try again.");
  });

  rzp.open();
}

// ── Update user plan in Supabase after payment ───────────────────────
export async function activateProPlan(supabase, userId, paymentId) {
  const { error } = await supabase
    .from("profiles")
    .update({
      plan: "pro",
      plan_activated_at: new Date().toISOString(),
      razorpay_payment_id: paymentId,
    })
    .eq("id", userId);

  return !error;
}
