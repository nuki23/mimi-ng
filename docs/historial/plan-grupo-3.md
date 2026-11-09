# Historial del plan: Grupo 3 (v0.5.0)

Texto de las tareas del Grupo 3, de B.9 y de B.11 al cerrar la puerta (09/11/2026, rama `auto/release-0.5.0-2026-11-09`; `main` anterior: `f776941`, la fusión del PR #11). No se edita: lo vigente está en `docs/plan.md` y en `docs/spec.md`.

**Dónde está el texto.** Cada tarea con archivo propio estaba en `docs/plan/grupo-3/` (el nombre es el ID) y B.11 en `docs/plan/blocks/`. Esos archivos se movieron tal cual (`git mv`) a `docs/historial/grupo-3/` y `docs/historial/blocks/`, con su texto completo y el estado del cierre; este archivo es su índice. El texto de B.9 y de la G3.P, que no tenían archivo propio, se copió aquí abajo, tal como estaba en `docs/plan/grupo-3-blocks.md`.

- [G3.0 Catálogo de tokens del Grupo 3 en la spec 13](grupo-3/G3.0.md)
- [G3.1 Tree](grupo-3/G3.1.md)
- [G3.2 Sortable List](grupo-3/G3.2.md)
- [G3.3 Command (⌘K)](grupo-3/G3.3.md)
- [G3.4 Data Table](grupo-3/G3.4.md)
- B.9 `table-01` y G3.P Puerta del Grupo 3: el texto, abajo.
- [B.11 Los Blocks de pantalla se generan como páginas del usuario](blocks/B.11.md): va con la 0.5.0 (RUPTURA, anotada en el CHANGELOG).

Informes del modo autónomo de este grupo: `docs/auto/grupo-3-2026-11-07.md` (las tareas y la puerta, con los ocho arreglos), `docs/auto/blocks-paginas-2026-11-07.md` (B.11) y `docs/auto/release-0.5.0-2026-11-09.md` (la preparación de la versión). Decisiones por defecto: `docs/auto/decisiones-por-defecto.md`.

**Lo que queda abierto del grupo** (no es parte del historial; sigue en `docs/plan.md`): la comprobación manual (NVDA, teléfonos reales y navegadores reales de Tree, Sortable List, Command, Data Table y `table-01`, y dos hallazgos de la puerta que las pruebas no ven: la sombra de la columna fija de Data Table en RTL y Escape en Sortable List dentro de un Dialog), en la M.20, puntos 10 a 13; y las propiedades físicas de la barra y el pie de Data Table, en la M.24.

## Texto de B.9 y de la G3.P

- [x] B.9 `table-01` (tabla con filtros; usa Data Table). Diseño: `Block table-01`. Hecha el 07/11/2026 como **página** (B.9-a, decidido por defecto; B.11 pedía declararlo): `kind: page`, `Table01`, la CLI la genera como `TablePage`; detalle en `docs/auto/grupo-3-2026-11-07.md`, «B.9». Pendiente de comprobación manual: teléfono real y NVDA (M.20, punto 12).
  - Depende de: B.1, G3.4
- [x] G3.P Puerta del Grupo 3 (v0.5.0): la lista de «Puerta del grupo». **Recorrida el 07/11/2026 en modo autónomo** (manual: M.20 10 a 13; subir la versión, publicar y repetir S3 con el `.tgz` real): informe en `docs/auto/grupo-3-2026-11-07.md`, «G3.P». **Revisada por el usuario** (fusión del PR #11, 09/11/2026); la versión se subió a 0.5.0 en `docs/auto/release-0.5.0-2026-11-09.md`, que repite los escenarios con el `.tgz` real. La publicación la hace el usuario (`docs/proceso/release.md`).
  - Depende de: G3.1 a G3.4, B.9, B.P (la 0.4.0 se publicó antes)
