import fs from "node:fs";
import os from "node:os";
import path from "node:path";

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

try {
  const message = readMessage();
  if (!message || message.action !== "export") throw new Error("Unsupported native message");
  const root = process.env.PAGE_COLLECTOR_EXPORT_DIRECTORY?.replace(/^~/, os.homedir());
  if (!root) throw new Error("PAGE_COLLECTOR_EXPORT_DIRECTORY is not configured");
  const directory = path.join(root, safeName(message.spec.project), safeName(message.spec.page));
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, "page-spec.json"), JSON.stringify(message.spec, null, 2) + "\n", { mode: 0o600 });
  fs.writeFileSync(path.join(directory, "PAGE_SPEC.md"), message.markdown, { mode: 0o600 });
  writeMessage({ ok: true, directory });
} catch (error) { writeMessage({ ok: false, error: error.message }); }
