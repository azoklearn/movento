import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // CHECKOUT_PROVIDER is read by the front end too: it decides which plans the
  // cards offer (Paddle: month + lifetime; otherwise month + year), the same
  // way api/_shared.js decides which plans may be bought. It is a public
  // setting, not a secret, so exposing it to the bundle is safe.
  envPrefix: ["VITE_", "CHECKOUT_PROVIDER"],
});
