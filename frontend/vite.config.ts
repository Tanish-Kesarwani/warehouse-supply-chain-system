import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/", // 🔥 IMPORTANT for Azure
  plugins: [react()],
});