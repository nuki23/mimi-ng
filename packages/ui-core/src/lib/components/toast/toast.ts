import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  type ComponentRef,
  DOCUMENT,
  DestroyRef,
  Directive,
  ElementRef,
  EnvironmentInjector,
  Injectable,
  Injector,
  PLATFORM_ID,
  TemplateRef,
  ViewContainerRef,
  afterNextRender,
  assertInInjectionContext,
  computed,
  createComponent,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { cva } from 'class-variance-authority';
import { MimiButton } from '@/components/ui/button';
import { cn } from '@/components/ui/utils/cn';
import { buttonFocusStyles } from '@/components/ui/utils/control-styles';
import { mimiWaitForExit } from '@/components/ui/utils/overlay';
import { MIMI_TOAST_CONFIG, type MimiToastPosition } from './toast-config';
import { MIMI_TOAST_TEXT } from './toast-texts';

/*
 * Toast (docs/design/Mimi F2 Toast Tabs Toolbar.dc.html, «1 · Toast · tonos» y «2 · Toast ·
 * apilados»; prefijo de tokens `toast`, spec 13): avisos breves en una pila abajo a la derecha,
 * colapsada (cada uno 12px más arriba y un 5 % más chico, tres visibles) y expandida al pasar el
 * puntero o con el foco dentro.
 *
 * No hace falta poner un `<mimi-toaster>`: el contenedor se crea solo, la primera vez que se
 * muestra un toast, al final de `body`. Es un popover (`popover="manual"`), así queda encima de
 * los diálogos. Los anuncios los hace el LiveAnnouncer de @angular/cdk/a11y, cuya región existe
 * desde que se llama a `injectMimiToast()`.
 */

/** Cómo se ve: tarjeta con borde (por defecto) o del color del tono. */
export type MimiToastVariant = 'outline' | 'solid';

/** Botón de acción del toast. Al pulsarlo, el toast se cierra. */
export interface MimiToastAction {
  label: string;
  onClick: () => void;
}

/** Opciones de un toast. */
export interface MimiToastOptions {
  description?: string;
  /** Un toast con acción no se cierra solo, salvo que se pase `duration`. */
  action?: MimiToastAction;
  /** Milisegundos hasta cerrarse. `Infinity`: no se cierra solo. Por defecto, 6000. */
  duration?: number;
  /** Ícono propio (una plantilla con un `<svg>`), o `false` para no mostrar ninguno. */
  icon?: TemplateRef<unknown> | false;
  /** Por defecto, `outline`. */
  variant?: MimiToastVariant;
  /** Con el id de un toast abierto, lo reemplaza. */
  id?: string;
  /** Clases del toast, mezcladas con `cn()` (gana la del usuario). */
  class?: string;
}

/** Texto de un toast: un título, o un título con descripción y acción. */
export type MimiToastMessage =
  string | { title: string; description?: string; action?: MimiToastAction };

/** Mensajes de `toast.promise()`. */
export interface MimiToastPromiseMessages<T> {
  loading: MimiToastMessage;
  success: MimiToastMessage | ((value: T) => MimiToastMessage);
  error: MimiToastMessage | ((error: unknown) => MimiToastMessage);
}

/** La función que devuelve `injectMimiToast()`. Cada llamada devuelve el id del toast. */
export interface MimiToastFn {
  (title: string, options?: MimiToastOptions): string;
  success(title: string, options?: MimiToastOptions): string;
  info(title: string, options?: MimiToastOptions): string;
  warning(title: string, options?: MimiToastOptions): string;
  /** Tono danger (tokens destructive). Se anuncia con prioridad. */
  error(title: string, options?: MimiToastOptions): string;
  /**
   * Muestra «cargando» mientras la promesa está pendiente y después el éxito o el error. Devuelve
   * la misma promesa (su rechazo ya queda atendido por el toast).
   */
  promise<T>(
    promise: Promise<T> | (() => Promise<T>),
    messages: MimiToastPromiseMessages<T>,
    options?: MimiToastOptions,
  ): Promise<T>;
  /** Cierra un toast, o todos sin id. */
  dismiss(id?: string): void;
}

type ToastTone = 'neutral' | 'success' | 'warning' | 'info' | 'danger';

/** Uso interno: un toast en la pila. */
interface ToastRecord {
  id: string;
  title: string;
  description?: string;
  action?: MimiToastAction;
  icon?: TemplateRef<unknown> | false;
  variant: MimiToastVariant;
  tone: ToastTone;
  loading: boolean;
  class?: string;
  duration: number;
  closeLabel: string;
  state: 'open' | 'closed';
}

/** Uso interno: dónde va cada toast de la pila. */
interface ToastLayout {
  transform: string;
  hidden: boolean;
  height: number | null;
  front: boolean;
  zIndex: number;
}

/** Del diseño: tres visibles con la pila colapsada, cinco en total, 8px entre ellos expandida. */
const VISIBLE = 3;
const MAX = 5;
const EXPANDED_GAP = 8;
/** Alto mínimo del diseño (la pila usa 68px). */
const MIN_HEIGHT = 68;
/** setTimeout convierte en 0 cualquier valor mayor (cerraría el toast enseguida). */
const MAX_DELAY = 2 ** 31 - 1;

/** El tono sin `solid` y el `solid` sin tono se ven como la tarjeta (el diseño no los muestra). */
const OUTLINE =
  'border border-[color:var(--mimi-toast-border,var(--mimi-border))] bg-[color:var(--mimi-toast-bg,var(--mimi-popover))] text-popover-foreground shadow-[shadow:var(--mimi-toast-shadow,var(--mimi-shadow-popover))]';

/** Colores de cada tono en cada variante (spec 4, «Variante y tono»). */
const TONE_CLASSES = {
  neutral: { outline: OUTLINE, solid: OUTLINE },
  success: { outline: OUTLINE, solid: 'bg-success text-success-foreground shadow-success-hover' },
  warning: { outline: OUTLINE, solid: 'bg-warning text-warning-foreground shadow-warning-hover' },
  info: { outline: OUTLINE, solid: 'bg-info text-info-foreground shadow-info-hover' },
  danger: {
    outline: OUTLINE,
    solid: 'bg-destructive text-destructive-foreground shadow-destructive-hover',
  },
} as const satisfies Record<ToastTone, Record<MimiToastVariant, string>>;

/** Color del ícono en la tarjeta (en el sólido, el del texto). */
const ICON_TONE_CLASSES = {
  neutral: 'text-foreground',
  success: 'text-success-soft-foreground',
  warning: 'text-warning-soft-foreground',
  info: 'text-info-soft-foreground',
  danger: 'text-destructive-soft-foreground',
} as const satisfies Record<ToastTone, string>;

const toastVariants = cva(
  [
    // 12px arriba y abajo: con una línea de descripción mide los 68px de la pila del diseño.
    'relative flex min-h-[68px] items-center gap-3 py-3 pr-10 pl-3.5 text-left font-sans [overflow-wrap:anywhere]',
    'rounded-[var(--mimi-toast-radius,var(--mimi-radius))]',
  ],
  {
    variants: {
      variant: { outline: '', solid: '' },
      tone: { neutral: '', success: '', warning: '', info: '', danger: '' },
    },
    compoundVariants: Object.entries(TONE_CLASSES).flatMap(([tone, byVariant]) =>
      Object.entries(byVariant).map(([variant, cls]) => ({
        tone: tone as ToastTone,
        variant: variant as MimiToastVariant,
        class: cls,
      })),
    ),
    defaultVariants: { variant: 'outline', tone: 'neutral' },
  },
);

const POSITION_CLASSES = {
  'top-left': 'top-[var(--mimi-toast-offset,16px)] left-[var(--mimi-toast-offset,16px)]',
  'top-center': 'top-[var(--mimi-toast-offset,16px)] left-1/2 -translate-x-1/2',
  'top-right': 'top-[var(--mimi-toast-offset,16px)] right-[var(--mimi-toast-offset,16px)]',
  'bottom-left': 'bottom-[var(--mimi-toast-offset,16px)] left-[var(--mimi-toast-offset,16px)]',
  'bottom-center': 'bottom-[var(--mimi-toast-offset,16px)] left-1/2 -translate-x-1/2',
  'bottom-right': 'right-[var(--mimi-toast-offset,16px)] bottom-[var(--mimi-toast-offset,16px)]',
} as const satisfies Record<MimiToastPosition, string>;

/**
 * El contenedor: un popover sin los estilos del navegador (margen, inset, borde, fondo), que no
 * recibe clics; los toasts sí. 340px, sin pasarse del ancho de la pantalla menos los márgenes.
 */
const HOST_CLASSES =
  'pointer-events-none fixed inset-auto z-[2147483647] m-0 h-auto w-[min(var(--mimi-toast-width,340px),calc(100vw_-_2*var(--mimi-toast-offset,16px)))] overflow-visible border-0 bg-transparent p-0 text-popover-foreground';

const CLOSE_CLASSES = cn(
  'absolute top-2 right-2 inline-flex size-6 cursor-pointer items-center justify-center rounded-[var(--mimi-radius-sm)] bg-transparent',
  'mimi-transition active:scale-(--mimi-press-scale-sm) [&_svg]:size-3.5',
  buttonFocusStyles,
);

/** Crea la plantilla del ícono. Hace lo mismo que NgTemplateOutlet, sin @angular/common. */
@Directive({ selector: '[mimiToastIcon]' })
class MimiToastIcon {
  readonly template = input.required<TemplateRef<unknown>>({ alias: 'mimiToastIcon' });
  private readonly viewContainer = inject(ViewContainerRef);

  private readonly render = effect(() => {
    const template = this.template();
    untracked(() => {
      this.viewContainer.clear();
      this.viewContainer.createEmbeddedView(template);
    });
  });
}

/** Un toast de la pila. */
@Component({
  selector: 'li[mimiToastItem]',
  imports: [MimiButton, MimiToastIcon],
  template: `
    @let t = toast();
    <!-- Recorta a los de atrás al alto del de adelante (pila colapsada). -->
    <div
      [style.height.px]="layout().height"
      [class.overflow-hidden]="layout().height !== null"
      class="rounded-[var(--mimi-toast-radius,var(--mimi-radius))]"
    >
      <div #row data-slot="toast" [class]="rowClasses()">
        @if (t.loading) {
          <span data-slot="icon" aria-hidden="true" [class]="iconClasses()">
            <svg
              class="animate-[mimi-spin_0.8s_linear_infinite] text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <!-- Lucide loader-circle (ISC) -->
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </span>
        } @else if (t.icon) {
          <span data-slot="icon" aria-hidden="true" [class]="iconClasses()">
            <ng-container [mimiToastIcon]="t.icon" />
          </span>
        } @else if (t.icon !== false) {
          <span data-slot="icon" aria-hidden="true" [class]="iconClasses()">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <!-- Lucide bell, circle-check, triangle-alert, info y circle-x (ISC) -->
              @switch (t.tone) {
                @case ('success') {
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                }
                @case ('warning') {
                  <path
                    d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"
                  />
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                }
                @case ('info') {
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                }
                @case ('danger') {
                  <circle cx="12" cy="12" r="10" />
                  <path d="m15 9-6 6" />
                  <path d="m9 9 6 6" />
                }
                @default {
                  <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                  <path
                    d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"
                  />
                }
              }
            </svg>
          </span>
        }
        <div class="flex min-w-0 flex-1 flex-col gap-px">
          <span data-slot="title" [class]="titleClasses()">{{ t.title }}</span>
          @if (t.description) {
            <span data-slot="description" [class]="descriptionClasses()">{{ t.description }}</span>
          }
        </div>
        @if (t.action) {
          <button
            mimiBtn
            type="button"
            size="sm"
            data-slot="action"
            [class]="actionClasses()"
            (click)="act()"
          >
            {{ t.action.label }}
          </button>
        }
        <button
          type="button"
          data-slot="close"
          [class]="closeClasses()"
          [attr.aria-label]="t.closeLabel"
          (click)="store.dismiss(t.id)"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: `
    @keyframes mimi-toast-in {
      from {
        opacity: 0;
        translate: 0 var(--mimi-toast-enter, 100%);
      }
    }
    @keyframes mimi-toast-out {
      to {
        opacity: 0;
        translate: 0 var(--mimi-toast-enter, 100%);
      }
    }
    :host {
      transition:
        transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1),
        opacity 0.3s ease;
    }
    :host([data-state='open']:not([data-entered])) {
      animation: mimi-toast-in 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    :host([data-state='closed']) {
      animation: mimi-toast-out 0.3s ease forwards;
    }
    @media (prefers-reduced-motion: reduce) {
      :host {
        animation: none !important;
        transition: none !important;
      }
    }
  `,
  host: {
    tabindex: '-1',
    '[class]': 'hostClasses()',
    '[style.transform]': 'layout().transform',
    '[style.opacity]': 'layout().hidden ? 0 : null',
    '[style.z-index]': 'layout().zIndex',
    '[style.--mimi-toast-enter]': 'top() ? "-100%" : null',
    '[attr.inert]': 'layout().hidden || toast().state === "closed" ? "" : null',
    '[attr.data-state]': 'toast().state',
    '[attr.data-variant]': 'variant()',
    '[attr.data-tone]': 'toast().tone === "neutral" ? null : toast().tone',
    '[attr.data-front]': 'layout().front ? "" : null',
    '[attr.data-entered]': 'entered() ? "" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MimiToastItem {
  readonly toast = input.required<ToastRecord>();
  readonly layout = input.required<ToastLayout>();
  readonly top = input(false);

  protected readonly store = inject(MimiToastStore);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  private readonly row = viewChild.required<ElementRef<HTMLElement>>('row');
  protected readonly entered = signal(false);

  /** El sólido sin tono se ve como la tarjeta (el diseño no lo muestra). */
  protected readonly variant = computed<MimiToastVariant>(() =>
    this.toast().variant === 'solid' && this.toast().tone !== 'neutral' ? 'solid' : 'outline',
  );
  private readonly solid = computed(() => this.variant() === 'solid');

  protected readonly hostClasses = computed(() =>
    cn(
      'absolute inset-x-0 block rounded-[var(--mimi-toast-radius,var(--mimi-radius))] outline-none',
      this.top() ? 'top-0 origin-top' : 'bottom-0 origin-bottom',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    ),
  );
  protected readonly rowClasses = computed(() =>
    cn(
      'pointer-events-auto',
      toastVariants({ variant: this.variant(), tone: this.toast().tone }),
      this.toast().class,
    ),
  );
  protected readonly iconClasses = computed(() =>
    this.solid()
      ? 'inline-flex size-[34px] shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklch,currentColor_16%,transparent)] [&_svg]:size-[18px]'
      : cn('inline-flex shrink-0 [&_svg]:size-[18px]', ICON_TONE_CLASSES[this.toast().tone]),
  );
  protected readonly titleClasses = computed(() =>
    this.solid() ? 'text-sm font-bold' : 'text-sm font-semibold',
  );
  protected readonly descriptionClasses = computed(() =>
    this.solid() ? 'text-[13px] leading-[1.4]' : 'text-[12.5px] text-muted-foreground',
  );
  /** Acción del diseño: 28px, 10px a los lados, radio sm, 12.5px/600. */
  protected readonly actionClasses = computed(() =>
    cn(
      'h-7 shrink-0 rounded-[var(--mimi-radius-sm)] px-2.5 text-[12.5px] font-semibold',
      // En el sólido (sin diseño), el mismo fondo translúcido que el círculo del ícono.
      this.solid() &&
        'bg-[color-mix(in_oklch,currentColor_16%,transparent)] text-current shadow-none hover:not-disabled:bg-[color-mix(in_oklch,currentColor_24%,transparent)] hover:not-disabled:shadow-none',
    ),
  );
  protected readonly closeClasses = computed(() =>
    cn(
      CLOSE_CLASSES,
      this.solid()
        ? 'text-current hover:bg-[color-mix(in_oklch,currentColor_16%,transparent)]'
        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
    ),
  );

  /** Cuando se cierra: espera la animación de salida y lo saca de la pila. */
  private readonly exit = effect(() => {
    if (this.toast().state !== 'closed') return;
    const id = this.toast().id;
    untracked(() =>
      afterNextRender(
        { read: () => void mimiWaitForExit(this.host).then(() => this.store.remove(id)) },
        { injector: this.injector },
      ),
    );
  });

  /** El elemento de cada toast, para moverle el foco (antes de los hooks de render). */
  private readonly register = effect(() => this.store.elements.set(this.toast().id, this.host));

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender({
      read: () => {
        const id = this.toast().id;
        // Terminada la entrada, no se repite (al volver a mostrar el popover, por ejemplo).
        void mimiWaitForExit(this.host).then(() => this.entered.set(true));
        // El alto natural, medido en la fila (el recorte no la afecta).
        const row = this.row().nativeElement;
        this.store.setHeight(id, row.offsetHeight);
        if (typeof ResizeObserver === 'undefined') return;
        const observer = new ResizeObserver(() => this.store.setHeight(id, row.offsetHeight));
        observer.observe(row);
        destroyRef.onDestroy(() => observer.disconnect());
      },
    });
    destroyRef.onDestroy(() => {
      if (this.store.elements.get(this.toast().id) === this.host) {
        this.store.elements.delete(this.toast().id);
      }
    });
  }

  protected act(): void {
    const { action, id } = this.toast();
    action?.onClick();
    this.store.dismiss(id);
  }
}

/** El contenedor de la pila. Lo crea el servicio; no se usa en plantillas. */
@Component({
  selector: 'mimi-toaster',
  imports: [MimiToastItem],
  template: `
    <section
      tabindex="-1"
      class="outline-none"
      [attr.aria-label]="label"
      (keydown)="onKeydown($event)"
      (focusin)="setFocused(true)"
      (focusout)="onFocusOut($event)"
    >
      <ol
        class="pointer-events-auto relative m-0 list-none p-0"
        [style.height]="stackHeight()"
        (mouseenter)="setHovered(true)"
        (mouseleave)="setHovered(false)"
      >
        @for (toast of store.toasts(); track toast.id; let i = $index) {
          <li mimiToastItem [toast]="toast" [layout]="layouts()[i]" [top]="top"></li>
        }
      </ol>
    </section>
  `,
  host: {
    popover: 'manual',
    '[class]': 'classes',
    '[attr.data-position]': 'position',
    '[attr.data-expanded]': 'expanded() ? "" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MimiToaster {
  protected readonly store = inject(MimiToastStore);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly position = this.store.config.position;
  protected readonly top = this.position.startsWith('top');
  protected readonly classes = cn(HOST_CLASSES, POSITION_CLASSES[this.position]);
  protected readonly label = this.store.text.region(this.store.config.hotkey);

  private readonly hovered = signal(false);
  private readonly focused = signal(false);
  protected readonly expanded = computed(() => this.hovered() || this.focused());

  /** Alto de cada toast: el medido, o el mínimo del diseño mientras no hay medida. */
  private height(id: string | undefined): number {
    return (id && this.store.heights().get(id)) || MIN_HEIGHT;
  }

  protected readonly layouts = computed<ToastLayout[]>(() => {
    const toasts = this.store.toasts();
    const expanded = this.expanded();
    const front = this.height(toasts[0]?.id);
    const sign = this.top ? '' : '-';
    let offset = 0;
    return toasts.map((toast, i) => {
      const layout: ToastLayout = expanded
        ? {
            transform: `translateY(${sign}${offset}px)`,
            hidden: false,
            height: null,
            front: i === 0,
            zIndex: toasts.length - i,
          }
        : {
            // Colapsada: cada uno --mimi-toast-stack-gap más atrás y un 5 % más chico, con el alto
            // del de adelante; del cuarto en adelante, ocultos.
            transform: `translateY(calc(${sign}1 * var(--mimi-toast-stack-gap, 12px) * ${i})) scale(${1 - 0.05 * i})`,
            hidden: i >= VISIBLE,
            height: i === 0 ? null : front,
            front: i === 0,
            zIndex: toasts.length - i,
          };
      offset += this.height(toast.id) + EXPANDED_GAP;
      return layout;
    });
  });

  /** El alto de la pila: así el puntero no sale por los huecos entre toasts. */
  protected readonly stackHeight = computed(() => {
    const toasts = this.store.toasts();
    if (!toasts.length) return '0px';
    if (this.expanded()) {
      const total = toasts.reduce((sum, toast) => sum + this.height(toast.id), 0);
      return `${total + EXPANDED_GAP * (toasts.length - 1)}px`;
    }
    const behind = Math.min(toasts.length - 1, VISIBLE - 1);
    return `calc(${this.height(toasts[0].id)}px + var(--mimi-toast-stack-gap, 12px) * ${behind})`;
  });

  constructor() {
    // Sin toasts, el puntero y el foco ya no están sobre la pila (mouseleave puede no llegar).
    effect(() => {
      if (this.store.toasts().length) return;
      untracked(() => {
        this.setHovered(false);
        this.setFocused(false);
      });
    });
  }

  protected setHovered(value: boolean): void {
    this.hovered.set(value);
    this.store.setPaused('hover', value);
  }

  protected setFocused(value: boolean): void {
    this.focused.set(value);
    this.store.setPaused('focus', value);
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (!next || !this.host.contains(next)) this.setFocused(false);
  }

  /** Escape devuelve el foco a donde estaba. No llega al Dialog de abajo. */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    event.stopPropagation();
    this.store.restoreFocus();
  }
}

/**
 * Uso interno: la pila de toasts, los tiempos, los anuncios y el contenedor. Uno por aplicación.
 */
@Injectable({ providedIn: 'root' })
class MimiToastStore {
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private readonly browser = inject(PLATFORM_ID) === 'browser';
  // Crea la región de los anuncios ya, antes del primer toast.
  private readonly announcer = inject(LiveAnnouncer);
  readonly config = inject(MIMI_TOAST_CONFIG);
  readonly text = inject(MIMI_TOAST_TEXT);

  /** Los toasts, el más nuevo primero (también los que están saliendo). */
  readonly toasts = signal<ToastRecord[]>([]);
  readonly heights = signal<ReadonlyMap<string, number>>(new Map());
  /** El elemento de cada toast, para moverle el foco. */
  readonly elements = new Map<string, HTMLElement>();

  private nextId = 0;
  private container: ComponentRef<MimiToaster> | null = null;
  private readonly timers = new Map<
    string,
    { remaining: number; started: number; handle: ReturnType<typeof setTimeout> | null }
  >();
  private readonly pauses = new Set<'hover' | 'focus' | 'hidden'>();
  /** Otro popover se mostró después del contenedor y le quedó encima. */
  private covered = false;
  private previousFocus: Element | null = null;
  private pendingAnnouncement: { texts: string[]; assertive: boolean; done: Promise<void> } | null =
    null;

  private readonly onKeydown = (event: KeyboardEvent) => this.hotkey(event);
  private readonly onVisibility = () =>
    this.setPaused('hidden', this.document.visibilityState === 'hidden');
  private readonly onToggle = (event: Event) => {
    const host = this.container?.location.nativeElement;
    if (event.target !== host && (event as Event & { newState?: string }).newState === 'open') {
      this.covered = true;
    }
  };

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      for (const timer of this.timers.values()) {
        if (timer.handle !== null) clearTimeout(timer.handle);
      }
      this.timers.clear();
      if (!this.container) return;
      this.document.removeEventListener('keydown', this.onKeydown);
      this.document.removeEventListener('visibilitychange', this.onVisibility);
      this.document.removeEventListener('toggle', this.onToggle, { capture: true });
      const host = this.container.location.nativeElement as HTMLElement;
      this.container.destroy();
      host.remove();
      this.container = null;
    });
  }

  show(
    title: string,
    tone: ToastTone,
    options: MimiToastOptions,
    closeLabel: string,
    extra: { loading?: boolean; replaceOnly?: boolean } = {},
  ): string {
    const id = options.id ?? `mimi-toast-${this.nextId++}`;
    const open = this.toasts().find((toast) => toast.id === id && toast.state === 'open');
    if (!this.browser || (extra.replaceOnly && !open)) return id;
    this.ensureContainer();

    const record: ToastRecord = {
      id,
      title,
      description: options.description,
      action: options.action,
      icon: options.icon,
      variant: options.variant ?? 'outline',
      tone,
      loading: extra.loading ?? false,
      class: options.class,
      duration: options.duration ?? (options.action ? Infinity : this.config.duration),
      closeLabel,
      state: 'open',
    };
    if (open) {
      this.toasts.update((list) => list.map((toast) => (toast.id === id ? record : toast)));
    } else {
      this.toasts.update((list) => [record, ...list.filter((toast) => toast.id !== id)]);
      this.trim();
    }
    this.startTimer(record);
    this.announce(record);
    this.raise();
    return id;
  }

  /** Cierra un toast (animado), o todos sin id. */
  dismiss(id?: string): void {
    const ids = id === undefined ? this.toasts().map((toast) => toast.id) : [id];
    for (const target of ids) {
      const toast = this.toasts().find((t) => t.id === target);
      if (!toast || toast.state === 'closed') continue;
      this.clearTimer(target);
      this.moveFocusFrom(target);
      this.toasts.update((list) =>
        list.map((t) => (t.id === target ? { ...t, state: 'closed' } : t)),
      );
    }
  }

  /** Terminó la salida: fuera de la pila. */
  remove(id: string): void {
    const toast = this.toasts().find((t) => t.id === id);
    if (!toast || toast.state !== 'closed') return;
    this.toasts.update((list) => list.filter((t) => t !== toast));
    this.heights.update((heights) => {
      const next = new Map(heights);
      next.delete(id);
      return next;
    });
  }

  setHeight(id: string, height: number): void {
    if (!height || this.heights().get(id) === height) return;
    this.heights.update((heights) => new Map(heights).set(id, height));
  }

  /** Detiene o reanuda el tiempo de todos (puntero, foco o pestaña oculta). */
  setPaused(reason: 'hover' | 'focus' | 'hidden', paused: boolean): void {
    const before = this.pauses.size > 0;
    if (paused) this.pauses.add(reason);
    else this.pauses.delete(reason);
    const after = this.pauses.size > 0;
    if (before === after) return;
    for (const [id, timer] of this.timers) {
      if (after) {
        if (timer.handle === null) continue;
        clearTimeout(timer.handle);
        timer.handle = null;
        timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.started));
      } else {
        this.run(id);
      }
    }
  }

  /** Devuelve el foco a donde estaba antes del atajo (o lo suelta si ya no existe). */
  restoreFocus(): void {
    const previous = this.previousFocus as HTMLElement | null;
    this.previousFocus = null;
    if (previous?.isConnected && typeof previous.focus === 'function') {
      previous.focus();
    } else {
      (this.document.activeElement as HTMLElement | null)?.blur?.();
    }
  }

  private ensureContainer(): void {
    if (this.container) return;
    // Recién aquí, y no al inyectar: un ErrorHandler propio puede usar injectMimiToast().
    const appRef = this.injector.get(ApplicationRef);
    this.container = createComponent(MimiToaster, {
      environmentInjector: this.injector.get(EnvironmentInjector),
    });
    appRef.attachView(this.container.hostView);
    this.document.body.appendChild(this.container.location.nativeElement);
    this.document.addEventListener('keydown', this.onKeydown);
    this.document.addEventListener('visibilitychange', this.onVisibility);
    this.document.addEventListener('toggle', this.onToggle, { capture: true });
  }

  /**
   * Deja el contenedor encima de todo: si otro popover se mostró después (un Dialog, un menú),
   * lo vuelve a mostrar. No con el foco dentro: ocultarlo lo movería.
   */
  private raise(): void {
    const host = this.container?.location.nativeElement as HTMLElement | undefined;
    if (!host || typeof host.showPopover !== 'function') return;
    if (!host.matches(':popover-open')) {
      host.showPopover();
    } else if (this.covered && !host.contains(this.document.activeElement)) {
      host.hidePopover();
      host.showPopover();
    } else {
      return;
    }
    this.covered = false;
  }

  /** Más de cinco: sale el más viejo sin acción ni foco. */
  private trim(): void {
    const open = this.toasts().filter((toast) => toast.state === 'open');
    let extra = open.length - MAX;
    for (const toast of [...open].reverse()) {
      if (extra <= 0) break;
      if (toast.action || this.elements.get(toast.id)?.contains(this.document.activeElement)) {
        continue;
      }
      this.dismiss(toast.id);
      extra--;
    }
  }

  private startTimer(toast: ToastRecord): void {
    this.clearTimer(toast.id);
    if (toast.loading || !Number.isFinite(toast.duration)) return;
    const remaining = Math.min(Math.max(toast.duration, 0), MAX_DELAY);
    this.timers.set(toast.id, { remaining, started: 0, handle: null });
    if (!this.pauses.size) this.run(toast.id);
  }

  private run(id: string): void {
    const timer = this.timers.get(id);
    if (!timer) return;
    timer.started = Date.now();
    timer.handle = setTimeout(() => {
      this.timers.delete(id);
      this.dismiss(id);
    }, timer.remaining);
  }

  private clearTimer(id: string): void {
    const timer = this.timers.get(id);
    if (timer?.handle != null) clearTimeout(timer.handle);
    this.timers.delete(id);
  }

  /**
   * Anuncia «Título. Descripción». Si llega otro antes de que el anterior se escriba (el
   * LiveAnnouncer espera 100 ms), se anuncian juntos: ninguno se pierde.
   */
  private announce(toast: ToastRecord): void {
    const text = toast.description ? `${toast.title}. ${toast.description}` : toast.title;
    const pending = this.pendingAnnouncement;
    const texts = pending ? [...pending.texts, text] : [text];
    const assertive = (pending?.assertive ?? false) || toast.tone === 'danger';
    const done = this.announcer.announce(texts.join(' '), assertive ? 'assertive' : 'polite');
    const announcement = { texts, assertive, done };
    this.pendingAnnouncement = announcement;
    void done.then(() => {
      if (this.pendingAnnouncement === announcement) this.pendingAnnouncement = null;
    });
  }

  /** F8 (o la tecla configurada): el foco al toast más nuevo. */
  private hotkey(event: KeyboardEvent): void {
    if (event.key !== this.config.hotkey) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const first = this.toasts().find((toast) => toast.state === 'open');
    const element = first && this.elements.get(first.id);
    if (!element) return;
    event.preventDefault();
    event.stopPropagation();
    const host = this.container?.location.nativeElement as HTMLElement | undefined;
    if (!host?.contains(this.document.activeElement)) {
      this.previousFocus = this.document.activeElement;
    }
    element.focus();
  }

  /** Si el toast que se cierra tiene el foco, pasa al vecino o vuelve a donde estaba. */
  private moveFocusFrom(id: string): void {
    const element = this.elements.get(id);
    if (!element?.contains(this.document.activeElement)) return;
    const open = this.toasts().filter((toast) => toast.state === 'open');
    const index = open.findIndex((toast) => toast.id === id);
    const neighbor = open[index + 1] ?? open[index - 1];
    if (!neighbor) {
      this.restoreFocus();
      return;
    }
    const next = this.elements.get(neighbor.id);
    if (next) {
      next.focus();
      return;
    }
    // Recién creado (la acción abrió otro toast): todavía no se pintó.
    afterNextRender(
      {
        read: () => {
          const element = this.elements.get(neighbor.id);
          if (element) element.focus();
          else this.restoreFocus();
        },
      },
      { injector: this.injector },
    );
  }
}

function content(message: MimiToastMessage): {
  title: string;
  description?: string;
  action?: MimiToastAction;
} {
  return typeof message === 'string' ? { title: message } : message;
}

/**
 * Prepara `toast()`:
 *
 * ```ts
 * private readonly toast = injectMimiToast();
 *
 * save() {
 *   this.toast.success('Cambios guardados', { description: 'panel-ventas se publicó.' });
 * }
 * ```
 *
 * Se llama al declarar la propiedad (o en el constructor): necesita el contexto de inyección.
 * Dentro de un método falla con NG0203. No hace falta poner nada en la plantilla: la pila se crea
 * sola. Los toasts sobreviven a la navegación; una acción puede ejecutarse con el componente que
 * la creó ya destruido. En el servidor (SSR) no muestra nada.
 */
export function injectMimiToast(): MimiToastFn {
  assertInInjectionContext(injectMimiToast);
  const store = inject(MimiToastStore);
  // El nombre de la X sale de quien llama (sus providers o los de su ruta), como en Confirm.
  const closeLabel = inject(MIMI_TOAST_TEXT).close;
  const show =
    (tone: ToastTone) =>
    (title: string, options: MimiToastOptions = {}): string =>
      store.show(title, tone, options, closeLabel);

  return Object.assign(show('neutral'), {
    success: show('success'),
    info: show('info'),
    warning: show('warning'),
    error: show('danger'),
    promise: <T>(
      source: Promise<T> | (() => Promise<T>),
      messages: MimiToastPromiseMessages<T>,
      options: MimiToastOptions = {},
    ): Promise<T> => {
      const promise = typeof source === 'function' ? source() : source;
      const loading = content(messages.loading);
      const id = store.show(
        loading.title,
        'neutral',
        { ...options, description: loading.description },
        closeLabel,
        { loading: true },
      );
      // Si el usuario cerró el «cargando», el resultado no vuelve a abrirlo.
      const settle = (tone: ToastTone, message: MimiToastMessage) => {
        const result = content(message);
        store.show(result.title, tone, { ...options, ...result, id }, closeLabel, {
          replaceOnly: true,
        });
      };
      promise.then(
        (value) =>
          settle(
            'success',
            typeof messages.success === 'function' ? messages.success(value) : messages.success,
          ),
        (error: unknown) =>
          settle(
            'danger',
            typeof messages.error === 'function' ? messages.error(error) : messages.error,
          ),
      );
      return promise;
    },
    dismiss: (id?: string) => store.dismiss(id),
  });
}
