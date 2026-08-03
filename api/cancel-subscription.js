import { cancelWhopMembership, methodNotAllowed, normalizeEmail } from "./_shared.js";

// email → HTTP status + [French, English] message for each failure reason.
// Both are returned so the client can show the visitor's own language.
const MESSAGES = {
  no_email: [400, "Email requis.", "Email required."],
  not_found: [404, "Aucun abonnement actif trouvé pour cet email.", "No active subscription found for this email."],
  lifetime: [400, "Ton accès est à vie — il n'y a pas d'abonnement à résilier.", "Your access is lifetime — there is no subscription to cancel."],
  not_configured: [500, "Service de résiliation indisponible.", "Cancellation service unavailable."],
  lookup_failed: [502, "Impossible de contacter Whop. Réessaie dans un instant.", "Could not reach Whop. Try again in a moment."],
  cancel_failed: [502, "La résiliation a échoué. Réessaie dans un instant.", "Cancellation failed. Try again in a moment."],
};

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  const email = normalizeEmail(req.body?.email);
  if (!email) return res.status(400).json({ error: "Email requis.", errorEn: "Email required." });

  try {
    const result = await cancelWhopMembership(email);
    if (!result.ok) {
      const [code, message, messageEn] = MESSAGES[result.reason] || [500, "Impossible de résilier pour le moment.", "Unable to cancel right now."];
      return res.status(code).json({ error: message, errorEn: messageEn });
    }
    return res.json({
      ok: true,
      alreadyCanceled: Boolean(result.alreadyCanceled),
      renewalDate: result.renewalDate || null,
    });
  } catch (error) {
    console.error("cancel-subscription error:", error);
    return res.status(500).json({ error: "Impossible de résilier pour le moment.", errorEn: "Unable to cancel right now." });
  }
}
