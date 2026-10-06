import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Clases de mimi-separator (docs/design/Mimi Componentes.dc.html, sección 8). Literales para que
 * Tailwind las detecte. Línea de 1px con el color --mimi-border. La vertical toma el alto de su
 * fila flex (align-self: stretch), como en el diseño.
 */
export const separatorVariants = cva(
  'shrink-0 bg-[color:var(--mimi-separator-color,var(--mimi-border))]',
  {
    variants: {
      orientation: {
        horizontal: 'block h-[var(--mimi-separator-size,1px)] w-full',
        vertical: 'w-[var(--mimi-separator-size,1px)] self-stretch',
      },
    },
    defaultVariants: { orientation: 'horizontal' },
  },
);

export type SeparatorOrientation = NonNullable<
  VariantProps<typeof separatorVariants>['orientation']
>;
