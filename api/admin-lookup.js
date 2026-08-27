import {
  customerHasWhopAccess,
  findWhopMembership,
  isAdminAuthorized,
  membershipPlanKind,
  normalizeEmail,
  redisClearAccess,
  redisGetAccessRecord,
  redisGetOwnedPrompts,
  redisGetPromptCredits,
  redisIsBlocked,
  whopConfigured,
} from "./_shared.js";

async function buildLookup(email) {
  const [redisRecord, owned, credits, hasAccess, blocked] = await Promise.all([
    redisGetAccessRecord(email),
    redisGetOwnedPrompts(email),
    redisGetPromptCredits(email),
    customerHasWhopAccess(email),
    redisIsBlocked(email),
  ]);

  let membership = null;
  let whopError = null;
  if (whopConfigured()) {
    try {
      membership = await findWhopMembership(email);
    } catch (error) {
      whopError = error.message;
    }
  }

  const membershipKind = membership ? membershipPlanKind(membership) : null;

  // The one-line answer to "how does he have access without paying" — every
  // other field here is what backs this up.
  let reason = "none";
  // Reported ahead of everything else because it overrides everything else:
  // customerHasWhopAccess refuses a blocked email whatever the records below say.
  if (blocked) reason = "blocked";
  else if (redisRecord) reason = "redis_grant";
  else if (membership?.status === "trialing") reason = "whop_free_trial";
  else if (membership && membershipKind !== "pack") reason = "whop_membership";
  else if (credits > 0 || owned.length > 0) reason = "pack_only";

  return {
    email,
    hasAccess,
    blocked,
    reason,
    redis: redisRecord
      ? {
          plan: redisRecord.plan || null,
          kind: redisRecord.kind || null,
          type: redisRecord.type || null,
          status: redisRecord.status || null,
          membershipId: redisRecord.membershipId || null,
          grantedAt: redisRecord.grantedAt || null,
        }
      : null,
    packCredits: credits,
    ownedPrompts: owned,
    whop: {
      configured: whopConfigured(),
      error: whopError,
      found: Boolean(membership),
      id: membership?.id || null,
      status: membership?.status || null,
      planId: membership?.plan?.id || membership?.plan_id || null,
      planKind: membershipKind,
      product: membership?.product?.title || null,
      renewalPeriodEnd: membership?.renewal_period_end || null,
      cancelAtPeriodEnd: Boolean(membership?.cancel_at_period_end),
    },
    // No secret configured means the webhook accepts unsigned requests — worth
    // seeing on every lookup, not just this one.
    webhookSecretConfigured: Boolean(process.env.WHOP_WEBHOOK_SECRET),
  };
}

// GET  — answers "why does this email have access", by reading every source
// customerHasWhopAccess itself reads: the Redis grant written by the webhook,
// then the live Whop membership.
//
// POST — revokes it. This only ever deletes our own access:{email} record; it
// never touches Whop. A live Whop membership (a trial included) re-grants
// itself through the very fallback this endpoint reads from, the next time
// that email is checked — so revoking here is the fix for a stray Redis
// record, not a substitute for canceling the membership on Whop when one
// exists. The response after a POST is a fresh lookup, so the caller sees
// immediately whether anything is left to worry about.
//
// Both ADMIN_TOKEN-gated like /api/leads — this hands out, and can end, a
// customer's access.
export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Cache-Control", "no-store");

  if (!isAdminAuthorized(req)) {
    return res.status(401).json({ error: "Non autorisé." });
  }

  const email = normalizeEmail(req.method === "GET" ? req.query?.email : req.body?.email);
  if (!email) {
    return res.status(400).json({ error: "Email requis." });
  }

  try {
    if (req.method === "POST") {
      await redisClearAccess(email);
      console.log("Access revoked via admin lookup:", email);
    }

    const result = await buildLookup(email);
    if (req.method === "POST") result.revoked = true;
    return res.json(result);
  } catch (error) {
    console.error("Admin lookup failed:", error);
    return res.status(500).json({ error: "Lecture impossible." });
  }
}
