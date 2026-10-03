// Serves the built extension (addon/) plus a page that fakes the WebExtension APIs, to preview the popup and options in a normal browser.
// Usage: npm run build, then: node scripts/preview-server.js addon 5199
// Open http://localhost:5199/harness?page=popup&locale=en&tab=<url of the page to simulate> (or page=options).
// Extra parameters: query=<text typed in the search>, fail=1 (the browser API fails), hang=1 (the page never answers).
const http = require("http");
const fs = require("fs");
const path = require("path");

const addonDir = path.resolve(process.argv[2]);
const port = Number(process.argv[3] || 5199);
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".json": "application/json", ".png": "image/png" };

function fakeApis(locale, tabUrl, page) {
  const messages = JSON.parse(fs.readFileSync(path.join(addonDir, "_locales", locale, "messages.json"), "utf8"));
  const fallback = JSON.parse(fs.readFileSync(path.join(addonDir, "_locales", "en", "messages.json"), "utf8"));
  return `<script>
  const messages = ${JSON.stringify(messages)};
  const fallback = ${JSON.stringify(fallback)};
  const store = {};
  const area = {
    get: async (k) => k === null ? { ...store } : (typeof k === "string" ? (k in store ? { [k]: store[k] } : {}) : {}),
    set: async (o) => { Object.assign(store, JSON.parse(JSON.stringify(o))); },
    remove: async (k) => { for (const x of [].concat(k)) delete store[x]; },
    clear: async () => { for (const x in store) delete store[x]; },
  };
  function getMessage(name, subs) {
    if (name === "@@bidi_end_edge") return "right";
    const m = messages[name] || fallback[name];
    if (!m) return "";
    subs = [].concat(subs ?? []);
    let text = m.message;
    for (const [ph, def] of Object.entries(m.placeholders || {})) {
      const value = def.content.replace(/\\$(\\d)/g, (_, i) => subs[i - 1] ?? "");
      text = text.replace(new RegExp("\\\\$" + ph + "\\\\$", "gi"), value);
    }
    return text.replace(/\\$(\\d)/g, (_, i) => subs[i - 1] ?? "");
  }
  const tabUrl = ${JSON.stringify(tabUrl)};
  globalThis.browser = globalThis.chrome = {
    runtime: { id: "harness", getManifest: () => (${JSON.stringify({ version: JSON.parse(fs.readFileSync(path.join(addonDir, "manifest.json"), "utf8")).version })}), openOptionsPage: () => console.log("openOptionsPage"), onInstalled: { addListener() {} }, onMessage: { addListener() {} } },
    i18n: { getMessage },
    storage: { sync: area, local: area },
    tabs: {
      query: async () => { if (location.search.includes("fail=1")) throw new Error("simulated failure"); return [{ id: 1, url: tabUrl, title: "Harness tab" }]; },
      sendMessage: async (_id, msg) => location.search.includes("hang=1") ? new Promise(() => {}) : msg.candidateSiteIds.length ? msg.candidateSiteIds.map((siteId) => ({ siteId })) : [{ permalink: tabUrl }],
      create: async ({ url }) => console.log("open", url),
    },
    scripting: { executeScript: async () => [] },
  };
  // ?query=… types a search after the page renders (for screenshots)
  const q = new URLSearchParams(location.search).get("query");
  if (q) { const t = setInterval(() => { const i = document.querySelector("input[type=search]"); if (i) { clearInterval(t); i.value = q; i.dispatchEvent(new Event("input", { bubbles: true })); } }, 50); }
</script>`;
}

http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/harness") {
    const page = url.searchParams.get("page") || "popup";
    const locale = url.searchParams.get("locale") || "en";
    const tabUrl = url.searchParams.get("tab") || "https://www.openstreetmap.org/#map=15/-15.7939/-47.8828";
    const html = fs.readFileSync(path.join(addonDir, page, "index.html"), "utf8")
      .replace("<head>", "<head><base href=\"/" + page + "/\">" + fakeApis(locale, tabUrl, page));
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    return res.end(html);
  }
  const file = path.join(addonDir, decodeURIComponent(url.pathname));
  if (!file.startsWith(addonDir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); return res.end("not found");
  }
  res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log("harness on http://localhost:" + port));
