import { track as vercelTrack } from "@vercel/analytics";

// PostHog sits alongside Vercel Analytics rather than replacing it: Vercel is
// what the deployment dashboard reads, PostHog is where funnels and retention
// get looked at. Every event this module sends goes to both, so there is one
// call site per event in the app and no risk of the two drifting apart.
//
// The project key is public — it is what the browser ships — but it still comes
// from the environment so a fork or a preview deploy does not report into the
// production project. With no key set, PostHog is never even downloaded.
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || "";
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || "https://eu.i.posthog.com";

let posthogRef = null;
let started = false;
// Events fired while the library is still downloading. Bounded: if the import
// never resolves, this must not grow for the life of the page.
const pending = [];
const PENDING_LIMIT = 50;

// Opening a prompt preview pushes /prompt/<slug> into the history, which both
// analytics tools count as a page view. That buried the pages that matter
// (/, /pricing) under one row per prompt. Same rule as the Vercel side.
// Exported so it can be tested on its own: the rest of this module only runs
// against a live PostHog project, and this rule is the part worth pinning down.
export function dropPromptPageviews(event) {
  if (!event || event.event !== "$pageview") return event;
  const path = event.properties?.$pathname || "";
  return String(path).startsWith("/prompt/") ? null : event;
}

export function initAnalytics() {
  if (started || !POSTHOG_KEY || typeof window === "undefined") return;
  started = true;

  // Dynamic import on purpose: posthog-js is ~90kB gzipped, which is two thirds
  // of the whole app. Bundled statically it would delay first paint for every
  // visitor. Split out, it is a separate request that starts after the page is
  // already interactive — and one that is never made at all without a key.
  import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        // Anonymous by default. Nobody logs in here — the access email is a
        // purchase key, not an account — so a person profile per visitor would
        // bill for identifying people we never identify.
        person_profiles: "identified_only",
        before_send: dropPromptPageviews,
      });
      posthogRef = posthog;
      for (const [name, properties] of pending.splice(0)) posthog.capture(name, properties);
    })
    .catch((error) => {
      // Analytics must never take the site down with it. Release the queue so
      // it cannot hold onto events for a library that will not arrive.
      pending.length = 0;
      console.error("PostHog failed to load:", error);
    });
}

// Drop-in replacement for @vercel/analytics' track, sending to both.
export function track(name, properties) {
  try {
    vercelTrack(name, properties);
  } catch (error) {
    console.error("Vercel Analytics track failed:", error);
  }

  if (!started) return;
  if (!posthogRef) {
    if (pending.length < PENDING_LIMIT) pending.push([name, properties]);
    return;
  }
  try {
    posthogRef.capture(name, properties);
  } catch (error) {
    console.error("PostHog capture failed:", error);
  }
}
