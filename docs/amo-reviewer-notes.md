# Notes for addons.mozilla.org reviewers

Paste in "Notes to Reviewer" when uploading a version. Upload `osm_smart_menu-<version>-source.zip`
(made with `git archive --format=zip HEAD`) as the source code.

```
The JavaScript files in the package are built from TypeScript and Svelte sources with webpack.
The output is not minified or mangled (Terser only removes unused code), but please use the
attached source archive to rebuild it.

Build steps (Node.js 24 LTS, npm 11; tested on Windows and Linux):
  npm ci
  npm run build
The package is created in web-ext-artifacts/osm_smart_menu-<version>.zip and is byte-for-byte
identical to the uploaded one.

Permissions: activeTab and scripting read the current tab only after the user clicks the toolbar
button, to detect the map position; storage keeps the user's settings. The only network request
made by the extension is to JOSM's remote control on 127.0.0.1:8111, when the user chooses the
JOSM link. No data is collected.

Source code and history: https://github.com/erickdeoliveiraleal/osm-smart-menu
This version continues the add-on originally made by jgpacker, who transferred the listing.
```
