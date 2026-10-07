import {
  type OverlayRef,
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  type ComponentRef,
  DestroyRef,
  Directive,
  ElementRef,
  HostAttributeToken,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  untracked,
} from '@angular/core';
import { cn } from '@/components/ui/utils/cn';
import {
  MIMI_OVERLAY_ANIMATION,
  MIMI_VIEWPORT_MARGIN,
  type MimiOverlayAlign,
  type MimiOverlaySide,
  mimiArrowOffset,
  mimiConnectedPositions,
  mimiPlacedSide,
  mimiWaitForExit,
} from '@/components/ui/utils/overlay';

/*
 * Tooltip (docs/design/Mimi F2 Overlays.dc.html, «4 · Tooltip»): padding 6px 10px, radio 8px,
 * texto de 12.5px peso 500, sombra neutral, a 10px del trigger, flecha de 8px. Tokens de la spec
 * 13 (MimiTooltipTokens), con la cascada de la 6.2.
 *
 * Por dentro usa la API programática de @angular/cdk/overlay (createOverlayRef y un
 * ComponentPortal): una directiva no tiene plantilla. Popover nativo en la ubicación 'global': el
 * tooltip no recibe foco, así que no hace falta junto al trigger, y no cambia sus hermanos en el
 * DOM. Nada del CDK sale en la API pública.
 *
 * Accesibilidad (WCAG 1.4.13): abre con el puntero y con el foco de teclado, después del retraso;
 * se puede pasar el puntero al tooltip sin que se cierre (un puente invisible cubre la
 * separación); Escape lo cierra sin mover el foco. Solo texto: nada interactivo dentro.
 */

export type MimiTooltipSide = MimiOverlaySide;
export type MimiTooltipAlign = MimiOverlayAlign;

/** Separación con el trigger (diseño: 10px). */
const OFFSET = 10;
/** Retraso por defecto si no hay --mimi-tooltip-delay ni mimiTooltipDelay (spec 13). */
const DEFAULT_DELAY = 300;
/** «Salto sin retraso»: si otro tooltip se cerró hace menos que esto, el nuevo abre enseguida. */
export const MIMI_TOOLTIP_SKIP_DELAY = 300;

/** Estado compartido mínimo entre todos los tooltips: cuándo se cerró el último. */
const shared = { lastHiddenAt: Number.NEGATIVE_INFINITY };

let nextId = 0;

/** `300ms`, `0.3s` o un número de ms; null si no se entiende. */
function parseDelay(value: string): number | null {
  const match = /^\s*(-?\d*\.?\d+)\s*(ms|s)?\s*$/.exec(value);
  if (!match) return null;
  const amount = Number(match[1]) * (match[2] === 's' ? 1000 : 1);
  return Math.max(0, amount);
}

/** Panel del tooltip (uso interno: lo crea `mimiTooltip`; no está en la API pública). */
@Component({
  selector: 'mimi-tooltip-panel',
  template: `
    <div
      data-mimi-overlay-panel
      role="tooltip"
      [id]="panelId()"
      [class]="classes()"
      [attr.data-state]="state()"
      [attr.data-side]="side()"
      [style.--mimi-tooltip-arrow-offset]="arrowOffset()"
      (pointerleave)="pointerLeave.emit($event.relatedTarget)"
    >
      {{ text() }}
      @if (shortcut()) {
        <span class="font-mono text-[11px] opacity-75">{{ shortcut() }}</span>
      }
      @if (arrow()) {
        <span aria-hidden="true" [attr.data-side]="side()" [class]="arrowClasses"></span>
      }
    </div>
  `,
  styles: MIMI_OVERLAY_ANIMATION,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiTooltipPanel {
  readonly panelId = input('');
  readonly text = input('');
  readonly shortcut = input('');
  readonly arrow = input(true);
  readonly side = input<MimiTooltipSide>('top');
  readonly state = input<'open' | 'closed'>('closed');
  readonly arrowOffset = input<string | null>(null);
  readonly userClass = input('');
  /** El puntero sale del tooltip, hacia este elemento (si vuelve al trigger, sigue abierto). */
  readonly pointerLeave = output<EventTarget | null>();

  protected readonly classes = computed(() =>
    cn(
      'relative flex w-max max-w-[calc(100vw_-_16px)] items-center gap-2 px-2.5 py-1.5',
      'rounded-[var(--mimi-tooltip-radius,8px)] bg-[color:var(--mimi-tooltip-bg,var(--mimi-tooltip))] text-[color:var(--mimi-tooltip-fg,var(--mimi-tooltip-foreground))]',
      'text-[length:var(--mimi-tooltip-font-size,12.5px)] font-medium shadow-[shadow:var(--mimi-shadow-neutral)]',
      // Puente invisible sobre la separación: el puntero pasa del trigger al tooltip sin salir.
      "before:absolute before:content-['']",
      'data-[side=top]:before:inset-x-0 data-[side=top]:before:top-full data-[side=top]:before:h-[10px]',
      'data-[side=bottom]:before:inset-x-0 data-[side=bottom]:before:bottom-full data-[side=bottom]:before:h-[10px]',
      'data-[side=left]:before:inset-y-0 data-[side=left]:before:left-full data-[side=left]:before:w-[10px]',
      'data-[side=right]:before:inset-y-0 data-[side=right]:before:right-full data-[side=right]:before:w-[10px]',
      this.userClass(),
    ),
  );

  protected readonly arrowClasses = cn(
    'pointer-events-none absolute size-[var(--mimi-tooltip-arrow,8px)] rotate-45 rounded-[1px] bg-[color:var(--mimi-tooltip-bg,var(--mimi-tooltip))]',
    'data-[side=top]:bottom-[calc(var(--mimi-tooltip-arrow,8px)/-2)] data-[side=top]:left-[var(--mimi-tooltip-arrow-offset,50%)] data-[side=top]:-translate-x-1/2',
    'data-[side=bottom]:top-[calc(var(--mimi-tooltip-arrow,8px)/-2)] data-[side=bottom]:left-[var(--mimi-tooltip-arrow-offset,50%)] data-[side=bottom]:-translate-x-1/2',
    'data-[side=left]:right-[calc(var(--mimi-tooltip-arrow,8px)/-2)] data-[side=left]:top-[var(--mimi-tooltip-arrow-offset,50%)] data-[side=left]:-translate-y-1/2',
    'data-[side=right]:left-[calc(var(--mimi-tooltip-arrow,8px)/-2)] data-[side=right]:top-[var(--mimi-tooltip-arrow-offset,50%)] data-[side=right]:-translate-y-1/2',
  );
}

/**
 * Tooltip en cualquier elemento: `<button mimiTooltip="Copiar">`. Solo texto. Si necesitas un
 * enlace o un botón dentro, usa Popover. En pantallas táctiles no se muestra.
 */
@Directive({
  selector: '[mimiTooltip]',
  host: {
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.data-tooltip-state]': 'visible() ? "open" : "closed"',
    '(pointerenter)': 'onPointerEnter($event)',
    '(pointerleave)': 'onPointerLeave($event)',
    '(pointerdown)': 'hide()',
    '(focusin)': 'onFocusIn($event)',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class MimiTooltip {
  private readonly injector = inject(Injector);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  /** aria-describedby que ya tenía el elemento: se conserva. */
  private readonly ownDescribedBy = inject(new HostAttributeToken('aria-describedby'), {
    optional: true,
  });

  /** Texto del tooltip. Vacío, no se muestra. */
  readonly text = input('', { alias: 'mimiTooltip' });
  /** Lado preferido. Si no cabe, pasa al opuesto. */
  readonly side = input<MimiTooltipSide>('top', { alias: 'mimiTooltipSide' });
  /** Alineación con el trigger. */
  readonly align = input<MimiTooltipAlign>('center', { alias: 'mimiTooltipAlign' });
  /** Retraso al abrir, en ms. Sin él, se usa --mimi-tooltip-delay (300ms). */
  readonly delay = input<number | undefined, unknown>(undefined, {
    alias: 'mimiTooltipDelay',
    transform: (value: unknown) =>
      value === undefined || value === null || value === '' ? undefined : numberAttribute(value),
  });
  /** No mostrarlo. */
  readonly disabled = input(false, { alias: 'mimiTooltipDisabled', transform: booleanAttribute });
  /** Atajo de teclado, en monoespaciada (p. ej. ⌘C). */
  readonly shortcut = input('', { alias: 'mimiTooltipShortcut' });
  /** Flecha hacia el trigger (decorativa). */
  readonly arrow = input(true, { alias: 'mimiTooltipArrow', transform: booleanAttribute });
  /** Clases del tooltip, mezcladas con `cn()`. */
  readonly tooltipClass = input('', { alias: 'mimiTooltipClass' });

  /** id del tooltip (role="tooltip"). */
  readonly tooltipId = `mimi-tooltip-${nextId++}`;
  /** Visible (también deja de serlo al empezar la animación de salida). */
  readonly visible = signal(false);

  private readonly placedSide = signal<MimiTooltipSide>('top');
  private readonly arrowOffset = signal<string | null>(null);
  private overlayRef: OverlayRef | null = null;
  private panelRef: ComponentRef<MimiTooltipPanel> | null = null;
  private openTimer: ReturnType<typeof setTimeout> | undefined;
  private hiding = 0;

  protected readonly describedBy = computed(() => {
    const ids = this.ownDescribedBy ? [this.ownDescribedBy] : [];
    // Si el texto ya es el nombre del elemento (botón de ícono), no se repite.
    if (this.visible() && !this.textIsLabel()) ids.push(this.tooltipId);
    return ids.length > 0 ? ids.join(' ') : null;
  });

  private readonly syncPanel = effect(() => {
    const inputs = {
      panelId: this.tooltipId,
      text: this.text(),
      shortcut: this.shortcut(),
      arrow: this.arrow(),
      side: this.placedSide(),
      arrowOffset: this.arrowOffset(),
      userClass: this.tooltipClass(),
    };
    untracked(() => {
      if (!this.panelRef) return;
      for (const [name, value] of Object.entries(inputs)) this.panelRef.setInput(name, value);
    });
  });

  private readonly hideWhenOff = effect(() => {
    if (this.disabled() || !this.text().trim()) untracked(() => this.hide());
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.openTimer);
      if (this.visible()) shared.lastHiddenAt = Date.now();
      this.overlayRef?.dispose();
    });
  }

  /** Muestra el tooltip después del retraso (o enseguida, si otro se cerró hace poco). */
  open(): void {
    clearTimeout(this.openTimer);
    if (this.disabled() || !this.text().trim() || this.visible()) return;
    const recent = Date.now() - shared.lastHiddenAt < MIMI_TOOLTIP_SKIP_DELAY;
    const delay = recent ? 0 : this.openDelay();
    if (delay === 0) this.show();
    else this.openTimer = setTimeout(() => this.show(), delay);
  }

  /** Lo oculta (sin mover el foco). */
  hide(): void {
    clearTimeout(this.openTimer);
    if (!this.visible()) return;
    this.visible.set(false);
    shared.lastHiddenAt = Date.now();
    const panelRef = this.panelRef;
    if (!panelRef) return;
    panelRef.setInput('state', 'closed');
    const hiding = ++this.hiding;
    afterNextRender(
      {
        read: () => {
          const panel = panelRef.location.nativeElement.firstElementChild as HTMLElement | null;
          void mimiWaitForExit(panel ?? undefined).then(() => {
            if (hiding === this.hiding && !this.visible()) this.overlayRef?.detach();
          });
        },
      },
      { injector: this.injector },
    );
  }

  protected onPointerEnter(event: PointerEvent): void {
    // En pantallas táctiles no hay hover: no se muestra (spec 4, Tooltip).
    if (event.pointerType === 'touch') return;
    this.open();
  }

  protected onPointerLeave(event: PointerEvent): void {
    if (this.isInPanel(event.relatedTarget)) return;
    this.hide();
  }

  protected onFocusIn(event: FocusEvent): void {
    // Solo con el foco de teclado: un clic no debe mostrarlo.
    if (!this.isFocusVisible(event.target)) return;
    this.open();
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && this.element.contains(next)) return;
    this.hide();
  }

  private show(): void {
    if (this.disabled() || !this.text().trim()) return;
    ++this.hiding;
    const overlayRef = this.overlay();
    if (!overlayRef.hasAttached()) {
      this.panelRef = overlayRef.attach(new ComponentPortal(MimiTooltipPanel, null, this.injector));
      this.panelRef.instance.pointerLeave.subscribe((to) => {
        if (!(to instanceof Node && this.element.contains(to))) this.hide();
      });
    }
    this.placedSide.set(this.side());
    for (const [name, value] of Object.entries({
      panelId: this.tooltipId,
      text: this.text(),
      shortcut: this.shortcut(),
      arrow: this.arrow(),
      side: this.side(),
      arrowOffset: this.arrowOffset(),
      userClass: this.tooltipClass(),
      state: 'open',
    })) {
      this.panelRef!.setInput(name, value);
    }
    this.strategy?.withPositions(mimiConnectedPositions(this.side(), this.align(), OFFSET));
    overlayRef.updatePosition();
    this.visible.set(true);
  }

  private strategy: ReturnType<typeof createFlexibleConnectedPositionStrategy> | null = null;

  private overlay(): OverlayRef {
    if (this.overlayRef) return this.overlayRef;
    const strategy = createFlexibleConnectedPositionStrategy(this.injector, this.element)
      .withPositions(mimiConnectedPositions(this.side(), this.align(), OFFSET))
      .withViewportMargin(MIMI_VIEWPORT_MARGIN)
      .withFlexibleDimensions(false)
      .withPush(false)
      .withTransformOriginOn('[data-mimi-overlay-panel]');
    strategy.positionChanges.subscribe(({ connectionPair }) => {
      const side = mimiPlacedSide(connectionPair);
      this.placedSide.set(side);
      const panel = this.panelRef?.location.nativeElement.firstElementChild as HTMLElement | null;
      this.arrowOffset.set(
        panel
          ? mimiArrowOffset(
              this.element.getBoundingClientRect(),
              panel.getBoundingClientRect(),
              side,
            )
          : null,
      );
    });
    this.strategy = strategy;
    this.overlayRef = createOverlayRef(this.injector, {
      positionStrategy: strategy,
      scrollStrategy: createRepositionScrollStrategy(this.injector),
    });
    this.overlayRef.keydownEvents().subscribe((event) => {
      // Escape lo cierra sin mover el foco (WCAG 1.4.13). El CDK solo se lo entrega al overlay
      // de más arriba, así que un Dialog debajo no se cierra con el mismo Escape.
      if (event.key === 'Escape' && this.visible()) {
        event.preventDefault();
        this.hide();
      }
    });
    return this.overlayRef;
  }

  /** Retraso: la entrada, o --mimi-tooltip-delay del tema, o 300ms. */
  private openDelay(): number {
    const own = this.delay();
    if (own !== undefined && !Number.isNaN(own)) return Math.max(0, own);
    const token = getComputedStyle(this.element).getPropertyValue('--mimi-tooltip-delay');
    return parseDelay(token) ?? DEFAULT_DELAY;
  }

  private textIsLabel(): boolean {
    const label = this.element.getAttribute('aria-label');
    return !!label && label.trim() === this.text().trim();
  }

  private isInPanel(target: EventTarget | null): boolean {
    const host = this.panelRef?.location.nativeElement as HTMLElement | undefined;
    return !!host && target instanceof Node && host.contains(target);
  }

  private isFocusVisible(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) return false;
    try {
      return target.matches(':focus-visible');
    } catch {
      return true;
    }
  }
}
