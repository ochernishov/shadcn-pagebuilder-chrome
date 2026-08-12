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

test("captures are source-neutral and available on configured web pages", () => {
  const source = fs.readFileSync("extension/collector-worker.js", "utf8");
  const exampleEnv = fs.readFileSync(".env.example", "utf8");
  assert.match(source, /kind: "source"/);
  assert.match(source, /sourceDomain: url\.hostname/);
  assert.equal(source.includes("@shadcnblocks/"), false);
  assert.match(exampleEnv, /ALLOWED_HOST_PATTERN=\*:\/\/\*\/\*/);
});

test("manual reference capture injects a region selector and captures the visible tab", () => {
  const source = fs.readFileSync("extension/collector-worker.js", "utf8");
  const manifest = JSON.parse(fs.readFileSync("extension/manifest.template.json", "utf8"));
  assert.ok(manifest.permissions.includes("scripting"));
  assert.equal(manifest.host_permissions, undefined);
  assert.match(source, /message\.type === "capture-selected-region"/);
  assert.match(source, /chrome\.scripting\.executeScript/);
  assert.match(source, /captureVisibleTab\(tab\.windowId, \{ format: "png" \}\)/);
});

test("screenshot requests use the visible-tab PNG API", () => {
  const source = fs.readFileSync("extension/collector-worker.js", "utf8");
  assert.match(source, /message\.type === "capture-screenshot"/);
  assert.match(source, /chrome\.tabs\.captureVisibleTab\(undefined, \{ format: "png" \}\)/);
});
