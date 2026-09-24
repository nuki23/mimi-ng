import { cva } from 'class-variance-authority';
import {
  controlDisabledStyles,
  controlInvalidStyles,
  fieldFocusStyles,
} from '@/components/ui/utils/control-styles';

/**
 * Clases de mimiTextarea (docs/design/Mimi Componentes.dc.html, sección 2). Usa los mismos
 * tokens que Input (--mimi-input-*). Con una fila mide lo mismo que Input y Button: alto mínimo
 * = alto del control, interlineado de 20px y padding vertical (alto − 20px − 2 bordes) / 2.
 */
export const textareaVariants = cva([
  'block w-full min-w-0 rounded-[var(--mimi-input-radius,var(--mimi-radius,0.75rem))]',
  'border-[length:var(--mimi-input-border-width,1px)] border-input bg-input-background',
  'min-h-[var(--mimi-input-height,var(--mimi-control-height,2.5rem))]',
  'px-[var(--mimi-input-padding-x,0.75rem)]',
  'py-[calc((var(--mimi-input-height,var(--mimi-control-height,2.5rem))_-_20px_-_2*var(--mimi-input-border-width,1px))/2)]',
  'font-sans text-[length:var(--mimi-input-font-size,0.875rem)] leading-5 text-foreground',
  'resize-y mimi-transition disabled:resize-none',
  'placeholder:text-[color:var(--mimi-input-placeholder-color,var(--mimi-muted-foreground))]',
  fieldFocusStyles,
  'focus-visible:ring-[length:var(--mimi-input-focus-ring-width,3px)]',
  controlDisabledStyles,
  'disabled:opacity-[var(--mimi-input-disabled-opacity,0.5)]',
  controlInvalidStyles,
]);
