// Starts a Mollie payment for one plan and returns the hosted payment page
// to send the buyer to, straight away: no email is asked first, that was
// friction. The buyer gives it on /success after paying.
//
// So the payment carries a claim code: a random secret, in the return URL
// and in the payment's metadata, mapped here to the payment. Whoever comes
// back from Mollie with it can attach an email to that one payment
// (api/mollie-claim.js); nobody without it can.
//
// 3 months and the year are subscriptions, so Mollie needs a customer to store the card
// against (sequenceType "first"): one is created with no email, and the email
// is added to it on the claim. When the email IS already known (a returning
// visitor), it is passed along and the customer reused, as before.
//
// What is charged comes from MOLLIE_PRICES, never from the request.
//
// plan "addons" is the options bought afterwards, from the account page:
// { plan: "addons", email, addons }. The email is required and must hold the
// lifetime access, since the options are sold with it; options it already
// holds are left out; the payment is a one-off for the rest, and comes back
// to /account.
import { randomBytes } from "node:crypto";
import { Redis } from "@upstash/redis";
import { CHECKOUT_PROVIDER, customerAccessLevel, mollieReady, redisGetAccessRecord, redisGetAddons, checkoutProviderFor, methodNotAllowed, MOLLIE_ADDONS, INCLUDED_ADDONS, parseAddons, MOLLIE_LIFETIME_PROMO, MOLLIE_PACK_SIZES, MOLLIE_PLAN_LABELS, MOLLIE_PRICES, strikeText, MOLLIE_WINBACK, mollieApi, mollieWinbackEligibility, normalizeEmail, RETIRED_PLANS } from "./_shared.js";

const looksLikeEmail = (email) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

async function customerFor(email) {
  if (!email) {
    const customer = await mollieApi("/customers", { method: "POST", body: { metadata: { source: "movento.dev" } } });
    return customer.id;
  }
  const key = `mollie:customer:${email}`;
  let redis = null;
  try {
    redis = Redis.fromEnv();
    const known = await redis.get(key);
    if (known) return String(known);
  } catch {
    // No Redis: a new customer each time, which Mollie handles fine.
  }
  const customer = await mollieApi("/customers", { method: "POST", body: { email, metadata: { source: "movento.dev" } } });
  try { await redis?.set(key, customer.id); } catch {}
  return customer.id;
}

// What Mollie's checkout shows for lifetime: the offer, the struck price and
// the price paid, e.g. "Movento — Accès à vie · Offre 3̶4̶9̶€ → 249€" when MOLLIE_LIFETIME_ANCHOR is set.
function lifetimeDescription(amount, offer) {
  const paid = `${Number(amount).toFixed(2).replace(/\.00$/, "").replace(".", ",")}€`;
  const { anchor, label } = MOLLIE_LIFETIME_PROMO;
  // The win-back is struck against the regular lifetime price, which is real.
  const regular = `${Number(MOLLIE_PRICES.lifetime).toFixed(2).replace(/\.00$/, "").replace(".", ",")}€`;
  if (offer) return `Movento — Accès à vie · offre spéciale ${strikeText(anchor ? `${anchor}€` : regular)} → ${paid}`;
  if (anchor) return `Movento — Accès à vie · ${label} ${strikeText(`${anchor}€`)} → ${paid}`;
  return label ? `Movento — Accès à vie · ${label}` : "Movento — Accès à vie";
}

// Options added later to an account that has access: the month, or the
// prompts-only lifetime. The options it already holds are left out.
async function addonsCheckout(req, res, email) {
  if (CHECKOUT_PROVIDER !== "mollie" || !mollieReady()) {
    return res.status(400).json({ error: "Les options ne sont pas disponibles au paiement.", errorEn: "The options cannot be paid for right now." });
  }
  if (!looksLikeEmail(email)) return res.status(400).json({ error: "Entre une adresse email valide.", errorEn: "Enter a valid email address." });
  const wanted = parseAddons(req.body?.addons);
  if (!wanted.length) return res.status(400).json({ error: "Choisis au moins une option.", errorEn: "Choose at least one option." });

  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const site = `https://${host}`;
  try {
    const [level, record, held] = await Promise.all([customerAccessLevel(email), redisGetAccessRecord(email), redisGetAddons(email)]);
    if (level !== "full" || !record) {
      return res.status(403).json({ error: "Les options s'ajoutent à un accès Movento. Cet email n'en a pas.", errorEn: "The options are added to a Movento access. This email has none.", needsAccess: true });
    }
    // Prompts made to order are counted in requests: bought again at will.
    const addons = wanted.filter((a) => !held.includes(a) || MOLLIE_ADDONS[a].credits);
    if (!addons.length) return res.status(409).json({ error: "Tu as déjà ces options.", errorEn: "You already have these options." });

    const amount = addons.reduce((sum, a) => sum + Number(MOLLIE_ADDONS[a].price), 0).toFixed(2);
    const customerId = await customerFor(email);
    const claim = randomBytes(18).toString("base64url");
    const back = `${site}/account?email=${encodeURIComponent(email)}`;
    const payment = await mollieApi("/payments", {
      method: "POST",
      body: {
        amount: { currency: "EUR", value: amount },
        description: `Movento — ${addons.length > 1 ? "Options" : "Option"} : ${addons.map((a) => MOLLIE_ADDONS[a].label).join(" + ")}`,
        customerId,
        sequenceType: "oneoff",
        redirectUrl: `${back}&paid=${claim}`,
        cancelUrl: back,
        webhookUrl: `${site}/api/mollie-webhook`,
        locale: "fr_FR",
        metadata: { plan: "addons", claim, addons: addons.join(","), email },
      },
    });
    await Redis.fromEnv().set(`mollie:claim:${claim}`, { paymentId: payment.id, plan: "addons" }, { ex: 60 * 86400 });
    const checkoutUrl = payment?._links?.checkout?.href;
    if (!checkoutUrl) throw new Error("Mollie returned no checkout link");
    return res.json({ checkoutUrl, claim, addons, amount });
  } catch (error) {
    console.error("Mollie add-ons checkout failed:", error);
    return res.status(502).json({ error: "Le paiement n'a pas pu démarrer. Réessaie dans un instant.", errorEn: "The payment could not start. Try again in a moment." });
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);
  res.setHeader("Cache-Control", "no-store");

  const plan = String(req.body?.plan || "");
  const email = normalizeEmail(req.body?.email);
  if (plan === "addons") return addonsCheckout(req, res, email);
  if (RETIRED_PLANS.has(plan) || checkoutProviderFor(plan) !== "mollie") {
    return res.status(400).json({ error: "Cette offre n'est pas disponible au paiement." });
  }
  // Optional: used when known, never required.
  const knownEmail = looksLikeEmail(email) ? email : "";

  // The win-back price, only on the plan it is for and only while the
  // payment the buyer left still earns it (api/_shared.js). Anything else in
  // `offer` is ignored and the normal price is charged.
  let offer = null;
  if (req.body?.offer && plan === MOLLIE_WINBACK.plan) {
    try {
      const check = await mollieWinbackEligibility(String(req.body.offer), { left: req.body?.left === true });
      if (check.eligible) offer = { from: String(req.body.offer) };
    } catch (error) {
      console.error("Mollie win-back check failed:", error);
    }
  }
  const base = offer ? MOLLIE_WINBACK.price : MOLLIE_PRICES[plan];
  // Add-ons ticked on the card: on the month only, at the server's prices,
  // paid once with the first month. Lifetime + options carries them all; the
  // prompts-only lifetime none.
  const addons = plan === "m1" ? parseAddons(req.body?.addons) : plan === "lifetime_plus" ? INCLUDED_ADDONS : [];
  const amount = (Number(base) + (plan === "m1" ? addons.reduce((sum, a) => sum + Number(MOLLIE_ADDONS[a].price), 0) : 0)).toFixed(2);
  const addonText = addons.map((a) => ` + ${MOLLIE_ADDONS[a].label}`).join("");

  // The site's own address, as this request reached it.
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const site = `https://${host}`;
  try {
    const customerId = await customerFor(knownEmail);
    const claim = randomBytes(18).toString("base64url");
    const payment = await mollieApi("/payments", {
      method: "POST",
      body: {
        amount: { currency: "EUR", value: amount },
        description: MOLLIE_PACK_SIZES[plan] ? `Movento — Pack de ${MOLLIE_PACK_SIZES[plan]} prompts` : plan === "lifetime" ? lifetimeDescription(base, offer) : plan === "lifetime_plus" ? lifetimeDescription(base, offer).replace("Accès à vie", "Accès à vie + options") : `Movento — ${MOLLIE_PLAN_LABELS[plan]}${addonText}`,
        customerId,
        // A subscription (3 months, the year) stores the card for the charges
        // that follow; lifetime is charged once.
        sequenceType: plan === "lifetime" || plan === "lifetime_plus" || MOLLIE_PACK_SIZES[plan] ? "oneoff" : "first",
        redirectUrl: `${site}/success?provider=mollie&claim=${claim}${knownEmail ? `&email=${encodeURIComponent(knownEmail)}` : ""}`,
        // Back on the pricing page with the claim, which is what lets the page
        // offer the year at the win-back price to someone who left.
        cancelUrl: `${site}/pricing?left=${claim}`,
        webhookUrl: `${site}/api/mollie-webhook`,
        locale: "fr_FR",
        // `base`: the plan's own price, which the renewals charge; the
        // options are paid once, with this first payment only.
        metadata: { plan, claim, base: String(base), ...(addons.length ? { addons: addons.join(",") } : {}), ...(offer ? { offer: "winback", offerFrom: offer.from } : {}), ...(knownEmail ? { email: knownEmail } : {}) },
      },
    });
    // Kept 60 days: long enough for a buyer who closes the tab and comes back.
    await Redis.fromEnv().set(`mollie:claim:${claim}`, { paymentId: payment.id, plan }, { ex: 60 * 86400 });
    const checkoutUrl = payment?._links?.checkout?.href;
    if (!checkoutUrl) throw new Error("Mollie returned no checkout link");
    return res.json({ checkoutUrl, claim });
  } catch (error) {
    console.error("Mollie checkout failed:", error);
    return res.status(502).json({ error: "Le paiement n'a pas pu démarrer. Réessaie dans un instant.", errorEn: "The payment could not start. Try again in a moment." });
  }
}
