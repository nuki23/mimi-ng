import { cva } from 'class-variance-authority';
import {
  controlDisabledStyles,
  controlInvalidStyles,
  fieldFocusStyles,
} from '@/components/ui/utils/control-styles';

/**
 * Clases de mimiTextarea (docs/design/Mimi Componentes.dc.html, sección 2). Tokens propios
 * (--mimi-textarea-*) con respaldo en los de Input (--mimi-input-*): quien ya personalizó Input
 * no ve cambios. Con una fila mide lo mismo que Input y Button: alto mínimo = alto del control,
 * interlineado de 20px y padding vertical (alto − interlineado − 2 bordes) / 2.
 */
export const textareaVariants = cva([
  'block w-full min-w-0 rounded-[var(--mimi-textarea-radius,var(--mimi-input-radius,var(--mimi-radius,0.75rem)))]',
  'border-[length:var(--mimi-input-border-width,1px)] border-[color:var(--mimi-textarea-border,var(--mimi-input-border,var(--mimi-input)))] bg-[color:var(--mimi-textarea-bg,var(--mimi-input-bg,var(--mimi-input-background)))]',
  'min-h-[var(--mimi-textarea-min-height,var(--mimi-input-height,var(--mimi-control-height,2.5rem)))]',
  'px-[var(--mimi-input-px,var(--mimi-input-padding-x,0.75rem))]',
  'py-[var(--mimi-textarea-py,calc((var(--mimi-textarea-min-height,var(--mimi-input-height,var(--mimi-control-height,2.5rem)))_-_var(--mimi-textarea-line-height,1.25rem)_-_2*var(--mimi-input-border-width,1px))/2))]',
  'font-sans text-[length:var(--mimi-input-font-size,0.875rem)] leading-[var(--mimi-textarea-line-height,1.25rem)] text-[color:var(--mimi-input-fg,var(--mimi-foreground))]',
  'resize-y mimi-transition disabled:resize-none',
  'placeholder:text-[color:var(--mimi-input-placeholder,var(--mimi-input-placeholder-color,var(--mimi-muted-foreground)))]',
  fieldFocusStyles,
  'focus-visible:border-[color:var(--mimi-input-border-focus,var(--mimi-ring))]',
  'focus-visible:ring-[length:var(--mimi-input-focus-ring-width,3px)]',
  controlDisabledStyles,
  'disabled:opacity-[var(--mimi-input-disabled-opacity,var(--mimi-disabled-opacity,0.5))]',
  controlInvalidStyles,
  'aria-invalid:border-[color:var(--mimi-input-error,var(--mimi-destructive))] aria-invalid:focus-visible:border-[color:var(--mimi-input-error,var(--mimi-destructive))]',
]);
