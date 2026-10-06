import { cva } from 'class-variance-authority';

/** Cómo se ve el badge (spec 4, «Variante y tono»). Sin ghost ni link: el diseño no los tiene. */
export type BadgeVariant = 'solid' | 'soft' | 'outline';

/** De qué color es. `danger` usa los tokens `destructive`. */
export type BadgeTone = 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'danger';

/**
 * Atajos de la 0.1.0, cuando el color era una variante. Siguen funcionando, sin error ni aviso:
 * `default` = solid + primary, `secondary` = solid + secondary, `destructive` = solid + danger.
 * @deprecated Se quitan en la 1.0 (spec 12). Usa `variant` y `tone`.
 */
export type BadgeVariantShortcut = 'default' | 'secondary' | 'destructive';

/** Punto decorativo de outline (un ::before vacío: no lo leen los lectores de pantalla). */
const DOT = "gap-1.5 before:size-1.5 before:shrink-0 before:rounded-full before:content-['']";

/**
 * Colores de cada tono en cada variante. Clases completas y literales para Tailwind. Diseño:
 * docs/design/«Mimi F2 Tokens y Tonos» (Tonos en Badge). Outline lleva un punto del color del
 * tono; sin tono (secondary) se ve como en la 0.1.0, sin punto. El tono secondary es
 * provisional, sin diseño (spec 13).
 */
const TONE_CLASSES = {
  primary: {
    solid: 'border-transparent bg-primary text-primary-foreground',
    soft: 'border-transparent bg-secondary text-secondary-foreground',
    outline: `border-border bg-transparent text-foreground ${DOT} before:bg-primary`,
  },
  secondary: {
    solid: 'border-transparent bg-secondary text-secondary-foreground',
    soft: 'border-transparent bg-muted text-foreground',
    outline: 'border-border bg-transparent text-foreground',
  },
  success: {
    solid: 'border-transparent bg-success text-success-foreground',
    soft: 'border-transparent bg-success-soft text-success-soft-foreground',
    outline: `border-border bg-transparent text-foreground ${DOT} before:bg-success`,
  },
  warning: {
    solid: 'border-transparent bg-warning text-warning-foreground',
    soft: 'border-transparent bg-warning-soft text-warning-soft-foreground',
    outline: `border-border bg-transparent text-foreground ${DOT} before:bg-warning`,
  },
  info: {
    solid: 'border-transparent bg-info text-info-foreground',
    soft: 'border-transparent bg-info-soft text-info-soft-foreground',
    outline: `border-border bg-transparent text-foreground ${DOT} before:bg-info`,
  },
  danger: {
    solid: 'border-transparent bg-destructive text-destructive-foreground',
    soft: 'border-transparent bg-destructive-soft-bg text-destructive-soft-foreground',
    outline: `border-border bg-transparent text-foreground ${DOT} before:bg-destructive`,
  },
} as const satisfies Record<BadgeTone, Record<BadgeVariant, string>>;

/**
 * Clases de mimiBadge (docs/design/Mimi Componentes.dc.html, sección 5). Literales para que
 * Tailwind las detecte. 22px de alto, 10px de padding, 12px y peso 600, radio
 * --mimi-badge-radius. Los íconos van a 12px (no están en el diseño; decidido en la tarea 2.4).
 */
export const badgeVariants = cva(
  [
    'inline-flex h-[var(--mimi-badge-height,22px)] shrink-0 items-center gap-1 rounded-badge border px-[var(--mimi-badge-px,0.625rem)]',
    'font-sans text-[length:var(--mimi-badge-font-size,0.75rem)] leading-none font-[weight:var(--mimi-badge-font-weight,600)] whitespace-nowrap',
    '[&_svg]:pointer-events-none [&_svg]:size-3 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: { solid: '', soft: '', outline: '' },
      tone: { primary: '', secondary: '', success: '', warning: '', info: '', danger: '' },
    },
    compoundVariants: Object.entries(TONE_CLASSES).flatMap(([tone, byVariant]) =>
      Object.entries(byVariant).map(([variant, cls]) => ({
        tone: tone as BadgeTone,
        variant: variant as BadgeVariant,
        class: cls,
      })),
    ),
    defaultVariants: { variant: 'solid', tone: 'primary' },
  },
);

/** Sin `tone`, cada variante usa su tono natural: outline es neutro, como en la 0.1.0. */
const NATURAL_TONE: Record<BadgeVariant, BadgeTone> = {
  solid: 'primary',
  soft: 'primary',
  outline: 'secondary',
};

const SHORTCUTS: Record<BadgeVariantShortcut, { variant: BadgeVariant; tone: BadgeTone }> = {
  default: { variant: 'solid', tone: 'primary' },
  secondary: { variant: 'solid', tone: 'secondary' },
  destructive: { variant: 'solid', tone: 'danger' },
};

/**
 * Resuelve variante y tono. Un atajo de la 0.1.0 gana siempre; `ignoredTone` indica que además
 * se pasó un `tone` que no se aplicó.
 */
export function resolveBadgeStyle(
  variant: BadgeVariant | BadgeVariantShortcut,
  tone: BadgeTone | undefined,
): { variant: BadgeVariant; tone: BadgeTone; ignoredTone: boolean } {
  if (variant in SHORTCUTS) {
    const shortcut = SHORTCUTS[variant as BadgeVariantShortcut];
    return { ...shortcut, ignoredTone: tone !== undefined && tone !== shortcut.tone };
  }
  const v = variant as BadgeVariant;
  return { variant: v, tone: tone ?? NATURAL_TONE[v], ignoredTone: false };
}
