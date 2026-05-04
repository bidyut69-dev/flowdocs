import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { sendSignedConfirmation, sendPaymentReceived } from "../lib/email";
import { openInvoicePayment, markInvoicePaid } from "../lib/payment";

const C = {
  bg: "#0C0C0E", surface: "#141416", surface2: "#1C1C1F", border: "#2A2A2E",
  gold: "#F5A623", goldDim: "#F5A62320", goldDim2: "#F5A62312",
  text: "#F0EEE8", dim: "#7A7875", mid: "#B0ADA8",
  green: "#22C55E", greenDim: "#22C55E20",
  red: "#EF4444", redDim: "#EF444420",
};

// ── Step indicator ───────────────────────────────────────────────────────
function StepBadge({ num, label, active, done }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%", display: "flex",
        alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700,
        background: done ? C.green : active ? C.gold : C.surface2,
        color: done || active ? "#0C0C0E" : C.dim,
        border: `2px solid ${done ? C.green : active ? C.gold : C.border}`,
        transition: "all 0.3s",
      }}>
        {done ? "✓" : num}
      </div>
      <span style={{ fontSize: 10, color: done ? C.green : active ? C.gold : C.dim, fontFamily: "'DM Mono', monospace", letterSpacing: 0.5 }}>
        {label}
      </span>
    </div>
  );
}

function StepLine({ done }) {
  return (
    <div style={{ flex: 1, height: 2, background: done ? C.green : C.border, marginBottom: 20, transition: "background 0.4s" }} />
  );
}

export default function SignPage() {
  const { token } = useParams();

  // Data
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Flow step: "review" | "sign" | "pay" | "done"
  const [step, setStep] = useState("review");

  // Sign state
  const [name, setName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState("");

  // Pay state
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [depositPct, setDepositPct] = useState(50); // default 50%

  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  // ── Fetch document ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchDoc = async () => {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("documents")
        .select("*, clients(name, email, company), profiles(name, company, email)")
        .eq("sign_token", token)
        .single();

      if (err || !data) {
        setError("Document not found or link is invalid.");
      } else {
        setDoc(data);
        // BUG-02 FIX: Track when client opens the document
        if (!data.opened_at && data.status !== "signed" && data.status !== "paid") {
          supabase.from("documents")
            .update({ opened_at: new Date().toISOString() })
            .eq("sign_token", token)
            .then(() => {});
        }
        // Restore state if already signed/paid
        if (data.status === "paid") setStep("done");
        else if (data.status === "signed") {
          // Show pay step if has amount, else done
          setStep(data.amount > 0 ? "pay" : "done");
        }
      }
      setLoading(false);
    };
    fetchDoc();
  }, [token]);

  // ── Canvas setup ─────────────────────────────────────────────────────
  useEffect(() => {
    if (step !== "sign" || !doc) return;

    // Wait for canvas to render in DOM
    const timer = setTimeout(() => {
      const canvas = canvasRef.current; // local copy — no ref in cleanup
      if (!canvas) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width) return;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = C.gold;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = "rgba(245,166,35,0.3)";
      ctx.shadowBlur = 3;

      let lastX = 0, lastY = 0;

      const getPos = (e) => {
        const r = canvas.getBoundingClientRect();
        const src = e.touches ? e.touches[0] : e;
        return { x: src.clientX - r.left, y: src.clientY - r.top };
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
        ctx.quadraticCurveTo(lastX, lastY, (p.x + lastX) / 2, (p.y + lastY) / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo((p.x + lastX) / 2, (p.y + lastY) / 2);
        lastX = p.x; lastY = p.y;
      };

      const stop = () => { isDrawing.current = false; ctx.beginPath(); };

      canvas.addEventListener("mousedown", start);
      canvas.addEventListener("mousemove", draw);
      canvas.addEventListener("mouseup", stop);
      canvas.addEventListener("mouseleave", stop);
      canvas.addEventListener("touchstart", start, { passive: false });
      canvas.addEventListener("touchmove", draw, { passive: false });
      canvas.addEventListener("touchend", stop);
      canvas.addEventListener("touchcancel", stop);

      // Store cleanup on canvas element itself — uses local var not ref
      canvas._evCleanup = () => {
        canvas.removeEventListener("mousedown", start);
        canvas.removeEventListener("mousemove", draw);
        canvas.removeEventListener("mouseup", stop);
        canvas.removeEventListener("mouseleave", stop);
        canvas.removeEventListener("touchstart", start);
        canvas.removeEventListener("touchmove", draw);
        canvas.removeEventListener("touchend", stop);
        canvas.removeEventListener("touchcancel", stop);
      };
    }, 100);

    // BUG-07 FIX: snapshot ref value before cleanup runs
    const canvasSnapshot = canvasRef.current;
    return () => {
      clearTimeout(timer);
      if (canvasSnapshot?._evCleanup) canvasSnapshot._evCleanup();
    };
  }, [step, doc]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const isCanvasEmpty = () => {
    const canvas = canvasRef.current;
    if (!canvas) return true;
    const data = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
    return !data.some(v => v !== 0);
  };

  // ── Handle Sign ──────────────────────────────────────────────────────
  const handleSign = async () => {
    setSignError("");
    if (!name.trim()) return setSignError("Please enter your full name.");
    if (!agreed) return setSignError("Please accept the agreement.");
    if (isCanvasEmpty()) return setSignError("Please draw your signature.");

    setSigning(true);
    try {
      const canvas = canvasRef.current;
      // Get base64 directly from canvas — no URL, no CORS
      const signatureBase64 = canvas.toDataURL("image/png");

      // Also try to upload to storage (optional — for backup)
      let publicUrl = null;
      try {
        const blob = await (await fetch(signatureBase64)).blob();
        const fileName = `${doc.id}-${Date.now()}.png`;
        const { error: upErr } = await supabase.storage
          .from("signatures")
          .upload(fileName, blob, { contentType: "image/png", upsert: true });
        if (!upErr) {
          const { data: urlData } = supabase.storage
            .from("signatures")
            .getPublicUrl(fileName);
          publicUrl = urlData?.publicUrl || null;
        }
      } catch { /* storage upload failed — base64 still saved */ }

      // Save BOTH base64 and URL to documents + signer name
      const { error: updateErr } = await supabase
        .from("documents")
        .update({
          status: "signed",
          signature_data: signatureBase64,  // ← base64 directly
          signature_url: publicUrl,          // ← URL as backup
          signed_at: new Date().toISOString(),
          signer_name: name.trim(),          // ← BUG-01 FIX
        })
        .eq("id", doc.id);

      if (updateErr) return setSignError("Signing failed: " + updateErr.message);

      // Notify owner (non-blocking)
      if (doc.profiles?.email) {
        sendSignedConfirmation({
          to: doc.profiles.email,
          ownerName: doc.profiles.name || "there",
          clientName: name,
          docTitle: doc.title,
        }).catch(() => {});
      }

      setDoc(prev => ({
        ...prev,
        status: "signed",
        signature_data: signatureBase64,
        signature_url: publicUrl,
      }));
      setStep(doc.amount > 0 ? "pay" : "done");

    } catch (err) {
      setSignError("Something went wrong: " + err.message);
    } finally {
      setSigning(false);
    }
  };

  // ── Handle Pay ───────────────────────────────────────────────────────
  const handlePay = async () => {
    setPayError("");
    setPaying(true);

    const depositAmount = Math.round((doc.amount * depositPct) / 100);

    await openInvoicePayment({
      invoice: { ...doc, amount: depositAmount },
      clientName: doc.clients?.name || name,
      clientEmail: doc.clients?.email || "",
      onSuccess: async (response) => {
        await markInvoicePaid(supabase, doc.id, response.razorpay_payment_id);
        // BUG-03 FIX: Notify freelancer of payment
        if (doc.profiles?.email) {
          sendPaymentReceived({
            to: doc.profiles.email,
            docTitle: doc.title,
            amount: fmt(depositAmount),
            clientName: doc.clients?.name || name,
          }).catch(() => {});
        }
        setStep("done");
        setPaying(false);
      },
      onFailure: (msg) => {
        setPayError(msg || "Payment failed. Please try again.");
        setPaying(false);
      },
    });
  };

  const skipPay = () => setStep("done");

  // ── Format amount ────────────────────────────────────────────────────
  const currency = doc?.currency || "INR";
  const sym = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "EUR" ? "€" : currency;
  const fmt = (amt) => `${sym}${Number(amt || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  const depositAmt = doc ? Math.round((doc.amount * depositPct) / 100) : 0;

  // ── Steps config ─────────────────────────────────────────────────────
  const hasPayment = doc?.amount > 0;
  const steps = hasPayment
    ? ["review", "sign", "pay", "done"]
    : ["review", "sign", "done"];

  const stepNum = steps.indexOf(step) + 1;

  // ── Page shell ───────────────────────────────────────────────────────
  const shell = (children) => (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px 48px" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: none; } }
      `}</style>

      {/* Logo */}
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: C.gold }}>⚡ FlowDocs</div>
        <div style={{ fontSize: 11, color: C.dim, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>Secure Document Signing</div>
      </div>

      {/* Step indicator */}
      {doc && step !== "done" && (
        <div style={{ display: "flex", alignItems: "center", width: "100%", maxWidth: 460, marginBottom: 28 }}>
          <StepBadge num="1" label="Review" active={step === "review"} done={stepNum > 1} />
          <StepLine done={stepNum > 1} />
          <StepBadge num="2" label="Sign" active={step === "sign"} done={stepNum > 2} />
          {hasPayment && (
            <>
              <StepLine done={step === "done" || step === "pay" && stepNum > 3} />
              <StepBadge num="3" label="Pay Deposit" active={step === "pay"} done={step === "done"} />
            </>
          )}
        </div>
      )}

      <div style={{ width: "100%", maxWidth: 520, animation: "fadeIn 0.3s ease" }}>
        {children}
      </div>
    </div>
  );

  // ── Loading ───────────────────────────────────────────────────────────
  if (loading) return shell(
    <div style={{ textAlign: "center", padding: 48, color: C.dim }}>
      <div style={{ width: 28, height: 28, border: `3px solid ${C.border}`, borderTopColor: C.gold, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
      Loading document...
    </div>
  );

  // ── Error ─────────────────────────────────────────────────────────────
  if (error) return shell(
    <div style={{ background: C.redDim, border: `1px solid ${C.red}`, borderRadius: 12, padding: "24px", textAlign: "center" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
      <div style={{ fontWeight: 700, color: C.red, marginBottom: 8 }}>{error}</div>
      <div style={{ fontSize: 13, color: C.dim }}>Contact support@flowdocs.co.in if this persists.</div>
    </div>
  );

  // ── STEP 1: Review ────────────────────────────────────────────────────
  if (step === "review") return shell(
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>

      {/* Doc header */}
      <div style={{ padding: "24px 24px 20px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 10, color: C.gold, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>
          {doc.type}
        </div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 12 }}>
          {doc.title}
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 10, color: C.dim, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>From</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{doc.profiles?.name || "Service Provider"}</div>
            {doc.profiles?.company && <div style={{ fontSize: 12, color: C.dim }}>{doc.profiles.company}</div>}
          </div>
          <div>
            <div style={{ fontSize: 10, color: C.dim, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>To</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{doc.clients?.name || "Client"}</div>
            {doc.clients?.company && <div style={{ fontSize: 12, color: C.dim }}>{doc.clients.company}</div>}
          </div>
          {doc.amount > 0 && (
            <div>
              <div style={{ fontSize: 10, color: C.dim, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>Total Value</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.gold, fontFamily: "'Syne', sans-serif" }}>{fmt(doc.amount)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Document content */}
      <div style={{ padding: "20px 24px", maxHeight: 320, overflowY: "auto" }}>
        <div style={{ fontSize: 10, color: C.dim, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 12 }}>Document Content</div>
        <pre style={{ fontFamily: "'DM Mono', monospace", fontSize: 12.5, color: C.mid, lineHeight: 1.85, whiteSpace: "pre-wrap", margin: 0 }}>
          {doc.content?.description || "Please review this document carefully before signing."}
        </pre>
      </div>

      {/* Payment preview if applicable */}
      {doc.amount > 0 && (
        <div style={{ margin: "0 24px 20px", background: C.goldDim2, border: `1px solid ${C.gold}30`, borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontSize: 12, color: C.gold, fontWeight: 600, marginBottom: 6 }}>💰 Payment on Signing</div>
          <div style={{ fontSize: 13, color: C.mid }}>After signing, you'll be asked to pay a <strong style={{ color: C.text }}>50% deposit ({fmt(doc.amount * 0.5)})</strong> via UPI, card, or net banking.</div>
        </div>
      )}

      {/* CTA */}
      <div style={{ padding: "0 24px 24px" }}>
        <button onClick={() => setStep("sign")} style={{
          width: "100%", background: C.gold, color: "#0C0C0E", border: "none",
          borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 700,
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        }}>
          I've Read This — Proceed to Sign →
        </button>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 14 }}>
          {["🔒 SSL Secured", "📋 IT Act 2000", "⚡ Powered by FlowDocs"].map((t, i) => (
            <span key={i} style={{ fontSize: 11, color: C.dim }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );

  // ── STEP 2: Sign ──────────────────────────────────────────────────────
  if (step === "sign") return shell(
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "28px 24px" }}>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 4 }}>Sign Document</div>
      <div style={{ fontSize: 13, color: C.dim, marginBottom: 24 }}>{doc.title}</div>

      {/* Full name */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ fontSize: 10, color: C.dim, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", display: "block", marginBottom: 8 }}>
          Your Full Legal Name *
        </label>
        <input
          style={{ width: "100%", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", fontSize: 14, color: C.text, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" }}
          placeholder="Type your full name exactly"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />
      </div>

      {/* Signature canvas */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ fontSize: 10, color: C.dim, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", display: "block", marginBottom: 8 }}>
          Draw Your Signature *
        </label>
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: 180, background: C.surface2, border: `2px dashed ${C.gold}`, borderRadius: 12, cursor: "crosshair", display: "block", touchAction: "none", WebkitUserSelect: "none", userSelect: "none" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
          <span style={{ fontSize: 11, color: C.dim }}>✍ Draw with finger or mouse</span>
          <button onClick={clearCanvas} style={{ fontSize: 12, color: C.gold, background: "none", border: `1px solid ${C.gold}40`, borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Clear</button>
        </div>
      </div>

      {/* Agreement */}
      <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px", marginBottom: 20 }}>
        <label style={{ display: "flex", gap: 12, cursor: "pointer", alignItems: "flex-start" }}>
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 2, accentColor: C.gold, width: 16, height: 16, flexShrink: 0 }} />
          <span style={{ fontSize: 12.5, color: C.mid, lineHeight: 1.7 }}>
            I agree that this electronic signature is legally binding under the <strong style={{ color: C.text }}>Information Technology Act, 2000 (India)</strong> and equivalent international laws. I have read and understood the document above.
          </span>
        </label>
      </div>

      {/* Error */}
      {signError && (
        <div style={{ background: C.redDim, border: `1px solid ${C.red}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: C.red, marginBottom: 16 }}>
          {signError}
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setStep("review")} style={{ padding: "12px 16px", background: "transparent", border: `1px solid ${C.border}`, color: C.mid, borderRadius: 10, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600 }}>
          ← Back
        </button>
        <button
          onClick={handleSign}
          disabled={signing || !agreed}
          style={{
            flex: 1, background: signing ? C.surface2 : agreed ? C.gold : C.surface2,
            color: signing ? C.gold : agreed ? "#0C0C0E" : C.dim,
            border: signing ? `1px solid ${C.gold}` : "none",
            borderRadius: 10, padding: "13px", fontSize: 15, fontWeight: 700,
            cursor: signing || !agreed ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}
        >
          {signing ? (
            <>
              <span style={{ width: 16, height: 16, border: `2px solid ${C.dim}`, borderTopColor: C.gold, borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
              Saving signature...
            </>
          ) : hasPayment ? "Sign & Continue to Payment →" : "Sign & Submit →"}
        </button>
      </div>
    </div>
  );

  // ── STEP 3: Pay Deposit ───────────────────────────────────────────────
  if (step === "pay") return shell(
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "28px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: C.green, marginBottom: 6 }}>Document Signed!</div>
        <div style={{ fontSize: 14, color: C.mid }}>One last step — pay your deposit to confirm the project.</div>
      </div>

      {/* Deposit selector */}
      <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px", marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: C.dim, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 12 }}>Deposit Amount</div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[25, 50, 100].map(pct => (
            <button key={pct} onClick={() => setDepositPct(pct)} style={{
              flex: 1, padding: "10px 8px", borderRadius: 8, border: `1px solid ${depositPct === pct ? C.gold : C.border}`,
              background: depositPct === pct ? C.goldDim : "transparent",
              color: depositPct === pct ? C.gold : C.mid,
              fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>
              {pct}%
              <div style={{ fontSize: 11, fontWeight: 400, marginTop: 2 }}>{fmt(doc.amount * pct / 100)}</div>
            </button>
          ))}
        </div>

        {/* Amount display */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderTop: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 14, color: C.dim }}>Total project value</span>
          <span style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>{fmt(doc.amount)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderTop: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 16, color: C.text, fontWeight: 700 }}>Deposit ({depositPct}%)</span>
          <span style={{ fontSize: 22, color: C.gold, fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>{fmt(depositAmt)}</span>
        </div>
      </div>

      {/* Payment methods */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
        {["💳 Cards", "📱 UPI", "🏦 Net Banking", "💼 Wallets"].map((m, i) => (
          <span key={i} style={{ fontSize: 11, color: C.dim, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "4px 8px" }}>{m}</span>
        ))}
      </div>

      {payError && (
        <div style={{ background: C.redDim, border: `1px solid ${C.red}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: C.red, marginBottom: 16 }}>
          {payError}
        </div>
      )}

      <button onClick={handlePay} disabled={paying} style={{
        width: "100%", background: paying ? C.surface2 : C.gold,
        color: paying ? C.gold : "#0C0C0E", border: paying ? `1px solid ${C.gold}` : "none",
        borderRadius: 10, padding: "15px", fontSize: 15, fontWeight: 700,
        cursor: paying ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12,
      }}>
        {paying ? (
          <>
            <span style={{ width: 16, height: 16, border: `2px solid ${C.dim}`, borderTopColor: C.gold, borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
            Opening payment...
          </>
        ) : `Pay Deposit ${fmt(depositAmt)} →`}
      </button>

      <button onClick={skipPay} style={{ width: "100%", background: "transparent", border: "none", color: C.dim, fontSize: 13, cursor: "pointer", padding: "8px", fontFamily: "'DM Sans', sans-serif" }}>
        Skip for now — I'll pay later
      </button>

      <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: C.dim }}>🔒 Secured by Razorpay</div>
    </div>
  );

  // ── STEP 4: Done ─────────────────────────────────────────────────────
  if (step === "done") return shell(
    <div style={{ background: C.surface, border: `2px solid ${C.green}`, borderRadius: 16, padding: "40px 28px", textAlign: "center" }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: C.green, marginBottom: 10 }}>
        {doc?.status === "paid" ? "All Done!" : "Signed Successfully!"}
      </div>
      <div style={{ fontSize: 14, color: C.mid, lineHeight: 1.8, marginBottom: 24 }}>
        {doc?.status === "paid"
          ? `${doc.clients?.name || "You"} have signed the document and paid the deposit. The service provider has been notified.`
          : `${doc.clients?.name || "You"} have signed "${doc?.title}". The service provider has been notified and will be in touch soon.`}
      </div>

      {doc?.signed_at && (
        <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px", fontSize: 12, color: C.dim, fontFamily: "'DM Mono', monospace", marginBottom: 20 }}>
          ✓ Signed: {new Date(doc.signed_at).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, justifyContent: "center", fontSize: 13, color: C.dim }}>
        <span>🔒 Legally binding</span>
        <span>📧 Confirmation sent</span>
        <span>⚡ FlowDocs</span>
      </div>
    </div>
  );

  return null;
}