// Gumroad's sale notifications ("Ping" in Settings → Advanced, and the API's
// resource subscriptions), turned into the same Redis access record the Whop
// webhook writes. customerAccessLevel reads that record first, so a buyer who
// paid on Gumroad unlocks the catalogue exactly like one who paid on Whop.
//
// Gumroad does not sign these requests. So:
//   - the URL carries a secret, GUMROAD_WEBHOOK_TOKEN, compared in constant
//     time. Unset, every request is refused: a grant is the whole catalogue,
//     and an open endpoint would hand it to anyone who found the URL.
//   - GUMROAD_SELLER_ID, when set, must match the payload's seller_id.
//   - only the products named in GUMROAD_M1_PRODUCT and
//     GUMROAD_LIFETIME_PRODUCT unlock anything. Anything else sold on the same
//     account is acknowledged and ignored.
import { timingSafeEqual } from "node:crypto";
import {
  gumroadCheckoutUrls,
  methodNotAllowed,
  normalizeEmail,
  redisClearAccess,
  redisGetAccessRecord,
  redisSetAccess,
  formatMinorAmount,
  notifyTelegramOnce,
} from "./_shared.js";

const GUMROAD_PLAN_NAMES = { m1: "Mensuel", m12: "Annuel", lifetime: "À vie" };

const truthy = (v) => v === true || v === "true" || v === "1";

// "abc", "https://x.gumroad.com/l/abc", "https://x.gumroad.com/l/abc?wanted=1"
// all name the same product.
const lastSegment = (value) => {
  const s = String(value || "").trim().split("?")[0].replace(/\/+$/, "");
  return s.slice(s.lastIndexOf("/") + 1).toLowerCase();
};

// Defaults to the product the checkout sells, so the plan that is on sale is
// always one the webhook recognises.
export const gumroadProducts = () => ({
  m1: process.env.GUMROAD_M1_PRODUCT || gumroadCheckoutUrls.m1 || "",
  m12: process.env.GUMROAD_M12_PRODUCT || gumroadCheckoutUrls.m12 || "",
  lifetime: process.env.GUMROAD_LIFETIME_PRODUCT || gumroadCheckoutUrls.lifetime || "",
});

// Which of our plans a Gumroad payload is for, or null. Matched on every
// identifier Gumroad sends, so the env var can hold whichever one is to hand:
// the product id, the short id, the permalink, or the full product URL.
export function gumroadPlanOf(fields, products = gumroadProducts()) {
  const seen = [fields.product_id, fields.short_product_id, fields.permalink, fields.product_permalink]
    .filter(Boolean)
    .map(lastSegment);
  for (const [kind, ref] of Object.entries(products)) {
    if (ref && seen.includes(lastSegment(ref))) return kind;
  }
  return null;
}

// What to do with one notification, and nothing else: no I/O, so it can be
// tested without Gumroad or Redis.
//
// A cancelled subscription is NOT revoked here. Gumroad sends "cancellation"
// when the buyer clicks cancel, but they have paid to the end of the period;
// "subscription_ended" is the one that means the access should stop.
export function gumroadDecision(fields, products = gumroadProducts()) {
  const email = normalizeEmail(fields.email);
  const resource = String(fields.resource_name || "sale").toLowerCase();
  if (!email) return { action: "ignore", reason: "no email" };
  const kind = gumroadPlanOf(fields, products);
  if (!kind) return { action: "ignore", email, reason: "product is not one of ours" };

  if (resource === "refund" || resource === "dispute" || resource === "subscription_ended") {
    return { action: "revoke", email, kind, reason: resource };
  }
  if (resource === "sale") {
    const lost = truthy(fields.refunded) || (truthy(fields.disputed) && !truthy(fields.dispute_won));
    return lost
      ? { action: "revoke", email, kind, reason: "sale already refunded or disputed" }
      : { action: "grant", email, kind, reason: "sale" };
  }
  if (resource === "dispute_won" || resource === "subscription_restarted") {
    return { action: "grant", email, kind, reason: resource };
  }
  return { action: "ignore", email, kind, reason: resource };
}

function tokenMatches(given, expected) {
  const a = Buffer.from(String(given || ""));
  const b = Buffer.from(String(expected || ""));
  return a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
}

// Gumroad posts application/x-www-form-urlencoded. Vercel usually parses it
// into an object already; the other shapes are handled so a change in that
// does not silently drop every sale.
async function readFields(req) {
  const body = req.body;
  if (body && typeof body === "object" && !Buffer.isBuffer(body)) return body;
  let text = typeof body === "string" ? body : Buffer.isBuffer(body) ? body.toString("utf8") : "";
  if (!text && typeof req[Symbol.asyncIterator] === "function") {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    text = Buffer.concat(chunks).toString("utf8");
  }
  text = text.trim();
  if (text.startsWith("{")) {
    try { return JSON.parse(text); } catch { return {}; }
  }
  return Object.fromEntries(new URLSearchParams(text));
}

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  const expected = process.env.GUMROAD_WEBHOOK_TOKEN;
  if (!expected) {
    console.error("Gumroad webhook called but GUMROAD_WEBHOOK_TOKEN is not set");
    return res.status(503).json({ error: "Webhook non configuré." });
  }
  const given = req.query?.token ?? new URL(req.url || "/", "http://local").searchParams.get("token");
  if (!tokenMatches(given, expected)) return res.status(401).json({ error: "Non autorisé." });

  const fields = await readFields(req);

  const seller = process.env.GUMROAD_SELLER_ID;
  if (seller && String(fields.seller_id || "") !== seller) {
    console.error("Gumroad webhook from an unexpected seller:", fields.seller_id);
    return res.status(401).json({ error: "Vendeur inconnu." });
  }

  const decision = gumroadDecision(fields);

  try {
    if (decision.action === "grant") {
      const previous = await redisGetAccessRecord(decision.email);
      // A lifetime member who also starts a monthly keeps the lifetime record:
      // it is the better grant, and the monthly ending must not take it away.
      if (previous?.kind === "lifetime" && decision.kind !== "lifetime") {
        console.log("Gumroad sale kept under an existing lifetime:", decision.email);
      } else {
        await redisSetAccess(decision.email, {
          plan: `gumroad_${decision.kind}`,
          kind: decision.kind,
          type: decision.kind === "lifetime" ? "lifetime" : "subscription",
          status: "active",
          membershipId: fields.subscription_id || fields.sale_id || null,
          provider: "gumroad",
          ...(truthy(fields.test) ? { test: true } : {}),
          grantedAt: new Date().toISOString(),
        });
        console.log("Access granted via Gumroad:", decision.email, decision.kind, decision.reason);
        // Gumroad's price is in cents of the sale's currency.
        const amount = formatMinorAmount(fields.price, fields.currency);
        const renewal = truthy(fields.is_recurring_charge);
        await notifyTelegramOnce(
          `gumroad:${fields.sale_id || `${decision.email}:${decision.reason}:${fields.sale_timestamp || ""}`}`,
          [`${truthy(fields.test) ? "🧪 TEST · " : ""}${renewal ? "🔁 Renouvellement" : "💰 Nouvelle vente"} Gumroad — ${GUMROAD_PLAN_NAMES[decision.kind] || decision.kind}`, amount, decision.email].filter(Boolean).join("\n"),
        );
      }
    } else if (decision.action === "revoke") {
      const previous = await redisGetAccessRecord(decision.email);
      // Only what Gumroad granted. A refund here must not cost someone the
      // access they hold from Whop or from an admin grant.
      if (previous?.provider === "gumroad") {
        await redisClearAccess(decision.email);
        console.log("Access revoked via Gumroad:", decision.email, decision.reason);
        await notifyTelegramOnce(
          `gumroad:revoke:${fields.sale_id || fields.subscription_id || decision.email}:${decision.reason}`,
          `${decision.reason === "subscription_ended" ? "❌ Abonnement terminé" : "↩️ Remboursement / litige"} Gumroad — ${GUMROAD_PLAN_NAMES[decision.kind] || decision.kind}\n${decision.email}`,
        );
      } else if (previous) {
        console.log("Gumroad revoke skipped, access comes from elsewhere:", decision.email, previous.plan);
      }
    } else {
      console.log("Gumroad notification ignored:", decision.reason, decision.email || "");
    }
  } catch (error) {
    console.error("Gumroad webhook handling failed:", error);
    // 500 so Gumroad retries: a sale that could not be recorded must not be lost.
    return res.status(500).json({ error: "Traitement impossible." });
  }

  return res.json({ received: true, action: decision.action });
}
