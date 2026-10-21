# Theme Studio

> Proyecto aparte, se retoma cuando Mimi esté completo. Se construye con Mimi (`ng add @mimi-ng/cli`) como un usuario más; lo que falte o incomode se corrige en Mimi.

Decidido el 20/10/2026: el Theme Studio completo deja de ser parte de mimi-ng. En mimi-ng queda solo una página de tema sencilla (plan, tarea 5.2; spec, sección 11, «Página "Tema"»). Este archivo reúne todo lo que la spec y el plan decían del Studio, tal como estaba, para retomarlo.

## Qué necesita de Mimi

El Studio no define variables propias: edita las que Mimi expone. Todo esto se queda en Mimi y sigue siendo obligatorio para cada componente nuevo (spec 13, «Reglas»):

- **El sistema de tokens completo** (spec 6.1 a 6.3 y 13): los tres niveles (globales, compartidos y por componente), la cascada `var(--mimi-<prefijo>-<prop>, var(--mimi-<compartida>, <respaldo>))`, `MimiComponentTokens` (`theme/types.ts`) y `COMPONENT_PREFIX` (`theme/provider.ts`), y las reglas de color y preset (los colores de componente van en el CSS, no en el preset; los derivados con `color-mix` no están en el preset).
- **`apps/docs/src/app/code/component-tokens.ts`** como fuente para saber qué se puede editar: la única lista de variables por componente (nombre, valor por defecto, de qué hereda y si va en el preset), comparada con el código por `component-tokens.spec.ts`.
- **`mimiThemeToCss` y `provideMimiTheme`** (y `applyMimiTheme`, spec 6.4) para aplicar el resultado: el Studio arma un `MimiThemePreset` y exporta `mimi.preset.ts`.

**Pendiente en Mimi (no hecho; se decide al retomar el Studio):**

- `component-tokens.ts` vive en el showcase (`apps/docs`) y no se publica. Para usarlo fuera del showcase habría que exportarlo: moverlo a ui-core o publicarlo con la CLI (por ejemplo, dentro de `registry.json` o como un archivo de datos), con su prueba.
- El modo componente edita radio, borde y efectos por componente; hoy los tokens de color por componente no están en el preset (spec 6.2). Si el Studio necesita editar el color de un solo componente, decidir cómo se exporta (CSS aparte con claro y oscuro, o un cambio en el preset).
- Radio «Squircle»: el token `--mimi-corner-shape` está en `docs/design/tokens-mimi.css` pero no en `theme-base.css` ni en el preset.

## Lo que decía la spec (sección 4, «Theme Studio»)

Reemplaza a la página «Temas» (tarea 5.2). Va después del Grupo 2 y se construye **solo con componentes de Mimi** (mimi-toolbar, Toggle Group, Select, Color Picker, Switch, Input…); si necesita uno que no está en el plan, se agrega al plan. Diseño: `docs/design/Mimi Theme Studio.dc.html` (con las correcciones de la sección 13).

**Para qué sirve:** solo para **editar los componentes de Mimi tal como existen**. No hay presets guardados, ni «Mis variantes», ni tonos propios: Mimi tiene un solo tema base, «Mimi» de fábrica, que pasa a ser «Mi tema» cuando el usuario cambia algo (sección 11). Lo que el usuario cambia se exporta como `mimi.preset.ts` para `provideMimiTheme()`. Todo valor cambiado por el usuario se etiqueta **«Mío»**.

**El color y los tamaños son globales:** el color y los tamaños SM, MD y LG se editan solo en el modo Tema global. Los tamaños los comparten todos los controles (Button, Input, Select…).

**Modo Componente** (estructura de Vuesax):

- A la izquierda, la lista de componentes.
- Arriba, una barra flotante (mimi-toolbar) con: Volver, Móvil / Tablet / Escritorio, Claro / Oscuro, fondo del lienzo, «Uno | Ver todos», «Código» y «Copiar prompt».
- En el lienzo, un solo componente; «Ver todos» muestra la matriz tonos × variantes.
- Abajo, la tira de variantes del componente.
- A la derecha, el panel:
  - **Vista previa** (no se guarda): tono, estado, tamaño y texto.
  - **Estilo del componente** (se guarda): radio (Rounded, Squircle, Pill o un valor propio), borde y efectos (sombra, glow y escala al presionar).
  - Cada propiedad muestra su origen: heredado de qué token, o «Mío».
  - Pestaña **«Variables»**: todas las variables del componente con su cadena de herencia (sección 13).

**Modo Tema global:**

- **Simple:** color principal, radio, densidad y fuente.
- **Avanzado:** Marca, Estados, Superficies, Texto, Bordes, Forma, Profundidad, Movimiento y Tipografía.
- Los colores van en parejas con su texto (`-foreground`), con indicador de contraste AA, y la vista previa se actualiza en vivo.

**Radio «Squircle»:** verificar el soporte actual de `corner-shape` (token `--mimi-corner-shape`) y usarlo como mejora progresiva, con respaldo a `border-radius`.

**Otras menciones en la spec, ya quitadas de allí:**

- Sección 6.2: «además, en Theme Studio el color es global» (motivo de que los colores de componente vayan en el CSS). Queda como regla de Mimi, sin depender del Studio.
- Sección 6.4: `applyMimiTheme` «La usará también Theme Studio».
- Sección 10, «Pendiente»: «Páginas: … Theme Studio (sección 4)».
- Sección 11: «cuando el usuario cambia algo (con el preset o en Theme Studio), es "Mi tema"».
- Sección 13, colores: «El Theme Studio los muestra juntos con el indicador de contraste AA» (las parejas de color y su texto).
- Sección 13, «Provisional, sin diseño (V.1)»: las celdas provisionales «se diseñan en Claude Design antes de Theme Studio». Ahora son parte de la tarea D6 del plan, sin depender del Studio.
- Sección 13, tokens sin fila: `--mimi-corner-shape` (Squircle).

## Lo que decía el plan

**Orden:** «Fase 4 → Grupo 1 → Grupo 2 → Theme Studio y Blocks → Grupo 3 → Grupo 4».

**D2:** «Diseño: Grupo 2 y Theme Studio. Archivos: … y `Theme Studio`». **G2.12:** «Color Picker (lo usa Theme Studio)». **5.10:** la navegación superior del header («Temas») se haría cuando existiera Theme Studio.

**Sección «Theme Studio (después del Grupo 2; reemplaza la 5.2)»:**

Solo sirve para editar los componentes de Mimi tal como existen: sin presets guardados, sin «Mis variantes» y sin tonos propios. Se construye solo con componentes de Mimi; si necesita uno que no está en el plan, se agrega. Ver spec, sección 4, «Theme Studio». Diseño: `Theme Studio` (corregir: quitar «Mis variantes» y agregar «Copiar prompt»; spec 13).

La T.2a de esa sección (correcciones de diseño pendientes) **no se movió**: es la tarea D6 del plan de mimi-ng. Solo esta parte suya era del Studio: «Diseñar en Claude Design las celdas provisionales de la V.1 … junto con la corrección del diseño de Theme Studio».

- [ ] T.2 Modo Componente (estructura de Vuesax): lista de componentes a la izquierda; barra flotante arriba (mimi-toolbar) con Volver, Móvil/Tablet/Escritorio, Claro/Oscuro, fondo del lienzo, «Uno | Ver todos» (matriz tonos × variantes), «Código» y «Copiar prompt»; un solo componente en el lienzo; la tira de variantes abajo.
- [ ] T.3 Panel derecho: «Vista previa», que no se guarda (tono, estado, tamaño y texto), y «Estilo del componente», que sí se guarda (radio: Rounded, Squircle, Pill o un valor propio; borde; efectos: sombra, glow y escala al presionar). Cada propiedad muestra su origen (el token del que hereda, o «Mío»); pestaña «Variables» con todas las variables del componente y su cadena de herencia. Todo valor cambiado por el usuario se etiqueta «Mío».
- [ ] T.4 Modo Tema global: Simple (color principal, radio, densidad y fuente) y Avanzado (Marca, Estados, Superficies, Texto, Bordes, Forma, Profundidad, Movimiento y Tipografía), con parejas de color y su texto, indicador de contraste AA y vista previa en vivo. El color y los tamaños SM, MD y LG (compartidos por todos los controles) solo se editan aquí. Exportación de `mimi.preset.ts` para `provideMimiTheme()`.
- [ ] T.5 Radio «Squircle»: verificar el soporte actual de `corner-shape` y usarlo como mejora progresiva, con respaldo a `border-radius`.

**Decisiones pendientes:** «Variantes propias en `mimi.preset.ts`: no se harán. Theme Studio solo edita los componentes tal como existen (spec, sección 4)».

## Diseños

Los archivos se quedan en `docs/design/`:

- `Mimi Theme Studio.dc.html`: el diseño del Studio.
- `mimi-tokens-data.js`: la hoja de tokens como datos (la usan `Mimi Tokens.dc.html` y `Mimi Theme Studio.dc.html`).
- `tokens-mimi.css` y `mimi-variables-fase3.css`: `--mimi-corner-shape` (radio «Squircle»).
- `Mimi Tokens.dc.html`: la hoja de tokens (referencia de los tres niveles).
- `Color Picker` (en `F3 Archivos Tags Toggle Color`): el Studio lo usaría para el color.

**Correcciones del diseño** (las que estaban en la spec 13, «Correcciones pendientes del diseño»):

- `Mimi Theme Studio.dc.html`: `import { definePreset } from '@mimi-ng/theme'` no existe → `provideMimiTheme(preset)` con un `MimiThemePreset` (`colors` y `darkColors`, spec 6.3).
- `Mimi Theme Studio.dc.html`: tiene «Mis variantes» y no tiene «Copiar prompt». Theme Studio no tiene variantes propias y su barra lleva «Copiar prompt».
