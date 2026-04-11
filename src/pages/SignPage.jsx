import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { sendSignedConfirmation } from "../lib/email";

const C = {
  bg: "#0C0C0E", surface: "#141416", surface2: "#1C1C1F", border: "#2A2A2E",
  gold: "#F5A623", goldDim: "#F5A62320", text: "#F0EEE8", dim: "#7A7875",
  mid: "#B0ADA8", green: "#22C55E", greenDim: "#22C55E20", red: "#EF4444",
};

export default function SignPage() {
  const { token } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signed, setSigned] = useState(false);
  const [signing, setSigning] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [name, setName] = useState("");
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  const fetchDoc = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("documents")
      .select("*, clients(name, email, company), profiles(name, company, email)")
      .eq("sign_token", token)
      .single();

    if (error || !data) { setError("Document not found or link is invalid."); }
    else { setDoc(data); if (data.status === "signed") setSigned(true); }
    setLoading(false);
  };

  useEffect(() => {
    fetchDoc();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Canvas setup — improved touch + DPI scaling
  useEffect(() => {
    if (!doc || doc.status === "signed") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Fix DPI for sharp rendering on mobile
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = "#F5A623";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = "rgba(245, 166, 35, 0.3)";
    ctx.shadowBlur = 2;

    let lastX = 0, lastY = 0;

    const getPos = (e) => {
      const r = canvas.getBoundingClientRect();
      const src = e.touches ? e.touches[0] : e;
      return {
        x: (src.clientX - r.left),
        y: (src.clientY - r.top),
      };
    };

    const start = (e) => {
      e.preventDefault();
      isDrawing.current = true;
      const p = getPos(e);
      lastX = p.x; lastY = p.y;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    };

    const draw = (e) => {
      e.preventDefault();
      if (!isDrawing.current) return;
      const p = getPos(e);
      // Smooth curve through midpoint
      ctx.quadraticCurveTo(lastX, lastY, (p.x + lastX) / 2, (p.y + lastY) / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo((p.x + lastX) / 2, (p.y + lastY) / 2);
      lastX = p.x; lastY = p.y;
    };

    const stop = () => {
      if (!isDrawing.current) return;
      isDrawing.current = false;
      ctx.beginPath();
    };

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stop);
    canvas.addEventListener("mouseleave", stop);
    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", stop);
    canvas.addEventListener("touchcancel", stop);

    return () => {
      canvas.removeEventListener("mousedown", start);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stop);
      canvas.removeEventListener("mouseleave", stop);
      canvas.removeEventListener("touchstart", start);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", stop);
      canvas.removeEventListener("touchcancel", stop);
    };
  }, [doc]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const isCanvasEmpty = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    return !data.some(v => v !== 0);
  };

  const handleSign = async () => {
    if (!name.trim()) return alert("Please enter your full name.");
    if (!agreed) return alert("Please agree to the terms.");
    if (isCanvasEmpty()) return alert("Please draw your signature.");

    setSigning(true);
    const canvas = canvasRef.current;
    const signatureDataUrl = canvas.toDataURL("image/png");

    // Upload signature to Supabase Storage
    const blob = await (await fetch(signatureDataUrl)).blob();
    const fileName = `${doc.id}-${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from("signatures")
      .upload(fileName, blob, { contentType: "image/png" });

    if (uploadError) { setSigning(false); return alert("Upload failed. Try again."); }

    const { data: { publicUrl } } = supabase.storage.from("signatures").getPublicUrl(fileName);

    // Update document
    const { error: updateError } = await supabase.from("documents").update({
      status: "signed",
      signature_url: publicUrl,
      signed_at: new Date().toISOString(),
    }).eq("id", doc.id);

    if (updateError) { setSigning(false); return alert("Signing failed. Try again."); }

    // Send notification email to document owner
    if (doc.profiles?.email) {
      await sendSignedConfirmation({
        to: doc.profiles.email,
        ownerName: doc.profiles.name || "there",
        clientName: name,
        docTitle: doc.title,
      });
    }

    setSigned(true);
    setSigning(false);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: C.gold, fontFamily: "'Syne', sans-serif", fontSize: 18 }}>Loading document...</div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, color: C.text, marginBottom: 8 }}>Document Not Found</div>
        <div style={{ color: C.dim, fontSize: 14 }}>{error}</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif", padding: "32px 16px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono&family=DM+Sans:wght@400;500;700&display=swap');`}</style>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: C.gold, marginBottom: 6 }}>⚡ FlowDocs</div>
          <div style={{ fontSize: 13, color: C.dim }}>Secure Document Signing</div>
        </div>

        {/* Document card */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ height: 3, background: C.gold }} />
          <div style={{ padding: "24px 28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 10, color: C.dim, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>
                  {doc.type}
                </div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: C.text }}>{doc.title}</div>
              </div>
              <div style={{
                background: signed ? C.greenDim : C.goldDim,
                border: `1px solid ${signed ? C.green : C.gold}`,
                color: signed ? C.green : C.gold,
                borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 700, fontFamily: "'DM Mono', monospace",
              }}>
                {signed ? "✓ Signed" : "Pending Signature"}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              <div style={{ background: C.surface2, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, color: C.gold, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>From</div>
                <div style={{ fontWeight: 600, color: C.text, fontSize: 14 }}>{doc.profiles?.name || "Service Provider"}</div>
                <div style={{ fontSize: 12, color: C.dim }}>{doc.profiles?.company}</div>
              </div>
              <div style={{ background: C.surface2, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, color: C.gold, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>To</div>
                <div style={{ fontWeight: 600, color: C.text, fontSize: 14 }}>{doc.clients?.name || "You"}</div>
                <div style={{ fontSize: 12, color: C.dim }}>{doc.clients?.company}</div>
              </div>
            </div>

            {doc.amount && (
              <div style={{ background: C.goldDim, border: `1px solid ${C.gold}`, borderRadius: 10, padding: "14px 18px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: C.mid }}>Document Value</span>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: C.gold }}>${Number(doc.amount).toFixed(2)}</span>
              </div>
            )}

            {doc.content?.description && (
              <div style={{ background: C.surface2, borderRadius: 10, padding: 16, marginBottom: 4 }}>
                <div style={{ fontSize: 10, color: C.dim, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 8 }}>Description</div>
                <div style={{ fontSize: 13, color: C.mid, lineHeight: 1.7 }}>{doc.content.description}</div>
              </div>
            )}

            {doc.content?.items && (
              <div style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 10, color: C.dim, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 10 }}>Invoice Items</div>
                {doc.content.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: i % 2 === 0 ? C.surface2 : "transparent", borderRadius: 8, marginBottom: 4 }}>
                    <span style={{ color: C.text, fontSize: 13 }}>{item.description}</span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: C.gold }}>${((item.qty || 1) * (item.rate || 0)).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── SIGNED SUCCESS ── */}
        {signed ? (
          <div style={{ background: C.surface, border: `1px solid ${C.green}`, borderRadius: 16, padding: "40px 28px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: C.green, marginBottom: 8 }}>Document Signed!</div>
            <div style={{ fontSize: 14, color: C.mid, lineHeight: 1.7 }}>
              Thank you. Your signature has been recorded and the document owner has been notified.
              {doc.signed_at && <><br />Signed on {new Date(doc.signed_at).toLocaleString()}</>}
            </div>
          </div>
        ) : (
          /* ── SIGNING FORM ── */
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "28px" }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 20 }}>
              Sign This Document
            </div>

            {/* Full name */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, color: C.dim, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", display: "block", marginBottom: 8 }}>
                Your Full Name *
              </label>
              <input
                style={{ width: "100%", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "11px 14px", fontSize: 14, color: C.text, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" }}
                placeholder="Type your full legal name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            {/* Signature Canvas */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, color: C.dim, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", display: "block", marginBottom: 8 }}>
                Draw Your Signature *
              </label>
              <canvas
                ref={canvasRef}
                style={{
                  width: "100%",
                  height: 180,
                  background: "#1C1C1F",
                  border: `2px dashed ${C.gold}`,
                  borderRadius: 12,
                  cursor: "crosshair",
                  display: "block",
                  touchAction: "none",
                  WebkitUserSelect: "none",
                  userSelect: "none",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <div style={{ fontSize: 11, color: C.dim }}>✍ Draw with finger or mouse — take your time</div>
                <button onClick={clearCanvas} style={{ fontSize: 12, color: C.gold, background: "none", border: `1px solid ${C.gold}`, borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Clear</button>
              </div>
            </div>

            {/* Agreement */}
            <div style={{ background: C.surface2, borderRadius: 10, padding: 16, marginBottom: 24, display: "flex", gap: 12, alignItems: "flex-start" }}>
              <input type="checkbox" id="agree" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                style={{ marginTop: 3, accentColor: C.gold, width: 16, height: 16, flexShrink: 0 }} />
              <label htmlFor="agree" style={{ fontSize: 12, color: C.mid, lineHeight: 1.6, cursor: "pointer" }}>
                I agree to sign this document electronically. I understand this constitutes a legally binding signature equivalent to a handwritten signature under applicable eSignature laws (IT Act 2000, ESIGN Act, eIDAS).
              </label>
            </div>

            {/* Legal info */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 }}>
              {[
                { icon: "🔒", label: "Encrypted", sub: "256-bit SSL" },
                { icon: "⚖️", label: "Legally Valid", sub: "IT Act 2000" },
                { icon: "📋", label: "Audit Trail", sub: "IP + timestamp" },
              ].map((f, i) => (
                <div key={i} style={{ textAlign: "center", padding: "12px 8px", background: C.surface2, borderRadius: 10 }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{f.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{f.label}</div>
                  <div style={{ fontSize: 10, color: C.dim }}>{f.sub}</div>
                </div>
              ))}
            </div>

            <button
              style={{
                width: "100%", background: agreed ? C.gold : C.surface2, color: agreed ? "#0C0C0E" : C.dim,
                border: "none", borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 700,
                cursor: agreed ? "pointer" : "not-allowed", fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.2s",
              }}
              onClick={handleSign}
              disabled={signing || !agreed}
            >
              {signing ? "Signing document..." : "✍ Sign & Submit →"}
            </button>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: C.dim }}>
          Powered by <span style={{ color: C.gold }}>⚡ FlowDocs</span> · Secure document signing
        </div>
      </div>
    </div>
  );
}