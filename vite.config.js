import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Package name from a module id, e.g. ".../node_modules/@supabase/auth-js/dist/x.js"
// -> "@supabase/auth-js". Whole-name matching (not substrings) keeps unrelated
// modules out of the wrong chunk.
function pkgName(id) {
  const parts = id.split(/[\\/]node_modules[\\/]/).pop().split(/[\\/]/);
  return parts[0].startsWith("@") ? `${parts[0]}/${parts[1]}` : parts[0];
}

const REACT = new Set(["react", "react-dom", "scheduler", "react-router", "react-router-dom"]);

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 900, // jsPDF chunk is large but only loads on demand
    rollupOptions: {
      output: {
        // Deliberately small. No catch-all "vendor" bucket and no manual "pdf"
        // group: forcing jsPDF and its deps into one chunk made Rolldown put
        // Vite's preload helper inside it, so every lazy route (Landing too)
        // downloaded all of jsPDF. Anything not listed stays with the route
        // that imports it, and jsPDF only loads via import("../lib/pdf").
        manualChunks(id) {
          if (id.includes("vite/preload-helper")) return "preload-helper";
          if (!id.includes("node_modules")) return;
          const name = pkgName(id);
          if (REACT.has(name)) return "react-vendor";
          if (name.startsWith("@supabase/")) return "supabase";
        },
      },
    },
  },
});
