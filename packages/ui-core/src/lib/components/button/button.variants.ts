import { cva, type VariantProps } from 'class-variance-authority';
import {
  buttonFocusStyles,
  controlDisabledStyles,
  controlPressStyles,
} from '@/components/ui/utils/control-styles';

/** Cómo se ve el botón (spec 4, «Variante y tono»). */
export type ButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost' | 'link';

/** De qué color es. `danger` usa los tokens `destructive`. */
export type ButtonTone = 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'danger';

/**
 * Atajos de la 0.1.0, cuando el color era una variante. Siguen funcionando, sin error ni aviso:
 * `default` = solid + primary, `secondary` = solid + secondary, `destructive` = solid + danger.
 * @deprecated Se quitan en la 1.0 (spec 12). Usa `variant` y `tone`.
 */
export type ButtonVariantShortcut = 'default' | 'secondary' | 'destructive';

/**
 * Colores de cada tono en cada variante: una fila por tono, una entrada por variante. Todas las
 * clases van completas y literales para que Tailwind las detecte. Diseño: docs/design/
 * «Mimi F2 Tokens y Tonos» (solid, soft y outline con tono). Las celdas de secondary, ghost y
 * link con tono son provisionales, sin diseño (spec 13).
 */
const TONE_CLASSES = {
  primary: {
    solid:
      'bg-primary text-primary-foreground shadow-primary hover:not-disabled:bg-primary-hover hover:not-disabled:shadow-primary-hover active:ring-3 active:ring-ring-soft',
    soft: 'bg-secondary text-secondary-foreground hover:not-disabled:bg-primary-soft-hover',
    outline:
      'border-primary-border bg-transparent text-secondary-foreground hover:not-disabled:bg-primary-subtle',
    ghost:
      'bg-transparent text-foreground hover:not-disabled:bg-accent hover:not-disabled:text-accent-foreground',
    link: 'bg-transparent text-primary',
  },
  secondary: {
    solid:
      'bg-secondary text-secondary-foreground shadow-neutral hover:not-disabled:bg-secondary-hover hover:not-disabled:shadow-neutral-hover active:ring-3 active:ring-ring-soft',
    soft: 'bg-muted text-foreground hover:not-disabled:bg-accent hover:not-disabled:text-accent-foreground',
    outline:
      'border-border bg-card text-foreground shadow-neutral hover:not-disabled:bg-accent hover:not-disabled:text-accent-foreground hover:not-disabled:shadow-neutral-hover active:ring-3 active:ring-ring-soft',
    ghost:
      'bg-transparent text-foreground hover:not-disabled:bg-accent hover:not-disabled:text-accent-foreground',
    link: 'bg-transparent text-foreground',
  },
  success: {
    solid:
      'bg-success text-success-foreground shadow-success hover:not-disabled:bg-success-hover hover:not-disabled:shadow-success-hover active:ring-3 active:ring-success-ring',
    soft: 'bg-success-soft text-success-soft-foreground hover:not-disabled:bg-success-soft-hover',
    outline:
      'border-success-border bg-transparent text-success-soft-foreground hover:not-disabled:bg-success-subtle',
    ghost: 'bg-transparent text-success-soft-foreground hover:not-disabled:bg-success-soft',
    link: 'bg-transparent text-success-soft-foreground',
  },
  warning: {
    solid:
      'bg-warning text-warning-foreground shadow-warning hover:not-disabled:bg-warning-hover hover:not-disabled:shadow-warning-hover active:ring-3 active:ring-warning-ring',
    soft: 'bg-warning-soft text-warning-soft-foreground hover:not-disabled:bg-warning-soft-hover',
    outline:
      'border-warning-border bg-transparent text-warning-soft-foreground hover:not-disabled:bg-warning-subtle',
    ghost: 'bg-transparent text-warning-soft-foreground hover:not-disabled:bg-warning-soft',
    link: 'bg-transparent text-warning-soft-foreground',
  },
  info: {
    solid:
      'bg-info text-info-foreground shadow-info hover:not-disabled:bg-info-hover hover:not-disabled:shadow-info-hover active:ring-3 active:ring-info-ring',
    soft: 'bg-info-soft text-info-soft-foreground hover:not-disabled:bg-info-soft-hover',
    outline:
      'border-info-border bg-transparent text-info-soft-foreground hover:not-disabled:bg-info-subtle',
    ghost: 'bg-transparent text-info-soft-foreground hover:not-disabled:bg-info-soft',
    link: 'bg-transparent text-info-soft-foreground',
  },
  danger: {
    solid:
      'bg-destructive text-destructive-foreground shadow-destructive hover:not-disabled:bg-destructive-hover hover:not-disabled:shadow-destructive-hover active:ring-3 active:ring-destructive-ring',
    soft: 'bg-destructive-soft-bg text-destructive-soft-foreground hover:not-disabled:bg-destructive-soft-hover',
    outline:
      'border-destructive-border bg-transparent text-destructive-soft-foreground hover:not-disabled:bg-destructive-subtle',
    ghost:
      'bg-transparent text-destructive-soft-foreground hover:not-disabled:bg-destructive-soft-bg',
    link: 'bg-transparent text-destructive-soft-foreground',
  },
} as const satisfies Record<ButtonTone, Record<ButtonVariant, string>>;

/**
 * Clases de mimiBtn (docs/design/Mimi Componentes.dc.html, sección 1). Todas literales para
 * que Tailwind las detecte. Las medidas siguen la cascada de la spec 6.2:
 * --mimi-btn-* → --mimi-control-* / --mimi-radius → valor del diseño. La variante da la forma
 * y el tono, los colores (TONE_CLASSES).
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
        solid: '',
        soft: '',
        outline: '',
        ghost: '',
        link: 'underline-offset-4 hover:not-disabled:underline',
      },
      tone: {
        primary: '',
        secondary: '',
        success: '',
        warning: '',
        info: '',
        danger: '',
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
      // Los colores: una combinación por cada tono y variante de TONE_CLASSES.
      ...Object.entries(TONE_CLASSES).flatMap(([tone, byVariant]) =>
        Object.entries(byVariant).map(([variant, cls]) => ({
          tone: tone as ButtonTone,
          variant: variant as ButtonVariant,
          class: cls,
        })),
      ),
      // El enlace del diseño solo tiene 4px de padding horizontal.
      { variant: 'link', size: ['default', 'sm', 'lg'], class: 'px-1' },
    ],
    defaultVariants: { variant: 'solid', tone: 'primary', size: 'default' },
  },
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;
export type ButtonSize = NonNullable<ButtonVariantProps['size']>;

/** Sin `tone`, cada variante usa su tono natural: outline y ghost son neutros, como en la 0.1.0. */
const NATURAL_TONE: Record<ButtonVariant, ButtonTone> = {
  solid: 'primary',
  soft: 'primary',
  outline: 'secondary',
  ghost: 'secondary',
  link: 'primary',
};

const SHORTCUTS: Record<ButtonVariantShortcut, { variant: ButtonVariant; tone: ButtonTone }> = {
  default: { variant: 'solid', tone: 'primary' },
  secondary: { variant: 'solid', tone: 'secondary' },
  destructive: { variant: 'solid', tone: 'danger' },
};

/**
 * Resuelve variante y tono. Un atajo de la 0.1.0 gana siempre; `ignoredTone` indica que además
 * se pasó un `tone` que no se aplicó.
 */
export function resolveButtonStyle(
  variant: ButtonVariant | ButtonVariantShortcut,
  tone: ButtonTone | undefined,
): { variant: ButtonVariant; tone: ButtonTone; ignoredTone: boolean } {
  if (variant in SHORTCUTS) {
    const shortcut = SHORTCUTS[variant as ButtonVariantShortcut];
    return { ...shortcut, ignoredTone: tone !== undefined && tone !== shortcut.tone };
  }
  const v = variant as ButtonVariant;
  return { variant: v, tone: tone ?? NATURAL_TONE[v], ignoredTone: false };
}
