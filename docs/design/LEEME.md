# Diseños de Claude Design

Diseños de Mimi exportados de Claude Design. Claude Code toma colores, radios y sombras **solo** de estos archivos.

## Tokens

- `tokens-mimi.css`: tokens globales y compartidos del tema Mimi, en claro y oscuro, con los nombres `--mimi-*` de la spec (sección 6.1). Es la fuente de `packages/ui-core/src/lib/theme/theme-base.css`.
- `mimi-variables-componentes.css`: tokens compartidos y **por componente** (21 componentes: los de la 0.1.0 y los del Grupo 1). Catálogo en la spec, sección 13.
- `mimi-tokens-data.js`: los mismos tokens como datos (lo usan `Mimi Tokens.dc.html` y `Mimi Theme Studio.dc.html`).
- `mimi-variables.css`, `mimi-variables-fase2.css`, `mimi-variables-fase3.css` y `mimi-effects.css`: las variables tal como las usan los diseños (selector `[data-mimi-style]`).

**Corrección sobre el diseño:** en `mimi-variables-componentes.css`, `--mimi-badge-radius` era `var(--mimi-badge-radius)` (una referencia a sí misma que invalida la variable); se reemplazó por `999px`, el valor de `mimi-variables.css`.

## Diseños

Los `.dc.html` se abren en el navegador junto con los scripts de soporte de esta carpeta (`support.js`, `lucide.min.js`, `mimi-icon.js` e `image-slot.js`). No forman parte de Mimi: solo sirven para ver los diseños.

- Sitio y landing: `Mimi Sitio.dc.html`, `Mimi Landing v2.dc.html`.
- Componentes de la 0.1.0: `Mimi Componentes.dc.html`.
- Tokens: `Mimi Tokens.dc.html` (tres niveles), `Mimi F2 Tokens y Tonos.dc.html`.
- Grupo 1: `Mimi F2 Overlays.dc.html`, `Mimi F2 Select.dc.html`, `Mimi F2 Toast Tabs Toolbar.dc.html`, `Mimi F7 Pagination.dc.html` (con `Mimi Pagination.dc.html`).
- Grupo 2: `Mimi F3 Archivos Tags Toggle Color.dc.html` (con `Mimi Color Picker.dc.html`), `Mimi F3 Combobox Fechas Hora.dc.html`, `Mimi F3 Slider OTP Numero Mascara.dc.html`.
- Theme Studio: `Mimi Theme Studio.dc.html`.
- Grupo 3: `Mimi F4 Command Tree Sortable.dc.html`, `Mimi F4 Data Table y Pagination.dc.html` (con `Mimi Data Table.dc.html`), `Mimi F4 Panel admin.dc.html`.
- Grupos 4 y 5 y Mimi Effects: `Mimi F5 Estructura.dc.html`, `Mimi F5 Dashboard y Media.dc.html`, `Mimi F5 Effects.dc.html`.
- Blocks: `Mimi F6 Blocks.dc.html` y `Block <nombre>.dc.html`.

Los nombres «F2»…«F7» son las tandas de trabajo en Claude Design, no las fases de `docs/plan.md`. Los textos de los diseños que contradicen la spec (comandos, imports, funciones de Theme Studio) están anotados en la spec, sección 13, y se corrigen al pasarlos al código.
