/**
 * Estilos compartidos de Button, Input y Textarea (docs/design, hoja de componentes).
 * Clases completas y literales para que Tailwind las detecte. Las alturas, el padding y el
 * tamaño de letra los pone cada componente con su propia cascada de tokens (spec 6.2).
 */

/** Foco de botones: contorno del color de anillo, separado 2px. */
export const buttonFocusStyles =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

/** Foco de Input y Textarea: borde de anillo y halo ring-soft de 3px. */
export const fieldFocusStyles =
  'outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring-soft';

/**
 * Deshabilitado. `disabled:` para elementos nativos; `aria-disabled:` para a[mimiBtn],
 * que además necesita pointer-events-none para no navegar.
 */
export const controlDisabledStyles =
  'disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50';

/** Inválido: borde destructive fijo y halo destructive-ring solo al enfocar. */
export const controlInvalidStyles =
  'aria-invalid:border-destructive aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:ring-destructive-ring';

/** Transición y escala al hacer clic. Solo botones. */
export const controlPressStyles = 'mimi-transition active:scale-(--mimi-press-scale)';

/**
 * La caja de un campo compuesto (un `<input>` dentro con botones al lado: Number Input,
 * Password…), con **los mismos tokens que Input** (spec 13, «Input»): ancho, color y hover del
 * borde, fondo, foco (`focus-within`, porque el foco está en el input de dentro), error y
 * deshabilitado. Estados en `data-invalid` y `data-disabled` de la caja. En el error, el hover no
 * tapa el borde rojo.
 */
export const fieldBoxStyles = [
  'border-[length:var(--mimi-input-border-width,1px)] border-[color:var(--mimi-input-border,var(--mimi-input))] bg-[color:var(--mimi-input-bg,var(--mimi-input-background))]',
  'not-data-[disabled]:hover:border-[color:var(--mimi-input-border-hover,var(--mimi-input-hover))]',
  'focus-within:border-[color:var(--mimi-input-border-focus,var(--mimi-ring))] focus-within:ring-[length:var(--mimi-input-focus-ring-width,3px)] focus-within:ring-ring-soft',
  'data-[invalid]:border-[color:var(--mimi-input-error,var(--mimi-destructive))] data-[invalid]:hover:border-[color:var(--mimi-input-error,var(--mimi-destructive))] data-[invalid]:focus-within:border-[color:var(--mimi-input-error,var(--mimi-destructive))] data-[invalid]:focus-within:ring-destructive-ring',
  'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-[var(--mimi-input-disabled-opacity,var(--mimi-disabled-opacity,0.5))]',
].join(' ');

/**
 * Un botón pequeño dentro de un campo (− y + de Number Input, el ojo de Password): ícono atenuado
 * que pasa a `foreground` con el fondo `accent` al pasar el ratón, para que el hover se vea
 * también en claro (accent sobre el fondo del campo casi no se distingue).
 */
export const fieldButtonHoverStyles =
  'text-muted-foreground enabled:hover:text-foreground not-aria-disabled:hover:text-foreground';
