# Plan: Grupo 3 y Blocks

[← Índice del plan](../plan.md)

## Grupo 3 y Blocks → v0.4.0: datos y pantallas

Componentes de la spec 4 (tabla del Grupo 3) y Blocks (spec 4, «Blocks»). Los Blocks salen todos en la v0.4.0, junto con el Grupo 3 (decidido el 03/11/2026, revisable en G2.P): B.1 a B.7 se pueden trabajar apenas termine el Grupo 2; B.8 y B.9 esperan a la G3.4.

- [ ] G3.1 Tree. Diseño: `F4 Command Tree Sortable`.
  - Depende de: G2.P, 2.10 (Checkbox, hecha)
- [ ] G3.2 Sortable List, con `@angular/cdk/drag-drop` y accesible con teclado. Diseño: `F4 Command Tree Sortable`.
  - Depende de: G2.P (spec 4: `@angular/cdk/drag-drop`, manejo de teclado propio)
- [ ] G3.3 Command (⌘K). Después, la tarea 5.8 (buscador de la documentación). Diseño: `F4 Command Tree Sortable`.
  - Depende de: G2.P, G1.6 (Dialog, hecha), G2.8 (lógica de lista de Combobox) · Bloquea: 5.8
- [ ] G3.4 Data Table (ordenar, filtrar, paginar, seleccionar, columnas fijas). Usa Checkbox, Dropdown Menu y Pagination. Diseño: `Data Table` (en `F4 Data Table y Pagination`).
  - Depende de: G2.P, 2.10 (Checkbox), G1.3 (Dropdown Menu), G1.11 (Pagination), 2.2 (Input); todas hechas · Bloquea: B.8, B.9
- [ ] B.1 Ítems de tipo `block` en el registro: `ng g mimi login-01` copia la pantalla y los componentes que usa.
  - Depende de: G2.P · Bloquea: B.2 a B.9
- [ ] B.2 `login-01`. Diseño: `Block login-01`.
  - Depende de: B.1
- [ ] B.3 `login-02`. Diseño: `Block login-02`.
  - Depende de: B.1
- [ ] B.4 `signup-01` (registro). Diseño: `Block signup-01`.
  - Depende de: B.1
- [ ] B.5 `otp-01` (código de verificación; usa Input OTP). Diseño: `Block otp-01`.
  - Depende de: B.1, G2.5
- [ ] B.6 `settings-01` (configuración). Diseño: `Block settings-01`.
  - Depende de: B.1
- [ ] B.7 `pricing-01` (precios). Diseño: `Block pricing-01`.
  - Depende de: B.1
- [ ] B.8 `dashboard-01` (usa Data Table: después del Grupo 3). Diseño: `Block dashboard-01`.
  - Depende de: B.1, G3.4
- [ ] B.9 `table-01` (tabla con filtros; usa Data Table: después del Grupo 3). Diseño: `Block table-01`.
  - Depende de: B.1, G3.4
- [ ] G3.P Puerta del Grupo 3 y Blocks (v0.4.0): la lista de «Puerta del grupo».
  - Depende de: G3.1 a G3.4, B.1 a B.9
