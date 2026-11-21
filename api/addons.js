// The add-ons bought with lifetime (api/_shared.js, MOLLIE_ADDONS): what an
// email holds, the freelance kit's content, and the agency licence's team.
// POST { email, action, member? }.
//
//   status        what this email holds, its team and whose team it is on
//   kit           the kit's content, for an email that bought it
//   team-add      invite `member` (the buyer's email is `email`)
//   team-remove   take `member` off the team
//
// The email is the key, as everywhere on the site: there is no password. An
// add-on only counts while its buyer still has the catalogue, so a refunded
// purchase closes it.
import { Redis } from "@upstash/redis";
import { FREELANCE_KIT } from "./_kit.js";
import { TEAM_MAX_INVITES, TEAM_SEATS, customerAccessLevel, methodNotAllowed, normalizeEmail, redisGetAddons, teamOwnerFor } from "./_shared.js";

const looksLikeEmail = (email) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

async function teamOf(redis, owner) {
  const [members, invites] = await Promise.all([redis.smembers(`team:${owner}`), redis.get(`team:invites:${owner}`)]);
  return { seats: TEAM_SEATS, members: (members || []).map(String).sort(), invitesLeft: Math.max(0, TEAM_MAX_INVITES - (Number(invites) || 0)) };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);
  res.setHeader("Cache-Control", "no-store");
  const email = normalizeEmail(req.body?.email);
  const action = String(req.body?.action || "status");
  if (!looksLikeEmail(email)) return res.status(400).json({ error: "Entre une adresse email valide.", errorEn: "Enter a valid email address." });

  try {
    const redis = Redis.fromEnv();
    const hasAccess = (await customerAccessLevel(email)) === "full";
    const addons = hasAccess ? await redisGetAddons(email) : [];

    if (action === "status") {
      return res.json({
        hasAccess,
        addons,
        team: addons.includes("team") ? await teamOf(redis, email) : null,
        memberOf: hasAccess ? await teamOwnerFor(email) : null,
      });
    }

    if (action === "kit") {
      if (!addons.includes("kit")) return res.status(403).json({ error: "Le Kit freelance n'est pas sur ce compte.", errorEn: "The freelance kit is not on this account." });
      return res.json({ kit: FREELANCE_KIT });
    }

    if (action === "team-add" || action === "team-remove") {
      if (!addons.includes("team")) return res.status(403).json({ error: "La Licence agence n'est pas sur ce compte.", errorEn: "The agency licence is not on this account." });
      const member = normalizeEmail(req.body?.member);
      if (!looksLikeEmail(member)) return res.status(400).json({ error: "Entre l'adresse email de la personne.", errorEn: "Enter that person's email address." });

      if (action === "team-remove") {
        await redis.srem(`team:${email}`, member);
        // Only if this team is the one the address points at.
        if (normalizeEmail(await redis.get(`teamof:${member}`)) === email) await redis.del(`teamof:${member}`);
        return res.json({ ok: true, team: await teamOf(redis, email) });
      }

      if (member === email) return res.status(400).json({ error: "Tu fais déjà partie de ta licence.", errorEn: "You are already on your own licence." });
      const team = await teamOf(redis, email);
      if (team.members.includes(member)) return res.json({ ok: true, team });
      if (team.members.length >= TEAM_SEATS) return res.status(409).json({ error: `Les ${TEAM_SEATS} places sont prises. Retire quelqu'un pour en libérer une.`, errorEn: `All ${TEAM_SEATS} seats are taken. Remove someone to free one.` });
      if (team.invitesLeft <= 0) return res.status(409).json({ error: "Tu as utilisé toutes les invitations de cette licence. Écris-nous pour en changer.", errorEn: "This licence has used all its invitations. Write to us to change a seat." });
      const other = normalizeEmail(await redis.get(`teamof:${member}`));
      if (other && other !== email && (await redis.sismember(`team:${other}`, member))) {
        return res.status(409).json({ error: "Cette adresse fait déjà partie d'une autre équipe.", errorEn: "This address is already on another team." });
      }
      await redis.sadd(`team:${email}`, member);
      await redis.set(`teamof:${member}`, email);
      await redis.incr(`team:invites:${email}`);
      return res.json({ ok: true, team: await teamOf(redis, email) });
    }

    return res.status(400).json({ error: "Action inconnue.", errorEn: "Unknown action." });
  } catch (error) {
    console.error("Add-ons request failed:", error);
    return res.status(500).json({ error: "Impossible pour le moment. Réessaie dans un instant.", errorEn: "Not possible right now. Try again in a moment." });
  }
}
