import { cancelWhopMembership, methodNotAllowed, normalizeEmail } from "./_shared.js";

// email → HTTP status + French message for each failure reason.
const MESSAGES = {
  no_email: [400, "Email requis."],
  not_found: [404, "Aucun abonnement actif trouvé pour cet email."],
  lifetime: [400, "Ton accès est à vie — il n'y a pas d'abonnement à résilier."],
  not_configured: [500, "Service de résiliation indisponible."],
  lookup_failed: [502, "Impossible de contacter Whop. Réessaie dans un instant."],
  cancel_failed: [502, "La résiliation a échoué. Réessaie dans un instant."],
};

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  const email = normalizeEmail(req.body?.email);
  if (!email) return res.status(400).json({ error: "Email requis." });

  try {
    const result = await cancelWhopMembership(email);
    if (!result.ok) {
      const [code, message] = MESSAGES[result.reason] || [500, "Impossible de résilier pour le moment."];
      return res.status(code).json({ error: message });
    }
    return res.json({
      ok: true,
      alreadyCanceled: Boolean(result.alreadyCanceled),
      renewalDate: result.renewalDate || null,
    });
  } catch (error) {
    console.error("cancel-subscription error:", error);
    return res.status(500).json({ error: "Impossible de résilier pour le moment." });
  }
}
