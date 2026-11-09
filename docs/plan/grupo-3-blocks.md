# Plan: Blocks y Grupo 3

[← Índice del plan](../plan.md)

División decidida por el usuario el 05/11/2026 en la G2.P (opción (b)), con un ajuste por dependencias (spec 4, «Blocks»): la v0.4.0 son los Blocks que solo usan componentes ya publicados; la v0.5.0, el Grupo 3 y `table-01`; `dashboard-01` va con el Grupo 4 en la v0.6.0 (`docs/plan/grupo-4.md`). Antes (03/11/2026) salían todos en la v0.4.0, junto con el Grupo 3.

## Blocks → v0.4.0: pantallas

Hechas y cerradas el 07/11/2026 (puerta B.P; la publicación la hace el usuario). El texto de cada tarea está en `docs/historial/blocks/` (índice: `docs/historial/plan-blocks.md`).

## Grupo 3 → v0.5.0: datos

Hecho y cerrado (puerta G3.P, revisada por el usuario; versión 0.5.0 preparada el 09/11/2026, la publicación la hace el usuario). El texto de G3.0 a G3.4 está en `docs/historial/grupo-3/`, el de B.11 en `docs/historial/blocks/B.11.md`, y el de B.9 y la G3.P en `docs/historial/plan-grupo-3.md`.

## Block con el Grupo 4 → v0.6.0

- [ ] B.8 `dashboard-01` (usa Data Table; barra lateral y cajón en móvil). Diseño: `Block dashboard-01`.
  - Depende de: B.1, G3.4, G4.2 (Sheet: el botón «Abrir menú» del diseño en móvil) · Bloquea: G4.P
  - Ajuste del 05/11/2026 (pendiente de revisión del usuario): la barra lateral (`aside` de 232px) se escribe dentro del Block, como la dibuja el diseño, sin la Sidebar de dashboard del Grupo 5 (G5.1, sin versión). Alternativa: v0.5.0, con la barra inferior del diseño como única navegación móvil y sin «Abrir menú» (spec 4, «Blocks»).
  - **Hallazgo del 06/11/2026** (al detallar la 0.4.0): según la lista «Componentes» de `Mimi F6 Blocks.dc.html`, `dashboard-01` usa además **Number Ticker** (Mimi Effects, E.6, sin versión) en las cuatro estadísticas y **Timeline** (Grupo 5, G5.5, sin versión) en la actividad reciente. Ninguno estará publicado en la 0.6.0. Decidido por el usuario (07/11/2026: adopta la recomendación; era PENDIENTE DE DECIDIR) (B.8-a, al detallar la B.8): (a) números estáticos y la actividad como una lista escrita dentro del Block; (b) esperar a E.6 y G5.5. Recomendación: (a), como con la barra lateral; el sitio muestra cómo cambiarlos cuando existan.
