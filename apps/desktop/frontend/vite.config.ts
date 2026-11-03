import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import wails from "@wailsio/runtime/plugins/vite";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: Number(process.env.WAILS_VITE_PORT) || 9245,
    strictPort: true,
  },
  plugins: [
    // Generates src/routeTree.gen.ts from src/routes; must run before React.
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    // React Compiler through Babel (stable path for @vitejs/plugin-react).
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    wails("./bindings"),
  ],
});
