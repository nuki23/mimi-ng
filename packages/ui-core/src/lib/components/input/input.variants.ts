import { cva, type VariantProps } from 'class-variance-authority';
import {
  controlDisabledStyles,
  controlInvalidStyles,
  fieldFocusStyles,
} from '@/components/ui/utils/control-styles';
import { fieldNativeStyles } from '@/components/ui/utils/field-styles';

/**
 * Clases de mimiInput (docs/design/Mimi Componentes.dc.html, sección 2). Literales para que
 * Tailwind las detecte. Cascada de la spec 6.2: --mimi-input-* → --mimi-control-* /
 * --mimi-radius → valor del diseño.
 */
/** Alto y texto de un campo: salen de la escala de tamaños del tema. */
const SIZE_SCALE =
  'h-[var(--mimi-input-h,var(--mimi-input-height,var(--mimi-control-height,2.5rem)))] text-[length:var(--mimi-input-text,var(--mimi-input-font-size,0.875rem))]';

export const inputVariants = cva(
  [
    'w-full min-w-0 rounded-[var(--mimi-input-radius,var(--mimi-radius,0.75rem))]',
    'border-[length:var(--mimi-input-border-width,1px)] border-[color:var(--mimi-input-border,var(--mimi-input))] bg-[color:var(--mimi-input-bg,var(--mimi-input-background))]',
    'px-[var(--mimi-input-px,var(--mimi-input-padding-x,0.75rem))] font-sans text-[color:var(--mimi-input-fg,var(--mimi-foreground))] mimi-transition',
    'placeholder:text-[color:var(--mimi-input-placeholder,var(--mimi-input-placeholder-color,var(--mimi-muted-foreground)))]',
    // Hover, clic (halo, sin hundirse) y solo lectura: los de todos los campos (utils/field-styles).
    fieldNativeStyles,
    fieldFocusStyles,
    'focus-visible:border-[color:var(--mimi-input-border-focus,var(--mimi-ring))]',
    'focus-visible:ring-[length:var(--mimi-input-focus-ring-width,3px)]',
    controlDisabledStyles,
    'disabled:opacity-[var(--mimi-input-disabled-opacity,var(--mimi-disabled-opacity,0.5))]',
    controlInvalidStyles,
    'aria-invalid:border-[color:var(--mimi-input-error,var(--mimi-destructive))] aria-invalid:focus-visible:border-[color:var(--mimi-input-error,var(--mimi-destructive))]',
  ],
  {
    variants: {
      size: {
        // La escala vive en el tema (`[data-size]`, theme-base.css): mismas clases, otras variables.
        sm: SIZE_SCALE,
        md: SIZE_SCALE,
        lg: SIZE_SCALE,
      },
    },
    defaultVariants: { size: 'md' },
  },
);

export type InputSize = NonNullable<VariantProps<typeof inputVariants>['size']>;
