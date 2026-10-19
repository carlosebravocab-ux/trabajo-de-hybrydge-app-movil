import { cp, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const webOutput = resolve(projectRoot, "www");
const webFiles = [
  "index.html",
  "styles.css",
  "script.js",
  "manifest.webmanifest",
  "service-worker.js",
  "assets",
];

await mkdir(webOutput, { recursive: true });

for (const file of webFiles) {
  await cp(resolve(projectRoot, file), resolve(webOutput, file), { recursive: true });
}

console.log(`Archivos web preparados para Capacitor en: ${webOutput}`);
