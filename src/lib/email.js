// src/lib/email.js
// Calls existing Supabase Edge Function — no CORS issues

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function callEdge(type, to, data) {
  try {
    const res = await fetch(EDGE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({ type, to, data }),
    });
    return res.ok;
  } catch (err) {
    console.error("Edge function error:", err);
    return false;
  }
}

// Document signing request
export async function sendSigningEmail({ to, clientName, docTitle, signingUrl, fromName, amount }) {
  return callEdge("signing_request", to, {
    clientName,
    docTitle,
    signingUrl,
    fromName,
    amount,
  });
}

// Reminder to sign (reuses signing_request type)
export async function sendReminderEmail({
  to, clientName, docTitle, signingUrl, fromName,
  amount, dueDate, isInvoice = false,
  upiId, bankName, bankAccount, bankIfsc,
}) {
  if (isInvoice) {
    return callEdge("payment_reminder", to, {
      clientName,
      docTitle,
      amount,
      dueDate,
      paymentUrl: signingUrl,
      upiId,
      bankName,
      bankAccount,
      bankIfsc,
    });
  }
  return callEdge("signing_request", to, {
    clientName,
    docTitle,
    signingUrl,
    fromName,
    amount,
  });
}

// Notify freelancer that client signed
export async function sendSignedConfirmation({ to, ownerName, clientName, docTitle }) {
  return callEdge("signed_confirmation", to, {
    ownerName,
    clientName,
    docTitle,
  });
}

// Notify freelancer that payment received
export async function sendPaymentReceived({ to, ownerName, clientName, docTitle, amount, currency = "INR" }) {
  const symbols = { INR: "₹", USD: "$", EUR: "€", GBP: "£", AED: "AED ", CAD: "CA$", AUD: "A$", SGD: "S$" };
  const sym = symbols[currency] || "₹";
  const fmtAmt = `${sym}${Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  return callEdge("payment_received", to, {
    ownerName,
    clientName,
    docTitle,
    amount: fmtAmt,
  });
}