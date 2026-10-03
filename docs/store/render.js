// Renders the Chrome Web Store images from docs/store/*.html with headless Chrome.
// Needs the preview server running (node scripts/preview-server.js addon 5199). Run from the repo root: node docs/store/render.js
const { execFileSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

const chrome = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const dir = path.resolve("docs/store");
const profile = path.join(os.tmpdir(), "osm-store-chrome-profile"); // never the user's own profile
const fileUrl = (p) => "file:///" + p.split(path.sep).join("/");
const harness = (q) => "http://localhost:5199/harness?" + new URLSearchParams(q).toString();

const shots = [
  {
    file: "screenshot-1-map.png",
    title: "Open the same place in other maps",
    subtitle: "On OpenStreetMap, Google Maps, Bing or a Wikipedia article, the extension detects the position and lists maps, satellite imagery, street photos and OSM editors that open right there.",
    frame: harness({ page: "popup", locale: "en", tab: "https://www.google.com/maps/@48.8584,2.2945,17z" }),
  },
  {
    file: "screenshot-2-user.png",
    title: "Works with OSM elements and users",
    subtitle: "On a node, way, relation, changeset or user page, it offers the tools that understand it, like OSMCha, Osmose or JOSM.",
    frame: harness({ page: "popup", locale: "en", tab: "https://www.openstreetmap.org/user/Bruno%20Girard" }),
    height: 520,
  },
  {
    file: "screenshot-3-search.png",
    title: "Find any tool quickly",
    subtitle: "Search by name, description or category.",
    frame: harness({ page: "popup", locale: "en", tab: "https://www.openstreetmap.org/#map=15/-15.7939/-47.8828", query: "satellite" }),
    height: 430,
  },
  {
    file: "screenshot-4-options.png",
    title: "Make it yours",
    subtitle: "Turn tools on or off, reorder them, add your own links and move your settings to another browser.",
    frame: harness({ page: "options", locale: "en" }),
    width: 620,
  },
];

function render(url, out, width, height, extra = []) {
  execFileSync(chrome, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-color-profile=srgb", "--force-device-scale-factor=1",
    "--blink-settings=preferredColorScheme=1", // light mode, whatever the system theme
    "--user-data-dir=" + profile, `--window-size=${width},${height}`, "--screenshot=" + out, ...extra, url,
  ], { stdio: "ignore" });
  console.log(path.basename(out), fs.statSync(out).size, "bytes");
}

for (const s of shots) {
  const query = new URLSearchParams({ title: s.title, subtitle: s.subtitle, frame: s.frame, width: s.width || 340, height: s.height || 640 });
  render(fileUrl(path.join(dir, "screenshot.html")) + "?" + query, path.join(dir, s.file), 1280, 800, ["--virtual-time-budget=6000"]);
}
render(fileUrl(path.join(dir, "promo-small.html")), path.join(dir, "promo-small.png"), 440, 280);
