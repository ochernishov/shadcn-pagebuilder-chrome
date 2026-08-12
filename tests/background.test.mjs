import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("runtime code never calls sidePanel.open", () => {
  const source = fs.readFileSync("extension/collector-worker.js", "utf8");
  assert.equal(source.includes("sidePanel.open"), false);
  assert.equal(source.includes("Promise.all([panelPromise"), false);
});

test("keyboard shortcut captures a block without toggling the side panel", () => {
  const manifest = JSON.parse(fs.readFileSync("extension/manifest.template.json", "utf8"));
  const source = fs.readFileSync("extension/collector-worker.js", "utf8");
  assert.equal(manifest.commands._execute_action, undefined);
  assert.ok(manifest.commands["capture-block"]);
  assert.match(source, /chrome\.commands\.onCommand\.addListener/);
  assert.match(source, /command !== "capture-block"/);
  assert.match(source, /captureActiveTab/);
});

test("context menu records a pending block and signals it with a badge", () => {
  const source = fs.readFileSync("extension/collector-worker.js", "utf8");
  const menuBody = source.slice(source.indexOf("chrome.contextMenus.onClicked"), source.indexOf("chrome.runtime.onMessage"));
  assert.match(menuBody, /capture\(tab, info\.selectionText \|\| ""\)/);
  assert.match(menuBody, /\.then\(signalPendingCapture\)/);
  assert.match(source, /async function signalPendingCapture/);
  assert.match(source, /chrome\.action\.setBadgeText/);
});

test("captures are source-neutral and available on configured web pages", () => {
  const source = fs.readFileSync("extension/collector-worker.js", "utf8");
  const exampleEnv = fs.readFileSync(".env.example", "utf8");
  assert.match(source, /kind: "source"/);
  assert.match(source, /sourceDomain: url\.hostname/);
  assert.equal(source.includes("@shadcnblocks/"), false);
  assert.match(exampleEnv, /ALLOWED_HOST_PATTERN=\*:\/\/\*\/\*/);
  assert.match(exampleEnv, /CAPTURE_HOST_PERMISSION=<all_urls>/);
});

test("manual reference capture injects a region selector and captures the visible tab", () => {
  const source = fs.readFileSync("extension/collector-worker.js", "utf8");
  const manifest = JSON.parse(fs.readFileSync("extension/manifest.template.json", "utf8"));
  assert.ok(manifest.permissions.includes("scripting"));
  assert.equal(manifest.host_permissions, undefined);
  assert.deepEqual(manifest.optional_host_permissions, ["__CAPTURE_HOST_PERMISSION__"]);
  assert.match(source, /message\.type === "capture-selected-region"/);
  assert.match(source, /chrome\.scripting\.executeScript/);
  assert.match(source, /captureVisibleTab\(tab\.windowId, \{ format: "png" \}\)/);
});

test("screenshot requests use the visible-tab PNG API", () => {
  const source = fs.readFileSync("extension/collector-worker.js", "utf8");
  assert.match(source, /message\.type === "capture-screenshot"/);
  assert.match(source, /chrome\.tabs\.captureVisibleTab\(undefined, \{ format: "png" \}\)/);
});

test("only one native directory picker can be open at a time", () => {
  const source = fs.readFileSync("extension/collector-worker.js", "utf8");
  assert.match(source, /let directoryPickerOpen = false/);
  assert.match(source, /if \(directoryPickerOpen\)/);
  assert.match(source, /respond\(\{ ok: false, busy: true \}\)/);
});
