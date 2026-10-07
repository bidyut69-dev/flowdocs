// ── PostHog Analytics ───────────────────────────────────────────────────────
// posthog-js (~65KB gzip, plus remote extensions) is loaded lazily when the
// browser is idle, so it stays off the Landing page's critical path. Until it
// loads, calls on the exported `posthog` object are queued and replayed.

let ph = null;
let initStarted = false;
const queue = [];

function readConsent() {
  try {
    return localStorage.getItem("fd_cookie_consent");
  } catch {
    return null;
  }
}

function call(method, args) {
  if (ph) return ph[method]?.(...args);
  queue.push([method, args]);
}

// Same call shape as the posthog-js instance for the methods the app uses.
export const posthog = {
  capture: (...a) => call("capture", a),
  identify: (...a) => call("identify", a),
  set_config: (...a) => call("set_config", a),
  startSessionRecording: (...a) => call("startSessionRecording", a),
  stopSessionRecording: (...a) => call("stopSessionRecording", a),
};

// Consent model (matches the cookie banner):
// - Before consent or "essential": events are kept in memory only (no
//   cookies, nothing persisted on the device); autocapture and session
//   replay are off.
// - "all": normal localStorage + cookie persistence, autocapture, replay.
export function initPostHog() {
  if (initStarted) return;
  const key = import.meta.env.VITE_POSTHOG_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com";
  if (!key) {
    console.warn("PostHog key missing, analytics disabled.");
    return;
  }
  initStarted = true;

  const load = async () => {
    try {
      const { default: instance } = await import("posthog-js");
      const full = readConsent() === "all";
      instance.init(key, {
        api_host: host,
        capture_pageview: true,
        capture_pageleave: true,
        autocapture: full,
        persistence: full ? "localStorage+cookie" : "memory",
        disable_session_recording: !full,
        disable_surveys: true, // not used; saves a 33KB script
      });
      ph = instance;
      queue.splice(0).forEach(([method, args]) => ph[method]?.(...args));
    } catch {
      /* analytics must never break the app */
    }
  };

  const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1500));
  idle(load, { timeout: 4000 });
}

// Called by the cookie banner when the visitor chooses.
export function applyAnalyticsConsent(value) {
  if (value === "all") {
    posthog.set_config({ persistence: "localStorage+cookie", autocapture: true });
    posthog.startSessionRecording();
  } else {
    posthog.set_config({ persistence: "memory", autocapture: false });
    posthog.stopSessionRecording();
  }
}
