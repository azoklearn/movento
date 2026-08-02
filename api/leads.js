import { Redis } from "@upstash/redis";
import crypto from "node:crypto";

// Reads the captured emails for the live view at /admin. This hands out
// customer email addresses, so it fails closed: no ADMIN_TOKEN configured means
// nobody gets in, rather than everybody.
function authorized(req) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return false;

  const header = String(req.headers?.authorization || "");
  const provided = header.startsWith("Bearer ") ? header.slice(7) : String(req.query?.token || "");
  if (!provided) return false;

  // Same length before comparing: timingSafeEqual throws on a length mismatch,
  // and the lengths themselves are not worth leaking.
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Never cached: a stale list is the one thing this endpoint must not return.
  res.setHeader("Cache-Control", "no-store");

  if (!authorized(req)) {
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
