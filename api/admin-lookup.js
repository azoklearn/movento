import {
  customerHasWhopAccess,
  findWhopMembership,
  isAdminAuthorized,
  membershipPlanKind,
  normalizeEmail,
  redisGetAccessRecord,
  redisGetOwnedPrompts,
  redisGetPromptCredits,
  whopConfigured,
} from "./_shared.js";

// Answers "why does this email have access" for a support case, by reading
// every source customerHasWhopAccess itself reads: the Redis grant written by
// the webhook, then the live Whop membership. Read-only, and ADMIN_TOKEN-gated
// like /api/leads — this hands out a customer's purchase history.
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Cache-Control", "no-store");

  if (!isAdminAuthorized(req)) {
    return res.status(401).json({ error: "Non autorisé." });
  }

  const email = normalizeEmail(req.query?.email);
  if (!email) {
    return res.status(400).json({ error: "Email requis." });
  }

  try {
    const [redisRecord, owned, credits, hasAccess] = await Promise.all([
      redisGetAccessRecord(email),
      redisGetOwnedPrompts(email),
      redisGetPromptCredits(email),
      customerHasWhopAccess(email),
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
    if (redisRecord) reason = "redis_grant";
    else if (membership?.status === "trialing") reason = "whop_free_trial";
    else if (membership && membershipKind !== "pack") reason = "whop_membership";
    else if (credits > 0 || owned.length > 0) reason = "pack_only";

    return res.json({
      email,
      hasAccess,
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
    });
  } catch (error) {
    console.error("Admin lookup failed:", error);
    return res.status(500).json({ error: "Lecture impossible." });
  }
}
