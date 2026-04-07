// ── Google Gemini AI Integration ─────────────────────────────────────
// Free tier: 1500 requests/day, 15 requests/minute
// Get key: aistudio.google.com → Get API Key

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

async function callGemini(prompt) {
  if (!GEMINI_KEY) throw new Error("Gemini API key missing. Add VITE_GEMINI_API_KEY to .env");

  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1500,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message || `API error ${res.status}`;
    throw new Error(msg);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from AI");
  return text.trim();
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