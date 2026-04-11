import jsPDF from "jspdf";
import "jspdf-autotable";

const GOLD = [245, 166, 35];
const DARK = [12, 12, 14];
const SURFACE = [20, 20, 22];
const TEXT = [240, 238, 232];
const MUTED = [122, 120, 117];
const GREEN = [34, 197, 94];



export function generatePDF({ document: doc, profile, client, signatureDataUrl = null }) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const H = 297;

  // ── Background ──
  pdf.setFillColor(...DARK);
  pdf.rect(0, 0, W, H, "F");

  // ── Gold top bar ──
  pdf.setFillColor(...GOLD);
  pdf.rect(0, 0, W, 3, "F");

  // ── Header section ──
  pdf.setFillColor(...SURFACE);
  pdf.rect(0, 3, W, 40, "F");

  // Logo / Company name
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.setTextColor(...GOLD);
  pdf.text("⚡ FlowDocs", 15, 20);

  pdf.setFontSize(8);
  pdf.setTextColor(...MUTED);
  pdf.setFont("helvetica", "normal");
  pdf.text("FREELANCER SUITE", 15, 26);

  // Document type badge
  pdf.setFillColor(...GOLD);
  pdf.roundedRect(W - 50, 10, 35, 10, 2, 2, "F");
  pdf.setTextColor(...DARK);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text(doc.type.toUpperCase(), W - 32.5, 16.5, { align: "center" });

  // Divider
  pdf.setDrawColor(...GOLD);
  pdf.setLineWidth(0.5);
  pdf.line(0, 43, W, 43);

  // ── Document title ──
  let y = 56;
  pdf.setFontSize(22);
  pdf.setTextColor(...TEXT);
  pdf.setFont("helvetica", "bold");
  pdf.text(doc.title, 15, y);

  // Doc ID + Date
  y += 8;
  pdf.setFontSize(9);
  pdf.setTextColor(...MUTED);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Document ID: FD-${doc.id?.slice(0, 8).toUpperCase() || "XXXXXXXX"}`, 15, y);
  pdf.text(`Date: ${new Date(doc.created_at || Date.now()).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`, W - 15, y, { align: "right" });

  // ── From / To boxes ──
  y += 12;
  pdf.setFillColor(...SURFACE);
  pdf.roundedRect(14, y, 85, 38, 3, 3, "F");
  pdf.roundedRect(111, y, 85, 38, 3, 3, "F");

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
  pdf.text(profile?.company || "Your Company", 20, y + 23);
  pdf.text(profile?.email || "", 20, y + 29);

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

  y += 48;

  // ── Content based on doc type ──
  if (doc.type === "Invoice" && doc.content?.items) {
    // Items table
    const tableData = doc.content.items.map((item, i) => [
      i + 1,
      item.description,
      item.qty || 1,
      `$${Number(item.rate || 0).toFixed(2)}`,
      `$${Number((item.qty || 1) * (item.rate || 0)).toFixed(2)}`,
    ]);

    const subtotal = doc.content.items.reduce((s, i) => s + (i.qty || 1) * (i.rate || 0), 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

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
        1: { cellWidth: 80 },
        2: { cellWidth: 18, halign: "center" },
        3: { cellWidth: 30, halign: "right" },
        4: { cellWidth: 35, halign: "right" },
      },
      margin: { left: 14, right: 14 },
    });

    y = pdf.lastAutoTable.finalY + 6;

    // Totals
    pdf.setFillColor(...SURFACE);
    pdf.roundedRect(130, y, 66, 34, 3, 3, "F");
    pdf.setFontSize(9);
    pdf.setTextColor(...MUTED);
    pdf.setFont("helvetica", "normal");
    pdf.text("Subtotal", 136, y + 8);
    pdf.text(`$${subtotal.toFixed(2)}`, 192, y + 8, { align: "right" });
    pdf.text("Tax (18% GST)", 136, y + 16);
    pdf.text(`$${tax.toFixed(2)}`, 192, y + 16, { align: "right" });
    pdf.setDrawColor(...GOLD);
    pdf.line(136, y + 20, 192, y + 20);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...GOLD);
    pdf.setFontSize(11);
    pdf.text("TOTAL", 136, y + 28);
    pdf.text(`$${total.toFixed(2)}`, 192, y + 28, { align: "right" });
    y += 44;

  } else {
    // Proposal / Contract / NDA body
    pdf.setFontSize(9);
    pdf.setTextColor(...MUTED);
    pdf.setFont("helvetica", "bold");
    pdf.text("DESCRIPTION", 15, y);
    y += 8;

    pdf.setFillColor(...SURFACE);
    pdf.roundedRect(14, y, W - 28, 50, 3, 3, "F");

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...TEXT);
    pdf.setFontSize(10);

    const bodyText = doc.content?.description ||
      `This ${doc.type} is issued by ${profile?.name || "Service Provider"} for services rendered to ${client?.name || "Client"}.

All work is subject to the agreed terms and conditions. Payment is due within 30 days of document signing unless otherwise specified. Any disputes shall be resolved as per applicable laws.

By signing this document, both parties agree to the terms outlined herein.`;

    const lines = pdf.splitTextToSize(bodyText, W - 44);
    pdf.text(lines, 20, y + 10);
    y += 62;

    // Amount if present
    if (doc.amount) {
      pdf.setFillColor(...GOLD);
      pdf.roundedRect(14, y, W - 28, 16, 3, 3, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...DARK);
      pdf.setFontSize(12);
      pdf.text(`Total Value: $${Number(doc.amount).toFixed(2)} USD`, W / 2, y + 10, { align: "center" });
      y += 24;
    }
  }

  // ── Signature section ──
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
      // signature image load failed — continue without it
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

  // ── Footer ──
  pdf.setFillColor(...SURFACE);
  pdf.rect(0, H - 18, W, 18, "F");
  pdf.setDrawColor(...GOLD);
  pdf.setLineWidth(0.3);
  pdf.line(0, H - 18, W, H - 18);
  pdf.setFontSize(8);
  pdf.setTextColor(...MUTED);
  pdf.setFont("helvetica", "normal");
  pdf.text("Generated by FlowDocs · flowdocs.co.in", 15, H - 8);
  pdf.text(`FD-${doc.id?.slice(0, 8).toUpperCase() || "XXXXXXXX"} · Confidential`, W - 15, H - 8, { align: "right" });

  return pdf;
}

export function downloadPDF(doc, profile, client, signatureDataUrl = null) {
  const pdf = generatePDF({ document: doc, profile, client, signatureDataUrl });
  pdf.save(`${doc.title.replace(/\s+/g, "-")}-FlowDocs.pdf`);
}

export function getPDFBlob(doc, profile, client, signatureDataUrl = null) {
  const pdf = generatePDF({ document: doc, profile, client, signatureDataUrl });
  return pdf.output("blob");
}