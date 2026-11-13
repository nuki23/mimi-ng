/**
 * Los estados de los campos, en un solo juego (Parte 2 de la unificación de los controles,
 * 12/11/2026; inventario en docs/plan/controles/inventario.md). Van aparte de
 * `control-styles.ts` porque Button importa aquel archivo y no los necesita: así no entran en el
 * JS de quien solo usa Button. Clases completas y literales, cada una en un solo literal (sin
 * `[…].join()`), para que Tailwind las detecte y el empaquetador quite las que no se usan.
 *
 * Todas usan los tokens de Input (spec 13): `--mimi-input-border-width`, `--mimi-input-border`,
 * `--mimi-input-border-hover`, `--mimi-input-border-focus`, `--mimi-input-focus-ring-width`,
 * `--mimi-input-error`, `--mimi-input-disabled-opacity` y, para la solo lectura, el global
 * `--mimi-input-readonly`.
 *
 * - Borde: el de Input. Hover: el borde de hover (no en deshabilitado ni en solo lectura).
 * - Foco: borde del anillo y halo `ring-soft`, solo con el teclado en los que son botones.
 * - Clic (profundidad B, decidida por el usuario el 13/11/2026; sustituye a la A): todos se
 *   hunden (`--mimi-press-scale`, que es 1 con «reducir movimiento») y les crece el halo, como a
 *   Button, también los de escribir. En un campo compuesto se hunde la caja entera; los botones
 *   pequeños de dentro (− y +, el ojo, la X) no se hunden aparte.
 * - Deshabilitado: `--mimi-disabled-opacity` y cursor no permitido.
 * - Solo lectura: fondo propio, sin hover ni clic, cursor normal; se puede enfocar.
 * - Error: borde `destructive` (también con hover) y halo de error solo con el foco.
 */

/**
 * La caja de un campo compuesto (un `<input>` dentro: Number Input, Password, Combobox, Tags Input,
 * Input Mask). Estados en `data-invalid`, `data-disabled` y `data-readonly` de la caja; el foco,
 * con `focus-within` (está en el input de dentro). Al hacer clic en cualquier parte (el texto o un
 * botón de dentro), se hunde la caja entera.
 */
export const fieldBoxStyles =
  'mimi-transition not-data-[disabled]:not-data-[readonly]:active:scale-(--mimi-press-scale) border-[length:var(--mimi-input-border-width,1px)] border-[color:var(--mimi-input-border,var(--mimi-input))] bg-[color:var(--mimi-input-bg,var(--mimi-input-background))] not-data-[disabled]:not-data-[readonly]:hover:border-[color:var(--mimi-input-border-hover,var(--mimi-input-hover))] focus-within:border-[color:var(--mimi-input-border-focus,var(--mimi-ring))] focus-within:ring-[length:var(--mimi-input-focus-ring-width,3px)] focus-within:ring-ring-soft not-data-[disabled]:not-data-[readonly]:active:ring-[length:var(--mimi-input-focus-ring-width,3px)] not-data-[disabled]:not-data-[readonly]:active:ring-ring-soft data-[invalid]:border-[color:var(--mimi-input-error,var(--mimi-destructive))] data-[invalid]:hover:border-[color:var(--mimi-input-error,var(--mimi-destructive))] data-[invalid]:focus-within:border-[color:var(--mimi-input-error,var(--mimi-destructive))] data-[invalid]:focus-within:ring-destructive-ring data-[disabled]:cursor-not-allowed data-[disabled]:opacity-[var(--mimi-input-disabled-opacity,var(--mimi-disabled-opacity,0.5))] data-[readonly]:cursor-default data-[readonly]:bg-[color:var(--mimi-input-readonly)]';

/**
 * Lo que Input y Textarea añaden a sus clases: el hover, el clic (se hunde y le crece el halo) y la
 * solo lectura del `<input readonly>` nativo. El borde, el foco, el error y el deshabilitado ya los
 * ponen sus variantes con los mismos tokens.
 */
export const fieldNativeStyles =
  'mimi-transition not-disabled:not-[[readonly]]:active:scale-(--mimi-press-scale) not-disabled:not-[[readonly]]:hover:border-[color:var(--mimi-input-border-hover,var(--mimi-input-hover))] aria-invalid:hover:border-[color:var(--mimi-input-error,var(--mimi-destructive))] not-disabled:not-[[readonly]]:active:ring-[length:var(--mimi-input-focus-ring-width,3px)] not-disabled:not-[[readonly]]:active:ring-ring-soft [&[readonly]]:cursor-default [&[readonly]]:bg-[color:var(--mimi-input-readonly)]';

/**
 * Un `<button>` con aspecto de campo (el disparador de Date Picker, Date Range y Color Picker):
 * los estados de Input, el foco solo con el teclado (`focus-visible`), y al hacer clic se hunde y le
 * crece el halo (funciona como botón). Error con `aria-invalid`; solo lectura con `aria-readonly`.
 */
export const fieldTriggerStyles =
  'outline-none border-[length:var(--mimi-input-border-width,1px)] border-[color:var(--mimi-input-border,var(--mimi-input))] bg-[color:var(--mimi-input-bg,var(--mimi-input-background))] mimi-transition not-disabled:not-aria-readonly:hover:border-[color:var(--mimi-input-border-hover,var(--mimi-input-hover))] focus-visible:border-[color:var(--mimi-input-border-focus,var(--mimi-ring))] focus-visible:ring-[length:var(--mimi-input-focus-ring-width,3px)] focus-visible:ring-ring-soft not-disabled:not-aria-readonly:active:scale-(--mimi-press-scale) not-disabled:not-aria-readonly:active:ring-[length:var(--mimi-input-focus-ring-width,3px)] not-disabled:not-aria-readonly:active:ring-ring-soft aria-invalid:border-[color:var(--mimi-input-error,var(--mimi-destructive))] aria-invalid:hover:border-[color:var(--mimi-input-error,var(--mimi-destructive))] aria-invalid:focus-visible:border-[color:var(--mimi-input-error,var(--mimi-destructive))] aria-invalid:focus-visible:ring-destructive-ring disabled:cursor-not-allowed disabled:opacity-[var(--mimi-input-disabled-opacity,var(--mimi-disabled-opacity,0.5))] aria-readonly:cursor-default aria-readonly:bg-[color:var(--mimi-input-readonly)]';

/**
 * La caja del Select (el botón de dentro tiene el foco): los mismos estados que
 * `fieldTriggerStyles`, leídos de los `data-*` de la caja. `data-focus-visible` lo pone el Select
 * con el origen del foco (FocusMonitor): solo con el teclado o desde el código.
 */
export const fieldTriggerBoxStyles =
  'border-[length:var(--mimi-input-border-width,1px)] border-[color:var(--mimi-input-border,var(--mimi-input))] bg-[color:var(--mimi-input-bg,var(--mimi-input-background))] not-data-[disabled]:not-data-[readonly]:hover:border-[color:var(--mimi-input-border-hover,var(--mimi-input-hover))] data-[focus-visible]:border-[color:var(--mimi-input-border-focus,var(--mimi-ring))] data-[focus-visible]:ring-[length:var(--mimi-input-focus-ring-width,3px)] data-[focus-visible]:ring-ring-soft not-data-[disabled]:not-data-[readonly]:has-[[role=combobox]:active]:scale-(--mimi-press-scale) not-data-[disabled]:not-data-[readonly]:has-[[role=combobox]:active]:ring-[length:var(--mimi-input-focus-ring-width,3px)] not-data-[disabled]:not-data-[readonly]:has-[[role=combobox]:active]:ring-ring-soft data-[invalid]:border-[color:var(--mimi-input-error,var(--mimi-destructive))] data-[invalid]:hover:border-[color:var(--mimi-input-error,var(--mimi-destructive))] data-[invalid]:data-[focus-visible]:border-[color:var(--mimi-input-error,var(--mimi-destructive))] data-[invalid]:data-[focus-visible]:ring-destructive-ring data-[disabled]:cursor-not-allowed data-[disabled]:opacity-[var(--mimi-input-disabled-opacity,var(--mimi-disabled-opacity,0.5))] data-[readonly]:bg-[color:var(--mimi-input-readonly)]';

/**
 * Un botón pequeño dentro de un campo (− y + de Number Input, el ojo de Password): ícono atenuado
 * que pasa a `foreground` con el fondo `accent` al pasar el ratón, para que el hover se vea
 * también en claro (accent sobre el fondo del campo casi no se distingue).
 */
export const fieldButtonHoverStyles =
  'text-muted-foreground enabled:hover:text-foreground not-aria-disabled:hover:text-foreground';

/**
 * Clic de los controles de elegir (Checkbox, Switch, los ítems de Toggle Group): se hunden poco
 * (`--mimi-press-scale-sm`) y les crece el halo, como a Button. En solo lectura, nada.
 */
export const choicePressStyles =
  'not-disabled:not-aria-readonly:active:scale-(--mimi-press-scale-sm) not-disabled:not-aria-readonly:active:ring-3 not-disabled:not-aria-readonly:active:ring-ring-soft aria-readonly:cursor-default';
