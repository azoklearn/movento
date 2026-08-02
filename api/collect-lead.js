import { Redis } from "@upstash/redis";
import { methodNotAllowed, normalizeEmail } from "./_shared.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  const email = normalizeEmail(req.body?.email);
  if (!email) {
    return res.status(400).json({ error: "Email requis." });
  }

  try {
    const redis = Redis.fromEnv();

    // Which prompt they were after, and where they came from: the live view at
    // /admin is a lot more useful with it than with a bare address.
    const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.slice(0, 120) : null;
    const ref = typeof req.body?.ref === "string" ? req.body.ref.slice(0, 60) : null;

    // Store lead with metadata (only set if not already exists to preserve first-seen date)
    const existing = await redis.get(`lead:${email}`);
    if (!existing) {
      await redis.set(`lead:${email}`, {
        email,
        registeredAt: new Date().toISOString(),
        source: "free_prompt",
        prompt,
        ref,
      });
      // Also add to a sorted set for easy listing by date
      await redis.zadd("leads", { score: Date.now(), member: email });
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error("Lead collection failed:", error);
    // Don't block the user if Redis fails
    return res.json({ ok: true });
  }
}
