import {
  isAdminAuthorized,
  normalizeEmail,
  redisBlockEmail,
  redisListAllAccess,
  redisListBlocked,
  redisUnblockEmail,
} from "./_shared.js";

// The access overview behind /admin.
//
// GET  — every email with something on record: full access, pack credits,
//        claimed prompts, or a block. One row each, blocked ones flagged.
// POST — { email, action: "block" | "unblock" }.
//
// A block is not the same as the "retirer l'accès" on /api/admin-lookup: that
// one deletes our Redis record and a live Whop membership puts it straight
// back, this one is checked before Whop is ever consulted and holds regardless.
//
// ADMIN_TOKEN-gated like the rest of /admin: this lists customer emails and can
// cut off their access.
export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Cache-Control", "no-store");

  if (!isAdminAuthorized(req)) {
    return res.status(401).json({ error: "Non autorisé." });
  }

  try {
    if (req.method === "POST") {
      const email = normalizeEmail(req.body?.email);
      const action = String(req.body?.action || "");
      if (!email) return res.status(400).json({ error: "Email requis." });
      if (action !== "block" && action !== "unblock") {
        return res.status(400).json({ error: "Action invalide." });
      }

      if (action === "block") await redisBlockEmail(email);
      else await redisUnblockEmail(email);
      console.log(`Access ${action}ed via admin:`, email);
    }

    // Returned after a POST too, so the caller never has to re-request the list
    // to see the result of what it just did.
    const [rows, blocked] = await Promise.all([redisListAllAccess(), redisListBlocked()]);
    return res.json({ rows, blocked, total: rows.length });
  } catch (error) {
    console.error("Admin access listing failed:", error);
    return res.status(500).json({ error: "Lecture impossible." });
  }
}
