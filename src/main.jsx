import React from "react";
import ReactDOM from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import { initAnalytics, track } from "./analytics.js";
import App from "./App.jsx";
import { captureRef, isFirstRefVisitOfSession } from "./affiliate.js";
import "./index.css";

// Whop redirects back to whatever URL is configured (often the site root) and
// appends checkout_status=success. Catch that anywhere and route the buyer to
// the dedicated /success page — no dependency on the exact Whop redirect setting.
if (typeof window !== "undefined") {
  // Before anything is tracked, so the very first event is not dropped. A no-op
  // until VITE_POSTHOG_KEY is set.
  initAnalytics();

  const params = new URLSearchParams(window.location.search);
  if (window.location.pathname !== "/success" && params.get("checkout_status") === "success") {
    window.location.replace("/success");
  }

  // Store the affiliate code before anything else can navigate away, so a visit
  // counts even if the visitor bounces immediately.
  const ref = captureRef();
  if (ref && isFirstRefVisitOfSession()) track("affiliate_visit", { ref });
}

// Opening a prompt preview pushes /prompt/<slug> into the history, which the
// analytics script counts as a page view. That buried the pages that matter
// (/, /pricing) under one row per prompt. Drop those views — custom events are
// kept, so prompt_copied and paywall_shown still report which prompt was
// involved.
function dropPromptPageviews(event) {
  if (event.type !== "pageview") return event;
  try {
    return new URL(event.url).pathname.startsWith("/prompt/") ? null : event;
  } catch {
    return event;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <Analytics beforeSend={dropPromptPageviews} />
  </React.StrictMode>
);
