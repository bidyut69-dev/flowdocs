import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

// ── Palette ──────────────────────────────────────────────────────────────
const bg = "#F5F4F2";
const bgAlt = "#EFEDE8";
const card = "#FFFFFF";
const ink = "#0A0A0A";
const inkDeep = "#151515";
const inkMid = "#525252";
const inkFaint = "#A3A3A3";
const line = "#E7E5E0";
const lineSoft = "#EFEDE8";
const gold = "#C8820F";
const goldSoft = "#F5A623";
const stamp = "#1F6B46";
const red = "#B3432B";

const fontDisplay = "'Playfair Display', 'Fraunces', Georgia, serif";
const fontSans = "'Manrope', 'Inter', system-ui, sans-serif";
const fontMono = "'IBM Plex Mono', 'DM Mono', ui-monospace, monospace";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

export default function Auth() {
  const nav = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    if (!form.email) return "Email is required.";
    if (!isValidEmail(form.email)) return "Please enter a valid email address.";
    if (!form.password) return "Password is required.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (mode === "signup") {
      if (!form.name.trim()) return "Please enter your name.";
      if (form.password !== form.confirmPassword) return "Passwords do not match.";
    }
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) return setMsg({ text: err, ok: false });
    setLoading(true); setMsg(null);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: { data: { name: form.name.trim() } },
      });
      if (error) setMsg({ text: error.message, ok: false });
      else setMsg({ text: "✓ Account created! You can now sign in.", ok: true });
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });
      if (error) setMsg({ text: error.message, ok: false });
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) { setMsg({ text: error.message, ok: false }); setGoogleLoading(false); }
  };

  const inputStyle = {
    width: "100%", background: "#fff", border: `1px solid ${line}`, borderRadius: 12,
    padding: "13px 15px", fontSize: 14, color: ink, fontFamily: fontSans, outline: "none",
    boxSizing: "border-box", transition: "border-color .2s, box-shadow .2s",
  };

  const labelStyle = {
    fontFamily: fontMono, fontSize: 10, color: inkMid, fontWeight: 500,
    textTransform: "uppercase", letterSpacing: ".14em", display: "block",
    marginBottom: 7, marginTop: 14,
  };

  const eyeBtn = {
    background: "none", border: "none", color: inkFaint, cursor: "pointer",
    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
    fontSize: 14, padding: 4,
  };

  return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fontSans, padding: 16, position: "relative", overflow: "hidden" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes ping{75%,100%{transform:scale(2);opacity:0}}
        .input-focus:focus{border-color:${ink}!important;box-shadow:0 0 0 4px rgba(10,10,10,.06)}
        .btn-dark{position:relative;width:100%;display:inline-flex;align-items:center;justify-content:center;gap:10px;background:${ink};color:#fff;border:none;padding:14px;border-radius:14px;font-size:14.5px;font-weight:600;cursor:pointer;font-family:${fontSans};box-shadow:0 14px 30px -12px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.14);transition:all .3s cubic-bezier(.22,1,.36,1);outline:1px solid rgba(0,0,0,.3);outline-offset:-1px}
        .btn-dark:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 20px 40px -12px rgba(0,0,0,.65),inset 0 1px 0 rgba(255,255,255,.2)}
        .btn-dark:disabled{opacity:.55;cursor:not-allowed}
        .btn-google{width:100%;background:#fff;color:${ink};border:1px solid ${line};border-radius:14px;padding:12px 14px;font-size:14px;font-weight:500;cursor:pointer;font-family:${fontSans};display:flex;align-items:center;justify-content:center;gap:10px;transition:all .3s cubic-bezier(.22,1,.36,1);box-shadow:0 3px 10px -2px rgba(0,0,0,.04)}
        .btn-google:hover:not(:disabled){border-color:${inkFaint};transform:translateY(-1px);box-shadow:0 10px 22px -6px rgba(0,0,0,.1)}
      `}</style>

      {/* soft gold glow */}
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 400, borderRadius: "50%", background: `${goldSoft}10`, filter: "blur(80px)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 28, cursor: "pointer" }} onClick={() => nav("/")}>
          <div style={{ width: 32, height: 32, background: ink, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: fontDisplay, boxShadow: "0 6px 14px -6px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.12)" }}>F</div>
          <span style={{ fontFamily: fontDisplay, fontSize: 20, fontWeight: 600, letterSpacing: "-.3px" }}>FlowDocs</span>
        </div>

        {/* Card */}
        <div style={{ background: card, border: `1px solid ${line}`, borderRadius: 24, padding: "40px 36px", boxShadow: "0 24px 60px -30px rgba(15,15,15,.18)" }}>
          <div style={{ fontFamily: fontMono, fontSize: 10.5, color: inkMid, fontWeight: 500, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 14 }}>
            § {mode === "login" ? "Sign in" : "Create account"}
          </div>
          <h1 style={{ fontFamily: fontDisplay, fontSize: 32, fontWeight: 500, letterSpacing: "-.8px", lineHeight: 1.1, color: ink, marginBottom: 10 }}>
            {mode === "login" ? <>Welcome <span style={{ fontStyle: "italic", color: gold }}>back</span></> : <>Get started <span style={{ fontStyle: "italic", color: gold }}>free</span></>}
          </h1>
          <p style={{ fontSize: 14, color: inkMid, marginBottom: 28, lineHeight: 1.5 }}>
            {mode === "login" ? "Sign in to your FlowDocs workspace." : "Create your account. No credit card needed."}
          </p>

          {msg && (
            <div style={{
              background: msg.ok ? `${stamp}12` : `${red}12`,
              border: `1px solid ${msg.ok ? stamp : red}40`,
              borderRadius: 12, padding: "12px 14px", fontSize: 13,
              color: msg.ok ? stamp : red, marginBottom: 18, lineHeight: 1.5,
            }}>{msg.text}</div>
          )}

          {/* Google */}
          <button className="btn-google" onClick={handleGoogle} disabled={googleLoading}>
            <GoogleIcon />
            {googleLoading ? "Redirecting…" : `${mode === "login" ? "Sign in" : "Sign up"} with Google`}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0 6px" }}>
            <div style={{ flex: 1, height: 1, background: line }} />
            <span style={{ fontFamily: fontMono, fontSize: 10, color: inkFaint, letterSpacing: ".14em", textTransform: "uppercase" }}>or email</span>
            <div style={{ flex: 1, height: 1, background: line }} />
          </div>

          {mode === "signup" && (
            <>
              <label style={labelStyle}>Full Name</label>
              <input className="input-focus" style={inputStyle} placeholder="Your full name" value={form.name} onChange={set("name")} />
            </>
          )}

          <label style={labelStyle}>Email</label>
          <input
            className="input-focus"
            style={{ ...inputStyle, borderColor: form.email && !isValidEmail(form.email) ? red : line }}
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set("email")}
          />
          {form.email && !isValidEmail(form.email) && (
            <div style={{ fontSize: 11.5, color: red, marginTop: 5 }}>Please enter a valid email address</div>
          )}

          <label style={labelStyle}>Password</label>
          <div style={{ position: "relative" }}>
            <input
              className="input-focus"
              style={inputStyle}
              type={showPass ? "text" : "password"}
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={set("password")}
            />
            <button style={eyeBtn} onClick={() => setShowPass(!showPass)}>{showPass ? "🙈" : "👁"}</button>
          </div>
          {form.password && form.password.length < 6 && (
            <div style={{ fontSize: 11.5, color: red, marginTop: 5 }}>Password must be at least 6 characters</div>
          )}

          {mode === "signup" && (
            <>
              <label style={labelStyle}>Confirm Password</label>
              <div style={{ position: "relative" }}>
                <input
                  className="input-focus"
                  style={{ ...inputStyle, borderColor: form.confirmPassword && form.password !== form.confirmPassword ? red : line }}
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                />
                <button style={eyeBtn} onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? "🙈" : "👁"}</button>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <div style={{ fontSize: 11.5, color: red, marginTop: 5 }}>Passwords do not match</div>
              )}
            </>
          )}

          {mode === "login" && (
            <div style={{ textAlign: "right", marginTop: 10 }}>
              <span style={{ fontSize: 12.5, color: gold, cursor: "pointer", fontWeight: 600, textDecoration: "underline", textDecorationColor: `${goldSoft}60`, textUnderlineOffset: 4 }} onClick={() => nav("/forgot-password")}>
                Forgot password?
              </span>
            </div>
          )}

          <button className="btn-dark" style={{ marginTop: 22 }} onClick={handleSubmit} disabled={loading}>
            {loading ? "Please wait…" : mode === "login" ? "Sign In →" : "Create Account →"}
          </button>

          <div style={{ textAlign: "center", marginTop: 22, fontSize: 13.5, color: inkMid }}>
            {mode === "login" ? "No account? " : "Already registered? "}
            <span style={{ color: ink, cursor: "pointer", fontWeight: 600, textDecoration: "underline", textDecorationColor: `${goldSoft}80`, textUnderlineOffset: 4, textDecorationThickness: 2 }} onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMsg(null); setForm({ name: "", email: "", password: "", confirmPassword: "" }); }}>
              {mode === "login" ? "Sign up" : "Sign in"}
            </span>
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
