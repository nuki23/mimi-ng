# Plan: Grupo 4

[← Índice del plan](../plan.md)

## Grupo 4 → v0.8.0: estructura

Componentes de la spec 4 (tabla del Grupo 4) y el Block `dashboard-01` (B.8, en `docs/plan/grupo-3-blocks.md`). Era la v0.5.0 hasta la división de los Blocks (decidida por el usuario el 05/11/2026 en la G2.P), y la v0.6.0 hasta el plan de refinamiento (09/11/2026: la 0.6.0 y la 0.7.0 son `docs/plan/refinamiento/`; el Grupo 4 pasa a la **0.8.0**, sin cambios de contenido).

- [ ] G4.1 Accordion. Diseño: `F5 Estructura`.
  - Depende de: G3.P (spec 4: `@angular/aria/accordion`, a confirmar)
- [ ] G4.2 Sheet/Drawer, flotante como el de shadcn (separado de los bordes, radio de tarjeta y barra de agarre en la versión inferior). Diseño: `F5 Estructura`.
  - **Decidido por el usuario (15/11/2026):** se construye **junto con la R.34** (modo móvil de los paneles, [`grupo-4/R.34.md`](grupo-4/R.34.md)), sobre la misma hoja común (`utils/sheet.ts`), con lados `left`, `right` y `bottom`; las dos abren la 0.8.0.
  - Depende de: G3.P, G1.6 (Dialog, hecha), R.34 · Bloquea: G5.1, B.8
- [ ] G4.3 Stepper. Diseño: `F5 Estructura`.
  - Depende de: G3.P, 2.1 (Button, hecha), G2.10
- [ ] R.34 Modo móvil de los paneles flotantes (hoja inferior y pantalla completa). Abre la 0.8.0 junto con la G4.2 (decidido por el usuario el 15/11/2026). Detalle: [`grupo-4/R.34.md`](grupo-4/R.34.md) (movida aquí al cerrar la 0.7.0, el 16/11/2026).
  - Depende de: M.9 (cerrada), R.16 (hecha) · Bloquea: G4.2
- [ ] G4.P Puerta del Grupo 4 (v0.8.0): la lista de «Puerta del grupo», más decidir la versión de Mimi Effects y del Grupo 5. Con la política de rupturas (spec 12), comprueba también que la M.28 dejó el repo sin nada marcado «hasta la 1.0».
  - Depende de: R.34, G4.1 a G4.3, B.8, M.28 (en `docs/plan/mantenimiento.md`, v0.8.0)
