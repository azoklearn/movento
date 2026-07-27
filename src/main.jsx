import React from "react";
import ReactDOM from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import { track } from "@vercel/analytics";
import App from "./App.jsx";
import { captureRef, isFirstRefVisitOfSession } from "./affiliate.js";
import "./index.css";

// Whop redirects back to whatever URL is configured (often the site root) and
// appends checkout_status=success. Catch that anywhere and route the buyer to
// the dedicated /success page — no dependency on the exact Whop redirect setting.
if (typeof window !== "undefined") {
  const params = new URLSearchParams(window.location.search);
  if (window.location.pathname !== "/success" && params.get("checkout_status") === "success") {
    window.location.replace("/success");
  }

  // Store the affiliate code before anything else can navigate away, so a visit
  // counts even if the visitor bounces immediately.
  const ref = captureRef();
  if (ref && isFirstRefVisitOfSession()) track("affiliate_visit", { ref });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>
);
