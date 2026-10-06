import { findSiteCandidates, getRelevantSites, pickWinningCandidate } from "./sites-manipulation-helper";
import { SiteConfiguration } from "../storage/config-handler";
import { Sites, OsmAttribute, zoomFromGoogleMeters, boxAround, viewBounds, Bounds } from "../sites-configuration";

const aDefaultSiteConfig: SiteConfiguration = {
  id: 'test1',
  isEnabled: true,
  defaultConfiguration: {
    link: 'example.com',
    category: 'tools',
    paramOpts: [{ ordered: "/#map={zoom}/{lat}/{lon}" }],
  }
};

describe(findSiteCandidates.name, () => {
  test('empty input gives empty output', () => {
    expect(findSiteCandidates([aDefaultSiteConfig], '')).toEqual([]);
  });
  test('empty url finds nothing', () => {
    expect(findSiteCandidates([aDefaultSiteConfig], '')).toEqual([]);
  });
  test('chrome://home url finds nothing', () => {
    expect(findSiteCandidates([aDefaultSiteConfig], 'chrome://home/')).toEqual([]);
  });
  test('finds a site with same domain', () => {
    expect(findSiteCandidates([aDefaultSiteConfig], 'http://example.com/map?zoom=1&lat=2&lon=3')).toEqual([aDefaultSiteConfig.id]);
  });
  test('finds a site with domainRegexp', () => {
    const siteConfigWithAdjustment: SiteConfiguration = {
      ...aDefaultSiteConfig,
      defaultConfiguration: { ...aDefaultSiteConfig.defaultConfiguration!, domainRegexp: /example\.com\.[a-z]{2}$/ },
    };
    expect(findSiteCandidates([siteConfigWithAdjustment], 'http://example.com.br/map?zoom=1&lat=2&lon=3')).toEqual([aDefaultSiteConfig.id]);
  });
  test('does not get a site that doesn\'t match domainRegexp', () => {
    const siteConfigWithAdjustment: SiteConfiguration = {
      ...aDefaultSiteConfig,
      defaultConfiguration: { ...aDefaultSiteConfig.defaultConfiguration!, domainRegexp: /www\.example\.com$/ },
    };
    expect(findSiteCandidates([siteConfigWithAdjustment], 'http://example.com/map?zoom=1&lat=2&lon=3')).toEqual([]);
  });
  test('finds the Copernicus Browser on both of its domains', () => {
    const copernicus: SiteConfiguration = { id: 'sentinelhub', isEnabled: true, defaultConfiguration: Sites['sentinelhub'] };
    expect(findSiteCandidates([copernicus], 'https://browser.dataspace.copernicus.eu/?zoom=7&lat=51&lng=11')).toEqual(['sentinelhub']);
    expect(findSiteCandidates([copernicus], 'https://dataspace.copernicus.eu/browser/?zoom=7&lat=51&lng=11')).toEqual(['sentinelhub']);
  });
  test('get user url template that that includes domain', () => {
    const configUrlPat: SiteConfiguration = {
      id: 'url-pat',
      isEnabled: true,
      customPattern: { tag: 'user-v1', url: 'https://www.example.com/map?zoom={zoom}&lat={latitude}&lon={longitude}' },
    };
    expect(findSiteCandidates([configUrlPat], 'http://example.com/map?zoom=1&lat=2&lon=3')).toEqual([configUrlPat.id]);
  });
  const knownGoogleDomains = [
    '.com', '.ad', '.ae', '.com.af', '.com.ag', '.com.ai', '.am', '.co.ao', '.com.ar', '.as', '.com.uy', '.com.na',
    '.at', '.com.au', '.az', '.ba', '.com.bd', '.com.my', '.co.mz', '.be', '.bf', '.bg', '.com.bh', '.bi', '.bj',
    '.com.bn', '.com.bo', '.com.br', '.bs', '.co.bw', '.by', '.com.bz', '.ca', '.cd', '.cf', '.cg', '.ch', '.com.ph',
    '.ci', '.co.ck', '.cl', '.cm', '.cn', '.com.co', '.co.cr', '.com.cu', '.cv', '.com.cy', '.cz', '.de', '.dj', '.dk',
    '.dm', '.com.do', '.dz', '.com.ec', '.ee', '.com.eg', '.es', '.com.et', '.fi', '.com.fj', '.fm', '.fr', '.ga',
    '.ge', '.gg', '.com.gh', '.com.gi', '.gl', '.gm', '.gp', '.gr', '.com.gt', '.gy', '.com.hk', '.hn', '.hr', '.ht',
    '.hu', '.co.id', '.ie', '.co.il', '.im', '.co.in', '.iq', '.is', '.it', '.je', '.com.jm', '.jo', '.co.jp', '.co.ke',
    '.com.kh', '.ki', '.kg', '.co.kr', '.com.kw', '.kz', '.la', '.com.lb', '.li', '.lk', '.co.ls', '.lt', '.lu', '.lv',
    '.com.ly', '.co.ma', '.md', '.me', '.mg', '.mk', '.ml', '.mn', '.ms', '.com.mt', '.mu', '.mv', '.mw', '.com.mx',
    '.com.nf', '.com.ng', '.com.ni', '.ne', '.nl', '.no', '.com.np', '.nr', '.nu', '.co.nz', '.com.om', '.com.pa', '.com.pe',
    '.com.pk', '.pl', '.pn', '.com.pr', '.ps', '.pt', '.com.py', '.com.qa', '.ro', '.ru', '.rw', '.com.sa', '.com.sb', '.sc',
    '.se', '.com.sg', '.sh', '.si', '.sk', '.com.sl', '.sn', '.so', '.sm', '.st', '.com.sv', '.td', '.tg', '.co.th',
    '.com.tj', '.tk', '.tl', '.tm', '.tn', '.to', '.com.tr', '.tt', '.com.tw', '.co.tz', '.com.ua', '.co.ug', '.co.uk',
    '.co.uz', '.com.vc', '.co.ve', '.vg', '.co.vi', '.com.vn', '.vu', '.ws', '.rs', '.co.za', '.co.zm', '.co.zw', '.cat', '.xxx',
  ];
  test('known google domains properly match current google configuration', () => {
    knownGoogleDomains.forEach(domain => {
      const inputUrl = `https://www.google${domain}/maps`;
      const googleConfiguration = { id: 'googlemaps', isEnabled: true, defaultConfiguration: Sites['googlemaps'] };
      expect(findSiteCandidates([googleConfiguration], inputUrl)).toEqual(['googlemaps']);
    });
  });
});

describe(pickWinningCandidate.name, () => {
  test('empty input gives empty output', () => {
    expect(pickWinningCandidate([], [], '')).toBeUndefined();
  });
  test('picks a site', () => {
    const inputAttributes = [{ siteId: aDefaultSiteConfig.id, additionalAttributes: { zoom: '1', lat: '2', lon: '3' } }];
    const expectedOutput = { siteId: aDefaultSiteConfig.id, attributes: inputAttributes[0].additionalAttributes };
    expect(pickWinningCandidate([aDefaultSiteConfig], inputAttributes, 'https://example.com/')).toEqual(expectedOutput);
  });
  const userUrlTemplateTests: { exampleUrl: string; urlTemplate: string; expectedAttrs: Partial<Record<OsmAttribute, string>>; }[] = [
    {
      exampleUrl: 'https://geohack.toolforge.org/geohack.php?params=23.00_N_24.43_E',
      urlTemplate: 'https://geohack.toolforge.org/geohack.php?params={latitude}_N_{longitude}_E',
      expectedAttrs: { lon: '24.43', lat: '23.00' },
    },
    {
      exampleUrl: 'https://hiking.waymarkedtrails.org/#route?id=2966504&map=3!23.0!24.1',
      urlTemplate: 'https://hiking.waymarkedtrails.org/#route?id={osm_relation_id}',
      expectedAttrs: { relationId: '2966504' },
    },
    {
      exampleUrl: 'https://hiking.waymarkedtrails.org/#route?id=10534456&map=14!58.4593!11.4308',
      urlTemplate: 'https://hiking.waymarkedtrails.org/#route?id={osm_relation_id}&map={zoom}!{latitude}!{longitude}',
      expectedAttrs: { relationId: '10534456', zoom: '14', lat: '58.4593', lon: '11.4308' },
    },
    {
      exampleUrl: 'https://disfactory.tw/#map=16.00/120.1/23.23400000000001',
      urlTemplate: 'https://disfactory.tw/#map={zoom}/{longitude}/{latitude}',
      expectedAttrs: { zoom: '16.00', lon: '120.1', lat: '23.23400000000001' },
    },
    {
      exampleUrl: 'https://taginfo.openstreetmap.org/keys/ref:isil',
      urlTemplate: 'https://taginfo.openstreetmap.org/keys/{osm_tag_key}',
      expectedAttrs: { key: 'ref:isil' },
    },
    {
      exampleUrl: 'https://taginfo.openstreetmap.org/tags/parking=surface',
      urlTemplate: 'https://taginfo.openstreetmap.org/tags/{osm_tag_key}={osm_tag_value}',
      expectedAttrs: { key: 'parking', value: 'surface' },
    },
    {
      exampleUrl: 'https://wiki.openstreetmap.org/wiki/Key:amenity',
      urlTemplate: 'https://wiki.openstreetmap.org/wiki/Key:{osm_tag_key}',
      expectedAttrs: { key: 'amenity' },
    },
    {
      exampleUrl: 'https://wiki.openstreetmap.org/wiki/Tag:amenity%3Ddrinking_water',
      urlTemplate: 'https://wiki.openstreetmap.org/wiki/Tag:{osm_tag_key}%3D{osm_tag_value}',
      expectedAttrs: { key: 'amenity', value: 'drinking_water' },
    },
  ];
  userUrlTemplateTests.forEach((testParams) => {
    test(`get parameters from url ${testParams.exampleUrl}`, () => {
      const inputConfig: SiteConfiguration = { id: 'user-pattern', isEnabled: true, customPattern: { tag: 'user-v1', url: testParams.urlTemplate} };
      const expectedOutput = { siteId: inputConfig.id, attributes: testParams.expectedAttrs };
      expect(pickWinningCandidate([inputConfig], [{ siteId: inputConfig.id }], testParams.exampleUrl)).toEqual(expectedOutput);
    });
  });
  test('get osmchangetiles from weird url', () => {
    const expectedSiteId = 'osmchangetiles';
    const inputConfig = { isEnabled: true, id: expectedSiteId, defaultConfiguration: Sites[expectedSiteId]}
    const inputUrl = 'https://resultmaps.neis-one.org/osm-change-tiles?quadkey=1202200110303320#16/48.7537/2.3536';
    const expectedOutput = { siteId: expectedSiteId, attributes:{ zoom: '16', lat: '48.7537', lon: '2.3536' } };
    expect(pickWinningCandidate([inputConfig], [{ siteId: expectedSiteId }], inputUrl)).toEqual(expectedOutput);
  });
  test('get google from weird url', () => {
    const expectedSiteId = 'googlemaps';
    const inputConfig = { isEnabled: true, id: expectedSiteId, defaultConfiguration: Sites[expectedSiteId]}
    const inputUrl = "https://www.google.com.tw/maps/place/24%C2%B010'54.1%22N+120%C2%B051'58.2%22E/@24.18169,120.86617,17z/data=!3m1!4b1!4m5!3m4!1s0x0:0x0!8m2!3d24.18169!4d120.86617";
    const expectedOutput = { siteId: expectedSiteId, attributes: { zoom: '17', lat: '24.18169', lon: '120.86617' } };
    expect(pickWinningCandidate([inputConfig], [{ siteId: expectedSiteId }], inputUrl)).toEqual(expectedOutput);
  });
  test(`get parameters from a url and not the permalink`, () => {
    const inputConfig: SiteConfiguration = { id: 'url-not-permalink', isEnabled: true, customPattern: { tag: 'user-v1', url: 'https://wiki.openstreetmap.org/wiki/Key:{osm_tag_key}' } };
    const pageInput = [{ siteId: inputConfig.id, permalink: 'https://wiki.openstreetmap.org/w/index.php?title=Key:name&oldid=2013483' }];
    const expectedOutput = { siteId: inputConfig.id, attributes: { key: 'name'} };
    expect(pickWinningCandidate([inputConfig], pageInput, 'https://wiki.openstreetmap.org/wiki/Key:name')).toEqual(expectedOutput);
  });
  test(`recognize parameters from 'osmose'`, () => {
    const id = 'osmose'
    const inputConfig: SiteConfiguration = { id, isEnabled: true, defaultConfiguration: Sites[id] };
    const expectedOutputAttributes = { zoom: '18', lat: '48.439383', lon: '-4.416006'};
    expect(pickWinningCandidate([inputConfig], [{}], 'http://osmose.openstreetmap.fr/en/map/#item=7130&zoom=18&lat=48.439383&lon=-4.416006&level=1%2C2%2C3&tags=&fixable=')!.attributes).toEqual(expectedOutputAttributes);
  });
  const coordinateSitesTests: { id: string; url: string; zoom: string }[] = [
    { id: 'rapideditor', url: 'https://rapideditor.org/edit#map=17.00/-15.7939/-47.8828', zoom: '17.00' },
    { id: 'waymarkedtrailsHiking', url: 'https://hiking.waymarkedtrails.org/#?map=14/-15.7939/-47.8828', zoom: '14' },
    { id: 'waymarkedtrailsHiking', url: 'https://hiking.waymarkedtrails.org/#route?id=2966504&map=14.0/-15.7939/-47.8828', zoom: '14.0' },
    { id: 'wikimap', url: 'https://wikimap.toolforge.org/?wp=false&cluster=false&zoom=14&lat=-15.7939&lon=-47.8828', zoom: '14' },
    { id: 'americana', url: 'https://americanamap.org/#map=13/-15.7939/-47.8828', zoom: '14' },
    { id: 'cyclosm', url: 'https://www.cyclosm.org/#map=14/-15.7939/-47.8828/cyclosm', zoom: '14' },
    { id: 'openskimap', url: 'https://openskimap.org/?obj=abc#12.5/-15.7939/-47.8828', zoom: '13.5' },
    { id: 'opentrailmap', url: 'https://opentrailmap.us/#map=13/-15.7939/-47.8828&mode=foot', zoom: '14' },
    { id: 'openwhatevermap', url: 'https://openwhatevermap.xyz/#14/-15.7939/-47.8828', zoom: '14' },
    { id: 'osm411', url: 'https://osm411.org/#map=14/-15.7939/-47.8828', zoom: '14' },
    { id: 'overture', url: 'https://explore.overturemaps.org/?feature=x#13/-15.7939/-47.8828', zoom: '14' },
    { id: 'panoramax', url: 'https://api.panoramax.xyz/pt-BR/index#focus=map&map=16/-15.7939/-47.8828', zoom: '17' },
    { id: 'openrailwaymap', url: 'https://www.openrailwaymap.org/?lat=-15.7939&lon=-47.8828&zoom=14', zoom: '14' },
    { id: 'cartesgouvfr', url: 'https://cartes.gouv.fr/explorer-les-cartes/?c=-47.8828%2C-15.7939&z=14', zoom: '14' },
    { id: 'whodidit', url: 'https://simon04.dev.openstreetmap.org/whodidit/?zoom=14&lat=-15.7939&lon=-47.8828&layers=BTT', zoom: '14' },
    { id: 'esriwayback', url: 'https://livingatlas.arcgis.com/wayback/#mapCenter=-47.8828%2C-15.7939%2C14&mode=explore&active=26334', zoom: '14' },
    { id: 'sentinelhub', url: 'https://browser.dataspace.copernicus.eu/?zoom=14&lat=-15.7939&lng=-47.8828&themeId=DEFAULT-THEME&datasetId=S2_L2A_CDAS&cloudCoverage=30', zoom: '14' },
    { id: 'sentinelhub', url: 'https://dataspace.copernicus.eu/browser/?zoom=14&lat=-15.7939&lng=-47.8828&datasetId=S2_L2A_CDAS', zoom: '14' },
  ];
  coordinateSitesTests.forEach(({ id, url, zoom }) => {
    test(`recognize coordinates from '${id}'`, () => {
      const inputConfig: SiteConfiguration = { id, isEnabled: true, defaultConfiguration: Sites[id] };
      expect(pickWinningCandidate([inputConfig], [{ siteId: id }], url)!.attributes).toEqual({ zoom, lat: '-15.7939', lon: '-47.8828' });
    });
  });

  describe('zoom', () => {
    test('with zoomAdjustment=1', () => {
      const inputAttributes = [{ siteId: aDefaultSiteConfig.id, additionalAttributes: { zoom: '1', lat: '2', lon: '3' } }];
      const siteConfigWithAdjustment: SiteConfiguration = {
        ...aDefaultSiteConfig,
        defaultConfiguration: { ...aDefaultSiteConfig.defaultConfiguration!, zoomAdjustment: 1 },
      };
      const expectedOutput = {
        siteId: aDefaultSiteConfig.id,
        attributes: { ...inputAttributes[0].additionalAttributes, zoom: '2' },
      };
      expect(pickWinningCandidate([siteConfigWithAdjustment], inputAttributes, 'https://example.com/')).toEqual(expectedOutput);
    });
    test('with zoomAdjustment=12', () => {
      const inputAttributes = [{ siteId: aDefaultSiteConfig.id, additionalAttributes: { zoom: '5', lat: '6', lon: '7' } }];
      const siteConfigWithAdjustment: SiteConfiguration = {
        ...aDefaultSiteConfig,
        defaultConfiguration: { ...aDefaultSiteConfig.defaultConfiguration!, zoomAdjustment: 12 },
      };
      const expectedOutput = {
        siteId: aDefaultSiteConfig.id,
        attributes: { ...inputAttributes[0].additionalAttributes, zoom: '17' },
      };
      expect(pickWinningCandidate([siteConfigWithAdjustment], inputAttributes, 'https://example.com/')).toEqual(expectedOutput);
    });
  });
});

describe(getRelevantSites.name, () => {
  const zll567_attributes = { zoom: '5', lat: '6', lon: '7' };

  test('empty input gives empty output', () => {
    expect(getRelevantSites([], '', {})).toEqual([]);
  });
  test('applies zoom,lat,lon to a site', () => {
    const expectedOutput = [{ id: aDefaultSiteConfig.id, url: 'https://example.com/#map=5/6/7' }];
    expect(getRelevantSites([aDefaultSiteConfig], '', zll567_attributes)).toEqual(expectedOutput);
  });
  test('applies changeset id to osm site', () => {
    const basicPattern: SiteConfiguration =
      {id: 'an-id', isEnabled: true, customName: 'a-name', defaultConfiguration: Sites.openstreetmap};
    const expectedOutput = [{ id: basicPattern.id, customName: basicPattern.customName, url: 'https://www.openstreetmap.org/changeset/83729'}];
    expect(getRelevantSites([basicPattern], '', { changesetId: '83729'})).toEqual(expectedOutput);
  });
  test('applies zoom,lat,lon to a user-v1 pattern', () => {
    const basicPattern: SiteConfiguration =
      {id: 'an-id', isEnabled: true, customName: 'a-name', customPattern:
        {tag: 'user-v1', url: 'https://www.openstreetmap.org/#map={zoom}/{latitude}/{longitude}'}};
    const expectedOutput = [{ id: basicPattern.id, customName: basicPattern.customName, url: 'https://www.openstreetmap.org/#map=5/6/7'}];
    expect(getRelevantSites([basicPattern], '', zll567_attributes)).toEqual(expectedOutput);
  });
  test('user-v1 pattern is case-sensitive', () => {
    const basicPattern: SiteConfiguration =
      {id: 'an-id', isEnabled: true, customName: 'a-name', customPattern:
        {tag: 'user-v1', url: 'https://www.waze.com/pt-BR/editor?env=row&lon={longitude}&lat={latitude}&zoom=7'}};
    const expectedOutput = [{ id: basicPattern.id, customName: basicPattern.customName, url: 'https://www.waze.com/pt-BR/editor?env=row&lon=7&lat=6&zoom=7'}];
    expect(getRelevantSites([basicPattern], '', zll567_attributes)).toEqual(expectedOutput);
  });
  const siteLinksTests: { id: string; attributes: Partial<Record<OsmAttribute, string>>; url: string }[] = [
    { id: 'rapideditor', attributes: zll567_attributes, url: 'https://rapideditor.org/edit#map=5/6/7' },
    { id: 'waymarkedtrailsHiking', attributes: zll567_attributes, url: 'https://hiking.waymarkedtrails.org/#?map=5/6/7' },
    { id: 'wikimap', attributes: zll567_attributes, url: 'https://wikimap.toolforge.org/?wp=false&cluster=false&zoom=5&lat=6&lon=7' },
    { id: 'level0', attributes: { changesetId: '123' }, url: 'http://level0.osmz.ru/?url=changeset/123' },
    { id: 'americana', attributes: zll567_attributes, url: 'https://americanamap.org/#map=4/6/7' },
    { id: 'cyclosm', attributes: zll567_attributes, url: 'https://www.cyclosm.org/#map=5/6/7/cyclosm' },
    { id: 'openskimap', attributes: zll567_attributes, url: 'https://openskimap.org/#4/6/7' },
    { id: 'opentrailmap', attributes: zll567_attributes, url: 'https://opentrailmap.us/#map=4/6/7' },
    { id: 'openwhatevermap', attributes: zll567_attributes, url: 'https://openwhatevermap.xyz/#5/6/7' },
    { id: 'osm411', attributes: zll567_attributes, url: 'https://osm411.org/#map=5/6/7' },
    { id: 'overture', attributes: zll567_attributes, url: 'https://explore.overturemaps.org/#4/6/7' },
    { id: 'panoramax', attributes: zll567_attributes, url: 'https://api.panoramax.xyz/#focus=map&map=4/6/7' },
    { id: 'openrailwaymap', attributes: zll567_attributes, url: 'https://www.openrailwaymap.org/?lat=6&lon=7&zoom=5' },
    { id: 'cartesgouvfr', attributes: zll567_attributes, url: 'https://cartes.gouv.fr/explorer-les-cartes/?c=7,6&z=5' },
    { id: 'whodidit', attributes: zll567_attributes, url: 'https://simon04.dev.openstreetmap.org/whodidit/?zoom=5&lat=6&lon=7' },
    { id: 'esriwayback', attributes: zll567_attributes, url: 'https://livingatlas.arcgis.com/wayback/#mapCenter=7,6,5' },
    { id: 'overpassturbo', attributes: zll567_attributes, url: 'https://overpass-turbo.eu/?C=6;7;5' },
    { id: 'geohack', attributes: zll567_attributes, url: 'https://geohack.toolforge.org/geohack.php?params=6;7' },
    { id: 'googlestreetview', attributes: zll567_attributes, url: 'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=6,7' },
    { id: 'openrouteservice', attributes: zll567_attributes, url: 'https://maps.openrouteservice.org/#/place/@7,6,5' },
    { id: 'josm', attributes: { nodeId: '123', ...zll567_attributes }, url: 'http://127.0.0.1:8111/load_object?objects=n123' },
    { id: 'josm', attributes: { relationId: '45' }, url: 'http://127.0.0.1:8111/load_object?objects=r45' },
    { id: 'osmchangesetmap', attributes: { changesetId: '83729' }, url: 'https://osmlab.github.io/changeset-map/#83729' },
    { id: 'osmosebyuser', attributes: { userName: 'someone' }, url: 'https://osmose.openstreetmap.fr/en/byuser/someone' },
  ];
  test('builds link to the Copernicus Browser with the last 90 days of imagery', () => {
    jest.useFakeTimers({ now: new Date('2026-10-03T12:00:00Z') });
    const config: SiteConfiguration = { id: 'sentinelhub', isEnabled: true, defaultConfiguration: Sites['sentinelhub'] };
    const url = 'https://browser.dataspace.copernicus.eu/?lat=6&lng=7&zoom=5&datasetId=S2_L2A_CDAS&layerId=1_TRUE_COLOR' +
      '&dateMode=MOSAIC&mosaickingOrder=leastCC&fromTime=2026-07-05T00%3A00%3A00.000Z&toTime=2026-10-03T23%3A59%3A59.999Z';
    expect(getRelevantSites([config], '', zll567_attributes)).toEqual([{ id: 'sentinelhub', url }]);
    jest.useRealTimers();
  });
  siteLinksTests.forEach(({ id, attributes, url }) => {
    test(`builds link to '${id}'`, () => {
      const config: SiteConfiguration = { id, isEnabled: true, defaultConfiguration: Sites[id] };
      expect(getRelevantSites([config], '', attributes)).toEqual([{ id, url }]);
    });
  });
  test('reads the user name from an osmcha filter', () => {
    const osmcha: SiteConfiguration = { id: 'osmcha', isEnabled: true, defaultConfiguration: Sites['osmcha'] };
    const url = 'https://osmcha.org/?filters=%7B%22users%22:[%7B%22label%22:%22Bruno%20Girard%22,%22value%22:%22Bruno%20Girard%22%7D]%7D';
    expect(pickWinningCandidate([osmcha], [{ siteId: 'osmcha' }], url)!.attributes).toEqual({ userName: 'Bruno Girard' });
  });
  test('user name with spaces is not encoded twice from osm.org to osmcha', () => {
    const osm: SiteConfiguration = { id: 'openstreetmap', isEnabled: true, defaultConfiguration: Sites['openstreetmap'] };
    const osmcha: SiteConfiguration = { id: 'osmcha', isEnabled: true, defaultConfiguration: Sites['osmcha'] };
    const { attributes } = pickWinningCandidate([osm], [{ siteId: 'openstreetmap' }], 'https://www.openstreetmap.org/user/Bruno%20Girard')!;
    expect(attributes).toEqual({ userName: 'Bruno Girard' });
    expect(getRelevantSites([osmcha], '', attributes)).toEqual([{
      id: 'osmcha',
      url: 'https://osmcha.org/?filters=%7B%22users%22:[%7B%22label%22:%22Bruno%20Girard%22,%22value%22:%22Bruno%20Girard%22%7D]%7D',
    }]);
  });

  describe('zoom', () => {
    test('with zoomAdjustment=1', () => {
      const expectedOutput = [{ id: aDefaultSiteConfig.id, url: 'https://example.com/#map=4/6/7' }];
      const siteConfigWithAdjustment: SiteConfiguration = {
        ...aDefaultSiteConfig,
        defaultConfiguration: { ...aDefaultSiteConfig.defaultConfiguration!, zoomAdjustment: 1 },
      };
      expect(getRelevantSites([siteConfigWithAdjustment], '', zll567_attributes)).toEqual(expectedOutput);
    });
    test('with zoomAdjustment=3', () => {
      const expectedOutput = [{ id: aDefaultSiteConfig.id, url: 'https://example.com/#map=2/6/7' }];
      const siteConfigWithAdjustment: SiteConfiguration = {
        ...aDefaultSiteConfig,
        defaultConfiguration: { ...aDefaultSiteConfig.defaultConfiguration!, zoomAdjustment: 3 },
      };
      expect(getRelevantSites([siteConfigWithAdjustment], '', zll567_attributes)).toEqual(expectedOutput);
    });
    test('with maxZoom smaller than zoom', () => {
      const expectedOutput = [{ id: aDefaultSiteConfig.id, url: 'https://example.com/#map=3/6/7' }];
      const siteConfigWithAdjustment: SiteConfiguration = {
        ...aDefaultSiteConfig,
        defaultConfiguration: { ...aDefaultSiteConfig.defaultConfiguration!, maxZoom: 3 },
      };
      expect(getRelevantSites([siteConfigWithAdjustment], '', zll567_attributes)).toEqual(expectedOutput);
    });
    test('with maxZoom greater than zoom', () => {
      const expectedOutput = [{ id: aDefaultSiteConfig.id, url: 'https://example.com/#map=5/6/7' }];
      const siteConfigWithAdjustment: SiteConfiguration = {
        ...aDefaultSiteConfig,
        defaultConfiguration: { ...aDefaultSiteConfig.defaultConfiguration!, maxZoom: 6 },
      };
      expect(getRelevantSites([siteConfigWithAdjustment], '', zll567_attributes)).toEqual(expectedOutput);
    });
    test('with maxZoom greater than a decimal zoom', () => {
      const expectedOutput = [{ id: aDefaultSiteConfig.id, url: 'https://example.com/#map=9.2109/6/7' }];
      const siteConfigWithAdjustment: SiteConfiguration = {
        ...aDefaultSiteConfig,
        defaultConfiguration: { ...aDefaultSiteConfig.defaultConfiguration!, maxZoom: 10 },
      };
      const input = { ...zll567_attributes, zoom: '9.2109' };
      expect(getRelevantSites([siteConfigWithAdjustment], '', input)).toEqual(expectedOutput);
    });

    test('with maxZoom equal to zoom', () => {
      const expectedOutput = [{ id: aDefaultSiteConfig.id, url: 'https://example.com/#map=5/6/7' }];
      const siteConfigWithAdjustment: SiteConfiguration = {
        ...aDefaultSiteConfig,
        defaultConfiguration: { ...aDefaultSiteConfig.defaultConfiguration!, maxZoom: 5 },
      };
      expect(getRelevantSites([siteConfigWithAdjustment], '', zll567_attributes)).toEqual(expectedOutput);
    });
    test('with maxZoom greater than zoom AND zoomAdjustment', () => {
      const expectedOutput = [{ id: aDefaultSiteConfig.id, url: 'https://example.com/#map=2/6/7' }];
      const siteConfigWithAdjustment: SiteConfiguration = {
        ...aDefaultSiteConfig,
        defaultConfiguration: { ...aDefaultSiteConfig.defaultConfiguration!, maxZoom: 3, zoomAdjustment: 3 },
      };
      expect(getRelevantSites([siteConfigWithAdjustment], '', zll567_attributes)).toEqual(expectedOutput);
    });
  });
});

describe('JOSM with coordinates', () => {
  const josm: SiteConfiguration = { id: 'josm', isEnabled: true, defaultConfiguration: Sites['josm'] };
  const josmview: SiteConfiguration = { id: 'josmview', isEnabled: true, defaultConfiguration: Sites['josmview'] };
  const query = (b: Bounds) => `left=${b.left.toFixed(6)}&right=${b.right.toFixed(6)}&top=${b.top.toFixed(6)}&bottom=${b.bottom.toFixed(6)}`;
  const brasilia = { lat: '-15.7939', lon: '-47.8828', viewWidth: '1280', viewHeight: '800' };

  test('downloads the visible area when it is small', () => {
    const view = viewBounds(-15.7939, -47.8828, 18, '1280', '800');
    expect(getRelevantSites([josm], '', { ...brasilia, zoom: '18' }))
      .toEqual([{ id: 'josm', url: `http://127.0.0.1:8111/load_and_zoom?${query(view)}` }]);
  });
  test('downloads at most 400 m to each side of the position', () => {
    const nearby = boxAround(-15.7939, -47.8828, 400);
    const expected = [{ id: 'josm', url: `http://127.0.0.1:8111/load_and_zoom?${query(nearby)}` }];
    expect(getRelevantSites([josm], '', { ...brasilia, zoom: '8' })).toEqual(expected);
    expect(getRelevantSites([josm], '', { lat: '-15.7939', lon: '-47.8828' })).toEqual(expected);
  });
  test('limits only the side that is too large', () => {
    // at zoom 17, a wide and short tab shows more than 400 m to the sides, but less above and below
    const view = viewBounds(-15.7939, -47.8828, 17, '2000', '400');
    const nearby = boxAround(-15.7939, -47.8828, 400);
    const expected = { left: nearby.left, right: nearby.right, top: view.top, bottom: view.bottom };
    expect(getRelevantSites([josm], '', { ...brasilia, zoom: '17', viewWidth: '2000', viewHeight: '400' }))
      .toEqual([{ id: 'josm', url: `http://127.0.0.1:8111/load_and_zoom?${query(expected)}` }]);
  });
  test('moves the view to the visible area at any zoom, without downloading', () => {
    const view = viewBounds(-15.7939, -47.8828, 9, '1280', '800');
    expect(getRelevantSites([josmview], '', { ...brasilia, zoom: '9' }))
      .toEqual([{ id: 'josmview', url: `http://127.0.0.1:8111/zoom?${query(view)}` }]);
  });
  test('moving the view needs a zoom', () => {
    expect(getRelevantSites([josmview], '', { lat: '-15.7939', lon: '-47.8828' })).toEqual([]);
    expect(getRelevantSites([josmview], '', { nodeId: '123' })).toEqual([]);
  });
});

describe(viewBounds.name, () => {
  test('the whole world fits in one tile at zoom 0', () => {
    const b = viewBounds(0, 0, 0, '256', '256');
    expect(b.left).toBeCloseTo(-180);
    expect(b.right).toBeCloseTo(180);
    expect(b.top).toBeCloseTo(85);
    expect(b.bottom).toBeCloseTo(-85);
  });
  test('matches the scale of osm.org at zoom 18', () => {
    // 156543.03 m per pixel at zoom 0 on the equator × cos(latitude) ÷ 2^18
    const b = viewBounds(-15.7939, -47.8828, 18, '1000', '1000');
    const metersPerPixel = 156543.03 * Math.cos(-15.7939 * Math.PI / 180) / 2 ** 18;
    const widthInMeters = (b.right - b.left) * 111320 * Math.cos(-15.7939 * Math.PI / 180);
    expect(widthInMeters / metersPerPixel).toBeCloseTo(1000, -1);
    expect((b.top + b.bottom) / 2).toBeCloseTo(-15.7939, 3);
  });
});

describe(boxAround.name, () => {
  const distance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    // haversine, in meters
    const r = 6371008.8, rad = Math.PI / 180;
    const a = Math.sin((lat2 - lat1) * rad / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin((lon2 - lon1) * rad / 2) ** 2;
    return 2 * r * Math.asin(Math.sqrt(a));
  };
  test.each([[0, 10], [-15.7939, -47.8828], [60.17, 24.94]])('reaches 200 m to each side at %s, %s', (lat, lon) => {
    const box = boxAround(lat, lon, 200);
    expect(distance(lat, lon, Number(box.top), lon)).toBeCloseTo(200, -1);
    expect(distance(lat, lon, Number(box.bottom), lon)).toBeCloseTo(200, -1);
    expect(distance(lat, lon, lat, Number(box.right))).toBeCloseTo(200, -1);
    expect(distance(lat, lon, lat, Number(box.left))).toBeCloseTo(200, -1);
  });
});

describe(zoomFromGoogleMeters.name, () => {
  // values written by Google Maps (satellite view) for a known zoom, measured in a real browser
  test.each([
    [3665, 0, 768, 15],
    [3527, -15.7939, 768, 15],
    [112849, -15.7939, 768, 10],
    [441, -15.7939, 768, 18],
    [1823, 60.17, 768, 15],
    [2386, 0, 500, 15],
  ])('%sm at latitude %s with a %spx window is zoom %s', (meters, lat, height, zoom) => {
    expect(zoomFromGoogleMeters(meters, lat, height)).toBe(zoom);
  });
  test('rejects invalid values', () => {
    expect(zoomFromGoogleMeters(0, 0, 768)).toBeUndefined();
    expect(zoomFromGoogleMeters(100, 0, 0)).toBeUndefined();
  });
});

test('goes from the Google Maps satellite view straight to Bing with the right zoom', () => {
  const google: SiteConfiguration = { id: 'googlemaps', isEnabled: true, defaultConfiguration: Sites['googlemaps'] };
  const bing: SiteConfiguration = { id: 'bingmaps', isEnabled: true, defaultConfiguration: Sites['bingmaps'] };
  const url = 'https://www.google.com/maps/@-15.7939,-47.8828,3527m/data=!3m1!1e3?entry=ttu';
  // the zoom comes from the content script, which knows the window height
  const { attributes } = pickWinningCandidate([google], [{ siteId: 'googlemaps', additionalAttributes: { zoom: '15' } }], url)!;
  expect(attributes).toEqual({ lat: '-15.7939', lon: '-47.8828', zoom: '15' });
  expect(getRelevantSites([bing], 'googlemaps', attributes)).toEqual([
    { id: 'bingmaps', url: expect.stringContaining('cp=-15.7939~-47.8828&lvl=15') },
  ]);
});

test('reads positions from Wikipedia and Wikidata pages but never offers them as a link', () => {
  const wikimedia: SiteConfiguration = { id: 'wikimedia', isEnabled: true, defaultConfiguration: Sites['wikimedia'] };
  expect(findSiteCandidates([wikimedia], 'https://pt.wikipedia.org/wiki/Bras%C3%ADlia')).toEqual(['wikimedia']);
  expect(findSiteCandidates([wikimedia], 'https://www.wikidata.org/wiki/Q2844')).toEqual(['wikimedia']);
  const attributes = { lat: '-15.7939', lon: '-47.8828', zoom: '12' };
  expect(pickWinningCandidate([wikimedia], [{ siteId: 'wikimedia', additionalAttributes: attributes }], 'https://pt.wikipedia.org/wiki/Bras%C3%ADlia')!.attributes).toEqual(attributes);
  expect(getRelevantSites([wikimedia], '', attributes)).toEqual([]);
});

test('opens the Historic Objects map in the browser language', () => {
  const historicmap: SiteConfiguration = { id: 'historicmap', isEnabled: true, defaultConfiguration: Sites['historicmap'] };
  const [link] = getRelevantSites([historicmap], '', { zoom: '5', lat: '6', lon: '7' });
  expect(link.url).toMatch(/^https:\/\/gk\.historic\.place\/historische_objekte\/l\/(de|en|fr|nl|pt-br|cs|es|gl|ro|tr|ru|da|pl|ja|hu|ko|uk)\/\?zoom=5&lat=6&lon=7$/);
});
