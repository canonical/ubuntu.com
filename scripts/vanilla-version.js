#!/usr/bin/env node
/**
 * Pin Vanilla Framework to VANILLA_VERSION before its macros are copied.
 *
 * The CMS renders through the same macros the hand-written templates
 * use, so which version is installed decides what both can do. Putting
 * it in .env means an upgrade is a config change and a rebuild rather
 * than a package.json edit — useful when trying a version out, or when
 * a deploy needs to pin one without a commit.
 *
 * Unset, nothing happens and package.json stays the source of truth.
 * Set and already matching, nothing happens either. Only a genuine
 * difference triggers an install, and it is --no-save: package.json is
 * not edited behind your back, so the override lasts for this build.
 */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

const fromEnvFile = (name) => {
  const file = path.join(root, ".env");

  if (!fs.existsSync(file)) return "";

  const line = fs
    .readFileSync(file, "utf8")
    .split("\n")
    .find((entry) => entry.startsWith(`${name}=`));

  return line ? line.slice(name.length + 1).trim() : "";
};

const wanted = (process.env.VANILLA_VERSION || fromEnvFile("VANILLA_VERSION"))
  .trim()
  .replace(/^v/, "");

/**
 * Read from disk rather than require(): this is called before and after
 * the install, and require() caches by path — the second call would
 * hand back the version that was there when the process started.
 */
const installedVersion = () => {
  try {
    return JSON.parse(
      fs.readFileSync(
        path.join(root, "node_modules", "vanilla-framework", "package.json"),
        "utf8"
      )
    ).version;
  } catch {
    return "";
  }
};

const installed = installedVersion();

if (!wanted) {
  console.log(`vanilla-framework ${installed || "(not installed)"} — from package.json`);
  process.exit(0);
}

if (wanted === installed) {
  console.log(`vanilla-framework ${installed} — matches VANILLA_VERSION`);
  process.exit(0);
}

console.log(
  `vanilla-framework ${installed || "(none)"} → ${wanted} (VANILLA_VERSION)`
);

// --legacy-peer-deps because this repository is a yarn project with a
// peer conflict npm refuses to resolve (@testing-library/react-hooks).
// That has nothing to do with Vanilla, and fetching one package should
// not be held up by it. --no-save keeps package.json as written.
try {
  execFileSync(
    "npm",
    [
      "install",
      "--no-save",
      "--no-audit",
      "--no-fund",
      "--legacy-peer-deps",
      `vanilla-framework@${wanted}`,
    ],
    { cwd: root, stdio: "pipe", encoding: "utf8" }
  );
} catch (error) {
  const output = `${error.stdout ?? ""}${error.stderr ?? ""}`;

  process.stderr.write(output);

  if (output.includes("EACCES")) {
    // node_modules belongs to root here: dotrun installed it inside a
    // container. Saying so beats blaming the version number.
    console.error(
      `\nnode_modules is not writable by this user — it belongs to the ` +
        `dotrun container. Run the upgrade the same way:\n\n` +
        `  dotrun exec bash -c "VANILLA_VERSION=${wanted} yarn run ` +
        `build-vanilla-macros"\n`
    );
  } else {
    console.error(
      `\nCould not install vanilla-framework@${wanted}. Is that a real ` +
        `version? The build stops here rather than copying macros from a ` +
        `version nobody asked for.`
    );
  }

  process.exit(1);
}

const now = installedVersion();

if (now !== wanted) {
  console.error(
    `\nAsked for vanilla-framework@${wanted} but ${now} is installed.`
  );
  process.exit(1);
}

console.log(`vanilla-framework ${now} installed`);
