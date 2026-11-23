import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  numberAttribute,
} from '@angular/core';
import { cn } from '@/components/ui/utils/cn';
import { MimiSized } from '@/components/ui/utils/size';

/*
 * Accordion (G4.1; forma de referencia: docs/design/Mimi F5 Estructura.dc.html, «2 · Accordion»):
 * secciones que se abren y se cierran, una o varias a la vez. Patrón «Accordion» de la WAI-ARIA
 * APG: cada cabecera es un botón dentro de un encabezado, con `aria-expanded` y `aria-controls`, y
 * su panel es una región con `aria-labelledby`. Base propia, no `@angular/aria/accordion`
 * (decidido por defecto el 22/11/2026): aria usa foco itinerante y deja una sola cabecera en el
 * orden de Tab; la APG pide que estén todas. ↑/↓, Inicio y Fin mueven entre cabeceras (lo opcional
 * de la APG). El panel se anima con `grid-template-rows` (sin medir alturas) y, cerrado, queda
 * `inert`: ni el foco ni los lectores entran.
 */

/** Ícono de la cabecera: el chevrón gira 180° al abrir; el más gira 45° (queda una cruz). */
export type MimiAccordionIndicator = 'chevron' | 'plus';

let nextId = 0;

const ROOT_CLASSES =
  'flex flex-col overflow-hidden rounded-[var(--mimi-accordion-radius,var(--mimi-radius-card))] border border-[color:var(--mimi-accordion-border,var(--mimi-border))] bg-[color:var(--mimi-accordion-bg,var(--mimi-card))] font-sans text-foreground';

const ITEM_CLASSES =
  'block border-t border-[color:var(--mimi-accordion-border,var(--mimi-border))] first:border-t-0';

const TRIGGER_CLASSES = cn(
  'flex w-full min-h-[var(--mimi-accordion-h,52px)] cursor-pointer items-center gap-3 bg-transparent px-[var(--mimi-accordion-px,1rem)] text-left text-[length:var(--mimi-accordion-text,0.90625rem)] font-semibold text-foreground',
  'mimi-transition hover:not-aria-disabled:bg-[color:var(--mimi-accordion-hover,var(--mimi-accent))]',
  // El anillo va por dentro: el contenedor recorta lo que sale (`overflow-hidden`).
  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
  'aria-disabled:cursor-not-allowed aria-disabled:opacity-[var(--mimi-disabled-opacity,0.5)]',
  '[&_svg]:shrink-0',
);

const INDICATOR_CLASSES =
  'size-4 text-muted-foreground transition-[rotate] duration-300 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none';

const PANEL_CLASSES =
  'grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none data-[state=open]:grid-rows-[1fr]';

const CONTENT_CLASSES =
  'px-[var(--mimi-accordion-px,1rem)] pb-[var(--mimi-accordion-px,1rem)] text-[length:var(--mimi-accordion-content-text,0.84375rem)] leading-[1.6] text-pretty text-muted-foreground';

/**
 * El acordeón: un grupo de `<mimi-accordion-item>`. Con `multiple`, varios abiertos a la vez;
 * sin él, abrir uno cierra el otro (y el abierto se puede cerrar).
 *
 * ```html
 * <mimi-accordion [(value)]="abierto">
 *   <mimi-accordion-item value="envio" title="¿Cuánto tarda el envío?">De 2 a 4 días.</mimi-accordion-item>
 *   <mimi-accordion-item value="pago" title="¿Cómo pago?">Con tarjeta o transferencia.</mimi-accordion-item>
 * </mimi-accordion>
 * ```
 */
@Component({
  selector: 'mimi-accordion',
  exportAs: 'mimiAccordion',
  hostDirectives: [{ directive: MimiSized, inputs: ['size'] }],
  template: '<ng-content />',
  host: {
    '[class]': 'classes()',
    '[attr.data-multiple]': 'multiple() ? "" : null',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '[attr.data-indicator]': 'indicator()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiAccordion {
  /** Varios abiertos a la vez. Sin él, abrir uno cierra el que estaba abierto. */
  readonly multiple = input(false, { transform: booleanAttribute });
  /**
   * Lo abierto: el `value` de un ítem (o `null`) o, con `multiple`, la lista. Admite `[(value)]`.
   * Un ítem sin `value` toma uno propio (`mimi-accordion-item-<n>`).
   */
  readonly value = model<string | readonly string[] | null>(null);
  /** Todo el acordeón deshabilitado (las cabeceras siguen enfocables, con `aria-disabled`). */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** El ícono de la cabecera. */
  readonly indicator = input<MimiAccordionIndicator>('chevron');
  /** Nivel del encabezado de cada cabecera (`aria-level`), del 2 al 6; 3 por defecto. */
  readonly level = input(3, { transform: numberAttribute });
  readonly userClass = input('', { alias: 'class' });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly classes = computed(() => cn(ROOT_CLASSES, this.userClass()));

  /** Los valores abiertos, como lista. */
  readonly openValues = computed<readonly string[]>(() => {
    const value = this.value();
    if (value === null || value === undefined) return [];
    return typeof value === 'string' ? [value] : value;
  });

  isOpen(key: string): boolean {
    return this.openValues().includes(key);
  }

  /** Abre o cierra un ítem por su `value`. */
  toggle(key: string): void {
    const open = this.isOpen(key);
    if (this.multiple()) {
      const values = this.openValues();
      this.value.set(open ? values.filter((v) => v !== key) : [...values, key]);
    } else {
      this.value.set(open ? null : key);
    }
  }

  /** ↑/↓, Inicio y Fin: el foco a otra cabecera de este acordeón (con vuelta al final). */
  moveFocus(from: HTMLElement, key: string): boolean {
    const triggers = Array.from(
      this.host.querySelectorAll<HTMLElement>('[data-slot="accordion-trigger"]'),
    ).filter((t) => t.closest('mimi-accordion') === this.host);
    const index = triggers.indexOf(from);
    if (index < 0 || triggers.length === 0) return false;
    const last = triggers.length - 1;
    const next =
      key === 'Home'
        ? 0
        : key === 'End'
          ? last
          : key === 'ArrowDown'
            ? (index + 1) % triggers.length
            : key === 'ArrowUp'
              ? (index - 1 + triggers.length) % triggers.length
              : -1;
    if (next < 0) return false;
    triggers[next].focus();
    return true;
  }
}

/** Texto rico de la cabecera, en lugar de `title`: `<span mimiAccordionTitle>…</span>`. */
@Directive({ selector: '[mimiAccordionTitle]', host: { class: 'min-w-0' } })
export class MimiAccordionTitle {}

/** Algo antes del título (un ícono): `<svg mimiAccordionStart …>`. Sin controles: va en un botón. */
@Directive({ selector: '[mimiAccordionStart]', host: { 'aria-hidden': 'true' } })
export class MimiAccordionStart {}

/** Algo al final, antes del ícono (un contador, una insignia): `<span mimiAccordionEnd>`. */
@Directive({ selector: '[mimiAccordionEnd]' })
export class MimiAccordionEnd {}

/**
 * Un ítem: su cabecera (el botón) y su contenido (lo que va dentro). Atajo: `title`; para una
 * cabecera propia, las piezas `mimiAccordionTitle`, `mimiAccordionStart` y `mimiAccordionEnd`.
 */
@Component({
  selector: 'mimi-accordion-item',
  template: `
    <div role="heading" data-slot="accordion-heading" [attr.aria-level]="accordion.level()">
      <button
        type="button"
        data-slot="accordion-trigger"
        [id]="triggerId"
        [class]="triggerClasses"
        [attr.aria-expanded]="open()"
        [attr.aria-controls]="panelId"
        [attr.aria-disabled]="isDisabled() || null"
        [attr.data-state]="state()"
        (click)="onClick()"
        (keydown)="onKeydown($event)"
      >
        <ng-content select="[mimiAccordionStart]" />
        <span class="flex min-w-0 flex-1 items-center gap-2">
          {{ title() }}<ng-content select="[mimiAccordionTitle]" />
        </span>
        <ng-content select="[mimiAccordionEnd]" />
        <svg
          aria-hidden="true"
          data-slot="indicator"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          [class]="indicatorClasses()"
        >
          @if (accordion.indicator() === 'plus') {
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          } @else {
            <path d="m6 9 6 6 6-6" />
          }
        </svg>
      </button>
    </div>
    <div
      role="region"
      data-slot="accordion-panel"
      [id]="panelId"
      [class]="panelClasses"
      [attr.aria-labelledby]="triggerId"
      [attr.data-state]="state()"
      [attr.inert]="open() ? null : ''"
    >
      <div class="min-h-0 overflow-hidden">
        <div data-slot="accordion-content" [class]="contentClasses">
          <ng-content />
        </div>
      </div>
    </div>
  `,
  host: {
    '[class]': 'classes()',
    '[attr.data-state]': 'state()',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiAccordionItem {
  protected readonly accordion = inject(MimiAccordion);

  private readonly ownId = `mimi-accordion-item-${nextId++}`;
  /** Su clave en el `value` del acordeón. Sin ella, una propia. */
  readonly value = input<string | undefined>(undefined);
  /** El texto de la cabecera (el atajo). Para una cabecera propia, `mimiAccordionTitle`. */
  readonly title = input('');
  /** Deshabilitado: la cabecera sigue enfocable (`aria-disabled`), no abre ni cierra. */
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly userClass = input('', { alias: 'class' });

  readonly triggerId = `${this.ownId}-trigger`;
  readonly panelId = `${this.ownId}-panel`;

  protected readonly key = computed(() => this.value() ?? this.ownId);
  readonly open = computed(() => this.accordion.isOpen(this.key()));
  protected readonly state = computed(() => (this.open() ? 'open' : 'closed'));
  protected readonly isDisabled = computed(() => this.disabled() || this.accordion.disabled());

  protected readonly classes = computed(() => cn(ITEM_CLASSES, this.userClass()));
  protected readonly triggerClasses = TRIGGER_CLASSES;
  protected readonly panelClasses = PANEL_CLASSES;
  protected readonly contentClasses = CONTENT_CLASSES;
  protected readonly indicatorClasses = computed(() =>
    cn(
      INDICATOR_CLASSES,
      this.accordion.indicator() === 'plus'
        ? '[[data-state=open]>&]:rotate-45'
        : '[[data-state=open]>&]:rotate-180',
    ),
  );

  protected onClick(): void {
    if (this.isDisabled()) return;
    this.accordion.toggle(this.key());
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (this.accordion.moveFocus(event.currentTarget as HTMLElement, event.key)) {
      event.preventDefault();
    }
  }
}

export const MimiAccordionImports = [
  MimiAccordion,
  MimiAccordionItem,
  MimiAccordionTitle,
  MimiAccordionStart,
  MimiAccordionEnd,
] as const;
