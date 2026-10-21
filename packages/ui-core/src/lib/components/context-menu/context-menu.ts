import {
  CdkConnectedOverlay,
  type FlexibleConnectedPositionStrategyOrigin,
  type FlexibleOverlayPopoverLocation,
  type ScrollStrategy,
  createCloseScrollStrategy,
  createRepositionScrollStrategy,
} from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  TemplateRef,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
  isDevMode,
  model,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { MimiMenuItemsImports } from '@/components/ui/menu';
import { MimiMenuPanel } from '@/components/ui/menu/menu';
import {
  MIMI_VIEWPORT_MARGIN,
  mimiConnectedPositions,
  mimiPointPositions,
  mimiWaitForExit,
} from '@/components/ui/utils/overlay';

/*
 * Context Menu (docs/design/Mimi F2 Overlays.dc.html, «6 · Context Menu»): el menú aparece en el
 * punto del clic derecho, a 8px como mínimo de los bordes. Mismos ítems, panel y tokens que el
 * Dropdown Menu (`@/components/ui/menu`, prefijo `menu`, spec 13).
 *
 * Se abre con el evento `contextmenu` (clic derecho, Shift+F10, la tecla de menú, la pulsación
 * larga de Android). Con el puntero, el origen del CDK es el punto; con el teclado, el elemento
 * enfocado. aria no tiene un patrón de menú contextual: la apertura y la posición son de Mimi y
 * del CDK; el teclado dentro del menú, de aria (MimiMenuPanel).
 */

/** Distancia al elemento enfocado cuando se abre con el teclado (la del Dropdown Menu). */
const OFFSET = 8;
/** Margen para atribuir un `contextmenu` a Shift+F10 o a la tecla de menú. */
const KEYBOARD_WINDOW = 1000;

let nextId = 0;
/** Eventos ya atendidos: con triggers anidados, abre el más interno. */
const handled = new WeakSet<Event>();

/**
 * Menú contextual: uno o varios triggers (`[mimiContextMenuTrigger]`) y el contenido en un
 * `<ng-template mimiContextMenuContent let-dato>`. No dibuja nada propio (`display: contents`): su
 * `class` y su `aria-label` van al panel.
 */
@Component({
  selector: 'mimi-context-menu',
  imports: [CdkConnectedOverlay, MimiMenuPanel],
  template: `
    <ng-content />
    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="origin()!"
      [cdkConnectedOverlayOpen]="rendered()"
      [cdkConnectedOverlayPositions]="positions()"
      [cdkConnectedOverlayViewportMargin]="viewportMargin"
      [cdkConnectedOverlayDisableClose]="true"
      [cdkConnectedOverlayUsePopover]="popoverLocation"
      [cdkConnectedOverlayScrollStrategy]="scrollStrategy"
      cdkConnectedOverlayTransformOriginOn="[data-mimi-overlay-panel]"
      (detach)="onDetach()"
      (overlayOutsideClick)="onOutsideClick($event)"
    >
      <!-- Se recrea en cada apertura: aria no tiene una API pública para reiniciar el menú. -->
      @for (key of [openKey()]; track key) {
        @if (content(); as content) {
          <mimi-menu-panel
            [template]="content.templateRef"
            [context]="context()"
            [menuId]="menuId"
            [label]="ariaLabel() ?? ''"
            [state]="state()"
            [class]="userClass()"
            (closeRequest)="close($event)"
          />
        }
      }
    </ng-template>
  `,
  host: {
    style: 'display: contents',
    // El class y el aria-label son del panel: en el host no tendrían efecto o se heredarían.
    '[attr.class]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.data-state]': 'open() ? "open" : "closed"',
    '[attr.data-disabled]': 'disabled() ? "" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiContextMenu {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);

  /** Abierto o cerrado. Admite `[(open)]`; abierto desde el código, va junto al primer trigger. */
  readonly open = model(false);
  /** Nombre accesible del menú (`aria-label`). Hace falta: no hay un botón con texto que lo nombre. */
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
  /** Sin menú propio: el clic derecho muestra el del navegador. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Clases del panel, mezcladas con `cn()` (gana la del usuario). */
  readonly userClass = input('', { alias: 'class' });

  protected readonly content = contentChild(MimiContextMenuContent);
  private readonly panel = viewChild(MimiMenuPanel);

  readonly menuId = `mimi-context-menu-${nextId++}`;

  /** El panel está en el DOM (también mientras dura la animación de salida). */
  protected readonly rendered = signal(false);
  protected readonly state = signal<'open' | 'closed'>('closed');
  /** Cambia en cada apertura para recrear el menú (ítem activo y submenús desde cero). */
  protected readonly openKey = signal(0);
  protected readonly origin = signal<FlexibleConnectedPositionStrategyOrigin | null>(null);
  /** Abierto con el puntero (en un punto) o con el teclado (junto al elemento). */
  private readonly byPointer = signal(false);
  /** Dato del trigger que lo abrió (`let-x` en el contenido). */
  protected readonly context = signal<unknown>(undefined);
  /** El trigger que lo abrió (lleva `data-state="open"`). */
  readonly activeTrigger = signal<MimiContextMenuTrigger | null>(null);

  protected readonly viewportMargin = MIMI_VIEWPORT_MARGIN;
  /** El panel va dentro de este componente, después de los triggers (orden de Tab). */
  protected readonly popoverLocation: FlexibleOverlayPopoverLocation = {
    type: 'parent',
    element: inject<ElementRef<HTMLElement>>(ElementRef).nativeElement,
  };
  protected readonly positions = computed(() =>
    this.byPointer() ? mimiPointPositions() : mimiConnectedPositions('bottom', 'start', OFFSET),
  );

  /**
   * Al hacer scroll: abierto con el puntero se cierra (como el menú del sistema: el punto no
   * sigue al contenido); abierto con el teclado, sigue al elemento.
   */
  protected readonly scrollStrategy: ScrollStrategy = (() => {
    const close = createCloseScrollStrategy(this.injector);
    const reposition = createRepositionScrollStrategy(this.injector);
    return {
      attach: (overlayRef) => {
        close.attach(overlayRef);
        reposition.attach(overlayRef);
      },
      enable: () => (this.byPointer() ? close : reposition).enable(),
      disable: () => {
        close.disable();
        reposition.disable();
      },
      detach: () => {
        close.detach?.();
        reposition.detach?.();
      },
    };
  })();

  private readonly triggers = new Set<MimiContextMenuTrigger>();
  /** Elemento con el foco antes de abrir: lo recupera al cerrar. */
  private previousFocus: HTMLElement | null = null;
  /** timeStamp del último Shift+F10 o tecla de menú. */
  private keyAt: number | null = null;
  private closing = 0;
  private refocus = true;
  private warnedLabel = false;

  private readonly syncOpen = effect(() => {
    const open = this.open();
    untracked(() => (open ? this.show() : this.hide()));
  });

  private readonly syncDisabled = effect(() => {
    if (this.disabled() && untracked(this.open)) this.close();
  });

  /** Cierra. Con `refocus` (ítem elegido, Escape) el foco vuelve a donde estaba antes de abrir. */
  close(refocus = true): void {
    this.refocus = refocus;
    this.open.set(false);
  }

  /** Lo usan los triggers. */
  register(trigger: MimiContextMenuTrigger): void {
    this.triggers.add(trigger);
  }

  unregister(trigger: MimiContextMenuTrigger): void {
    this.triggers.delete(trigger);
  }

  /** Shift+F10 o la tecla de menú: el `contextmenu` que sigue viene del teclado. */
  markKeyboard(event: KeyboardEvent): void {
    this.keyAt = event.timeStamp;
  }

  /** Abre desde un `contextmenu` en un trigger. */
  openFrom(trigger: MimiContextMenuTrigger, event: MouseEvent): void {
    if (this.disabled() || handled.has(event)) return;
    handled.add(event);
    event.preventDefault();
    // Chrome marca con button -1 el contextmenu del teclado; los demás, por la tecla de antes.
    const keyboard =
      event.button === -1 ||
      (this.keyAt !== null && event.timeStamp - this.keyAt < KEYBOARD_WINDOW);
    this.keyAt = null;
    if (!this.rendered()) {
      const active = this.document.activeElement;
      this.previousFocus = active instanceof HTMLElement ? active : null;
    }
    this.activeTrigger.set(trigger);
    this.context.set(trigger.data());
    this.byPointer.set(!keyboard);
    const target = event.target instanceof Element ? event.target : trigger.element;
    this.origin.set(keyboard ? target : { x: event.clientX, y: event.clientY });
    if (this.rendered()) this.reopen();
    this.open.set(true);
  }

  private reopen(): void {
    this.openKey.update((key) => key + 1);
    // El modo de scroll puede haber cambiado (puntero o teclado).
    this.scrollStrategy.disable();
    this.scrollStrategy.enable();
  }

  private show(): void {
    this.closing++;
    if (!this.origin()) {
      // Abierto desde el código: junto al primer trigger.
      const first = this.triggers.values().next().value;
      if (!first) {
        this.open.set(false);
        return;
      }
      this.activeTrigger.set(first);
      this.context.set(first.data());
      this.byPointer.set(false);
      this.origin.set(first.element);
    }
    this.warnMissingLabel();
    this.state.set('open');
    if (this.rendered()) this.openKey.update((key) => key + 1);
    else this.rendered.set(true);
  }

  private hide(): void {
    if (!this.rendered()) return;
    this.state.set('closed');
    const panel = this.panel()?.element;
    const active = this.document.activeElement;
    const focusInside = !active || active === this.document.body || panel?.contains(active);
    if (this.refocus && focusInside) this.restoreFocus();
    this.refocus = true;
    const closing = ++this.closing;
    afterNextRender(
      {
        read: () => {
          void mimiWaitForExit(panel).then(() => {
            if (closing !== this.closing) return;
            this.rendered.set(false);
            this.origin.set(null);
            this.activeTrigger.set(null);
          });
        },
      },
      { injector: this.injector },
    );
  }

  /** El elemento que tenía el foco antes de abrir o, si ya no está, el trigger (si es enfocable). */
  private restoreFocus(): void {
    const previous = this.previousFocus;
    const target =
      previous?.isConnected && previous !== this.document.body
        ? previous
        : this.activeTrigger()?.element;
    target?.focus();
  }

  protected onDetach(): void {
    // El CDK lo cerró solo (scroll): el foco estaba en el menú, que ya no existe.
    const wasOpen = this.open();
    this.rendered.set(false);
    this.origin.set(null);
    this.activeTrigger.set(null);
    if (!wasOpen) return;
    this.open.set(false);
    const active = this.document.activeElement;
    if (!active || active === this.document.body) this.restoreFocus();
  }

  /** Clic fuera cierra; un clic derecho sobre otro trigger lo reabre ahí (lo hace el trigger). */
  protected onOutsideClick(event: MouseEvent): void {
    const target = event.target as Node | null;
    if (
      event.type === 'contextmenu' &&
      [...this.triggers].some((t) => t.element.contains(target))
    ) {
      return;
    }
    this.close(false);
  }

  private warnMissingLabel(): void {
    if (!isDevMode() || this.warnedLabel || this.ariaLabel()) return;
    this.warnedLabel = true;
    console.warn(
      '[Mimi] Context Menu: el menú no tiene nombre accesible. Agrega aria-label="…" al <mimi-context-menu>.',
    );
  }
}

/**
 * Zona que abre el menú con clic derecho, Shift+F10 o la tecla de menú: cualquier elemento, uno o
 * varios (por ejemplo, cada fila de una tabla). `mimiContextMenuTriggerData` llega al contenido.
 */
@Directive({
  selector: '[mimiContextMenuTrigger]',
  host: {
    '[attr.data-state]': 'active() ? "open" : "closed"',
    '(contextmenu)': 'menu.openFrom(this, $event)',
    '(keydown)': 'onKeydown($event)',
  },
})
export class MimiContextMenuTrigger {
  protected readonly menu = inject(MimiContextMenu);
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  /** Dato para el contenido (`<ng-template mimiContextMenuContent let-fila>`). */
  readonly data = input<unknown>(undefined, { alias: 'mimiContextMenuTriggerData' });

  protected readonly active = computed(
    () => this.menu.open() && this.menu.activeTrigger() === this,
  );

  constructor() {
    this.menu.register(this);
    inject(DestroyRef).onDestroy(() => this.menu.unregister(this));
  }

  protected onKeydown(event: KeyboardEvent): void {
    if ((event.key === 'F10' && event.shiftKey) || event.key === 'ContextMenu') {
      this.menu.markKeyboard(event);
    }
  }
}

/**
 * Contenido del menú: `<ng-template mimiContextMenuContent let-dato>`. Se crea en cada apertura y
 * se destruye al cerrar. `dato` es el `mimiContextMenuTriggerData` del trigger (sin tipo: anótalo
 * en tu componente si lo necesitas).
 */
@Directive({ selector: 'ng-template[mimiContextMenuContent]' })
export class MimiContextMenuContent {
  readonly templateRef = inject(TemplateRef);
}

export const MimiContextMenuImports = [
  MimiContextMenu,
  MimiContextMenuTrigger,
  MimiContextMenuContent,
  ...MimiMenuItemsImports,
] as const;
