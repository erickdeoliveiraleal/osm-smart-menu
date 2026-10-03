export const siteCategories = ["edit", "general", "thematic", "imagery", "history", "quality", "tools"] as const;
export type SiteCategory = typeof siteCategories[number];

export type DefaultSiteConfiguration = {
  link: string;
  category: SiteCategory;
  domainRegexp?: RegExp,
  paramOpts: ParamOpt[];
  extractors?: Extractors;
  disabledByDefault?: boolean;
  httpOnly?: boolean;
  // it's only necessary to specify `maxZoom` if the website
  // doesn't handle gracefully a `zoom` parameter above their range
  maxZoom?: number;
  // how much should be added to make this link's zoom level equivalent to OpenStreetMap's zoom level ?
  zoomAdjustment?: number;
  // query parameters that can't be fixed in `paramOpts` because they're computed when the link is built (e.g. dates relative to today)
  getDynamicQueryParameters?: (now: Date) => Record<string, string>;
  // builds the path when none of `paramOpts` can be used, for URLs that need computed values (e.g. a bounding box)
  buildPath?: (attributes: Partial<Record<OsmAttribute, string>>) => string | undefined;
  // the link is a command to a program on the user's computer (JOSM remote control), sent without opening a tab
  remoteControl?: boolean;
  // a website where positions are read but that isn't offered as a link (e.g. Wikipedia)
  sourceOnly?: boolean;
}

export type ParamOpt = {
  ordered: string;
  unordered?: Partial<Record<OsmAttribute, string>>;
}

export type Extractors = {
  getPermalink?: (document: Document) => string | undefined;
  getAttributesFromPage?: (window: Window) => Partial<Record<OsmAttribute, string>>;
};

export type OsmAttribute =
  | "nodeId" | "wayId" | "relationId"
  | "userName" | "changesetId" | "key" | "value"
  | "zoom" | "lat" | "lon" | "tracesId"
  ;

const urlPattern1: ParamOpt = { ordered: "/", unordered: { zoom: "zoom", lat: "lat", lon: "lon" } };

export const Sites: Record<string, DefaultSiteConfiguration> = {
  openstreetmap: {
    link: "www.openstreetmap.org",
    category: "general",
    //icon: "www.openstreetmap.org/favicon.ico", // TODO: I will need to pre-download this because otherwise I need additional security permissions in the CSP
    paramOpts: [ // TODO: should I add {domain} at the start? it may be useful for sites that add something in a subdomain
      { ordered: "/node/{nodeId}#map={zoom}/{lat}/{lon}" },
      { ordered: "/node/{nodeId}" },
      { ordered: "/way/{wayId}#map={zoom}/{lat}/{lon}" },
      { ordered: "/way/{wayId}" },
      { ordered: "/relation/{relationId}#map={zoom}/{lat}/{lon}" }, //TODO: should I create a space to allow the existence of other parameters? For example to recognize http://www.openstreetmap.org/way/263290462?locale=pt#map=17/-26.30144/-48.84531
      { ordered: "/relation/{relationId}" },
      { ordered: "/changeset/{changesetId}#map={zoom}/{lat}/{lon}" },
      { ordered: "/changeset/{changesetId}" },
      { ordered: "/user/{userName}/traces/{tracesId}" },
      { ordered: "/user/someone/traces/{tracesId}" }, //when there is no {userName} data, but there is {tracesId}, because the userName doesn't really matter here when going to this page
      { ordered: "/user/{userName}" },
      { ordered: "/#map={zoom}/{lat}/{lon}" },
      { ordered: "/", unordered: { lat: "mlat", lon: "mlon" } }
    ],
    extractors: {
      getAttributesFromPage: (window: Window): Partial<Record<OsmAttribute, string>> => {
        // e.g. https://www.openstreetmap.org/edit?editor=id#map=18/-7.57646/110.94519 or http://www.openstreetmap.org/way/263290462?locale=pt#map=17/-26.30144/-48.84531
        const matches = window.location.hash.match(/#map=([0-9.]+)\/([0-9.-]+)\/([0-9.-]+)/);
        if (matches) {
          const [, zoom, lat, lon ] = matches;
          if (zoom && lat && lon) {
            return { zoom, lat, lon };
          }
        }
        return {};
      }
    }
  },

  rapideditor: {
    link: "rapideditor.org",
    category: "edit",
    paramOpts: [
      { ordered: "/edit#map={zoom}/{lat}/{lon}" },   // set params
      { ordered: "/edit#id=n{nodeId}" },             // set params
      { ordered: "/edit#id=w{wayId}" },              // set params
      { ordered: "/edit#id=r{relationId}" },         // set params
      { ordered: "map={zoom}/{lat}/{lon}" },         // gather params
      { ordered: "id=n{nodeId}" },                   // gather params
      { ordered: "id=w{wayId}" },                    // gather params
      { ordered: "id=r{relationId}" }                // gather params
    ],
  },

  ideditor: {
    link: "www.openstreetmap.org/edit",
    category: "edit",
    paramOpts: [
      { ordered: "?editor=id#map={zoom}/{lat}/{lon}" },
      { ordered: "?editor=id&way={wayId}" },
      { ordered: "way={wayId}" },
      { ordered: "?editor=id&node={nodeId}" },
      { ordered: "node={nodeId}" },
      { ordered: "?editor=id&relation={relationId}" },
      { ordered: "relation={relationId}" },
      { ordered: "?editor=id&changeset={changesetId}" },
      { ordered: "changeset={changesetId}" },
      ],
  },

  opencyclemap: {
    link: "www.opencyclemap.org",
    category: "thematic",
    paramOpts: [urlPattern1],
    maxZoom: 18,
    extractors: {
      getPermalink: getPermalinkBySelector("a#permalink")
    },
  },

  cyclosm: {
    link: "www.cyclosm.org",
    category: "thematic",
    paramOpts: [
      { ordered: "/#map={zoom}/{lat}/{lon}/cyclosm" },
      { ordered: "map={zoom}/{lat}/{lon}" }, // input-only
    ],
  },

  hotmap: {
    link: "map.hotosm.org",
    category: "thematic",
    httpOnly: true,
    paramOpts: [
      { ordered: "/#{zoom}/{lat}/{lon}" },
      { ordered: "#{zoom}/{lat}/{lon}" }, // input-only
    ],
  },

  openseamap: {
    link: "map.openseamap.org",
    category: "thematic",
    paramOpts: [urlPattern1],
    maxZoom: 18,
    extractors: {
      getPermalink: openLayers_getPermalink()
    },
  },

  opensnowmap: {
    link: "www.opensnowmap.org",
    category: "thematic",
    paramOpts: [urlPattern1],
    maxZoom: 18,
    extractors: {
      getPermalink: getPermalinkBySelector("a#permalink")
    },
  },

  sentinelhub: { // Sentinel Hub's EO Browser became the Copernicus Browser; id kept to preserve user settings
    link: "browser.dataspace.copernicus.eu",
    category: "imagery",
    domainRegexp: /(^|\.)dataspace\.copernicus\.eu$/, // also matches the older dataspace.copernicus.eu/browser/
    paramOpts: [
      { ordered: "/", unordered: { "lat": "lat", "lon": "lng", "zoom": "zoom" }},
    ],
    // without a time range only the base map is shown; the site accepts at most 180 days
    getDynamicQueryParameters: (now: Date) => ({
      datasetId: "S2_L2A_CDAS",
      layerId: "1_TRUE_COLOR",
      dateMode: "MOSAIC",
      mosaickingOrder: "leastCC",
      fromTime: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) + "T00:00:00.000Z",
      toTime: now.toISOString().slice(0, 10) + "T23:59:59.999Z",
    }),
  },

  mapcompare: {
    link: "mc.bbbike.org",
    category: "tools",
    paramOpts: [
      { ordered: "/mc/", unordered: urlPattern1.unordered },
    ],
    extractors: {
      getPermalink: getPermalinkBySelector('[id*=permalink i] a'),
    },
  },

  openstreetbrowser: {
    link: "openstreetbrowser.org",
    category: "thematic",
    maxZoom: 20,
    paramOpts: [
      { ordered: "/#map={zoom}/{lat}/{lon}" },
      { ordered: "map={zoom}/{lat}/{lon}" }, // input-only
    ],
  },

  osmcha: {
    link: 'osmcha.org',
    category: "history",
    paramOpts: [
      { ordered: "/changesets/{changesetId}" },
      { ordered: "/?filters=%7B%22users%22:[%7B%22label%22:%22{userName}%22,%22value%22:%22{userName}%22%7D]%7D" },
    ],
  },

  pewuosmhistory: {
    link: 'pewu.github.io',
    category: "history",
    paramOpts: [
      { ordered: '/osm-history/#/node/{nodeId}' },
      { ordered: '/osm-history/#/way/{wayId}' },
      { ordered: '/osm-history/#/relation/{relationId}' },
    ]
  },

  osmchangesetmap: {
    link: 'osmlab.github.io/changeset-map',
    category: "history",
    paramOpts: [
      { ordered: '/#{changesetId}' },
    ],
  },

  osmdeephistory: {
    link: "osmlab.github.io/osm-deep-history",
    category: "history",
    paramOpts: [
      { ordered: "/#/node/{nodeId}" },
      { ordered: "/#/way/{wayId}" },
      { ordered: "/#/relation/{relationId}" }
    ]
  },

  deepdiff: {
    link: "osm.mapki.com",
    category: "history",
    httpOnly: true,
    paramOpts: [
      { ordered: "/history/node.php", unordered: { nodeId: "id" } },
      { ordered: "/history/way.php", unordered: { wayId: "id" } },
      { ordered: "/history/relation.php", unordered: { relationId: "id" } }
    ]
  },

  osmhistoryviewer: {
    link: "osmhv.openstreetmap.de",
    category: "history",
    paramOpts: [
      { ordered: "/changeset.jsp", unordered: { changesetId: "id" } },
      { ordered: "/blame.jsp", unordered: { relationId: "id" } }
    ],
    extractors: {
      //TODO: getValues - we can get userName if it's a changeset analysis and maybe map coordinates on both cases
    },
  },

  overpassturbo: { // the site doesn't keep the position in its URL, so it's a link target only
    link: "overpass-turbo.eu",
    category: "tools",
    paramOpts: [
      { ordered: "/?C={lat};{lon};{zoom}" },
    ],
  },

  geohack: {
    link: "geohack.toolforge.org",
    category: "tools",
    paramOpts: [
      { ordered: "/geohack.php?params={lat};{lon}" },
    ],
  },

  wikimap: { // nearby Wikimedia Commons photos
    link: "wikimap.toolforge.org",
    category: "imagery",
    paramOpts: [
      { ordered: "/?wp=false&cluster=false&zoom={zoom}&lat={lat}&lon={lon}" },
      { ordered: "/", unordered: { zoom: "zoom", lat: "lat", lon: "lon" } }, // input-only
    ],
  },

  wikimedia: { // reads coordinates from Wikipedia articles and Wikidata items
    link: "www.wikipedia.org",
    domainRegexp: /(^|\.)(wikipedia|wikidata|wikivoyage)\.org$/,
    category: "tools",
    sourceOnly: true,
    paramOpts: [],
    extractors: {
      getAttributesFromPage: (window: Window) => wikimediaCoordinates(window.document) ?? {},
    },
  },

  overpassapi: {
    link: "overpass-api.de/achavi",
    category: "history",
    paramOpts: [
      { ordered: "/", unordered: { changesetId: "changeset", zoom: "zoom", lat: "lat", lon: "lon" } },
      { ordered: "/", unordered: { changesetId: "changeset" } }
    ],
    extractors: {
      getPermalink: openLayers_getPermalink(),
      //TODO: getValues - we can get userName if it's a changeset analysis and maybe map coordinates on both cases
    },
  },

  howdidyoucontribute: {
    link: "hdyc.neis-one.org",
    category: "history",
    paramOpts: [
      { ordered: "/?{userName}" }
    ],
    extractors: {
      getPermalink: getPermalinkBySelector('a[href*="//hdyc.neis-one.org/?"]'),
    },
  },

  whodidit: {
    link: "simon04.dev.openstreetmap.org",
    category: "history",
    paramOpts: [
      { ordered: "/whodidit/", unordered: { zoom: "zoom", lat: "lat", lon: "lon" } },
    ],
  },

  osmchangeviz: {
    link: "resultmaps.neis-one.org",
    category: "history",
    paramOpts: [
      { ordered: "/osm-change-viz?c={changesetId}" },
      { ordered: "/osm-change-viz.php?c={changesetId}" },
    ]
  },

  openptmap: {
    link: "www.openptmap.org",
    category: "thematic",
    httpOnly: true,
    paramOpts: [urlPattern1],
    maxZoom: 17,
    extractors: {
      getPermalink: openLayers_getPermalink()
    },
  },

  opnvkarte: {
    link: "xn--pnvkarte-m4a.de",
    category: "thematic",
    paramOpts: [
      { ordered: "/#{lon};{lat};{zoom}" },
      urlPattern1,
    ],
    extractors: {
      getPermalink: getPermalinkBySelector("a#editLink"),
    },
  },

  stamen: { // Note: no permalink, so if an user enters into the site by a link without parameters and doesn't move around at least once, then we don't have access to current coordinates
    link: "maps.stamen.com",
    category: "thematic",
    httpOnly: true,
    paramOpts: [
      { ordered: "/#toner/{zoom}/{lat}/{lon}" }, // Did not find a generic URL (without choosing theme). This theme was chosen because it seems to have the highest zoom capacity
      { ordered: "/#terrain/{zoom}/{lat}/{lon}" },
      { ordered: "/#watercolor/{zoom}/{lat}/{lon}" },
      { ordered: "/{zoom}/{lat}/{lon}" }, // input-only
    ]
  },

  f4map: {
    link: "demo.f4map.com",
    category: "thematic",
    paramOpts: [
      { ordered: "/#lat={lat}&lon={lon}&zoom={zoom}" } //there are other attributes that can be added if another website with 3D rendering shows up: &camera.theta=57.319&camera.phi=-2.005
    ]
  },

  osmbuildings: {
    link: "osmbuildings.org",
    category: "thematic",
    paramOpts: [
      urlPattern1, //TODO: &tilt=45&rotation=168
    ],
    disabledByDefault: true, // zoom starts only at level 15
  },

  openlevelup: {
    link: "openlevelup.net",
    category: "thematic",
    paramOpts: [
      { ordered: "/#{zoom}/{lat}/{lon}" },
      { ordered: "/old/", unordered: { "zoom": "z", "lat": "lat", "lon": "lon" } },
      { ordered: "#{zoom}/{lat}/{lon}" }, // input-only
    ],
  },

  indoorequal: {
    link: "indoorequal.org",
    category: "thematic",
    paramOpts: [
      { ordered: "/#map={zoom}/{lat}/{lon}" },
      { ordered: "map={zoom}/{lat}/{lon}" }, // input-only
    ],
    zoomAdjustment: +1,
  },

  umap: {
    link: "umap.openstreetmap.fr",
    category: "tools",
    paramOpts: [
      { ordered: "/map/new/#{zoom}/{lat}/{lon}" },
      { ordered: "#{zoom}/{lat}/{lon}" }, // input-only
    ],
    extractors: {
      getAttributesFromPage: (window: Window) => {
        const url = new URL(window.document.location.href);
        if (url){
          const matchArray = url.hash.match(/#([0-9.]+)\/([0-9.-]+)\/([0-9.-]+)/);
          if (matchArray) {
            const [, zoom, lat, lon] = matchArray;
            if (typeof zoom === "string" && typeof lat === "string" && typeof lon === "string") {
              return { zoom, lat, lon };
            }
          }
        }
        return {};
      },
    },
  },

  openstreetcam: {
    link: 'kartaview.org',
    category: "imagery",
    paramOpts: [
      { ordered: '/map/@{lat},{lon},{zoom}z' },
      { ordered: '@{lat},{lon},{zoom}z' }, // input-only
    ],
    zoomAdjustment: +1,
  },

  googlestreetview: { // opens the nearest panorama
    link: "www.google.com",
    category: "imagery",
    paramOpts: [
      { ordered: "/maps/@?api=1&map_action=pano&viewpoint={lat},{lon}" },
    ],
  },

  mapillary: {
    link: "www.mapillary.com",
    category: "imagery",
    paramOpts: [
      { ordered: "/app", unordered: { zoom: "z", lat: "lat", lon: "lng" } }
    ],
    zoomAdjustment: +1,
  },

  panoramax: {
    link: "api.panoramax.xyz",
    category: "imagery",
    paramOpts: [
      { ordered: "/#focus=map&map={zoom}/{lat}/{lon}" },
      { ordered: "map={zoom}/{lat}/{lon}" }, // input-only
    ],
    zoomAdjustment: +1,
  },

  esriwayback: {
    link: "livingatlas.arcgis.com",
    category: "imagery",
    paramOpts: [
      { ordered: "/wayback/#mapCenter={lon},{lat},{zoom}" },
      { ordered: "mapCenter={lon}%2C{lat}%2C{zoom}" }, // input-only
    ],
  },

  opentopomap: {
    link: "www.opentopomap.org",
    category: "thematic",
    paramOpts: [
      { ordered: "/#map={zoom}/{lat}/{lon}" },
      { ordered: "/#marker={zoom}/{lat}/{lon}" },
      { ordered: "{zoom}/{lat}/{lon}" }, // input-only
    ],
  },

  historicmap: {
    link: `gk.historic.place/historische_objekte/l/${historicMapLanguage()}`,
    category: "thematic",
    paramOpts: [urlPattern1],
    maxZoom: 19,
    extractors: {
      getPermalink: getPermalinkBySelector("a#permalink")
    },
  },

  openrailwaymap: {
    link: "www.openrailwaymap.org",
    category: "thematic",
    paramOpts: [
      { ordered: "/", unordered: { lat: "lat", lon: "lon", zoom: "zoom" } },
    ],
  },

  openinframap: {
    link: 'openinframap.org',
    category: "thematic",
    paramOpts: [
      { ordered: '/#{zoom}/{lat}/{lon}' },
      { ordered: '#{zoom}/{lat}/{lon}' }, // input-only
    ],
    zoomAdjustment: +1,
  },

  americana: {
    link: 'americanamap.org',
    category: "thematic",
    paramOpts: [
      { ordered: '/#map={zoom}/{lat}/{lon}' },
      { ordered: 'map={zoom}/{lat}/{lon}' }, // input-only
    ],
    zoomAdjustment: +1,
  },

  cartesgouvfr: { // successor of the French Geoportail; it removes the parameters from the URL after loading
    link: "cartes.gouv.fr",
    category: "general",
    paramOpts: [
      { ordered: "/explorer-les-cartes/?c={lon},{lat}&z={zoom}" },
      { ordered: "c={lon}%2C{lat}&z={zoom}" }, // input-only
    ],
  },

  openrouteservice: {
    link: "maps.openrouteservice.org",
    category: "general",
    paramOpts: [
      { ordered: "/#/place/@{lon},{lat},{zoom}" },
    ],
  },

  bingmaps: {
    link: "www.bing.com",
    category: "general",
    paramOpts: [
      { ordered: "/maps?cp={lat}~{lon}&lvl={zoom}" },
      { ordered: "cp={lat}~{lon}&lvl={zoom}" }, // input-only
    ],
    extractors: {
      getAttributesFromPage: (window: Window) => {
        // Known bug:
        // If the user enters into bing.com/maps (i.e. without parameters) and doesn't move the
        //    map around at least once, this script won't be able to extract any information.
        if (window.history && window.history.state && window.history.state) {
          // wrappedJSObject is a security feature from Firefox
          const whs = window.history.state.wrappedJSObject || window.history.state;
          if (whs && whs.state && whs.state.MapModeStateHistory) {
            const m = whs.state.MapModeStateHistory;
            if (m.level && typeof m.level === "number" && m.centerPoint && m.centerPoint.latitude && m.centerPoint.longitude
              && typeof m.centerPoint.latitude === "number" && typeof m.centerPoint.longitude === "number") {
              return {
                lat: m.centerPoint.latitude.toString(),
                lon: m.centerPoint.longitude.toString(),
                zoom: m.level.toString(),
              };
            }
          }
        }
        return {};
      }
    },
  },

  googlemaps: {
    link: "www.google.com", //redirected from maps.google.com
    category: "general",
    domainRegexp: /\.google\.(com?|cat|xxx|(com?\.)?[a-z]{2})$/,
    paramOpts: [
      { ordered: "/maps/@{lat},{lon},{zoom}z" },
      { ordered: "@{lat},{lon},{zoom}z" }, // input-only
      { ordered: "/maps/search/{lat},{lon}" },
      { ordered: "@{lat},{lon}," }, // input-only; recognize pattern @-8.5275,119.7458151,642m (zoom comes from the extractor below)
    ],
    extractors: {
      // the satellite view puts the visible height in meters in the URL instead of a zoom level
      getAttributesFromPage: (window: Window) => {
        const match = window.location.href.match(/@(-?[0-9.]+),(-?[0-9.]+),([0-9.]+)m(?![a-z])/);
        if (!match) return {};
        const zoom = zoomFromGoogleMeters(Number(match[3]), Number(match[1]), window.innerHeight);
        return zoom === undefined ? {} : { zoom: zoom.toString() };
      },
    },
  },

  waze: {
    link: "www.waze.com",
    category: "general",
    paramOpts: [
      { ordered: "/livemap/directions?latlng={lat}%2C{lon}" },
      { ordered: "/en/livemap/directions?latlng={lat}%2C{lon}" },
      { ordered: "latlng={lat}%2C{lon}" }, // input-only
      { ordered: "/editor", unordered: { lat: "lat", lon: "lon", zoom: "zoom" } },
    ],
    zoomAdjustment: +12,
    extractors: {
      getPermalink: getPermalinkBySelector("a.permalink"), // works in "editor" page i.e. https://www.waze.com/editor?env=row&lon=-49.24037&lat=-16.68915&s=70749461&zoom=
      getAttributesFromPage: (window: Window): Partial<Record<OsmAttribute, string>> => {
        const latLngElement = window.document.querySelector('.wm-attribution-control__latlng');
        if (latLngElement) {
          // works in "livemap" page i.e. https://www.waze.com/livemap/directions?latlng=52.514%2C13.429
          const latLngText = latLngElement.textContent;
          if (latLngText) {
            const [lat, lon] = latLngText.split(" | ");
            if (lat && lon) return {
              lat,
              lon,
              zoom: '3', // zoom level when reloading page (approximately), minus `zoomAdjustment` attribute
            };
          }
        };
        return {};
      },
    },
  },

  stravaglobal: {
    link: "www.strava.com",
    category: "thematic",
    paramOpts: [
      { ordered: "/heatmap#{zoom}/{lon}/{lat}/hot/all" },
      { ordered: "#{zoom}/{lon}/{lat}" }, // input-only
    ],
    disabledByDefault: true,
  },

  josm: {
    link: "127.0.0.1:8111",
    category: "edit",
    httpOnly: true,
    remoteControl: true,
    paramOpts: [ // downloads only the element, not the whole visible area
      { ordered: "/load_object?objects=n{nodeId}" },
      { ordered: "/load_object?objects=w{wayId}" },
      { ordered: "/load_object?objects=r{relationId}" },
    ],
    buildPath: ({ lat, lon }) => {
      if (!lat || !lon) return undefined;
      // JOSM refuses to download large areas, so it downloads 200 m around the position
      const { left, right, top, bottom } = boxAround(Number(lat), Number(lon), 200);
      return `/load_and_zoom?left=${left}&right=${right}&top=${top}&bottom=${bottom}`;
    },
  },

  level0: {
    link: "level0.osmz.ru",
    category: "edit",
    httpOnly: true,
    paramOpts: [
      { ordered: "/?url=n{nodeId}" },
      { ordered: "/?url=w{wayId}!" },
      { ordered: "/?url=r{relationId}" },
      { ordered: "/?url=changeset/{changesetId}" },
      { ordered: "/?url=map={zoom}/{lat}/{lon}" },
      //In the future, there might be a permalink for the mini-map: https://github.com/Zverik/Level0/issues/16
    ],
    disabledByDefault: true, // not recommended for beginners
  },

  osmrelationanalyzer: {
    link: "ra.osmsurround.org",
    category: "quality",
    httpOnly: true,
    paramOpts: [
      { ordered: "/analyzeRelation", unordered: { relationId: "relationId" } }
    ],
    extractors: {
      //TODO: getValues - we can get userName if it's a changeset analysis and maybe map coordinates on both cases
    },
  },

  osmroutemanager: {
    link: "osmrm.openstreetmap.de",
    category: "quality",
    paramOpts: [
      { ordered: "/relation.jsp", unordered: { relationId: "id" } }
    ],
    extractors: {
      //TODO: getValues - get user that change this relation for the last time
    },
    disabledByDefault: true, // doesn't work for most relations
  },

  osmose: { // Note: has support for languages
    link: "osmose.openstreetmap.fr/map",
    category: "quality",
    paramOpts: [
      { ordered: "/#zoom={zoom}&lat={lat}&lon={lon}" },
      { ordered: "zoom={zoom}&lat={lat}&lon={lon}" }, // input-only
    ],
    extractors: {
      getPermalink: getPermalinkBySelector("[class*=permalink] a"),
      //TODO: getValues - get parameters from URL because there is a language prefix between /map and /#zoom
    },
  },

  osminspector: {
    link: "tools.geofabrik.de/osmi",
    category: "quality",
    paramOpts: [urlPattern1],
    maxZoom: 18,
    extractors: {
      getPermalink: getPermalinkBySelector("a#permalink")
    },
  },

  osmchangetiles: {
    link: "resultmaps.neis-one.org",
    category: "history",
    paramOpts: [
      { ordered: "/osm-change-tiles#{zoom}/{lat}/{lon}" },
      { ordered: "#{zoom}/{lat}/{lon}" }, // input-only
    ]
  },

  missingmaps: {
    link: "www.missingmaps.org",
    category: "history",
    paramOpts: [
      { ordered: "/users/#/{userName}" },
      { ordered: "/users/#/{userName}/badges" },
    ],
  },

  osmlanevisualizer: {
    link: "osm.mueschelsoft.de/lanes",
    category: "quality",
    paramOpts: [
      { ordered: "/", unordered: { "relationId": "relid" } },
      { ordered: "/", unordered: { "wayId": "wayid" } },
    ],
    httpOnly: true, // mini-map won't load in HTTPS
    disabledByDefault: true, // doesn't work for most relations
  },

  waymarkedtrailsHiking: {
    link: "hiking.waymarkedtrails.org",
    category: "thematic",
    paramOpts: [
      { ordered: "/#?map={zoom}/{lat}/{lon}" },
      { ordered: "map={zoom}/{lat}/{lon}" }, // input-only; also matches route pages (#route?id=…&map=…)
    ],
  },

  waymarkedtrailsCycling: {
    link: "cycling.waymarkedtrails.org",
    category: "thematic",
    paramOpts: [
      { ordered: "/#?map={zoom}/{lat}/{lon}" },
      { ordered: "map={zoom}/{lat}/{lon}" }, // input-only; also matches route pages (#route?id=…&map=…)
    ],
  },

  waymarkedtrailsMtb: {
    link: "mtb.waymarkedtrails.org",
    category: "thematic",
    paramOpts: [
      { ordered: "/#?map={zoom}/{lat}/{lon}" },
      { ordered: "map={zoom}/{lat}/{lon}" }, // input-only; also matches route pages (#route?id=…&map=…)
    ],
  },

  waymarkedtrailsSkating: {
    link: "skating.waymarkedtrails.org",
    category: "thematic",
    paramOpts: [
      { ordered: "/#?map={zoom}/{lat}/{lon}" },
      { ordered: "map={zoom}/{lat}/{lon}" }, // input-only; also matches route pages (#route?id=…&map=…)
    ],
  },

  waymarkedtrailsRiding: {
    link: "riding.waymarkedtrails.org",
    category: "thematic",
    paramOpts: [
      { ordered: "/#?map={zoom}/{lat}/{lon}" },
      { ordered: "map={zoom}/{lat}/{lon}" }, // input-only; also matches route pages (#route?id=…&map=…)
    ],
  },

  waymarkedtrailsSlopes: {
    link: "slopes.waymarkedtrails.org",
    category: "thematic",
    paramOpts: [
      { ordered: "/#?map={zoom}/{lat}/{lon}" },
      { ordered: "map={zoom}/{lat}/{lon}" }, // input-only; also matches route pages (#route?id=…&map=…)
    ],
  },

  osmosebyuser: {
    link: "osmose.openstreetmap.fr",
    category: "quality",
    paramOpts: [
      { ordered: "/en/byuser/{userName}" },
    ],
  },
};

/** Square extending `meters` to each side of the position. */
export function boxAround(lat: number, lon: number, meters: number): Record<"left" | "right" | "top" | "bottom", string> {
  const metersPerDegree = 111320; // of latitude, and of longitude on the equator
  const halfHeight = meters / metersPerDegree;
  const halfWidth = meters / (metersPerDegree * Math.max(Math.cos(lat * Math.PI / 180), 0.01));
  const round = (n: number) => n.toFixed(6);
  return {
    left: round(lon - halfWidth),
    right: round(lon + halfWidth),
    top: round(Math.min(lat + halfHeight, 85)),
    bottom: round(Math.max(lat - halfHeight, -85)),
  };
}

/**
 * Google Maps writes "@lat,lon,{meters}m" for the satellite view: the ground distance covered by the window height.
 * meters = 156543.03 (meters per pixel at zoom 0 on the equator) × cos(latitude) × window height ÷ 2^zoom
 */
export function zoomFromGoogleMeters(meters: number, lat: number, windowHeight: number): number | undefined {
  if (!(meters > 0) || !(windowHeight > 0) || !Number.isFinite(lat)) return undefined;
  const zoom = Math.log2(156543.03392 * Math.cos(lat * Math.PI / 180) * windowHeight / meters);
  return Math.min(Math.max(Math.round(zoom), 0), 22);
}

/** Language of the Historic Objects map, from the browser's language. */
function historicMapLanguage(): string {
  const supported = ["de", "en", "fr", "nl", "pt-br", "cs", "es", "gl", "ro", "tr", "ru", "da", "pl", "ja", "hu", "ko", "uk"];
  const language = (globalThis.navigator?.language ?? "en").toLowerCase();
  if (supported.includes(language)) return language;
  const base = language.split("-")[0];
  if (base === "pt") return "pt-br";
  return supported.includes(base) ? base : "en";
}

/**
 * Parses GeoHack "params", used by Wikipedia coordinate links, e.g. "48.8566;2.3522",
 * "48_51_24_N_2_21_03_E_type:city" or "-15.79_-47.88_region:BR".
 */
export function parseGeohackParams(params: string): { lat: number; lon: number; type?: string } | undefined {
  const [coordinates, ...rest] = params.split(/_(?=[a-z]+:)/i);
  const type = rest.map((p) => p.match(/^type:([a-z0-9]+)/i)?.[1]).find(Boolean);
  if (coordinates.includes(";")) {
    const [lat, lon] = coordinates.split(";").map(Number);
    return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon, type } : undefined;
  }
  const parts = coordinates.split("_").filter(Boolean);
  const latEnd = parts.findIndex((p) => /^[NS]$/i.test(p));
  if (latEnd === -1) {
    const [lat, lon] = parts.map(Number);
    return parts.length === 2 && Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon, type } : undefined;
  }
  const lonEnd = parts.findIndex((p, i) => i > latEnd && /^[EW]$/i.test(p));
  if (lonEnd === -1) return undefined;
  const toDecimal = (dms: string[], hemisphere: string) => {
    const [d = 0, m = 0, sec = 0] = dms.map(Number);
    const value = d + m / 60 + sec / 3600;
    return /^[SW]$/i.test(hemisphere) ? -value : value;
  };
  const lat = toDecimal(parts.slice(0, latEnd), parts[latEnd]);
  const lon = toDecimal(parts.slice(latEnd + 1, lonEnd), parts[lonEnd]);
  return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon, type } : undefined;
}

const zoomByGeohackType: Record<string, number> = {
  country: 5, state: 7, adm1st: 7, adm2nd: 9, adm3rd: 11, isle: 11, city: 12, mountain: 13, waterbody: 12, river: 12,
  airport: 14, railwaystation: 16, landmark: 17, edu: 17,
};

/** Coordinates of the current Wikidata item (property P625) or Wikipedia article. */
export function wikimediaCoordinates(document: Document): Partial<Record<OsmAttribute, string>> | undefined {
  // Wikidata: each P625 statement links to Special:Map/{zoom}/{lat}/{lon}; skip deprecated statements
  const statements = [...document.querySelectorAll("#P625 .wikibase-statementview")];
  const statement = statements.find((s) => !s.querySelector(".wikibase-rankselector-deprecated")) ?? statements[0];
  const mapLink = statement?.querySelector<HTMLAnchorElement>('a[href*="Special:Map/"]');
  const map = mapLink?.href.match(/Special:Map\/([0-9.]+)\/(-?[0-9.]+)\/(-?[0-9.]+)/);
  if (map) return { zoom: map[1], lat: map[2], lon: map[3] };

  // Wikipedia: the article's coordinates (shown next to the title) are either an interactive map link
  // with the position in data attributes (e.g. Portuguese Wikipedia) or a link to GeoHack (e.g. English Wikipedia)
  const mapLinkOfArticle = document.querySelector<HTMLElement>("#coordinates .mw-kartographer-maplink[data-lat][data-lon]");
  if (mapLinkOfArticle) {
    const { lat, lon, zoom } = mapLinkOfArticle.dataset;
    if (lat && lon) return { lat, lon, zoom: zoom || "15" };
  }
  const geohackLink = document.querySelector<HTMLAnchorElement>('#coordinates a[href*="geohack"], a[href*="geohack.toolforge.org"]');
  const params = geohackLink && new URL(geohackLink.href).searchParams.get("params");
  const position = params ? parseGeohackParams(params) : undefined;
  if (!position) return undefined;
  const zoom = (position.type && zoomByGeohackType[position.type.toLowerCase()]) || 15;
  return { lat: position.lat.toFixed(6), lon: position.lon.toFixed(6), zoom: zoom.toString() };
}

function getPermalinkBySelector(selector: string) {
  return function (document: Document) {
    const permalink = document.querySelector(selector) as HTMLAnchorElement;
    return permalink && permalink.href;
  }
}

function openLayers_getPermalink() {
  return getPermalinkBySelector("[id*=Permalink] a");
}
