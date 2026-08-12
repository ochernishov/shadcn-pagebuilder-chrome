import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";

function readMessage() {
  const length = Buffer.alloc(4);
  if (fs.readSync(0, length, 0, 4, null) !== 4) return null;
  const size = length.readUInt32LE(0);
  const payload = Buffer.alloc(size);
  fs.readSync(0, payload, 0, size, null);
  return JSON.parse(payload.toString("utf8"));
}
function writeMessage(value) {
  const payload = Buffer.from(JSON.stringify(value));
  const length = Buffer.alloc(4);
  length.writeUInt32LE(payload.length);
  fs.writeSync(1, length); fs.writeSync(1, payload);
}
function safeName(value) { return String(value || "page").normalize("NFKD").replace(/[^a-zA-Z0-9а-яА-Я_-]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "page"; }
function pngBytes(dataUrl) {
  const match = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || "");
  if (!match) throw new Error("Invalid PNG screenshot payload");
  return Buffer.from(match[1], "base64");
}
function createCollectionDirectory(root) {
  fs.mkdirSync(root, { recursive: true, mode: 0o700 });
  const privacyIgnore = path.join(root, ".gitignore");
  if (!fs.existsSync(privacyIgnore)) {
    fs.writeFileSync(privacyIgnore, "*\n!.gitignore\n", { mode: 0o600 });
  }
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const collectionId = String(crypto.randomInt(100000, 1000000));
    const directory = path.join(root, collectionId);
    try {
      fs.mkdirSync(directory, { mode: 0o700 });
      return { collectionId, directory };
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
    }
  }
  throw new Error("Could not allocate a unique Collector number");
}
function chooseDirectory(promptText) {
  if (process.platform !== "darwin") throw new Error("Directory picker is currently available on macOS only");
  const script = ["on run argv", "POSIX path of (choose folder with prompt (item 1 of argv))", "end run"];
  const args = script.flatMap(line => ["-e", line]);
  const result = spawnSync("osascript", [...args, String(promptText || "Choose project folder")], { encoding: "utf8" });
  if (result.status !== 0) return { ok: false, canceled: true };
  const directory = result.stdout.trim().replace(/\/$/, "");
  return { ok: true, directory, name: path.basename(directory) };
}

try {
  const message = readMessage();
  if (!message) throw new Error("Empty native message");
  if (message.action === "choose-directory") {
    writeMessage(chooseDirectory(message.prompt));
    process.exit(0);
  }
  if (message.action !== "export") throw new Error("Unsupported native message");
  const configuredRoot = process.env.PAGE_COLLECTOR_EXPORT_DIRECTORY?.replace(/^~/, os.homedir());
  const projectSubdirectory = process.env.PAGE_COLLECTOR_PROJECT_EXPORT_DIRECTORY;
  if (!configuredRoot) throw new Error("PAGE_COLLECTOR_EXPORT_DIRECTORY is not configured");
  if (!projectSubdirectory) throw new Error("PAGE_COLLECTOR_PROJECT_EXPORT_DIRECTORY is not configured");
  const collectorRoot = message.spec.projectDirectory
    ? path.join(message.spec.projectDirectory, projectSubdirectory)
    : path.join(configuredRoot, safeName(message.spec.project), projectSubdirectory);
  const { collectionId, directory } = createCollectionDirectory(collectorRoot);
  message.spec.collectionId = collectionId;
  message.spec.exportedAt = new Date().toISOString();
  const screenshots = message.screenshots || {};
  for (const block of message.spec.blocks || []) {
    if (!block.screenshotId || !block.screenshotPath || !screenshots[block.screenshotId]) continue;
    const filename = `${String((message.spec.blocks.indexOf(block) + 1)).padStart(2, "0")}-${safeName(block.slug)}.png`;
    block.screenshotPath = `references/${filename}`;
    const references = path.join(directory, "references");
    fs.mkdirSync(references, { recursive: true });
    fs.writeFileSync(path.join(references, filename), pngBytes(screenshots[block.screenshotId]), { mode: 0o600 });
  }
  const markdown = `Collector ID: \`${collectionId}\`\n\n${message.markdown}`;
  fs.writeFileSync(path.join(directory, "page-spec.json"), JSON.stringify(message.spec, null, 2) + "\n", { mode: 0o600 });
  fs.writeFileSync(path.join(directory, "PAGE_SPEC.md"), markdown, { mode: 0o600 });
  writeMessage({ ok: true, collectionId, directory });
} catch (error) { writeMessage({ ok: false, error: error.message }); }
