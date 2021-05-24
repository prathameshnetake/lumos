import path from "path";
import fs from "fs";
import webpack from "webpack";
import { merge } from "webpack-merge";
import { spawn, execSync } from "child_process";
import baseConfig from "./webpack.config.base";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";

// When an ESLint server is running, we can't set the NODE_ENV so we'll check if it's
// at the dev webpack config is not accidentally run in a production environment
if (process.env.NODE_ENV === "production") {
  CheckNodeEnv("development");
}

const port = process.env.PORT || 1212;
const publicPath = `http://localhost:${port}/dist`;

export default merge(baseConfig, {
  devtool: "inline-source-map",

  mode: "development",

  target: "electron-renderer",

  entry: [
    "core-js",
    "regenerator-runtime/runtime",
    require.resolve("../src/renderer/index.tsx"),
  ],

  output: {
    publicPath: `http://localhost:${port}/dist/`,
    filename: "renderer.dev.js",
  },

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve("babel-loader"),
            options: {
              plugins: [require.resolve("react-refresh/babel")].filter(Boolean),
            },
          },
        ],
      },
      {
        test: /\.global\.css$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /^((?!\.global).)*\.css$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            // options: {
            //   modules: {
            //     localIdentName: "[name]__[local]__[hash:base64:5]",
            //   },
            //   sourceMap: true,
            //   importLoaders: 1,
            // },
          },
        ],
      },
      // Common Image Formats
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
        use: "url-loader",
      },
    ],
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),

    new webpack.EnvironmentPlugin({
      NODE_ENV: "development",
    }),

    new webpack.LoaderOptionsPlugin({
      debug: true,
    }),

    new ReactRefreshWebpackPlugin(),
  ],

  devServer: {
    port,
    publicPath,
    compress: true,
    noInfo: false,
    stats: "errors-only",
    inline: true,
    lazy: false,
    hot: true,
    headers: { "Access-Control-Allow-Origin": "*" },
    contentBase: path.join(__dirname, "dist"),
    watchOptions: {
      aggregateTimeout: 300,
      ignored: /node_modules/,
      poll: 100,
    },
    historyApiFallback: {
      verbose: true,
      disableDotRule: false,
    },
    before() {
      console.log("Starting Main Process...");
      spawn("npm", ["run", "main"], {
        shell: true,
        env: process.env,
        stdio: "inherit",
      })
        .on("close", (code) => process.exit(code))
        .on("error", (spawnError) => console.error(spawnError));
    },
  },
});
