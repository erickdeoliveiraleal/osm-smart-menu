# Store listing

Texts for the Chrome Web Store and addons.mozilla.org (AMO).

## English

**Name:** OSM Smart Menu

**Summary** (Chrome Web Store: max. 132 characters):

> Open the place you're looking at in other OpenStreetMap maps, editors and analysis tools — at the same position and zoom.

**Description:**

> OSM Smart Menu helps OpenStreetMap contributors move between the community's maps and tools without losing their place.
>
> Click the toolbar button on a map page and the extension reads what you're looking at — the coordinates and zoom, or the OpenStreetMap node, way, relation, changeset, user or tag — and lists tools that can open that same thing:
>
> • Editors: iD, Rapid, JOSM, Level0
> • Thematic maps: CyclOSM, OpenTopoMap, OpenRailwayMap, Waymarked Trails, OpenSeaMap and more
> • Imagery and street photos: Copernicus (Sentinel-2), Esri Wayback, Mapillary, Panoramax, KartaView
> • History and changes: OSMCha, OSM Deep History, WHODIDIT, How did you contribute
> • Data quality: Osmose, OSM Inspector, Relation Analyzer
> • General maps: OpenStreetMap, Google Maps, Bing Maps, cartes.gouv.fr
>
> It works in both directions: from Google Maps or Bing you can jump straight to OpenStreetMap or an editor at the same place.
>
> You can search the list, turn tools on or off, reorder them, add your own links with URL templates, and export your settings to another browser.
>
> Privacy: the extension only reads the current tab when you click its button. It collects no data, and its only network request of its own is the command sent to JOSM on your computer when you choose the JOSM link.
>
> Open source (GPL-3.0): https://github.com/erickdeoliveiraleal/osm-smart-menu
> Originally created by João Guilherme Packer.
>
> The OpenStreetMap logo is a trademark of the OpenStreetMap Foundation, and is used with their permission. This project is not endorsed by or affiliated with the OpenStreetMap Foundation.

**Category:** Chrome Web Store: Tools · AMO: Search Tools, Other

**Permissions justification** (Chrome Web Store):

- `activeTab`: reads the URL and page of the current tab, only when the user clicks the toolbar button, to detect the map position or OpenStreetMap element.
- `scripting`: injects a small script in the current tab, only after that click, to read map permalinks from the page.
- `storage`: saves which tools are enabled, their order and the user's custom links.

**Single purpose** (Chrome Web Store):

> Open the map position or OpenStreetMap element shown in the current tab in other OpenStreetMap-related websites.

## Português (Brasil)

**Resumo:**

> Abra o lugar que você está vendo em outros mapas, editores e ferramentas do OpenStreetMap, na mesma posição e zoom.

**Descrição:**

> O OSM Smart Menu ajuda quem contribui com o OpenStreetMap a passar entre os mapas e ferramentas da comunidade sem perder o lugar.
>
> Clique no botão da extensão numa página de mapa e ela identifica o que você está vendo — coordenadas e zoom, ou o nó, via, relação, conjunto de alterações, usuário ou etiqueta do OpenStreetMap — e lista ferramentas que abrem esse mesmo conteúdo:
>
> • Editores: iD, Rapid, JOSM, Level0
> • Mapas temáticos: CyclOSM, OpenTopoMap, OpenRailwayMap, Waymarked Trails, OpenSeaMap e outros
> • Imagens e fotos de rua: Copernicus (Sentinel-2), Esri Wayback, Mapillary, Panoramax, KartaView
> • Histórico e alterações: OSMCha, OSM Deep History, WHODIDIT, How did you contribute
> • Qualidade dos dados: Osmose, OSM Inspector, Relation Analyzer
> • Mapas gerais: OpenStreetMap, Google Maps, Bing Maps, cartes.gouv.fr
>
> Funciona nos dois sentidos: do Google Maps ou do Bing você vai direto para o OpenStreetMap ou para um editor no mesmo lugar.
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
