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
          (dep) => !dep.includes("pdf") && !dep.includes("html2canvas") && !dep.includes("vendor-")
        );
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          // Shared by every route (App.jsx needs these unconditionally).
          if (id.includes("react-router") || id.includes("/react/") || id.includes("/react-dom/")) {
            return "react-vendor";
          }
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("posthog")) return "posthog";
          if (id.includes("@vercel/analytics")) return "analytics";

          // jsPDF pulls in html2canvas + dompurify (+ possibly canvg) as
          // real dependencies for its image/HTML rendering features.
          // ALL of them must live in the SAME chunk as jspdf itself —
          // splitting them apart is what caused the facade-import leak
          // into react-vendor last time.
          if (
            id.includes("jspdf") ||
            id.includes("html2canvas") ||
            id.includes("dompurify") ||
            id.includes("canvg") ||
            id.includes("rgbcolor") ||
            id.includes("svg-pathdata") ||
            id.includes("raf") ||
            id.includes("css-line-break") ||
            id.includes("text-segmentation")
          ) {
            return "pdf";
          }

          return "vendor";
        },
      },
    },
  },
});