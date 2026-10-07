# FlowDocs: Context for Claude Code

Put this file in the repo root as `CLAUDE.md`. Claude Code reads it automatically.

## 1. What this product is
**FlowDocs** (flowdocs.co.in): "One Link. Signed Contract. Paid Deposit." for Indian freelancers.
A freelancer creates a contract or proposal, sends ONE link, and the client signs, pays the deposit, and fills an intake form on the same flow. No chasing.

- Solo founder (Bidyut, 20, college student). No team, no funding. Pre-revenue.
- ~3 months of build time. 1 real signup so far, 0 documents created by her, 0 paying users.
- The goal right now is **activation** (signup -> first document sent -> client signs -> client pays).
- Founder prefers: complete file replacements (not partial snippets), direct and actionable answers. Hinglish is fine in chat. Code and UI copy stay in English.

## 2. Stack
- React + Vite (Rolldown-based build), React Router, deployed on **Vercel**
- **Supabase** (auth with Google OAuth, Postgres, storage, RLS)
- **Razorpay** (checkout, each freelancer's own `razorpay_key_id`, platform key as fallback)
- **Resend** (emails), **Gemini** (AI document generation), **jsPDF** (PDFs)
- **PostHog** (analytics, session replay) via `src/lib/posthog.js`, env vars `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST`
- `vercel.json` sets a strict **Content-Security-Policy**. Any new third-party domain MUST be added to the right directive (script-src, connect-src, img-src, frame-src), otherwise it fails silently in production.

## 3. Known file map
```
src/main.jsx            entry, calls initPostHog()
src/App.jsx             routes, all pages lazy-loaded with Suspense
src/pages/Landing.jsx   marketing page
src/pages/Auth.jsx      login/signup (Google)
src/pages/Onboarding.jsx
src/pages/Dashboard.jsx big file: docs list, settings, payment details, clients
src/pages/SignPage.jsx  PUBLIC client page /sign/:token (anonymous users)
src/pages/ForgotPassword.jsx
src/pages/Legal.jsx     PrivacyPolicy, TermsOfService
src/components/CookieBanner.jsx, BugReport.jsx
src/lib/supabase.js, posthog.js, payment.js, pdf.js
src/theme.js            shared design tokens (see section 6)
vite.config.js, vercel.json, index.html
```

## 4. Hard rules (do not break these)
1. **Never overwrite recent fixes.** Read the current file first. `SignPage.jsx` and `Dashboard.jsx` contain many fixes listed below.
2. **SignPage is used by anonymous clients.** RLS on `profiles` is `auth.uid() = id`, so anonymous users cannot read it. Freelancer data comes ONLY from the RPC `get_payment_info_for_signing(p_sign_token uuid)` (SECURITY DEFINER, returns 8 fields: name, company, email, razorpay_key_id, upi_id, bank_name, bank_account, bank_ifsc). **Never add a blanket `USING (true)` policy on profiles**: it would expose every freelancer's bank details.
3. Field names: bank account column is `bank_account` (NOT `bank_account_number`).
4. Flow order in SignPage: review -> sign -> pay -> intake -> done. Keep it.
5. No client-side secrets. Only Razorpay **Key ID** (never the secret).
6. Do not remove PostHog `capture()` calls (see fix #3 below).
7. Keep mobile first. Most visitors are on Indian mobile networks.

## 5. Fix list (priority order)

### P0: blocks revenue
1. **Audit Trail PDF shows an empty "Captured Signature" box.**
   `src/lib/pdf.js` -> `generateAuditTrail()` calls `pdf.addImage(signatureUrl, "PNG", ...)` with a remote HTTPS Supabase URL. jsPDF cannot load remote URLs synchronously, so it fails silently inside try/catch.
   Fix: the document row already stores `signature_data` (base64 data URL, saved at sign time). Pass `signature_data` to `addImage` instead of `signature_url`. If only the URL exists, make the function async: fetch -> blob -> FileReader base64 -> addImage. Update every caller (find with grep, likely Dashboard.jsx download action) to `await`.
2. **Razorpay checkout never opened on the sign page** (it always showed the manual UPI UI). Root cause was the RLS issue in rule #2 above. Code in `SignPage.jsx` was updated to use the RPC.
   TODO: **verify end to end** in production. Confirm the SQL function exists with a `uuid` param (an earlier version used `text` and failed: `documents.sign_token` is uuid) and that `GRANT EXECUTE ... TO anon, authenticated` was run. Test with a freelancer who has `razorpay_key_id` set.
3. **Landing.jsx was redesigned and the new version dropped PostHog tracking.** The old file had `import { posthog } from "../lib/posthog"` and `posthog?.capture("cta_clicked", {cta, location})` / `posthog?.capture("pricing_cta_clicked", {plan})` on every CTA (header login/start free, hero, pricing free/pro/agency, how-it-works, final CTA). Re-add them to the new Landing.jsx with the same event names.
4. **Dashboard has no UI for `payment_pending`.** When a client taps "I've Paid" on the manual UPI/bank flow, SignPage sets `documents.status = 'payment_pending'`. The freelancer needs a visible "Awaiting verification" list with a "Mark as paid" button that sets `status = 'paid'`.

### P1: activation
5. **New users sign up but never create a document** (first real user stopped at zero documents). Audit Onboarding -> Dashboard first-run. Add a strong empty state ("Create your first contract" with one primary button), pre-fill a sample contract, and make sure "New Document" is obvious on mobile. Add PostHog events: `signup_completed`, `onboarding_completed`, `document_created`, `document_sent`, `document_signed`, `payment_started`, `payment_completed`.
6. **Cookie banner covers the hero CTA and trust line on mobile.** Make it compact (small bar or corner card) and show it with a short delay.
7. **Landing performance is poor on mobile** (Lighthouse ~48-69, LCP 5.8-6.8s). Routes are lazy-loaded but `pdf-*.js` (~430KB) and `vendor-*.js` (~585KB) still load on the landing page because of Vite modulepreload.
   - A `modulePreload.resolveDependencies` filter made it WORSE. Do not retry it.
   - The catch-all `"vendor"` bucket in `manualChunks` lumps every other dependency together. The intended `vite.config.js` has only react-vendor, supabase, pdf (no catch-all). **The uploaded copy of `vite.config.js` still has `return "vendor"` at the end, so confirm which version is actually deployed and remove the catch-all.** Re-measure with Lighthouse mobile before changing more.
   - Better fix: make jsPDF a dynamic `import()` inside the functions that generate PDFs, so it is never in the landing dependency graph. Check what else Landing/CookieBanner/BugReport import transitively.
   - Load fonts with `font-display: swap` and only the weights used.

### P2: security and cleanup
8. **`storage.signatures` bucket allows public listing.** Make it private or remove the listing policy, and serve signatures through signed URLs or the stored base64. Check the real upload path in SignPage before writing folder-based policies.
9. Enable "Leaked password protection" in Supabase Auth settings.
10. Supabase advisor warnings: "Multiple permissive policies" (clients, documents, profiles, reminder_log, audit_log, payments, feedback) and "Auth RLS initialization plan". Performance only. Merge duplicate policies and use `(select auth.uid())`. Low priority.
11. Vite warning "chunks larger than 500kB": cosmetic until fix #7 is done.

## 6. Design redesign (in progress)
Direction chosen: **paper / contract vernacular**. Light stone paper background, warm ink text, FlowDocs gold as the single accent, serif display font (Fraunces), Source Sans 3 body, hairline dividers instead of glowing cards, clause markers (§1, §2...) instead of "01/02", left-aligned editorial hero.

Tokens live in `src/theme.js`: paper `#F6F3EC`, paperAlt `#EFEADF`, ink `#1C1A16`, inkMid `#6B6558`, inkFaint `#9A9385`, line `#DDD6C7`, gold `#C8820F` (text), goldSoft `#F5A623` (fills), stamp green `#1F6B46`, red `#B3432B`.

Status:
- Landing.jsx redesigned (colors currently defined inline; migrate to import from `theme.js`). The founder reported the redesign was not visible on the live site, so first confirm the new Landing.jsx is committed, pushed and deployed.
- `index.html` must load Fraunces + Source Sans 3. Keep the old Syne / DM Sans link until Dashboard and SignPage are migrated.
- Still dark and to be redesigned, in this order: **Auth, Onboarding, SignPage, Dashboard, Legal, ForgotPassword**.
- Avoid generic AI-design tells: ALL-CAPS mono labels everywhere, glow shadows, an arrow on every button, gradient text, purple/blue gradients.
- Keep every functional behavior identical while restyling.

### 3D / depth, what is allowed
Goal: a memorable "premium document" feel without hurting speed. **Performance budget: landing LCP under 2.5s on mobile, total JS added by 3D under ~30KB gzip.**

1. **Landing hero (recommended, cheap):** pure CSS 3D. A stack of 3 paper documents with `perspective` + `rotateX/rotateY`, a signature stroke that draws via SVG `stroke-dashoffset`, a green "PAID" stamp that drops in. Slight mouse tilt on desktop only (`pointer: fine`), static on mobile. Respect `prefers-reduced-motion`.
2. **Cards (pricing, steps):** tiny hover tilt (CSS transform, max ~4deg), no JS libs.
3. **Auth and Onboarding:** one small 3D document illustration, same CSS technique.
4. **Optional, only after fix #7 is done and measured:** a Three.js / react-three-fiber scene for the hero on desktop only, loaded with `React.lazy` + `IntersectionObserver`, with the CSS version as the fallback. Three.js is ~150KB+ gzip, so do NOT ship it to mobile.
5. **Do NOT put 3D on SignPage or Dashboard.** SignPage is a trust and payment page that must load instantly for clients on weak networks. Dashboard is a daily-use tool: calm, fast, readable.

## 7. Working agreement for Claude Code
- Before editing a big file, grep for the symbols you will touch and read the surrounding code.
- After every change run `npm run build` and fix errors. Report bundle sizes.
- When touching CSP-sensitive things (new scripts, fonts, images, API hosts), update `vercel.json` in the same change.
- Never commit `.env` values. Env vars needed: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_RAZORPAY_KEY_ID`, `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST`, plus the Gemini/Resend keys used by existing code.
- Small commits with clear messages, one fix per commit, in the priority order above.
