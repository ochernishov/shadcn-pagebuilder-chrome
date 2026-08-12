import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const stageRoot = fs.mkdtempSync(path.join(os.tmpdir(), "shadcn-page-collector-release-"));
const bundleName = `Shadcn-Page-Collector-v${pkg.version}`;
const stage = path.join(stageRoot, bundleName);
const releaseDir = path.join(root, "release");

fs.mkdirSync(stage, { recursive: true });
fs.mkdirSync(releaseDir, { recursive: true });
fs.cpSync(path.join(root, "dist", "extension"), path.join(stage, "extension"), { recursive: true });
for (const directory of ["docs", "native-host", "scripts", "skills"]) fs.cpSync(path.join(root, directory), path.join(stage, directory), { recursive: true });
for (const file of [".env.example", "Install on macOS.command", "CHANGELOG.md", "CONTRIBUTING.md", "LICENSE", "PRIVACY.md", "README.md", "SECURITY.md", "package.json"]) fs.copyFileSync(path.join(root, file), path.join(stage, file));
fs.chmodSync(path.join(stage, "Install on macOS.command"), 0o755);

const archive = path.join(releaseDir, `${bundleName}.zip`);
fs.rmSync(archive, { force: true });
execFileSync("ditto", ["-c", "-k", "--norsrc", "--keepParent", stage, archive]);
console.log(archive);
