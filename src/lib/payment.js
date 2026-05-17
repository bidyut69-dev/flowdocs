// ── FlowDocs payment.js ──────────────────────────────────────────────────────
// Razorpay checkout + Supabase pro activation

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

// ── Load Razorpay script dynamically ────────────────────────────────────────
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ── Open Razorpay Checkout ───────────────────────────────────────────────────
export async function openRazorpayCheckout({ user, plan, amount, onSuccess, onFailure }) {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    onFailure("Payment gateway load nahi hua. Internet check karo.");
    return;
  }

  const options = {
    key: RAZORPAY_KEY,
    amount,                          // paise mein — e.g. 29900 = ₹299
    currency: "INR",
    name: "FlowDocs",
    description: `${plan} Plan Subscription`,
    image: "https://flowdocs.co.in/favicon-32x32.png",
    prefill: {
      name: user.name || "",
      email: user.email || "",
    },
    theme: {
      color: "#F5A623",
    },
    modal: {
      ondismiss: () => {
        onFailure("Payment cancelled.");
      },
    },
    handler: function (response) {
      // response = { razorpay_payment_id, razorpay_order_id, razorpay_signature }
      onSuccess(response);
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.on("payment.failed", function (response) {
    onFailure(response.error?.description || "Payment failed.");
  });
  rzp.open();
}

// ── Activate Pro Plan in Supabase ────────────────────────────────────────────
export async function activateProPlan(supabase, userId, paymentId, planName) {
  try {
    // 1. Payment record save karo
    const { error: paymentError } = await supabase
      .from("payments")
      .insert({
        user_id: userId,
        razorpay_payment_id: paymentId,
        amount: planName === "solo" ? 299 : 750,
        currency: "INR",
        plan: planName,
        status: "success",
      });

    if (paymentError) {
      // Duplicate payment — already activated
      if (paymentError.code === "23505") return true;
      console.error("Payment insert error:", paymentError);
    }

    // 2. Profile mein plan update karo
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ plan: planName })
      .eq("id", userId);

    if (profileError) {
      console.error("Profile update error:", profileError);
      return false;
    }

    return true;
  } catch (err) {
    console.error("activateProPlan error:", err);
    return false;
  }
}

// ── Check if user is Pro ─────────────────────────────────────────────────────
export async function getUserPlan(supabase, userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();

  if (error) return "free";
  return data?.plan || "free";
}

// ── Manual Pro Upgrade (admin use) ───────────────────────────────────────────
// Jab koi directly pay kare aur webhook na ho
// Supabase SQL Editor mein run karo:
// update profiles set plan = 'pro' where email = 'user@email.com';