// ── Google Gemini AI Integration ─────────────────────────────────────
// Uses Supabase Edge Function — GEMINI_API_KEY stays server-side
// Edge Function: supabase/functions/ai-generate/index.ts

import { supabase } from "./supabase";

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-generate`;

async function callGemini(prompt) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;

  const res = await fetch(EDGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `AI error ${res.status}`);
  }

  const data = await res.json();
  return data.text || "";
}


// ── AI Proposal Generator ─────────────────────────────────────────────
export async function generateProposal({ projectTitle, clientName, projectType, budget, timeline, scope }) {
  const prompt = `You are a professional freelance proposal writer. Write a compelling, professional project proposal.

Project Details:
- Title: ${projectTitle}
- Client: ${clientName}
- Type: ${projectType}
- Budget: ${budget || "To be discussed"}
- Timeline: ${timeline || "To be discussed"}
- Scope: ${scope || projectTitle}

Write a professional proposal with these sections:
1. Project Overview (2-3 sentences)
2. Scope of Work (4-5 bullet points)
3. Deliverables (3-4 items)
4. Timeline & Milestones
5. Investment (pricing breakdown)
6. Why Choose Me (2-3 sentences)
7. Next Steps

Keep it professional, concise, and persuasive. Format with clear sections. Do NOT use markdown headers with ##, use plain text with section names followed by colon.`;

  return await callGemini(prompt);
}

// ── AI Contract Generator ─────────────────────────────────────────────
export async function generateContract({ projectTitle, clientName, providerName, amount, timeline, scope }) {
  const prompt = `You are a legal document writer. Write a professional freelance service contract.

Contract Details:
- Project: ${projectTitle}
- Client: ${clientName}
- Service Provider: ${providerName}
- Amount: ${amount || "As agreed"}
- Timeline: ${timeline || "As agreed"}
- Scope: ${scope || projectTitle}

Write a complete freelance contract including:
1. Parties & Agreement Date
2. Scope of Services
3. Payment Terms (50% upfront, 50% on completion)
4. Timeline & Deadlines
5. Revisions Policy (max 2 rounds)
6. Intellectual Property Rights
7. Confidentiality Clause
8. Termination Clause
9. Limitation of Liability
10. Signature Section

Keep legal language but make it readable. No markdown formatting.`;

  return await callGemini(prompt);
}

// ── AI Invoice Description ────────────────────────────────────────────
export async function generateInvoiceItems({ projectTitle, projectType, amount }) {
  const prompt = `Generate professional invoice line items for a freelance project.

Project: ${projectTitle}
Type: ${projectType}
Total Budget: ${amount || "1000 USD"}

Return ONLY a JSON array (no explanation, no markdown) with this exact format:
[
  {"description": "Service description here", "qty": 1, "rate": 500},
  {"description": "Another service", "qty": 2, "rate": 250}
]

Make 3-4 realistic line items that add up to approximately ${amount || "1000"}.
Return ONLY the JSON array, nothing else.`;

  const text = await callGemini(prompt);

  // Parse JSON safely
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    // Fallback if AI returns bad JSON
    return [{ description: projectTitle, qty: 1, rate: parseFloat(amount) || 1000 }];
  }
}

// ── AI Follow-up Email ────────────────────────────────────────────────
export async function generateFollowUpEmail({ clientName, projectTitle, daysSince, senderName }) {
  const prompt = `Write a professional but friendly follow-up email.

Context:
- Client: ${clientName}
- Project: ${projectTitle}
- Days since last contact: ${daysSince || 7}
- Sender: ${senderName}

Write a short (3-4 sentences), polite follow-up email. 
Subject line first, then email body.
Be professional but warm. No desperation.
Format: 
Subject: [subject here]
[email body]`;

  return await callGemini(prompt);
}

// ── AI NDA Generator ──────────────────────────────────────────────────
export async function generateNDA({ clientName, providerName, projectTitle }) {
  const prompt = `Write a professional Non-Disclosure Agreement (NDA).

Parties:
- Disclosing Party (Client): ${clientName}
- Receiving Party (Service Provider): ${providerName}
- Purpose: ${projectTitle}

Include:
1. Definition of Confidential Information
2. Obligations of Receiving Party
3. Exclusions from Confidentiality
4. Term (2 years)
5. Return of Information
6. Remedies
7. General Provisions
8. Signature Block

Professional legal language. No markdown formatting.`;

  return await callGemini(prompt);
}