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
          (dep) => !dep.includes("jspdf") && !dep.includes("pdf")
        );
      },
    },
    // No manualChunks — letting Vite's default automatic chunking handle
    // splitting. We tried forcing explicit chunk names (react-vendor,
    // supabase, posthog, pdf, etc.) but Rollup was forced to create a
    // facade cross-import between react-vendor and pdf chunks for a
    // small shared internal helper, which meant react-vendor (loaded on
    // EVERY page) dragged in the 430KB pdf chunk regardless.
    //
    // Vite's default splitting already respects our dynamic import()
    // boundaries (React.lazy() for routes, and the nested dynamic
    // import("../lib/pdf") inside Dashboard.jsx's download handlers) —
    // it just does so without forcing awkward shared-chunk facades.
  },
});