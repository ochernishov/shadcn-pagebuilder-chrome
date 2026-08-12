import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

test("native host exports JSON and Markdown", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "page-collector-"));
  const message = Buffer.from(JSON.stringify({ action: "export", spec: { project: "Test", page: "Home", blocks: [] }, markdown: "# Test\n" }));
  const length = Buffer.alloc(4); length.writeUInt32LE(message.length);
  const result = spawnSync(process.execPath, ["native-host/host.mjs"], { input: Buffer.concat([length, message]), env: { ...process.env, PAGE_COLLECTOR_EXPORT_DIRECTORY: directory } });
  assert.equal(result.status, 0);
  const size = result.stdout.readUInt32LE(0);
  const response = JSON.parse(result.stdout.subarray(4, 4 + size));
  assert.equal(response.ok, true);
  assert.equal(fs.readFileSync(path.join(directory, "Test", "Home", "PAGE_SPEC.md"), "utf8"), "# Test\n");
  assert.equal(JSON.parse(fs.readFileSync(path.join(directory, "Test", "Home", "page-spec.json"), "utf8")).project, "Test");
});
