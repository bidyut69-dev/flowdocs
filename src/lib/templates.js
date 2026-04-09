// ── FlowDocs Template Library ─────────────────────────────────────────
// Separated from Templates.jsx to fix React fast-refresh warning

export const PROPOSAL_TEMPLATES = [
  {
    id: "web-design", category: "Design", icon: "🌐",
    title: "Web Design Proposal", type: "Proposal",
    priceRange: "$500–$5,000", defaultAmount: 1500, tags: ["Most Popular"],
    description: `I will design and develop a professional website for your business.

Scope of Work:
• Custom homepage design (desktop + mobile)
• Up to 5 inner pages (About, Services, Contact, Portfolio, Blog)
• Responsive design for all devices
• Contact form integration
• Basic SEO setup
• 2 rounds of revisions

Timeline: 3–4 weeks
Payment Terms: 50% upfront, 50% on delivery.`,
  },
  {
    id: "logo-branding", category: "Design", icon: "🎨",
    title: "Logo Design & Branding", type: "Proposal",
    priceRange: "$200–$1,500", defaultAmount: 500, tags: ["P0"],
    description: `I will create a professional logo and brand identity for your business.

Deliverables:
• 3 initial logo concepts
• 2 rounds of revisions
• Final files: PNG, SVG, PDF (all sizes)
• Brand color palette + typography guide
• Social media kit

Timeline: 1–2 weeks
Payment: Full upfront for projects under $500.`,
  },
  {
    id: "seo-audit", category: "Marketing", icon: "🔍",
    title: "SEO Audit & Strategy", type: "Proposal",
    priceRange: "$300–$2,000", defaultAmount: 800, tags: ["P0"],
    description: `I will conduct a comprehensive SEO audit and build a ranking strategy.

Included:
• Full technical SEO audit
• Keyword research (50+ keywords)
• Competitor analysis (top 3)
• On-page SEO recommendations
• 90-day content + SEO roadmap

Deliverables: Detailed audit report (PDF), priority action checklist
Timeline: 7–10 business days`,
  },
  {
    id: "social-media", category: "Marketing", icon: "📱",
    title: "Social Media Management", type: "Proposal",
    priceRange: "$500/month", defaultAmount: 500, tags: ["Retainer"],
    description: `I will manage your social media presence to grow audience and engagement.

Monthly Deliverables:
• 20 posts/month (Instagram + LinkedIn)
• 4 Stories per week
• Community management (comments + DMs)
• Monthly performance report

Minimum commitment: 3 months`,
  },
  {
    id: "app-development", category: "Development", icon: "💻",
    title: "Mobile App Development", type: "Proposal",
    priceRange: "$2,000–$20,000", defaultAmount: 5000, tags: ["P1"],
    description: `I will design and develop a cross-platform mobile app for iOS and Android.

Scope:
• React Native (iOS + Android from one codebase)
• Custom UI/UX design
• Backend API integration
• Push notifications
• App Store + Play Store submission

Payment: 30% start / 40% midpoint / 30% delivery
Timeline: 8–12 weeks`,
  },
  {
    id: "content-writing", category: "Content", icon: "✍️",
    title: "Content Writing Retainer", type: "Proposal",
    priceRange: "$300–$800/month", defaultAmount: 400, tags: ["Retainer"],
    description: `I will create high-quality, SEO-optimized content for your business.

Monthly Deliverables:
• 8 blog posts (800–1,200 words each)
• 2 long-form articles (2,000+ words)
• Meta descriptions + title tags
• 1 revision round per piece

Minimum commitment: 2 months`,
  },
  {
    id: "consulting", category: "Business", icon: "💼",
    title: "Business Consulting", type: "Proposal",
    priceRange: "$100–$300/hour", defaultAmount: 1200, tags: ["P2"],
    description: `I will provide strategic consulting to help your business grow.

Services:
• Business strategy review + recommendations
• Market research and analysis
• Process optimization
• Growth roadmap development

Format: 4 x 1-hour sessions/month + written summaries
Billing: Monthly retainer or per-session rate.`,
  },
  {
    id: "freelance-contract", category: "Legal", icon: "📋",
    title: "Freelance Service Contract", type: "Contract",
    priceRange: "Any project", defaultAmount: 0, tags: ["Legal"],
    description: `FREELANCE SERVICE AGREEMENT

1. SERVICES
Service Provider agrees to provide the services as discussed. Changes require written approval.

2. PAYMENT TERMS
• Payment due within 14 days of invoice
• Late payments: 2% monthly interest after 30 days

3. INTELLECTUAL PROPERTY
Upon full payment, all final deliverables become property of the Client.

4. REVISIONS
Includes agreed revision rounds. Additional revisions billed at hourly rate.

5. CONFIDENTIALITY
Both parties keep all project details confidential.

6. TERMINATION
Either party may terminate with 14 days written notice. Client pays for work completed.

7. GOVERNING LAW
This agreement is governed by the laws of India.`,
  },
  {
    id: "nda", category: "Legal", icon: "🔒",
    title: "Non-Disclosure Agreement", type: "NDA",
    priceRange: "Any project", defaultAmount: 0, tags: ["Legal"],
    description: `NON-DISCLOSURE AGREEMENT (NDA)

1. CONFIDENTIAL INFORMATION
Any information marked confidential or reasonably understood as confidential — including business plans, technical data, trade secrets, client lists.

2. OBLIGATIONS
The receiving party agrees to:
• Keep all information strictly confidential
• Not disclose to any third party without prior written consent
• Use information only for the purpose of this engagement

3. EXCLUSIONS
Does not apply to information that is publicly known or independently developed.

4. TERM
This agreement remains in effect for 2 years from signing.

5. REMEDIES
Breach may cause irreparable harm. Injunctive relief is an appropriate remedy.`,
  },
];