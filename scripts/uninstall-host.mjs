import fs from "node:fs";
import os from "node:os";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "..");
const lines = fs.readFileSync(path.join(root, ".env"), "utf8").split(/\r?\n/);
const value = key => lines.find(line => line.startsWith(`${key}=`))?.split("=").slice(1).join("=");
const hostName = value("NATIVE_HOST_NAME");
if (!hostName) throw new Error("NATIVE_HOST_NAME is missing");
const manifest = path.join(os.homedir(), "Library", "Application Support", "Google", "Chrome", "NativeMessagingHosts", `${hostName}.json`);
fs.rmSync(manifest, { force: true });
console.log(`Removed ${manifest}`);
const appName = value("APP_NAME");
if (appName) {
  const runtimeDir = path.join(os.homedir(), "Library", "Application Support", appName);
  fs.rmSync(runtimeDir, { recursive: true, force: true });
  console.log(`Removed ${runtimeDir}`);
}
const skillName = value("COLLECTOR_SKILL_NAME");
for (const directory of [value("CODEX_SKILLS_DIRECTORY"), value("CLAUDE_SKILLS_DIRECTORY")]) {
  if (!skillName || !directory) continue;
  const skill = path.join(directory.replace(/^~/, os.homedir()), skillName);
  fs.rmSync(skill, { recursive: true, force: true });
  console.log(`Removed ${skill}`);
}
