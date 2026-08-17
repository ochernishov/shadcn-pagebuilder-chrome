import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

const root = path.resolve(import.meta.dirname, "..");
const env = Object.fromEntries(fs.readFileSync(path.join(root, ".env"), "utf8").split(/\r?\n/).filter(line => line && !line.startsWith("#")).map(line => { const i=line.indexOf("="); return [line.slice(0,i),line.slice(i+1)]; }));
const expandHome = value => value.replace(/^~/, os.homedir());
function extensionIdFromKey(publicKey) {
  const digest = crypto.createHash("sha256").update(Buffer.from(publicKey, "base64")).digest("hex").slice(0, 32);
  return [...digest].map(character => String.fromCharCode(Number.parseInt(character, 16) + 97)).join("");
}
const extensionId = process.argv[2] || extensionIdFromKey(env.EXTENSION_PUBLIC_KEY);
if (!/^[a-p]{32}$/.test(extensionId)) throw new Error("Could not determine a valid Chrome extension ID");
const hostDir = path.join(os.homedir(), "Library", "Application Support", "Google", "Chrome", "NativeMessagingHosts");
const runtimeDir = path.join(os.homedir(), "Library", "Application Support", env.APP_NAME);
fs.mkdirSync(hostDir, { recursive: true }); fs.mkdirSync(runtimeDir, { recursive: true });
const installedHost = path.join(runtimeDir, "host.mjs");
fs.copyFileSync(path.join(root, "native-host", "host.mjs"), installedHost);
const launcher = path.join(runtimeDir, "native-host.sh");
fs.writeFileSync(launcher, `#!/bin/sh\nexport PAGE_COLLECTOR_EXPORT_DIRECTORY=${JSON.stringify(env.EXPORT_DIRECTORY)}\nexport PAGE_COLLECTOR_PROJECT_EXPORT_DIRECTORY=${JSON.stringify(env.PROJECT_EXPORT_DIRECTORY)}\nexec ${JSON.stringify(process.execPath)} ${JSON.stringify(installedHost)}\n`, { mode: 0o700 });
fs.writeFileSync(path.join(hostDir, `${env.NATIVE_HOST_NAME}.json`), JSON.stringify({ name: env.NATIVE_HOST_NAME, description: `${env.APP_NAME} local export host`, path: launcher, type: "stdio", allowed_origins: [`chrome-extension://${extensionId}/`] }, null, 2) + "\n");
const builtExtensionSource = fs.existsSync(path.join(root, "extension", "manifest.json")) ? path.join(root, "extension") : path.join(root, "dist", "extension");
if (!fs.existsSync(path.join(builtExtensionSource, "manifest.json"))) throw new Error("Built extension not found — run npm run build first");
const installedExtension = path.join(runtimeDir, "extension");
fs.rmSync(installedExtension, { recursive: true, force: true });
fs.cpSync(builtExtensionSource, installedExtension, { recursive: true });
const skillName = env.COLLECTOR_SKILL_NAME;
const skillSource = path.join(root, "skills", skillName);
if (!skillName || !fs.existsSync(path.join(skillSource, "SKILL.md"))) throw new Error("Collector skill source is missing");
const skillTargets = [env.CODEX_SKILLS_DIRECTORY, env.CLAUDE_SKILLS_DIRECTORY].map(expandHome);
for (const skillsDirectory of skillTargets) {
  const target = path.join(skillsDirectory, skillName);
  fs.mkdirSync(target, { recursive: true });
  fs.cpSync(skillSource, target, { recursive: true, force: true });
}
console.log(`Installed native host for ${extensionId}`);
console.log(`Installed extension bundle at ${installedExtension}`);
console.log(`Installed ${skillName} for Codex and Claude Code`);
