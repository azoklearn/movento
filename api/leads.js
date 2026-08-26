import { Redis } from "@upstash/redis";
import { isAdminAuthorized } from "./_shared.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Never cached: a stale list is the one thing this endpoint must not return.
  res.setHeader("Cache-Control", "no-store");

  if (!isAdminAuthorized(req)) {
    return res.status(401).json({ error: "Non autorisé." });
  }

  const limit = Math.min(Math.max(Number(req.query?.limit) || 200, 1), 1000);

  try {
    const redis = Redis.fromEnv();

    const total = await redis.zcard("leads");
    // Newest first, with the capture timestamp the sorted set already carries —
    // so a lead still shows a date even if its detail record went missing.
    const entries = await redis.zrange("leads", 0, limit - 1, { rev: true, withScores: true });

    const emails = [];
    const scores = new Map();
    for (let i = 0; i < entries.length; i += 2) {
      const email = String(entries[i]);
      emails.push(email);
      scores.set(email, Number(entries[i + 1]));
    }

    const records = emails.length ? await redis.mget(...emails.map((email) => `lead:${email}`)) : [];

    const leads = emails.map((email, i) => {
      const record = records[i] || {};
      const score = scores.get(email);
      return {
        email,
        registeredAt: record.registeredAt || (Number.isFinite(score) ? new Date(score).toISOString() : null),
        source: record.source || null,
        prompt: record.prompt || null,
        ref: record.ref || null,
      };
    });

    return res.json({ total, leads });
  } catch (error) {
    console.error("Lead listing failed:", error);
    return res.status(500).json({ error: "Lecture impossible." });
  }
}
