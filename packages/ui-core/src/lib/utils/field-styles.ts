/**
 * Estilos compartidos de los campos compuestos (12/11/2026). Van aparte de `control-styles.ts`
 * porque Button importa aquel archivo y no los necesita: así no entran en el JS de quien solo usa
 * Button. Clases completas y literales para que Tailwind las detecte.
 */

/**
 * La caja de un campo compuesto (un `<input>` dentro con botones al lado: Number Input,
 * Password…), con **los mismos tokens que Input** (spec 13, «Input»): ancho, color y hover del
 * borde, fondo, foco (`focus-within`, porque el foco está en el input de dentro), error y
 * deshabilitado. Estados en `data-invalid` y `data-disabled` de la caja. En el error, el hover no
 * tapa el borde rojo.
 */
export const fieldBoxStyles =
  'border-[length:var(--mimi-input-border-width,1px)] border-[color:var(--mimi-input-border,var(--mimi-input))] bg-[color:var(--mimi-input-bg,var(--mimi-input-background))] not-data-[disabled]:hover:border-[color:var(--mimi-input-border-hover,var(--mimi-input-hover))] focus-within:border-[color:var(--mimi-input-border-focus,var(--mimi-ring))] focus-within:ring-[length:var(--mimi-input-focus-ring-width,3px)] focus-within:ring-ring-soft data-[invalid]:border-[color:var(--mimi-input-error,var(--mimi-destructive))] data-[invalid]:hover:border-[color:var(--mimi-input-error,var(--mimi-destructive))] data-[invalid]:focus-within:border-[color:var(--mimi-input-error,var(--mimi-destructive))] data-[invalid]:focus-within:ring-destructive-ring data-[disabled]:cursor-not-allowed data-[disabled]:opacity-[var(--mimi-input-disabled-opacity,var(--mimi-disabled-opacity,0.5))]';

/**
 * Un botón pequeño dentro de un campo (− y + de Number Input, el ojo de Password): ícono atenuado
 * que pasa a `foreground` con el fondo `accent` al pasar el ratón, para que el hover se vea
 * también en claro (accent sobre el fondo del campo casi no se distingue).
 */
export const fieldButtonHoverStyles =
  'text-muted-foreground enabled:hover:text-foreground not-aria-disabled:hover:text-foreground';
