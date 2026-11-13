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
  'disabled:cursor-not-allowed disabled:opacity-[var(--mimi-disabled-opacity,0.5)] aria-disabled:pointer-events-none aria-disabled:opacity-[var(--mimi-disabled-opacity,0.5)]';

/** Inválido: borde destructive fijo y halo destructive-ring solo al enfocar. */
export const controlInvalidStyles =
  'aria-invalid:border-destructive aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:ring-destructive-ring';

/**
 * Clic de un control que funciona como botón (profundidad B, decidida por el usuario el
 * 13/11/2026): se hunde (`--mimi-press-scale`, que es 1 con «reducir movimiento») y le crece el
 * halo, como a Button. Los campos lo traen en `utils/field-styles.ts`; esta pieza queda para
 * botones propios.
 */
export const controlPressStyles =
  'mimi-transition active:scale-(--mimi-press-scale) active:ring-3 active:ring-ring-soft';
