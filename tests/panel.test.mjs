import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("hidden attribute always overrides component display styles", () => {
  const css = fs.readFileSync("extension/panel.css", "utf8");
  assert.match(css, /\[hidden\]\s*\{\s*display:\s*none\s*!important;\s*\}/);
});

test("discard clears pending state and hides capture immediately", () => {
  const source = fs.readFileSync("extension/panel.js", "utf8");
  const start = source.indexOf("async function discardPending");
  const body = source.slice(start, source.indexOf("\n}\n\n$(\"#settings-toggle\")", start) + 2);
  assert.match(body, /state\.pending = null/);
  assert.match(body, /\$\("#capture"\)\.hidden = true/);
  assert.match(body, /chrome\.storage\.local\.remove\("pendingCapture"\)/);
});

test("workspace supports multiple saved specifications", () => {
  const source = fs.readFileSync("extension/panel.js", "utf8");
  assert.match(source, /function defaultWorkspace/);
  assert.match(source, /workspace\.specs/);
  assert.match(source, /async function createSpec/);
});

test("locale changes translate only system-managed project and page names", () => {
  const source = fs.readFileSync("extension/panel.js", "utf8");
  assert.match(source, /state\.workspace\.specs\.forEach\(spec => localizeSystemLabels\(spec, locale\)\)/);
  assert.match(source, /migrateSystemLabels\(spec, state\.locale/);
  assert.match(source, /delete state\.spec\.pageLabelKey/);
  assert.match(source, /delete state\.spec\.projectLabelKey/);
});

test("pending captures are deduplicated by source URL", () => {
  const source = fs.readFileSync("extension/panel.js", "utf8");
  assert.match(source, /blocks\.find\(block => block\.kind !== "visual-reference" && block\.url === pending\.url\)/);
  assert.match(source, /state\.expandedBlockId = existing\.id/);
});

test("manual screenshots are cropped and stored as visual references", () => {
  const source = fs.readFileSync("extension/panel.js", "utf8");
  const html = fs.readFileSync("extension/panel.html", "utf8");
  assert.match(html, /id="add-screenshot"/);
  assert.match(source, /async function cropScreenshot/);
  assert.match(source, /type: "capture-selected-region"/);
  assert.match(source, /kind: "visual-reference"/);
  assert.match(source, /state\.spec\.blocks\.push\(block\)/);
});

test("agent export decides between authorized install and original implementation", () => {
  const source = fs.readFileSync("extension/panel.js", "utf8");
  const i18n = fs.readFileSync("extension/i18n.js", "utf8");
  assert.equal(source.includes("Source library}: Shadcn Blocks"), false);
  assert.match(i18n, /official install command only when it is available and authorized/);
  assert.match(i18n, /create an original implementation from the visible reference/);
});

test("collected blocks render expandable source details", () => {
  const source = fs.readFileSync("extension/panel.js", "utf8");
  assert.match(source, /class="block-details"/);
  assert.match(source, /link\.href = block\.url/);
  assert.match(source, /detail-install/);
});

test("project folder selection is routed through the native host", () => {
  const source = fs.readFileSync("extension/panel.js", "utf8");
  assert.match(source, /action: "choose-directory"/);
  assert.match(source, /state\.spec\.projectDirectory = selected\.directory/);
});

test("successful export displays and copies the Collector number", () => {
  const source = fs.readFileSync("extension/panel.js", "utf8");
  const html = fs.readFileSync("extension/panel.html", "utf8");
  assert.match(html, /id="export-result"/);
  assert.match(html, /id="collection-id"/);
  assert.match(html, /id="copy-collection-id"/);
  assert.match(source, /response\.collectionId/);
  assert.match(source, /navigator\.clipboard\.writeText\(\$\("#collection-id"\)\.textContent\)/);
});
