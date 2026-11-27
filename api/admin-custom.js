// Prompts made to order, seen from /admin: the requests waiting for their
// prompt, and the way to deliver one or to refuse it (api/_custom.js).
//
//   GET                                  { pending, recent, hours }
//   POST { action: "deliver", id, prompt }   the prompt, shown to the buyer on /sur-mesure
//   POST { action: "refuse", id, reason }    why not; the request goes back to the buyer
//
// ADMIN_TOKEN-gated like the rest of /admin.
import { Redis } from "@upstash/redis";
import { adminCustomRequests, closeCustomRequest } from "./_custom.js";
import { CUSTOM_PROMPT_HOURS, isAdminAuthorized, methodNotAllowed } from "./_shared.js";

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") return methodNotAllowed(res);
  res.setHeader("Cache-Control", "no-store");
  if (!isAdminAuthorized(req)) return res.status(401).json({ error: "Non autorisé." });

  try {
    const redis = Redis.fromEnv();
    if (req.method === "POST") {
      const action = String(req.body?.action || "");
      const id = String(req.body?.id || "");
      if (!/^[A-Za-z0-9_-]{8,32}$/.test(id)) return res.status(400).json({ error: "Demande inconnue." });
      if (action === "deliver") {
        const prompt = String(req.body?.prompt || "").trim();
        if (prompt.length < 200) return res.status(400).json({ error: "Colle le prompt entier (au moins 200 caractères)." });
        if (prompt.length > 200000) return res.status(400).json({ error: "Ce prompt est trop long (200 000 caractères au plus)." });
        if (!(await closeCustomRequest(redis, id, { prompt }))) return res.status(409).json({ error: "Cette demande est déjà traitée." });
      } else if (action === "refuse") {
        const reason = String(req.body?.reason || "").trim().slice(0, 400);
        if (reason.length < 5) return res.status(400).json({ error: "Écris en une phrase pourquoi, le client la lira." });
        if (!(await closeCustomRequest(redis, id, { reason }))) return res.status(409).json({ error: "Cette demande est déjà traitée." });
      } else {
        return res.status(400).json({ error: "Action invalide." });
      }
    }
    return res.json({ ...(await adminCustomRequests(redis)), hours: CUSTOM_PROMPT_HOURS });
  } catch (error) {
    console.error("Admin custom prompts failed:", error);
    return res.status(500).json({ error: "Lecture des demandes impossible." });
  }
}
