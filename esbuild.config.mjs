import fs from "fs";
import path from "path";
import esbuild from "esbuild";

const isWatch = process.argv.includes("--watch");
const outdir = ".";

/** Copy static plugin assets (manifest, styles) to dist */
function copyStatic() {
  if (!fs.existsSync(outdir)) {
    fs.mkdirSync(outdir, { recursive: true });
  }
  fs.copyFileSync("manifest.json", path.join(outdir, "manifest.json"));
  if (fs.existsSync("styles.css")) {
    fs.copyFileSync("styles.css", path.join(outdir, "styles.css"));
  }
}

const context = await esbuild.context({
  entryPoints: ["src/main.ts"],
  bundle: true,
  format: "cjs",
  platform: "node",
  target: "es2020",
  external: ["obsidian"],
  outfile: path.join(outdir, "main.js"),
  sourcemap: true,
  logLevel: "info",
});

copyStatic();

if (isWatch) {
  await context.watch();
  console.log("Watching for changes...");
} else {
  await context.rebuild();
  await context.dispose();
  console.log("Build complete.");
}
