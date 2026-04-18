import jsPDF from "jspdf";
import "jspdf-autotable";

const GOLD    = [245, 166, 35];
const DARK    = [12, 12, 14];
const SURFACE = [20, 20, 22];
const TEXT    = [240, 238, 232];
const MUTED   = [122, 120, 117];
const GREEN   = [34, 197, 94];
const RED     = [239, 68, 68];

// ── Currency helpers ──────────────────────────────────────────────────
const PDF_CURRENCIES = {
  INR: "Rs.", USD: "$", EUR: "EUR ", GBP: "GBP ",
  AED: "AED ", CAD: "CA$", AUD: "A$", SGD: "S$",
};
const sym = (cur) => PDF_CURRENCIES[cur] || "Rs.";
const fmtAmt = (amount, cur) =>
  `${sym(cur)}${Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

// ── GST calc ─────────────────────────────────────────────────────────
const calcGST = (subtotal, taxType, taxRate = 18) => {
  if (taxType === "cgst_sgst") return { cgst: subtotal * taxRate / 200, sgst: subtotal * taxRate / 200, igst: 0, total: subtotal * (1 + taxRate / 100) };
  if (taxType === "igst")      return { cgst: 0, sgst: 0, igst: subtotal * taxRate / 100, total: subtotal * (1 + taxRate / 100) };
  return { cgst: 0, sgst: 0, igst: 0, total: subtotal };
};

// ── New page helper ───────────────────────────────────────────────────
function addNewPage(pdf) {
  const W = 210, H = 297;
  pdf.addPage();
  pdf.setFillColor(...DARK);
  pdf.rect(0, 0, W, H, "F");
  pdf.setFillColor(...GOLD);
  pdf.rect(0, 0, W, 2, "F");
  return 16;
}

// ── Main PDF generator ───────────────────────────────────────────────
export function generatePDF({ document: doc, profile, client, signatureDataUrl = null }) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210, H = 297;
  const cur = doc.currency || profile?.default_currency || "INR";
  const s = sym(cur);

  // Background
  pdf.setFillColor(...DARK);
  pdf.rect(0, 0, W, H, "F");

  // Gold top bar
  pdf.setFillColor(...GOLD);
  pdf.rect(0, 0, W, 3, "F");

  // Header
  pdf.setFillColor(...SURFACE);
  pdf.rect(0, 3, W, 42, "F");

  // Logo
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.setTextColor(...GOLD);
  pdf.text("FlowDocs", 15, 20);

  pdf.setFontSize(8);
  pdf.setTextColor(...MUTED);
  pdf.setFont("helvetica", "normal");
  if (profile?.company) pdf.text(profile.company, 15, 27);
  if (profile?.gstin)   pdf.text(`GSTIN: ${profile.gstin}`, 15, 33);
  if (profile?.pan)     pdf.text(`PAN: ${profile.pan}`, 15, 39);

  // Doc type badge
  pdf.setFillColor(...GOLD);
  pdf.roundedRect(W - 52, 10, 37, 11, 2, 2, "F");
  pdf.setTextColor(...DARK);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text((doc.type || "DOCUMENT").toUpperCase(), W - 33.5, 17, { align: "center" });

  // Invoice number
  if (doc.invoice_number) {
    pdf.setFontSize(8);
    pdf.setTextColor(...GOLD);
    pdf.text(doc.invoice_number, W - 33.5, 27, { align: "center" });
  }

  // Currency tag
  pdf.setFontSize(7);
  pdf.setTextColor(...MUTED);
  pdf.text(`Currency: ${cur}`, W - 15, 36, { align: "right" });

  // Divider
  pdf.setDrawColor(...GOLD);
  pdf.setLineWidth(0.5);
  pdf.line(0, 45, W, 45);

  // Title
  let y = 56;
  pdf.setFontSize(18);
  pdf.setTextColor(...TEXT);
  pdf.setFont("helvetica", "bold");
  const titleLines = pdf.splitTextToSize(doc.title || "Document", W - 30);
  pdf.text(titleLines, 15, y);
  y += titleLines.length * 7 + 3;

  // Date row
  pdf.setFontSize(9);
  pdf.setTextColor(...MUTED);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Document ID: FD-${(doc.id || "").slice(0, 8).toUpperCase()}`, 15, y);
  pdf.text(`Date: ${new Date(doc.created_at || Date.now()).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`, W - 15, y, { align: "right" });

  if (doc.due_date) {
    y += 5;
    const isOverdue = new Date(doc.due_date) < new Date();
    pdf.setTextColor(...(isOverdue ? RED : MUTED));
    pdf.text(`Due: ${new Date(doc.due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`, W - 15, y, { align: "right" });
  }

  // From / To boxes
  y += 10;
  pdf.setFillColor(...SURFACE);
  pdf.roundedRect(14, y, 85, 46, 3, 3, "F");
  pdf.roundedRect(111, y, 85, 46, 3, 3, "F");

  // FROM
  pdf.setFontSize(8); pdf.setTextColor(...GOLD); pdf.setFont("helvetica", "bold");
  pdf.text("FROM", 20, y + 8);
  pdf.setTextColor(...TEXT); pdf.setFontSize(11);
  pdf.text(profile?.name || "Your Name", 20, y + 17);
  pdf.setFontSize(9); pdf.setTextColor(...MUTED); pdf.setFont("helvetica", "normal");
  if (profile?.company)  pdf.text(profile.company, 20, y + 24);
  if (profile?.email)    pdf.text(profile.email, 20, y + 30);
  if (profile?.state)    pdf.text(profile.state, 20, y + 36);
  if (profile?.gstin) {
    pdf.setFontSize(7); pdf.setTextColor(...GOLD);
    pdf.text(`GSTIN: ${profile.gstin}`, 20, y + 42);
  }

  // TO
  pdf.setFontSize(8); pdf.setTextColor(...GOLD); pdf.setFont("helvetica", "bold");
  pdf.text("TO", 117, y + 8);
  pdf.setTextColor(...TEXT); pdf.setFontSize(11);
  pdf.text(client?.name || "Client Name", 117, y + 17);
  pdf.setFontSize(9); pdf.setTextColor(...MUTED); pdf.setFont("helvetica", "normal");
  if (client?.company) pdf.text(client.company, 117, y + 24);
  if (client?.email)   pdf.text(client.email, 117, y + 30);
  if (client?.state)   pdf.text(client.state, 117, y + 36);
  if (client?.gstin) {
    pdf.setFontSize(7); pdf.setTextColor(...GOLD);
    pdf.text(`GSTIN: ${client.gstin}`, 117, y + 42);
  }

  y += 56;

  // ── Invoice content ───────────────────────────────────────────────
  if (doc.type === "Invoice" && doc.content?.items) {
    if (doc.hsn_sac) {
      pdf.setFontSize(8); pdf.setTextColor(...MUTED);
      pdf.text(`HSN/SAC Code: ${doc.hsn_sac}`, 15, y);
      y += 6;
    }

    const tableData = doc.content.items.map((item, i) => [
      i + 1,
      item.description,
      item.qty || 1,
      `${s}${Number(item.rate || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      `${s}${Number((item.qty || 1) * (item.rate || 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
    ]);

    const subtotal = doc.content.items.reduce((sum, i) => sum + (i.qty || 1) * (i.rate || 0), 0);
    const taxType  = doc.tax_type || "none";
    const taxRate  = doc.tax_rate || 18;
    const gst      = calcGST(subtotal, taxType, taxRate);

    pdf.autoTable({
      startY: y,
      head: [["#", "Description", "Qty", "Rate", "Amount"]],
      body: tableData,
      theme: "plain",
      headStyles: { fillColor: GOLD, textColor: DARK, fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fillColor: SURFACE, textColor: TEXT, fontSize: 9 },
      alternateRowStyles: { fillColor: [28, 28, 31] },
      columnStyles: {
        0: { cellWidth: 12, halign: "center" },
        1: { cellWidth: 78 },
        2: { cellWidth: 18, halign: "center" },
        3: { cellWidth: 32, halign: "right" },
        4: { cellWidth: 35, halign: "right" },
      },
      margin: { left: 14, right: 14 },
    });

    y = pdf.lastAutoTable.finalY + 6;

    // Totals box
    const taxLines = taxType === "cgst_sgst" ? 2 : taxType === "igst" ? 1 : 0;
    const totalsH  = 28 + taxLines * 8;
    pdf.setFillColor(...SURFACE);
    pdf.roundedRect(110, y, 86, totalsH, 3, 3, "F");

    let ty = y + 8;
    pdf.setFontSize(9); pdf.setTextColor(...MUTED); pdf.setFont("helvetica", "normal");
    pdf.text("Subtotal", 116, ty);
    pdf.text(fmtAmt(subtotal, cur), 192, ty, { align: "right" });

    if (taxType === "cgst_sgst") {
      ty += 8;
      pdf.text(`CGST (${taxRate / 2}%)`, 116, ty);
      pdf.text(fmtAmt(gst.cgst, cur), 192, ty, { align: "right" });
      ty += 8;
      pdf.text(`SGST (${taxRate / 2}%)`, 116, ty);
      pdf.text(fmtAmt(gst.sgst, cur), 192, ty, { align: "right" });
    } else if (taxType === "igst") {
      ty += 8;
      pdf.text(`IGST (${taxRate}%)`, 116, ty);
      pdf.text(fmtAmt(gst.igst, cur), 192, ty, { align: "right" });
    }

    ty += 4;
    pdf.setDrawColor(...GOLD);
    pdf.line(116, ty, 192, ty);
    ty += 7;
    pdf.setFont("helvetica", "bold"); pdf.setTextColor(...GOLD); pdf.setFontSize(12);
    pdf.text("TOTAL", 116, ty);
    pdf.text(fmtAmt(gst.total, cur), 192, ty, { align: "right" });

    y += totalsH + 8;

    // Bank / UPI details
    if (profile?.bank_name || profile?.upi_id) {
      const bankH = 14 + (profile.bank_name ? 12 : 0) + (profile.upi_id ? 8 : 0);
      pdf.setFillColor(...SURFACE);
      pdf.roundedRect(14, y, W - 28, bankH, 3, 3, "F");
      pdf.setFontSize(8); pdf.setTextColor(...GOLD); pdf.setFont("helvetica", "bold");
      pdf.text("PAYMENT DETAILS", 20, y + 8);
      pdf.setFontSize(9); pdf.setTextColor(...TEXT); pdf.setFont("helvetica", "normal");
      let py = y + 16;
      if (profile.bank_name) {
        pdf.text(`Bank: ${profile.bank_name}${profile.bank_account ? "  |  A/C: " + profile.bank_account : ""}`, 20, py);
        if (profile.bank_ifsc) { py += 6; pdf.text(`IFSC: ${profile.bank_ifsc}`, 20, py); }
      }
      if (profile.upi_id) {
        py += 6;
        pdf.setTextColor(...GOLD); pdf.setFont("helvetica", "bold");
        pdf.text(`UPI: ${profile.upi_id}`, 20, py);
      }
      y += bankH + 8;
    }

  } else {
    // ── Proposal / Contract / NDA ──────────────────────────────────
    pdf.setFontSize(9); pdf.setTextColor(...MUTED); pdf.setFont("helvetica", "bold");
    pdf.text("DESCRIPTION", 15, y);
    y += 8;

    const bodyText = doc.content?.description ||
      `This ${doc.type} is issued by ${profile?.name || "Service Provider"} for services to ${client?.name || "Client"}.\n\nAll work is subject to the agreed terms. Payment due within 30 days of signing.`;

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...TEXT);
    pdf.setFontSize(10);
    const lines    = pdf.splitTextToSize(bodyText, W - 44);
    const lineH    = 5.2;
    const totalTH  = lines.length * lineH;
    const availH   = H - y - 80;

    if (totalTH > availH) {
      // Multi-page
      let currentY = y;
      pdf.setFillColor(...SURFACE);
      pdf.roundedRect(14, currentY - 2, W - 28, Math.min(totalTH + 16, availH + 10), 3, 3, "F");

      for (let i = 0; i < lines.length; i++) {
        if (currentY > H - 75) {
          currentY = addNewPage(pdf);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(...TEXT);
          pdf.setFontSize(10);
        }
        pdf.text(lines[i], 20, currentY);
        currentY += lineH;
      }
      y = currentY + 8;
    } else {
      const boxH = Math.max(totalTH + 16, 30);
      pdf.setFillColor(...SURFACE);
      pdf.roundedRect(14, y, W - 28, boxH, 3, 3, "F");
      pdf.text(lines, 20, y + 10);
      y += boxH + 8;
    }

    // Amount bar
    if (doc.amount) {
      if (y > H - 60) y = addNewPage(pdf);
      pdf.setFillColor(...GOLD);
      pdf.roundedRect(14, y, W - 28, 16, 3, 3, "F");
      pdf.setFont("helvetica", "bold"); pdf.setTextColor(...DARK); pdf.setFontSize(12);
      pdf.text(`Total Value: ${fmtAmt(doc.amount, cur)} ${cur}`, W / 2, y + 10, { align: "center" });
      y += 24;
    }
  }

  // ── Signature section ────────────────────────────────────────────
  if (y > H - 70) y = addNewPage(pdf);

  y += 4;
  pdf.setFontSize(9); pdf.setTextColor(...MUTED); pdf.setFont("helvetica", "bold");
  pdf.text("SIGNATURES", 15, y);
  y += 8;

  // Client signature box
  pdf.setFillColor(...SURFACE);
  pdf.roundedRect(14, y, 85, 48, 3, 3, "F");
  pdf.setFontSize(8); pdf.setTextColor(...GOLD); pdf.setFont("helvetica", "bold");
  pdf.text("CLIENT SIGNATURE", 20, y + 8);

  if (signatureDataUrl) {
    try { pdf.addImage(signatureDataUrl, "PNG", 18, y + 11, 75, 26); } catch (e) { console.warn("Signature render failed:", e); }
    pdf.setDrawColor(...GREEN); pdf.setLineWidth(0.3);
    pdf.line(18, y + 39, 90, y + 39);
    pdf.setFontSize(7); pdf.setTextColor(...GREEN);
    pdf.text(`Signed: ${new Date(doc.signed_at || Date.now()).toLocaleString("en-IN")}`, 20, y + 44);
  } else {
    pdf.setDrawColor(...MUTED); pdf.setLineWidth(0.3);
    pdf.line(18, y + 39, 90, y + 39);
    pdf.setFontSize(8); pdf.setTextColor(...MUTED);
    pdf.text("Signature", 20, y + 44);
  }

  // Provider signature box
  pdf.setFillColor(...SURFACE);
  pdf.roundedRect(111, y, 85, 48, 3, 3, "F");
  pdf.setFontSize(8); pdf.setTextColor(...GOLD); pdf.setFont("helvetica", "bold");
  pdf.text("YOUR SIGNATURE", 117, y + 8);
  pdf.setDrawColor(...MUTED); pdf.setLineWidth(0.3);
  pdf.line(115, y + 39, 188, y + 39);
  pdf.setFontSize(8); pdf.setTextColor(...MUTED); pdf.setFont("helvetica", "normal");
  pdf.text("Authorized Signatory", 117, y + 44);

  // Notes
  if (doc.notes) {
    y += 56;
    if (y < H - 25) {
      pdf.setFontSize(8); pdf.setTextColor(...MUTED); pdf.setFont("helvetica", "italic");
      pdf.text(`Note: ${doc.notes}`, 15, y);
    }
  }

  // ── Footer on all pages ──────────────────────────────────────────
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFillColor(...SURFACE);
    pdf.rect(0, H - 16, W, 16, "F");
    pdf.setDrawColor(...GOLD); pdf.setLineWidth(0.3);
    pdf.line(0, H - 16, W, H - 16);
    pdf.setFontSize(8); pdf.setTextColor(...MUTED); pdf.setFont("helvetica", "normal");
    pdf.text("Generated by FlowDocs · flowdocs.co.in", 15, H - 6);
    pdf.text(`FD-${(doc.id || "").slice(0, 8).toUpperCase()} · Page ${i}/${pageCount}`, W - 15, H - 6, { align: "right" });
  }

  return pdf;
}

// ── Download (accepts signatureDataUrl from Dashboard) ────────────────
export function downloadPDF(doc, profile, client, signatureDataUrl = null) {
  try {
    const pdf = generatePDF({ document: doc, profile, client, signatureDataUrl });
    const prefix = (doc.invoice_number || doc.title || "document").replace(/\s+/g, "-");
    pdf.save(`${prefix}-FlowDocs.pdf`);
    return true;
  } catch (err) {
    console.error("PDF generation failed:", err);
    return false;
  }
}

export function getPDFBlob(doc, profile, client, signatureDataUrl = null) {
  try {
    const pdf = generatePDF({ document: doc, profile, client, signatureDataUrl });
    return pdf.output("blob");
  } catch (err) {
    console.error("PDF blob failed:", err);
    return null;
  }
}

// ── Audit Trail ───────────────────────────────────────────────────────
export function generateAuditTrail({ document: doc, signerName, signerIp, signedAt, signatureUrl }) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210, H = 297;

  pdf.setFillColor(...DARK); pdf.rect(0, 0, W, H, "F");
  pdf.setFillColor(...GOLD); pdf.rect(0, 0, W, 3, "F");

  pdf.setFont("helvetica", "bold"); pdf.setFontSize(18);
  pdf.setTextColor(...GOLD); pdf.text("FlowDocs", 15, 18);
  pdf.setFontSize(9); pdf.setTextColor(...MUTED); pdf.setFont("helvetica", "normal");
  pdf.text("ELECTRONIC SIGNATURE AUDIT TRAIL", 15, 25);

  pdf.setFillColor(...GREEN); pdf.roundedRect(W - 55, 10, 40, 12, 2, 2, "F");
  pdf.setTextColor(...DARK); pdf.setFont("helvetica", "bold"); pdf.setFontSize(8);
  pdf.text("LEGALLY VALID", W - 35, 17.5, { align: "center" });
  pdf.setDrawColor(...GOLD); pdf.setLineWidth(0.3); pdf.line(0, 30, W, 30);

  let y = 42;
  pdf.setFontSize(14); pdf.setTextColor(...TEXT); pdf.setFont("helvetica", "bold");
  pdf.text("Document Signature Certificate", 15, y);
  y += 12;

  pdf.setFillColor(...SURFACE); pdf.roundedRect(14, y, W - 28, 48, 3, 3, "F");
  [
    ["Document Title", doc?.title || "—"],
    ["Document Type",  doc?.type  || "—"],
    ["Document ID",    (doc?.id   || "").slice(0, 16).toUpperCase()],
    ["Sign Token",     ((doc?.sign_token || "").slice(0, 20).toUpperCase() + "...")],
  ].forEach(([lbl, val], i) => {
    const fy = y + 9 + i * 10;
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(8); pdf.setTextColor(...MUTED);
    pdf.text(lbl.toUpperCase(), 20, fy);
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.setTextColor(...TEXT);
    pdf.text(String(val), 70, fy);
  });
  y += 58;

  pdf.setFontSize(11); pdf.setTextColor(...GOLD); pdf.setFont("helvetica", "bold");
  pdf.text("Signer Information", 15, y); y += 8;
  pdf.setFillColor(...SURFACE); pdf.roundedRect(14, y, W - 28, 52, 3, 3, "F");
  [
    ["Full Name",   signerName || "—"],
    ["IP Address",  signerIp   || "—"],
    ["Signed At",   signedAt ? new Date(signedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "—"],
    ["Agreement",   "Agreed to sign — IT Act 2000 compliant"],
  ].forEach(([lbl, val], i) => {
    const fy = y + 9 + i * 10;
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(8); pdf.setTextColor(...MUTED);
    pdf.text(lbl.toUpperCase(), 20, fy);
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(8.5); pdf.setTextColor(...TEXT);
    pdf.text(String(val), 70, fy);
  });
  y += 62;

  pdf.setFontSize(11); pdf.setTextColor(...GOLD); pdf.setFont("helvetica", "bold");
  pdf.text("Captured Signature", 15, y); y += 8;
  pdf.setFillColor(...SURFACE); pdf.roundedRect(14, y, W - 28, 35, 3, 3, "F");
  if (signatureUrl) {
    try { pdf.addImage(signatureUrl, "PNG", 20, y + 4, 80, 26); } catch (e) { console.warn("Audit signature render failed:", e); }
  }
  pdf.setDrawColor(...GREEN); pdf.setLineWidth(0.3); pdf.line(20, y + 32, 100, y + 32);
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(7.5); pdf.setTextColor(...GREEN);
  pdf.text("Digitally captured via FlowDocs eSign", 20, y + 37);
  y += 48;

  pdf.setFillColor(20, 60, 20); pdf.roundedRect(14, y, W - 28, 36, 3, 3, "F");
  pdf.setDrawColor(...GREEN); pdf.setLineWidth(0.4); pdf.roundedRect(14, y, W - 28, 36, 3, 3, "S");
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(9); pdf.setTextColor(...GREEN);
  pdf.text("Legal Validity", 20, y + 9);
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.setTextColor(...TEXT);
  const legalLines = pdf.splitTextToSize(
    "This signature is legally valid under: IT Act 2000 (India) · ESIGN Act (USA) · eIDAS (EU). Captured with explicit consent and tied to this document.",
    W - 48
  );
  pdf.text(legalLines, 20, y + 17);
  y += 46;

  pdf.setFillColor(...SURFACE); pdf.roundedRect(14, y, W - 28, 20, 3, 3, "F");
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(8); pdf.setTextColor(...GOLD);
  pdf.text("Verification ID", 20, y + 8);
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.setTextColor(...MUTED);
  pdf.text(`FlowDocs-${(doc?.id || "").slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`, 20, y + 15);

  pdf.setFillColor(...SURFACE); pdf.rect(0, H - 14, W, 14, "F");
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(7.5); pdf.setTextColor(...MUTED);
  pdf.text("Generated by FlowDocs · flowdocs.co.in", 15, H - 5);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, W - 15, H - 5, { align: "right" });

  return pdf;
}