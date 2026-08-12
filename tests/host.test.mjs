import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

function responseFrom(result) {
  const size = result.stdout.readUInt32LE(0);
  return JSON.parse(result.stdout.subarray(4, 4 + size));
}

test("native host exports JSON and Markdown", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "page-collector-"));
  const message = Buffer.from(JSON.stringify({ action: "export", spec: { project: "Test", page: "Home", blocks: [] }, markdown: "# Test\n" }));
  const length = Buffer.alloc(4); length.writeUInt32LE(message.length);
  const result = spawnSync(process.execPath, ["native-host/host.mjs"], { input: Buffer.concat([length, message]), env: { ...process.env, PAGE_COLLECTOR_EXPORT_DIRECTORY: directory, PAGE_COLLECTOR_PROJECT_EXPORT_DIRECTORY: "Collector" } });
  assert.equal(result.status, 0);
  const response = responseFrom(result);
  assert.equal(response.ok, true);
  assert.match(response.collectionId, /^\d{6}$/);
  const exported = path.join(directory, "Test", "Collector", response.collectionId);
  assert.ok(fs.readFileSync(path.join(exported, "PAGE_SPEC.md"), "utf8").includes(`Collector ID: \`${response.collectionId}\``));
  const exportedSpec = JSON.parse(fs.readFileSync(path.join(exported, "page-spec.json"), "utf8"));
  assert.equal(exportedSpec.project, "Test");
  assert.equal(exportedSpec.collectionId, response.collectionId);
  assert.equal(fs.readFileSync(path.join(directory, "Test", "Collector", ".gitignore"), "utf8"), "*\n!.gitignore\n");
});

test("native host exports screenshot references as PNG files", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "page-collector-shot-"));
  const png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+X1n9WQAAAABJRU5ErkJggg==";
  const spec = { project: "Test", page: "Visual", blocks: [{ id: "shot-1", slug: "hero1", screenshotId: "shot-1", screenshotPath: "references/01-hero1.png" }] };
  const message = Buffer.from(JSON.stringify({ action: "export", spec, markdown: "# Visual\n", screenshots: { "shot-1": png } }));
  const length = Buffer.alloc(4); length.writeUInt32LE(message.length);
  const result = spawnSync(process.execPath, ["native-host/host.mjs"], { input: Buffer.concat([length, message]), env: { ...process.env, PAGE_COLLECTOR_EXPORT_DIRECTORY: directory, PAGE_COLLECTOR_PROJECT_EXPORT_DIRECTORY: "Collector" } });
  assert.equal(result.status, 0);
  const response = responseFrom(result);
  assert.ok(fs.statSync(path.join(directory, "Test", "Collector", response.collectionId, "references", "01-hero1.png")).size > 0);
});

test("native host reads messages larger than one pipe chunk", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "collector-large-message-"));
  const largePng = `data:image/png;base64,${Buffer.alloc(120000, 65).toString("base64")}`;
  const spec = { project: "Large", page: "Home", blocks: [] };
  const message = Buffer.from(JSON.stringify({ action: "export", spec, markdown: "# Large\n\nLine with a tab\tand Unicode: 页面", screenshots: { unused: largePng } }));
  assert.ok(message.length > 65536);
  const length = Buffer.alloc(4); length.writeUInt32LE(message.length);
  const result = spawnSync(process.execPath, ["native-host/host.mjs"], { input: Buffer.concat([length, message]), env: { ...process.env, PAGE_COLLECTOR_EXPORT_DIRECTORY: directory, PAGE_COLLECTOR_PROJECT_EXPORT_DIRECTORY: "Collector" } });
  const response = responseFrom(result);
  assert.equal(response.ok, true);
  assert.ok(fs.existsSync(path.join(response.directory, "PAGE_SPEC.md")));
});

test("native host exports into the selected project directory", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "page-collector-project-"));
  const spec = { project: "Ignored", projectDirectory: directory, page: "Settings", blocks: [] };
  const message = Buffer.from(JSON.stringify({ action: "export", spec, markdown: "# Settings\n" }));
  const length = Buffer.alloc(4); length.writeUInt32LE(message.length);
  const result = spawnSync(process.execPath, ["native-host/host.mjs"], { input: Buffer.concat([length, message]), env: { ...process.env, PAGE_COLLECTOR_EXPORT_DIRECTORY: directory, PAGE_COLLECTOR_PROJECT_EXPORT_DIRECTORY: "Collector" } });
  assert.equal(result.status, 0);
  const response = responseFrom(result);
  const collection = path.join(directory, "Collector", response.collectionId);
  assert.equal(response.directory, collection);
  assert.match(fs.readFileSync(path.join(collection, "PAGE_SPEC.md"), "utf8"), /# Settings/);
});

test("every export receives a different six-digit Collector folder", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "page-collector-number-"));
  const spec = { project: "Test", projectDirectory: directory, page: "Home", blocks: [] };
  const input = () => {
    const message = Buffer.from(JSON.stringify({ action: "export", spec, markdown: "# Home\n" }));
    const length = Buffer.alloc(4); length.writeUInt32LE(message.length);
    return Buffer.concat([length, message]);
  };
  const env = { ...process.env, PAGE_COLLECTOR_EXPORT_DIRECTORY: directory, PAGE_COLLECTOR_PROJECT_EXPORT_DIRECTORY: "Collector" };
  const first = responseFrom(spawnSync(process.execPath, ["native-host/host.mjs"], { input: input(), env }));
  const second = responseFrom(spawnSync(process.execPath, ["native-host/host.mjs"], { input: input(), env }));
  assert.match(first.collectionId, /^\d{6}$/);
  assert.match(second.collectionId, /^\d{6}$/);
  assert.notEqual(first.collectionId, second.collectionId);
  assert.ok(fs.existsSync(path.join(directory, "Collector", first.collectionId, "PAGE_SPEC.md")));
  assert.ok(fs.existsSync(path.join(directory, "Collector", second.collectionId, "PAGE_SPEC.md")));
});

test("global skill resolver opens the exact numbered Collector package", () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), "page-collector-skill-"));
  const collectionId = "482731";
  const collection = path.join(project, "Collector", collectionId);
  fs.mkdirSync(path.join(collection, "references"), { recursive: true });
  fs.writeFileSync(path.join(collection, "PAGE_SPEC.md"), "# Test\n");
  fs.writeFileSync(path.join(collection, "page-spec.json"), JSON.stringify({ collectionId, project: "Demo", page: "Home", route: "/", pageMode: "create", blocks: [] }));
  const nested = path.join(project, "src", "app");
  fs.mkdirSync(nested, { recursive: true });
  const result = spawnSync(process.execPath, [path.resolve("skills/shadcn-collector/scripts/resolve-collection.mjs"), collectionId], { cwd: nested, encoding: "utf8" });
  assert.equal(result.status, 0);
  const resolved = JSON.parse(result.stdout);
  assert.equal(fs.realpathSync(resolved.collectionDirectory), fs.realpathSync(collection));
  assert.equal(resolved.collectionId, collectionId);
});
