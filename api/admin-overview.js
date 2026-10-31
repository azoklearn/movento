import { Redis } from "@upstash/redis";
import { auditAccessPayments, isAdminAuthorized, whopConfigured } from "./_shared.js";

// One read for the whole business, behind /admin.
//
// The access list already answers "who has access and did they pay". This
// answers the questions above it: how many customers are there, on what, how
// many are about to leave, how many of the emails collected ever turned into
// one, and is anything in the plumbing broken.
//
// It deliberately returns COUNTS, never money. Prices live in src/App.jsx and
// have changed more than once; duplicating them here would put a second,
// quietly wrong price list in the codebase, and a revenue figure that disagrees
// with the pricing page is worse than no revenue figure. The page multiplies
// these counts by its own table.
//
// ADMIN_TOKEN-gated like the rest of /admin.

const DAY = 86400000;

// Buckets the leads sorted set by day without reading it: its score is the
// capture timestamp, so a count per range is a single cheap call each.
async function leadsPerDay(redis, days) {
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  const start = midnight.getTime();

  const ranges = [];
  for (let i = days - 1; i >= 0; i--) {
    ranges.push({ day: new Date(start - i * DAY).toISOString().slice(0, 10), from: start - i * DAY, to: start - (i - 1) * DAY - 1 });
  }
  const counts = await Promise.all(ranges.map((r) => redis.zcount("leads", r.from, r.to).catch(() => 0)));
  return ranges.map((r, i) => ({ day: r.day, count: Number(counts[i]) || 0 }));
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Cache-Control", "no-store");

  if (!isAdminAuthorized(req)) {
    return res.status(401).json({ error: "Non autorisé." });
  }

  const days = Math.min(Math.max(Number(req.query?.days) || 14, 2), 60);

  try {
    const redis = Redis.fromEnv();
    const now = Date.now();
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);

    const [audit, leadTotal, perDay, leadEmails] = await Promise.all([
      auditAccessPayments(),
      redis.zcard("leads").catch(() => 0),
      leadsPerDay(redis, days),
      // Needed whole, to intersect with the customer list below — one call
      // rather than a zscore per customer. Capped: past this many the
      // conversion figure is reported as partial rather than silently wrong.
      redis.zrange("leads", 0, 4999, { rev: true }).catch(() => []),
    ]);

    const rows = audit.rows || [];
    const leadSet = new Set(leadEmails.map((e) => String(e)));

    // --- customers ---------------------------------------------------------
    // "A customer" is anyone paying on Whop or holding access here — the two
    // disagree in both directions, and both directions matter: a grant with no
    // payment is revenue we chose to give away, a payment with no record is
    // revenue we are failing to deliver.
    const byKind = {};
    const bump = (k) => { if (k) byKind[k] = (byKind[k] || 0) + 1; };

    let paying = 0, lifetimes = 0, subscriptions = 0, packOnly = 0;
    let trialing = 0, pastDue = 0, canceling = 0, unpaid = 0, blocked = 0, missingRecord = 0;
    let newLast7 = 0, newLast30 = 0, convertedFromLead = 0;

    for (const row of rows) {
      if (row.blocked) blocked++;
      if (row.missingRecord) missingRecord++;
      if (leadSet.has(row.email)) convertedFromLead++;

      const granted = row.grantedAt ? Date.parse(row.grantedAt) : NaN;
      if (Number.isFinite(granted)) {
        if (now - granted < 7 * DAY) newLast7++;
        if (now - granted < 30 * DAY) newLast30++;
      }

      // The plan Whop is billing beats the one our record remembers: a record
      // is a snapshot from purchase, the membership is what renews.
      const kind = row.whopPlanKind || row.kind || null;

      switch (row.payment) {
        case "paid":
          paying++;
          bump(kind);
          if (kind === "lifetime") lifetimes++;
          else subscriptions++;
          if (row.cancelAtPeriodEnd) canceling++;
          break;
        case "paid_pack":
          packOnly++;
          break;
        case "trial":
          trialing++;
          break;
        case "past_due":
          pastDue++;
          bump(kind);
          break;
        case "canceling":
          paying++;
          canceling++;
          bump(kind);
          if (kind === "lifetime") lifetimes++;
          else subscriptions++;
          break;
        case "unpaid":
          unpaid++;
          break;
        default:
          break;
      }
    }

    // --- leads -------------------------------------------------------------
    const todayLeads = perDay.length ? perDay[perDay.length - 1].count : 0;
    const last7Leads = perDay.slice(-7).reduce((sum, d) => sum + d.count, 0);
    const last30 = await redis.zcount("leads", now - 30 * DAY, now).catch(() => null);

    return res.json({
      generatedAt: new Date().toISOString(),
      whop: { configured: whopConfigured(), audited: Boolean(audit.checked), error: audit.error || null },
      customers: {
        rows: rows.length,
        paying,
        subscriptions,
        lifetimes,
        packOnly,
        trialing,
        pastDue,
        canceling,
        unpaid,
        blocked,
        missingRecord,
        newLast7,
        newLast30,
        byKind,
      },
      leads: {
        total: Number(leadTotal) || 0,
        today: todayLeads,
        last7: last7Leads,
        last30: last30 === null ? null : Number(last30),
        perDay,
        // How many of the emails collected for a free prompt went on to have
        // access of any kind. The point of the giveaway, and the one number
        // that says whether it works.
        converted: convertedFromLead,
        // The intersection above only saw this many leads, newest first. Says
        // so rather than implying the rate covers everyone.
        matchedAgainst: leadSet.size,
        partial: Number(leadTotal) > leadSet.size,
      },
      // Everything that silently changes behaviour when it is missing. Not
      // "is the site up" — it plainly is, you are reading this — but the
      // settings whose absence shows up as a customer complaint days later.
      health: {
        whopApiKey: Boolean(process.env.WHOP_API_KEY),
        whopCompanyId: Boolean(process.env.WHOP_COMPANY_ID),
        webhookSecret: Boolean(process.env.WHOP_WEBHOOK_SECRET),
        // Without it the prompts can only be served from the public repo, so
        // making that repo private would lock every paying customer out.
        githubToken: Boolean(process.env.GITHUB_TOKEN),
        telegram: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
        adminToken: Boolean(process.env.ADMIN_TOKEN),
      },
    });
  } catch (error) {
    console.error("Admin overview failed:", error);
    return res.status(500).json({ error: "Lecture impossible." });
  }
}
