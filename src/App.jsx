import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import SignPage from "./pages/SignPage";
import ForgotPassword from "./pages/ForgotPassword";
import { PrivacyPolicy, TermsOfService } from "./pages/Legal";
import CookieBanner from "./components/CookieBanner";
import BugReport from "./components/BugReport";

const Loader = () => (
  <div style={{ minHeight: "100vh", background: "#0C0C0E", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: "#F5A623" }}>⚡ FlowDocs</div>
    <div style={{ display: "flex", gap: 6 }}>
      {[0,1,2].map(i => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#F5A623", animation: "pulse 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s`, opacity: 0.4 }} />
      ))}
    </div>
    <style>{`@keyframes pulse{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}`}</style>
  </div>
);

export default function App() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return <Loader />;

  return (
    <BrowserRouter>
      <CookieBanner />
      {session && <BugReport session={session} />}
      <Routes>
        {/* Public pages */}
        <Route path="/" element={session ? <Navigate to="/dashboard" replace /> : <Landing />} />
        <Route path="/sign/:token" element={<SignPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ForgotPassword />} />

        {/* Auth */}
        <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/dashboard" replace />} />

        {/* Protected */}
        <Route path="/dashboard/*" element={session ? <Dashboard session={session} /> : <Navigate to="/auth" replace />} />
        <Route path="/*" element={session ? <Dashboard session={session} /> : <Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}