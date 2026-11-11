import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// The offers in index.html's structured data are the same whoever sells them
// (3 months, the year, lifetime), so nothing is rewritten at build time.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // CHECKOUT_PROVIDER is read by the front end too (which processor's
  // checkout the buy buttons open). It is a public setting, not a secret, so
  // exposing it to the bundle is safe.
  envPrefix: ["VITE_", "CHECKOUT_PROVIDER"],
});
