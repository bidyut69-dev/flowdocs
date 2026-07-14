import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // Prevent Vite from eagerly preloading route-specific heavy chunks
    // (pdf, vendor) on every page. Without this, <link rel="modulepreload">
    // tags get injected in index.html for ALL reachable chunks, defeating
    // the point of React.lazy()-based route splitting — the Landing page
    // would otherwise still fetch Dashboard-only bundles like jsPDF upfront.
    modulePreload: {
      resolveDependencies: (filename, deps) => {
        return deps.filter(
          (dep) => !dep.includes("pdf") && !dep.includes("vendor-")
        );
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
              return "react-vendor";
            }
            if (id.includes("supabase")) return "supabase";
            if (id.includes("jspdf")) return "pdf";
            return "vendor";
          }
        },
      },
    },
  },
});