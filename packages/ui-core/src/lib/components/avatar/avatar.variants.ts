import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Clases de mimi-avatar (docs/design/Mimi Componentes.dc.html, sección 6). Literales para que
 * Tailwind las detecte. Círculo con fondo --mimi-muted mientras no hay foto; sm 32px / 12px,
 * default 40px / 14px, lg 56px / 18px (el tamaño de letra lo heredan las iniciales).
 */
export const avatarVariants = cva(
  'relative inline-flex shrink-0 overflow-hidden rounded-[var(--mimi-avatar-radius,calc(infinity*1px))] bg-muted select-none',
  {
    variants: {
      size: {
        sm: 'size-[var(--mimi-avatar-size-sm,2rem)] text-xs',
        default: 'size-[var(--mimi-avatar-size,2.5rem)] text-sm',
        lg: 'size-[var(--mimi-avatar-size-lg,3.5rem)] text-lg',
      },
    },
    defaultVariants: { size: 'default' },
  },
);

export type AvatarSize = NonNullable<VariantProps<typeof avatarVariants>['size']>;

/** Estado de la imagen: sin imagen, cargando, cargada o con error. */
export type AvatarStatus = 'idle' | 'loading' | 'loaded' | 'error';
