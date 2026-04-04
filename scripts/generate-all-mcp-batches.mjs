#!/usr/bin/env node
/**
 * Gera ficheiros push-batches/NNN.json (sem _nextIndex) para uso com MCP push_files.
 * Pasta push-batches/ deve estar no .gitignore.
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "push-batches");
const MAX_PAYLOAD_CHARS = 55000;

const SKIP = (rel) =>
  rel === ".env" ||
  rel.startsWith(".env.") ||
  rel.includes("/.env");

const SKIP_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".woff", ".woff2"]);
const SKIP_FILES = new Set(["package-lock.json"]);

function trackedFiles() {
  return execSync("git ls-files", { cwd: ROOT, encoding: "utf8" })
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((rel) => !SKIP(rel))
    .filter((rel) => !SKIP_EXT.has(path.extname(rel).toLowerCase()))
    .filter((rel) => !SKIP_FILES.has(path.basename(rel)));
}

const all = trackedFiles();
fs.mkdirSync(OUT_DIR, { recursive: true });
for (const f of fs.readdirSync(OUT_DIR)) {
  if (f.endsWith(".json")) fs.unlinkSync(path.join(OUT_DIR, f));
}

let start = 0;
let batchNum = 0;
while (start < all.length) {
  const files = [];
  let used = 0;
  for (let i = start; i < all.length; i++) {
    const rel = all[i];
    const full = path.join(ROOT, rel);
    if (!fs.existsSync(full)) continue;
    const content = fs.readFileSync(full, "utf8");
    const p = rel.replace(/\\/g, "/");
    const entryCost = p.length + content.length + 40;
    if (files.length > 0 && used + entryCost > MAX_PAYLOAD_CHARS) break;
    files.push({ path: p, content });
    used += entryCost;
  }
  if (files.length === 0) break;
  const end = start + files.length;
  const payload = {
    owner: "uxmarteclub-spec",
    repo: "mars-sound-ai",
    branch: "main",
    message: `chore: sync batch ${batchNum} (files ${start}–${end - 1})`,
    files,
  };
  const name = String(batchNum).padStart(3, "0") + ".json";
  fs.writeFileSync(path.join(OUT_DIR, name), JSON.stringify(payload), "utf8");
  console.log(name, files.length, "files");
  start = end;
  batchNum++;
}

console.log("Total batches:", batchNum);
