import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const C = {
  bg: "#0C0C0E", surface: "#141416", border: "#2A2A2E", surface2: "#1C1C1F",
  gold: "#F5A623", text: "#F0EEE8", dim: "#7A7875", mid: "#B0ADA8",
  green: "#22C55E", red: "#EF4444",
};

const S = {
  page: { minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: 16 },
  card: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "40px 36px" },
  logo: { fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: C.gold, marginBottom: 4 },
  logoSub: { fontSize: 10, color: C.dim, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 28 },
  heading: { fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 4 },
  sub: { fontSize: 13, color: C.dim, marginBottom: 24 },
  label: { fontSize: 10, color: C.dim, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", display: "block", marginBottom: 6, marginTop: 14 },
  input: { width: "100%", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "11px 14px", fontSize: 13.5, color: C.text, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" },
  btn: { width: "100%", background: C.gold, color: "#0C0C0E", border: "none", borderRadius: 8, padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginTop: 16, transition: "opacity 0.15s" },
  toggle: { textAlign: "center", marginTop: 20, fontSize: 13, color: C.dim },
  link: { color: C.gold, cursor: "pointer", fontWeight: 600 },
  alert: (ok) => ({ background: ok ? "#22C55E20" : "#EF444420", border: `1px solid ${ok ? C.green : C.red}`, borderRadius: 8, padding: "11px 14px", fontSize: 13, color: ok ? C.green : C.red, marginBottom: 12, marginTop: 4 }),
};

// Email validation
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

// Google SVG icon
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

  const eyeBtn = { background: "none", border: "none", color: C.dim, cursor: "pointer", position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, padding: 0 };

  return (
    <div style={S.page}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ height: 3, background: C.gold, borderRadius: "16px 16px 0 0" }} />
        <div style={S.card}>
          <div style={S.logo}>⚡ FlowDocs</div>
          <div style={S.logoSub}>Freelancer Suite</div>
          <div style={S.heading}>{mode === "login" ? "Welcome back" : "Get started free"}</div>
          <div style={S.sub}>{mode === "login" ? "Sign in to your workspace" : "Create your account"}</div>

          {msg && <div style={S.alert(msg.ok)}>{msg.text}</div>}

          {/* Google */}
          <button onClick={handleGoogle} disabled={googleLoading} style={{
            width: "100%", background: C.surface2, color: C.text,
            border: `1px solid ${C.border}`, borderRadius: 8, padding: "11px 14px",
            fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            opacity: googleLoading ? 0.6 : 1,
          }}>
            <GoogleIcon />
            {googleLoading ? "Redirecting..." : `${mode === "login" ? "Sign in" : "Sign up"} with Google`}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span style={{ fontSize: 12, color: C.dim }}>or continue with email</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>

          {/* Name — signup only */}
          {mode === "signup" && (
            <>
              <label style={S.label}>Full Name *</label>
              <input style={S.input} placeholder="Your full name" value={form.name} onChange={set("name")} />
            </>
          )}

          {/* Email */}
          <label style={S.label}>Email *</label>
          <input
            style={{
              ...S.input,
              borderColor: form.email && !isValidEmail(form.email) ? C.red : C.border,
            }}
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set("email")}
          />
          {form.email && !isValidEmail(form.email) && (
            <div style={{ fontSize: 11, color: C.red, marginTop: 4 }}>Please enter a valid email address</div>
          )}

          {/* Password */}
          <label style={S.label}>Password *</label>
          <div style={{ position: "relative" }}>
            <input
              style={S.input}
              type={showPass ? "text" : "password"}
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={set("password")}
            />
            <button style={eyeBtn} onClick={() => setShowPass(!showPass)}>{showPass ? "🙈" : "👁"}</button>
          </div>
          {form.password && form.password.length < 6 && (
            <div style={{ fontSize: 11, color: C.red, marginTop: 4 }}>Password must be at least 6 characters</div>
          )}

          {/* Confirm Password — signup only */}
          {mode === "signup" && (
            <>
              <label style={S.label}>Confirm Password *</label>
              <div style={{ position: "relative" }}>
                <input
                  style={{
                    ...S.input,
                    borderColor: form.confirmPassword && form.password !== form.confirmPassword ? C.red : C.border,
                  }}
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                />
                <button style={eyeBtn} onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? "🙈" : "👁"}</button>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <div style={{ fontSize: 11, color: C.red, marginTop: 4 }}>Passwords do not match</div>
              )}
            </>
          )}

          {/* Forgot password */}
          {mode === "login" && (
            <div style={{ textAlign: "right", marginTop: 8 }}>
              <span style={{ fontSize: 12, color: C.gold, cursor: "pointer" }} onClick={() => nav("/forgot-password")}>
                Forgot password?
              </span>
            </div>
          )}

          <button
            style={{ ...S.btn, opacity: loading ? 0.6 : 1 }}
            onClick={handleSubmit}
            disabled={loading}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create Account →"}
          </button>

          <div style={S.toggle}>
            {mode === "login" ? "No account? " : "Already registered? "}
            <span style={S.link} onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMsg(null); setForm({ name: "", email: "", password: "", confirmPassword: "" }); }}>
              {mode === "login" ? "Sign Up" : "Sign In"}
            </span>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: C.dim }}>
          <span style={{ cursor: "pointer" }} onClick={() => nav("/privacy")}>Privacy Policy</span>
          {" · "}
          <span style={{ cursor: "pointer" }} onClick={() => nav("/terms")}>Terms of Service</span>
        </div>
      </div>
    </div>
  );
}