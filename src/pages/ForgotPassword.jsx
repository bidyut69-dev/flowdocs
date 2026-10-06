import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const bg = "#F5F4F2";
const card = "#FFFFFF";
const ink = "#0A0A0A";
const inkMid = "#525252";
const inkFaint = "#A3A3A3";
const line = "#E7E5E0";
const gold = "#C8820F";
const goldSoft = "#F5A623";
const stamp = "#1F6B46";
const red = "#B3432B";

const fontDisplay = "'Playfair Display', 'Fraunces', Georgia, serif";
const fontSans = "'Manrope', 'Inter', system-ui, sans-serif";
const fontMono = "'IBM Plex Mono', 'DM Mono', ui-monospace, monospace";

export default function ForgotPassword() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isReset = window.location.hash.includes("type=recovery");
  const [newPassword, setNewPassword] = useState("");
  const [resetDone, setResetDone] = useState(false);

  const sendReset = async () => {
    if (!email) return setError("Enter your email");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return setError("Enter a valid email address");
    setLoading(true); setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  };

  const updatePassword = async () => {
    if (!newPassword || newPassword.length < 8) return setError("Password must be at least 8 characters");
    setLoading(true); setError("");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) setError(error.message);
    else { setResetDone(true); setTimeout(() => nav("/"), 2000); }
  };

  const inputStyle = {
    width: "100%", background: "#fff", border: `1px solid ${line}`, borderRadius: 12,
    padding: "13px 15px", fontSize: 14, color: ink, fontFamily: fontSans, outline: "none",
    boxSizing: "border-box", transition: "border-color .2s, box-shadow .2s",
  };
  const labelStyle = {
    fontFamily: fontMono, fontSize: 10, color: inkMid, fontWeight: 500,
    textTransform: "uppercase", letterSpacing: ".14em", display: "block",
    marginBottom: 7, marginTop: 16,
  };

  return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fontSans, padding: 16, position: "relative", overflow: "hidden" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        .input-focus:focus{border-color:${ink}!important;box-shadow:0 0 0 4px rgba(10,10,10,.06)}
        .btn-dark{position:relative;width:100%;display:inline-flex;align-items:center;justify-content:center;gap:10px;background:${ink};color:#fff;border:none;padding:14px;border-radius:14px;font-size:14.5px;font-weight:600;cursor:pointer;font-family:${fontSans};box-shadow:0 14px 30px -12px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.14);transition:all .3s cubic-bezier(.22,1,.36,1);outline:1px solid rgba(0,0,0,.3);outline-offset:-1px}
        .btn-dark:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 20px 40px -12px rgba(0,0,0,.65),inset 0 1px 0 rgba(255,255,255,.2)}
        .btn-dark:disabled{opacity:.55;cursor:not-allowed}
      `}</style>

      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 400, borderRadius: "50%", background: `${goldSoft}10`, filter: "blur(80px)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 28, cursor: "pointer" }} onClick={() => nav("/")}>
          <div style={{ width: 32, height: 32, background: ink, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: fontDisplay, boxShadow: "0 6px 14px -6px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.12)" }}>F</div>
          <span style={{ fontFamily: fontDisplay, fontSize: 20, fontWeight: 600, letterSpacing: "-.3px" }}>FlowDocs</span>
        </div>

        <div style={{ background: card, border: `1px solid ${line}`, borderRadius: 24, padding: "40px 36px", boxShadow: "0 24px 60px -30px rgba(15,15,15,.18)" }}>
          <div style={{ fontFamily: fontMono, fontSize: 10.5, color: inkMid, fontWeight: 500, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 14 }}>
            § {isReset ? "Set new password" : "Reset password"}
          </div>

          {resetDone ? (
            <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: `${stamp}15`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: stamp, fontSize: 28, fontWeight: 700 }}>✓</div>
              <h1 style={{ fontFamily: fontDisplay, fontSize: 26, fontWeight: 500, letterSpacing: "-.5px", color: ink, marginBottom: 8 }}>Password <span style={{ fontStyle: "italic", color: gold }}>updated</span></h1>
              <div style={{ fontSize: 14, color: inkMid, lineHeight: 1.6 }}>Redirecting to your dashboard…</div>
            </div>
          ) : sent ? (
            <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: `${goldSoft}15`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>✉</div>
              <h1 style={{ fontFamily: fontDisplay, fontSize: 28, fontWeight: 500, letterSpacing: "-.5px", color: ink, marginBottom: 10 }}>Check your <span style={{ fontStyle: "italic", color: gold }}>inbox</span></h1>
              <div style={{ fontSize: 14, color: inkMid, lineHeight: 1.65, marginBottom: 20 }}>
                We sent a reset link to <strong style={{ color: ink, fontWeight: 600 }}>{email}</strong>. Click it to set a new password.
              </div>
              <div style={{ fontSize: 13, color: inkMid, fontFamily: fontMono, letterSpacing: ".06em" }}>
                didn't get it?{" "}
                <span style={{ color: gold, cursor: "pointer", fontWeight: 600, textDecoration: "underline", textDecorationColor: `${goldSoft}60`, textUnderlineOffset: 4 }} onClick={() => setSent(false)}>try again</span>
              </div>
            </div>
          ) : isReset ? (
            <>
              <h1 style={{ fontFamily: fontDisplay, fontSize: 30, fontWeight: 500, letterSpacing: "-.5px", color: ink, marginBottom: 10, lineHeight: 1.15 }}>
                New <span style={{ fontStyle: "italic", color: gold }}>password</span>
              </h1>
              <p style={{ fontSize: 14, color: inkMid, lineHeight: 1.6, marginBottom: 20 }}>Enter a new password for your account.</p>
              {error && <div style={{ background: `${red}12`, border: `1px solid ${red}40`, borderRadius: 12, padding: "11px 14px", color: red, fontSize: 13, marginBottom: 12 }}>{error}</div>}
              <label style={labelStyle}>New Password</label>
              <input className="input-focus" style={inputStyle} type="password" placeholder="Minimum 8 characters" value={newPassword}
                onChange={e => setNewPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && updatePassword()} />
              <button className="btn-dark" style={{ marginTop: 22 }} onClick={updatePassword} disabled={loading}>
                {loading ? "Updating…" : "Set new password →"}
              </button>
            </>
          ) : (
            <>
              <h1 style={{ fontFamily: fontDisplay, fontSize: 30, fontWeight: 500, letterSpacing: "-.5px", color: ink, marginBottom: 10, lineHeight: 1.15 }}>
                Forgot your <span style={{ fontStyle: "italic", color: gold }}>password?</span>
              </h1>
              <p style={{ fontSize: 14, color: inkMid, lineHeight: 1.6, marginBottom: 20 }}>Enter your email and we'll send you a reset link.</p>
              {error && <div style={{ background: `${red}12`, border: `1px solid ${red}40`, borderRadius: 12, padding: "11px 14px", color: red, fontSize: 13, marginBottom: 12 }}>{error}</div>}
              <label style={labelStyle}>Email Address</label>
              <input className="input-focus" style={inputStyle} type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && sendReset()} />
              <button className="btn-dark" style={{ marginTop: 22 }} onClick={sendReset} disabled={loading}>
                {loading ? "Sending…" : "Send reset link →"}
              </button>
            </>
          )}

          <div style={{ textAlign: "center", marginTop: 24, fontSize: 13.5, color: inkMid, cursor: "pointer" }} onClick={() => nav("/auth")}>
            ← Back to sign in
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 22, fontFamily: fontMono, fontSize: 10.5, color: inkFaint, letterSpacing: ".14em", textTransform: "uppercase" }}>
          <span style={{ cursor: "pointer" }} onClick={() => nav("/privacy")}>Privacy</span>
          <span style={{ margin: "0 10px", opacity: .5 }}>·</span>
          <span style={{ cursor: "pointer" }} onClick={() => nav("/terms")}>Terms</span>
        </div>
      </div>
    </div>
  );
}
