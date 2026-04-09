// ── Reminder System ───────────────────────────────────────────────────
// Triggers:
// 1. Proposal not opened in 24h → reminder email
// 2. Opened but not signed in 48h → follow-up
// 3. Invoice not paid in 3 days → payment reminder
//
// Implementation: Supabase Edge Function (runs as cron job)
// Deploy: supabase functions deploy reminders

// ── SUPABASE EDGE FUNCTION CODE ───────────────────────────────────────
// Save this as: supabase/functions/reminders/index.ts
// Then run: supabase functions deploy reminders
// Set cron: supabase functions schedule reminders --cron "0 9 * * *"

export const REMINDER_EDGE_FUNCTION = `
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const RESEND_KEY = Deno.env.get("RESEND_API_KEY")!;

async function sendEmail(to, subject, html) {
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: \`Bearer \${RESEND_KEY}\` },
    body: JSON.stringify({ from: "FlowDocs <reminders@flowdocs.co.in>", to: [to], subject, html }),
  });
}

Deno.serve(async () => {
  const now = new Date();
  const h24 = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const h48 = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
  const d3  = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();

  // 1. Proposals not opened in 24h
  const { data: notOpened } = await supabase
    .from("documents")
    .select("*, clients(name, email), profiles(name, email)")
    .eq("status", "pending")
    .eq("type", "Proposal")
    .lt("updated_at", h24)
    .is("opened_at", null);

  for (const doc of notOpened || []) {
    if (!doc.clients?.email) continue;
    await sendEmail(
      doc.clients.email,
      \`Reminder: \${doc.profiles?.name} sent you a proposal to review\`,
      \`<div style="font-family:sans-serif;background:#0C0C0E;color:#F0EEE8;padding:40px;max-width:520px;margin:0 auto;border-radius:12px;">
        <div style="color:#F5A623;font-size:20px;font-weight:800;margin-bottom:16px;">⚡ FlowDocs</div>
        <h2 style="color:#F0EEE8;">Hi \${doc.clients.name},</h2>
        <p style="color:#B0ADA8">Just a friendly reminder — <strong style="color:#F0EEE8">\${doc.profiles?.name}</strong> sent you a proposal that's waiting for your review.</p>
        <div style="background:#141416;border:1px solid #2A2A2E;border-radius:10px;padding:20px;margin:20px 0;">
          <div style="color:#F5A623;font-size:11px;letter-spacing:1px;margin-bottom:6px;">PROPOSAL</div>
          <div style="color:#F0EEE8;font-size:16px;font-weight:700;">\${doc.title}</div>
        </div>
        <a href="\${Deno.env.get("SITE_URL")}/sign/\${doc.sign_token}" style="display:inline-block;background:#F5A623;color:#0C0C0E;padding:14px 28px;border-radius:8px;font-weight:700;text-decoration:none;">View Proposal →</a>
      </div>\`
    );
    await supabase.from("reminder_log").insert({ document_id: doc.id, type: "proposal_not_opened" });
  }

  // 2. Opened but not signed in 48h
  const { data: notSigned } = await supabase
    .from("documents")
    .select("*, clients(name, email), profiles(name, email)")
    .eq("status", "pending")
    .eq("type", "Proposal")
    .not("opened_at", "is", null)
    .lt("opened_at", h48);

  for (const doc of notSigned || []) {
    if (!doc.clients?.email) continue;
    await sendEmail(
      doc.clients.email,
      \`Still interested? Your proposal is waiting\`,
      \`<div style="font-family:sans-serif;background:#0C0C0E;color:#F0EEE8;padding:40px;max-width:520px;margin:0 auto;border-radius:12px;">
        <div style="color:#F5A623;font-size:20px;font-weight:800;margin-bottom:16px;">⚡ FlowDocs</div>
        <h2 style="color:#F0EEE8;">Hi \${doc.clients.name},</h2>
        <p style="color:#B0ADA8">You viewed the proposal from <strong style="color:#F0EEE8">\${doc.profiles?.name}</strong> but haven't signed yet. Ready to move forward?</p>
        <a href="\${Deno.env.get("SITE_URL")}/sign/\${doc.sign_token}" style="display:inline-block;background:#F5A623;color:#0C0C0E;padding:14px 28px;border-radius:8px;font-weight:700;text-decoration:none;margin-top:16px;">Sign Now →</a>
      </div>\`
    );
    await supabase.from("reminder_log").insert({ document_id: doc.id, type: "proposal_not_signed" });
  }

  // 3. Invoice overdue (3 days)
  const { data: overdueInvoices } = await supabase
    .from("documents")
    .select("*, clients(name, email), profiles(name, email)")
    .eq("status", "pending")
    .eq("type", "Invoice")
    .lt("updated_at", d3);

  for (const doc of overdueInvoices || []) {
    if (!doc.clients?.email) continue;
    // Mark as overdue
    await supabase.from("documents").update({ status: "overdue" }).eq("id", doc.id);
    // Notify freelancer
    if (doc.profiles?.email) {
      await sendEmail(
        doc.profiles.email,
        \`Invoice overdue: \${doc.clients.name} hasn't paid yet\`,
        \`<div style="font-family:sans-serif;background:#0C0C0E;color:#F0EEE8;padding:40px;max-width:520px;border-radius:12px;margin:0 auto;">
          <div style="color:#F5A623;font-size:20px;font-weight:800;margin-bottom:16px;">⚡ FlowDocs</div>
          <div style="background:#EF444420;border:1px solid #EF4444;border-radius:10px;padding:20px;margin-bottom:16px;">
            <div style="color:#EF4444;font-weight:700;font-size:15px;">⚠️ Invoice Overdue</div>
            <div style="color:#B0ADA8;margin-top:6px;">\${doc.clients.name} hasn't paid <strong style="color:#F0EEE8">\${doc.title}</strong> (3 days overdue)</div>
          </div>
          <a href="\${Deno.env.get("SITE_URL")}/dashboard" style="display:inline-block;background:#F5A623;color:#0C0C0E;padding:14px 28px;border-radius:8px;font-weight:700;text-decoration:none;">View Dashboard →</a>
        </div>\`
      );
    }
    await supabase.from("reminder_log").insert({ document_id: doc.id, type: "invoice_overdue" });
  }

  return new Response(JSON.stringify({
    notOpened: notOpened?.length,
    notSigned: notSigned?.length,
    overdue: overdueInvoices?.length
  }), { headers: { "Content-Type": "application/json" } });
});
`;

// ── Client-side: Manual reminder trigger ─────────────────────────────
import { sendSigningEmail } from "./email";

export async function sendManualReminder({ doc, client, profile, showToast }) {
  if (!client?.email) {
    showToast?.("Add client email first", false);
    return false;
  }
  const signingUrl = `${window.location.origin}/sign/${doc.sign_token}`;
  const ok = await sendSigningEmail({
    to: client.email,
    clientName: client.name,
    docTitle: doc.title,
    signingUrl,
    fromName: profile?.name || "FlowDocs User",
  });
  return ok;
}