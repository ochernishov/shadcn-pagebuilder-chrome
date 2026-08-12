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

test("project settings collapse into a persistent one-line summary", () => {
  const source = fs.readFileSync("extension/panel.js", "utf8");
  const html = fs.readFileSync("extension/panel.html", "utf8");
  assert.match(html, /id="settings-summary-title"/);
  assert.match(html, /id="settings-summary-meta"/);
  assert.match(html, /aria-controls="settings-fields"/);
  assert.match(source, /function renderSettings/);
  assert.match(source, /settingsExpanded/);
  assert.match(source, /settings-summary-title/);
  assert.match(source, /chrome\.storage\.local\.set\(\{ settingsExpanded:/);
});

test("project settings cannot widen the side panel with long paths or labels", () => {
  const css = fs.readFileSync("extension/panel.css", "utf8");
  assert.match(css, /html, body \{ max-inline-size: 100%; overflow-x: hidden; \}/);
  assert.match(css, /grid-template-columns: minmax\(0, 2fr\) minmax\(0, 1fr\)/);
  assert.match(css, /\.folder-picker button \{[^}]*max-inline-size: 45%/s);
  assert.match(css, /\.folder-picker strong \{[^}]*text-overflow: ellipsis/s);
});

test("page and single-block workflows preserve independent state", () => {
  const source = fs.readFileSync("extension/panel.js", "utf8");
  const html = fs.readFileSync("extension/panel.html", "utf8");
  assert.match(html, /role="tablist"/);
  assert.match(html, /data-workflow-mode="page"/);
  assert.match(html, /data-workflow-mode="single"/);
  assert.match(html, /id="single-workspace"/);
  assert.match(source, /workflowDrafts: \{ page: null, single: null \}/);
  assert.match(source, /state\.workflowDrafts\[state\.workflowMode\] = state\.pending/);
  assert.match(source, /singleItem: block/);
  assert.match(source, /state\.spec\.blocks\.splice\(position, 0, block\)/);
});

test("single-block mode copies structured agent data and optional PNG", () => {
  const source = fs.readFileSync("extension/panel.js", "utf8");
  assert.match(source, /kind: "single-block"/);
  assert.match(source, /function singleBlockPrompt/);
  assert.match(source, /"text\/plain": new Blob/);
  assert.match(source, /"image\/png": image/);
  assert.match(source, /navigator\.clipboard\.writeText\(text\)/);
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

test("an open panel clears the capture badge after receiving a shortcut capture", () => {
  const source = fs.readFileSync("extension/panel.js", "utf8");
  const listener = source.slice(source.indexOf("chrome.storage.onChanged.addListener"));
  assert.match(listener, /chrome\.runtime\.sendMessage\(\{ type: "panel-ready" \}\)/);
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

test("page workspace exposes explicit page and screenshot capture actions", () => {
  const source = fs.readFileSync("extension/panel.js", "utf8");
  const html = fs.readFileSync("extension/panel.html", "utf8");
  const hydrate = source.slice(source.indexOf("async function hydrate"), source.indexOf("function markdown"));
  assert.match(html, /id="add-current-page"/);
  assert.match(html, /id="add-screenshot"/);
  assert.equal(html.includes('id="count"'), false);
  assert.equal(html.includes('data-i18n="currentPage"'), false);
  assert.match(source, /\$\("#add-current-page"\)\.onclick/);
  assert.match(source, /type: "capture-active"/);
  assert.equal(hydrate.includes('type: "capture-active"'), false);
  assert.match(source, /chrome\.permissions\.request\(\{ origins: \[APP_CONFIG\.allowedHostPattern\] \}\)/);
  assert.equal(source.match(/await requestCapturePermission\(\)/g)?.length, 2);
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

test("expanded page blocks allow implementation notes to be edited", () => {
  const source = fs.readFileSync("extension/panel.js", "utf8");
  assert.match(source, /class="detail-notes-editor"/);
  assert.match(source, /notes\.value = block\.instructions \|\| ""/);
  assert.match(source, /async function updateBlockInstructions/);
  assert.match(source, /block\.instructions = value\.trim\(\)/);
  assert.match(source, /event\.metaKey && !event\.ctrlKey/);
  assert.match(source, /await persist\(\)/);
});

test("project folder selection is routed through the native host", () => {
  const source = fs.readFileSync("extension/panel.js", "utf8");
  assert.match(source, /action: "choose-directory"/);
  assert.match(source, /state\.spec\.projectDirectory = selected\.directory/);
  assert.match(source, /if \(folderPickerOpen\) return null/);
  assert.match(source, /button\.disabled = true/);
  assert.match(source, /button\.disabled = false/);
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
