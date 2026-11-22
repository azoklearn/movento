// Signing in and out (api/_auth.js). POST { action, … }.
//
//   me       who is signed in on this browser
//   setup    { email, password }  first password of an address that holds a
//            purchase and has none; signs in
//   login    { email, password }  signs in
//   logout   signs this browser out
//   change   { current, password }  new password for the signed-in address;
//            every other browser is signed out
//
// Wrong passwords are counted per address and per IP, and both are held for
// a while past a few misses, so a password cannot be guessed by trying.
import { Redis } from "@upstash/redis";
import { methodNotAllowed, normalizeEmail, redisIsBlocked } from "./_shared.js";
import { checkPassword, endAllSessions, endSession, hasPassword, isAccount, passwordProblem, sessionEmail, setPassword, startSession } from "./_auth.js";

const looksLikeEmail = (email) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
const WINDOW_SECONDS = 15 * 60;
const MISSES_PER_EMAIL = 8;
const MISSES_PER_IP = 40;
const SETUPS_PER_IP = 12;
const ipOf = (req) => String(req.headers?.["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
const tooMany = { error: "Trop d'essais. Réessaie dans 15 minutes.", errorEn: "Too many attempts. Try again in 15 minutes." };

async function count(redis, key) {
  const n = await redis.incr(key);
  if (n === 1) await redis.expire(key, WINDOW_SECONDS);
  return n;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);
  res.setHeader("Cache-Control", "no-store");
  const action = String(req.body?.action || "me");
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password;

  try {
    const redis = Redis.fromEnv();
    const ip = ipOf(req);

    if (action === "me") return res.json({ email: (await sessionEmail(req)) || null });

    if (action === "logout") {
      await endSession(req, res);
      return res.json({ ok: true });
    }

    if (action === "change") {
      const me = await sessionEmail(req);
      if (!me) return res.status(401).json({ error: "Connecte-toi d'abord.", errorEn: "Sign in first." });
      const problem = passwordProblem(password);
      if (problem) return res.status(400).json(problem);
      if ((await count(redis, `auth:miss:${me}`)) > MISSES_PER_EMAIL) return res.status(429).json(tooMany);
      if (!(await checkPassword(me, req.body?.current))) return res.status(403).json({ error: "Mot de passe actuel incorrect.", errorEn: "Current password is wrong." });
      await redis.del(`auth:miss:${me}`);
      await setPassword(me, password);
      await endAllSessions(me);
      await startSession(res, me);
      return res.json({ ok: true, email: me });
    }

    if (action !== "setup" && action !== "login") return res.status(400).json({ error: "Action inconnue.", errorEn: "Unknown action." });
    if (!looksLikeEmail(email)) return res.status(400).json({ error: "Entre une adresse email valide.", errorEn: "Enter a valid email address." });

    if (action === "setup") {
      const problem = passwordProblem(password);
      if (problem) return res.status(400).json(problem);
      if ((await count(redis, `auth:setupip:${ip}`)) > SETUPS_PER_IP) return res.status(429).json(tooMany);
      if (await hasPassword(email)) return res.status(409).json({ error: "Cet email a déjà un mot de passe. Connecte-toi avec.", errorEn: "This email already has a password. Sign in with it.", auth: "login" });
      // Only for an address that holds something: a password cannot be put on
      // an address ahead of its owner's purchase.
      if ((await redisIsBlocked(email)) || !(await isAccount(email))) return res.status(403).json({ error: "Aucun achat trouvé sur cet email.", errorEn: "No purchase found on this email." });
      if (!(await setPassword(email, password, { onlyIfNone: true }))) return res.status(409).json({ error: "Cet email a déjà un mot de passe. Connecte-toi avec.", errorEn: "This email already has a password. Sign in with it.", auth: "login" });
      await startSession(res, email);
      console.log("Password created:", email);
      return res.json({ ok: true, email });
    }

    // login
    const [missEmail, missIp] = await Promise.all([redis.get(`auth:miss:${email}`), redis.get(`auth:missip:${ip}`)]);
    if (Number(missEmail) >= MISSES_PER_EMAIL || Number(missIp) >= MISSES_PER_IP) return res.status(429).json(tooMany);
    if (!(await checkPassword(email, password))) {
      await Promise.all([count(redis, `auth:miss:${email}`), count(redis, `auth:missip:${ip}`)]);
      // The same answer whether the address has a password or not.
      return res.status(403).json({ error: "Email ou mot de passe incorrect.", errorEn: "Wrong email or password." });
    }
    await redis.del(`auth:miss:${email}`);
    await startSession(res, email);
    return res.json({ ok: true, email });
  } catch (error) {
    console.error("Auth failed:", error);
    return res.status(500).json({ error: "Impossible pour le moment. Réessaie dans un instant.", errorEn: "Not possible right now. Try again in a moment." });
  }
}
