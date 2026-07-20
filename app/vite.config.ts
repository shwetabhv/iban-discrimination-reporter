import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxies to a locally running Azure Functions host (`func start` in /api, default port 7071).
      // Strips the /api prefix — host.json sets routePrefix "" so Static Web Apps can own that
      // prefix in production; `func start` alone doesn't add it back, so we do it here for dev parity.
      "/api": {
        target: "http://localhost:7071",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
