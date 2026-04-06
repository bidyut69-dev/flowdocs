import { useState } from "react";
import { supabase } from "../lib/supabase";

const C = {
  bg: "#0C0C0E", surface: "#141416", border: "#2A2A2E", surface2: "#1C1C1F",
  gold: "#F5A623", text: "#F0EEE8", dim: "#7A7875", mid: "#B0ADA8",
  green: "#22C55E", red: "#EF4444",
};

const S = {
  page: { minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: 16 },
  wrap: { width: "100%", maxWidth: 420 },
  card: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "40px 36px" },
  topBar: { height: 3, background: C.gold, borderRadius: "16px 16px 0 0", marginBottom: 0 },
  logo: { fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: C.gold, marginBottom: 4 },
  logoSub: { fontSize: 10, color: C.dim, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 28 },
  heading: { fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 4 },
  sub: { fontSize: 13, color: C.dim, marginBottom: 28 },
  label: { fontSize: 10, color: C.dim, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", display: "block", marginBottom: 6, marginTop: 14 },
  input: { width: "100%", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "11px 14px", fontSize: 13.5, color: C.text, fontFamily: "'DM Sans', sans-serif", outline: "none" },
  btn: { width: "100%", background: C.gold, color: "#0C0C0E", border: "none", borderRadius: 8, padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginTop: 22, transition: "opacity 0.15s" },
  toggle: { textAlign: "center", marginTop: 20, fontSize: 13, color: C.dim },
  link: { color: C.gold, cursor: "pointer", fontWeight: 600 },
  alert: (ok) => ({ background: ok ? "#22C55E20" : "#EF444420", border: `1px solid ${ok ? C.green : C.red}`, borderRadius: 8, padding: "11px 14px", fontSize: 13, color: ok ? C.green : C.red, marginBottom: 16, marginTop: 4 }),
};

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null); // { text, ok }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async () => {
    if (!form.email || !form.password) return setMsg({ text: "Please fill in all fields.", ok: false });
    setLoading(true); setMsg(null);
    if (mode === "signup") {
      if (!form.name) return setMsg({ text: "Please enter your name.", ok: false });
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { name: form.name } },
      });
      if (error) setMsg({ text: error.message, ok: false });
      else setMsg({ text: "✓ Account created! Check your email to confirm.", ok: true });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      if (error) setMsg({ text: error.message, ok: false });
    }
    setLoading(false);
  };

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <div style={S.topBar} />
        <div style={S.card}>
          <div style={S.logo}>⚡ FlowDocs</div>
          <div style={S.logoSub}>Freelancer Suite</div>
          <div style={S.heading}>{mode === "login" ? "Welcome back" : "Get started"}</div>
          <div style={S.sub}>{mode === "login" ? "Sign in to your workspace" : "Create your free account"}</div>
          {msg && <div style={S.alert(msg.ok)}>{msg.text}</div>}
          {mode === "signup" && (
            <>
              <label style={S.label}>Your Name</label>
              <input style={S.input} placeholder="Your Name" value={form.name} onChange={set("name")} />
            </>
          )}
          <label style={S.label}>Email</label>
          <input style={S.input} type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} />
          <label style={S.label}>Password</label>
          <input style={S.input} type="password" placeholder="••••••••" value={form.password} onChange={set("password")}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
          <button style={{ ...S.btn, opacity: loading ? 0.6 : 1 }} onClick={handleSubmit} disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create Account →"}
          </button>
          <div style={S.toggle}>
            {mode === "login" ? "No account? " : "Already registered? "}
            <span style={S.link} onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMsg(null); }}>
              {mode === "login" ? "Sign Up" : "Sign In"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}