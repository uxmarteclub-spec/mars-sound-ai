#!/usr/bin/env node
/**
 * Aplica push-batches/*.json no GitHub (um commit Git por ficheiro de lote).
 * Mesma identidade que o MCP com PAT da conta com escrita no repo.
 *
 *   node scripts/generate-all-mcp-batches.mjs
 *   export GITHUB_TOKEN=ghp_...
 *   node scripts/apply-push-batches.mjs
 *
 * Depois (binários + package-lock): node scripts/upload-repo-to-github.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BATCH_DIR = path.join(ROOT, "push-batches");
const OWNER = "uxmarteclub-spec";
const REPO = "mars-sound-ai";
const BRANCH = "main";
const TOKEN = process.env.GITHUB_TOKEN?.trim();

if (!TOKEN) {
  console.error("Defina GITHUB_TOKEN.");
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
  if (!r.ok) throw new Error(`${opts.method || "GET"} ${p}: ${r.status} ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : null;
}

async function createBlobUtf8(content) {
  const j = await api(`/repos/${OWNER}/${REPO}/git/blobs`, {
    method: "POST",
    body: JSON.stringify({ content, encoding: "utf-8" }),
  });
  return j.sha;
}

async function pushBatch(payload) {
  const refData = await api(`/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`);
  const commitSha = refData.object.sha;
  const commitObj = await api(`/repos/${OWNER}/${REPO}/git/commits/${commitSha}`);
  const baseTree = commitObj.tree.sha;

  const treeEntries = [];
  for (const { path: filePath, content } of payload.files) {
    const normalized = filePath.replace(/\\/g, "/");
    const blobSha = await createBlobUtf8(content);
    treeEntries.push({ path: normalized, mode: "100644", type: "blob", sha: blobSha });
  }

  const tree = await api(`/repos/${OWNER}/${REPO}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: baseTree, tree: treeEntries }),
  });

  const newCommit = await api(`/repos/${OWNER}/${REPO}/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message: payload.message,
      tree: tree.sha,
      parents: [commitSha],
    }),
  });

  await api(`/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: newCommit.sha }),
  });

  return newCommit.sha;
}

async function main() {
  const files = fs
    .readdirSync(BATCH_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();
  if (files.length === 0) {
    console.error("Sem push-batches/*.json — rode: node scripts/generate-all-mcp-batches.mjs");
    process.exit(1);
  }
  for (const f of files) {
    const payload = JSON.parse(fs.readFileSync(path.join(BATCH_DIR, f), "utf8"));
    const sha = await pushBatch(payload);
    console.log(`${f} → ${sha.slice(0, 7)} (${payload.files.length} files)`);
    await new Promise((r) => setTimeout(r, 150));
  }
  console.log("Lotes de texto concluídos.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
