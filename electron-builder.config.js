const now = new Date();
const buildVersion = `${now.getFullYear() - 2000}.${
  now.getMonth() + 1
}.${now.getDate()}`;

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  productName: "Lumos",
  appId: "com.neurodeep.lumos",
  directories: {
    output: "dist",
    buildResources: "buildResources",
  },
  files: ["./dist_*/**", "./models/**"],
  extraMetadata: {
    version: buildVersion,
  },
  win: {
    target: ["nsis"]
  },
  nsis: {
    oneClick: true
  }
};

module.exports = config;
