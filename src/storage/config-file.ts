// Format of the settings file used to export and import the configuration (e.g. to move it to another browser).
// Kept free of browser APIs so it can be unit-tested.

export const configFileFormat = "osm-smart-menu-settings";
export const configFileVersion = 1;

export type StoredData = Record<string, unknown>;

export type ConfigFile = {
  format: typeof configFileFormat;
  version: number;
  data: StoredData;
};

const sitesOrderKey = "sites-order";
const siteKeyPrefix = "site_";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidSiteConfig(value: unknown): boolean {
  if (!isPlainObject(value)) return false;
  const { isEnabled, customName, customPattern } = value;
  if (isEnabled !== undefined && typeof isEnabled !== "boolean") return false;
  if (customName !== undefined && typeof customName !== "string") return false;
  if (customPattern !== undefined) {
    if (!isPlainObject(customPattern)) return false;
    if (customPattern.tag !== "user-v1" || typeof customPattern.url !== "string") return false;
  }
  return true;
}

/** Keeps only the keys this extension stores. */
export function toConfigFile(storedData: StoredData): ConfigFile {
  const data: StoredData = {};
  for (const [key, value] of Object.entries(storedData)) {
    if (key === sitesOrderKey || key.startsWith(siteKeyPrefix)) {
      data[key] = value;
    }
  }
  return { format: configFileFormat, version: configFileVersion, data };
}

/** Returns the data to store, or throws if the text isn't a valid settings file. */
export function parseConfigFile(text: string): StoredData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Not a JSON file");
  }
  if (!isPlainObject(parsed) || parsed.format !== configFileFormat) {
    throw new Error("Not an OSM Smart Menu settings file");
  }
  if (typeof parsed.version !== "number" || parsed.version > configFileVersion) {
    throw new Error("Unsupported settings file version");
  }
  if (!isPlainObject(parsed.data)) {
    throw new Error("Missing settings data");
  }

  const data: StoredData = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    if (key === sitesOrderKey) {
      if (!Array.isArray(value) || !value.every((id) => typeof id === "string")) {
        throw new Error(`Invalid value for "${key}"`);
      }
    } else if (key.startsWith(siteKeyPrefix)) {
      if (!isValidSiteConfig(value)) {
        throw new Error(`Invalid value for "${key}"`);
      }
    } else {
      continue; // ignore unknown keys
    }
    data[key] = value;
  }
  return data;
}
