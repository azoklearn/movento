import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// The structured data in index.html names the second offer, which depends on
// who sells it: the year on Gumroad, lifetime on Paddle. index.html carries
// the year; a Paddle build swaps that one offer for lifetime, so what Google
// reads is what the cards say. Matched exactly, and the build fails if it is
// not found, rather than ship structured data that quietly disagrees.
const ANNUAL_OFFER = `"name": "Annuel",
              "price": "89.00",
              "priceCurrency": "EUR",
              "url": "https://movento.dev/pricing",
              "availability": "https://schema.org/InStock",
              "priceSpecification": {
                "@type": "UnitPriceSpecification",
                "price": "89.00",
                "priceCurrency": "EUR",
                "billingDuration": 1,
                "billingIncrement": 1,
                "unitCode": "ANN"
              }`;
const LIFETIME_OFFER = `"name": "À vie",
              "price": "89.00",
              "priceCurrency": "EUR",
              "url": "https://movento.dev/pricing",
              "availability": "https://schema.org/InStock"`;

function offersFollowLineup(paddle) {
  return {
    name: "movento-offers-follow-lineup",
    transformIndexHtml(html) {
      if (!paddle) return html;
      if (!html.includes(ANNUAL_OFFER)) throw new Error("index.html: the annual offer block was not found, so the Paddle line-up cannot be written into the structured data.");
      return html.replace(ANNUAL_OFFER, LIFETIME_OFFER);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };
  const paddle = String(env.CHECKOUT_PROVIDER || "").trim().toLowerCase() === "paddle";
  return {
    plugins: [react(), tailwindcss(), offersFollowLineup(paddle)],
    // CHECKOUT_PROVIDER is read by the front end too: it decides which plans the
    // cards offer (Paddle: month + lifetime; otherwise month + year), the same
    // way api/_shared.js decides which plans may be bought. It is a public
    // setting, not a secret, so exposing it to the bundle is safe.
    envPrefix: ["VITE_", "CHECKOUT_PROVIDER"],
  };
});
