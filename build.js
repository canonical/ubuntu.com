let esbuild = require("esbuild");
const path = require("path");
const { sassPlugin } = require("esbuild-sass-plugin");

let entries = {
  "canonical-cla": "./static/js/src/canonical-cla/app.tsx",
};

const isDev = process && process.env && process.env.NODE_ENV === "development";

// if CAPTCHA_TESTING_API_KEY doesn't exist then we are on demo / staging / production and use the real API key
const captchaKey =
  (process && process.env && process.env.CAPTCHA_TESTING_API_KEY) ||
  "6LfYBloUAAAAAINm0KzbEv6TP0boLsTEzpdrB8if";

for (const [key, value] of Object.entries(entries)) {
  const options = {
    plugins: [
      sassPlugin(),
    ],
    entryPoints: [value],
    bundle: true,
    minify: !isDev,
    nodePaths: [path.resolve(__dirname, "./static/js/src")],
    sourcemap: !isDev,
    outfile: "static/js/dist/" + key + ".js",
    loader: {
      '.js': 'jsx',
      '.ts': 'ts',
      '.tsx': 'tsx',
      '.jsx': 'jsx',
    },
    jsx: 'automatic', 
    target: ["chrome90", "firefox88", "safari14", "edge90"],
    define: {
      "process.env.NODE_ENV":
        // Explicitly check for 'development' so that this defaults to
        // 'production' in all other cases.
        isDev ? '"development"' : '"production"',
      "process.env.CAPTCHA_TESTING_API_KEY": `"${captchaKey}"`,
    },
  };

  esbuild
    .build(options)
    .then((result) => {
      console.log("Built " + key + ".js");
    })
    // Fail the build if there are errors.
    .catch(() => process.exit(1));
}
