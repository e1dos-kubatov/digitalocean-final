import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiProxy = {
  "/api": {
    target: process.env.FRONTEND_API_PROXY_TARGET || "http://localhost:5000",
    changeOrigin: true
  }
};

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    proxy: apiProxy
  },
  preview: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    proxy: apiProxy
  }
});
