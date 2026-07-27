// Affiliate links point at the site itself (movento.dev/?ref=CODE), not at the
// Whop checkout — so the code has to survive the whole visit: we capture it on
// landing, keep it for the attribution window, then hand it to the checkout and
// to every analytics event.
const STORAGE_KEY = "movento_ref";
const SESSION_KEY = "movento_ref_seen";
// "a" is the parameter Whop itself uses, accepted here so the same code works
// whether the affiliate links to movento.dev or to a Whop page.
const REF_PARAMS = ["ref", "a", "via"];
const WINDOW_DAYS = 60;

function sanitize(code) {
  return String(code || "").trim().slice(0, 64).replace(/[^a-zA-Z0-9_-]/g, "");
}

// Reads the stored code, dropping it once the attribution window has passed —
// a click from last year must not keep crediting an affiliate.
export function getRef() {
  if (typeof window === "undefined") return "";
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return "";
    const { code, ts } = JSON.parse(raw);
    if (!code || !ts || Date.now() - ts > WINDOW_DAYS * 86400000) {
      window.localStorage.removeItem(STORAGE_KEY);
      return "";
    }
    return sanitize(code);
  } catch {
    return "";
  }
}

// Stores the code found in the URL. Last touch wins: a visitor arriving through
// a second affiliate is credited to that one.
export function captureRef(search) {
  if (typeof window === "undefined") return "";
  const code = sanitize(
    REF_PARAMS.map((p) => new URLSearchParams(search ?? window.location.search).get(p)).find(Boolean)
  );
  if (!code) return getRef();
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ code, ts: Date.now() }));
  } catch {
    // Private mode / storage disabled — attribution is lost, the visit is not.
  }
  return code;
}

// True the first time this browser session sees a referred visit, so the landing
// event is counted once per session instead of on every page view.
export function isFirstRefVisitOfSession() {
  try {
    if (window.sessionStorage.getItem(SESSION_KEY)) return false;
    window.sessionStorage.setItem(SESSION_KEY, "1");
    return true;
  } catch {
    return false;
  }
}

// Analytics property attached to every funnel event. Referred and direct traffic
// carry the same key so the two funnels can be compared side by side in Vercel.
export function refProps() {
  return { ref: getRef() || "direct" };
}
