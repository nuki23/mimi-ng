# Historial del plan: refinamiento de la 0.7.0

Texto de las tareas de la 0.7.0 (R.19 a R.23, R.25 a R.33, M.9, M.25 y la puerta R.P7) al cerrar la puerta (16/11/2026, rama `auto/release-0.7.0-2026-11-16`; `main` anterior: `1d9312b`, la fusión del PR #21, tanda 3). No se edita: lo vigente está en `docs/plan.md` y en `docs/spec.md`.

**Dónde está el texto.** Las tareas vivían en `docs/plan/refinamiento/R-0.7.0.md`. Ese archivo se movió con `git mv` a [`refinamiento/R-0.7.0.md`](refinamiento/R-0.7.0.md), con su texto completo y el estado del cierre. La **R.34** (modo móvil de los paneles) estaba en ese archivo como referencia, pero es de la 0.8.0 (decidido por el usuario el 15/11/2026): su texto vigente pasó a `docs/plan/grupo-4/R.34.md`. M.9, M.25 y M.27 son de mantenimiento: su texto sigue en `docs/plan/mantenimiento.md`, con su estado (como M.13 y M.23). Los documentos de apoyo del refinamiento (`plan.md`, `peticiones-usuario.md`, `decisiones-usuario.md`, `combobox-vs-select.md`, `uso-corto.md`) siguen en `docs/plan/refinamiento/`: son el origen de las decisiones PD-1 a PD-3, que la spec cita.

- R.19 Card como superficie `mimiCard` (PD-1, opción B; los alias `mimi-card-*` se quitaron en la 0.7.0 por la política de rupturas)
- R.20 Table de directivas (`table`, `mimiTableState`) y Data Table sobre la base (PD-2, opción C)
- R.21 Sortable List con listas conectadas (`mimi-sortable-group`)
- R.22 Block `kanban-01`
- R.23 Servicio y directiva de carga (`MimiLoadingService`, `mimiBlock`)
- R.25 Logo y favicon del sitio (lo que faltaba de la R.0)
- R.26 Tabla de la escala de tamaños en la spec (lo que faltaba de la R.1)
- R.27 Confirm con `size` (lo que faltaba de la R.7)
- R.28 Ejemplos de tamaño por componente y Blocks que heredan (lo que faltaba de la R.8)
- R.29 Ejemplos de solo lectura (lo que faltaba de la R.12)
- R.30 Form Field: ejemplos con más elementos y el diagrama (lo que faltaba de la R.14)
- R.31 Nota de contraste al cambiar el primario
- R.32 Quitar el alias `default` de `size` (RUPTURA)
- R.33 Button en carga sigue siendo enfocable (RUPTURA)
- M.9 Select sobre `MimiOptionList` (lo que faltaba de la R.15), M.25 `main` del sitio (137,99 → 98,02 kB) y M.27 `size` en Input OTP, File Upload y Color Input, en `docs/plan/mantenimiento.md`
- R.P7 Puerta de la 0.7.0

**Además del plan, en la 0.7.0** (pedidos del usuario durante las tandas, en los informes de abajo): la **política de rupturas y obsoletos** (16/11/2026; spec 12, `CLAUDE.md`, `/cerrar-grupo`), que quitó ya en la 0.7.0 los alias de Card y la compatibilidad de `utils/size`; la zona de soltar de las listas conectadas (la columna entera, con `mimiSortableHeader` y `mimiSortableFooter`); el contenedor de `kanban-01`; y el **aviso de la CLI** cuando un componente que no se actualiza (porque lo modificaste o porque necesita otro) usa una utilidad o el tema que sí se actualizaron.

Informes del modo autónomo: `docs/auto/0.7.0-tanda1-2026-11-15.md`, `docs/auto/0.7.0-tanda2-2026-11-15.md`, `docs/auto/0.7.0-tanda3-2026-11-15.md` (con la puerta R.P7, secciones 5 y 7) y `docs/auto/release-0.7.0-2026-11-16.md` (el cierre y la preparación de la versión). Decisiones por defecto: `docs/auto/decisiones-por-defecto.md` (las de las tres tandas, aceptadas por el usuario).

**Lo que queda abierto** (no es parte del historial; sigue en `docs/plan.md`): la R.34 y el Sheet (G4.2), que abren la 0.8.0; la **M.28** (quitar todo lo marcado «hasta la 1.0», v0.8.0, registrada al cerrar esta puerta); la comprobación manual (lector de pantalla, teléfono real, movimiento reducido y RTL de lo nuevo), en la M.20, puntos 19 a 21.

## Publicación de la 0.7.0 (registro)

La hizo el usuario (`docs/proceso/release.md`). Los datos los obtuvo Claude el 16/11/2026 de npm y de git (no de lo que dijo el usuario):

- `@mimi-ng/cli@0.7.0` publicada en npm el `2026-11-17T02:31:23.091Z` (UTC; las 21:31 del 16/11/2026 en Colombia, UTC−5), según `npm view @mimi-ng/cli dist-tags time --json`.
- `dist-tags`: `{ latest: '0.7.0' }`. Versiones: 0.1.0, 0.1.1, 0.2.0, 0.3.0, 0.4.0, 0.5.0, 0.6.0 y 0.7.0.
- Paquete publicado: 181 archivos, 1 240 354 bytes sin empaquetar, shasum `7d1befb7184d2dac191793302eb803e7c69cad94` (`npm view @mimi-ng/cli@0.7.0 dist`). Los 181 archivos coinciden con el `npm pack` de la preparación (`docs/auto/release-0.7.0-2026-11-16.md`, shasum `767a9fea…`); el shasum cambia porque `prepublishOnly` recompila.
- Etiqueta anotada `v0.7.0` (objeto `1db4273`) sobre `006520e` (`fix(sortable-list): el anuncio es solo para lectores de pantalla…`, el último commit de la rama `auto/release-0.7.0-2026-11-16`; la fusión del PR #22 en `main` es `640f893`, con el mismo árbol de trabajo), según `git log -1 --oneline v0.7.0`; `git ls-remote --tags origin` la confirma.
- Release de GitHub: la creó el usuario (dato del usuario, 16/11/2026).
- Prueba desde npm: el usuario instaló y probó la 0.7.0 desde npm (dato del usuario, 16/11/2026). Los escenarios con el `.tgz` real, antes de publicar, están en `docs/auto/release-0.7.0-2026-11-16.md`.
