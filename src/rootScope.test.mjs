import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
const config = read("../tailwind.config.js");
const app = read("./App.jsx");
const css = read("./App.css");

// Option A (CEO, 2026-10-17): every utility is emitted as `.r-dashboard .x`, so another remote's plain `.x` (equal specificity,
// loaded later) can never override this remote's sm:/lg:/xl: variants. The wrapper has no box of its own (display: contents).
test("tailwind scopes every utility under .r-dashboard", () => {
  assert.match(config, /important:\s*["']\.r-dashboard["']/);
});

test("App wraps everything it renders (i18n, routes) in the .r-dashboard root", () => {
  assert.match(app, /className="r-dashboard"/);
  const open = app.indexOf('className="r-dashboard"');
  assert.ok(open < app.indexOf("<I18nProvider"), "the i18n provider is inside the root");
  assert.ok(open < app.indexOf("<AppRoutes"), "routes are inside the root");
});

test("the root adds no layout box", () => {
  assert.match(css, /\.r-dashboard\s*\{\s*display:\s*contents;?\s*\}/);
});

test("the global '#root { overflow: hidden }' rule is kept as it was (not part of this change)", () => {
  assert.match(css, /#root\s*\{\s*overflow:\s*hidden;?\s*\}/);
});

function sources(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...sources(p));
    else if (/\.(jsx?|tsx?)$/.test(name) && !name.endsWith(".test.mjs")) out.push(p);
  }
  return out;
}

test("nothing portals outside the root (portal list for Dashboard: none)", () => {
  const text = sources(fileURLToPath(new URL(".", import.meta.url)))
    .map((p) => readFileSync(p, "utf8"))
    .join("\n");
  assert.doesNotMatch(text, /createPortal|menuPortalTarget|document\.body\.(appendChild|append|insertBefore)/);
});
