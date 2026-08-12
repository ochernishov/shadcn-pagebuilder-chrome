#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const collectionId = process.argv[2] || "";
if (!/^\d{6}$/.test(collectionId)) {
  throw new Error("Collector number must contain exactly six digits");
}

let cursor = path.resolve(process.cwd());
let collectionDirectory = null;
while (true) {
  const candidate = path.join(cursor, "Collector", collectionId);
  if (fs.existsSync(path.join(candidate, "PAGE_SPEC.md")) && fs.existsSync(path.join(candidate, "page-spec.json"))) {
    collectionDirectory = candidate;
    break;
  }
  const parent = path.dirname(cursor);
  if (parent === cursor) break;
  cursor = parent;
}

if (!collectionDirectory) {
  throw new Error(`Collector ${collectionId} was not found in the current project`);
}

const jsonPath = path.join(collectionDirectory, "page-spec.json");
const markdownPath = path.join(collectionDirectory, "PAGE_SPEC.md");
const referencesDirectory = path.join(collectionDirectory, "references");
const spec = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
if (spec.collectionId !== collectionId) {
  throw new Error(`Collector ID mismatch: requested ${collectionId}, package contains ${spec.collectionId || "none"}`);
}

const references = fs.existsSync(referencesDirectory)
  ? fs.readdirSync(referencesDirectory).filter(name => name.toLowerCase().endsWith(".png")).sort()
  : [];

process.stdout.write(JSON.stringify({
  collectionId,
  collectionDirectory,
  markdownPath,
  jsonPath,
  referencesDirectory,
  references,
  project: spec.project,
  page: spec.page,
  route: spec.route,
  pageMode: spec.pageMode,
  itemCount: Array.isArray(spec.blocks) ? spec.blocks.length : 0
}, null, 2) + "\n");
