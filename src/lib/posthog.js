// ── PostHog Analytics Init ──────────────────────────────────────────────────
import posthog from "posthog-js";

let initialized = false;

export function initPostHog() {
  if (initialized) return posthog;
  const key = import.meta.env.VITE_POSTHOG_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com";

  if (!key) {
    console.warn("PostHog key missing — analytics disabled.");
    return null;
  }

  posthog.init(key, {
    api_host: host,
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true, // tracks clicks/inputs automatically too
  });

  initialized = true;
  return posthog;
}

export { posthog };