# Informe de modo autónomo: cierre del Grupo 2 y preparación de la 0.3.0, rama `auto/release-0.3.0-2026-11-06`

Rama creada el 06/11/2026 desde `main` actualizado (`1c8e035`, igual a `origin/main`), sin upstream hacia `main`. `node -v`: **v24.18.0** (la de `.node-version`), comprobado antes de empezar. Pedido del usuario: la puerta G2.P sin publicar nada, el CHANGELOG de la 0.3.0, la versión, la verificación completa y las pruebas con el `.tgz`. **No se publicó nada:** ni npm, ni etiqueta, ni release de GitHub, ni despliegue.

## Pendiente del usuario

1. **Teléfonos reales** (criterio principal de la 5.17a y la 5.17b, y criterio manual de la puerta): C4 a C8 de la 5.17a, C4 y C7 de la 5.17b y los **paneles altos** (Date Picker, Date Range y Color Picker con disparador, 5.17b C3). Si el problema de los paneles se confirma, una tarea con un spike de las opciones del overlay. El CHANGELOG lo da como limitación conocida.
2. **El calendario con VoiceOver en Safari** (`display: contents` en las filas de la cuadrícula).
3. **El arreglo del `LiveAnnouncer`** con NVDA (Pagination y Toast siguen anunciando) y en Firefox y Safari (el texto no se ve). En Chrome, comprobado otra vez en los cuatro proyectos de prueba (abajo).
4. Las comprobaciones manuales de cada componente y las decisiones por defecto: la lista ordenada de `docs/auto/grupo-2-2026-11-04.md`, «Pendiente del usuario» (puntos 4 a 20).
5. **La fecha del CHANGELOG:** la sección dice `0.3.0 (06/11/2026)`. Si publicas otro día, cámbiala antes del commit de la versión.
6. Publicar (comandos al final) y, después, avisar para mover el grupo al historial (punto 8 de la puerta).

## Plan breve (A2, no se esperó aprobación)

G2.P a `[~]` con su fila en «En curso» → D6 con la 5.17b y la spec 2 al día → CHANGELOG 0.3.0 → versión 0.3.0 en la CLI y en los ejemplos del sitio → `pnpm build`, `pnpm test`, `pnpm format:check` y presupuestos → `.tgz` en proyectos limpios fuera del repo (npm, pnpm, actualización desde la 0.2.0 de npm, sin cambios y con archivos modificados), con una página que usa los componentes y una revisión en Chrome → informe, un commit y push de la rama.

## Puerta G2.P: comprobado

| Punto                    | Evidencia                                                                                                                                                                                                                                                        |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tareas del grupo         | Todas `[x]` en `docs/plan.md` salvo 5.17a y 5.17b, en `[~]` «a falta de comprobación del usuario» (cuentan como hechas en modo autónomo, A6)                                                                                                                     |
| Spec 2 (versiones)       | Leído de `node_modules`: Angular, cli y build 22.2.4, cdk y aria 22.2.4, TypeScript 6.0.3, Tailwind 4.3.3, Vitest 4.1.11, `@lucide/angular` 1.47.0, shiki 4.4.3, pnpm 12.5.1: iguales a la tabla. **Node decía 24.15.0**: corregido a 24.18.0                    |
| Spec 4, 12 y 13          | Catálogo del Grupo 2 con los 12 componentes (más `calendar`), tablas de tokens del grupo (G2.0); la 12 no cambia                                                                                                                                                 |
| CHANGELOG                | `CHANGELOG.md`, `## 0.3.0 (06/11/2026): entradas avanzadas`                                                                                                                                                                                                      |
| Conteos                  | Script de solo lectura (fuera del repo): 36 componentes en `registry.json` y 36 en el `x-prompt` («IGUAL»); Fundamentos, Introducción y README de la CLI nombran los 36 («faltan: ninguno»). La landing (`home-page`) y el README raíz no tienen lista ni número |
| Registro y CLI           | `pnpm test`: CLI 120 / 120                                                                                                                                                                                                                                       |
| D6                       | `docs/design/correcciones-pendientes.md`: un apartado por cada componente del grupo y la 5.17a; **faltaba la 5.17b**: agregado (paneles altos, objetivo del Slider, objetivos que cumplen por espaciado)                                                         |
| `pnpm build`             | En verde, con el aviso de `main` de siempre (142,64 sobre 140 kB; lo baja la M.13)                                                                                                                                                                               |
| `pnpm test`              | En verde con Node 24 y sin `NODE_OPTIONS`: docs 158 / 158 (57 archivos), ui-core 774 / 774 (48 archivos), CLI 120 / 120                                                                                                                                          |
| `pnpm format:check`      | «All matched files use Prettier code style!»                                                                                                                                                                                                                     |
| Privacidad               | En el `.tgz` (130 archivos): ningún correo (salvo los nombres de paquetes `@angular`, `@mimi-ng`…), ninguna ruta `C:\Users` ni nombre de usuario; `author` = «Ariel O (https://github.com/nuki23)»                                                               |
| Escenarios con el `.tgz` | Abajo                                                                                                                                                                                                                                                            |

**Falta (NO COMPROBADO o para después):** los puntos manuales de arriba («Pendiente del usuario»); `ng serve` (en su lugar, el build de producción servido con un servidor estático y abierto en Chrome sin ventana); mover el grupo al historial (punto 8, lo último, después de tu comprobación); la publicación (punto 9).

## Versión 0.3.0

Cambiado:

- `packages/cli/package.json`: `"version": "0.3.0"`. De ahí salen el `version` del registro compilado (`dist/registry.json`, que es el que escribe los manifiestos de los proyectos: comprobado en el `.tgz`, `"version": "0.3.0"`) y la versión que muestra el sitio (`apps/docs/src/app/site.ts` la lee del `package.json`: la landing y la Instalación).
- `apps/docs/src/app/pages/docs/installation-page.ts`: el ejemplo de `mimi.json`, `"button": { "version": "0.3.0" }`.
- `apps/docs/src/app/pages/docs/installation-page.html`: el ejemplo del mensaje, «button actualizado de 0.2.0 a 0.3.0».

**Referencias a 0.2.0 que dejé a propósito** (búsqueda `git grep "0\.2\.0"` en todo el repo):

- Historia: `CHANGELOG.md` (su sección), `docs/historial/`, `docs/auto/`, `docs/plan/` (tareas que citan lo publicado en la 0.2.0) y la spec (`### Grupo 1 (0.2.0)`, «Nombre accesible (0.2.0)», «Piezas internas (0.2.0)», «decisión B de la 0.2.0», «Límites conocidos de la 0.2.0», «afecta a lo publicado en la 0.2.0»…).
- `apps/docs/src/app/pages/docs/foundations-page.html:476`: «Desde la 0.2.0, `data-variant` y `data-tone`…»: es cuándo cambió.
- Los ejemplos de Toast (`toast-solid.example.ts`, `toast-tones.example.ts`): «Mimi 0.2.0 trae Select y Dialog.» es el texto de demostración del diseño (`docs/design/Mimi F2 Toast Tabs Toolbar.dc.html`), no una versión.
- `packages/cli/src/utils/write-files.ts:332`: un comentario con un ejemplo de mensaje.
- `docs/proceso/release.md`: ejemplos de `X.Y.W` y el «PENDIENTE» del release de GitHub de la 0.2.0 (lo confirmas tú).
- `CLAUDE.md` (A4: «lo publicado en la 0.2.0» define qué es RUPTURA hasta que se publique la 0.3.0) y `.vscode/launch.json` (es la versión del formato de VS Code; además, `.vscode/` no entra en commits).
- `pnpm-lock.yaml`: no tiene la versión de la CLI.

## Escenarios con el `.tgz` de la 0.3.0

`npm pack` de `packages/cli` después de `pnpm build` (`mimi-ng-cli-0.3.0.tgz`, 203 kB, 130 archivos), en `C:\t\r030` (ruta corta, fuera del repo; nada entra en git). Proyectos con `@angular/cli@22 new --style=tailwind --ssr=false`. Una página (`app.ts`, escrita en el directorio temporal y copiada a cada proyecto) usa los componentes copiados, para que `ng build` compile también sus plantillas; después, el build de producción servido y abierto en Chrome sin ventana (CDP, script fuera del repo que solo lee): elementos `mimi-*` en la página, errores y avisos de consola y el anunciador del `LiveAnnouncer` después de pasar de página.

| Escenario                                             | Qué se hizo                                                                                                                                                                                                                                      | Resultado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. npm, proyecto nuevo                                | `npm i -D` del `.tgz`, `ng g @mimi-ng/cli:ng-add --icons=false`, `ng g mimi` con 20 (los 14 del grupo, más Button, Input, Select, Dialog, Pagination y Toast) y la página que los usa                                                            | **Bien.** Todos los comandos con salida 0. `ng build` con un solo aviso: el presupuesto por defecto de Angular (`initial` 500 kB; 730,57 kB, porque la página de prueba carga los 20 en el chunk inicial; no es de Mimi). En Chrome: 18 elementos `mimi-*` distintos, **0 errores y 0 avisos**, anunciador «Page 2 of 12» en 1 × 1 px, `position: absolute`                                                                                                                                                                                                                                                                                           |
| 2. pnpm, proyecto nuevo                               | Lo mismo con `pnpm dlx @angular/cli@22 new … --package-manager=pnpm`, `pnpm add -D` y `pnpm ng …`                                                                                                                                                | **Bien.** Igual que el 1 (729,32 kB, mismo aviso por defecto; 18 elementos, 0 errores, anunciador oculto). cdk y aria resueltos a 22.2.6. **Ojo, la primera corrida falló** con `ERR_PNPM_OUTDATED_LOCKFILE`: mi script ponía `CI=1`, y con eso pnpm instala con `--frozen-lockfile`. Sin `CI=1`, en verde. No es de Mimi, pero en una CI de un usuario, `ng add` y `ng g mimi` con pnpm chocan con `frozen-lockfile` (ver alertas)                                                                                                                                                                                                                   |
| 3. Actualización desde la 0.2.0 de npm, sin cambios   | `ng add @mimi-ng/cli@0.2.0 --skip-confirmation --icons=false` (de npm) y `ng g mimi button select dialog pagination toast`; `ng build`; el tema 0.2.0 no tiene `.cdk-visually-hidden` (0). Después, `npm i -D` del `.tgz` y el mismo `ng g mimi` | **Bien, sin marcar el manifiesto ni `--overwrite`:** «utils/overlay actualizado de 0.2.0 a 0.3.0», «select actualizado de 0.2.0 a 0.3.0», «theme actualizado de 0.2.0 a 0.3.0». El tema y `utils/overlay.ts`, iguales byte a byte a las plantillas (`cmp`); la regla en el tema (2) y en el CSS del build (2). Con la página de Select, Pagination y Toast: `ng build` (solo el aviso por defecto, 532,60 kB) y Chrome con 0 errores y el anunciador oculto. Sin el aviso de la M.4 (cdk y aria instalados por la 0.2.0 ≥ 22.2.4)                                                                                                                     |
| 4. Actualización con un archivo y el tema modificados | Copia del proyecto 3 antes de actualizar; una línea al final de `select/select.ts` y un token al final de `theme-base.css`; `npm i -D` del `.tgz` y el mismo `ng g mimi`                                                                         | **Bien.** «utils/overlay actualizado…»; «select no se actualizó a 0.3.0 porque modificaste … No se cambió ninguno de sus archivos…»; «pagination no se actualizó a 0.3.0: necesita select 0.3.0…»; «El tema no se actualizó a 0.3.0 porque modificaste … theme-base.css…». Select y el tema intactos (`sha1sum -c`: OK). `ng build` y Chrome: 0 errores con Select 0.2.0 y `overlay` 0.3.0. **Y el anunciador a la vista** («Page 2 of 12», `position: static`, 1264 × 24 px): el caso que explica el CHANGELOG. Con `@import "@angular/cdk/a11y-prebuilt.css";` en `styles.css` (lo que dice el CHANGELOG), el build lo deja en 1 × 1 px, `absolute` |

## Bundle y CSS

| Medición (crudo / gzip)            | Antes (`main`, `1c8e035`) | Después            |
| ---------------------------------- | ------------------------- | ------------------ |
| JS inicial                         | 337,40 / 106,14 kB        | 337,40 / 106,12 kB |
| CSS global del sitio               | 153,15 / 22,00 kB         | 153,15 / 22,00 kB  |
| `initial` (crudo)                  | 490,55 kB                 | 490,55 kB          |
| `main` (crudo)                     | 142,64 kB                 | 142,64 kB          |
| `theme-base.css` (lo que se copia) | 29 109 / 5 077 B          | 29 109 / 5 077 B   |

(«Antes», del informe del arreglo del `LiveAnnouncer`, el último commit de `main`; la diferencia de 0,02 kB en el gzip del JS es del texto de la versión, que cambia de bytes.) Techos: JS inicial 345/360, CSS global 160/175, `initial` 505/535, `main` 140/145 (aviso, sin subir: M.13). Ningún presupuesto se tocó. La tabla acumulada del grupo está en `docs/plan/grupo-2/G2.P.md`.

## Alertas para el revisor

- **La fecha del CHANGELOG** es la de hoy (06/11/2026), no la de publicación.
- **El tema modificado no recibe el arreglo del anunciador** (escenario 4): lo dice el CHANGELOG en «Antes de actualizar», pero el aviso de la CLI para el tema solo habla de «tokens nuevos». Si quieres que la CLI lo diga, es una tarea nueva (no lo cambié: la puerta no toca código).
- **La CLI instala cdk y aria con el rango de `@angular/core`** (`^22.2.0` en el `package.json` del proyecto, «Dependencias que se instalan: @angular/cdk@^22.2.0»), no con el `^22.2.4` del registro (ya anotado en la puerta del 05/11). Hoy resuelve a 22.2.6; con un lockfile fijado en 22.2.3, avisa la M.4.
- **pnpm con `CI=1`:** `ng add` y `ng g mimi` instalan paquetes, y pnpm en CI usa `--frozen-lockfile` y falla. Es el comportamiento de pnpm, no de Mimi; si se quiere, una línea en la Instalación («en CI, ejecuta `ng g mimi` en local y sube el lockfile»). No lo agregué.
- En el CHANGELOG, la primera versión que escribí decía que la versión nueva del tema quedaba en `.mimi/base/theme/`; al revisar `write-files.ts` vi que ahí queda **la anterior** (la que modificaste). Corregido antes del commit: la nueva está en `node_modules/@mimi-ng/cli/dist/templates/theme/theme-base.css`.
- No hubo decisiones por defecto nuevas ni RUPTURAS nuevas: la única RUPTURA del registro (peers de cdk y aria) está en el CHANGELOG.

## Scripts (fuera del repo, en el directorio temporal; no editan el repo)

`counts.mjs` (compara las listas de componentes), `scenarios.sh` (crea los proyectos de prueba en `C:\t\r030` y corre los comandos), `app.ts` y `app-old.ts` (las páginas de prueba, copiadas a esos proyectos), `check.mjs` (servidor estático y Chrome sin ventana por CDP, solo lectura). En el repo, todo se editó con la herramienta de archivos y `pnpm format`: no aplica la excepción de scripts de CLAUDE.md. Servidores y Chrome de prueba detenidos al terminar cada comprobación.

## Archivos

Nuevo: `docs/auto/release-0.3.0-2026-11-06.md`. Modificados: `CHANGELOG.md`, `packages/cli/package.json`, `apps/docs/src/app/pages/docs/installation-page.ts`, `apps/docs/src/app/pages/docs/installation-page.html`, `docs/spec.md`, `docs/design/correcciones-pendientes.md`, `docs/plan.md`, `docs/plan/grupo-2/G2.P.md`.

## Commit (A5)

`release: 0.3.0 lista (puerta G2.P sin publicar: CHANGELOG, versión y pruebas con el .tgz)`, con push solo de `auto/release-0.3.0-2026-11-06`.

## Publicación (la hace el usuario)

Con la rama fusionada a `main` (lo haces tú) y `git status --short` limpio, desde la raíz, en el commit de la versión: los comandos están en el mensaje final de la sesión y en `docs/proceso/release.md`.
