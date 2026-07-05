import { Redis } from "@upstash/redis";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_missing", {
  apiVersion: "2025-04-30.basil",
});

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Méthode non autorisée." });
  }

  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    const rawBody = await getRawBody(req);
    event = webhookSecret
      ? stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
      : JSON.parse(rawBody.toString());
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const email = session.customer_details?.email?.trim().toLowerCase();

    // "paid" for immediate payments, "no_payment_required" when a free trial starts.
    const grantsAccess = session.payment_status === "paid" || session.payment_status === "no_payment_required";

    if (email && grantsAccess) {
      const redis = Redis.fromEnv();
      await redis.set(`access:${email}`, {
        plan: session.metadata?.plan || "unknown",
        paymentStatus: session.payment_status,
        paidAt: new Date().toISOString(),
        sessionId: session.id,
      });
      console.log("Access granted via webhook:", email, session.payment_status);
    }
  }

  return res.json({ received: true });
}
