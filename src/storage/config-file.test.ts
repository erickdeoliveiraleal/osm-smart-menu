import { configFileFormat, parseConfigFile, toConfigFile } from "./config-file";

const storedData = {
  "sites-order": ["1700000000000_https%3A%2F%2Fexample.com%2F%7Bzoom%7D", "openstreetmap", "ideditor"],
  "site_openstreetmap": { isEnabled: true },
  "site_ideditor": { isEnabled: false, customName: "iD" },
  "site_1700000000000_https%3A%2F%2Fexample.com%2F%7Bzoom%7D": {
    isEnabled: true,
    customName: "Example",
    customPattern: { tag: "user-v1", url: "https://example.com/{zoom}" },
  },
};

describe(toConfigFile.name, () => {
  test('keeps only the keys stored by this extension', () => {
    const file = toConfigFile({ ...storedData, "something-else": 1 });
    expect(file).toEqual({ format: configFileFormat, version: 1, data: storedData });
  });
});

describe(parseConfigFile.name, () => {
  test('round-trips an exported file', () => {
    expect(parseConfigFile(JSON.stringify(toConfigFile(storedData)))).toEqual(storedData);
  });
  test('ignores unknown keys', () => {
    const text = JSON.stringify({ format: configFileFormat, version: 1, data: { ...storedData, other: "x" } });
    expect(parseConfigFile(text)).toEqual(storedData);
  });
  test.each([
    ['not JSON', 'not json'],
    ['another JSON file', '{"name": "package"}'],
    ['a newer version', JSON.stringify({ format: configFileFormat, version: 99, data: {} })],
    ['missing data', JSON.stringify({ format: configFileFormat, version: 1 })],
    ['an invalid order', JSON.stringify({ format: configFileFormat, version: 1, data: { "sites-order": "osm" } })],
    ['an invalid site', JSON.stringify({ format: configFileFormat, version: 1, data: { "site_osm": { isEnabled: "yes" } } })],
    ['an invalid custom pattern', JSON.stringify({ format: configFileFormat, version: 1, data: { "site_x": { customPattern: { url: 1 } } } })],
  ])('rejects %s', (_description, text) => {
    expect(() => parseConfigFile(text)).toThrow();
  });
});
