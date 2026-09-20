#!/usr/bin/env node
/* ============================================================
   Zero-dependency pre-deploy sanity checks. No npm install, no
   build step — matches the project's own philosophy. Run by
   .github/workflows/checks.yml on every push and PR to main.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";

let failed = false;
const fail = (msg) => { console.error("FAIL: " + msg); failed = true; };
const ok = (msg) => console.log("OK: " + msg);

const root = process.cwd();
const pages = ["index.html", "404.html"];

for (const page of pages) {
  const file = path.join(root, page);
  if (!fs.existsSync(file)) { fail(`${page}: file not found`); continue; }
  const html = fs.readFileSync(file, "utf8");

  // 1. every local asset reference must exist on disk — catches a typo'd
  //    path or a renamed/deleted file before it ships as a broken image
  //    or a silently-missing script.
  const refs = [...html.matchAll(/(?:src|href)="((?:assets\/|robots\.txt|sitemap\.xml)[^"]*)"/g)].map((m) => m[1]);
  let missing = 0;
  for (const ref of refs) {
    const clean = ref.split("?")[0].split("#")[0];
    if (!fs.existsSync(path.join(root, clean))) { fail(`${page}: missing local asset "${ref}"`); missing++; }
  }
  if (!missing) ok(`${page}: ${refs.length} local asset reference(s) resolve`);

  // 2. no duplicate ids — this codebase leans hard on getElementById /
  //    querySelector('#id'); a duplicate silently breaks whichever one
  //    isn't first in the DOM, with no error anywhere.
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const seen = new Set(), dupes = new Set();
  for (const id of ids) { if (seen.has(id)) dupes.add(id); seen.add(id); }
  if (dupes.size) fail(`${page}: duplicate id(s): ${[...dupes].join(", ")}`);
  else ok(`${page}: no duplicate ids (${ids.length} checked)`);

  // 3. every internal #anchor href must point at an id that exists.
  const anchors = [...html.matchAll(/href="#([a-zA-Z0-9_-]+)"/g)].map((m) => m[1]);
  const idSet = new Set(ids);
  let brokenAnchors = 0;
  for (const a of anchors) {
    if (!idSet.has(a)) { fail(`${page}: href="#${a}" has no matching id="${a}"`); brokenAnchors++; }
  }
  if (anchors.length && !brokenAnchors) ok(`${page}: ${anchors.length} internal anchor(s) resolve`);

  // 4. inline JSON-LD, if present, must actually be valid JSON.
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  for (const [, block] of ld) {
    try { JSON.parse(block); ok(`${page}: JSON-LD is valid JSON`); }
    catch (e) { fail(`${page}: JSON-LD is not valid JSON — ${e.message}`); }
  }
}

if (failed) { console.error("\nOne or more checks failed."); process.exit(1); }
console.log("\nAll checks passed.");
