import crypto from "crypto";
import { normalizeEmail, redisClearAccess, redisSetAccess } from "./_shared.js";

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

// Whop follows the Standard Webhooks spec: signed content is "{id}.{timestamp}.{body}",
// HMAC-SHA256, signature compared base64.
//
// Whop hands out the secret as a RAW string and their SDK base64-encodes it
// before handing it to the Standard Webhooks verifier, which decodes it again —
// so the HMAC key is the raw secret. The spec's own "whsec_<base64>" form is
// accepted too, since the docs don't pin the format down and a wrong guess here
// would silently reject every event and lock out paying customers.
function candidateKeys(secret) {
  const keys = [Buffer.from(secret, "utf8")];
  if (/^whsec_/.test(secret)) {
    keys.push(Buffer.from(secret.replace(/^whsec_/, ""), "base64"));
  }
  return keys;
}

function verifySignature(rawBody, headers, secret) {
  const id = headers["webhook-id"];
  const timestamp = headers["webhook-timestamp"];
  const signatureHeader = headers["webhook-signature"];
  if (!id || !timestamp || !signatureHeader) return false;

  // Reject replays outside a 5-minute window.
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;

  const signedContent = `${id}.${timestamp}.${rawBody.toString("utf8")}`;
  // The header can carry several space-separated "v1,<sig>" values.
  const sent = signatureHeader.split(" ").map((part) => part.split(",")[1]).filter(Boolean);

  return candidateKeys(secret).some((key) => {
    const expected = crypto.createHmac("sha256", key).update(signedContent).digest("base64");
    return sent.some((sig) =>
      sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
    );
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Méthode non autorisée." });
  }

  const rawBody = await getRawBody(req);
  const secret = process.env.WHOP_WEBHOOK_SECRET;

  if (secret && !verifySignature(rawBody, req.headers, secret)) {
    console.error("Whop webhook signature verification failed");
    return res.status(400).json({ error: "Signature invalide." });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return res.status(400).json({ error: "Payload invalide." });
  }

  const action = event.action || event.type;
  const data = event.data || {};
  const email = normalizeEmail(data.user?.email || data.email);

  if (!email) {
    console.warn("Whop webhook without email:", action);
    return res.json({ received: true });
  }

  try {
    if (action === "membership.activated" || action === "payment.succeeded") {
      await redisSetAccess(email, {
        plan: data.plan?.id || data.product?.title || "unknown",
        status: data.status || "active",
        membershipId: data.id || null,
        grantedAt: new Date().toISOString(),
      });
      console.log("Access granted via Whop webhook:", email, action);
    }

    // Only a deactivated membership revokes access — a refund or dispute is
    // handled by Whop, which then deactivates the membership.
    if (action === "membership.deactivated") {
      await redisClearAccess(email);
      console.log("Access revoked via Whop webhook:", email);
    }
  } catch (error) {
    console.error("Whop webhook handling failed:", error);
    return res.status(500).json({ error: "Traitement du webhook impossible." });
  }

  return res.json({ received: true });
}
