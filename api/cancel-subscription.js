import { cancelWhopMembership, GUMROAD_MANAGE_URL, methodNotAllowed, normalizeEmail, paddleApi, paddleSubscriptionSummary, redisGetAccessRecord } from "./_shared.js";

// Paddle: cancelled at the end of the period through the API, the way the
// Whop branch does it. Access stays until then; subscription.canceled, sent
// by Paddle on that date, is what takes it away (api/paddle-webhook.js).
async function cancelPaddle(record, res) {
  if (!record.membershipId || !process.env.PADDLE_API_KEY) {
    return res.status(500).json({ error: "Service de résiliation indisponible.", errorEn: "Cancellation service unavailable." });
  }
  const path = `/subscriptions/${encodeURIComponent(record.membershipId)}`;
  try {
    const current = paddleSubscriptionSummary((await paddleApi(path)).data);
    if (current.cancelAtPeriodEnd || current.status === "canceled") {
      return res.json({ ok: true, alreadyCanceled: true, renewalDate: current.renewalDate });
    }
    const { data } = await paddleApi(`${path}/cancel`, { method: "POST", body: { effective_from: "next_billing_period" } });
    return res.json({ ok: true, alreadyCanceled: false, renewalDate: paddleSubscriptionSummary(data).renewalDate });
  } catch (error) {
    console.error("Paddle cancel failed:", error);
    return res.status(502).json({ error: "La résiliation a échoué. Réessaie dans un instant.", errorEn: "Cancellation failed. Try again in a moment." });
  }
}

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
    // Billed by Gumroad: there is nothing this server can cancel, and asking
    // Whop would answer "no subscription found" to someone who is paying.
    const record = await redisGetAccessRecord(email);
    if (record?.provider === "paddle" && record.type === "lifetime") {
      return res.status(400).json({ error: MESSAGES.lifetime[1], errorEn: MESSAGES.lifetime[2] });
    }
    if (record?.provider === "paddle") return cancelPaddle(record, res);
    if (record?.provider === "gumroad") {
      return res.status(409).json({
        error: "Ton abonnement est géré par Gumroad : résilie-le depuis ton espace Gumroad, ou depuis le lien « Manage membership » de ton reçu.",
        errorEn: "Your subscription is managed by Gumroad: cancel it from your Gumroad library, or from the “Manage membership” link in your receipt.",
        provider: "gumroad",
        manageUrl: GUMROAD_MANAGE_URL,
      });
    }

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
