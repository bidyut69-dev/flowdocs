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
          if (!id.includes("node_modules")) return;

          // Shared by every route (App.jsx needs these unconditionally) —
          // fine to load upfront everywhere.
          if (id.includes("react-router") || id.includes("/react/") || id.includes("/react-dom/")) {
            return "react-vendor";
          }
          if (id.includes("@supabase")) return "supabase";

          // Landing needs posthog + vercel analytics — keep SEPARATE and
          // small, don't let them drag in a generic vendor bucket.
          if (id.includes("posthog")) return "posthog";
          if (id.includes("@vercel/analytics")) return "analytics";

          // Dashboard-only — jsPDF is only used for document downloads,
          // never touched by Landing.
          if (id.includes("jspdf")) return "pdf";

          // Anything else left over (should be near-empty per current
          // package.json — Razorpay checkout loads via external <script>,
          // not an npm bundle, so it won't show up here).
          return "vendor";
        },
      },
    },
  },
});