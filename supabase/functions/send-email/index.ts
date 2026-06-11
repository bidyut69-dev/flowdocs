// @ts-nocheck
// Supabase Edge Function — Email sender (server-side, key hidden)
// Deploy: supabase functions deploy send-email
// Set secret: supabase secrets set RESEND_API_KEY=re_xxxx

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = "FlowDocs <support@flowdocs.co.in>";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { type, to, data } = await req.json();
    let subject = "", html = "";
    const uid = crypto.randomUUID().slice(0, 8);

    if (type === "signing_request") {
      subject = `${data.fromName} sent you a document: ${data.docTitle} [#${uid}]`;
      html = `<div style="font-family:sans-serif;background:#0C0C0E;color:#F0EEE8;padding:40px;max-width:520px;margin:0 auto;border-radius:12px;">
        <div style="color:#F5A623;font-size:22px;font-weight:800;margin-bottom:8px;">⚡ FlowDocs</div>
        <h2 style="color:#F0EEE8;margin-bottom:12px;">Hi ${data.clientName},</h2>
        <p style="color:#B0ADA8;line-height:1.7;margin-bottom:24px;"><strong style="color:#F0EEE8;">${data.fromName}</strong> sent you a document to sign:</p>
        <div style="background:#141416;border:1px solid #2A2A2E;border-radius:10px;padding:20px;margin-bottom:28px;">
          <div style="color:#F5A623;font-size:12px;margin-bottom:6px;">DOCUMENT</div>
          <div style="color:#F0EEE8;font-size:16px;font-weight:700;">${data.docTitle}</div>
          ${data.amount ? `<div style="color:#F5A623;margin-top:8px;font-size:14px;">${data.amount}</div>` : ""}
        </div>
        <a href="${data.signingUrl}" style="display:inline-block;background:#F5A623;color:#0C0C0E;padding:14px 28px;border-radius:8px;font-weight:700;text-decoration:none;">View & Sign →</a>
        <div style="color:#3A3A3E;font-size:10px;margin-top:24px;">ref: ${uid}</div>
      </div>`;
    } else if (type === "signed_confirmation") {
      subject = `✓ ${data.clientName} signed "${data.docTitle}"`;
      html = `<div style="font-family:sans-serif;background:#0C0C0E;color:#F0EEE8;padding:40px;max-width:520px;margin:0 auto;border-radius:12px;">
        <div style="color:#F5A623;font-size:22px;font-weight:800;margin-bottom:24px;">⚡ FlowDocs</div>
        <div style="background:#22C55E20;border:1px solid #22C55E;border-radius:10px;padding:20px;margin-bottom:24px;">
          <div style="color:#22C55E;font-weight:700;font-size:16px;margin-bottom:6px;">✓ Signed!</div>
          <div style="color:#B0ADA8;">${data.clientName} signed <strong style="color:#F0EEE8;">${data.docTitle}</strong></div>
        </div>
        <a href="https://flowdocs.co.in/dashboard" style="display:inline-block;background:#F5A623;color:#0C0C0E;padding:12px 24px;border-radius:8px;font-weight:700;text-decoration:none;">Go to Dashboard →</a>
      </div>`;
    } else if (type === "payment_reminder") {
      subject = `Reminder: Invoice pending — ${data.docTitle}`;
      html = `<div style="font-family:sans-serif;background:#0C0C0E;color:#F0EEE8;padding:40px;max-width:520px;margin:0 auto;border-radius:12px;">
        <div style="color:#F5A623;font-size:22px;font-weight:800;margin-bottom:16px;">⚡ FlowDocs</div>
        <h2 style="color:#F0EEE8;margin-bottom:12px;">Hi ${data.clientName},</h2>
        <p style="color:#B0ADA8;line-height:1.7;margin-bottom:24px;">Invoice pending payment:</p>
        <div style="background:#141416;border:1px solid #EF4444;border-radius:10px;padding:20px;margin-bottom:28px;">
          <div style="color:#F0EEE8;font-size:15px;font-weight:700;">${data.docTitle}</div>
          <div style="color:#F5A623;font-size:22px;font-weight:800;margin-top:8px;">${data.amount}</div>
          ${data.dueDate ? `<div style="color:#EF4444;font-size:12px;margin-top:6px;">Due: ${data.dueDate}</div>` : ""}
        </div>
        <a href="${data.paymentUrl}" style="display:inline-block;background:#F5A623;color:#0C0C0E;padding:14px 28px;border-radius:8px;font-weight:700;text-decoration:none;">Pay Now →</a>
      </div>`;
    } else if (type === "payment_received") {
      subject = `✓ Payment received — ${data.docTitle}`;
      html = `<div style="font-family:sans-serif;background:#0C0C0E;color:#F0EEE8;padding:40px;max-width:520px;margin:0 auto;border-radius:12px;">
        <div style="color:#F5A623;font-size:22px;font-weight:800;margin-bottom:24px;">⚡ FlowDocs</div>
        <div style="background:#22C55E20;border:1px solid #22C55E;border-radius:10px;padding:20px;">
          <div style="color:#22C55E;font-weight:700;font-size:18px;">💰 Payment Received!</div>
          <div style="color:#B0ADA8;margin-top:8px;">${data.docTitle} — <strong style="color:#F0EEE8;">${data.amount}</strong></div>
        </div>
      </div>`;
    }

    if (!subject) return new Response(JSON.stringify({ error: "Unknown type" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_KEY}` },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    });

    return new Response(JSON.stringify({ ok: res.ok }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});