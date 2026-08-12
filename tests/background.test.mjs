import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("runtime code never calls sidePanel.open", () => {
  const source = fs.readFileSync("extension/collector-worker.js", "utf8");
  assert.equal(source.includes("sidePanel.open"), false);
  assert.equal(source.includes("Promise.all([panelPromise"), false);
});

test("keyboard shortcut executes the extension action", () => {
  const manifest = JSON.parse(fs.readFileSync("extension/manifest.template.json", "utf8"));
  assert.ok(manifest.commands._execute_action);
  assert.equal(manifest.commands["capture-block"], undefined);
});

test("context menu records a pending block and signals it with a badge", () => {
  const source = fs.readFileSync("extension/collector-worker.js", "utf8");
  const menuBody = source.slice(source.indexOf("chrome.contextMenus.onClicked"), source.indexOf("chrome.runtime.onMessage"));
  assert.match(menuBody, /capture\(tab, info\.selectionText \|\| ""\)/);
  assert.match(menuBody, /chrome\.action\.setBadgeText/);
});

test("screenshot requests use the visible-tab PNG API", () => {
  const source = fs.readFileSync("extension/collector-worker.js", "utf8");
  assert.match(source, /message\.type === "capture-screenshot"/);
  assert.match(source, /chrome\.tabs\.captureVisibleTab\(undefined, \{ format: "png" \}\)/);
});
