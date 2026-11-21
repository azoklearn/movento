// The add-ons bought with lifetime (api/_shared.js, MOLLIE_ADDONS): what an
// email holds, the freelance kit's content, and the agency licence's team.
// POST { email, action, member? }.
//
//   status        what this email holds, its team and whose team it is on
//   kit           the kit's content, for an email that bought it
//   team-add      invite `member` (the buyer's email is `email`)
//   team-remove   take `member` off the team
//   leads-form    the questionnaire's choices, past searches, searches left
//   leads         businesses to contact for { trade, city, country }
//
// The email is the key, as everywhere on the site: there is no password. An
// add-on only counts while its buyer still has the catalogue, so a refunded
// purchase closes it.
import { Redis } from "@upstash/redis";
import { FREELANCE_KIT } from "./_kit.js";
import { LEAD_COUNTRIES, LEAD_TRADES, LEADS_MAX, cityKey, findPlace, searchLeads, tradeById } from "./_leads.js";
import { LEADS_DAILY_SEARCHES, TEAM_MAX_INVITES, TEAM_SEATS, customerAccessLevel, methodNotAllowed, normalizeEmail, redisGetAddons, teamOwnerFor } from "./_shared.js";

const looksLikeEmail = (email) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
const parisDay = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(new Date());
const asObject = (value) => { if (typeof value !== "string") return value || null; try { return JSON.parse(value); } catch { return null; } };

// What the leads page shows of a search: the businesses that match the
// filter, capped, with how many there were of each kind.
function leadsAnswer(entry, trade, onlyNoSite) {
  const all = entry.leads || [];
  const kept = onlyNoSite ? all.filter((l) => l.status !== "site") : all;
  return {
    place: entry.place,
    trade: { id: trade.id, label: trade.label, labelEn: trade.labelEn, noun: trade.noun },
    counts: { total: all.length, none: all.filter((l) => l.status === "none").length, social: all.filter((l) => l.status === "social").length, site: all.filter((l) => l.status === "site").length },
    leads: kept.slice(0, LEADS_MAX),
    more: Math.max(0, kept.length - LEADS_MAX),
  };
}

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

    if (action === "leads-form" || action === "leads") {
      if (!addons.includes("leads")) return res.status(403).json({ error: "L'option « On trouve tes clients » n'est pas sur ce compte.", errorEn: "The leads finder is not on this account." });
      const quotaKey = `leads:quota:${email}:${parisDay()}`;
      const historyKey = `leads:history:${email}`;
      const used = Number(await redis.get(quotaKey)) || 0;
      const history = asObject(await redis.get(historyKey)) || [];

      if (action === "leads-form") {
        return res.json({
          trades: LEAD_TRADES.map((t) => ({ id: t.id, label: t.label, labelEn: t.labelEn })),
          countries: LEAD_COUNTRIES,
          history,
          left: Math.max(0, LEADS_DAILY_SEARCHES - used),
        });
      }

      const trade = tradeById(String(req.body?.trade || ""));
      const city = String(req.body?.city || "").trim().slice(0, 80);
      const country = LEAD_COUNTRIES.includes(req.body?.country) ? req.body.country : LEAD_COUNTRIES[0];
      const onlyNoSite = req.body?.onlyNoSite !== false;
      if (!trade) return res.status(400).json({ error: "Choisis un type de commerce.", errorEn: "Pick a type of business." });
      if (cityKey(city).length < 2) return res.status(400).json({ error: "Entre le nom d'une ville.", errorEn: "Enter a city name." });

      // One search per trade and city, kept a week and shared by every buyer.
      const cacheKey = `leads:cache:${cityKey(country)}:${cityKey(city)}:${trade.id}`;
      let entry = asObject(await redis.get(cacheKey));
      if (!entry) {
        if (used >= LEADS_DAILY_SEARCHES) return res.status(429).json({ error: `Tu as fait tes ${LEADS_DAILY_SEARCHES} recherches du jour. Reviens demain, ou rouvre une recherche précédente.`, errorEn: `You have run your ${LEADS_DAILY_SEARCHES} searches for today. Come back tomorrow, or reopen a past search.` });
        let place;
        try {
          place = await findPlace(city, country);
        } catch (error) {
          console.error("Leads geocoding failed:", error);
          return res.status(503).json({ error: "La recherche de la ville n'a pas répondu. Réessaie dans une minute.", errorEn: "The city lookup did not answer. Try again in a minute." });
        }
        if (!place) return res.status(404).json({ error: `Ville introuvable : « ${city} » en ${country}. Vérifie l'orthographe.`, errorEn: `City not found: "${city}" in ${country}. Check the spelling.` });
        let leads;
        try {
          leads = await searchLeads(trade, place);
        } catch (error) {
          console.error("Leads search failed:", error);
          return res.status(503).json({ error: "Le serveur de données est occupé. Réessaie dans une minute : cette recherche ne compte pas.", errorEn: "The data server is busy. Try again in a minute: this search does not count." });
        }
        entry = { place: { name: place.name, label: place.label }, leads, at: new Date().toISOString() };
        await redis.set(cacheKey, entry, { ex: 7 * 86400 });
        // Counted only once it has answered.
        await redis.incr(quotaKey);
        await redis.expire(quotaKey, 2 * 86400);
      }
      const answer = leadsAnswer(entry, trade, onlyNoSite);
      const item = { trade: trade.id, city: entry.place.name, country, count: answer.counts.total, at: new Date().toISOString() };
      const next = [item, ...history.filter((h) => !(h.trade === item.trade && cityKey(h.city) === cityKey(item.city) && h.country === item.country))].slice(0, 10);
      await redis.set(historyKey, next);
      return res.json({ ...answer, history: next, left: Math.max(0, LEADS_DAILY_SEARCHES - (Number(await redis.get(quotaKey)) || 0)) });
    }

    return res.status(400).json({ error: "Action inconnue.", errorEn: "Unknown action." });
  } catch (error) {
    console.error("Add-ons request failed:", error);
    return res.status(500).json({ error: "Impossible pour le moment. Réessaie dans un instant.", errorEn: "Not possible right now. Try again in a moment." });
  }
}
