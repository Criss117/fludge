import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    tailwindcss(),
    tanstackRouter({}),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "fludge",
        short_name: "fludge",
        description: "fludge - PWA Application",
        theme_color: "#0c0c0c",
      },
      pwaAssets: { disabled: false, config: true },
      devOptions: { enabled: true },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@modules": path.resolve(__dirname, "./src/modules"),
      "@employees": path.resolve(__dirname, "./src/modules/employees"),
      "@teams": path.resolve(__dirname, "./src/modules/teams"),
      "@auth": path.resolve(__dirname, "./src/modules/auth"),
      "@inventory": path.resolve(__dirname, "./src/modules/inventory"),
      "@shared": path.resolve(__dirname, "./src/modules/shared"),
      "@organizations": path.resolve(__dirname, "./src/modules/organizations"),
    },
  },
  server: {
    port: 3001,
  },
});
