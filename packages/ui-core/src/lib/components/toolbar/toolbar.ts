import { FocusKeyManager, type FocusableOption } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  Renderer2,
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
import { cva } from 'class-variance-authority';
import { cn } from '@/components/ui/utils/cn';
import { buttonFocusStyles } from '@/components/ui/utils/control-styles';

/*
 * mimi-toolbar (docs/design/Mimi F2 Toast Tabs Toolbar.dc.html, «4 · Toolbar»; prefijo de tokens
 * `toolbar`, spec 13): píldora translúcida con botones redondos, horizontal o vertical.
 *
 * Patrón toolbar de WAI-ARIA con el FocusKeyManager de @angular/cdk/a11y (no @angular/aria: spec 4,
 * excepción de la G1.10). Los botones son del usuario y son nativos: Enter, Espacio y el clic
 * funcionan sin rodeos. Mimi pone el tabindex itinerante (una sola parada de Tab) y le avisa al
 * gestor dónde está el foco (`focusin`), también si se movió por código.
 */

/** Horizontal (por defecto) o vertical. */
export type MimiToolbarOrientation = 'horizontal' | 'vertical';

/**
 * Qué hace el botón: `tool` es la herramienta activa (`value`, una a la vez), `toggle` un
 * interruptor (`pressed`) y `action` (por defecto) solo avisa con `activate`.
 */
export type MimiToolbarItemKind = 'tool' | 'toggle' | 'action';

const toolbarVariants = cva(
  [
    'inline-flex items-center gap-[6px] rounded-full border p-[6px] font-sans',
    'border-[color:var(--mimi-toolbar-border,var(--mimi-glass-border))] bg-[color:var(--mimi-toolbar-bg,var(--mimi-glass))]',
    'backdrop-blur-[var(--mimi-toolbar-blur,var(--mimi-glass-blur))] backdrop-saturate-[1.4]',
    'shadow-[shadow:var(--mimi-toolbar-shadow,var(--mimi-shadow-popover))]',
  ],
  {
    variants: {
      orientation: { horizontal: 'flex-row', vertical: 'flex-col' },
    },
    defaultVariants: { orientation: 'horizontal' },
  },
);

const ITEM_CLASSES = cn(
  'relative inline-flex size-[var(--mimi-toolbar-item-size,40px)] shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-foreground',
  '[&_svg]:size-[18px] [&_svg]:shrink-0',
  // Las transiciones del diseño; con movimiento reducido, solo los colores.
  '[transition:background-color_.2s_ease,color_.2s_ease,box-shadow_.35s_cubic-bezier(.2,.8,.2,1),scale_.15s_cubic-bezier(.2,.8,.2,1)]',
  'motion-reduce:[transition:background-color_.2s_ease,color_.2s_ease]',
  // Hover: anillo de 2px (info al 60 %). Herramienta activa: disco y anillo doble.
  'not-aria-disabled:not-data-[state=active]:hover:shadow-[0_0_0_2px_color-mix(in_oklch,var(--mimi-toolbar-ring,var(--mimi-info))_60%,transparent)]',
  'data-[state=active]:bg-[color:var(--mimi-toolbar-active-bg,var(--mimi-primary))] data-[state=active]:text-[color:var(--mimi-toolbar-active-fg,var(--mimi-primary-foreground))]',
  'data-[state=active]:shadow-[0_0_0_2px_var(--mimi-background),0_0_0_4px_var(--mimi-toolbar-ring,var(--mimi-info))]',
  'data-[state=pressed]:bg-[color:var(--mimi-toolbar-pressed-bg,var(--mimi-accent))]',
  // 0,9 (con movimiento reducido, 1); el diseño usa 0,88 sin token: plan D6.
  'not-aria-disabled:active:scale-(--mimi-press-scale-sm)',
  // Deshabilitado (sin diseño, plan D6): enfocable con las flechas, pero no se activa.
  'aria-disabled:cursor-not-allowed aria-disabled:opacity-(--mimi-disabled-opacity)',
  // Foco de teclado (el diseño solo muestra el anillo del hover, que no basta): por fuera del
  // anillo del activo, sin pisar al vecino (6px de separación). Plan D6.
  buttonFocusStyles,
  'focus-visible:outline-offset-4',
);

const COUNT_CLASSES =
  'pointer-events-none absolute -top-[3px] -end-[3px] inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-info px-[5px] text-[10.5px] font-bold text-info-foreground shadow-[0_0_0_2px_var(--mimi-background)]';

/**
 * Un botón de la toolbar: `<button mimiToolbarItem="negrita" kind="toggle" aria-label="Negrita">`.
 * El contenido y el `aria-label` son del usuario; un `mimiTooltip` puede ir en el mismo botón.
 */
@Directive({
  selector: 'button[mimiToolbarItem]',
  host: {
    type: 'button',
    // Un `disabled` estático deshabilitaría el botón nativo y lo sacaría del recorrido.
    '[attr.disabled]': 'null',
    '[attr.tabindex]': 'tabIndex()',
    '[attr.aria-pressed]': 'pressedAttr()',
    '[attr.aria-disabled]': 'disabledInput() ? "true" : null',
    '[attr.data-state]': 'state()',
    '[attr.data-kind]': 'kind()',
    '[attr.data-disabled]': 'disabledInput() ? "" : null',
    '[attr.data-value]': 'value()',
    '[class]': 'classes()',
    '(click)': 'onClick()',
  },
})
export class MimiToolbarItem implements FocusableOption {
  /** El valor del botón (único en la toolbar). */
  readonly value = input('', { alias: 'mimiToolbarItem' });
  readonly kind = input<MimiToolbarItemKind>('action');
  /** Se puede enfocar con las flechas, pero no se activa (`aria-disabled`). */
  readonly disabledInput = input(false, { alias: 'disabled', transform: booleanAttribute });
  /** Clases del botón, mezcladas con `cn()` (gana la del usuario). */
  readonly userClass = input('', { alias: 'class' });

  /** Uso interno. */
  readonly element = inject<ElementRef<HTMLButtonElement>>(ElementRef).nativeElement;
  protected readonly toolbar = inject(MimiToolbar);

  /** Para el FocusKeyManager. */
  get disabled(): boolean {
    return this.disabledInput();
  }

  protected readonly state = computed(() => {
    const value = this.value();
    if (this.kind() === 'tool' && this.toolbar.value() === value) return 'active';
    if (this.kind() === 'toggle' && this.toolbar.pressed().includes(value)) return 'pressed';
    return 'idle';
  });
  protected readonly pressedAttr = computed(() =>
    this.kind() === 'action' ? null : String(this.state() !== 'idle'),
  );
  protected readonly classes = computed(() => cn(ITEM_CLASSES, this.userClass()));
  protected readonly tabIndex = computed(() => (this.toolbar.isTabStop(this) ? 0 : -1));

  constructor() {
    // En un deshabilitado, el clic se frena en la fase de captura: no llega ni al `(click)` del
    // usuario ni a `activate` (el botón no lleva `disabled` nativo para seguir siendo enfocable).
    const stop = inject(Renderer2).listen(
      this.element,
      'click',
      (event: Event) => {
        if (!this.disabledInput()) return;
        event.preventDefault();
        event.stopImmediatePropagation();
      },
      { capture: true },
    );
    inject(DestroyRef).onDestroy(stop);
  }

  focus(): void {
    this.element.focus();
  }

  /** Clic, y también Enter o Espacio (el navegador los convierte en clic). */
  protected onClick(): void {
    this.toolbar.activateItem(this);
  }
}

/**
 * Toolbar:
 *
 * ```html
 * <mimi-toolbar aria-label="Formato" [(value)]="alineacion" [(pressed)]="estilos">
 *   <button mimiToolbarItem="negrita" kind="toggle" aria-label="Negrita"><svg lucideBold></svg></button>
 *   <mimi-toolbar-separator />
 *   <button mimiToolbarItem="izquierda" kind="tool" aria-label="Izquierda">…</button>
 * </mimi-toolbar>
 * ```
 */
@Component({
  selector: 'mimi-toolbar',
  template: '<ng-content />',
  host: {
    role: 'toolbar',
    '[attr.aria-orientation]': 'orientation()',
    '[attr.data-orientation]': 'orientation()',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-labelledby]': 'ariaLabelledby() || null',
    '[class]': 'classes()',
    '(keydown)': 'onKeydown($event)',
    '(focusin)': 'onFocusIn($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiToolbar {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** Nombre accesible (obligatorio, o `aria-labelledby`). */
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string>(undefined, { alias: 'aria-labelledby' });
  readonly orientation = input<MimiToolbarOrientation>('horizontal');
  /** Las flechas vuelven al principio desde el último botón (y al revés). */
  readonly wrap = input(true, { transform: booleanAttribute });
  /** La herramienta activa (`kind="tool"`). Admite `[(value)]`. */
  readonly value = model<string | undefined>(undefined);
  /** Los interruptores presionados (`kind="toggle"`). Admite `[(pressed)]`. */
  readonly pressed = model<string[]>([]);
  /** Cada activación (de cualquier tipo), después de actualizar `value` o `pressed`. */
  readonly activate = output<string>();
  /** Clases de la píldora, mezcladas con `cn()` (gana la del usuario). */
  readonly userClass = input('', { alias: 'class' });

  private readonly found = contentChildren(MimiToolbarItem, { descendants: true });
  /**
   * En el orden del documento (el de `contentChildren` es el de declaración). 4 es
   * `Node.DOCUMENT_POSITION_FOLLOWING`, escrito así porque en el servidor no hay `Node`.
   */
  private readonly items = computed(() =>
    [...this.found()].sort((a, b) => (a.element.compareDocumentPosition(b.element) & 4 ? -1 : 1)),
  );

  private readonly dir = inject(Directionality).valueSignal;
  private readonly manager = new FocusKeyManager(this.items, inject(Injector)).withHomeAndEnd();

  /** El último botón activo del gestor (por teclado, clic o foco). */
  private readonly active = signal<MimiToolbarItem | null>(null);
  /** El que tiene `tabindex="0"`: el último activo si sigue; si no, el primero. */
  private readonly tabStop = computed(() => {
    const items = this.items();
    const active = this.active();
    return active && items.includes(active) ? active : items[0];
  });

  protected readonly classes = computed(() =>
    cn(toolbarVariants({ orientation: this.orientation() }), this.userClass()),
  );

  constructor() {
    effect(() => {
      const vertical = this.orientation() === 'vertical';
      this.manager
        .withWrap(this.wrap())
        .withVerticalOrientation(vertical)
        .withHorizontalOrientation(vertical ? null : this.dir())
        // Deshabilitados enfocables (patrón de WAI-ARIA para toolbars).
        .skipPredicate(() => false);
    });
    const changes = this.manager.change.subscribe(() => this.active.set(this.manager.activeItem));
    inject(DestroyRef).onDestroy(() => {
      changes.unsubscribe();
      this.manager.destroy();
    });
    if (isDevMode()) afterRenderEffect({ read: () => this.warn(this.items()) });
  }

  /** Uso interno: ¿lleva `tabindex="0"`? */
  isTabStop(item: MimiToolbarItem): boolean {
    return this.tabStop() === item;
  }

  /** Uso interno: el clic (y Enter o Espacio, que el navegador convierte en clic). */
  activateItem(item: MimiToolbarItem): void {
    this.setActive(item);
    if (item.disabledInput()) return;
    const value = item.value();
    if (item.kind() === 'tool') this.value.set(value);
    if (item.kind() === 'toggle') {
      this.pressed.update((pressed) =>
        pressed.includes(value) ? pressed.filter((v) => v !== value) : [...pressed, value],
      );
    }
    this.activate.emit(value);
  }

  /** Solo las teclas de los botones: un campo o un menú dentro conserva sus flechas. */
  protected onKeydown(event: KeyboardEvent): void {
    if (!this.items().some((item) => item.element === event.target)) return;
    this.manager.onKeydown(event);
  }

  /** El foco llegó a un botón (Tab, clic o código): el gestor sigue desde ahí. */
  protected onFocusIn(event: FocusEvent): void {
    const item = this.items().find((i) => i.element === event.target);
    if (item) this.setActive(item);
  }

  private setActive(item: MimiToolbarItem): void {
    // updateActiveItem no emite `change`: la señal se actualiza aquí.
    this.manager.updateActiveItem(item);
    this.active.set(item);
  }

  private warned = false;
  private warn(items: readonly MimiToolbarItem[]): void {
    if (this.warned) return;
    const values = items.map((item) => untracked(item.value));
    const problems = [
      !this.host.getAttribute('aria-label')?.trim() &&
        !this.host.getAttribute('aria-labelledby')?.trim() &&
        'la toolbar no tiene aria-label (su nombre accesible)',
      values.some((value) => !value) && 'un botón tiene el valor vacío',
      values.some((value, i) => values.indexOf(value) !== i) && 'hay valores repetidos',
      items.some((item) => !accessibleName(item.element)) &&
        'un botón sin texto visible no tiene aria-label',
      items.some((item) => countMissing(item.element)) &&
        'el aria-label de un botón con contador no incluye el número',
    ].filter(Boolean);
    if (!problems.length) return;
    this.warned = true;
    console.warn(`[Mimi] Toolbar: ${problems.join('; ')}.`);
  }
}

/** Separador entre grupos de botones, perpendicular a la toolbar. */
@Component({
  selector: 'mimi-toolbar-separator',
  template: '',
  host: {
    role: 'separator',
    '[attr.aria-orientation]': 'orientation()',
    '[attr.data-orientation]': 'orientation()',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiToolbarSeparator {
  private readonly toolbar = inject(MimiToolbar);
  readonly userClass = input('', { alias: 'class' });

  protected readonly orientation = computed(() =>
    this.toolbar.orientation() === 'vertical' ? 'horizontal' : 'vertical',
  );
  protected readonly classes = computed(() =>
    cn(
      'shrink-0 bg-border',
      this.orientation() === 'vertical' ? 'mx-[2px] h-[22px] w-px' : 'my-[2px] h-px w-[22px]',
      this.userClass(),
    ),
  );
}

/**
 * Contador sobre un botón: `<span mimiToolbarCount>3</span>`. Es decorativo (`aria-hidden`): el
 * número va también en el `aria-label` del botón («Comentarios, 3 sin leer»).
 */
@Directive({
  selector: '[mimiToolbarCount]',
  host: { 'aria-hidden': 'true', 'data-slot': 'count', '[class]': 'classes()' },
})
export class MimiToolbarCount {
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() => cn(COUNT_CLASSES, this.userClass()));
}

/** Todas las piezas de la toolbar, para importarlas juntas. */
export const MimiToolbarImports = [
  MimiToolbar,
  MimiToolbarItem,
  MimiToolbarSeparator,
  MimiToolbarCount,
] as const;

/** Nombre del botón: aria-labelledby, aria-label o el texto visible (sin el contador). */
function accessibleName(button: HTMLElement): string {
  const label = button.getAttribute('aria-label') ?? button.getAttribute('aria-labelledby');
  return label?.trim() || visibleText(button).trim();
}

function visibleText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
  if (!(node instanceof Element) || node.getAttribute('aria-hidden') === 'true') return '';
  if (node.hasAttribute('mimiToolbarCount') || node.getAttribute('data-slot') === 'count') {
    return '';
  }
  return Array.from(node.childNodes).map(visibleText).join('');
}

/** Hay contador y el aria-label no tiene su número. */
function countMissing(button: HTMLElement): boolean {
  const count = button.querySelector('[data-slot="count"]')?.textContent?.trim();
  const label = button.getAttribute('aria-label');
  return !!count && !!label && !label.includes(count);
}
