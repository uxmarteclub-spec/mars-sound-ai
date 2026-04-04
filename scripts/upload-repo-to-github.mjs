#!/usr/bin/env node
/**
 * Um commit na branch main com todos os ficheiros rastreados pelo git (exceto skips).
 * Requer PAT com scope repo na conta que tem push (ex. uxmarteclub-spec).
 *
 *   export GITHUB_TOKEN=ghp_...
 *   node scripts/upload-repo-to-github.mjs
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OWNER = "uxmarteclub-spec";
const REPO = "mars-sound-ai";
const BRANCH = "main";
const ROOT = path.resolve(__dirname, "..");
const TOKEN = process.env.GITHUB_TOKEN?.trim();

const SKIP_PREFIXES = [".env", ".env."];
const SKIP_NAMES = new Set([".env"]);

function shouldSkip(rel) {
  const base = path.basename(rel);
  if (SKIP_NAMES.has(base)) return true;
  return SKIP_PREFIXES.some((p) => rel === p || rel.startsWith(p + path.sep));
}

if (!TOKEN) {
  console.error(
    "Defina GITHUB_TOKEN (PAT da conta com permissão de escrita no repositório)."
  );
  process.exit(1);
}

async function api(p, opts = {}) {
  const r = await fetch(`https://api.github.com${p}`, {
    ...opts,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(opts.body ? { "Content-Type": "application/json" } : {}),
      ...(opts.headers || {}),
    },
  });
  const text = await r.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!r.ok) {
    throw new Error(`${opts.method || "GET"} ${p}: ${r.status} ${text.slice(0, 500)}`);
  }
  return json;
}

function trackedFiles() {
  const out = execSync("git ls-files", { cwd: ROOT, encoding: "utf8" });
  return out
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((rel) => !shouldSkip(rel));
}

const BINARY_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".woff", ".woff2"]);

function isBinaryPath(rel) {
  const ext = path.extname(rel).toLowerCase();
  return BINARY_EXT.has(ext);
}

async function createBlob(rel, buf) {
  const payload = isBinaryPath(rel)
    ? { content: buf.toString("base64"), encoding: "base64" }
    : { content: buf.toString("utf8"), encoding: "utf-8" };
  const j = await api(`/repos/${OWNER}/${REPO}/git/blobs`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return j.sha;
}

async function main() {
  const files = trackedFiles();
  console.log(`${files.length} ficheiros a incluir no commit…`);

  const refData = await api(`/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`);
  const commitSha = refData.object.sha;
  const commitObj = await api(`/repos/${OWNER}/${REPO}/git/commits/${commitSha}`);
  const baseTree = commitObj.tree.sha;

  const treeEntries = [];
  for (const rel of files) {
    const full = path.join(ROOT, rel);
    if (!fs.existsSync(full)) continue;
    const buf = fs.readFileSync(full);
    const blobSha = await createBlob(rel, buf);
    treeEntries.push({
      path: rel.replace(/\\/g, "/"),
      mode: "100644",
      type: "blob",
      sha: blobSha,
    });
    if (treeEntries.length % 40 === 0) {
      console.log(`  blobs: ${treeEntries.length}/${files.length}`);
    }
  }

  const tree = await api(`/repos/${OWNER}/${REPO}/git/trees`, {
    method: "POST",
    body: JSON.stringify({
      base_tree: baseTree,
      tree: treeEntries,
    }),
  });

  const newCommit = await api(`/repos/${OWNER}/${REPO}/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message: `chore: sync project (${treeEntries.length} files)`,
      tree: tree.sha,
      parents: [commitSha],
    }),
  });

  await api(`/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: newCommit.sha }),
  });

  console.log(`Commit ${newCommit.sha.slice(0, 7)} em ${OWNER}/${REPO}@${BRANCH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
