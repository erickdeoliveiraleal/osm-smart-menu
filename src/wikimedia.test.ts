/**
 * @jest-environment jsdom
 */
import { parseGeohackParams, wikimediaCoordinates } from "./sites-configuration";

describe(parseGeohackParams.name, () => {
  test.each([
    ["48.8566;2.3522", 48.8566, 2.3522],
    ["-15.7939_-47.8828_region:BR", -15.7939, -47.8828],
    ["48_51_24_N_2_21_03_E_type:city", 48 + 51 / 60 + 24 / 3600, 2 + 21 / 60 + 3 / 3600],
    ["15_47_38.04_S_47_52_58.08_W", -(15 + 47 / 60 + 38.04 / 3600), -(47 + 52 / 60 + 58.08 / 3600)],
    ["22.9_S_43.2_W_type:landmark", -22.9, -43.2],
  ])("parses %s", (params, lat, lon) => {
    const position = parseGeohackParams(params)!;
    expect(position.lat).toBeCloseTo(lat, 6);
    expect(position.lon).toBeCloseTo(lon, 6);
  });
  test("reads the type", () => {
    expect(parseGeohackParams("48_51_24_N_2_21_03_E_type:city(2000000)_region:FR")!.type).toBe("city");
  });
  test("rejects text that isn't coordinates", () => {
    expect(parseGeohackParams("nowhere")).toBeUndefined();
    expect(parseGeohackParams("12_N_nothing")).toBeUndefined();
  });
});

describe(wikimediaCoordinates.name, () => {
  test("reads the first non-deprecated coordinate of a Wikidata item", () => {
    document.body.innerHTML = `
      <div id="P625">
        <div class="wikibase-statementview">
          <span class="wikibase-rankselector-deprecated"></span>
          <a href="https://www.wikidata.org/wiki/Special:Map/13/67.1/23.4/en">old</a>
        </div>
        <div class="wikibase-statementview">
          <a href="https://www.wikidata.org/wiki/Special:Map/13/67.199021557909/23.401880562603/en">map</a>
        </div>
      </div>`;
    expect(wikimediaCoordinates(document)).toEqual({ zoom: "13", lat: "67.199021557909", lon: "23.401880562603" });
  });
  test("reads the coordinates of a Wikipedia article, with a zoom from its type", () => {
    document.body.innerHTML = `
      <span id="coordinates">
        <a href="https://geohack.toolforge.org/geohack.php?pagename=Paris&params=48_51_24_N_2_21_03_E_type:city(2102650)_region:FR">48°51′24″N 2°21′03″E</a>
      </span>`;
    expect(wikimediaCoordinates(document)).toEqual({ lat: "48.856667", lon: "2.350833", zoom: "12" });
  });
  test("reads the coordinates of a Wikipedia article shown as an interactive map link", () => {
    // as on https://pt.wikipedia.org/wiki/Brasília
    document.body.innerHTML = `
      <span id="coordinates">
        <a class="mw-kartographer-maplink" href="/wiki/Especial:Map/13/-15.79389/-47.88278/pt" data-zoom="13" data-lat="-15.79389" data-lon="-47.88278">15° 47′ 38″ S, 47° 52′ 58″ O</a>
      </span>`;
    expect(wikimediaCoordinates(document)).toEqual({ lat: "-15.79389", lon: "-47.88278", zoom: "13" });
  });
  test("returns nothing on pages without coordinates", () => {
    document.body.innerHTML = `<p>No coordinates here</p>`;
    expect(wikimediaCoordinates(document)).toBeUndefined();
  });
});
