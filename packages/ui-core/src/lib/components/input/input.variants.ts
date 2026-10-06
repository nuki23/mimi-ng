import { cva, type VariantProps } from 'class-variance-authority';
import {
  controlDisabledStyles,
  controlInvalidStyles,
  fieldFocusStyles,
} from '@/components/ui/utils/control-styles';

/**
 * Clases de mimiInput (docs/design/Mimi Componentes.dc.html, sección 2). Literales para que
 * Tailwind las detecte. Cascada de la spec 6.2: --mimi-input-* → --mimi-control-* /
 * --mimi-radius → valor del diseño.
 */
export const inputVariants = cva(
  [
    'w-full min-w-0 rounded-[var(--mimi-input-radius,var(--mimi-radius,0.75rem))]',
    'border-[length:var(--mimi-input-border-width,1px)] border-[color:var(--mimi-input-border,var(--mimi-input))] bg-[color:var(--mimi-input-bg,var(--mimi-input-background))]',
    'px-[var(--mimi-input-px,var(--mimi-input-padding-x,0.75rem))] font-sans text-[color:var(--mimi-input-fg,var(--mimi-foreground))] mimi-transition',
    'placeholder:text-[color:var(--mimi-input-placeholder,var(--mimi-input-placeholder-color,var(--mimi-muted-foreground)))]',
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
        sm: 'h-[var(--mimi-input-height-sm,var(--mimi-control-height-sm,2rem))] text-[13px]',
        default:
          'h-[var(--mimi-input-height,var(--mimi-control-height,2.5rem))] text-[length:var(--mimi-input-font-size,0.875rem)]',
        lg: 'h-[var(--mimi-input-height-lg,var(--mimi-control-height-lg,3rem))] text-[15px]',
      },
    },
    defaultVariants: { size: 'default' },
  },
);

export type InputSize = NonNullable<VariantProps<typeof inputVariants>['size']>;
