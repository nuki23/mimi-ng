# Informe de modo autónomo: preparación de la 0.5.0, rama `auto/release-0.5.0-2026-11-09`

09/11/2026. `node -v`: **v24.18.0**. `git log --oneline -1` en `main` antes de crear la rama: `f776941 Merge pull request #11 from nuki23/auto/grupo-3-2026-11-07` (la fusión del Grupo 3, comprobado). `git config user.email`: la dirección noreply del autor. **No se publicó, no se hizo etiqueta ni release.** Todos los cambios del repo se hicieron con la herramienta de archivos (y `git mv` para mover archivos del plan).

## 1. Puerta G3.P cerrada y Grupo 3 al historial

- G3.P marcada `[x]` («revisada por el usuario»: el PR #11 lo fusionó el usuario) y su fila de «En curso» quitada (queda «Ninguna»).
- `git mv` (sin reescribir): `docs/plan/grupo-3/G3.0.md` a `G3.4.md` → `docs/historial/grupo-3/`; `docs/plan/blocks/B.11.md` → `docs/historial/blocks/B.11.md`. Las carpetas vacías de `docs/plan/` desaparecen.
- B.9 y G3.P no tenían archivo propio (vivían en `docs/plan/grupo-3-blocks.md`, junto a B.8, que sigue pendiente): su texto se copió tal cual a `docs/historial/plan-grupo-3.md` (nuevo: índice, informes, lo que queda abierto y ese texto), y `grupo-3-blocks.md` conserva B.8 con un puntero.
- `docs/plan.md`: las secciones «Blocks: páginas del usuario» y «Grupo 3» se reemplazaron por una nota («Cerrado… por publicar»); «Terminado» suma B.11, G3.0 a G3.4, B.9 y G3.P; la línea de «Historial» cita `plan-grupo-3.md`.
- Commit: `docs(plan): cierra la puerta G3.P y pasa el Grupo 3, B.9 y B.11 al historial`.

## 2. Versión 0.5.0

Búsqueda de `0.4.0` en el repo (sin `CHANGELOG.md`, `docs/historial/`, `docs/auto/` ni `pnpm-lock.yaml`). **Cambiadas (la versión actual):**

- `packages/cli/package.json:3`: `"version": "0.5.0"` (única fuente: el build la escribe en `dist/registry.json`).
- `apps/docs/src/app/pages/docs/installation-page.ts:89`: el `mimi.json` de ejemplo, `"button": { "version": "0.5.0" }`.
- `apps/docs/src/app/pages/docs/installation-page.html:196`: «button actualizado de 0.4.0 a 0.5.0».
- `docs/spec.md` (nota bajo el `mimi.json` de ejemplo): ya no dice que `0.5.0` es «ilustrativa»; la B.11 sale en la 0.5.0 y `pricing-01` conserva la versión con la que se instaló.

**Sin cambiar (históricas, o que nombran la versión anterior a propósito):** `block-doc.ts:130` y `block-pages.spec.ts:135` («¿La instalaste con la 0.4.0?»); `tabs-page.ts:100` («desde la 0.4.0»); `installation-page.ts:44` («la exclusión, desde la 0.4.0»); `spec.md` (todas las notas «desde la 0.4.0» y `"pricing-01": { "version": "0.4.0" }`, que describe un Block instalado con la 0.4.0); `docs/design/correcciones-pendientes.md:259`; `docs/plan.md` y `docs/plan/*` (M.19, M.20, tareas hechas); `docs/proceso/release.md` (los ejemplos, actualizados en el paso 8); `packages/cli`: `README.md:122`, `scripts/build.mjs:16`, `src/init/index.ts:350`, `src/init.spec.ts:124`, `src/pages.spec.ts` (compatibilidad con la 0.4.0), `src/ui/index.ts` (pantallas instaladas con la 0.4.0), `src/utils/project.ts:43`. El `README` de la CLI (línea 40) y la Instalación (línea 163) dicen «0.3.0 o una anterior» por la exclusión `.mimi/`: sigue siendo cierto.

Commit: `chore(release): versión 0.5.0`.

## 3. CHANGELOG

«Por publicar» → `## 0.5.0 (09/11/2026): datos y páginas`. Comprobado que incluye: **B.11** («Los Blocks de pantalla se generan como páginas tuyas», con su **RUPTURA** y la compatibilidad con la 0.4.0); los arreglos de **`pricing-01`** (sin `min-h-svh`) y del **comentario de cabecera**; el **Grupo 3** (Tree, Sortable List, Command, Data Table, tokens, textos, `Checkbox` con `MIMI_CHECKBOX_BOX_STYLES`); **`table-01`**. **No estaban** los ocho arreglos de la G3.P (solo vivían en el informe del grupo): se agregó el punto «Arreglos de la revisión de la puerta del grupo» (Data Table: poda de la selección, página y rango en modo servidor, id del detalle, filas sin id sin NG0955, sombra RTL, propiedades lógicas, sin `aria-selected`; Tree: teclado en campos internos y `load()` tras destruirse; Sortable List: Escape en un Dialog y NG0955 sin `trackBy`). «Cómo actualizar» cita `@mimi-ng/cli@0.5.0`. La frase de las propiedades lógicas aclara que la barra, el pie y el botón de orden siguen físicos (M.24). Commit: `docs(changelog): 0.5.0 (09/11/2026), con los arreglos de la puerta del Grupo 3`.

## 4. M.24 (registrada, sin hacerla)

`docs/plan/mantenimiento.md` e índice: **M.24** Data Table: `pr-3 pl-4` en la barra (`data-table.ts:224`) y en el pie (`:784`) y `-ml-1.5` en el botón de orden (`:285`) siguen físicos (no RTL). Criterios: `pe-3 ps-4` y `-ms-1.5`, prueba con `dir="rtl"`, vista en un navegador. Commit: `docs(plan): M.24, la barra y el pie de Data Table siguen con propiedades físicas`.

## 5. Build, pruebas y formato

- `pnpm build`: en verde, **sin avisos de presupuesto** (los únicos avisos son `ExperimentalWarning: WASI` de Node, ver «Alertas»).
- `pnpm test`: **docs 192 (66 archivos), ui-core 904 (60 archivos), CLI 202 (6 archivos)**, todas en verde (0.4.0: 183 / 838 / 159).
- `pnpm format:check`: en verde (también tras los cambios de documentación de este informe, ver el final).

| Medida                | Crudo (0.4.0) | Crudo (0.5.0) | gzip (0.4.0) | gzip (0.5.0) | Aviso  | Error  |
| --------------------- | ------------- | ------------- | ------------ | ------------ | ------ | ------ |
| JS inicial            | 331,50 kB     | 333,31 kB     | 105,71 kB    | 106,25 kB    | 345 kB | 360 kB |
| CSS global (`styles`) | 154,22 kB     | 170,44 kB     | 22,15 kB     | 24,45 kB     | 180 kB | 195 kB |
| `main`                | 135,97 kB     | 135,90 kB     | —            | —            | 140 kB | 145 kB |
| `initial` (JS + CSS)  | 485,72 kB     | 503,75 kB     | —            | —            | 525 kB | 555 kB |

Brotli del JS inicial: 93,99 kB. El JS inicial crece 1,81 kB sobre la 0.4.0 (más de 1 kB: son los chunks compartidos que arrastran los componentes nuevos, Tree, Sortable List, Command y Data Table; ninguno entra en `main`, que baja 0,07 kB). Esta tarea no cambia código: las cifras son las del Grupo 3. El CSS global está a 9,6 kB del aviso y 24,6 kB del error. Ningún presupuesto se subió.

## 6. `npm pack --dry-run` (`packages/cli`)

`@mimi-ng/cli@0.5.0`: **165 archivos**, 279,0 kB empaquetado, 1,1 MB sin empaquetar (0.4.0: 149 archivos, 232,9 kB). Entran: `package.json`, `README.md`, `LICENSE`, `THIRD_PARTY_NOTICES.md` y `dist/` con `templates/blocks/` ahora con **siete** Blocks (`login-01`, `login-02`, `otp-01`, `pricing-01`, `settings-01`, `signup-01`, `table-01`). En el `.tgz` real (`C:\t\r050\mimi-ng-cli-0.5.0.tgz`, fuera del repo; shasum del empaquetado local `4b127f4d15ac15a1df480451b5dbab96321f6407`; el de `npm publish` puede variar, porque `prepublishOnly` recompila): **0 archivos `.spec.`, 0 rutas con `testing`**; la búsqueda de `C:\`, `/Users/`, `/home/` no encontró nada; la de correos, nombres de usuario, `mimi-ng-respaldo` y `.bundle` solo encontró la palabra «respaldo» (en español: «con respaldo» = «con valor de reserva») en comentarios de `calendar/dates.ts`, `chip/chip.ts` y `textarea/textarea.variants.ts`, y el `author` publicado, «Ariel O (https://github.com/nuki23)», sin correo.

## 7. Escenarios con el `.tgz` real (proyectos en `C:\t\p50`, borrados al acabar)

La versión anterior salió de npm (`ng add @mimi-ng/cli@0.4.0`, la real); la nueva, del `.tgz` (`ng add "C:\t\r050\…tgz"` y `npm i -D "…tgz"`). Proyectos con `ng new … --style=tailwind --skip-git --defaults --ssr=false --ai-config=none`. Angular 22.2.x, Node 24.18.0, npm 11.16.0, pnpm 12.5.1.

| #   | Escenario                                                  | Resultado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | npm, proyecto nuevo                                        | `ng add` escribe `aliases.blocks` y `aliases.pages` y `@source not "../.mimi"`. `ng g mimi button login-01 settings-01 pricing-01 table-01`: 136 archivos; páginas en `src/app/pages/{login,settings,table}/` (`.ts`, `.html`, `.routes.ts`) con la línea de rutas impresa; `pricing-01` en `src/app/blocks/`. Rutas pegadas, `pricing-01` en `app.html`: `ng build` en verde. CSS con utilidades (`min-h-svh`, `grid-cols`, `bg-background`, `text-muted-foreground`). `login-02` con `login/` ocupada: **falla sin escribir nada** y sugiere `--name`; `login-02 --name sign-in` crea `sign-in/` y su ruta. `ng serve`: `/login` responde 200. |
| 2   | pnpm, proyecto nuevo                                       | Igual que el 1 con `pnpm ng …` (204 líneas de resumen): `ng build` en verde, CSS con utilidades, `ng serve` responde 200 en `/table`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 3   | Actualización desde la 0.4.0 real, con un Block modificado | Con `button`, `login-01`, `settings-01` y `pricing-01` instalados con la 0.4.0 y `settings-01.ts` modificado: «checkbox / login-01 / pricing-01 / theme actualizado de 0.4.0 a 0.5.0»; `settings-01` **bloqueado con su aviso** (no se tocó ningún archivo; la base está en `.mimi/base/blocks/settings-01/`); `login-01` «sigue en `src/app/blocks/login-01/`, donde lo instalaste con la 0.4.0, y se actualiza ahí», con el aviso de que ahora se generan como páginas.                                                                                                                                                                        |
| 4   | Lo mismo, con una página instalada                         | Se borró `src/app/blocks/login-01/` y se volvió a ejecutar `ng g mimi login-01`: pasa a página (`src/app/pages/login/`), **`aliases.pages` se escribe** en `mimi.json` y `blocks.login-01` guarda `path` y `name`. Un segundo `ng g mimi login-01`: «Nada que hacer». `login-02` falla sin escribir (carpeta ocupada) y `--name sign-in` genera `sign-in/`. `ng build` en verde.                                                                                                                                                                                                                                                                 |
| 5   | `source(none)`, desde la 0.4.0 real                        | `ng add` de la 0.4.0 agregó `@source "./app/components/ui"` y `@source "./app/blocks"`; con la 0.5.0, `ng g mimi login-01` agregó **`@source "./app/pages";`** y lo dijo en el resumen. `ng build` en verde; el CSS trae las clases de la página (`gap-\[18px\]`, `max-w-\[400px\]`, `bg-card`, `mask-`).                                                                                                                                                                                                                                                                                                                                        |

`ng build` sin avisos propios en todos (solo los `ExperimentalWarning` de Node, ver «Alertas»). **Al terminar:** puertos 4251 y 4252 sin escucha (solo conexiones en `TIME_WAIT`); `C:\t\p50` y `C:\t\r050` borrados; los servidores se mataron por su PID con `taskkill`, con `timeout` en cada espera (A9).

**Interpretación del escenario 4:** desde la 0.4.0 no existen las páginas, así que «con una página instalada» se probó como la B.11 la define: pantalla modificada que se queda, pantalla sin modificar que se actualiza y una pantalla que se pasa a página borrando su carpeta. No se probó «actualizar una página modificada de la 0.5.0 a otra versión»: no hay todavía una versión posterior.

## 8. `docs/proceso/release.md`

Ejemplos de versión (0.5.0 y 0.4.0); la puerta de la 0.5.0 es la `G3.P`; el `@source` de `source(none)` ahora es `./app/pages` (y `./app/blocks` para las secciones); el registro de la 0.5.0 va en `docs/historial/plan-grupo-3.md`; un párrafo nuevo con cómo probar con el `.tgz` real (`npm pack --pack-destination`, `ng add` de la ruta, revisión del contenido) y otro sobre comprobar que el CSS trae las utilidades (ver la primera alerta). Commit: `docs(proceso): checklist de release con el .tgz real y la comprobación del CSS (0.5.0)`.

## Alertas para el revisor

1. **Tailwind 4.3.5 bloqueado por Windows en esta máquina (no es de Mimi).** Los proyectos nuevos instalan Tailwind 4.3.5 y su binario nativo (`@tailwindcss/oxide-win32-x64-msvc/…node`) falla con `ERR_DLOPEN_FAILED` («Una directiva de Control de aplicaciones bloqueó este archivo»); la 4.3.3, la del repositorio, carga. Con el binario bloqueado, Tailwind usa el respaldo WASI, no escanea ningún archivo y **`ng build` termina en verde con un CSS sin utilidades** (unos 33 kB; un proyecto de la prueba del 07/11/2026 que daba 101 kB ahora daba 33 kB). Lo vi porque comprobé el CSS y no solo la salida del build. **Para las pruebas se fijó `tailwindcss` y `@tailwindcss/postcss` a 4.3.3** en cada proyecto de prueba (`npm i -D --save-exact`; con pnpm, editando `package.json`); no se tocó ninguna política del equipo. **Tiene un efecto para los usuarios:** quien tenga una política así verá el CSS vacío sin ningún error. No es de la CLI ni de los componentes, pero vale la pena una línea en la documentación (decisión tuya).
2. **Un fallo mío, ya corregido:** el primer commit lleva el pie `Co-Authored-By` que `CLAUDE.md` prohíbe; lo quité con `git commit --amend` antes de cualquier push (el commit era mío y local). Los demás commits no llevan atribución.
3. `CLAUDE.md` (línea 8, el ejemplo `docs/plan/grupo-3/G3.1.md`) y `.claude/commands/cerrar-grupo.md` (línea 11, «la G3.P en `docs/plan/grupo-3-blocks.md`») citan rutas que ya pasaron al historial. No los edité (`CLAUDE.md` es tuyo y `.claude/` tiene permisos propios); sugerencia: cambiar el ejemplo a otra tarea abierta y mencionar `docs/historial/grupo-3/`.
4. `ExperimentalWarning: WASI` aparece también en el build del repo (con Tailwind 4.3.3, el binario carga; el aviso viene de la herramienta de análisis de `ng build`): sin relación con lo anterior.
5. `C:\t` tenía carpetas de pruebas anteriores (`app-npm`, `b040`, `b040p`, `b11`, `g3`, `m4`, `r030`, `vh`): **no son de esta tarea y no se tocaron**. Una de ellas (`app-npm`) hizo fallar el primer `ng new`; usé `C:\t\p50`.
6. Navegador real: los escenarios usan `curl` y el CSS compilado, no un navegador; «la pantalla se ve» sigue en la M.20.

## Pendiente del usuario

1. Revisar y fusionar esta rama.
2. Publicar según `docs/proceso/release.md`: `npm publish` desde `packages/cli`, etiqueta `v0.5.0` sobre el commit de la versión, release de GitHub («0.5.0 — datos y páginas»), despliegue y prueba desde npm.
3. Pasar los datos de la publicación para anotarlos en `docs/historial/plan-grupo-3.md` («Publicación de la 0.5.0 (registro)»).
4. Decidir sobre la alerta 1 (una nota en la documentación) y la 3.
5. La comprobación manual de la M.20 (puntos 10 a 13) y la M.24.
