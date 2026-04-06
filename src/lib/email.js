// Email sending via Resend API
// NOTE: In production, move this to a Supabase Edge Function to hide the API key

export async function sendSigningEmail({ to, clientName, docTitle, signingUrl, fromName }) {
  const key = import.meta.env.VITE_RESEND_API_KEY;
  if (!key) { console.warn("No Resend API key"); return false; }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      from: "FlowDocs <onboarding@resend.dev>",
      to: [to],
      subject: `${fromName} sent you a document to sign: ${docTitle}`,
      html: `
        <div style="font-family: sans-serif; background: #0C0C0E; color: #F0EEE8; padding: 40px; max-width: 520px; margin: 0 auto; border-radius: 12px;">
          <div style="color: #F5A623; font-size: 22px; font-weight: 800; margin-bottom: 8px;">⚡ FlowDocs</div>
          <p style="color: #7A7875; font-size: 13px; margin-bottom: 28px;">Document Signing Request</p>
          <h2 style="color: #F0EEE8; margin-bottom: 12px;">Hi ${clientName},</h2>
          <p style="color: #B0ADA8; line-height: 1.7; margin-bottom: 24px;">
            <strong style="color: #F0EEE8;">${fromName}</strong> has sent you a document that requires your signature:
          </p>
          <div style="background: #141416; border: 1px solid #2A2A2E; border-radius: 10px; padding: 20px; margin-bottom: 28px;">
            <div style="color: #F5A623; font-size: 12px; letter-spacing: 1px; margin-bottom: 6px;">DOCUMENT</div>
            <div style="color: #F0EEE8; font-size: 16px; font-weight: 700;">${docTitle}</div>
          </div>
          <a href="${signingUrl}" style="display: inline-block; background: #F5A623; color: #0C0C0E; padding: 14px 28px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 15px;">
            View & Sign Document →
          </a>
          <p style="color: #7A7875; font-size: 11px; margin-top: 32px;">
            This link is unique to you. Please do not share it. Powered by FlowDocs.
          </p>
        </div>
      `,
    }),
  });

  return res.ok;
}

export async function sendSignedConfirmation({ to, ownerName, clientName, docTitle }) {
  const key = import.meta.env.VITE_RESEND_API_KEY;
  if (!key) return false;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      from: "FlowDocs <onboarding@resend.dev>",
      to: [to],
      subject: `✓ ${clientName} signed "${docTitle}"`,
      html: `
        <div style="font-family: sans-serif; background: #0C0C0E; color: #F0EEE8; padding: 40px; max-width: 520px; margin: 0 auto; border-radius: 12px;">
          <div style="color: #F5A623; font-size: 22px; font-weight: 800; margin-bottom: 24px;">⚡ FlowDocs</div>
          <div style="background: #22C55E20; border: 1px solid #22C55E; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
            <div style="color: #22C55E; font-weight: 700; font-size: 16px; margin-bottom: 6px;">✓ Document Signed!</div>
            <div style="color: #B0ADA8;">${clientName} has signed <strong style="color: #F0EEE8;">${docTitle}</strong>.</div>
          </div>
          <p style="color: #B0ADA8;">Hi ${ownerName}, your document has been signed. Log in to FlowDocs to download the signed PDF.</p>
        </div>
      `,
    }),
  });
}
