import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command, mode }) => ({
  base: command === "serve" ? "/" : "/kiosk/",
  plugins: [tailwindcss()],
  define: {
    // Define encryption key (set via VITE_ENCRYPTION_KEY env var at build time)
    __VITE_ENCRYPTION_KEY__: JSON.stringify(process.env.VITE_ENCRYPTION_KEY || ""),
  },
  server: {
    port: 3001,
    host: true
  },
  build: {
    outDir: "dist",
    target: "es2020",
    minify: "esbuild",
    sourcemap: true
  }
}));
