// ── FlowDocs Analytics ─────────────────────────────────────────────────
// Tracks user events. Sends to PostHog (free, self-hostable).
// To enable: add VITE_POSTHOG_KEY to .env
// PostHog free tier: 1M events/month

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = "https://app.posthog.com";

let posthog = null;

// Initialize PostHog (call once in main.jsx)
export async function initAnalytics() {
  const consent = localStorage.getItem("fd_cookie_consent");
  if (consent !== "all") return; // Only track with consent

  if (POSTHOG_KEY && typeof window !== "undefined") {
    try {
      const ph = await import("posthog-js");
      posthog = ph.default;
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        capture_pageview: true,
        persistence: "localStorage",
        autocapture: false, // Manual tracking only
      });
    } catch {
      console.log("PostHog not loaded");
    }
  }
}

// ── Event tracking ─────────────────────────────────────────────────────

export function track(event, properties = {}) {
  const consent = localStorage.getItem("fd_cookie_consent");
  if (consent !== "all") return;

  const payload = {
    event,
    properties: {
      ...properties,
      url: window.location.pathname,
      timestamp: new Date().toISOString(),
    },
  };

  // PostHog
  if (posthog) {
    posthog.capture(event, payload.properties);
  }

  // Google Analytics 4
  if (window.gtag) {
    window.gtag("event", event, properties);
  }

  // Dev logging
  if (import.meta.env.DEV) {
    console.log("[Analytics]", event, properties);
  }
}

export function identifyUser(userId, traits = {}) {
  if (posthog) posthog.identify(userId, traits);
  if (window.gtag) window.gtag("set", "user_properties", traits);
}

export function trackPage(pageName) {
  track("page_view", { page: pageName });
}

// ── Predefined events ──────────────────────────────────────────────────
// Use these everywhere in the app for consistency

export const Events = {
  // Auth
  SIGNUP: "user_signed_up",
  LOGIN: "user_logged_in",
  LOGOUT: "user_logged_out",
  PASSWORD_RESET: "password_reset_requested",

  // Documents
  DOC_CREATED: "document_created",
  DOC_SENT: "document_sent",
  DOC_SIGNED: "document_signed",
  DOC_DOWNLOADED: "document_downloaded",
  DOC_LINK_COPIED: "signing_link_copied",

  // Clients
  CLIENT_ADDED: "client_added",

  // Billing
  UPGRADE_CLICKED: "upgrade_button_clicked",
  PAYMENT_STARTED: "payment_started",
  PAYMENT_SUCCESS: "payment_success",
  PAYMENT_FAILED: "payment_failed",

  // Feedback
  BUG_REPORTED: "bug_reported",
  FEATURE_REQUESTED: "feature_requested",
};

// ── Google Analytics setup (add to index.html manually) ───────────────
// Replace G-XXXXXXXXXX with your GA4 Measurement ID from analytics.google.com
//
// <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
// <script>
//   window.dataLayer = window.dataLayer || [];
//   function gtag(){dataLayer.push(arguments);}
//   gtag('js', new Date());
//   gtag('config', 'G-XXXXXXXXXX');
// </script>