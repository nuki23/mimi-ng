import { Dialog, type DialogRef } from '@angular/cdk/dialog';
import { createGlobalPositionStrategy } from '@angular/cdk/overlay';
import { InteractivityChecker } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  TemplateRef,
  ViewContainerRef,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { cn } from '@/components/ui/utils/cn';
import { buttonFocusStyles } from '@/components/ui/utils/control-styles';
import { MIMI_OVERLAY_TEXT } from '@/components/ui/utils/overlay-config';

/*
 * La hoja común de Mimi (R.34 y G4.2): un panel modal pegado a un borde de la pantalla (abajo, a
 * la izquierda o a la derecha) o a pantalla completa. La usan los paneles de los componentes en
 * el teléfono (Select, Combobox, menús, Popover…) y el componente público Sheet.
 *
 * Por dentro es un diálogo de @angular/cdk/dialog (como Dialog, spec 4): rol `dialog`,
 * `aria-modal`, foco atrapado y devuelto al cerrar, fondo y desplazamiento de la página bloqueado.
 * Mimi añade la cabecera (título y X), el asa, cerrar con Escape, con el fondo y arrastrando hacia
 * el borde, la animación de entrada y salida y el alto que sigue al teclado (`visualViewport`).
 *
 * Uso (en la plantilla de un componente):
 *
 * ```html
 * <ng-template mimiSheet [mimiSheetOpen]="open()" mimiSheetSide="bottom"
 *              [mimiSheetTitle]="label()" (mimiSheetClose)="close()">
 *   …el contenido del panel…
 * </ng-template>
 * ```
 *
 * Impórtala siempre con su archivo (`@/components/ui/utils/sheet`): trae el CDK.
 */

/** Dónde va la hoja. `full` = pantalla completa. */
export type MimiSheetSide = 'bottom' | 'left' | 'right' | 'full';

/** Lo que cierra la hoja sin que el componente lo pida (para saber por qué). */
export type MimiSheetCloseReason = 'escape' | 'backdrop' | 'button' | 'drag';

/** Cuánto hay que arrastrar (fracción del alto o del ancho) o con qué velocidad (px/ms). */
const DRAG_DISTANCE = 0.3;
const DRAG_VELOCITY = 0.5;

let nextId = 0;

/** Fondo: el de Dialog (spec 13). La opacidad la anima el CDK. */
const BACKDROP_CLASSES = [
  'bg-[color:var(--mimi-sheet-overlay,var(--mimi-overlay))]',
  'backdrop-blur-[var(--mimi-sheet-overlay-blur,var(--mimi-overlay-blur))]',
  'duration-150!',
  'motion-reduce:duration-[1ms]!',
];

/**
 * Pinta una plantilla donde está (sin @angular/common, como las demás salidas de Mimi). La usan la
 * hoja y los componentes que pintan el mismo contenido en el popover y en la hoja.
 * @internal No forma parte de la API de Mimi.
 */
@Directive({ selector: '[mimiSheetOutlet]' })
export class MimiSheetOutlet {
  readonly template = input.required<TemplateRef<unknown> | null>({ alias: 'mimiSheetOutlet' });
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly render = effect(() => {
    const template = this.template();
    untracked(() => {
      this.viewContainer.clear();
      if (template) this.viewContainer.createEmbeddedView(template);
    });
  });
}

/**
 * Abre la plantilla en una hoja mientras `mimiSheetOpen` sea `true`. Al pasar a `false`, anima la
 * salida y la cierra (el foco vuelve a donde estaba al abrir). Escape, el fondo, la X y el
 * arrastre no la cierran solos: emiten `mimiSheetClose` y el componente decide (pone su `open` en
 * `false`), como hacen los paneles con el CDK.
 */
@Directive({ selector: 'ng-template[mimiSheet]', exportAs: 'mimiSheet' })
export class MimiSheetOverlay {
  private readonly dialog = inject(Dialog);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);

  readonly open = input(false, { alias: 'mimiSheetOpen', transform: booleanAttribute });
  readonly side = input<MimiSheetSide>('bottom', { alias: 'mimiSheetSide' });
  /** Título visible de la cabecera (y nombre accesible). Sin él, `mimiSheetLabelledby` o `aria-label`. */
  readonly title = input<string | null | undefined>(null, { alias: 'mimiSheetTitle' });
  /** Cabecera con título y X (por defecto). `false`: sin cabecera (el contenido trae la suya). */
  readonly header = input(true, { alias: 'mimiSheetHeader', transform: booleanAttribute });
  /** La X sin cabecera (Sheet público: el título lo pone el usuario). */
  readonly closeButton = input(true, {
    alias: 'mimiSheetCloseButton',
    transform: booleanAttribute,
  });
  /** «Atrás» en la cabecera (un submenú dentro de la hoja). */
  readonly back = input(false, { alias: 'mimiSheetBack', transform: booleanAttribute });
  readonly labelledby = input<string | null | undefined>(null, { alias: 'mimiSheetLabelledby' });
  readonly describedby = input<string | null | undefined>(null, { alias: 'mimiSheetDescribedby' });
  readonly ariaLabel = input<string | null | undefined>(null, { alias: 'mimiSheetAriaLabel' });
  /** Clases de la hoja, mezcladas con `cn()`. */
  readonly sheetClass = input('', { alias: 'mimiSheetClass' });
  /** `data-size` de la hoja (el tamaño del componente: la hoja va fuera de su anfitrión). */
  readonly size = input<string | null | undefined>(null, { alias: 'mimiSheetSize' });
  /** Se puede cerrar con Escape, el fondo, la X y el arrastre (por defecto). */
  readonly dismissable = input(true, {
    alias: 'mimiSheetDismissable',
    transform: booleanAttribute,
  });

  /** El usuario pidió cerrar (Escape, fondo, X o arrastre). */
  readonly closeRequest = output<MimiSheetCloseReason>({ alias: 'mimiSheetClose' });
  /** Pulsó «Atrás». */
  readonly backRequest = output<void>({ alias: 'mimiSheetBackClick' });
  /** La hoja se montó (el contenido ya está en el DOM). */
  readonly attached = output<void>({ alias: 'mimiSheetAttach' });
  /** La hoja se desmontó (después de la animación de salida, o si la cerró el CDK). */
  readonly detached = output<void>({ alias: 'mimiSheetDetach' });

  /** id del título de la cabecera (aria-labelledby). */
  readonly titleId = `mimi-sheet-title-${nextId++}`;
  /** Abierta o cerrándose (para la animación). */
  readonly state = signal<'open' | 'closed'>('closed');

  private ref: DialogRef<unknown, MimiSheetFrame> | null = null;
  /** Cuenta los cierres: si se vuelve a abrir durante la salida, no se desmonta. */
  private closing = 0;

  /** El contenedor del CDK (el elemento con `role="dialog"`) mientras está montada. */
  private readonly container = signal<HTMLElement | null>(null);

  private readonly sync = effect(() => {
    const open = this.open();
    untracked(() => (open ? this.show() : this.hide()));
  });

  /**
   * El nombre y la descripción pueden llegar después de abrir (un `mimiSheetDescription` dentro
   * del contenido, que se crea al abrir): el CDK solo los lee al crear el diálogo.
   */
  private readonly syncAria = effect(() => {
    const container = this.container();
    if (!container) return;
    const labelledby = this.labelledbyId();
    const describedby = this.describedby() || null;
    for (const [name, value] of [
      ['aria-labelledby', labelledby],
      ['aria-describedby', describedby],
    ] as const) {
      if (value) container.setAttribute(name, value);
      else container.removeAttribute(name);
    }
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.closing++;
      this.ref?.close();
      this.ref = null;
    });
  }

  /** El nombre accesible del diálogo. */
  private labelledbyId(): string | null {
    if (this.header() && this.title()) return this.titleId;
    return this.labelledby() || null;
  }

  /** La pide el marco (Escape, fondo, X, arrastre). */
  requestClose(reason: MimiSheetCloseReason): void {
    if (!this.dismissable() && reason !== 'button') return;
    this.closeRequest.emit(reason);
  }

  /** La pide el marco («Atrás»). */
  requestBack(): void {
    this.backRequest.emit();
  }

  private show(): void {
    this.closing++;
    this.state.set('open');
    if (this.ref) {
      this.ref.overlayRef.getConfig().hasBackdrop = true;
      return;
    }
    const side = this.side();
    const position = createGlobalPositionStrategy(this.injector);
    if (side === 'bottom') position.bottom('0').centerHorizontally();
    else if (side === 'left') position.left('0').top('0');
    else if (side === 'right') position.right('0').top('0');
    else position.left('0').top('0');
    const ref = this.dialog.open<unknown, unknown, MimiSheetFrame>(MimiSheetFrame, {
      viewContainerRef: this.viewContainer,
      injector: this.injector,
      providers: [{ provide: MimiSheetOverlay, useValue: this }],
      positionStrategy: position,
      width: side === 'bottom' || side === 'full' ? '100%' : undefined,
      height: side === 'bottom' ? undefined : '100%',
      maxWidth: '100vw',
      maxHeight: '100%',
      hasBackdrop: true,
      backdropClass: BACKDROP_CLASSES,
      panelClass: ['mimi-sheet-pane', '[&>.cdk-dialog-container]:outline-none'],
      disableClose: true,
      role: 'dialog',
      ariaModal: true,
      ariaLabelledBy: this.labelledbyId(),
      ariaDescribedBy: this.describedby() || null,
      ariaLabel: this.labelledbyId() ? null : this.ariaLabel() || this.title() || null,
      // El marco enfoca lo que toca (el `autofocus` o lo primero del contenido): no la X.
      autoFocus: 'dialog',
      restoreFocus: true,
      closeOnNavigation: true,
    });
    this.ref = ref;
    ref.keydownEvents.subscribe((event) => {
      if (event.key !== 'Escape' || event.altKey || event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      this.requestClose('escape');
    });
    ref.backdropClick.subscribe(() => this.requestClose('backdrop'));
    this.container.set(
      ref.overlayRef.overlayElement.querySelector<HTMLElement>('.cdk-dialog-container'),
    );
    ref.closed.subscribe(() => {
      if (this.ref !== ref) return;
      this.ref = null;
      this.container.set(null);
      this.state.set('closed');
      this.detached.emit();
    });
    afterNextRender({ write: () => this.attached.emit() }, { injector: this.injector });
  }

  private hide(): void {
    const ref = this.ref;
    if (!ref || this.state() === 'closed') return;
    this.state.set('closed');
    ref.overlayRef.detachBackdrop();
    const closing = ++this.closing;
    afterNextRender(
      {
        read: () => {
          const frame = ref.componentRef?.location.nativeElement as HTMLElement | undefined;
          const animations = frame?.getAnimations?.() ?? [];
          void Promise.allSettled(animations.map((a) => a.finished)).then(() => {
            if (closing === this.closing && this.ref === ref) ref.close();
          });
        },
      },
      { injector: this.injector },
    );
  }
}

/** Lo que se puede enfocar con Tab (sin medir: jsdom no tiene maquetación). */
const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** La X y «Atrás» de la cabecera (30px, como Dialog y el diseño). */
const ICON_BUTTON_CLASSES = cn(
  'inline-flex size-[30px] shrink-0 cursor-pointer items-center justify-center rounded-[var(--mimi-radius-sm)] bg-transparent text-muted-foreground',
  'mimi-transition hover:bg-accent hover:text-foreground active:scale-(--mimi-press-scale-sm)',
  buttonFocusStyles,
);

/**
 * El marco de la hoja: asa, cabecera y el contenido. Lo crea `MimiSheetOverlay` dentro del
 * diálogo del CDK.
 * @internal No forma parte de la API de Mimi.
 */
@Component({
  selector: 'mimi-sheet-frame',
  imports: [MimiSheetOutlet],
  template: `
    @if (side() === 'bottom') {
      <div
        data-slot="handle"
        aria-hidden="true"
        class="flex h-5 shrink-0 cursor-grab touch-none items-center justify-center"
        (pointerdown)="onDragStart($event)"
      >
        <span
          class="h-1 w-10 rounded-full bg-[color:var(--mimi-sheet-handle,var(--mimi-border))]"
        ></span>
      </div>
    }
    @if (host.header()) {
      <div
        data-slot="header"
        [class]="headerClasses()"
        (pointerdown)="side() === 'full' ? null : onDragStart($event)"
      >
        @if (host.back()) {
          <button
            type="button"
            data-slot="back"
            [class]="iconButtonClasses"
            [attr.aria-label]="text.back"
            (click)="host.requestBack()"
          >
            <svg
              aria-hidden="true"
              class="size-[17px]"
              viewBox="0 0 24 24"
              [attr.fill]="'none'"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <!-- Lucide chevron-left (ISC) -->
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        }
        <h2
          data-slot="title"
          class="min-w-0 flex-1 truncate text-base leading-tight font-bold"
          [id]="host.titleId"
        >
          {{ host.title() }}
        </h2>
        <button
          type="button"
          data-slot="close"
          [class]="iconButtonClasses"
          [attr.aria-label]="text.close"
          (click)="host.requestClose('button')"
        >
          <svg
            aria-hidden="true"
            class="size-[17px]"
            viewBox="0 0 24 24"
            [attr.fill]="'none'"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <!-- Lucide x (ISC) -->
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    } @else if (host.closeButton()) {
      <button
        type="button"
        data-slot="close"
        [class]="floatingCloseClasses"
        [attr.aria-label]="text.close"
        (click)="host.requestClose('button')"
      >
        <svg
          aria-hidden="true"
          class="size-[17px]"
          viewBox="0 0 24 24"
          [attr.fill]="'none'"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <!-- Lucide x (ISC) -->
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    }
    <div data-slot="body" class="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
      <ng-container [mimiSheetOutlet]="host.template" />
    </div>
  `,
  styles: `
    @keyframes mimi-sheet-in-bottom {
      from {
        translate: 0 calc(100% + 16px);
      }
    }
    @keyframes mimi-sheet-out-bottom {
      to {
        translate: 0 calc(100% + 16px);
      }
    }
    @keyframes mimi-sheet-in-left {
      from {
        translate: calc(-100% - 16px) 0;
      }
    }
    @keyframes mimi-sheet-out-left {
      to {
        translate: calc(-100% - 16px) 0;
      }
    }
    @keyframes mimi-sheet-in-right {
      from {
        translate: calc(100% + 16px) 0;
      }
    }
    @keyframes mimi-sheet-out-right {
      to {
        translate: calc(100% + 16px) 0;
      }
    }
    @keyframes mimi-sheet-in-full {
      from {
        opacity: 0;
        translate: 0 24px;
      }
    }
    @keyframes mimi-sheet-out-full {
      to {
        opacity: 0;
        translate: 0 24px;
      }
    }
    :host([data-state='open']) {
      animation: mimi-sheet-in-bottom 0.42s cubic-bezier(0.32, 0.72, 0, 1);
    }
    :host([data-state='open'][data-side='left']) {
      animation-name: mimi-sheet-in-left;
    }
    :host([data-state='open'][data-side='right']) {
      animation-name: mimi-sheet-in-right;
    }
    :host([data-state='open'][data-side='full']) {
      animation-name: mimi-sheet-in-full;
      animation-duration: 0.2s;
    }
    :host([data-state='closed']) {
      animation: mimi-sheet-out-bottom 0.28s cubic-bezier(0.32, 0.72, 0, 1) forwards;
    }
    :host([data-state='closed'][data-side='left']) {
      animation-name: mimi-sheet-out-left;
    }
    :host([data-state='closed'][data-side='right']) {
      animation-name: mimi-sheet-out-right;
    }
    :host([data-state='closed'][data-side='full']) {
      animation-name: mimi-sheet-out-full;
      animation-duration: 0.15s;
    }
    :host([data-dragging]) {
      animation: none;
    }
    @media (prefers-reduced-motion: reduce) {
      :host {
        animation: none !important;
      }
    }
  `,
  host: {
    'data-mimi-sheet': '',
    '[class]': 'classes()',
    '[attr.data-side]': 'side()',
    '[attr.data-state]': 'host.state()',
    '[attr.data-size]': 'host.size() || null',
    '[attr.inert]': 'host.state() === "closed" ? "" : null',
    '[style.--mimi-sheet-visible]': 'visible()',
    '[style.--mimi-sheet-keyboard]': 'keyboard()',
    '[style.--mimi-sheet-offset]': 'offset()',
    '[style.translate]': 'dragOffset()',
    '[attr.data-dragging]': 'dragging() ? "" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiSheetFrame {
  protected readonly host = inject(MimiSheetOverlay);
  protected readonly text = inject(MIMI_OVERLAY_TEXT);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly checker = inject(InteractivityChecker);
  private readonly injector = inject(Injector);

  protected readonly side = computed(() => this.host.side());
  protected readonly iconButtonClasses = ICON_BUTTON_CLASSES;
  protected readonly floatingCloseClasses = cn(ICON_BUTTON_CLASSES, 'absolute top-3 right-3 z-10');

  /** Alto visible (el teclado lo achica), lo que tapa el teclado y el desplazamiento de arriba. */
  protected readonly visible = signal<string | null>(null);
  protected readonly keyboard = signal<string | null>(null);
  protected readonly offset = signal<string | null>(null);
  protected readonly dragOffset = signal<string | null>(null);
  protected readonly dragging = signal(false);

  protected readonly headerClasses = computed(() =>
    cn(
      'flex shrink-0 items-center gap-2 px-4 pb-2',
      this.side() === 'bottom' ? 'pt-0' : 'pt-3',
      this.side() !== 'full' && 'touch-none',
    ),
  );

  protected readonly classes = computed(() => {
    const side = this.side();
    return cn(
      'relative flex flex-col overflow-hidden font-sans text-popover-foreground outline-none',
      'bg-[color:var(--mimi-sheet-bg,var(--mimi-popover))]',
      side !== 'full' && [
        'rounded-[var(--mimi-sheet-radius,var(--mimi-radius-card))] border border-[color:var(--mimi-sheet-border,var(--mimi-border))]',
        'shadow-[shadow:var(--mimi-sheet-shadow,var(--mimi-shadow-popover))]',
      ],
      side === 'bottom' && [
        'mx-[var(--mimi-sheet-inset,8px)] mb-[calc(var(--mimi-sheet-inset,8px)_+_var(--mimi-sheet-keyboard,0px))]',
        'max-h-[calc(min(var(--mimi-sheet-max-h,85dvh),var(--mimi-sheet-visible,100dvh))_-_var(--mimi-sheet-inset,8px)_*_2)]',
      ],
      (side === 'left' || side === 'right') && [
        'my-[var(--mimi-sheet-inset,8px)] h-[calc(var(--mimi-sheet-visible,100dvh)_-_var(--mimi-sheet-inset,8px)_*_2)]',
        'w-[min(var(--mimi-sheet-w,24rem),calc(100vw_-_var(--mimi-sheet-inset,8px)_*_2))]',
        'data-[size=sm]:w-[min(var(--mimi-sheet-w,20rem),calc(100vw_-_var(--mimi-sheet-inset,8px)_*_2))]',
        'data-[size=lg]:w-[min(var(--mimi-sheet-w,32rem),calc(100vw_-_var(--mimi-sheet-inset,8px)_*_2))]',
        side === 'left' ? 'ml-[var(--mimi-sheet-inset,8px)]' : 'mr-[var(--mimi-sheet-inset,8px)]',
      ],
      side === 'full' &&
        'mt-[var(--mimi-sheet-offset,0px)] h-[var(--mimi-sheet-visible,100dvh)] w-screen',
      this.host.sheetClass(),
    );
  });

  constructor() {
    this.followViewport();
    // Dos pasadas: el contenido (la salida) se pinta en la primera y el CDK enfoca su contenedor
    // al final de ella; en la segunda el foco pasa al contenido.
    afterNextRender(
      {
        write: () =>
          afterNextRender({ write: () => this.focusContent() }, { injector: this.injector }),
      },
      { injector: this.injector },
    );
  }

  /**
   * El foco va al `autofocus` del contenido o a lo primero que se pueda enfocar en él (no a la X:
   * en un menú o una lista, lo primero es la lista). Si no hay nada, queda en el diálogo.
   */
  private focusContent(): void {
    const body = this.element.querySelector<HTMLElement>('[data-slot="body"]');
    if (!body || body.contains(this.document.activeElement)) return;
    const preferred = body.querySelector<HTMLElement>('[autofocus]');
    const first =
      preferred ??
      Array.from(body.querySelectorAll<HTMLElement>(FOCUSABLE)).find(
        (element) => !element.closest('[inert]') && this.checker.isTabbable(element),
      ) ??
      body.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
  }

  /**
   * El alto de la hoja sigue a la parte visible de la pantalla: con el teclado del móvil abierto,
   * `visualViewport` se achica y la hoja sube por encima del teclado.
   */
  private followViewport(): void {
    const view = this.document.defaultView;
    const viewport = view?.visualViewport;
    if (!view || !viewport) return;
    const update = () => {
      const covered = Math.max(0, view.innerHeight - viewport.height - viewport.offsetTop);
      this.visible.set(`${Math.round(viewport.height)}px`);
      this.keyboard.set(`${Math.round(covered)}px`);
      this.offset.set(`${Math.round(viewport.offsetTop)}px`);
    };
    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    inject(DestroyRef).onDestroy(() => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
    });
  }

  /**
   * Arrastrar hacia el borde desde el asa o la cabecera: la hoja sigue al dedo y, al soltar,
   * se cierra si pasó el 30 % o fue rápido; si no, vuelve.
   */
  protected onDragStart(event: PointerEvent): void {
    const side = this.side();
    if (side === 'full' || !event.isPrimary || event.button !== 0) return;
    if ((event.target as Element | null)?.closest('button, a, input, [role="button"]')) return;
    const start = side === 'bottom' ? event.clientY : event.clientX;
    const startTime = event.timeStamp;
    const size = side === 'bottom' ? this.element.offsetHeight : this.element.offsetWidth;
    const sign = side === 'left' ? -1 : 1;
    let distance = 0;
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture?.(event.pointerId);
    this.dragging.set(true);
    const move = (e: PointerEvent) => {
      if (e.pointerId !== event.pointerId) return;
      const now = side === 'bottom' ? e.clientY : e.clientX;
      distance = Math.max(0, (now - start) * sign);
      const shift = `${distance * sign}px`;
      this.dragOffset.set(side === 'bottom' ? `0 ${shift}` : `${shift} 0`);
    };
    const end = (e: PointerEvent) => {
      if (e.pointerId !== event.pointerId) return;
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', end);
      target.removeEventListener('pointercancel', end);
      this.dragging.set(false);
      const elapsed = Math.max(1, e.timeStamp - startTime);
      const close =
        e.type === 'pointerup' &&
        distance > 0 &&
        (distance > size * DRAG_DISTANCE || distance / elapsed > DRAG_VELOCITY);
      if (close) {
        this.host.requestClose('drag');
      } else {
        this.dragOffset.set(null);
      }
    };
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', end);
    target.addEventListener('pointercancel', end);
  }
}
