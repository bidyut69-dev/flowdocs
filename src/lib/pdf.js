import jsPDF from "jspdf";
import "jspdf-autotable";

const GOLD = [245, 166, 35];
const DARK = [12, 12, 14];
const SURFACE = [20, 20, 22];
const TEXT = [240, 238, 232];
const MUTED = [122, 120, 117];
const GREEN = [34, 197, 94];

// ─────────────────────────────────────────────
// Utility Validators
// ─────────────────────────────────────────────
function isValidImage(data) {
  return typeof data === "string" && data.startsWith("data:image");
}

function safeText(value, fallback = "—") {
  return value ? String(value) : fallback;
}

// ─────────────────────────────────────────────
// Main PDF Generator
// ─────────────────────────────────────────────
export function generatePDF({ document: doc, profile, client, signatureDataUrl = null }) {
  if (!doc) throw new Error("Document is required");

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const H = 297;

  // Background
  pdf.setFillColor(...DARK);
  pdf.rect(0, 0, W, H, "F");

  // Header bar
  pdf.setFillColor(...GOLD);
  pdf.rect(0, 0, W, 3, "F");

  pdf.setFillColor(...SURFACE);
  pdf.rect(0, 3, W, 40, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.setTextColor(...GOLD);
  pdf.text("⚡ FlowDocs", 15, 20);

  pdf.setFontSize(8);
  pdf.setTextColor(...MUTED);
  pdf.setFont("helvetica", "normal");
  pdf.text("FREELANCER SUITE", 15, 26);

  pdf.setFillColor(...GOLD);
  pdf.roundedRect(W - 50, 10, 35, 10, 2, 2, "F");
  pdf.setTextColor(...DARK);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text(safeText(doc.type, "DOC").toUpperCase(), W - 32.5, 16.5, { align: "center" });

  pdf.setDrawColor(...GOLD);
  pdf.setLineWidth(0.5);
  pdf.line(0, 43, W, 43);

  let y = 56;

  pdf.setFontSize(22);
  pdf.setTextColor(...TEXT);
  pdf.setFont("helvetica", "bold");
  pdf.text(safeText(doc.title, "Untitled Document"), 15, y);

  y += 8;
  pdf.setFontSize(9);
  pdf.setTextColor(...MUTED);
  pdf.setFont("helvetica", "normal");

  pdf.text(`Document ID: FD-${safeText(doc.id, "XXXXXXXX").slice(0, 8).toUpperCase()}`, 15, y);
  pdf.text(
    `Date: ${new Date(doc.created_at || Date.now()).toLocaleDateString("en-IN")}`,
    W - 15,
    y,
    { align: "right" }
  );

  y += 12;

  pdf.setFillColor(...SURFACE);
  pdf.roundedRect(14, y, 85, 38, 3, 3, "F");
  pdf.roundedRect(111, y, 85, 38, 3, 3, "F");

  // FROM
  pdf.setFontSize(8);
  pdf.setTextColor(...GOLD);
  pdf.setFont("helvetica", "bold");
  pdf.text("FROM", 20, y + 8);

  pdf.setTextColor(...TEXT);
  pdf.setFontSize(11);
  pdf.text(safeText(profile?.name, "Your Name"), 20, y + 16);

  pdf.setFontSize(9);
  pdf.setTextColor(...MUTED);
  pdf.setFont("helvetica", "normal");
  pdf.text(safeText(profile?.company, ""), 20, y + 23);
  pdf.text(safeText(profile?.email, ""), 20, y + 29);

  // TO
  pdf.setFontSize(8);
  pdf.setTextColor(...GOLD);
  pdf.setFont("helvetica", "bold");
  pdf.text("TO", 117, y + 8);

  pdf.setTextColor(...TEXT);
  pdf.setFontSize(11);
  pdf.text(safeText(client?.name || doc.client_name, "Client"), 117, y + 16);

  pdf.setFontSize(9);
  pdf.setTextColor(...MUTED);
  pdf.setFont("helvetica", "normal");
  pdf.text(safeText(client?.company, ""), 117, y + 23);
  pdf.text(safeText(client?.email, ""), 117, y + 29);

  y += 48;

  // ── Signature Section (FIXED) ──
  pdf.setFontSize(9);
  pdf.setTextColor(...MUTED);
  pdf.setFont("helvetica", "bold");
  pdf.text("SIGNATURES", 15, y);

  y += 8;

  pdf.setFillColor(...SURFACE);
  pdf.roundedRect(14, y, 85, 45, 3, 3, "F");

  pdf.setFontSize(8);
  pdf.setTextColor(...GOLD);
  pdf.text("CLIENT SIGNATURE", 20, y + 8);

  if (isValidImage(signatureDataUrl)) {
    try {
      pdf.addImage(signatureDataUrl, "PNG", 18, y + 10, 75, 25);
    } catch (err) {
      console.error("Signature image failed:", err);

      pdf.setTextColor(...MUTED);
      pdf.setFontSize(8);
      pdf.text("Signature failed to load", 20, y + 20);
    }

    pdf.setDrawColor(...GREEN);
    pdf.line(18, y + 37, 90, y + 37);

    pdf.setFontSize(7);
    pdf.setTextColor(...GREEN);
    pdf.text(`✓ Signed on ${new Date().toLocaleString()}`, 20, y + 42);
  } else {
    pdf.setDrawColor(...MUTED);
    pdf.line(18, y + 37, 90, y + 37);

    pdf.setFontSize(8);
    pdf.setTextColor(...MUTED);
    pdf.text("Signature", 20, y + 43);
  }

  return pdf;
}

// ─────────────────────────────────────────────
// Download
// ─────────────────────────────────────────────
export function downloadPDF(doc, profile, client, signatureDataUrl = null) {
  const pdf = generatePDF({ document: doc, profile, client, signatureDataUrl });
  pdf.save(`${safeText(doc.title, "document").replace(/\s+/g, "-")}.pdf`);
}

// ─────────────────────────────────────────────
// Blob
// ─────────────────────────────────────────────
export function getPDFBlob(doc, profile, client, signatureDataUrl = null) {
  const pdf = generatePDF({ document: doc, profile, client, signatureDataUrl });
  return pdf.output("blob");
}
