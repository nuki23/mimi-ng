import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Clases de mimi-avatar (docs/design/Mimi Componentes.dc.html, sección 6). Literales para que
 * Tailwind las detecte. Círculo con fondo --mimi-muted mientras no hay foto; sm 32px / 12px,
 * default 40px / 14px, lg 56px / 18px (el tamaño de letra lo heredan las iniciales).
 */
/** Diámetro y tamaño de letra de las iniciales: salen de la escala de tamaños del tema. */
const SIZE_SCALE =
  'size-[var(--mimi-avatar-s,var(--mimi-avatar-size,2.5rem))] text-[length:var(--mimi-avatar-text,0.875rem)]';

export const avatarVariants = cva(
  'relative inline-flex shrink-0 overflow-hidden rounded-[var(--mimi-avatar-radius,calc(infinity*1px))] bg-muted select-none',
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

export type AvatarSize = NonNullable<VariantProps<typeof avatarVariants>['size']>;

/** Estado de la imagen: sin imagen, cargando, cargada o con error. */
export type AvatarStatus = 'idle' | 'loading' | 'loaded' | 'error';
