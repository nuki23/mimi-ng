/**
 * Estilos compartidos de Button, Input y Textarea (docs/design, hoja de componentes).
 * Clases completas y literales para que Tailwind las detecte. El padding lo pone cada
 * componente: en el diseño es 16px en botones y 12px en campos.
 */

/** Altura (cascada de tokens, spec 6.2) y tamaño de letra de cada tamaño. */
export const controlSizes = {
  sm: 'h-[var(--mimi-control-height-sm,2rem)] text-[13px]',
  default: 'h-[var(--mimi-control-height,2.5rem)] text-sm',
  lg: 'h-[var(--mimi-control-height-lg,3rem)] text-[15px]',
} as const;

export type ControlSize = keyof typeof controlSizes;

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

/** Inválido: borde destructive fijo y halo destructive-soft solo al enfocar. */
export const controlInvalidStyles =
  'aria-invalid:border-destructive aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:ring-destructive-soft';

/** Transición y escala al hacer clic. Solo botones. */
export const controlPressStyles = 'mimi-transition active:scale-(--mimi-press-scale)';
