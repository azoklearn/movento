// The leads finder behind the "On trouve tes clients" add-on (MOLLIE_ADDONS
// .leads): real businesses of one trade in one city, read from OpenStreetMap,
// sorted so the easiest to sell a site to come first.
//
// Two public OpenStreetMap services, no key:
//   Nominatim  the city's name -> its area (or a point, for a small place)
//   Overpass   every business of the trade inside that area
// Both are free community servers, so each search is cached for a week and
// api/addons.js caps how many new ones a buyer can run in a day. They ask
// automated clients to say who they are: LEADS_USER_AGENT, or the site's name.
//
// Nothing here is invented: a business with no phone in OpenStreetMap is
// returned with no phone. "No website" means no website is listed there,
// which is a lead to check, not a certainty.

const USER_AGENT = process.env.LEADS_USER_AGENT || "MoventoLeads/1.0 (+https://movento.dev)";
const NOMINATIM = "https://nominatim.openstreetmap.org/search";
// Tried in order: the public servers are busy at times, and slow ones are
// given up on so the next can answer.
// LEADS_OVERPASS_URLS (comma-separated) replaces the list, e.g. to point at a
// private Overpass server.
const OVERPASS = String(process.env.LEADS_OVERPASS_URLS || "").split(",").map((u) => u.trim()).filter(Boolean);
if (!OVERPASS.length) OVERPASS.push("https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter", "https://overpass.private.coffee/api/interpreter");

// The trades a buyer can pick, each a list of OpenStreetMap tags. `noun` goes
// into the outreach message ("en cherchant un restaurant à Lyon").
export const LEAD_TRADES = [
  { id: "restaurant", label: "Restaurants", labelEn: "Restaurants", noun: "un restaurant", tags: [["amenity", "restaurant"]] },
  { id: "cafe", label: "Cafés et bars", labelEn: "Cafés and bars", noun: "un café", tags: [["amenity", "cafe"], ["amenity", "bar"], ["amenity", "pub"]] },
  { id: "fastfood", label: "Restauration rapide et à emporter", labelEn: "Fast food and takeaway", noun: "un restaurant à emporter", tags: [["amenity", "fast_food"]] },
  { id: "bakery", label: "Boulangeries et pâtisseries", labelEn: "Bakeries and pastry shops", noun: "une boulangerie", tags: [["shop", "bakery"], ["shop", "pastry"]] },
  { id: "food", label: "Commerces de bouche (épicerie, boucherie, cave…)", labelEn: "Food shops (grocer, butcher, wine…)", noun: "un commerce de bouche", tags: [["shop", "butcher"], ["shop", "greengrocer"], ["shop", "cheese"], ["shop", "deli"], ["shop", "wine"], ["shop", "seafood"], ["shop", "chocolate"]] },
  { id: "hairdresser", label: "Coiffeurs et barbiers", labelEn: "Hairdressers and barbers", noun: "un coiffeur", tags: [["shop", "hairdresser"]] },
  { id: "beauty", label: "Instituts de beauté, spas, tatoueurs", labelEn: "Beauty salons, spas, tattoo", noun: "un institut de beauté", tags: [["shop", "beauty"], ["shop", "massage"], ["shop", "tattoo"], ["leisure", "spa"]] },
  { id: "florist", label: "Fleuristes", labelEn: "Florists", noun: "un fleuriste", tags: [["shop", "florist"]] },
  { id: "fashion", label: "Boutiques de mode, chaussures, bijoux", labelEn: "Fashion, shoes, jewellery", noun: "une boutique", tags: [["shop", "clothes"], ["shop", "shoes"], ["shop", "jewelry"], ["shop", "boutique"]] },
  { id: "trades", label: "Artisans du bâtiment (plombier, électricien…)", labelEn: "Building trades (plumber, electrician…)", noun: "un artisan", tags: [["craft", "plumber"], ["craft", "electrician"], ["craft", "carpenter"], ["craft", "painter"], ["craft", "roofer"], ["craft", "builder"], ["craft", "hvac"], ["craft", "tiler"], ["craft", "gardener"], ["craft", "joiner"]] },
  { id: "garage", label: "Garages et concessions auto", labelEn: "Garages and car dealers", noun: "un garage", tags: [["shop", "car_repair"], ["shop", "car"], ["shop", "motorcycle"]] },
  { id: "hotel", label: "Hôtels et chambres d'hôtes", labelEn: "Hotels and guest houses", noun: "un hébergement", tags: [["tourism", "hotel"], ["tourism", "guest_house"], ["tourism", "chalet"]] },
  { id: "fitness", label: "Salles de sport, yoga, danse", labelEn: "Gyms, yoga, dance", noun: "une salle de sport", tags: [["leisure", "fitness_centre"], ["leisure", "dance"], ["sport", "yoga"]] },
  { id: "health", label: "Santé (dentiste, kiné, ostéo, vétérinaire)", labelEn: "Health (dentist, physio, vet)", noun: "un cabinet", tags: [["amenity", "dentist"], ["healthcare", "physiotherapist"], ["healthcare", "osteopath"], ["healthcare", "podiatrist"], ["amenity", "veterinary"]] },
  { id: "realestate", label: "Agences immobilières", labelEn: "Estate agents", noun: "une agence immobilière", tags: [["office", "estate_agent"], ["shop", "estate_agent"]] },
  { id: "legal", label: "Avocats, comptables, notaires, assureurs", labelEn: "Lawyers, accountants, notaries, insurers", noun: "un cabinet", tags: [["office", "lawyer"], ["office", "accountant"], ["office", "notary"], ["office", "insurance"]] },
  { id: "photo", label: "Photographes", labelEn: "Photographers", noun: "un photographe", tags: [["craft", "photographer"], ["shop", "photo"]] },
  { id: "driving", label: "Auto-écoles", labelEn: "Driving schools", noun: "une auto-école", tags: [["amenity", "driving_school"]] },
  { id: "optician", label: "Opticiens", labelEn: "Opticians", noun: "un opticien", tags: [["shop", "optician"]] },
  { id: "caterer", label: "Traiteurs", labelEn: "Caterers", noun: "un traiteur", tags: [["craft", "caterer"]] },
];
export const LEAD_COUNTRIES = ["France", "Belgique", "Suisse", "Luxembourg", "Canada", "Maroc", "Tunisie", "Sénégal", "Côte d'Ivoire"];
// How many businesses one search returns at most.
export const LEADS_MAX = 80;

export const tradeById = (id) => LEAD_TRADES.find((t) => t.id === id) || null;
// "  Saint-Étienne " -> "saint-etienne": the cache key, and what is compared.
export const cityKey = (city) => String(city || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function getJson(url, init, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal, headers: { "User-Agent": USER_AGENT, Accept: "application/json", ...(init?.headers || {}) } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// The city, as OpenStreetMap knows it: an administrative area when it has one
// (searched exactly), else a point searched 4 km around. Null when unknown.
export async function findPlace(city, country) {
  const params = new URLSearchParams({ city: String(city).trim(), country: String(country).trim(), format: "jsonv2", limit: "5", "accept-language": "fr" });
  const results = await getJson(`${NOMINATIM}?${params}`, {}, 8000);
  if (!Array.isArray(results) || !results.length) return null;
  const best = results.find((r) => r.osm_type === "relation") || results[0];
  const name = String(best.name || best.display_name || city).split(",")[0];
  if (best.osm_type === "relation" && Number(best.osm_id)) return { name, label: best.display_name, areaId: 3600000000 + Number(best.osm_id) };
  const lat = Number(best.lat);
  const lon = Number(best.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { name, label: best.display_name, lat, lon };
}

// Overpass QL: every node, way and relation carrying one of the trade's tags
// and a name, inside the area (or around the point).
export function overpassQuery(trade, place) {
  const where = place.areaId ? "(area.a)" : `(around:4000,${place.lat},${place.lon})`;
  const lines = trade.tags.map(([k, v]) => `  nwr["${k}"="${v}"]["name"]${where};`).join("\n");
  return `[out:json][timeout:20];\n${place.areaId ? `area(id:${place.areaId})->.a;\n` : ""}(\n${lines}\n);\nout center tags ${LEADS_MAX * 5};`;
}

const firstOf = (tags, keys) => {
  for (const key of keys) {
    const value = String(tags[key] || "").split(";")[0].trim();
    if (value) return value;
  }
  return "";
};
const asUrl = (value) => (!value ? "" : /^https?:\/\//i.test(value) ? value : `https://${value.replace(/^\/+/, "")}`);
const SOCIAL_HOSTS = /(^|\.)(facebook|instagram|fb|linktr|tiktok)\.(com|ee|me)$/i;
const hostOf = (url) => { try { return new URL(url).hostname; } catch { return ""; } };

// One OpenStreetMap element as a lead. `status` is what makes it worth a
// message: no site listed, only a social page, or a site that exists.
export function toLead(element) {
  const tags = element.tags || {};
  const name = String(tags.name || "").trim();
  if (!name) return null;
  let website = asUrl(firstOf(tags, ["website", "contact:website", "url"]));
  let social = asUrl(firstOf(tags, ["contact:facebook", "contact:instagram", "facebook", "instagram"]));
  // A "website" that is a Facebook or Instagram page is a social page.
  if (website && SOCIAL_HOSTS.test(hostOf(website))) { social = social || website; website = ""; }
  const street = [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ");
  const town = [tags["addr:postcode"], tags["addr:city"]].filter(Boolean).join(" ");
  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;
  return {
    id: `${element.type}/${element.id}`,
    name,
    status: website ? "site" : social ? "social" : "none",
    phone: firstOf(tags, ["phone", "contact:phone", "contact:mobile", "mobile"]),
    email: firstOf(tags, ["email", "contact:email"]),
    website,
    social,
    address: [street, town].filter(Boolean).join(", "),
    map: Number.isFinite(lat) && Number.isFinite(lon) ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=19/${lat}/${lon}` : "",
  };
}

// No site and reachable first, then no site, then a social page only, then
// the ones that already have a site (a redesign is a harder sale).
const rank = (lead) => (lead.status === "none" ? 0 : lead.status === "social" ? 2 : 4) + (lead.phone || lead.email ? 0 : 1);

export async function searchLeads(trade, place) {
  const body = new URLSearchParams({ data: overpassQuery(trade, place) }).toString();
  let data = null;
  let lastError = null;
  // A busy public server can take half a minute for a city. The first one is
  // given most of the time the function has (60 s in vercel.json, less the
  // city lookup); the others get what is left.
  const deadline = Date.now() + 48000;
  for (const endpoint of OVERPASS) {
    const left = deadline - Date.now();
    if (left < 4000) break;
    try {
      data = await getJson(endpoint, { method: "POST", body, headers: { "Content-Type": "application/x-www-form-urlencoded" } }, Math.min(left, endpoint === OVERPASS[0] ? 36000 : 14000));
      break;
    } catch (error) {
      lastError = error;
    }
  }
  if (!data) throw lastError || new Error("Overpass unavailable");
  const seen = new Set();
  const leads = [];
  for (const element of data.elements || []) {
    const lead = toLead(element);
    if (!lead) continue;
    // The same business mapped twice (a node and its building): keep one.
    const key = `${lead.name.toLowerCase()}|${lead.address.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    leads.push(lead);
  }
  leads.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name, "fr"));
  return leads;
}
