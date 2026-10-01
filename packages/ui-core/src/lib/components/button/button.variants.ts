import { cva, type VariantProps } from 'class-variance-authority';
import {
  buttonFocusStyles,
  controlDisabledStyles,
  controlPressStyles,
} from '@/components/ui/utils/control-styles';

/**
 * Clases de mimiBtn (docs/design/Mimi Componentes.dc.html, sección 1). Todas literales para
 * que Tailwind las detecte. Las medidas siguen la cascada de la spec 6.2:
 * --mimi-btn-* → --mimi-control-* / --mimi-radius → valor del diseño.
 */
export const buttonVariants = cva(
  [
    'relative inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap select-none',
    'rounded-[var(--mimi-btn-radius,var(--mimi-radius,0.75rem))]',
    'border-[length:var(--mimi-btn-border-width,1px)] border-transparent',
    'font-sans leading-none font-[weight:var(--mimi-btn-font-weight,500)] tracking-[var(--mimi-btn-letter-spacing,normal)]',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    buttonFocusStyles,
    'focus-visible:outline-[length:var(--mimi-btn-focus-ring-width,2px)]',
    controlDisabledStyles,
    controlPressStyles,
    // Cargando: deshabilitado, pero con opacidad 85% y cursor de progreso (gana a disabled:).
    'aria-busy:disabled:cursor-progress aria-busy:disabled:opacity-85 aria-busy:aria-disabled:opacity-85',
  ],
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-primary hover:not-disabled:bg-primary-hover hover:not-disabled:shadow-primary-hover active:ring-3 active:ring-ring-soft',
        secondary:
          'bg-secondary text-secondary-foreground shadow-neutral hover:not-disabled:bg-secondary-hover hover:not-disabled:shadow-neutral-hover active:ring-3 active:ring-ring-soft',
        destructive:
          'bg-destructive text-destructive-foreground shadow-destructive hover:not-disabled:bg-destructive-hover hover:not-disabled:shadow-destructive-hover active:ring-3 active:ring-destructive-ring',
        outline:
          'border-border bg-card text-foreground shadow-neutral hover:not-disabled:bg-accent hover:not-disabled:text-accent-foreground hover:not-disabled:shadow-neutral-hover active:ring-3 active:ring-ring-soft',
        ghost:
          'bg-transparent text-foreground hover:not-disabled:bg-accent hover:not-disabled:text-accent-foreground',
        link: 'bg-transparent text-primary underline-offset-4 hover:not-disabled:underline',
      },
      size: {
        default:
          'h-[var(--mimi-btn-height,var(--mimi-control-height,2.5rem))] gap-2 px-[var(--mimi-btn-padding-x,1rem)] text-[length:var(--mimi-btn-font-size,0.875rem)]',
        sm: 'h-[var(--mimi-btn-height-sm,var(--mimi-control-height-sm,2rem))] gap-1.5 px-3 text-[13px]',
        lg: 'h-[var(--mimi-btn-height-lg,var(--mimi-control-height-lg,3rem))] gap-2 px-6 text-[15px]',
        icon: 'size-[var(--mimi-btn-height,var(--mimi-control-height,2.5rem))] p-0',
      },
    },
    compoundVariants: [
      // El enlace del diseño solo tiene 4px de padding horizontal.
      { variant: 'link', size: ['default', 'sm', 'lg'], class: 'px-1' },
    ],
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;
export type ButtonVariant = NonNullable<ButtonVariantProps['variant']>;
export type ButtonSize = NonNullable<ButtonVariantProps['size']>;
