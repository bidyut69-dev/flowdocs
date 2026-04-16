import { useState } from "react";
import { supabase } from "../lib/supabase";

const C = {
  bg: "#0C0C0E", surface: "#141416", surface2: "#1C1C1F", border: "#2A2A2E",
  gold: "#F5A623", goldDim: "#F5A62318", text: "#F0EEE8", dim: "#7A7875",
  mid: "#B0ADA8", green: "#22C55E", greenDim: "#22C55E20",
};

const PROPOSAL_TEMPLATES = [
  {
    id: "web-design",
    category: "Design",
    icon: "🌐",
    title: "Web Design Proposal",
    type: "Proposal",
    priceRange: "$500–$5,000",
    defaultAmount: 1500,
    tags: ["P0", "Most Popular"],
    description: `I will design and develop a professional, modern website for your business.

Scope of Work:
• Custom homepage design (desktop + mobile)
• Up to 5 inner pages (About, Services, Contact, Portfolio, Blog)
• Responsive design for all devices
• Contact form integration
• Basic SEO setup (meta tags, sitemap)
• 2 rounds of revisions included

Timeline: 3–4 weeks from project kickoff

What I need from you:
• Brand assets (logo, colors, fonts)
• Content (text, images)
• Reference websites you like

Payment Terms: 50% upfront, 50% on delivery.`,
  },
  {
    id: "logo-branding",
    category: "Design",
    icon: "🎨",
    title: "Logo Design & Branding",
    type: "Proposal",
    priceRange: "$200–$1,500",
    defaultAmount: 500,
    tags: ["P0"],
    description: `I will create a professional logo and brand identity for your business.

Deliverables:
• 3 initial logo concepts
• 2 rounds of revisions
• Final files: PNG, SVG, PDF (all sizes)
• Brand color palette + typography guide
• Social media kit (profile picture, cover photo)

Timeline: 1–2 weeks

Payment Terms: Full payment upfront for projects under $500.`,
  },
  {
    id: "seo-audit",
    category: "Marketing",
    icon: "🔍",
    title: "SEO Audit & Strategy",
    type: "Proposal",
    priceRange: "$300–$2,000",
    defaultAmount: 800,
    tags: ["P0"],
    description: `I will conduct a comprehensive SEO audit and build a strategy to improve your search rankings.

Included:
• Full technical SEO audit
• Keyword research (50+ keywords)
• Competitor analysis (top 3)
• On-page SEO recommendations
• Backlink profile analysis
• 90-day content + SEO roadmap

Deliverables:
• Detailed audit report (PDF)
• Priority action checklist
• Monthly reporting template

Timeline: 7–10 business days`,
  },
  {
    id: "social-media",
    category: "Marketing",
    icon: "📱",
    title: "Social Media Management",
    type: "Proposal",
    priceRange: "$500/month",
    defaultAmount: 500,
    tags: ["Retainer"],
    description: `I will manage your social media presence to grow your audience and engagement.

Monthly Deliverables:
• 20 posts/month (Instagram + LinkedIn)
• 4 Stories per week
• Community management (comments + DMs)
• Monthly performance report

Platforms: Instagram, LinkedIn

Minimum commitment: 3 months`,
  },
  {
    id: "app-development",
    category: "Development",
    icon: "📱",
    title: "Mobile App Development",
    type: "Proposal",
    priceRange: "$2,000–$20,000",
    defaultAmount: 5000,
    tags: ["P1"],
    description: `I will design and develop a cross-platform mobile application for iOS and Android.

Scope:
• React Native (iOS + Android from one codebase)
• Custom UI/UX design
• Backend API integration
• Push notifications
• App Store + Play Store submission

Payment Schedule:
• 30% on project start
• 40% at design approval
• 30% on final delivery

Timeline: 8–12 weeks`,
  },
  {
    id: "content-writing",
    category: "Content",
    icon: "✍️",
    title: "Content Writing Retainer",
    type: "Proposal",
    priceRange: "$300–$800/month",
    defaultAmount: 400,
    tags: ["Retainer"],
    description: `I will create high-quality, SEO-optimized content for your business.

Monthly Deliverables:
• 8 blog posts (800–1,200 words each)
• 2 long-form articles (2,000+ words)
• Meta descriptions + title tags for all posts
• 1 revision round per piece

Content Types:
• Blog posts, case studies, whitepapers
• Email newsletters
• Product descriptions

Minimum commitment: 2 months`,
  },
  {
    id: "consulting",
    category: "Business",
    icon: "💼",
    title: "Business Consulting",
    type: "Proposal",
    priceRange: "$100–$300/hour",
    defaultAmount: 1200,
    tags: ["P2"],
    description: `I will provide strategic consulting to help your business grow.

Services:
• Business strategy review + recommendations
• Market research and analysis
• Process optimization
• Growth roadmap development

Engagement Format:
• 4 x 1-hour sessions per month
• Written summary after each session
• Email support between sessions
• Monthly progress report

Billing: Monthly retainer or per-session rate.`,
  },
  {
    id: "freelance-contract",
    category: "Legal",
    icon: "📋",
    title: "Freelance Service Contract",
    type: "Contract",
    priceRange: "Any project",
    defaultAmount: 0,
    tags: ["Legal"],
    description: `FREELANCE SERVICE AGREEMENT

This agreement is between the Service Provider and Client.

1. SERVICES
Service Provider agrees to provide the following services as discussed and agreed upon. Any changes to scope require written approval.

2. PAYMENT TERMS
• Invoice will be issued upon project milestones
• Payment due within 14 days of invoice
• Late payments: 2% monthly interest after 30 days
• Projects on hold until outstanding balances are cleared

3. INTELLECTUAL PROPERTY
Upon full payment, all final deliverables become property of the Client. All preliminary work remains property of Service Provider.

4. REVISIONS
Project includes [X] rounds of revisions. Additional revisions billed at hourly rate.

5. CONFIDENTIALITY
Both parties agree to keep all project details confidential.

6. TERMINATION
Either party may terminate with 14 days written notice. Client pays for work completed to date.

7. GOVERNING LAW
This agreement is governed by the laws of India.`,
  },
  {
    id: "nda",
    category: "Legal",
    icon: "🔒",
    title: "Non-Disclosure Agreement",
    type: "NDA",
    priceRange: "Any project",
    defaultAmount: 0,
    tags: ["Legal"],
    description: `NON-DISCLOSURE AGREEMENT (NDA)

This NDA is entered into between the parties.

1. CONFIDENTIAL INFORMATION
"Confidential Information" means any information disclosed by either party that is marked confidential or would reasonably be understood to be confidential, including but not limited to: business plans, technical data, trade secrets, financial information, client lists.

2. OBLIGATIONS
The receiving party agrees to:
• Keep all Confidential Information strictly confidential
• Not disclose to any third party without prior written consent
• Use Confidential Information only for the purpose of this engagement
• Protect with at least the same degree of care as their own confidential information

3. EXCLUSIONS
This NDA does not apply to information that:
• Is or becomes publicly known without breach
• Was rightfully known before disclosure
• Is independently developed without use of Confidential Information

4. TERM
This agreement remains in effect for 2 years from the date of signing.

5. REMEDIES
Breach of this NDA may cause irreparable harm. Both parties agree that injunctive relief is an appropriate remedy.`,
  },
];

const CATEGORIES = ["All", "Design", "Development", "Marketing", "Content", "Business", "Legal"];

export default function Templates({ session, onUse }) {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState(null);
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);

  const filtered = PROPOSAL_TEMPLATES.filter(t =>
    (category === "All" || t.category === category) &&
    (t.title.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()))
  );

  const applyTemplate = async (template) => {
    setCreating(true);
    const { data, error } = await supabase.from("documents").insert({
      user_id: session.user.id,
      title: template.title,
      type: template.type,
      status: "draft",
      amount: template.defaultAmount || null,
      content: { description: template.description },
    }).select().single();

    setCreating(false);
    if (!error && data) {
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onUse?.(data); }, 1500);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Search + Filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          style={{
            flex: 1, minWidth: 200, background: C.surface2, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: "9px 14px", fontSize: 13.5, color: C.text,
            fontFamily: "'DM Sans', sans-serif", outline: "none",
          }}
          placeholder="Search templates..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              padding: "8px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontWeight: category === c ? 700 : 400,
              background: category === c ? C.goldDim : C.surface2,
              border: `1px solid ${category === c ? C.gold : C.border}`,
              color: category === c ? C.gold : C.dim,
            }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Success toast */}
      {success && (
        <div style={{ background: C.greenDim, border: `1px solid ${C.green}`, borderRadius: 10, padding: "12px 18px", marginBottom: 16, fontSize: 14, color: C.green, fontWeight: 600 }}>
          ✓ Template added to your documents!
        </div>
      )}

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        {filtered.map(t => (
          <div key={t.id} style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: 20, transition: "border-color 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.gold}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ fontSize: 28 }}>{t.icon}</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {t.tags.map(tag => (
                  <span key={tag} style={{
                    fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 10,
                    fontFamily: "'DM Mono', monospace",
                    background: tag === "Most Popular" ? C.goldDim : tag === "Legal" ? "#60A5FA18" : C.surface2,
                    color: tag === "Most Popular" ? C.gold : tag === "Legal" ? "#60A5FA" : C.dim,
                    border: `1px solid ${tag === "Most Popular" ? C.gold : tag === "Legal" ? "#60A5FA" : C.border}`,
                  }}>{tag}</span>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>{t.title}</div>
            <div style={{ fontSize: 11, color: C.dim, marginBottom: 12 }}>{t.category} · {t.priceRange}</div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setPreview(t)} style={{
                flex: 1, background: "transparent", border: `1px solid ${C.border}`,
                color: C.mid, borderRadius: 8, padding: "8px", fontSize: 12,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
              }}>Preview</button>
              <button onClick={() => applyTemplate(t)} disabled={creating} style={{
                flex: 1, background: C.goldDim, border: `1px solid ${C.gold}`,
                color: C.gold, borderRadius: 8, padding: "8px", fontSize: 12,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
              }}>Use →</button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {preview && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}
          onClick={() => setPreview(null)}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "85vh", overflowY: "auto", padding: 28 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: C.gold, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>{preview.type}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: C.text }}>{preview.title}</div>
                <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>{preview.category} · {preview.priceRange}</div>
              </div>
              <button onClick={() => setPreview(null)} style={{ background: "none", border: "none", color: C.dim, cursor: "pointer", fontSize: 22 }}>×</button>
            </div>
            <pre style={{ fontSize: 12.5, color: C.mid, lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "'DM Mono', monospace", background: C.surface2, padding: 16, borderRadius: 10, marginBottom: 20 }}>
              {preview.description}
            </pre>
            <button onClick={() => { applyTemplate(preview); setPreview(null); }} disabled={creating} style={{
              width: "100%", background: C.gold, color: "#0C0C0E", border: "none",
              borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 700,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}>
              {creating ? "Creating..." : "Use This Template →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
