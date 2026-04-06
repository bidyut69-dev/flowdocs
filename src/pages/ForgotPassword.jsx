import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const C = {
  bg: "#0C0C0E", surface: "#141416", border: "#2A2A2E", surface2: "#1C1C1F",
  gold: "#F5A623", text: "#F0EEE8", dim: "#7A7875", mid: "#B0ADA8",
  green: "#22C55E", red: "#EF4444",
};

export default function ForgotPassword() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If user lands here with access_token (from email link) — handle new password
  const isReset = window.location.hash.includes("type=recovery");
  const [newPassword, setNewPassword] = useState("");
  const [resetDone, setResetDone] = useState(false);

  const sendReset = async () => {
    if (!email) return setError("Enter your email");
    setLoading(true); setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  };

  const updatePassword = async () => {
    if (!newPassword || newPassword.length < 6) return setError("Password must be 6+ characters");
    setLoading(true); setError("");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) setError(error.message);
    else { setResetDone(true); setTimeout(() => nav("/"), 2000); }
  };

  const S = {
    page: { minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: 16 },
    card: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "36px 32px", width: "100%", maxWidth: 400 },
    logo: { fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: C.gold, marginBottom: 4 },
    label: { fontSize: 10, color: C.dim, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "monospace", display: "block", marginBottom: 6, marginTop: 16 },
    input: { width: "100%", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "11px 14px", fontSize: 13.5, color: C.text, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" },
    btn: { width: "100%", background: C.gold, color: "#0C0C0E", border: "none", borderRadius: 8, padding: 13, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginTop: 20 },
    back: { textAlign: "center", marginTop: 18, fontSize: 13, color: C.dim, cursor: "pointer" },
  };

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');`}</style>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ height: 3, background: C.gold, borderRadius: "16px 16px 0 0" }} />
        <div style={S.card}>
          <div style={S.logo}>⚡ FlowDocs</div>
          <div style={{ fontSize: 10, color: C.dim, letterSpacing: 2, textTransform: "uppercase", fontFamily: "monospace", marginBottom: 24 }}>
            {isReset ? "Set New Password" : "Reset Password"}
          </div>

          {resetDone ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, color: C.green, fontWeight: 700 }}>Password Updated!</div>
              <div style={{ fontSize: 13, color: C.dim, marginTop: 8 }}>Redirecting to dashboard...</div>
            </div>
          ) : sent ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📧</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, color: C.text, fontWeight: 700, marginBottom: 10 }}>Check Your Email</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
                We sent a reset link to <strong style={{ color: C.gold }}>{email}</strong>.
                Click the link in the email to set a new password.
              </div>
              <div style={{ marginTop: 20, fontSize: 13, color: C.dim }}>
                Didn't get it?{" "}
                <span style={{ color: C.gold, cursor: "pointer" }} onClick={() => setSent(false)}>Try again</span>
              </div>
            </div>
          ) : isReset ? (
            <>
              <div style={{ fontSize: 13.5, color: C.mid, lineHeight: 1.7, marginBottom: 8 }}>
                Enter a new password for your account.
              </div>
              {error && <div style={{ background: "#EF444420", border: `1px solid ${C.red}`, borderRadius: 8, padding: "10px 12px", color: C.red, fontSize: 13, marginBottom: 8 }}>{error}</div>}
              <label style={S.label}>New Password</label>
              <input style={S.input} type="password" placeholder="Minimum 6 characters" value={newPassword}
                onChange={e => setNewPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && updatePassword()} />
              <button style={{ ...S.btn, opacity: loading ? 0.6 : 1 }} onClick={updatePassword} disabled={loading}>
                {loading ? "Updating..." : "Set New Password →"}
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 13.5, color: C.mid, lineHeight: 1.7, marginBottom: 8 }}>
                Enter your email and we'll send you a password reset link.
              </div>
              {error && <div style={{ background: "#EF444420", border: `1px solid ${C.red}`, borderRadius: 8, padding: "10px 12px", color: C.red, fontSize: 13, marginBottom: 8 }}>{error}</div>}
              <label style={S.label}>Email Address</label>
              <input style={S.input} type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && sendReset()} />
              <button style={{ ...S.btn, opacity: loading ? 0.6 : 1 }} onClick={sendReset} disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link →"}
              </button>
            </>
          )}

          <div style={S.back} onClick={() => nav("/auth")}>← Back to Sign In</div>
        </div>
      </div>
    </div>
  );
}