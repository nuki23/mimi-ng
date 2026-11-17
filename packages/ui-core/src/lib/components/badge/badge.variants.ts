import { cva } from 'class-variance-authority';

/**
 * Cómo se ve el badge (spec 4, «Variante y tono»). El color va en `tone`. Sin ghost ni link: el
 * diseño no los tiene.
 */
export type BadgeVariant = 'solid' | 'soft' | 'outline';

/** De qué color es. `danger` usa los tokens `destructive`. */
export type BadgeTone = 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'danger';

/** Punto decorativo de outline (un ::before vacío: no lo leen los lectores de pantalla). */
const DOT = "gap-1.5 before:size-1.5 before:shrink-0 before:rounded-full before:content-['']";

/**
 * Colores de cada tono en cada variante. Clases completas y literales para Tailwind. Diseño:
 * docs/design/«Mimi F2 Tokens y Tonos» (Tonos en Badge). Outline lleva un punto del color del
 * tono; sin tono (secondary) es neutro, sin punto. El tono secondary no estaba en
 * el diseño: es el de Mimi (spec 13).
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
    soft: 'border-transparent bg-destructive-soft text-destructive-soft-foreground',
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
    'inline-flex h-[var(--mimi-badge-h,var(--mimi-badge-height,22px))] shrink-0 items-center gap-1 rounded-badge border px-[var(--mimi-badge-px-s,var(--mimi-badge-px,0.625rem))]',
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

/** Sin `tone`, cada variante usa su tono natural: outline es neutro (secondary). */
const NATURAL_TONE: Record<BadgeVariant, BadgeTone> = {
  solid: 'primary',
  soft: 'primary',
  outline: 'secondary',
};

/** El tono de verdad: el que se pasó o el natural de la variante. */
export function resolveBadgeTone(variant: BadgeVariant, tone: BadgeTone | undefined): BadgeTone {
  return tone ?? NATURAL_TONE[variant];
}
