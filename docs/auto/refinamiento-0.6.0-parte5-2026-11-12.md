# Refinamiento 0.6.0, quinta tanda (rama `auto/refinamiento-0.6.0-2026-11-09`)

[← Parte 4](refinamiento-0.6.0-parte4-2026-11-10.md)

Encargo (12/11/2026): «en la página de Select NO salen las opciones con `<mimi-option>`», el hallazgo 4 del revisor, compilar los fragmentos de R.13 y revisar con Playwright los ejemplos interactivos nuevos. **No se subió la versión ni se publicó nada.** Node 24.18.0. Todo con Playwright **fuera del repo** (`C:\t\pw`, `playwright-core` con el Chrome instalado), contra el sitio servido con `pnpm ng serve docs --port 4280` (lo mismo que `pnpm dev`; el 4200 lo tenía ocupado otro proceso, que no se tocó).

## 1. `<mimi-option>`: dos causas, las dos arregladas

**Antes de tocar nada** (capturas `capturas/2026-11-12/antes-*.png`): el ejemplo existía y era visible, pero no era el primero. Al abrir el Select, las 5 opciones estaban en el DOM, pero **el panel medía lo mismo que el disparador** y el disparador, con un valor corto («Pro»), medía **78 a 181 px** según el ejemplo. En el panel, las etiquetas se cortaban: «Pro anual» desaparecía detrás de su hint y «Enterprise» salía como «Enter…». El Combobox se veía bien (su campo tiene ancho propio).

**Causa 1 (la grave, la encontró la prueba nueva):** con `[value]` **enlazado** (dentro de un `@for`, que es como se usa con datos reales), la lista leía la opción antes de que Angular le pasara la entrada. Como `value` era `input.required`, saltaba **NG0950** y la lista entera fallaba: **no salía ninguna opción**, ni en Select ni en Combobox. Con `value="…"` estático (el ejemplo del sitio) no pasaba, por eso el ejemplo sí mostraba opciones.

- **Arreglo:** `value` de `<mimi-option>` y `label` de `<mimi-optgroup>` dejan de ser requeridos. Una opción sin valor todavía no se lista y aparece cuando llega.

**Causa 2:** el panel del Select medía exactamente lo que el disparador.

- **Arreglo:** con `matchWidth` (por defecto), el panel mide **al menos** lo que el disparador y crece con la opción más larga (`cdkConnectedOverlayMinWidth`), con un tope de la pantalla menos 16 px. Los ejemplos con `<mimi-option>` llevan además `w-80 max-w-full`.

**Prueba nueva** (`declared-options.spec.ts`, ui-core, 3 casos; **los 3 fallaban antes** con NG0950). Renderiza `<mimi-select>` y `<mimi-combobox>` con `<mimi-option>` proyectados, sueltos, dentro de `@for` con interpolación y en `<mimi-optgroup>`. Después abre el panel y comprueba en el DOM el texto de cada `role="option"` y el grupo. Elegir una opción cambia el valor y lo que muestra el disparador o el campo. Si cambia la lista del `@for`, el panel la sigue. `select.spec` comprueba el ancho mínimo del panel.

**Docs:** el ejemplo con `<mimi-option>` es el **primero** en Select y Combobox. El del Combobox usa un `@for`.

**Después** (`capturas/2026-11-12/despues-*.png`, claro y oscuro):

|                                   | Opciones en el DOM | Visibles                                                                  | Grupos | Tras elegir |
| --------------------------------- | ------------------ | ------------------------------------------------------------------------- | ------ | ----------- |
| Select `<mimi-option>`            | 5                  | 5 («Gratis», «Pro», «Pro anual · 2 meses gratis», «Equipo», «Enterprise») | 2      | «Equipo»    |
| Combobox `<mimi-option>` + `@for` | 4                  | 4                                                                         | 2      | «Bogotá»    |
| Select «Grupos» (78 px)           | —                  | panel de 167 px, **ningún texto cortado**                                 | —      | —           |

## 2. Hallazgo 4: un token de medida cambiado en un contenedor

**Comprobado en el navegador** (página «Tamaños»), con un botón `md` de 40 px y `--mimi-btn-height: 3.5rem` en un envoltorio:

- **sin `data-size`**, el botón sigue en **40 px**: el token no llega;
- **con `data-size="md"`** en el mismo envoltorio, pasa a **56 px**: llega.

El arreglo que proponías (variables solo en `:root` y `[data-size]`) **ya es así** y no basta. Las derivadas (`--mimi-btn-h`…) se calculan donde se declaran. Hacer que el token llegue sin `data-size` exigiría declarar las ~60 derivadas en **cada elemento** (`*`): es un cambio grande y de riesgo (rendimiento, orden de la cascada entre tamaños anidados). **No se hizo.** Lo que sí se hizo:

- **Documentado** en la página «Tamaños» («Cambiar una medida en una zona», con el código) y en la ruptura del CHANGELOG, que **se queda**: pon el token en `:root`, o en un contenedor **con `data-size`** (o `mimiSize`); en `sm` y `lg`, con su sufijo.
- **Prueba** (`sizes-page.spec.ts`): cada bloque `[data-size]` del tema calcula `--mimi-btn-h` desde el token del tamaño, que es lo que hace funcionar la receta.

## 3. R.13: los 51 fragmentos compilados

Proyecto de prueba fuera del repo:

- `ng new` con Tailwind 4.3.3 y la CLI de la rama empaquetada como `0.6.0-dev.1`;
- `ng add` y `ng g mimi` de los 17 componentes;
- un script lee `forms-snippets.ts` del repo (solo lectura) y escribe los **51 fragmentos** (17 × Signal Forms, Reactive y plantilla) con una tabla de rutas que los referencia, para que `ng build` los compile todos.

**Fallaron 7 de 51:**

- **Password ×3:** importaba `MimiInput` desde `password` y no desde `input`.
- **Tree ×3:** ponía el tipo `MimiTreeNode` en `imports` del componente.
- **Number Input con Signal Forms ×1:** enlazaba `[min]`/`[max]` junto a `[formField]`, que Signal Forms no admite (NG8022).

Corregidos en el generador: tipos aparte, imports de otro archivo y Number Input sin `[min]`/`[max]`. El segundo `ng build` sale **en verde con los 51**. Hay una prueba de regresión en `forms-tabs.spec.ts`.

## 4. Revisión con Playwright de los ejemplos interactivos (claro y oscuro)

Lo hace `review.mjs`, fuera del repo. Todo **OK en claro y en oscuro, sin errores de consola**:

| Ejemplo                                   | Resultado                                              |
| ----------------------------------------- | ------------------------------------------------------ |
| Select y Combobox con `<mimi-option>`     | ver sección 1                                          |
| Slider `readonly`                         | la flecha no mueve el valor (65 → 65)                  |
| Color Picker `readonly`                   | el panel no se abre                                    |
| File Upload `readonly`                    | no abre el selector de archivos                        |
| Toggle Group `readonly`                   | el clic no cambia lo elegido                           |
| Password `readonly`                       | no se escribe; el ojo sí muestra el valor              |
| Toast `outline`                           | el aviso aparece con `data-variant="outline"`          |
| Dialog como servicio                      | abre, se ve y Escape lo cierra                         |
| Tabs con `<mimi-tab>`                     | cambia de pestaña y el valor sale del texto («avisos») |
| Input OTP de 10                           | cabe (588 de 696 px) y se escribe «1234567890»         |
| Block cargando (`login-01?state=loading`) | `inert` y `aria-busy`                                  |

**Lo que no funcionaba y se arregló:**

1. **No había ejemplo en vivo de `<mimi-tab label>`** (solo salía en el bloque «Uso»). Ahora está en la página de Tabs, con su prueba de recuento.
2. **Regresión de M.23 en las vistas previas de los Blocks.** La caja de Password de `login-01` salía con el borde y el fondo del input dentro: el CSS global ya no trae Password, Progress, Separator… y la vista previa no carga `components.css`.
   - **Arreglo:** `blocks.css` escanea también los componentes. En la vista previa no hay menú ni cabecera del sitio, así que repetir utilidades no pisa nada.
   - **Comprobado** contra una versión de referencia (todo en el CSS global, `blocks.css` como antes): 7 Blocks, sus 6 estados y 3 páginas de Blocks, en claro y oscuro. **31 de 32 capturas idénticas.** La otra (`/docs/blocks/settings-01` en oscuro) repetida tres veces salió idéntica: fue la carga del iframe.
   - `blocks.css` pasa de 30 a 140 kB (20,3 kB gzip). Solo la carga la vista previa.
3. **Pendiente, sin arreglar:** con `readonly`, la zona de File Upload sigue diciendo «Arrastra archivos o haz clic». Va con el aspecto de solo lectura, que sigue en `[~]` en R.12.

## Verificación

- **`pnpm build`** en verde.
  - JS inicial: 334,87 kB crudo / 106,24 kB gzip.
  - CSS global: 111,56 kB crudo / 17,13 kB gzip.
- **Pruebas en verde:** ui-core **997**, docs **245**, CLI **202**.
- **`pnpm format:check`** en verde.

## Archivos

- **ui-core:**
  - `option-list/option-list.ts`
  - `select/select.ts`
  - `select/select.spec.ts`
  - `declared-options.spec.ts` (nuevo)
- **Sitio:**
  - ejemplos y páginas de Select, Combobox y Tabs (`tabs-shortcut.example.ts` nuevo)
  - `sizes-page.*`
  - `code/forms-snippets.ts` y `code/forms-tabs.spec.ts`
  - `blocks.css`
- **Docs:**
  - `CHANGELOG.md`
  - este informe y las capturas de `docs/auto/capturas/2026-11-12/`

## Limpieza

Servidor de desarrollo (4280) y estáticos (4284, 4285) lanzados con `timeout` y matados por PID. El 4200 era de otro proceso y no se tocó. `C:\t\q60`, `C:\t\r060` y `C:\t\pw` borrados.
