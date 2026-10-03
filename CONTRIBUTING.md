# Contributing

## Design principles
1. Focus on the OpenStreetMap Community
2. User autonomy
3. Inclusivity

## Initial setup
Install Node.js 20 or newer and run `npm install`.

## Build
Run `npm run build`.
A file will be created in `./web-ext-artifacts/`.

## Test
Run automated tests with `npm test`.

To test manually, first compile the TypeScript code with `npm run tscompile`, and then load the folder `./addon/` in [Firefox][firefox-load] and [Chrome][chrome-load].

[firefox-load]: https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/
[chrome-load]: https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked

## Develop
The main code is at `./src/`, and it is compiled to `./addon` (where the other assets are).

Take a look at `./addon/manifest.json` to find all entrypoints.

The VS Code IDE is recommended for this repository.

## Preview without installing
`scripts/preview-server.js` serves the built extension with a page that fakes the browser APIs, so the popup and the options page can be checked in any browser:

```
npm run tscompile
node scripts/preview-server.js addon 5199
```

Then open `http://localhost:5199/harness?page=popup&locale=en&tab=https://www.openstreetmap.org/%23map=15/-15.79/-47.88` (or `page=options`).

## Store images
The Chrome Web Store screenshots and promo tile in `docs/store/` are rendered from the real popup with `node docs/store/render.js` (needs the preview server running; set `CHROME` to the path of Chrome if it isn't the default one). Texts for the store listings are in `docs/store-listing.md`.
