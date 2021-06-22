const { build } = require("vite");

const buildByConfig = (configFile) => build({ configFile });

buildByConfig("src/packages/electron/vite.config.js");
buildByConfig("src/packages/preload/vite.config.js");
buildByConfig("src/packages/renderer/vite.config.js");
