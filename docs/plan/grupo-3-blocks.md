# Plan: Blocks y Grupo 3

[← Índice del plan](../plan.md)

División decidida por el usuario el 05/11/2026 en la G2.P (opción (b)), con un ajuste por dependencias (spec 4, «Blocks»): la v0.4.0 son los Blocks que solo usan componentes ya publicados; la v0.5.0, el Grupo 3 y `table-01`; `dashboard-01` va con el Grupo 4 en la v0.6.0 (`docs/plan/grupo-4.md`). Antes (03/11/2026) salían todos en la v0.4.0, junto con el Grupo 3.

## Blocks → v0.4.0: pantallas

Blocks de la spec 4 («Blocks») que no usan Data Table ni componentes del Grupo 4 o del Grupo 5 (revisado en los diseños el 05/11/2026). Se pueden trabajar apenas termine el Grupo 2.

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
- [ ] B.6 `settings-01` (configuración; usa Tabs, Switch y Textarea). Diseño: `Block settings-01`.
  - Depende de: B.1
- [ ] B.7 `pricing-01` (precios). Diseño: `Block pricing-01`.
  - Depende de: B.1
- [ ] B.P Puerta de los Blocks (v0.4.0): la lista de «Puerta del grupo». En el CHANGELOG de la 0.4.0, también lo de mantenimiento que sale en esta versión: la M.19 (excluir `.mimi/` del escaneo de Tailwind; el texto propuesto está en la M.19, `docs/plan/mantenimiento.md`).
  - Depende de: B.1 a B.7

## Grupo 3 → v0.5.0: datos

Componentes de la spec 4 (tabla del Grupo 3) y el Block que usa Data Table.

- [ ] G3.1 Tree. Diseño: `F4 Command Tree Sortable`.
  - Depende de: G2.P, 2.10 (Checkbox, hecha)
- [ ] G3.2 Sortable List, con `@angular/cdk/drag-drop` y accesible con teclado. Diseño: `F4 Command Tree Sortable`.
  - Depende de: G2.P (spec 4: `@angular/cdk/drag-drop`, manejo de teclado propio)
- [ ] G3.3 Command (⌘K). Después, la tarea 5.8 (buscador de la documentación). Diseño: `F4 Command Tree Sortable`.
  - Depende de: G2.P, G1.6 (Dialog, hecha), G2.8 (lógica de lista de Combobox) · Bloquea: 5.8
- [ ] G3.4 Data Table (ordenar, filtrar, paginar, seleccionar, columnas fijas). Usa Checkbox, Dropdown Menu y Pagination. Diseño: `Data Table` (en `F4 Data Table y Pagination`).
  - Depende de: G2.P, 2.10 (Checkbox), G1.3 (Dropdown Menu), G1.11 (Pagination), 2.2 (Input); todas hechas · Bloquea: B.8, B.9
- [ ] B.9 `table-01` (tabla con filtros; usa Data Table). Diseño: `Block table-01`.
  - Depende de: B.1, G3.4
- [ ] G3.P Puerta del Grupo 3 (v0.5.0): la lista de «Puerta del grupo».
  - Depende de: G3.1 a G3.4, B.9, B.P (la 0.4.0 se publica antes)

## Block con el Grupo 4 → v0.6.0

- [ ] B.8 `dashboard-01` (usa Data Table; barra lateral y cajón en móvil). Diseño: `Block dashboard-01`.
  - Depende de: B.1, G3.4, G4.2 (Sheet: el botón «Abrir menú» del diseño en móvil) · Bloquea: G4.P
  - Ajuste del 05/11/2026 (pendiente de revisión del usuario): la barra lateral (`aside` de 232px) se escribe dentro del Block, como la dibuja el diseño, sin la Sidebar de dashboard del Grupo 5 (G5.1, sin versión). Alternativa: v0.5.0, con la barra inferior del diseño como única navegación móvil y sin «Abrir menú» (spec 4, «Blocks»).
