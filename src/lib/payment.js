// ── Razorpay Payment Integration ─────────────────────────────────────
// Handles: 1) Pro plan upgrade  2) Invoice payment from client

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

// ── 1. Pro Plan Upgrade ───────────────────────────────────────────────
export async function openRazorpayCheckout({ user, plan = "pro_monthly", onSuccess, onFailure }) {
  const loaded = await loadRazorpay();
  if (!loaded) return onFailure?.("Payment gateway failed to load.");

  const plans = {
    pro_monthly:     { amount: 75000,  currency: "INR", desc: "FlowDocs Pro — Monthly (₹750/mo)" },
    pro_annual:      { amount: 750000, currency: "INR", desc: "FlowDocs Pro — Annual (₹7,500/yr)" },
    pro_monthly_usd: { amount: 900,    currency: "USD", desc: "FlowDocs Pro — Monthly ($9/mo)" },
  };

  const selected = plans[plan] || plans.pro_monthly;

  const options = {
    key: RAZORPAY_KEY,
    amount: selected.amount,
    currency: selected.currency,
    name: "FlowDocs",
    description: selected.desc,
    image: "/android-chrome-192x192.png",
    prefill: { name: user?.name || "", email: user?.email || "" },
    notes: { user_id: user?.id || "", plan, type: "subscription" },
    theme: { color: "#F5A623" },
    modal: { backdropclose: false, escape: true, animation: true },
    handler: async (response) => onSuccess?.(response),
  };

  const rzp = new window.Razorpay(options);
  rzp.on("payment.failed", (r) => onFailure?.(r.error.description || "Payment failed."));
  rzp.open();
}

// ── 2. Invoice Payment (Client pays freelancer) ───────────────────────
export async function openInvoicePayment({ invoice, clientName, clientEmail, onSuccess, onFailure }) {
  const loaded = await loadRazorpay();
  if (!loaded) return onFailure?.("Payment gateway failed to load.");

  if (!RAZORPAY_KEY) return onFailure?.("Payment not configured.");

  // Amount in paise (INR) or cents (USD)
  const currency = invoice.currency || "INR";
  const amount = currency === "INR"
    ? Math.round((invoice.amount || 0) * 100)
    : Math.round((invoice.amount || 0) * 100);

  if (amount <= 0) return onFailure?.("Invalid invoice amount.");

  const options = {
    key: RAZORPAY_KEY,
    amount,
    currency,
    name: "FlowDocs Invoice",
    description: invoice.title,
    image: "/android-chrome-192x192.png",
    prefill: {
      name: clientName || "",
      email: clientEmail || "",
    },
    notes: {
      document_id: invoice.id,
      type: "invoice_payment",
    },
    theme: { color: "#F5A623" },
    modal: { backdropclose: false, escape: true, animation: true },
    handler: async (response) => onSuccess?.(response),
  };

  const rzp = new window.Razorpay(options);
  rzp.on("payment.failed", (r) => onFailure?.(r.error.description || "Payment failed."));
  rzp.open();
}

// ── Update pro plan after payment ────────────────────────────────────
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

// ── Mark invoice as paid after client payment ─────────────────────────
export async function markInvoicePaid(supabase, documentId, paymentId) {
  const { error } = await supabase
    .from("documents")
    .update({
      status: "paid",
      razorpay_payment_id: paymentId,
      paid_at: new Date().toISOString(),
    })
    .eq("id", documentId);
  return !error;
}