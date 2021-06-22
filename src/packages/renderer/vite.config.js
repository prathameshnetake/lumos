import { builtinModules } from "module";
import { defineConfig } from "vite";
import config from "../../../config";
import { join } from "path";
import reactRefresh from '@vitejs/plugin-react-refresh'

const PACKAGE_ROOT = __dirname;

/**
 * Vite looks for `.env.[mode]` files only in `PACKAGE_ROOT` directory.
 * Therefore, you must manually load and set the environment variables from the root directory above
 */
// loadAndSetEnv(process.env.MODE, process.cwd());

/**
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  root: __dirname,
  resolve: {
    alias: {
      "/@/": join(PACKAGE_ROOT) + "/",
    },
  },
  plugins: [reactRefresh()],
  base: "",
  server: {
    fsServe: {
      root: join(PACKAGE_ROOT, "../../../"),
    },
  },
  build: {
    sourcemap: true,
    target: `chrome91`,
    outDir: join(config.root, "dist_renderer"),
    assetsDir: ".",
    terserOptions: {
      ecma: 2020,
      compress: {
        passes: 2,
      },
      safari10: false,
    },
    rollupOptions: {
      external: [...builtinModules],
    },
    emptyOutDir: true,
  },
});
