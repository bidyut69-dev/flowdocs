# FlowDocs — Technical GEO Implementation Task

> Ye file Claude Code ko do. Repo root mein rakho aur bolo:
> **"Read flowdocs-geo-task.md and implement all tasks. Show me a summary of changes before committing."**

---

## Context (for Claude Code)

**Product:** FlowDocs — https://flowdocs.co.in
**What it is:** A SaaS for Indian freelancers that combines contract signing + deposit collection into one shareable link. Tagline: "One Link. Signed Contract. Paid Deposit."
**Stack:** React + Vite (SPA) on Vercel, Supabase, Razorpay, Resend.

**Goal:** Make FlowDocs readable and recommendable by AI assistants (ChatGPT, Perplexity, DeepSeek, Gemini, Claude) — this is Generative Engine Optimization (GEO).

### The problem we found

1. **AI crawlers see an empty page.** Fetching https://flowdocs.co.in without JavaScript returns only `<title>` and meta tags. The body has no readable text, because the content is rendered by React. AI crawlers (GPTBot, PerplexityBot, ClaudeBot etc.) mostly do NOT execute JavaScript, so they don't know what FlowDocs does.
2. **Name collision.** "FlowDocs" is used by several other companies (a Microsoft Teams ticketing app by Flowbe FZE, a document management platform, a Brazilian public-admin system, a supply-chain tool, npm packages). When asked "What is FlowDocs?", AI tools return those instead of us. We must clearly establish the entity: **FlowDocs = flowdocs.co.in = contract + deposit tool for Indian freelancers.**

### Canonical one-liner (use EXACTLY this wording everywhere it fits)

> FlowDocs (flowdocs.co.in) — contract signing and deposit collection in one link, built for Indian freelancers.

### Source of truth rule

Facts below (features, pricing) are from memory and may be outdated. **Before writing any content, read `Landing.jsx` (and any pricing component) and use the values from the code.** If something below conflicts with the code, the code wins. Do not invent features, numbers, testimonials, or user counts.

Reference pricing (verify against code):
- FREE — ₹0: 3 docs/month, legal e-signs, basic templates, email support
- PRO — ₹750/month: unlimited documents, legal e-signs, GST invoices, Razorpay payments, auto reminders
- AGENCY — ₹1,999/month: everything in Pro + 5 team members, white-label branding, client portal, API access

---

## Task 1 — Static crawlable content inside `index.html` (highest priority)

Put real, semantic HTML **inside** `<div id="root">…</div>` in `index.html`. React's `createRoot().render()` replaces it on mount, so users see the normal app, but crawlers without JS see the full text.

Requirements:
- Content must **match what the landing page actually says** (same claims, same pricing). No hidden or different content — that counts as cloaking. Do not use `display:none` or hide it with CSS.
- Structure:
  - One `<h1>`: FlowDocs — One Link. Signed Contract. Paid Deposit.
  - Intro paragraph that starts with the canonical one-liner.
  - `<h2>How it works</h2>` — 3 short steps (create contract → send one link → client signs + pays deposit on same page).
  - `<h2>Features</h2>` — list taken from Landing.jsx.
  - `<h2>Who it's for</h2>` — Indian freelancers working with direct clients (designers, developers, video editors, writers, marketers, consultants).
  - `<h2>Pricing</h2>` — the three plans with INR prices.
  - `<h2>Frequently asked questions</h2>` — 6–8 Q&As, answer in the first sentence. Include at least:
    - What is FlowDocs?
    - Is FlowDocs the same as other products named FlowDocs? → No; FlowDocs at flowdocs.co.in is an India-focused tool for freelancers, not affiliated with other products using the name.
    - How do Indian freelancers get a contract signed and collect an advance payment together?
    - Are FlowDocs e-signatures legally valid in India? → Only state what the product legitimately supports; if unsure, keep it factual and mention the IT Act, 2000 recognises electronic signatures, without overclaiming.
    - Which payment methods are supported? (Razorpay — UPI, cards, netbanking; verify)
    - Is there a free plan?
    - How is FlowDocs different from Bonsai, HoneyBook or DocuSign? → Built for India: INR, UPI via Razorpay, GST invoices, contract + deposit in one link.
  - Footer links: Privacy, Terms, contact email (take from code).
- Keep it lightweight (plain HTML, minimal inline styles) so it doesn't hurt LCP.
- Make sure the FAQ text here is identical to the FAQPage JSON-LD in Task 2.

## Task 2 — JSON-LD structured data in `<head>` of `index.html`

Add `<script type="application/ld+json">` blocks:

1. **Organization**
   - `name`: FlowDocs
   - `url`: https://flowdocs.co.in
   - `logo`: https://flowdocs.co.in/android-chrome-512x512.png
   - `description`: the canonical one-liner
   - `areaServed`: India
   - `sameAs`: array of official profile URLs — **leave clearly marked placeholders** (`"TODO_LINKEDIN_URL"`, `"TODO_YOUTUBE_URL"`, `"TODO_UNEED_URL"`, `"TODO_PRODUCTHUNT_URL"`) and list them in your final summary so I can fill them. Do not guess URLs.
   - `founder`: { "@type": "Person", "name": "Bidyut" } (no location, no college, no personal details)
2. **SoftwareApplication**
   - `name`, `url`, `applicationCategory`: BusinessApplication, `operatingSystem`: Web
   - `offers`: one Offer per plan with `price` and `priceCurrency: "INR"`
   - `description`: canonical one-liner
3. **FAQPage** — same Q&As as Task 1.
4. **WebSite** — `name`, `url`.

Check `vercel.json` CSP headers: JSON-LD is a data block and is not affected by `script-src`, but confirm nothing strips it.

## Task 3 — Meta tags cleanup in `index.html`

- Keep current title.
- Update `meta description` to include "Indian freelancers", "contract", "deposit" (it mostly does — keep it under 160 chars).
- Add `<link rel="canonical">` if missing (it exists — verify).
- Add `og:site_name` = FlowDocs and `og:locale` = en_IN.

## Task 4 — `public/llms.txt`

Create `public/llms.txt` (served at https://flowdocs.co.in/llms.txt), markdown format:

```
# FlowDocs

> FlowDocs (flowdocs.co.in) — contract signing and deposit collection in one link, built for Indian freelancers.

[2–4 sentence plain description: problem it solves (clients ghosting / negotiating after work), how it works, who it's for, India-specific: INR, UPI via Razorpay, GST invoices.]

Not affiliated with other products using the name "FlowDocs".

## Key pages
- [Home](https://flowdocs.co.in): product overview, features, pricing, FAQ
- [Sign up](https://flowdocs.co.in/auth): create a free account
- [Privacy Policy](https://flowdocs.co.in/privacy)
- [Terms of Service](https://flowdocs.co.in/terms)

## Pricing
- Free — ₹0 …
- Pro — ₹750/month …
- Agency — ₹1,999/month …
```

Use real routes from the router — verify `/auth`, `/privacy`, `/terms` exist.

## Task 5 — `public/robots.txt`

Keep the existing rules exactly (allow `/`, disallow `/dashboard`, `/sign/`, `/reset-password`, `/forgot-password`). **Add explicit AI-crawler groups** — each group must repeat the same Disallow lines, because a bot that matches its own group ignores the `*` group:

User-agents to add: GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, Perplexity-User, ClaudeBot, Claude-SearchBot, Claude-User, Google-Extended, Bingbot, Applebot-Extended, DeepSeekBot.

Keep the `Sitemap:` line at the bottom.

## Task 6 — `public/sitemap.xml`

- Include only public pages: `/`, `/auth`, `/privacy`, `/terms`, and `/llms.txt` is NOT needed in the sitemap.
- Add `<lastmod>` with today's date (YYYY-MM-DD) on each URL.
- Validate XML.

## Task 7 — IndexNow key file

- Generate a random 32-character hex key.
- Create `public/<key>.txt` containing only the key.
- In your final summary, print the key and this ping URL for me to open after deploying:
  `https://api.indexnow.org/indexnow?url=https://flowdocs.co.in&key=<key>`

## Task 8 — Verify before finishing

1. `npm run build` must pass with no new errors.
2. Check `dist/index.html` contains the static content, the JSON-LD blocks, and the H1.
3. Validate each JSON-LD block is valid JSON (parse it with node).
4. Confirm `dist/llms.txt`, `dist/robots.txt`, `dist/sitemap.xml` and the IndexNow key file exist.
5. Run `npm run dev` / preview and confirm the React app still renders normally (static content gets replaced, no layout flash of broken styles).

## Do NOT

- Change any app logic, Supabase, Razorpay, auth, or dashboard code.
- Add SSR frameworks or migrate off Vite (not needed right now).
- Add fake reviews, ratings (`aggregateRating`), user counts, or testimonials.
- Add personal details about the founder (location, college, address).

## Final output I want from you

1. List of files changed/created.
2. The `sameAs` placeholders I need to fill.
3. The IndexNow key + ping URL.
4. A one-line command I can run after deploy to confirm bots see content:
   `curl -s -A "GPTBot" https://flowdocs.co.in | grep -c "Indian freelancers"`
