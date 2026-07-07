import { cancelSubscriptionForEmail, methodNotAllowed, normalizeEmail } from "./_shared.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  const email = normalizeEmail(req.body?.email);
  if (!email) return res.status(400).json({ error: "Email requis." });

  try {
    const result = await cancelSubscriptionForEmail(email);
    if (!result.ok) {
      return res.status(404).json({ error: "Aucun abonnement actif trouvé pour cet email." });
    }
    return res.json(result);
  } catch (error) {
    console.error("cancel-subscription error:", error);
    return res.status(500).json({ error: "Impossible de résilier l'abonnement." });
  }
}
