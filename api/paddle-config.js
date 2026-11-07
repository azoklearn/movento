import { methodNotAllowed } from "./_shared.js";

// What a browser needs to open Paddle's checkout, and nothing else. The
// client-side token is public by design — Paddle.js embeds it in the page — so
// it can be served here. The API key and the webhook secret never leave the
// server and are not read by this file.
//
// Sandbox unless PADDLE_ENV says "production": the first runs are tests with
// Paddle's test cards, and a sandbox checkout cannot take real money.
const DEFAULT_M1_PRICE = "pri_01m6w6hq41jjdsrgwm0vjz156g"; // monthly, product pro_01m6w6geahj4ade9k6hhsp5995

export default function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, "GET");
  res.setHeader("Cache-Control", "no-store");

  const environment = String(process.env.PADDLE_ENV || "").trim().toLowerCase() === "production" ? "production" : "sandbox";
  const token = String(process.env.PADDLE_CLIENT_TOKEN || "").trim();
  if (!token) {
    return res.status(503).json({ error: "PADDLE_CLIENT_TOKEN n'est pas configuré dans Vercel.", environment });
  }

  // Paddle's sandbox tokens start test_ and live ones live_. A mismatch is the
  // most likely setup mistake, and Paddle's own error for it is opaque, so it
  // is named here — as a warning, not a refusal, in case the prefixes change.
  const expected = environment === "sandbox" ? "test_" : "live_";
  const warning = token.startsWith(expected)
    ? null
    : `Le token ne commence pas par ${expected} alors que l'environnement est ${environment} : Paddle risque de le refuser.`;

  return res.json({
    environment,
    token,
    prices: { m1: String(process.env.PADDLE_M1_PRICE_ID || DEFAULT_M1_PRICE).trim() },
    warning,
  });
}
