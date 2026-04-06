# ⚡ FlowDocs — Setup Guide

Complete freelancer document workflow: Proposals, Contracts, Invoices, eSign, Email.

---

## Stack
- **Frontend**: React + Vite
- **Backend/DB/Auth**: Supabase (free tier)
- **PDF**: jsPDF (client-side)
- **Email**: Resend (free 3000/month)

---

## Step 1 — Supabase Setup

1. Go to **supabase.com** → New Project
2. Copy your **Project URL** and **anon key** (Settings → API)
3. Go to **SQL Editor** → paste contents of `supabase/schema.sql` → Run
4. Go to **Authentication → Email** → Disable "Confirm email" for testing

---

## Step 2 — Resend Setup (Email)

1. Go to **resend.com** → Sign up (free)
2. Create API Key → copy it
3. Add your domain OR use `onboarding@resend.dev` for testing

---

## Step 3 — Environment Variables

```bash
# Copy the example file
cp .env.example .env
```

Fill in your `.env`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_RESEND_API_KEY=re_your_key
```

---

## Step 4 — Install & Run

```bash
npm install
npm run dev
```

Open **http://localhost:5173** 🎉

---

## How It Works

### Create a Document
1. Click **+ New Document**
2. Choose type: Proposal / Contract / Invoice / NDA
3. Select client, fill details → Create

### Send for Signing
1. Document must have a client with email
2. Click **Send ↗** → unique signing link is emailed to client
3. Client opens link → draws signature → submits
4. You get a notification email

### Copy Signing Link
- Click **Copy Link** to manually send the signing URL via WhatsApp/chat

### Download PDF
- Click **PDF ↓** on any document to download a professional PDF

### Signing Page (for clients)
- URL: `http://yoursite.com/sign/<token>`
- Client sees document details
- Draws signature with mouse or finger (mobile)
- Checks agreement → submits
- Signature saved to Supabase Storage

---

## Folder Structure

```
flowdocs-v2/
├── src/
│   ├── App.jsx              ← Router + auth state
│   ├── main.jsx             ← Entry point
│   ├── lib/
│   │   ├── supabase.js      ← Supabase client
│   │   ├── pdf.js           ← PDF generation (jsPDF)
│   │   └── email.js         ← Email via Resend API
│   └── pages/
│       ├── Auth.jsx         ← Login / Signup
│       ├── Dashboard.jsx    ← Main app (Docs, Clients, eSign, Invoices)
│       └── SignPage.jsx     ← Public signing page for clients
├── supabase/
│   └── schema.sql           ← Run in Supabase SQL Editor
├── .env.example
├── index.html
├── package.json
└── vite.config.js
```

---

## Deploy to Production

```bash
npm run build
# Upload the /dist folder to Vercel / Netlify (free)
```

On **Vercel**: connect GitHub repo → add env variables → deploy.

---

## Next Steps

- [ ] Add Razorpay/Stripe for payment collection
- [ ] Move email to Supabase Edge Function (hide API key)
- [ ] Custom branding (Pro plan feature)
- [ ] WhatsApp notification via Twilio/WATI
- [ ] Invoice payment tracking
