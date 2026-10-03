# Store listing

Texts for the Chrome Web Store and addons.mozilla.org (AMO).

## English

**Name:** OSM Smart Menu

**Summary** (Chrome Web Store: max. 132 characters):

> Open the place you’re looking at in other maps: OpenStreetMap, Google Maps, Bing, satellite imagery, street photos and OSM editors.

**Description:**

> Looking at a place on Google Maps and want to see it on OpenStreetMap, in recent satellite imagery or in street photos? OSM Smart Menu takes you there in one click, at the same position and zoom.
>
> Click the toolbar button on a map page — or on a Wikipedia article with coordinates — and the extension reads where you are and lists the maps and tools that can open that same place:
>
> • General maps: OpenStreetMap, Google Maps, Bing Maps, openrouteservice, cartes.gouv.fr
> • Imagery and street photos: Copernicus (Sentinel-2), Esri Wayback, Google Street View, Mapillary, Panoramax, Wikimedia Commons photos
> • Thematic maps: CyclOSM, OpenTopoMap, OpenRailwayMap, Waymarked Trails, OpenSeaMap and more
>
> For OpenStreetMap contributors, it goes further: it also understands OSM nodes, ways, relations, changesets, users and tags, and opens them in the community's tools:
>
> • Editors: iD, Rapid, JOSM (via remote control), Level0
> • History and changes: OSMCha, OSM Deep History, WHODIDIT, How did you contribute
> • Data quality: Osmose, OSM Inspector, Relation Analyzer
> • Data tools: Overpass Turbo, GeoHack
>
> You can search the list, turn tools on or off, reorder them, add your own links with URL templates, and export your settings to another browser.
>
> Privacy: the extension only reads the current tab when you click its button. It collects no data, and its only network request of its own is the command sent to JOSM on your computer when you choose the JOSM link.
>
> Open source (GPL-3.0): https://github.com/erickdeoliveiraleal/osm-smart-menu
> Originally created by João Guilherme Packer.
>
> The OpenStreetMap logo is a trademark of the OpenStreetMap Foundation. This project is not endorsed by or affiliated with the OpenStreetMap Foundation.

**Category:** Chrome Web Store: Tools · AMO: Search Tools, Other

**Permissions justification** (Chrome Web Store):

- `activeTab`: reads the URL and page of the current tab, only when the user clicks the toolbar button, to detect the map position or OpenStreetMap element.
- `scripting`: injects a small script in the current tab, only after that click, to read map permalinks from the page.
- `storage`: saves which tools are enabled, their order and the user's custom links.

**Single purpose** (Chrome Web Store):

> Open the map position or OpenStreetMap element shown in the current tab in other map websites and OpenStreetMap tools.

## Português (Brasil)

**Resumo:**

> Abra o lugar que você está vendo em outros mapas: OpenStreetMap, Google Maps, Bing, satélite, fotos de rua e editores do OSM.

**Descrição:**

> Está vendo um lugar no Google Maps e quer vê-lo no OpenStreetMap, em imagens de satélite recentes ou em fotos de rua? O OSM Smart Menu leva você até lá com um clique, na mesma posição e zoom.
>
> Clique no botão da extensão numa página de mapa — ou num artigo da Wikipedia com coordenadas — e ela identifica onde você está e lista os mapas e ferramentas que abrem esse mesmo lugar:
>
> • Mapas gerais: OpenStreetMap, Google Maps, Bing Maps, openrouteservice, cartes.gouv.fr
> • Imagens e fotos de rua: Copernicus (Sentinel-2), Esri Wayback, Google Street View, Mapillary, Panoramax, fotos do Wikimedia Commons
> • Mapas temáticos: CyclOSM, OpenTopoMap, OpenRailwayMap, Waymarked Trails, OpenSeaMap e outros
>
> Para quem contribui com o OpenStreetMap, ela vai além: também entende nós, vias, relações, conjuntos de alterações, usuários e etiquetas do OSM e os abre nas ferramentas da comunidade:
>
> • Editores: iD, Rapid, JOSM (por controle remoto), Level0
> • Histórico e alterações: OSMCha, OSM Deep History, WHODIDIT, How did you contribute
> • Qualidade dos dados: Osmose, OSM Inspector, Relation Analyzer
> • Ferramentas de dados: Overpass Turbo, GeoHack
>
> Você pode buscar na lista, ativar ou desativar ferramentas, reordená-las, criar seus próprios links com modelos de URL e exportar suas configurações para outro navegador.
>
> Privacidade: a extensão só lê a aba atual quando você clica no botão dela. Ela não coleta dados, e a única requisição de rede própria é o comando enviado ao JOSM no seu computador quando você escolhe o link do JOSM.
>
> Código aberto (GPL-3.0): https://github.com/erickdeoliveiraleal/osm-smart-menu
> Criada originalmente por João Guilherme Packer.

## Screenshots

Chrome Web Store: 1280×800. Rendered images in [docs/store](store/) (`node docs/store/render.js`):

1. Popup on openstreetmap.org showing the detected position and the grouped tools
2. Popup on a user page (OSMCha, How did you contribute, Osmose by user)
3. Search filtering the list (e.g. "satellite")
4. Options page with categories, descriptions and the settings backup
5. Popup on Google Maps: jump to OpenStreetMap, editors and imagery
