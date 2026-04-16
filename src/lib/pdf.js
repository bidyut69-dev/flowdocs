import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const GOLD = [245, 166, 35];
const DARK = [12, 12, 14];
const SURFACE = [20, 20, 22];
const TEXT = [240, 238, 232];
const MUTED = [122, 120, 117];
const GREEN = [34, 197, 94];

// ── Currency Helpers (PDF-safe ASCII symbols) ──
// jsPDF's default helvetica font cannot render Unicode chars like ₹, €, £
// Using ASCII-safe alternatives for PDF rendering
const PDF_CURRENCIES = {
  INR: "Rs.",
  USD: "$",
  EUR: "EUR ",
  GBP: "GBP ",
  AED: "AED ",
  CAD: "CA$",
  AUD: "A$",
  SGD: "S$",
};
const getCurSymbol = (cur) => PDF_CURRENCIES[cur] || "Rs.";
const fmtAmount = (amount, cur) => `${getCurSymbol(cur)}${Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

export function generatePDF({ document: doc, profile, client, signatureDataUrl = null }) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const H = 297;
  const cur = doc.currency || profile?.default_currency || "INR";
  const sym = getCurSymbol(cur);

  // ── Background ──
  pdf.setFillColor(...DARK);
  pdf.rect(0, 0, W, H, "F");

  // ── Gold top bar ──
  pdf.setFillColor(...GOLD);
  pdf.rect(0, 0, W, 3, "F");

  // ── Header section ──
  pdf.setFillColor(...SURFACE);
  pdf.rect(0, 3, W, 42, "F");

  // Logo / Company name
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.setTextColor(...GOLD);
  pdf.text("FlowDocs", 15, 20);

  // Company info below logo
  pdf.setFontSize(8);
  pdf.setTextColor(...MUTED);
  pdf.setFont("helvetica", "normal");
  if (profile?.company) {
    pdf.text(profile.company, 15, 26);
  } else {
    pdf.text("FREELANCER SUITE", 15, 26);
  }
  if (profile?.gstin) {
    pdf.text(`GSTIN: ${profile.gstin}`, 15, 31);
  }
  if (profile?.pan) {
    pdf.text(`PAN: ${profile.pan}`, 15, 36);
  }

  // Document type badge + Invoice number
  pdf.setFillColor(...GOLD);
  pdf.roundedRect(W - 55, 10, 40, 10, 2, 2, "F");
  pdf.setTextColor(...DARK);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text(doc.type.toUpperCase(), W - 35, 16.5, { align: "center" });

  // Invoice number
  if (doc.invoice_number) {
    pdf.setFontSize(8);
    pdf.setTextColor(...GOLD);
    pdf.text(doc.invoice_number, W - 35, 27, { align: "center" });
  }

  // Currency badge
  pdf.setFontSize(7);
  pdf.setTextColor(...MUTED);
  pdf.text(`Currency: ${cur}`, W - 15, 36, { align: "right" });

  // Divider
  pdf.setDrawColor(...GOLD);
  pdf.setLineWidth(0.5);
  pdf.line(0, 45, W, 45);

  // ── Document title ──
  let y = 56;
  pdf.setFontSize(20);
  pdf.setTextColor(...TEXT);
  pdf.setFont("helvetica", "bold");
  const titleLines = pdf.splitTextToSize(doc.title, W - 30);
  pdf.text(titleLines, 15, y);
  y += titleLines.length * 8;

  // Doc ID + Date + Due Date
  y += 2;
  pdf.setFontSize(9);
  pdf.setTextColor(...MUTED);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Document ID: FD-${doc.id?.slice(0, 8).toUpperCase() || "XXXXXXXX"}`, 15, y);
  pdf.text(`Date: ${new Date(doc.created_at || Date.now()).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`, W - 15, y, { align: "right" });

  if (doc.due_date) {
    y += 5;
    pdf.setTextColor(...GOLD);
    pdf.text(`Due Date: ${new Date(doc.due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`, W - 15, y, { align: "right" });
  }

  // ── From / To boxes ──
  y += 10;
  pdf.setFillColor(...SURFACE);
  pdf.roundedRect(14, y, 85, 44, 3, 3, "F");
  pdf.roundedRect(111, y, 85, 44, 3, 3, "F");

  // From
  pdf.setFontSize(8);
  pdf.setTextColor(...GOLD);
  pdf.setFont("helvetica", "bold");
  pdf.text("FROM", 20, y + 8);
  pdf.setTextColor(...TEXT);
  pdf.setFontSize(11);
  pdf.text(profile?.name || "Your Name", 20, y + 16);
  pdf.setFontSize(9);
  pdf.setTextColor(...MUTED);
  pdf.setFont("helvetica", "normal");
  pdf.text(profile?.company || "", 20, y + 23);
  pdf.text(profile?.email || "", 20, y + 29);
  if (profile?.state) pdf.text(profile.state, 20, y + 35);
  if (profile?.gstin) {
    pdf.setFontSize(7);
    pdf.setTextColor(...GOLD);
    pdf.text(`GSTIN: ${profile.gstin}`, 20, y + 41);
  }

  // To
  pdf.setFontSize(8);
  pdf.setTextColor(...GOLD);
  pdf.setFont("helvetica", "bold");
  pdf.text("TO", 117, y + 8);
  pdf.setTextColor(...TEXT);
  pdf.setFontSize(11);
  pdf.text(client?.name || doc.client_name || "Client Name", 117, y + 16);
  pdf.setFontSize(9);
  pdf.setTextColor(...MUTED);
  pdf.setFont("helvetica", "normal");
  pdf.text(client?.company || "", 117, y + 23);
  pdf.text(client?.email || "", 117, y + 29);
  if (client?.state) pdf.text(client.state, 117, y + 35);
  if (client?.gstin) {
    pdf.setFontSize(7);
    pdf.setTextColor(...GOLD);
    pdf.text(`GSTIN: ${client.gstin}`, 117, y + 41);
  }

  y += 54;

  // ── Content based on doc type ──
  if (doc.type === "Invoice" && doc.content?.items) {
    // HSN/SAC code header
    if (doc.hsn_sac) {
      pdf.setFontSize(8);
      pdf.setTextColor(...MUTED);
      pdf.text(`HSN/SAC: ${doc.hsn_sac}`, 15, y);
      y += 6;
    }

    // Items table
    const tableData = doc.content.items.map((item, i) => [
      i + 1,
      item.description,
      item.qty || 1,
      `${sym}${Number(item.rate || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      `${sym}${Number((item.qty || 1) * (item.rate || 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
    ]);

    const subtotal = doc.content.items.reduce((s, i) => s + (i.qty || 1) * (i.rate || 0), 0);
    const taxType = doc.tax_type || "none";
    const taxRate = doc.tax_rate || 18;

    const tableResult = autoTable(pdf, {
      startY: y,
      head: [["#", "Description", "Qty", "Rate", "Amount"]],
      body: tableData,
      theme: "plain",
      headStyles: { fillColor: GOLD, textColor: DARK, fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fillColor: SURFACE, textColor: TEXT, fontSize: 9 },
      alternateRowStyles: { fillColor: [28, 28, 31] },
      columnStyles: {
        0: { cellWidth: 12, halign: "center" },
        1: { cellWidth: 80 },
        2: { cellWidth: 18, halign: "center" },
        3: { cellWidth: 30, halign: "right" },
        4: { cellWidth: 35, halign: "right" },
      },
      margin: { left: 14, right: 14 },
    });

    y = (tableResult?.finalY ?? pdf.lastAutoTable?.finalY ?? y) + 6;

    // Totals Box (with GST breakdown)
    const totalsHeight = taxType !== "none" && taxType ? 50 : 34;
    pdf.setFillColor(...SURFACE);
    pdf.roundedRect(110, y, 86, totalsHeight, 3, 3, "F");

    let ty = y + 8;
    pdf.setFontSize(9);
    pdf.setTextColor(...MUTED);
    pdf.setFont("helvetica", "normal");
    pdf.text("Subtotal", 116, ty);
    pdf.text(fmtAmount(subtotal, cur), 192, ty, { align: "right" });

    if (taxType === "cgst_sgst") {
      ty += 8;
      pdf.text(`CGST (${taxRate / 2}%)`, 116, ty);
      pdf.text(fmtAmount(subtotal * taxRate / 200, cur), 192, ty, { align: "right" });
      ty += 8;
      pdf.text(`SGST (${taxRate / 2}%)`, 116, ty);
      pdf.text(fmtAmount(subtotal * taxRate / 200, cur), 192, ty, { align: "right" });
    } else if (taxType === "igst") {
      ty += 8;
      pdf.text(`IGST (${taxRate}%)`, 116, ty);
      pdf.text(fmtAmount(subtotal * taxRate / 100, cur), 192, ty, { align: "right" });
    }

    ty += 4;
    pdf.setDrawColor(...GOLD);
    pdf.line(116, ty, 192, ty);
    ty += 8;
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...GOLD);
    pdf.setFontSize(12);
    pdf.text("TOTAL", 116, ty);

    const totalAmount = taxType !== "none" && taxType
      ? subtotal * (1 + taxRate / 100)
      : subtotal;
    pdf.text(fmtAmount(totalAmount, cur), 192, ty, { align: "right" });

    y += totalsHeight + 8;

    // Bank / UPI Details (if provided)
    if (profile?.bank_name || profile?.upi_id) {
      pdf.setFillColor(...SURFACE);
      const bankHeight = profile?.upi_id ? 36 : 28;
      pdf.roundedRect(14, y, W - 28, bankHeight, 3, 3, "F");

      pdf.setFontSize(8);
      pdf.setTextColor(...GOLD);
      pdf.setFont("helvetica", "bold");
      pdf.text("PAYMENT DETAILS", 20, y + 8);

      pdf.setFontSize(9);
      pdf.setTextColor(...TEXT);
      pdf.setFont("helvetica", "normal");

      let py = y + 16;
      if (profile.bank_name) {
        pdf.text(`Bank: ${profile.bank_name}`, 20, py);
        if (profile.bank_account) pdf.text(`A/C: ${profile.bank_account}`, 105, py);
        py += 6;
        if (profile.bank_ifsc) pdf.text(`IFSC: ${profile.bank_ifsc}`, 20, py);
      }
      if (profile.upi_id) {
        py += 6;
        pdf.setTextColor(...GOLD);
        pdf.setFont("helvetica", "bold");
        pdf.text(`UPI: ${profile.upi_id}`, 20, py);
      }

      y += bankHeight + 8;
    }

  } else {
    // Proposal / Contract / NDA body
    pdf.setFontSize(9);
    pdf.setTextColor(...MUTED);
    pdf.setFont("helvetica", "bold");
    pdf.text("DESCRIPTION", 15, y);
    y += 8;

    const bodyText = doc.content?.description ||
      `This ${doc.type} is issued by ${profile?.name || "Service Provider"} for services rendered to ${client?.name || "Client"}.

All work is subject to the agreed terms and conditions. Payment is due within 30 days of document signing unless otherwise specified. Any disputes shall be resolved as per applicable laws.

By signing this document, both parties agree to the terms outlined herein.`;

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...TEXT);
    pdf.setFontSize(10);

    const lines = pdf.splitTextToSize(bodyText, W - 44);

    // Check if text is long — need multi-page?
    const lineHeight = 5;
    const availableHeight = H - y - 80; // space for signature + footer
    const totalTextHeight = lines.length * lineHeight;

    if (totalTextHeight > availableHeight) {
      // Multi-page content
      let currentY = y;

      for (let i = 0; i < lines.length; i++) {
        if (currentY > H - 80 && i < lines.length - 1) {
          // Add footer to current page
          pdf.setFillColor(...SURFACE);
          pdf.rect(0, H - 18, W, 18, "F");
          pdf.setFontSize(8);
          pdf.setTextColor(...MUTED);
          pdf.text(`Page ${pdf.getNumberOfPages()} · Generated by FlowDocs`, 15, H - 8);

          // New page
          pdf.addPage();
          pdf.setFillColor(...DARK);
          pdf.rect(0, 0, W, H, "F");
          pdf.setFillColor(...GOLD);
          pdf.rect(0, 0, W, 2, "F");
          currentY = 20;
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(...TEXT);
          pdf.setFontSize(10);
        }
        pdf.text(lines[i], 20, currentY);
        currentY += lineHeight;
      }
      y = currentY + 8;
    } else {
      pdf.setFillColor(...SURFACE);
      const boxHeight = Math.max(totalTextHeight + 16, 50);
      pdf.roundedRect(14, y, W - 28, boxHeight, 3, 3, "F");
      pdf.text(lines, 20, y + 10);
      y += boxHeight + 8;
    }

    // Amount if present
    if (doc.amount) {
      pdf.setFillColor(...GOLD);
      pdf.roundedRect(14, y, W - 28, 16, 3, 3, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...DARK);
      pdf.setFontSize(12);
      pdf.text(`Total Value: ${fmtAmount(doc.amount, cur)} ${cur}`, W / 2, y + 10, { align: "center" });
      y += 24;
    }
  }

  // ── Signature section ──
  // Check if we need a new page for signature
  if (y > H - 70) {
    pdf.addPage();
    pdf.setFillColor(...DARK);
    pdf.rect(0, 0, W, H, "F");
    pdf.setFillColor(...GOLD);
    pdf.rect(0, 0, W, 2, "F");
    y = 20;
  }

  y += 4;
  pdf.setFontSize(9);
  pdf.setTextColor(...MUTED);
  pdf.setFont("helvetica", "bold");
  pdf.text("SIGNATURES", 15, y);
  y += 8;

  // Client signature box
  pdf.setFillColor(...SURFACE);
  pdf.roundedRect(14, y, 85, 45, 3, 3, "F");
  pdf.setFontSize(8);
  pdf.setTextColor(...GOLD);
  pdf.text("CLIENT SIGNATURE", 20, y + 8);

  if (signatureDataUrl) {
    try {
      pdf.addImage(signatureDataUrl, "PNG", 18, y + 10, 75, 25);
    } catch {
      // Ignore bad signature image data and render the unsigned line fallback.
    }
    pdf.setDrawColor(...GREEN);
    pdf.setLineWidth(0.3);
    pdf.line(18, y + 37, 90, y + 37);
    pdf.setFontSize(7);
    pdf.setTextColor(...GREEN);
    pdf.text(`✓ Signed digitally on ${new Date().toLocaleString()}`, 20, y + 42);
  } else {
    pdf.setDrawColor(...MUTED);
    pdf.setLineWidth(0.3);
    pdf.line(18, y + 37, 90, y + 37);
    pdf.setFontSize(8);
    pdf.setTextColor(...MUTED);
    pdf.text("Signature", 20, y + 43);
  }

  // Provider signature box
  pdf.setFillColor(...SURFACE);
  pdf.roundedRect(111, y, 85, 45, 3, 3, "F");
  pdf.setFontSize(8);
  pdf.setTextColor(...GOLD);
  pdf.text("YOUR SIGNATURE", 117, y + 8);
  pdf.setDrawColor(...MUTED);
  pdf.setLineWidth(0.3);
  pdf.line(115, y + 37, 188, y + 37);
  pdf.setFontSize(8);
  pdf.setTextColor(...MUTED);
  pdf.text("Authorized Signatory", 117, y + 43);

  // ── Notes ──
  if (doc.notes) {
    y += 52;
    pdf.setFontSize(8);
    pdf.setTextColor(...MUTED);
    pdf.setFont("helvetica", "italic");
    pdf.text(`Note: ${doc.notes}`, 15, y);
  }

  // ── Footer ──
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFillColor(...SURFACE);
    pdf.rect(0, H - 18, W, 18, "F");
    pdf.setDrawColor(...GOLD);
    pdf.setLineWidth(0.3);
    pdf.line(0, H - 18, W, H - 18);
    pdf.setFontSize(8);
    pdf.setTextColor(...MUTED);
    pdf.setFont("helvetica", "normal");
    pdf.text("Generated by FlowDocs · flowdocs.app", 15, H - 8);
    pdf.text(`FD-${doc.id?.slice(0, 8).toUpperCase() || "XXXXXXXX"} · Page ${i}/${pageCount}`, W - 15, H - 8, { align: "right" });
  }

  return pdf;
}

export function downloadPDF(doc, profile, client, signatureDataUrl = null) {
  try {
    const pdf = generatePDF({ document: doc, profile, client, signatureDataUrl });
    const prefix = doc.invoice_number || doc.title.replace(/\s+/g, "-");
    pdf.save(`${prefix}-FlowDocs.pdf`);
    return true;
  } catch (err) {
    console.error("PDF generation failed:", err);
    alert("PDF generation failed: " + (err.message || "Unknown error"));
    return false;
  }
}

export function getPDFBlob(doc, profile, client, signatureDataUrl = null) {
  try {
    const pdf = generatePDF({ document: doc, profile, client, signatureDataUrl });
    return pdf.output("blob");
  } catch (err) {
    console.error("PDF blob generation failed:", err);
    return null;
  }
}

