import { readdirSync, readFileSync } from "fs";
import { join } from "path";

// The Chrome Web Store rejects packages where a translation lacks the name used in the manifest,
// and translations come from Weblate, so every locale is checked here.
const localesDir = join(__dirname, "..", "addon", "_locales");
const locales = readdirSync(localesDir);

describe.each(locales)("translation %s", (locale) => {
  const messages = JSON.parse(readFileSync(join(localesDir, locale, "messages.json"), "utf8"));

  test.each(["extensionName", "extensionShortName", "extensionDescription"])("has %s", (key) => {
    expect(typeof messages[key]?.message).toBe("string");
    expect(messages[key].message.trim()).not.toBe("");
  });

  test("description fits the Chrome Web Store limit of 132 characters", () => {
    expect(messages.extensionDescription.message.length).toBeLessThanOrEqual(132);
  });
});
