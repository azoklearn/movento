// Paddle's notifications, turned into the same Redis access record the other
// processors' webhooks write. customerAccessLevel reads that record first, so a
// Paddle buyer unlocks the catalogue exactly like any other.
//
// Unlike Gumroad's ping, Paddle also says when a subscription ENDS, so this is
// the one processor where access is taken away on its own: a cancellation at
// the end of the period arrives as subscription.canceled on that date.
//
// Configure in Paddle → Developer Tools → Notifications, destination
// https://movento.dev/api/paddle-webhook, with at least:
//   transaction.completed, subscription.created, subscription.updated,
//   subscription.canceled, subscription.paused, subscription.resumed,
//   adjustment.created, adjustment.updated (refunds and chargebacks)
//
// Signed: the Paddle-Signature header carries ts=…;h1=…, an HMAC-SHA256 of
// "ts:raw body" under PADDLE_WEBHOOK_SECRET. Unset, every request is refused —
// a grant is the whole catalogue.
import { createHmac, timingSafeEqual } from "node:crypto";
import {
  formatMinorAmount,
  methodNotAllowed,
  notifyTelegramOnce,
  paddleEnvironment,
  normalizeEmail,
  paddleAccessRecord,
  paddleApi,
  paddleCustomerEmail,
  paddleGrantAllowed,
  paddleMarkRefunded,
  paddleWasRefunded,
  recordWebhookStatus,
  paddlePlanOfItems,
  paddleSubscriptionIsLive,
  paddleSubscriptionSummary,
  redisClearAccess,
  redisGetAccessRecord,
  redisSetAccess,
} from "./_shared.js";

// The signature is over the exact bytes Paddle sent, so the body must not be
// parsed first.
export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

// Every h1 is checked: Paddle sends more than one while a secret is rotated.
export function verifyPaddleSignature(rawBody, header, secret) {
  if (!header || !secret) return false;
  const parts = String(header).split(";").map((p) => p.trim().split("="));
  const ts = parts.find(([k]) => k === "ts")?.[1];
  const signatures = parts.filter(([k]) => k === "h1").map(([, v]) => v || "");
  if (!ts || !signatures.length) return false;
  const expected = createHmac("sha256", secret).update(`${ts}:${rawBody.toString("utf8")}`).digest("hex");
  const a = Buffer.from(expected, "utf8");
  return signatures.some((sig) => {
    const b = Buffer.from(sig, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  });
}

// What to do with one event, without I/O, so it can be tested on its own.
export function paddleDecision(event) {
  const type = String(event?.event_type || "");
  const data = event?.data || {};
  if (type === "transaction.completed") {
    const kind = paddlePlanOfItems(data.items);
    if (!kind) return { action: "ignore", reason: "not one of our prices" };
    return {
      action: "grant",
      kind,
      subscriptionId: data.subscription_id || null,
      // Lifetime is paid once: the transaction is all there is to point at.
      transactionId: data.id || null,
      customerId: data.customer_id || null,
      customEmail: normalizeEmail(data.custom_data?.email),
    };
  }
  // A refund or a chargeback. Approved refunds only: a refund request can be
  // rejected, and a rejected one must not cost the buyer anything. The access
  // it takes away is the lifetime bought in that transaction; a subscription's
  // refund comes with its cancellation, which is handled above.
  if (type === "adjustment.created" || type === "adjustment.updated") {
    const action = String(data.action || "");
    const approved = String(data.status || "") === "approved";
    if ((action === "refund" && approved) || action === "chargeback") {
      return { action: "refund", reason: action, transactionId: data.transaction_id || null, subscriptionId: data.subscription_id || null, customerId: data.customer_id || null, customEmail: "" };
    }
    return { action: "ignore", reason: `adjustment ${action || "?"} ${data.status || ""}`.trim() };
  }
  if (type.startsWith("subscription.")) {
    const summary = paddleSubscriptionSummary(data);
    if (!summary.kind) return { action: "ignore", reason: "not one of our prices" };
    const base = { kind: summary.kind, subscriptionId: summary.id, customerId: summary.customerId, customEmail: normalizeEmail(data.custom_data?.email), status: summary.status, cancelAtPeriodEnd: summary.cancelAtPeriodEnd, renewalDate: summary.renewalDate };
    if (paddleSubscriptionIsLive(summary.status)) return { action: "grant", ...base };
    // canceled, paused: the period that was paid for is over.
    return { action: "revoke", reason: summary.status || type, ...base };
  }
  return { action: "ignore", reason: type || "no event type" };
}

// The Telegram line for one processed event, or null when there is nothing
// worth a ping. Pure, so it can be tested on its own. "previous" is the record
// as it was before this event, which is what tells a change from a repeat.
const PLAN_NAMES = { m1: "Mensuel", lifetime: "À vie", m12: "Annuel" };
export function paddleTelegramMessage(event, decision, email, previous) {
  const type = String(event?.event_type || "");
  const data = event?.data || {};
  const plan = PLAN_NAMES[decision.kind] || decision.kind || "";
  const test = paddleEnvironment() === "production" ? "" : "🧪 TEST · ";
  const date = (iso) => (iso ? new Date(iso).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" }) : "");

  if (type === "transaction.completed") {
    const totals = data.details?.totals || {};
    const paid = formatMinorAmount(totals.grand_total ?? totals.total, data.currency_code);
    const net = formatMinorAmount(totals.earnings, data.currency_code);
    const renewal = data.origin === "subscription_recurring";
    return [
      `${test}${renewal ? "🔁 Renouvellement" : "💰 Nouvelle vente"} Paddle — ${plan}`,
      [paid, net && `net ${net}`].filter(Boolean).join(" · "),
      email,
    ].filter(Boolean).join("\n");
  }
  if (decision.action === "refund") {
    const amount = formatMinorAmount(data.totals?.total, data.currency_code);
    const title = decision.reason === "chargeback" ? "⚠️ Litige bancaire (chargeback)" : "↩️ Remboursement";
    return [`${test}${title} Paddle`, amount, email].filter(Boolean).join("\n");
  }
  if (type === "subscription.canceled") return `${test}❌ Abonnement terminé — ${plan}\n${email}`;
  if (type === "subscription.paused") return `${test}⏸️ Abonnement en pause — ${plan}\n${email}`;
  if (type.startsWith("subscription.") && decision.action === "grant") {
    const was = previous?.provider === "paddle" ? previous : null;
    if (decision.status === "past_due" && was?.paddleStatus !== "past_due") {
      return `${test}💳 Paiement échoué — ${plan}\nPaddle va réessayer la carte.\n${email}`;
    }
    if (decision.cancelAtPeriodEnd && !was?.cancelScheduled) {
      return `${test}⚠️ Résiliation programmée — ${plan}\nFin de l'accès le ${date(decision.renewalDate)}\n${email}`;
    }
    if (!decision.cancelAtPeriodEnd && was?.cancelScheduled) {
      return `${test}✅ Résiliation annulée — ${plan}\n${email}`;
    }
  }
  return null;
}

// Every response is recorded (recordWebhookStatus) before it goes out, so
// /admin shows the last call Paddle made, its code, and what came of it.
export default async function handler(req, res) {
  const status = res.status.bind(res);
  const json = res.json.bind(res);
  let code = 200;
  res.status = (c) => { code = c; return status(c); };
  res.json = async (body) => {
    await recordWebhookStatus("paddle", {
      code,
      event: req.paddleEvent || "",
      outcome: body?.error || body?.ignored || body?.skipped || (body?.stale ? "notification plus ancienne que l'accès, ignorée" : "traitée"),
      telegram: req.paddleTelegram || "aucun message prévu",
    });
    return json(body);
  };
  return handle(req, res);
}

async function handle(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("Paddle webhook called but PADDLE_WEBHOOK_SECRET is not set");
    return res.status(503).json({ error: "Webhook non configuré." });
  }

  const rawBody = await getRawBody(req);
  if (!verifyPaddleSignature(rawBody, req.headers["paddle-signature"], secret)) {
    console.error("Paddle webhook: bad signature");
    return res.status(401).json({ error: "Signature invalide." });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return res.status(400).json({ error: "JSON invalide." });
  }

  req.paddleEvent = String(event?.event_type || "");
  const decision = paddleDecision(event);
  if (decision.action === "ignore") {
    console.log("Paddle notification ignored:", event.event_type, decision.reason);
    return res.json({ ok: true, ignored: decision.reason });
  }

  try {
    // The email is Paddle's, from the customer the payment was made by. The
    // checkout's own copy is only a fallback, for when the API cannot be read.
    let email = "";
    try {
      email = await paddleCustomerEmail(decision.customerId);
    } catch (error) {
      console.error("Paddle customer lookup failed:", error);
    }
    email = email || decision.customEmail;
    if (!email) {
      // 500 so Paddle retries: a paid sale with no email to unlock is a buyer
      // locked out, and the API may answer on the next attempt.
      console.error("Paddle notification with no email:", event.event_type, decision.customerId);
      return res.status(500).json({ error: "Email introuvable." });
    }

    const previous = await redisGetAccessRecord(email);
    // Notifications can arrive out of order. One older than the last one
    // applied would undo it — an "active" replayed after a cancellation.
    const occurredAt = event.occurred_at || new Date().toISOString();
    if (previous?.provider === "paddle" && previous.paddleEventAt && previous.paddleEventAt > occurredAt) {
      console.log("Paddle notification older than the record, skipped:", email, event.event_type);
      return res.json({ ok: true, stale: true });
    }

    // The subscription as it is NOW, when Paddle can be asked. That settles
    // notifications arriving out of order better than any timestamp: an old
    // "active" delivered after the subscription ended finds it canceled and
    // grants nothing, even though the cancellation already cleared the record
    // the timestamp check above reads.
    if (decision.subscriptionId) {
      try {
        const { data } = await paddleApi(`/subscriptions/${encodeURIComponent(decision.subscriptionId)}`);
        const liveNow = paddleSubscriptionIsLive(data?.status);
        if (decision.action === "grant" && !liveNow) {
          console.log("Paddle grant skipped, subscription is no longer live:", email, data?.status);
          return res.json({ ok: true, skipped: `subscription ${data?.status}` });
        }
        if (decision.action === "revoke" && liveNow) {
          console.log("Paddle revoke skipped, subscription is live again:", email, data?.status);
          return res.json({ ok: true, skipped: `subscription ${data?.status}` });
        }
      } catch (error) {
        // Unreadable: the notification itself is the best information left.
        console.error("Paddle subscription check failed, going by the notification:", error);
      }
    }

    if (decision.action === "grant" && !paddleGrantAllowed(email)) {
      // Sandbox: the test card is free and the test page is public.
      console.log("Paddle sandbox sale ignored, not a test address:", email);
      return res.json({ ok: true, ignored: "sandbox sale for an address not in PADDLE_TEST_EMAILS" });
    }

    if (decision.action === "grant") {
      // A lifetime member keeps the lifetime: it is the better grant, and the
      // subscription ending must not take it away.
      if (previous?.kind === "lifetime") {
        console.log("Paddle sale kept under an existing lifetime:", email);
      } else {
        if (decision.kind === "lifetime" && (await paddleWasRefunded(decision.transactionId))) {
          console.log("Paddle lifetime grant skipped, the purchase was refunded:", email, decision.transactionId);
          return res.json({ ok: true, skipped: "refunded" });
        }
        await redisSetAccess(email, paddleAccessRecord(
          {
            kind: decision.kind,
            id: decision.kind === "lifetime" ? decision.transactionId : decision.subscriptionId || previous?.membershipId || null,
            customerId: decision.customerId,
            ...(decision.kind === "lifetime" ? { transactionId: decision.transactionId } : {}),
          },
          {
            paddleEventAt: occurredAt,
            ...(previous?.provider === "paddle" && previous.grantedAt ? { grantedAt: previous.grantedAt } : {}),
            // Kept so the Telegram ping fires on a change, not on every
            // subscription.updated Paddle sends while nothing changed.
            ...(decision.status ? { paddleStatus: decision.status, cancelScheduled: Boolean(decision.cancelAtPeriodEnd) } : { paddleStatus: previous?.paddleStatus, cancelScheduled: previous?.cancelScheduled }),
          },
        ));
        console.log("Access granted via Paddle:", email, decision.kind, event.event_type);
      }
    } else if (decision.action === "refund") {
      // Remembered whatever the record says, so the API fallback and a
      // replayed sale notification cannot hand it back later.
      await paddleMarkRefunded(decision.transactionId);
      const ours = previous?.provider === "paddle" && previous.transactionId && previous.transactionId === decision.transactionId;
      if (ours) {
        await redisClearAccess(email);
        console.log("Access revoked via Paddle:", email, decision.reason, decision.transactionId);
      } else {
        console.log("Paddle refund recorded, no access tied to it:", email, decision.transactionId);
      }
    } else if (decision.action === "revoke") {
      // Only what this subscription granted. Ending it must not cost someone
      // access they hold from another purchase or an admin grant.
      const ours = previous?.provider === "paddle" && (!previous.membershipId || previous.membershipId === decision.subscriptionId);
      if (ours) {
        await redisClearAccess(email);
        console.log("Access revoked via Paddle:", email, decision.reason);
      } else {
        console.log("Paddle revoke skipped, access comes from elsewhere:", email, previous?.plan || "none");
      }
    }
    const text = paddleTelegramMessage(event, decision, email, previous);
    if (text) {
      const sent = await notifyTelegramOnce(`paddle:${event.event_id || `${event.event_type}:${decision.transactionId || decision.subscriptionId}:${occurredAt}`}`, text);
      req.paddleTelegram = !process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID
        ? "non envoyé : TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID manque"
        : sent ? "envoyé" : "non envoyé : déjà envoyé pour cet événement, ou refusé par Telegram";
    }
    return res.json({ ok: true });
  } catch (error) {
    console.error("Paddle webhook handling failed:", error);
    return res.status(500).json({ error: "Traitement impossible." });
  }
}
