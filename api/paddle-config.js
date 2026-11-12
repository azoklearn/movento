import { methodNotAllowed, paddleCheckoutReady, paddleClientToken, paddleEnvironment, paddlePriceIdLists, paddlePriceIds } from "./_shared.js";

// What a browser needs to open Paddle's checkout, and nothing else. The
// client-side token is public by design — Paddle.js embeds it in the page — so
// it can be served here. The API key and the webhook secret never leave the
// server and are not read by this file.
//
// Used by the /paddle-test page. The real checkout gets the same three facts
// from /api/create-checkout-session, for the one plan being bought.
export default function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, "GET");
  res.setHeader("Cache-Control", "no-store");

  const environment = paddleEnvironment();
  const token = paddleClientToken();
  if (!token) {
    return res.status(503).json({ error: "PADDLE_CLIENT_TOKEN n'est pas configuré dans Vercel.", environment });
  }

  // Paddle's sandbox tokens start test_ and live ones live_. A mismatch is the
  // most likely setup mistake, and Paddle's own error for it is opaque, so it
  // is named here — as a warning, not a refusal, in case the prefixes change.
  const expected = environment === "sandbox" ? "test_" : "live_";
  const warnings = [];
  if (!token.startsWith(expected)) warnings.push(`Le token ne commence pas par ${expected} alors que l'environnement est ${environment} : Paddle risque de le refuser.`);
  // What the real checkout also needs, named so the test page says what is
  // missing before anyone pays.
  if (!process.env.PADDLE_API_KEY) warnings.push("PADDLE_API_KEY manque : le webhook ne pourra pas lire l'email de l'acheteur.");
  if (!process.env.PADDLE_WEBHOOK_SECRET) warnings.push("PADDLE_WEBHOOK_SECRET manque : les paiements ne débloqueront pas l'accès.");
  const prices = paddlePriceIds();
  if (!prices.m1) warnings.push("PADDLE_M1_PRICE_ID manque (mensuel, 29,99 €).");
  if (!prices.lifetime) warnings.push("PADDLE_LIFETIME_PRICE_ID manque (à vie, 89 €).");
  // The likeliest copy-paste mistake: the product id (pro_…) where the price
  // id (pri_…) goes. Paddle's checkout only takes the price.
  for (const [plan, id] of Object.entries(paddlePriceIdLists()).flatMap(([p, ids]) => ids.map((i) => [p, i]))) {
    if (id && !id.startsWith("pri_")) warnings.push(`L'identifiant ${plan} (${id}) n'est pas un prix : il doit commencer par pri_ (Catalog → Products → le produit → Prices). Un identifiant pro_ est celui du produit.`);
  }
  // What each variable holds, as read: a value with anything but price ids
  // and separators in it is worth seeing as Vercel has it.
  for (const name of ["PADDLE_M1_PRICE_ID", "PADDLE_M3_PRICE_ID", "PADDLE_M12_PRICE_ID", "PADDLE_LIFETIME_PRICE_ID"]) {
    const raw = String(process.env[name] || "");
    const leftover = raw.replace(/pri_[A-Za-z0-9]+/g, "").replace(/[\s,;"']/g, "");
    if (raw && leftover) warnings.push(`${name} contient autre chose que des identifiants pri_… (${JSON.stringify(raw)}).`);
  }
  const switchedOn = String(process.env.CHECKOUT_PROVIDER || "").trim().toLowerCase() === "paddle";
  if (switchedOn && environment !== "production") warnings.push("CHECKOUT_PROVIDER=paddle est déjà posé alors que PADDLE_ENV n'est pas production : le site affiche l'offre Paddle (mensuel + à vie) mais n'encaisse pas avec Paddle. Retire-le jusqu'à la mise en ligne.");

  return res.json({
    environment,
    token,
    prices,
    // Every price recognised per plan, the sold one first.
    recognised: paddlePriceIdLists(),
    live: paddleCheckoutReady() && switchedOn,
    warning: warnings.join(" ") || null,
  });
}
