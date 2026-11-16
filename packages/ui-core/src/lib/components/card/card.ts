import {
  Directive,
  ElementRef,
  Renderer2,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { cn } from '@/components/ui/utils/cn';
import { MimiSized } from '@/components/ui/utils/size';

/*
 * Card como superficie (R.19, PD-1 opción B, decidida por el usuario el 09/11/2026): una directiva
 * `mimiCard` que da fondo, texto, radio, borde y sombra a **cualquier elemento** (`<section>`,
 * `<a>`, `<button>`, `<li>`…) y piezas opcionales, también directivas, sobre **tus** elementos
 * (`<h3 mimiCardTitle>`). Un solo relleno, `--mimi-card-p`, que sigue al `size` (R.1): cada pieza
 * lleva el relleno a los lados, la primera arriba y la última abajo; entre dos piezas seguidas, el
 * hueco `--mimi-card-gap` (sin reglas de «primer hijo» que dependan de qué pieza va antes).
 *
 * Los elementos de antes (`<mimi-card>`, `<mimi-card-header>`…) siguen funcionando una versión
 * más, como alias (decidido por defecto el 15/11/2026; se quitan en la 0.8.0).
 */

/** Cómo se ve la superficie. */
export type MimiCardVariant = 'outline' | 'elevated' | 'flat' | 'ghost';

/** Las piezas se reconocen por `data-card-part` (para el hueco entre dos seguidas). */
const PART = 'data-card-part';

/** Relleno de cada pieza: a los lados siempre; arriba si es la primera; abajo si es la última. */
const PART_PADDING = cn(
  'px-[var(--mimi-card-p,var(--mimi-card-padding,1.5rem))]',
  'pt-[var(--mimi-card-p,var(--mimi-card-padding,1.5rem))] [[data-card-part]+&]:pt-[var(--mimi-card-gap-s,var(--mimi-card-gap,1rem))]',
  'pb-[var(--mimi-card-p,var(--mimi-card-padding,1.5rem))] has-[+[data-card-part]]:pb-0',
);

const SURFACE = {
  outline:
    'border-[length:var(--mimi-card-border-width,1px)] border-[color:var(--mimi-card-border,var(--mimi-border))] shadow-[shadow:var(--mimi-card-shadow,var(--mimi-shadow-card))]',
  elevated:
    'border-[length:var(--mimi-card-border-width,1px)] border-transparent shadow-[shadow:var(--mimi-card-shadow-elevated,var(--mimi-shadow-popover))]',
  flat: 'border-[length:var(--mimi-card-border-width,1px)] border-transparent bg-[color:var(--mimi-card-flat-bg,var(--mimi-muted))] shadow-none',
  ghost:
    'border-[length:var(--mimi-card-border-width,1px)] border-transparent bg-transparent shadow-none',
} as const;

/** Tarjeta interactiva (un `<a>` o un `<button>` entero): hover, foco visible y clic. */
const INTERACTIVE = cn(
  'cursor-pointer text-start no-underline mimi-transition',
  'hover:border-[color:var(--mimi-card-border-hover,var(--mimi-input-hover))] hover:shadow-[shadow:var(--mimi-card-shadow-hover,var(--mimi-shadow-neutral-hover))]',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  'active:scale-(--mimi-press-scale-sm)',
  'disabled:cursor-not-allowed disabled:opacity-[var(--mimi-disabled-opacity,0.5)] aria-disabled:pointer-events-none aria-disabled:opacity-[var(--mimi-disabled-opacity,0.5)]',
);

/**
 * La superficie: `<section mimiCard>`, `<a mimiCard interactive href>`, `<button mimiCard
 * interactive>`. `variant` (`outline` por defecto, `elevated`, `flat`, `ghost`), `interactive` y
 * `size` (el relleno de las piezas, y el tamaño de los controles de dentro, como `mimiSize`).
 */
@Directive({
  selector: '[mimiCard], mimi-card',
  hostDirectives: [{ directive: MimiSized, inputs: ['size'] }],
  host: {
    '[class]': 'classes()',
    '[attr.data-variant]': 'variant()',
    '[attr.data-interactive]': 'interactive() ? "" : null',
  },
})
export class MimiCard {
  readonly variant = input<MimiCardVariant>('outline');
  readonly interactive = input(false, { transform: booleanAttribute });
  readonly userClass = input('', { alias: 'class' });

  /** `<mimi-card>` (alias de la 0.6.0) era una columna flexible: se mantiene. */
  private readonly legacy =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === 'MIMI-CARD';

  protected readonly classes = computed(() =>
    cn(
      'bg-[color:var(--mimi-card-bg,var(--mimi-card))] text-[color:var(--mimi-card-fg,var(--mimi-card-foreground))]',
      'rounded-[var(--mimi-card-radius,var(--mimi-radius-card))]',
      SURFACE[this.variant()],
      this.interactive() && INTERACTIVE,
      this.legacy && 'flex flex-col',
      this.userClass(),
    ),
  );
}

/** Encabezado: título y descripción, en columna. `<header mimiCardHeader>`. */
@Directive({
  selector: '[mimiCardHeader], mimi-card-header',
  host: { [PART]: 'header', '[class]': 'classes()' },
})
export class MimiCardHeader {
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn('flex flex-col gap-1.5', PART_PADDING, this.userClass()),
  );
}

/**
 * Título: **tu** encabezado (`<h3 mimiCardTitle>`), con el aspecto de Mimi. El elemento de antes,
 * `<mimi-card-title>`, sigue llevando `role="heading"` y `aria-level` (`level`).
 */
@Directive({
  selector: '[mimiCardTitle], mimi-card-title',
  host: { '[class]': 'classes()' },
})
export class MimiCardTitle {
  /** Solo para `<mimi-card-title>` (el alias): su `aria-level`. Con `<h3>`, el nivel es el tuyo. */
  readonly level = input(3, { transform: numberAttribute });
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn('block text-lg leading-tight font-semibold tracking-[-0.01em]', this.userClass()),
  );

  private readonly legacyHeading = (() => {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    if (element.tagName !== 'MIMI-CARD-TITLE') return null;
    const renderer = inject(Renderer2);
    if (!element.hasAttribute('role')) renderer.setAttribute(element, 'role', 'heading');
    return effect(() => renderer.setAttribute(element, 'aria-level', String(this.level())));
  })();
}

/** Descripción bajo el título. `<p mimiCardDescription>`. */
@Directive({
  selector: '[mimiCardDescription], mimi-card-description',
  host: { '[class]': 'classes()' },
})
export class MimiCardDescription {
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn('block text-sm text-muted-foreground', this.userClass()),
  );
}

/** Contenido. `<div mimiCardContent>`. */
@Directive({
  selector: '[mimiCardContent], mimi-card-content',
  host: { [PART]: 'content', '[class]': 'classes()' },
})
export class MimiCardContent {
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() => cn('block', PART_PADDING, this.userClass()));
}

/** Pie con acciones, alineadas al final. `<footer mimiCardFooter>`. */
@Directive({
  selector: '[mimiCardFooter], mimi-card-footer',
  host: { [PART]: 'footer', '[class]': 'classes()' },
})
export class MimiCardFooter {
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn('flex items-center justify-end gap-2', PART_PADDING, this.userClass()),
  );
}

/** Todas las piezas de Card, para importarlas juntas. */
export const MimiCardImports = [
  MimiCard,
  MimiCardHeader,
  MimiCardTitle,
  MimiCardDescription,
  MimiCardContent,
  MimiCardFooter,
] as const;
