import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages serves this project at /BuyRite/, so the production build
  // needs that base path baked in. Local dev (`npm run dev`) stays at root —
  // otherwise every route/asset URL would need a /BuyRite/ prefix locally too.
  base: command === "build" ? "/BuyRite/" : "/",
  server: {
    port: 5173,
  },
}));
