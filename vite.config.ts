import { defineConfig, loadEnv } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { apiServer } from "./src/api-server.js";
import type * as vite from "vite";
import * as path from "path";
import sveltePreprocess from "svelte-preprocess";

export default defineConfig({
  plugins: [
    svelte({
      preprocess: sveltePreprocess(),
    }),
    apiServer(),
  ],
  root: path.resolve(__dirname, "src"),
  publicDir: "../public",
  server: {
    port: 5000,
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  // https://github.com/vitejs/vite/issues/7385#issuecomment-1286606298
  resolve: {
    alias: {
      "#": path.resolve(__dirname, "./src/"),
    },
  },
});
