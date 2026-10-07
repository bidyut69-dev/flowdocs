import { useEffect, useState, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import CookieBanner from "./components/CookieBanner";
import BugReport from "./components/BugReport";
import Loader from "./components/Loader";
import { posthog } from "./lib/posthog";

// Lazy-loaded pages — each becomes its own JS chunk, only fetched when visited.
// This keeps the Landing page bundle small (no Dashboard/PDF/heavy-vendor code
// gets pulled in just to show the marketing page).
const Landing = lazy(() => import("./pages/Landing"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const SignPage = lazy(() => import("./pages/SignPage"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const PrivacyPolicy = lazy(() => import("./pages/Legal").then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import("./pages/Legal").then(m => ({ default: m.TermsOfService })));

export default function App() {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(null);

  const fetchProfile = async (uid) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
    if (data) setProfile(data);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) fetchProfile(s.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Activation analytics. Signup is recorded once per account when the new
  // profile first shows up, which also covers Google OAuth (the redirect
  // hides the exact signup moment from the Auth page).
  useEffect(() => {
    if (!session || !profile) return;
    posthog?.identify?.(session.user.id, { email: session.user.email });
    if (profile.onboarding_completed) return;
    try {
      const key = `fd_signup_tracked_${session.user.id}`;
      if (!localStorage.getItem(key)) {
        posthog?.capture("signup_completed", { method: session.user.app_metadata?.provider || "email" });
        localStorage.setItem(key, "1");
      }
    } catch { /* storage blocked: skip the once-only guard */ }
  }, [session, profile]);

  if (session === undefined) return <Loader />;

  // Show onboarding for new users who haven't completed it
  const needsOnboarding = session && profile && !profile.onboarding_completed;

  const completeOnboarding = async () => {
    await supabase.from("profiles").update({
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
    }).eq("id", session.user.id);
    setProfile(p => ({ ...p, onboarding_completed: true }));
    posthog?.capture("onboarding_completed");
  };

  return (
    <BrowserRouter>
      <CookieBanner />
      {session && <BugReport session={session} />}
      <Suspense fallback={<Loader />}>
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

          {/* Onboarding — show for new users */}
          <Route path="/onboarding" element={
            session
              ? <Onboarding session={session} profile={profile} onComplete={completeOnboarding} />
              : <Navigate to="/auth" replace />
          } />

          {/* Protected app */}
          <Route path="/dashboard/*" element={
            session
              ? needsOnboarding
                ? <Navigate to="/onboarding" replace />
                : <Dashboard session={session} />
              : <Navigate to="/auth" replace />
          } />
          <Route path="/*" element={
            session
              ? needsOnboarding
                ? <Navigate to="/onboarding" replace />
                : <Dashboard session={session} />
              : <Navigate to="/" replace />
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}