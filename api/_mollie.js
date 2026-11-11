// What the Mollie webhook and the post-payment email claim share: finding who
// a payment belongs to, setting up its subscription, and turning a paid
// payment into access. Kept apart from both so the two paths grant the same
// way.
//
// Three subscriptions can be on a customer: the month (off sale, still
// renewing for the people on it), 3 months and the year. Each first payment
// sets up its own interval, and every payment opens the catalogue for that
// many months plus the grace days.
//
// Who a payment belongs to. The buyer gives their email AFTER paying (asking
// before was friction), so a payment can be paid with no email known yet.
// It then belongs to whoever comes back with its claim code (api/mollie-
// claim.js), which records the email against the payment here.
import { Redis } from "@upstash/redis";
import {
  MOLLIE_PACK_SIZES,
  MOLLIE_PLAN_LABELS,
  MOLLIE_PLAN_MONTHS,
  MOLLIE_PRICES,
  mollieAccessRecord,
  mollieAccessUntil,
  mollieApi,
  mollieSubscriptionPlans,
  normalizeEmail,
  redisAddPromptCredit,
  redisGetAccessRecord,
  redisSetAccess,
} from "./_shared.js";

const redis = () => Redis.fromEnv();

// Mollie wants a calendar date for the subscription's first charge: one
// period after the payment that stored the card.
export function nextChargeDate(from, months = 1) {
  const d = new Date(from || Date.now());
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

// Which plan a payment is for. A first payment carries it in its metadata; a
// renewal is created by Mollie from the subscription, so it is looked up from
// the subscription: remembered when we created it, else read from Mollie
// (its metadata, or its interval). The month is the last resort, since every
// subscription made before the 3-month and yearly plans was the month.
export async function planOfPayment(payment) {
  const meta = payment.metadata?.plan;
  if (meta) return meta;
  if (!payment.subscriptionId) return "";
  const known = await redis().get(`mollie:subplan:${payment.subscriptionId}`).catch(() => null);
  if (known) return String(known);
  if (payment.customerId) {
    try {
      const sub = await mollieApi(`/customers/${encodeURIComponent(payment.customerId)}/subscriptions/${encodeURIComponent(payment.subscriptionId)}`);
      const fromInterval = { "1 month": "m1", "3 months": "m3", "12 months": "m12", "1 year": "m12" }[String(sub.interval || "").trim()];
      const plan = sub.metadata?.plan || fromInterval;
      if (plan) {
        await redis().set(`mollie:subplan:${payment.subscriptionId}`, plan).catch(() => {});
        return plan;
      }
    } catch (error) {
      console.error("Mollie subscription lookup failed:", payment.subscriptionId, error);
    }
  }
  return "m1";
}

export async function claimedEmail(paymentId) {
  try { return normalizeEmail(await redis().get(`mollie:claimed:${paymentId}`)); } catch { return ""; }
}

// The payment's email, from wherever it is known: given at checkout,
// claimed after it, or known for the customer from an earlier claim (which
// is how a monthly charge, created by Mollie with no metadata of ours, finds
// its subscriber).
export async function emailForPayment(payment) {
  const fromMeta = normalizeEmail(payment.metadata?.email);
  if (fromMeta) return fromMeta;
  const claimed = await claimedEmail(payment.id);
  if (claimed) return claimed;
  if (!payment.customerId) return "";
  try {
    const known = normalizeEmail(await redis().get(`mollie:customer-email:${payment.customerId}`));
    if (known) return known;
  } catch {}
  try {
    const customer = await mollieApi(`/customers/${encodeURIComponent(payment.customerId)}`);
    return normalizeEmail(customer.email);
  } catch {
    return "";
  }
}

export async function wasRefunded(paymentId) {
  try { return Boolean(await redis().get(`mollierefund:${paymentId}`)); } catch { return false; }
}

// The subscription for a first payment, created once even if Mollie calls
// twice at the same moment: a short lock, released if creation fails so the
// retry can try again.
export async function ensureSubscription(payment, email) {
  const plan = mollieSubscriptionPlans.has(payment.metadata?.plan) ? payment.metadata.plan : "m1";
  const months = MOLLIE_PLAN_MONTHS[plan];
  const r = redis();
  const doneKey = `mollie:subfor:${payment.id}`;
  const existing = await r.get(doneKey).catch(() => null);
  if (existing) return String(existing);
  const lock = `mollie:sublock:${payment.id}`;
  const got = await r.set(lock, 1, { nx: true, ex: 60 }).catch(() => "OK");
  if (!got) throw new Error("subscription creation already in progress");
  try {
    const sub = await mollieApi(`/customers/${encodeURIComponent(payment.customerId)}/subscriptions`, {
      method: "POST",
      body: {
        // What the first payment charged, so the renewals charge the same —
        // except after the win-back offer, which is the first year only.
        amount: { currency: "EUR", value: payment.metadata?.offer ? MOLLIE_PRICES[plan] : payment.amount?.value || MOLLIE_PRICES[plan] },
        interval: months === 1 ? "1 month" : `${months} months`,
        startDate: nextChargeDate(payment.paidAt, months),
        description: `Movento — ${MOLLIE_PLAN_LABELS[plan]}`,
        webhookUrl: payment.webhookUrl,
        metadata: { plan, ...(email ? { email } : {}) },
      },
    });
    await r.set(doneKey, sub.id).catch(() => {});
    await r.set(`mollie:subplan:${sub.id}`, plan).catch(() => {});
    return sub.id;
  } finally {
    await r.del(lock).catch(() => {});
  }
}

// A paid payment, turned into access for `email`. Idempotent: called again
// for the same payment it writes the same record.
export async function grantPaid(payment, email) {
  const plan = await planOfPayment(payment);
  const previous = await redisGetAccessRecord(email);
  const renewal = payment.sequenceType === "recurring" || Boolean(payment.subscriptionId);
  // Remembered for the customer, so the monthly charges that follow find
  // their subscriber without asking Mollie each time.
  if (payment.customerId) await redis().set(`mollie:customer-email:${payment.customerId}`, email).catch(() => {});

  // A pack: its prompts credited once per payment, whoever calls first (the
  // webhook or the claim). The credits are spent on /choose.
  if (MOLLIE_PACK_SIZES[plan]) {
    const first = await redis().set(`mollie:packdone:${payment.id}`, email, { nx: true });
    if (first) await redisAddPromptCredit(email, MOLLIE_PACK_SIZES[plan]);
    return { plan, renewal: false };
  }

  if (plan === "lifetime") {
    await redisSetAccess(email, mollieAccessRecord({ kind: "lifetime", paymentId: payment.id, customerId: payment.customerId }));
    return { plan, renewal };
  }
  const subscriptionId = payment.subscriptionId || (payment.sequenceType === "first" ? await ensureSubscription(payment, email) : previous?.subscriptionId || null);
  // A lifetime member keeps the lifetime; the month is still set up and paid.
  if (previous?.kind === "lifetime") return { plan, renewal, subscriptionId };
  const kind = mollieSubscriptionPlans.has(plan) ? plan : "m1";
  await redisSetAccess(email, mollieAccessRecord(
    { kind, paymentId: payment.id, customerId: payment.customerId, subscriptionId, accessUntil: mollieAccessUntil(MOLLIE_PLAN_MONTHS[kind], new Date(payment.paidAt || Date.now())) },
    previous?.provider === "mollie" && previous.grantedAt ? { grantedAt: previous.grantedAt } : {},
  ));
  return { plan, renewal, subscriptionId };
}
