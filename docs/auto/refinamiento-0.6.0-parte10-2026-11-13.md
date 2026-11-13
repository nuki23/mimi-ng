# Refinamiento 0.6.0, décima tanda: revisión del sitio (rama `auto/refinamiento-0.6.0-2026-11-09`)

[← Parte 9](refinamiento-0.6.0-parte9-2026-11-12.md)

Encargo del 13/11/2026, después de que el usuario revisara el sitio y `/docs/states`. **Cambio de decisión del usuario: profundidad B** (todos los controles se hunden al hacer clic, también los de escribir), registrado como «Decidido por el usuario» en `docs/auto/decisiones-por-defecto.md`, con la A marcada como sustituida.

Un commit por punto. Playwright con `playwright-core` 1.56.1 y el Chrome instalado, **fuera del repo**, contra `pnpm ng serve docs --port 4280`, en claro y oscuro. **No se subió la versión ni se publicó nada.** Node 24.18.0.

## 1. Profundidad B

**Qué cambia:**

- `fieldBoxStyles` (Combobox, Tags Input, Number Input, Password, Input Mask) y `fieldNativeStyles` (Input, Textarea) ganan `active:scale-(--mimi-press-scale)` y `mimi-transition`, con las mismas condiciones que el halo (no en deshabilitado ni en solo lectura). Los que funcionan como botón (Select, Date Picker, Date Range, Color Picker, File Upload, Checkbox, Switch, Toggle Group, Button) ya se hundían.
- **Number Input:** se hunde **la caja entera**, también al hacer clic en la zona del número. Los − y + ya no se hunden aparte (si no, el hundimiento se sumaría). Lo mismo con el ojo de Password y la X del Combobox, que están dentro de su caja. La X del Select está fuera del botón del Select y conserva su hundimiento pequeño.
- **«Reducir movimiento»:** nada se hunde (el tema pone `--mimi-press-scale` a 1) y el halo se queda.
- `/docs/states`: el texto de arriba dice que todos se hunden. La spec («`field-styles.ts`»), los comentarios del código y el inventario dicen B.

**Prueba que falla antes:** `field-depth.spec.ts`, reescrita para la B. Contra el código de la A falló en 3 de 4 casos (las piezas de escribir sin `active:scale`, los − y + de Number Input con su propia escala, la condición de solo lectura del hundimiento); ahora pasa.

**Playwright:**

- `press.mjs`, **clics de verdad** (`mouse.down` sobre cada control de la columna «Normal» de `/docs/states`, mientras el botón sigue pulsado), claro y oscuro, con y sin «reducir movimiento»: **72 de 72 OK**, dos pasadas seguidas. Los 16 controles y el + de Number Input con `scale: 0.975` y el halo; con «reducir movimiento», sin escala y con el halo. Al terminar cada uno, la prueba comprueba también que el panel (Date Picker, Date Range, Color Picker, Select) se cierra con Escape y un clic fuera.
- `forced.mjs`, la columna «Clic» forzada: **36 de 36 OK** (todos hundidos y con halo; el texto nuevo de la página).

**Bundle:** JS inicial **334,89 kB / 106,23 kB gzip** (sin cambio); CSS global **122,70 kB / 18,17 kB gzip** (antes 122,39 / 18,15). Pruebas: ui-core 1047, docs 253, CLI 202.

Nota sobre la prueba: al principio fallaban algunos, pero por la prueba misma. `querySelector(':active')` devolvía `<html>`; las filas de abajo estaban fuera de la vista; y el Escape llegaba antes de que se abriera el panel. Se corrigió la prueba, no los componentes.
