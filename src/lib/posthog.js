// ── PostHog Analytics Init ──────────────────────────────────────────────────
import posthog from "posthog-js";

let initialized = false;

function readConsent() {
  try {
    return localStorage.getItem("fd_cookie_consent");
  } catch {
    return null;
  }
}

// Consent model (matches the cookie banner):
// - Before consent or "essential": events are kept in memory only (no
//   cookies, nothing persisted on the device) and session replay is off.
// - "all": normal localStorage + cookie persistence and session replay.
export function initPostHog() {
  if (initialized) return posthog;
  const key = import.meta.env.VITE_POSTHOG_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com";

  if (!key) {
    console.warn("PostHog key missing, analytics disabled.");
    return null;
  }

  const full = readConsent() === "all";
  posthog.init(key, {
    api_host: host,
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: full,
    persistence: full ? "localStorage+cookie" : "memory",
    disable_session_recording: !full,
  });

  initialized = true;
  return posthog;
}

// Called by the cookie banner when the visitor chooses.
export function applyAnalyticsConsent(value) {
  if (!initialized) return;
  if (value === "all") {
    posthog.set_config({ persistence: "localStorage+cookie", autocapture: true });
    posthog.startSessionRecording?.();
  } else {
    posthog.set_config({ persistence: "memory", autocapture: false });
    posthog.stopSessionRecording?.();
  }
}

export { posthog };
