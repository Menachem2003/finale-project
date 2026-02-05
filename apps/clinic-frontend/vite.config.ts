import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import { join } from "path";

export default defineConfig({
  root: __dirname,
  envDir: join(__dirname, "../../"), // טעינת .env מתיקיית השורש
  cacheDir: "../../node_modules/.vite/apps/clinic-frontend",
  plugins: [react(), nxViteTsPaths()],
  server: {
    port: 4200,
    host: "localhost",
  },
  preview: {
    port: 4300,
    host: "localhost",
  },
  build: {
    outDir: "../../dist/apps/clinic-frontend",
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
