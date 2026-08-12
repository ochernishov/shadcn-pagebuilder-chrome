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
