import { join } from "path";
import { builtinModules } from "module";
import { defineConfig } from "vite";
import config from "../../../config";

const PACKAGE_ROOT = __dirname;

// /**
//  * Vite looks for `.env.[mode]` files only in `PACKAGE_ROOT` directory.
//  * Therefore, you must manually load and set the environment variables from the root directory above
//  */
// loadAndSetEnv(process.env.MODE, process.cwd());

/**
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  root: PACKAGE_ROOT,
  resolve: {
    alias: {
      "/@/": join(PACKAGE_ROOT, "/"),
    },
  },
  build: {
    sourcemap: "inline",
    target: `chrome91`,
    outDir: join(config.root, "/dist_preload"),
    assetsDir: ".",
    minify: process.env.MODE === "development" ? false : "terser",
    terserOptions: {
      ecma: 2020,
      compress: {
        passes: 2,
      },
      safari10: false,
    },
    lib: {
      entry: "preload.ts",
      formats: ["cjs"],
    },
    rollupOptions: {
      external: ["electron", "electron-settings", "knex", ...builtinModules],
      output: {
        entryFileNames: "[name].cjs",
      },
    },
    emptyOutDir: true,
  },
});
