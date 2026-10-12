// Renders addon/icons/icon-*.png from the SVG sources with headless Chrome. Run from the repo root: node scripts/render-icons.js
// icon-small.svg (simplified) is used up to 32 px, icon.svg above. Also renders docs/store/store-icon.png for the
// Chrome Web Store: 128 px with the artwork at 96 px and a transparent margin, as its image guidelines ask.
const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const chrome = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const profile = path.join(os.tmpdir(), "osm-icons-chrome-profile"); // never the user's own profile
const outputs = [16, 32, 48, 96, 128].map((size) => ({ size, artwork: size, file: `addon/icons/icon-${size}.png` }));
outputs.push({ size: 128, artwork: 96, file: "docs/store/store-icon.png" });

for (const { size, artwork, file } of outputs) {
  const svg = fs.readFileSync(path.join("addon/icons", size <= 32 ? "icon-small.svg" : "icon.svg"), "utf8");
  const page = path.join(os.tmpdir(), `osm-icon-${path.basename(file)}.html`);
  // draws the SVG on a canvas of the exact size and prints the PNG as a data URL in the page
  fs.writeFileSync(page, `<body><script>
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = ${size};
      canvas.getContext("2d").drawImage(img, ${(size - artwork) / 2}, ${(size - artwork) / 2}, ${artwork}, ${artwork});
      document.body.textContent = "PNG:" + canvas.toDataURL("image/png");
    };
    img.src = "data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}";
  </script></body>`);
  const dom = execFileSync(chrome, ["--headless", `--user-data-dir=${profile}`, "--virtual-time-budget=3000", "--dump-dom", "file:///" + page.split(path.sep).join("/")], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  const match = dom.match(/PNG:data:image\/png;base64,([A-Za-z0-9+/=]+)/);
  if (!match) throw new Error(`no image for ${file}`);
  fs.writeFileSync(file, Buffer.from(match[1], "base64"));
  console.log(file);
}
