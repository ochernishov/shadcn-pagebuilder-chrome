import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const root = path.resolve(import.meta.dirname, "..");
function env() {
  const result = {};
  for (const line of fs.readFileSync(path.join(root, ".env"), "utf8").split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith("#")) continue;
    const i = line.indexOf("="); if (i > 0) result[line.slice(0, i)] = line.slice(i + 1);
  }
  return result;
}
const values = env();
const required = ["APP_NAME", "NATIVE_HOST_NAME", "EXTENSION_PUBLIC_KEY", "ALLOWED_HOST_PATTERN", "DEFAULT_PROJECT", "DEFAULT_PAGE", "DEFAULT_ROUTE", "EXPORT_DIRECTORY", "CHROME_EXTENSIONS_URL"];
for (const key of required) if (!values[key]) throw new Error(`Missing ${key} in .env`);
const dist = path.join(root, "dist", "extension");
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, "icons"), { recursive: true });
fs.mkdirSync(path.join(dist, "fonts"), { recursive: true });
const tokens = Object.fromEntries(required.map(key => [`__${key}__`, values[key]]));
for (const file of ["manifest.template.json", "config.template.js"]) {
  let content = fs.readFileSync(path.join(root, "extension", file), "utf8");
  for (const [token, value] of Object.entries(tokens)) content = content.replaceAll(token, value);
  fs.writeFileSync(path.join(dist, file.replace(".template", "")), content);
}
for (const file of ["collector-worker.js", "panel.html", "panel.css", "panel.js", "i18n.js"]) fs.copyFileSync(path.join(root, "extension", file), path.join(dist, file));
fs.copyFileSync(path.join(root, "extension", "fonts", "Geologica-Variable.woff2"), path.join(dist, "fonts", "Geologica-Variable.woff2"));
fs.copyFileSync(path.join(root, "extension", "fonts", "OFL.txt"), path.join(dist, "fonts", "OFL.txt"));
// Minimal valid PNG icons, generated locally to keep the extension self-contained.
function png(size) {
  const raw = Buffer.concat([...Array(size)].map(() => Buffer.concat([Buffer.from([0]), ...Array(size).fill(Buffer.from([255, 92, 53, 255]))])));
  const chunk = (type, data) => { const t = Buffer.from(type); const crcInput = Buffer.concat([t, data]); let c = 0xffffffff; for (const b of crcInput) { c ^= b; for (let k=0;k<8;k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1)); } const out=Buffer.alloc(data.length+12); out.writeUInt32BE(data.length); t.copy(out,4); data.copy(out,8); out.writeUInt32BE((c^0xffffffff)>>>0,data.length+8); return out; };
  const ihdr=Buffer.alloc(13); ihdr.writeUInt32BE(size,0); ihdr.writeUInt32BE(size,4); ihdr[8]=8; ihdr[9]=6;
  return Buffer.concat([Buffer.from("89504e470d0a1a0a","hex"),chunk("IHDR",ihdr),chunk("IDAT",zlib.deflateSync(raw)),chunk("IEND",Buffer.alloc(0))]);
}
for (const size of [16,48,128]) fs.writeFileSync(path.join(dist,"icons",`icon${size}.png`),png(size));
console.log(`Built Chrome extension: ${dist}`);
