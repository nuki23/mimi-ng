# Informe de modo autónomo: preparación de la 0.7.0, rama `auto/release-0.7.0-2026-11-16`

16/11/2026. `node -v`: **v24.18.0**. `main` antes de crear la rama: `1d9312b 0.7.0 tanda 3: Sortable entre columnas, kanban-01, carga, política de rupturas (#21)`, la fusión (squash) de `auto/0.7.0-tanda3-2026-11-15`, igual que `origin/main`. Rama creada desde `origin/main`, sin upstream hacia `main`. `git config user.email`: la dirección noreply del autor. **No se publicó, no se hizo etiqueta ni release.** Un commit por paso; los archivos del repo, solo con la herramienta de archivos.

## 1. Decisiones por defecto de la tanda 3, aceptadas

**Plan breve:** marcar como aceptadas las decisiones de la tanda 3 en el registro y en sus tareas, salvo los obsoletos, que ya reemplazó la política de rupturas del usuario.

- `docs/auto/decisiones-por-defecto.md`, «Decididas por defecto: tanda 3 de la 0.7.0»: **aceptadas el 16/11/2026** las cinco (contenedor `<mimi-sortable-group>`, `kanban-01`, carga, textos obligatorios de `MimiSortableText` con su RUPTURA, teclado entre listas). La de `utils/size` «deprecado hasta la 1.0» ya no estaba en esa lista: la reemplazó «Decididas por el usuario: rupturas y obsoletos» y se quitó en la 0.7.0. Los demás obsoletos «hasta la 1.0», a la M.28 (paso 2).
- `docs/plan/refinamiento/R-0.7.0.md`: R.21, R.22 y R.23 dicen «aceptado por el usuario el 16/11/2026». De paso, R.19 y R.20 (tanda 2, aceptadas el 15/11/2026 en el prompt de la tanda 3) seguían diciendo «pendiente de revisión del usuario»: corregido; en la R.19, el alias de Card queda tachado (lo quitó la política de rupturas).
- `docs/plan/decisiones.md` no tenía ninguna línea de la tanda 3 (comprobado con `grep`).

Commit: `docs(decisiones): acepta las decisiones por defecto de la tanda 3 de la 0.7.0`.

## 2. Puerta R.P7 cerrada, la 0.7.0 al historial y el plan de la 0.8.0

**Plan breve:** cerrar la R.P7 (la recorrió la tanda 3 y la revisó el usuario al fusionar el PR #21); mover el texto de la 0.7.0 al historial con `git mv`, como en la 0.6.0; sacar la R.34 (que estaba en ese archivo como referencia) al plan del Grupo 4, que abre la 0.8.0 con el Sheet; registrar la M.28 y la idea de `ng update`; lo manual, a la M.20.

- `git mv docs/plan/refinamiento/R-0.7.0.md docs/historial/refinamiento/R-0.7.0.md`, con una nota de cierre arriba, los enlaces relativos corregidos (a `docs/plan/refinamiento/` y a `docs/plan/mantenimiento.md`), la R.P7 en `[x]` y, en la R.34, una línea que dice dónde está su texto vigente. El resto, tal cual.
- `docs/historial/plan-refinamiento-0.7.0.md` (nuevo): índice, lo que salió fuera del plan (la política de rupturas, la zona de soltar, el contenedor de `kanban-01`, el aviso nuevo de la CLI), los informes, lo que queda abierto y la sección «Publicación de la 0.7.0 (registro)», vacía hasta que el usuario publique.
- **Lo pendiente, a la 0.8.0:** de la 0.7.0 no quedó ninguna tarea a medias (todas `[x]`). Pasa la **R.34**, que nunca fue de la 0.7.0: `docs/plan/grupo-4/R.34.md` (nuevo), con su texto y cuatro cambios que se dicen en su encabezado (la nota de «se queda en este archivo», el final del punto 9, que proponía adelantar el Sheet a la 0.7.0, y el CHANGELOG de destino). `docs/plan/grupo-4.md`: la R.34 con su enlace, la G4.2 apunta ahí, y la G4.P depende también de la R.34 y la M.28.
- **M.28** (nueva, `docs/plan/mantenimiento.md`, v0.8.0, M, RUPTURA): quitar todo lo marcado «hasta la 1.0». La búsqueda (`git grep -n -i -E "hasta la 1\.0|en la 1\.0|se quita.{0,20}1\.0|@deprecated|vivid"` en `packages/`, `apps/`, `docs/spec.md` y `CHANGELOG.md`) encontró, además de lo que nombraba el encargo (atajos de `variant` de Button y Badge, `radii.badge`, `paddingX` y `placeholderColor` de Input), **el alias `destructive-soft`** de `theme-base.css` (con el cambio de significado de `destructive-soft-bg`), **`"style": "vivid"`** en `mimi.json` (CLI), los avisos de `provideMimiTheme`, la columna «se quita en la 1.0» de las tablas de variables del sitio y la lista de Fundamentos. Ocho puntos, cada uno con su archivo y línea. Con la política, **la M.28 absorbe las tareas 1.0-1 a 1.0-4** (`docs/plan/version-1.0.md` y el índice las marcan «→ M.28»; los IDs no se reutilizan). Criterio central: **una prueba que falla si queda algo marcado así** (`@deprecated`, «hasta la 1.0», «se quita(n) en la 1.0», «en la 1.0 pasa»), escrita primero, con su lista de excepciones vacía. Quedan fuera, dicho en la tarea, la frase general «la API puede cambiar entre versiones menores hasta la 1.0» y los comentarios que explican la política.
- **5.18** (nueva, `docs/plan/plataforma.md`, «después de la 1.0»): migraciones automáticas con `ng update`, como idea sin detallar, con sus preguntas abiertas (todo o nada, copias modificadas, relación con `mimi update`). `docs/plan/version-1.0.md` tiene una sección «Después de la 1.0» que la cita.
- `docs/plan/mantenimiento.md`, M.20: punto «0.7.0» (19 a 21: NVDA y VoiceOver en las listas conectadas, el tablero y Loading; un teléfono real con el tablero y la zona de soltar; movimiento reducido en Loading y RTL en las listas). `/kanban` en un proyecto actualizado ya no es pendiente: lo ve el paso 6.
- `docs/plan.md`: «En curso» sin la R.P7; la sección del refinamiento dice «0.6.0 y 0.7.0 (cerradas)», con la 0.7.0 **por publicar**; «Terminado» suma el bloque «Refinamiento, v0.7.0» (R.19 a R.23, R.25 a R.33 y R.P7); la R.34 enlaza a su archivo nuevo; las líneas de la M.28 y la 5.18; las 1.0-x «→ M.28»; «Historial» cita `plan-refinamiento-0.7.0.md`.
- `docs/plan/refinamiento/plan.md`: el enlace de la 0.7.0 apunta al historial y el de la R.34 a su archivo nuevo. El resto de `docs/plan/refinamiento/` (peticiones, PD-1 a PD-3, Combobox y Select, uso corto) se queda: la spec cita esas decisiones.

Commit: `docs(plan): cierra la puerta R.P7 y pasa la 0.7.0 al historial; R.34 al plan de la 0.8.0; M.28 (quitar lo marcado «hasta la 1.0») y 5.18 (ng update)`.

## 3. Versión 0.7.0 y CHANGELOG

Búsqueda de `0.6.0` en el repo (`git grep`, sin `CHANGELOG.md`, `docs/historial/`, `docs/auto/`, `docs/plan*` ni `pnpm-lock.yaml`). **Cambiadas (la versión actual):**

- `packages/cli/package.json:3`: `"version": "0.7.0"` (la única fuente: el build la escribe en `dist/registry.json` y el sitio la lee de ahí).
- `apps/docs/src/app/pages/docs/installation-page.ts:89`: el `mimi.json` de ejemplo, `"button": { "version": "0.7.0" }`.
- `apps/docs/src/app/pages/docs/installation-page.html:203`: «button actualizado de 0.6.0 a 0.7.0».
- `docs/proceso/release.md`: los ejemplos de versión (0.7.0 y 0.6.0), la puerta de la 0.7.0 (`R.P7`) y dónde va el registro de la publicación (`docs/historial/plan-refinamiento-0.7.0.md`).

**Sin cambiar (nombran la 0.6.0 a propósito):** la página de Card («Si vienes de la 0.6.0») y su prueba; los comentarios de `card.ts`, `card.spec.ts`, `size.spec.ts`, `confirm.ts`, `tab-value.spec.ts`, `gate-review-fixes.spec.ts`, `contrast.spec.ts`, `busy.spec.ts`, `ui.spec.ts` y `write-files.ts` (historia de un arreglo o de una ruptura); `docs/design/LEEME.md` y `correcciones-pendientes.md` («el tema de la 0.6.0»); la spec (doce menciones, todas de historia: el tema de marca de la 0.6.0, la tabla de tamaños «lo que salió en la 0.6.0», `size="default"` «en la 0.6.0 era un alias»…).

**CHANGELOG:** el título del borrador pasa a `## 0.7.0 (16/11/2026): Card, Table, tableros y carga`, sin la nota «Borrador», y con una línea arriba sobre la política de rupturas (sin obsoletos antes de la 1.0; lo marcado «hasta la 1.0» desde la 0.2.0 se quita en la 0.8.0, M.28). **La fecha es la de la preparación**: si el usuario publica otro día, la cambia (como en la 0.6.0, que dice 13/11 y se publicó el 14/11). Revisado contra los «RUPTURA» de los tres informes de la 0.7.0 y contra `git diff v0.6.0 HEAD` de `packages/ui-core/src/lib` (lo exportado o con selector que desaparece), de `theme/types.ts` y `theme-base.css` y de `packages/cli/src/registry.json`:

- **Rupturas, todas con su «Cómo actualizar»:** Card a directivas sin alias y sin los tokens de relleno por pieza (los seis selectores `mimi-card*` y `paddingHeader`, `paddingContent` y `paddingFooter`, que son lo que el diff muestra quitado en Card); Button cargando sin `disabled` nativo (R.33); hover con `not-aria-busy:`; `size="default"` y la compatibilidad de `utils/size` (`MimiSizeInput`, `normalizeMimiSize` y el segundo argumento de `injectMimiSize`, los tres que el diff muestra quitados de `utils/size`); `aria-sort` de Data Table; Data Table instalado con `table` (`MimiTableSort` y `MimiTableFilters`, que el diff muestra «quitados» de `data-table`, se reexportan desde `table`: no rompen); los cinco textos de `MimiSortableText`. **Ya estaban todas.**
- **Lo que el diff muestra y no es ruptura:** `MimiSelectList` (interna desde siempre, no estaba en el `index.ts` de Select de la 0.6.0, comprobado con `git show v0.6.0:…/select/index.ts`); `MimiSortableListImports` (cambia su contenido, suma el grupo, no se quita); el registro: `utils/size` como dependencia nueva de Card, Confirm, Input OTP y File Upload, y deja de serlo de dos ítems que ya no la usan; los ítems nuevos (`table`, `loading`, `kanban-01`).
- **Faltaba, y se agregó** (en «Cambios visibles»): **Card, Input OTP, File Upload y `mimi-color-input` siguen el tamaño de su contenedor** (R.19 y M.27; comprobado en `theme-base.css`: `--mimi-card-p` es 1rem en `[data-size="sm"]` y 2rem en `lg`, y los cuatro usan `MimiSized`). En la 0.6.0 una Card dentro de un `mimiSize="sm"` tenía 24 px de relleno; ahora 16. Con su salida (`size="md"` en el componente).

Commit: `chore(release): versión 0.7.0 y CHANGELOG 0.7.0 (16/11/2026), con el tamaño heredado de Card, Input OTP y File Upload en «Cambios visibles»`.

## 4. Build, pruebas y formato

Con la versión ya en 0.7.0 (salidas guardadas fuera del repo, en `C:\t\r070log`, borradas al final):

- `pnpm build` (con `NG_CLI_ANALYTICS=false`): en verde, **sin avisos** de presupuesto ni de compilación (la búsqueda de `warning`, `error`, `budget` y `exceeded` en la salida no encontró nada). `packages/cli/dist/registry.json` dice `"version": "0.7.0"`.
- `pnpm test`: **docs 557 (82 archivos), ui-core 1133 (103 archivos), CLI 206 (6 archivos)**, todas en verde. 0.6.0: 260 / 1061 / 202 (`docs/auto/release-0.6.0-2026-11-13.md`, paso 4): **+297 / +72 / +4**.
- `pnpm format:check`: «All matched files use Prettier code style!».

| Medida                  | Crudo (0.6.0) | Crudo (0.7.0) | gzip (0.6.0) | gzip (0.7.0) | Aviso  | Error  |
| ----------------------- | ------------- | ------------- | ------------ | ------------ | ------ | ------ |
| JS inicial              | 334,89 kB     | 294,58 kB     | 106,23 kB    | 93,70 kB     | 345 kB | 360 kB |
| CSS global (`styles`)   | 130,77 kB     | 139,19 kB     | 18,70 kB     | 19,72 kB     | 180 kB | 195 kB |
| `main`                  | 137,83 kB     | 98,08 kB      | —            | —            | 140 kB | 145 kB |
| `initial` (JS + CSS)    | 465,66 kB     | 433,77 kB     | —            | —            | 525 kB | 555 kB |
| `components.css` (dif.) | 140,94 kB     | 148,05 kB     | 19,81 kB     | 20,55 kB     | —      | —      |

Cifras de `apps/docs/scripts/check-initial-js.mjs` (JS inicial y CSS global, crudo y gzip; brotli del JS inicial: 83,18 kB) y de `ng build` (`main`, `initial`); `components.css`, con `ls` y `gzip -c | wc -c` (148 050 y 20 545 bytes). **Antes y después de esta preparación son iguales** a los de la tanda 3 (sección 7.7: 294,58 / 93,71 y 139,19 / 19,72; el gzip del JS varía 0,01 kB entre compilaciones): esta rama solo cambió la versión en dos textos del sitio. **Frente a la 0.6.0**, el JS inicial baja 40,31 kB crudo (la M.25: Button y `tailwind-merge` fuera de la cabecera; `main` −39,75 kB) y el CSS global sube 8,42 kB crudo / 1,02 kB gzip (las clases de las tandas de la 0.7.0 que usa el sitio inicial: la capa de Loading, Card y Table; las midieron sus informes). Ningún presupuesto avisa ni se subió.

Commit: `docs(auto): build, pruebas y bundle de la 0.7.0 frente a la 0.6.0`.
