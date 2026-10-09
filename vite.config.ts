import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: "./", // relative asset paths, so the build works from any sub-address (GitHub Pages serves /loopbricks/)
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
