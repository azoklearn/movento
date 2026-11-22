import { getMembershipInfo, methodNotAllowed, normalizeEmail } from "./_shared.js";
import { requireSession } from "./_auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  const email = normalizeEmail(req.body?.email);
  if (!email) return res.status(400).json({ error: "Email requis." });

  try {
    const info = await getMembershipInfo(email);
    // A subscription's details are for the browser signed in as that email.
    if (info?.found && !(await requireSession(req, res, email))) return;
    return res.json(info);
  } catch (error) {
    console.error("subscription-status error:", error);
    return res.status(500).json({ error: "Impossible de récupérer l'abonnement.", errorEn: "Unable to load the subscription." });
  }
}
