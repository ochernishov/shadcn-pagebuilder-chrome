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

test("pending captures are deduplicated by source URL", () => {
  const source = fs.readFileSync("extension/panel.js", "utf8");
  assert.match(source, /blocks\.find\(block => block\.url === pending\.url\)/);
  assert.match(source, /state\.expandedBlockId = existing\.id/);
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
