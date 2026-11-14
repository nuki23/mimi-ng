import { FocusKeyManager, type FocusableOption } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  isDevMode,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { cva } from 'class-variance-authority';
import { cn } from '@/components/ui/utils/cn';
import { MimiSized } from '@/components/ui/utils/size';
import { buttonFocusStyles } from '@/components/ui/utils/control-styles';

/*
 * Toggle Group (docs/design/Mimi F3 Archivos Tags Toggle Color.dc.html, «11 · Toggle Group ·
 * control segmentado»; prefijo de tokens `toggle-group`, spec 13).
 *
 * Simple: patrón «Radio Group» de la APG (`radiogroup` y `radio`, una sola parada de Tab, las
 * flechas mueven el foco y eligen, con vuelta). Múltiple: botones de alternancia (`aria-pressed`),
 * cada uno con su parada de Tab. El foco itinerante usa el FocusKeyManager de @angular/cdk/a11y
 * (como mimi-toolbar, G1.10): @angular/aria no tiene un grupo de radio propio (plan, G2.1).
 *
 * Un solo `value` (spec 8, «Valor simple o múltiple»): `T | null` en simple y `T[]` con
 * `multiple`. Los botones son del usuario y nativos: Espacio y el clic funcionan sin rodeos.
 */

/** `default`: el elegido sobre `card`. `solid`: el elegido en `primary` (el diseño la llama así). */
export type MimiToggleGroupVariant = 'default' | 'solid';

const groupVariants = cva(
  [
    'relative isolate items-stretch align-middle font-sans',
    'gap-[var(--mimi-toggle-group-gap,2px)] p-[var(--mimi-toggle-group-padding,3px)]',
    'rounded-[calc(var(--mimi-toggle-group-radius,var(--mimi-radius))_+_var(--mimi-toggle-group-padding,3px))]',
    'bg-[color:var(--mimi-toggle-group-bg,var(--mimi-muted))] mimi-transition',
    // Deshabilitado: el grupo entero (el diseño no tiene ítems deshabilitados de a uno).
    'data-disabled:cursor-not-allowed data-disabled:opacity-[var(--mimi-disabled-opacity,0.5)]',
    // Error del formulario (sin diseño, plan D6): un filo de 1px como el borde de Input (el grupo
    // no tiene borde; Switch hace lo mismo).
    'data-invalid:ring-1 data-invalid:ring-[color:var(--mimi-input-error,var(--mimi-destructive))]',
  ],
  {
    variants: {
      // Simple: columnas iguales (el indicador se desplaza su propio ancho). Múltiple: a lo ancho
      // de cada ítem, como el diseño («Texto e ícono · múltiple»).
      multiple: {
        false: 'inline-grid grid-flow-col auto-cols-fr',
        true: 'inline-flex',
      },
    },
    defaultVariants: { multiple: false },
  },
);

/*
 * Las clases de cada estado se eligen en TypeScript (no con `data-[…]:` encadenados) y la
 * geometría del indicador va en `style`: el mismo aspecto con menos CSS global (G2.1, spec 10).
 */

/** Fondo y sombra del elegido: el indicador (simple) o cada botón (múltiple). */
const SELECTED_SURFACE: Record<MimiToggleGroupVariant, string> = {
  default:
    'bg-[color:var(--mimi-toggle-group-indicator,var(--mimi-card))] shadow-[shadow:var(--mimi-toggle-group-indicator-shadow,var(--mimi-shadow-neutral))]',
  solid: 'bg-primary shadow-primary',
};

/** El indicador de la selección simple (su posición y su ancho van en `style`). */
const INDICATOR_CLASSES =
  'pointer-events-none absolute -z-1 rounded-[var(--mimi-toggle-group-radius,var(--mimi-radius))] transition-[translate,background-color] duration-[450ms] motion-reduce:transition-none';

/**
 * Posición del indicador: a un relleno del borde; ancho de una columna, (100% − 2 × relleno −
 * (n − 1) × separación) / n; se desplaza un ancho más una separación por ítem (en RTL, al revés).
 */
const PAD = 'var(--mimi-toggle-group-padding, 3px)';
const GAP = 'var(--mimi-toggle-group-gap, 2px)';
const INDICATOR_STYLE = {
  top: PAD,
  bottom: PAD,
  start: PAD,
  width: `calc((100% - 2 * ${PAD} - (var(--mimi-toggle-group-count) - 1) * ${GAP}) / var(--mimi-toggle-group-count))`,
  easing: 'var(--mimi-toggle-group-spring, cubic-bezier(.3, 1.35, .5, 1))',
} as const;

const ITEM_CLASSES = cn(
  'relative inline-flex min-w-[var(--mimi-toggle-group-icon-width,44px)] cursor-pointer items-center justify-center gap-1.5 border-0 bg-transparent whitespace-nowrap',
  'h-[var(--mimi-toggle-h,var(--mimi-toggle-group-item-height,32px))] px-[var(--mimi-toggle-px,var(--mimi-toggle-group-item-px,12px))]',
  'rounded-[var(--mimi-toggle-group-radius,var(--mimi-radius))]',
  'text-[length:var(--mimi-toggle-group-font-size,13.5px)] font-medium text-[color:var(--mimi-toggle-group-fg,var(--mimi-muted-foreground))]',
  '[&_svg]:size-4 [&_svg]:shrink-0',
  // Hover y clic, no en solo lectura (el grupo lleva data-readonly).
  'mimi-transition enabled:not-in-data-readonly:hover:text-[color:var(--mimi-toggle-group-active-fg,var(--mimi-foreground))]',
  // La opción no elegida, además, un fondo suave (13/11/2026); la elegida ya tiene el indicador.
  'enabled:not-in-data-readonly:data-[state=off]:hover:bg-[color:color-mix(in_oklab,var(--mimi-foreground)_6%,transparent)]',
  // Clic: se hunde poco y le crece el halo, como Button (utils/field-styles, profundidad B).
  'enabled:not-in-data-readonly:active:scale-(--mimi-press-scale-sm) enabled:not-in-data-readonly:active:ring-3 enabled:not-in-data-readonly:active:ring-ring-soft',
  'disabled:cursor-not-allowed in-data-readonly:cursor-default',
  buttonFocusStyles,
);

/** Elegido: más peso y el color activo; en `solid`, el texto sobre primary. */
const ON_TEXT: Record<MimiToggleGroupVariant, string> = {
  default: 'font-semibold text-[color:var(--mimi-toggle-group-active-fg,var(--mimi-foreground))]',
  solid: 'font-semibold text-primary-foreground enabled:hover:text-primary-foreground',
};

/**
 * Un botón del grupo: `<button mimiToggleGroupItem="semanal">Semanal</button>`. El contenido
 * (texto, ícono o los dos) y el `aria-label` (si no tiene texto) son del usuario.
 */
@Directive({
  selector: 'button[mimiToggleGroupItem]',
  host: {
    type: 'button',
    '[attr.role]': 'group.multiple() ? null : "radio"',
    '[attr.aria-checked]': 'group.multiple() ? null : on()',
    '[attr.aria-pressed]': 'group.multiple() ? on() : null',
    '[attr.tabindex]': 'tabIndex()',
    '[disabled]': 'group.disabled()',
    '[attr.data-state]': 'on() ? "on" : "off"',
    '[attr.data-variant]': 'group.variant()',
    '[attr.data-multiple]': 'group.multiple() ? "" : null',
    '[attr.data-disabled]': 'group.disabled() ? "" : null',
    '[class]': 'classes()',
    '(click)': 'group.select(this)',
  },
})
export class MimiToggleGroupItem implements FocusableOption {
  /** El valor del botón (único en el grupo). */
  readonly value = input<unknown>(undefined, { alias: 'mimiToggleGroupItem' });
  /** Clases del botón, mezcladas con `cn()` (gana la del usuario). */
  readonly userClass = input('', { alias: 'class' });

  /** Uso interno. */
  readonly element = inject<ElementRef<HTMLButtonElement>>(ElementRef).nativeElement;
  protected readonly group = inject(MimiToggleGroup);

  /** Para el FocusKeyManager. */
  get disabled(): boolean {
    return this.group.disabled();
  }

  protected readonly on = computed(() => this.group.isOn(this.value()));
  protected readonly classes = computed(() => {
    const variant = this.group.variant();
    const on = this.on();
    return cn(
      ITEM_CLASSES,
      on && ON_TEXT[variant],
      // Múltiple: cada elegido lleva su fondo (no hay indicador que se desliza).
      on && this.group.multiple() && SELECTED_SURFACE[variant],
      this.userClass(),
    );
  });
  /** Simple: solo el elegido (o el primero) es parada de Tab. Múltiple: todos. */
  protected readonly tabIndex = computed(() =>
    this.group.multiple() ? null : this.group.isTabStop(this) ? 0 : -1,
  );

  focus(): void {
    this.element.focus();
  }
}

/**
 * Toggle Group:
 *
 * ```html
 * <mimi-toggle-group aria-label="Periodo" [(value)]="periodo">
 *   <button mimiToggleGroupItem="dia">Diario</button>
 *   <button mimiToggleGroupItem="semana">Semanal</button>
 * </mimi-toggle-group>
 *
 * <mimi-toggle-group aria-label="Formato" multiple [(value)]="estilos">
 *   <button mimiToggleGroupItem="negrita" aria-label="Negrita"><svg lucideBold></svg></button>
 * </mimi-toggle-group>
 * ```
 *
 * Implementa `FormValueControl`: funciona con `[formField]`, `formControlName` y `[(ngModel)]`.
 * Un valor sin botón se conserva (no se cambia por `null`).
 */
@Component({
  selector: 'mimi-toggle-group',
  hostDirectives: [{ directive: MimiSized, inputs: ['size'] }],
  template: `
    @if (!multiple()) {
      <span
        aria-hidden="true"
        data-slot="indicator"
        [class]="indicatorClasses()"
        [style.top]="indicatorStyle.top"
        [style.bottom]="indicatorStyle.bottom"
        [style.inset-inline-start]="indicatorStyle.start"
        [style.width]="indicatorStyle.width"
        [style.transition-timing-function]="indicatorStyle.easing"
        [style.translate]="indicatorTranslate()"
        [attr.data-variant]="variant()"
        [hidden]="paintedIndex() < 0"
      ></span>
    }
    <ng-content />
  `,
  host: {
    '[attr.role]': 'multiple() ? "group" : "radiogroup"',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-labelledby]': 'ariaLabelledby() || null',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    // aria-readonly vale en el radiogrupo (simple), no en el grupo de interruptores (múltiple).
    '[attr.aria-readonly]': 'readonly() && !multiple() ? "true" : null',
    '[attr.data-readonly]': 'readonly() ? "" : null',
    '[attr.aria-invalid]': 'showInvalid() ? "true" : null',
    '[attr.aria-required]': 'required() && !multiple() ? "true" : null',
    '[attr.data-variant]': 'variant()',
    '[attr.data-multiple]': 'multiple() ? "" : null',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '[attr.data-invalid]': 'showInvalid() ? "" : null',
    '[style.--mimi-toggle-group-count]': 'items().length',
    '[style.--mimi-toggle-group-index]': 'paintedIndex()',
    '[class]': 'classes()',
    '(keydown)': 'onKeydown($event)',
    '(focusin)': 'onFocusIn($event)',
    '(focusout)': 'onFocusOut($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiToggleGroup<T = unknown> implements FormValueControl<T | null | T[]> {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** El elegido (`T | null`) o, con `multiple`, los elegidos (`T[]`). Admite `[(value)]`. */
  readonly value = model<T | null | T[]>(null);
  /** Varios elegidos a la vez (botones de alternancia). Sin él, uno solo (como una radio). */
  readonly multiple = input(false, { transform: booleanAttribute });
  /** `solid`: el elegido en `primary`. */
  readonly variant = input<MimiToggleGroupVariant>('default');
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Solo lectura (R.12): se ve lo elegido y las flechas mueven el foco, pero no cambia. */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Los pasa el formulario. Se muestra el error si es inválido y se tocó o modificó. */
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly touched = input(false, { transform: booleanAttribute });
  readonly dirty = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  /** Nombre accesible (obligatorio, o `aria-labelledby`). */
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string>(undefined, { alias: 'aria-labelledby' });
  /** Clases del grupo, mezcladas con `cn()` (gana la del usuario). */
  readonly userClass = input('', { alias: 'class' });

  /** Se emite cuando el foco sale del grupo entero: marca el control como tocado. */
  readonly touch = output<void>();

  private readonly found = contentChildren(MimiToggleGroupItem, { descendants: true });
  /** En el orden del documento. 4 es `Node.DOCUMENT_POSITION_FOLLOWING` (sin `Node` en el servidor). */
  protected readonly items = computed(() =>
    [...this.found()].sort((a, b) => (a.element.compareDocumentPosition(b.element) & 4 ? -1 : 1)),
  );

  private readonly dir = inject(Directionality).valueSignal;
  private readonly manager = new FocusKeyManager(this.items, inject(Injector))
    .withWrap()
    .withVerticalOrientation(true);
  /** El último botón enfocado (por teclado, clic o código). */
  private readonly active = signal<MimiToggleGroupItem | null>(null);

  /** Los elegidos, como arreglo en los dos modos. */
  private readonly selected = computed<readonly unknown[]>(() => {
    const value = this.value();
    if (this.multiple()) return Array.isArray(value) ? value : [];
    return value === null || value === undefined || Array.isArray(value) ? [] : [value];
  });
  /** Índice del elegido (simple), para el indicador; −1 sin elegido o con un valor sin botón. */
  protected readonly paintedIndex = computed(() => {
    const [value] = this.selected();
    return this.selected().length ? this.items().findIndex((i) => Object.is(i.value(), value)) : -1;
  });
  /** La parada de Tab en simple: el elegido; si no hay, el último enfocado o el primero. */
  private readonly tabStop = computed(() => {
    const items = this.items();
    const index = this.paintedIndex();
    if (index >= 0) return items[index];
    const active = this.active();
    return active && items.includes(active) ? active : items[0];
  });
  /** Error visible (inválido y tocado o modificado). */
  protected readonly showInvalid = computed(
    () => this.invalid() && (this.touched() || this.dirty()),
  );

  protected readonly indicatorClasses = computed(() =>
    cn(INDICATOR_CLASSES, SELECTED_SURFACE[this.variant()]),
  );
  // Bindings `[style.x]` sueltas: un `[style]` de objeto traería otra instrucción de
  // @angular/core al JS inicial del showcase (spec 10).
  protected readonly indicatorStyle = INDICATOR_STYLE;
  protected readonly indicatorTranslate = computed(
    () =>
      `calc(${this.dir() === 'rtl' ? -1 : 1} * var(--mimi-toggle-group-index) * (100% + ${GAP})) 0`,
  );
  protected readonly classes = computed(() =>
    cn(groupVariants({ multiple: this.multiple() }), this.userClass()),
  );

  constructor() {
    effect(() => this.manager.withHorizontalOrientation(this.dir()));
    inject(DestroyRef).onDestroy(() => this.manager.destroy());
    if (isDevMode()) afterRenderEffect({ read: () => this.warn(this.items(), this.value()) });
  }

  /** Uso interno: ¿está elegido este valor? */
  isOn(value: unknown): boolean {
    return this.selected().some((v) => Object.is(v, value));
  }

  /** Uso interno: ¿lleva `tabindex="0"` (simple)? */
  isTabStop(item: MimiToggleGroupItem): boolean {
    return this.tabStop() === item;
  }

  /** Uso interno: el clic (y Espacio o Enter, que el navegador convierte en clic). */
  select(item: MimiToggleGroupItem): void {
    if (this.disabled() || this.readonly()) return;
    const value = item.value() as T;
    if (this.multiple()) {
      const current = this.selected() as T[];
      this.value.set(
        current.some((v) => Object.is(v, value))
          ? current.filter((v) => !Object.is(v, value))
          : [...current, value],
      );
      return;
    }
    // Como una radio: volver a pulsar la elegida no la quita (decidido por defecto, G2.1).
    if (!this.isOn(value)) this.value.set(value);
  }

  /** Simple: las flechas mueven el foco y eligen (con vuelta; en RTL, ← y → al revés). */
  protected onKeydown(event: KeyboardEvent): void {
    if (this.multiple() || this.disabled()) return;
    if (!this.items().some((item) => item.element === event.target)) return;
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    this.manager.onKeydown(event);
    const item = this.manager.activeItem;
    if (item) {
      this.active.set(item);
      this.select(item);
    }
  }

  /** El foco llegó a un botón (Tab, clic o código): el gestor sigue desde ahí. */
  protected onFocusIn(event: FocusEvent): void {
    const item = this.items().find((i) => i.element === event.target);
    if (!item) return;
    this.manager.updateActiveItem(item);
    this.active.set(item);
  }

  /** El foco salió del grupo entero. */
  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && this.host.contains(next)) return;
    this.touch.emit();
  }

  private warned = false;
  private warn(items: readonly MimiToggleGroupItem[], value: unknown): void {
    if (this.warned) return;
    const multiple = untracked(this.multiple);
    const values = items.map((item) => untracked(item.value));
    const problems = [
      !this.host.getAttribute('aria-label')?.trim() &&
        !this.host.getAttribute('aria-labelledby')?.trim() &&
        'el grupo no tiene aria-label (su nombre accesible)',
      values.some((v, i) => values.findIndex((w) => Object.is(v, w)) !== i) &&
        'hay valores repetidos',
      items.some((item) => !accessibleName(item.element)) &&
        'un botón sin texto visible no tiene aria-label',
      multiple &&
        value !== null &&
        !Array.isArray(value) &&
        'con multiple, value tiene que ser un arreglo',
      !multiple && Array.isArray(value) && 'sin multiple, value no puede ser un arreglo',
    ].filter(Boolean);
    if (!problems.length) return;
    this.warned = true;
    console.warn(`[Mimi] Toggle Group: ${problems.join('; ')}.`);
  }
}

/** Todas las piezas del Toggle Group, para importarlas juntas. */
export const MimiToggleGroupImports = [MimiToggleGroup, MimiToggleGroupItem] as const;

/** Nombre del botón: aria-labelledby, aria-label o el texto visible. */
function accessibleName(button: HTMLElement): string {
  const label = button.getAttribute('aria-label') ?? button.getAttribute('aria-labelledby');
  return label?.trim() || visibleText(button).trim();
}

function visibleText(node: Node): string {
  if (node.nodeType === 3) return node.textContent ?? '';
  if (!(node instanceof Element) || node.getAttribute('aria-hidden') === 'true') return '';
  return Array.from(node.childNodes).map(visibleText).join('');
}
