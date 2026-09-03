import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The Go server embeds this build and serves it at "/", with the API under
// "/web/*". In dev, Vite runs standalone on :5173 and proxies /web calls to
// the Go server on :8080 so cookies + CORS behave the same as production.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      "/web": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
