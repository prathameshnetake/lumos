import { defineConfig } from "vite";
import { builtinModules } from "module";
import config from "../../../config";
import { resolve } from "path";

export default defineConfig({
  root: __dirname,
  base: "./",
  build: {
    target: `node16`,
    outDir: resolve(config.root + "/dist_main"),
    assetsDir: ".",
    minify: process.env.MODE === 'development' ? false : 'terser',
    lib: {
      entry: "main.ts",
      formats: ["cjs"],
      fileName: "main",
    },
    rollupOptions: {
      external: [
        "electron",
        "sharp",
        "aws-sdk",
        "nock",
        "knex",
        "annoy-node",
        "mock-aws-s3",
        "@tensorflow/tfjs-node",
        "sqlite3",
        /**
         * semver can not be bundled
         * @see https://github.com/npm/node-semver/issues/381
         */
        "semver",
        ...builtinModules,
      ],
    },
    emptyOutDir: true,
  },
  define: {
    MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: JSON.stringify("index.js"),
    MAIN_WINDOW_WEBPACK_ENTRY: JSON.stringify("index.html"),
  },
});
