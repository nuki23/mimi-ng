# Historial del plan: Grupo 4 (0.8.0)

[← Índice del plan](../plan.md)

Texto de las tareas de la 0.8.0 (R.34, G4.1 a G4.3, B.8 y la puerta G4.P; la M.28 sigue en `docs/plan/mantenimiento.md`, con su estado) al cerrar la puerta (23/11/2026, rama `auto/release-0.8.0-2026-11-23`; `main` anterior: `012717a`, la fusión del PR #25, la puerta). No se edita: lo vigente está en `docs/plan.md` y en `docs/spec.md`.

**Dónde está el texto.** Este archivo era `docs/plan/grupo-4.md` (movido con `git mv`, tal cual salvo este encabezado y la G4.P en `[x]`). La R.34 está en [`grupo-4/R.34.md`](grupo-4/R.34.md) y la B.8, que vivía en `docs/plan/grupo-3-blocks.md`, en [`grupo-4/B.8.md`](grupo-4/B.8.md) (el archivo entero: lo demás ya era historia).

**Además del plan, en la 0.8.0** (pedidos del usuario durante las tandas): el paso a rem del texto de los menús y el anillo de la opción activa (dos rupturas, en el CHANGELOG con su «Cómo actualizar»); `region` automático en Accordion; el bloqueo de scroll del Sheet sin barra ni salto (`MimiSheetScrollLock`); las líneas del Stepper de borde a borde; el selector de estados de los Blocks a 360 px.

Informes del modo autónomo: `docs/auto/0.8.0-tanda1-2026-11-16.md`, `docs/auto/0.8.0-tanda2-2026-11-22.md`, `docs/auto/0.8.0-puerta-2026-11-23.md` (la puerta, con el inventario hasta la 1.0) y `docs/auto/release-0.8.0-2026-11-23.md` (el cierre y la preparación de la versión). Decisiones por defecto: `docs/auto/decisiones-por-defecto.md` (las de las dos tandas, aceptadas por el usuario el 23/11/2026).

**Lo que queda abierto** (no es parte del historial; sigue en `docs/plan.md`): lo manual de la 0.8.0 (lectores de pantalla, teléfono real), en la M.20, puntos 22 a 26; el plan hasta la 1.0, en `docs/plan/version-1.0.md`.

## Publicación de la 0.8.0 (registro)

La hizo el usuario (`docs/proceso/release.md`). Los datos los obtuvo Claude el 23/11/2026 de npm y de git (no de lo que dijo el usuario):

- `@mimi-ng/cli@0.8.0` publicada en npm el `2026-11-23T21:44:17.549Z` (UTC; las 16:44 del 23/11/2026 en Colombia, UTC−5), según `npm view @mimi-ng/cli dist-tags time --json`.
- `dist-tags`: `{ latest: '0.8.0' }`. Versiones: 0.1.0, 0.1.1, 0.2.0, 0.3.0, 0.4.0, 0.5.0, 0.6.0, 0.7.0 y 0.8.0.
- Paquete publicado: 193 archivos, 1 375 244 bytes sin empaquetar, shasum `22a846025c4400cf94b31fe71d9e2119d3f3dd1f` (`npm view @mimi-ng/cli@0.8.0 dist`): el mismo shasum y los mismos 193 archivos que el `npm pack` de la preparación (`docs/auto/release-0.8.0-2026-11-23.md`).
- Etiqueta anotada `v0.8.0` (objeto `b6164a5`) sobre `34d356a` (`Merge pull request #26 from nuki23/auto/release-0.8.0-2026-11-23`, la fusión en `main`; el último commit de la rama es `14f01a5`), según `git log -1 --oneline v0.8.0`; `git ls-remote --tags origin` la confirma.
- Release de GitHub: la creó el usuario (dato del usuario, 23/11/2026).
- Prueba desde npm: el usuario instaló y probó la 0.8.0 desde npm (dato del usuario, 23/11/2026). Los escenarios con el `.tgz` real, antes de publicar, están en `docs/auto/release-0.8.0-2026-11-23.md`.

## Grupo 4 → v0.8.0: estructura

Componentes de la spec 4 (tabla del Grupo 4) y el Block `dashboard-01` (B.8, en `docs/plan/grupo-3-blocks.md`). Era la v0.5.0 hasta la división de los Blocks (decidida por el usuario el 05/11/2026 en la G2.P), y la v0.6.0 hasta el plan de refinamiento (09/11/2026: la 0.6.0 y la 0.7.0 son `docs/plan/refinamiento/`; el Grupo 4 pasa a la **0.8.0**, sin cambios de contenido).

- [x] G4.1 Accordion (hecha el 22/11/2026 en la rama `auto/0.8.0-tanda2-2026-11-22`; informe `docs/auto/0.8.0-tanda2-2026-11-22.md`, sección 6; lo manual —lectores de pantalla—, a la M.20). Diseño: `F5 Estructura`.
  - Depende de: G3.P (spec 4: `@angular/aria/accordion`, a confirmar)
  - **Decidido por defecto (22/11/2026); aceptado por el usuario el 23/11/2026** (y `region` automático, decidido por el usuario ese día)**:** base propia, no `@angular/aria/accordion` (su foco itinerante deja una sola cabecera en el orden de Tab; la APG pide todas); los tokens de Accordion (no había tabla: los de `md` del diseño, `sm`/`lg` con el paso de las escalas). Ver `docs/auto/decisiones-por-defecto.md` y la spec 4 y 13.
- [x] G4.2 (hecha el 19/11/2026, con la R.34) Sheet/Drawer, flotante como el de shadcn (separado de los bordes, radio de tarjeta y barra de agarre en la versión inferior). Diseño: `F5 Estructura`.
  - **Decidido por el usuario (15/11/2026):** se construye **junto con la R.34** (modo móvil de los paneles, [`grupo-4/R.34.md`](grupo-4/R.34.md)), sobre la misma hoja común (`utils/sheet.ts`), con lados `left`, `right` y `bottom`; las dos abren la 0.8.0.
  - Depende de: G3.P, G1.6 (Dialog, hecha), R.34 · Bloquea: G5.1, B.8
- [x] G4.3 Stepper (hecha el 22/11/2026 en la rama `auto/0.8.0-tanda2-2026-11-22`; informe `docs/auto/0.8.0-tanda2-2026-11-22.md`, sección 7; lo manual —lectores de pantalla—, a la M.20). Diseño: `F5 Estructura`.
  - Depende de: G3.P, 2.1 (Button, hecha), G2.10
  - **Decidido por defecto (22/11/2026); aceptado por el usuario el 23/11/2026:** la API (`form` por paso con Reactive o Signal Forms reconocidos por su forma, `[mimiStepperNext]`/`[mimiStepperPrev]`, `value` como índice), los tokens (no había tabla) y que no use Progress (spec 4 lo citaba como dependencia: la línea entre pasos es propia). Ver `docs/auto/decisiones-por-defecto.md` y la spec 4 y 13.
- [x] R.34 (hecha el 19/11/2026) Modo móvil de los paneles flotantes (hoja inferior y pantalla completa). Abre la 0.8.0 junto con la G4.2 (decidido por el usuario el 15/11/2026). Detalle: [`grupo-4/R.34.md`](grupo-4/R.34.md) (movida aquí al cerrar la 0.7.0, el 16/11/2026).
  - Depende de: M.9 (cerrada), R.16 (hecha) · Bloquea: G4.2
- [x] G4.P (recorrida el 23/11/2026 en la rama `auto/0.8.0-puerta-2026-11-23`, informe `docs/auto/0.8.0-puerta-2026-11-23.md`, sección 3; revisada por el usuario con la fusión del PR #25 y cerrada el 23/11/2026 en `auto/release-0.8.0-2026-11-23`; Mimi Effects y el Grupo 5, después de la 1.0.0, decidido por el usuario ese día; lo manual, a la M.20, puntos 22 a 26; la publicación la hace el usuario) Puerta del Grupo 4 (v0.8.0): la lista de «Puerta del grupo», más decidir la versión de Mimi Effects y del Grupo 5. Con la política de rupturas (spec 12), comprueba también que la M.28 dejó el repo sin nada marcado «hasta la 1.0».
  - Depende de: R.34, G4.1 a G4.3, B.8, M.28 (en `docs/plan/mantenimiento.md`, v0.8.0)
