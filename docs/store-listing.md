# Store listing

Texts for the Chrome Web Store and addons.mozilla.org (AMO).

## English

**Name:** OSM Smart Menu

**Summary** (Chrome Web Store: max. 132 characters):

> Open the place you’re looking at in other maps, satellite imagery and street photos, at the same position and zoom.

**Description:**

> OSM Smart Menu lets you look at the same place on a different map without searching for it again.
>
> Click the toolbar button on a map page and the extension reads the position and zoom shown in the current tab. It then lists other maps and tools that can open that exact spot, so you can switch with one click between general maps like Google Maps or Waze, thematic maps (for cycling, hiking, public transport or railways), satellite imagery and street-level photos. It works from Google Maps too, and on Wikipedia articles that have coordinates.
>
> For OpenStreetMap contributors, it also recognizes map elements, changesets and user profiles, and opens them in editors and in tools for reviewing edits and checking data quality. It can send the current area or element straight to the JOSM desktop editor.
>
> Tools are grouped by category, each with a one-line description, and the list can be searched. In the settings you can turn tools on or off, change their order, add your own links with URL templates, and export your settings to another browser.
>
> Privacy: the extension only reads the current tab when you click its button and collects no personal data. Its only network request of its own is the command sent to JOSM on your own computer, when you choose that option.
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

> Abra o lugar que você está vendo em outros mapas, imagens de satélite e fotos de rua, na mesma posição e zoom.

**Descrição:**

> O OSM Smart Menu permite ver o mesmo lugar em outro mapa sem precisar procurá-lo de novo.
>
> Clique no botão da extensão numa página de mapa e ela identifica a posição e o zoom mostrados na aba atual. Depois lista outros mapas e ferramentas que abrem exatamente aquele ponto, para você alternar com um clique entre mapas gerais como o Google Maps ou o Waze, mapas temáticos (de ciclismo, trilhas, transporte público ou ferrovias), imagens de satélite e fotos de rua. Também funciona a partir do Google Maps e em artigos da Wikipedia que têm coordenadas.
>
> Para quem contribui com o OpenStreetMap, ela também reconhece elementos do mapa, conjuntos de alterações e perfis de usuário, e os abre em editores e em ferramentas para revisar edições e verificar a qualidade dos dados. Também envia a área ou o elemento atual direto para o editor JOSM.
>
> As ferramentas ficam agrupadas por categoria, cada uma com uma descrição curta, e a lista tem busca. Nas configurações você pode ativar ou desativar ferramentas, mudar a ordem, criar seus próprios links com modelos de URL e exportar suas configurações para outro navegador.
>
> Privacidade: a extensão só lê a aba atual quando você clica no botão dela e não coleta dados pessoais. A única requisição de rede própria é o comando enviado ao JOSM no seu computador, quando você escolhe essa opção.
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
