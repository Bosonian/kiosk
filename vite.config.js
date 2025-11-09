import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => ({
  base: command === "serve" ? "/" : "/kiosk/",
  plugins: [tailwindcss()],
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
