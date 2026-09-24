import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Clases de mimiBadge (docs/design/Mimi Componentes.dc.html, sección 5). Literales para que
 * Tailwind las detecte. 22px de alto, 10px de padding, 12px y peso 600, radio
 * --mimi-badge-radius. Los íconos van a 12px (no están en el diseño; decidido en la tarea 2.4).
 */
export const badgeVariants = cva(
  [
    'inline-flex h-[22px] shrink-0 items-center gap-1 rounded-badge border px-2.5',
    'font-sans text-xs leading-none font-semibold whitespace-nowrap',
    '[&_svg]:pointer-events-none [&_svg]:size-3 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-border bg-transparent text-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;
