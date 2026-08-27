import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { stdout } from "node:process";

const outputDirectory = path.resolve("dist");
const html = await readFile(path.join(outputDirectory, "index.html"), "utf8");
const assetReferences = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+\.(?:js|css))"/g)]
  .map((match) => match[1]);

if (assetReferences.length < 2) {
  throw new Error("dist/index.html must reference fingerprinted JavaScript and CSS assets.");
}

for (const reference of assetReferences) {
  const filename = path.basename(reference);
  if (!/-[A-Za-z0-9_-]{8,}\.(?:js|css)$/.test(filename)) {
    throw new Error(`Unfingerprinted build asset referenced by index.html: ${reference}`);
  }
  await access(path.join(outputDirectory, reference.slice(1)));
}

const outputFiles = await readdir(outputDirectory, { recursive: true });
const obsoleteWorker = outputFiles.find((filename) =>
  /(^|[\\/])(service-worker|sw)\.js$/i.test(filename),
);
if (obsoleteWorker) {
  throw new Error(`Unexpected service worker in frontend build: ${obsoleteWorker}`);
}

stdout.write(`Verified ${assetReferences.length} fingerprinted frontend assets and no service worker.\n`);
