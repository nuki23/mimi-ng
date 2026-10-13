import { Dialog, type DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  Directive,
  ElementRef,
  Injectable,
  InjectionToken,
  Injector,
  TemplateRef,
  type Type,
  ViewContainerRef,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
  isDevMode,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import type { Observable } from 'rxjs';
import { cn } from '@/components/ui/utils/cn';
import { buttonFocusStyles } from '@/components/ui/utils/control-styles';
import { MIMI_OVERLAY_ANIMATION, mimiWaitForExit } from '@/components/ui/utils/overlay';
import { MIMI_DIALOG_TEXT } from './dialog-texts';

/*
 * Dialog (docs/design/Mimi F2 Overlays.dc.html, «1 · Dialog»; prefijo de tokens `dialog`, spec
 * 13): panel centrado de 420px sobre un fondo oscurecido y desenfocado, con la X arriba a la
 * derecha (32px, a 12px del borde), encabezado, cuerpo y pie con 24px a los lados.
 *
 * Por dentro usa @angular/cdk/dialog (decisión 4.3): el CDK da el rol, el encierro del foco, el
 * foco de vuelta, el `aria-hidden` del resto de la página y el bloqueo del scroll. Mimi pone el
 * panel, la X, la animación y el cierre (al CDK se le pasa `disableClose`, para animar la salida
 * antes de cerrar de verdad). Nada del CDK sale en la API pública.
 */

/** Opciones de un diálogo. */
export interface MimiDialogConfig<D = unknown> {
  /** Datos para el contenido: `inject(MIMI_DIALOG_DATA)`. */
  data?: D;
  /** Ancho del panel (un valor CSS). Por defecto, `--mimi-dialog-width` (420px). */
  width?: string;
  /** Ancho máximo del panel (un valor CSS). Nunca supera el ancho de la pantalla menos 32px. */
  maxWidth?: string;
  /** Clases del panel, mezcladas con `cn()` (gana la del usuario). */
  class?: string;
  /** Escape cierra. Por defecto, `true`. */
  closeOnEscape?: boolean;
  /** Un clic en el fondo cierra. Por defecto, `true`. */
  closeOnBackdropClick?: boolean;
  /** Atajo: ni Escape ni el clic en el fondo cierran. La X sigue funcionando. */
  disableClose?: boolean;
  /**
   * La X se ve siempre; ocúltala solo en diálogos de confirmación que tienen sus propios botones
   * de salida. Por defecto, `true`.
   */
  closeButton?: boolean;
  /** `alertdialog` para una confirmación que interrumpe. Por defecto, `dialog`. */
  role?: 'dialog' | 'alertdialog';
  /** Nombre accesible, si el contenido no tiene un `mimiDialogTitle`. */
  ariaLabel?: string;
  /**
   * A dónde va el foco al abrir: `'first'` (el primer elemento enfocable; por defecto),
   * `'dialog'` (el panel) o un selector CSS.
   */
  autoFocus?: 'first' | 'dialog' | (string & {});
  /** Injector para el contenido (por defecto, el de la aplicación). */
  injector?: Injector;
}

/** Datos que se pasaron en `open(…, { data })`. */
export const MIMI_DIALOG_DATA = new InjectionToken<unknown>('MIMI_DIALOG_DATA');

/** Uso interno: lo que el panel necesita para pintarse. */
interface MimiDialogShellOptions {
  content: Type<unknown> | TemplateRef<unknown>;
  config: MimiDialogConfig;
}

const MIMI_DIALOG_SHELL_OPTIONS = new InjectionToken<MimiDialogShellOptions>(
  'MIMI_DIALOG_SHELL_OPTIONS',
);

/**
 * Referencia a un diálogo abierto. La devuelve `MimiDialogService.open()` y el contenido la
 * recibe con `inject(MimiDialogRef)`.
 */
export class MimiDialogRef<R = unknown> {
  /** Uso interno: ids registrados por `mimiDialogTitle` y `mimiDialogDescription`. */
  readonly titleId = signal<string | null>(null);
  readonly descriptionId = signal<string | null>(null);
  /** Uso interno: «closed» mientras dura la animación de salida. */
  readonly state = signal<'open' | 'closed'>('open');

  private cdkRef: DialogRef<R> | null = null;
  private result: R | undefined;

  /** Cierra el diálogo, con un resultado opcional para `afterClosed()`. */
  close(result?: R): void {
    if (this.state() === 'closed') return;
    this.result = result;
    this.state.set('closed');
    // El fondo se desvanece junto con el panel; el diálogo se cierra al terminar la animación.
    this.cdkRef?.overlayRef.detachBackdrop();
  }

  /**
   * Emite una vez, con el resultado, cuando el diálogo ya se cerró (después de la animación de
   * salida, o enseguida si lo cerró una navegación).
   */
  afterClosed(): Observable<R | undefined> {
    return this.cdkRef!.closed;
  }

  /** Uso interno: lo conecta el servicio al abrir. */
  connect(cdkRef: DialogRef<R>): void {
    this.cdkRef = cdkRef;
  }

  /** Uso interno: cierra de verdad (terminó la animación de salida, o no hay que esperarla). */
  finish(): void {
    this.state.set('closed');
    this.cdkRef?.close(this.result);
  }
}

let nextId = 0;

const PANEL_CLASSES = cn(
  'group/dialog relative flex max-h-[calc(100dvh_-_32px)] w-[var(--mimi-dialog-width,420px)] max-w-[calc(100vw_-_32px)] flex-col overflow-y-auto font-sans outline-none',
  'rounded-[var(--mimi-dialog-radius,var(--mimi-radius-card))] border border-border',
  'bg-[color:var(--mimi-dialog-bg,var(--mimi-popover))] text-popover-foreground',
  'shadow-[shadow:var(--mimi-dialog-shadow,var(--mimi-shadow-popover))]',
);

const CLOSE_CLASSES = cn(
  'absolute top-3 right-3 inline-flex size-[var(--mimi-dialog-close-size,32px)] cursor-pointer items-center justify-center',
  'rounded-[var(--mimi-radius-sm)] bg-transparent text-muted-foreground',
  'mimi-transition hover:bg-accent hover:text-foreground active:scale-90',
  buttonFocusStyles,
);

/**
 * Fondo: color y desenfoque de la spec 13. La opacidad la anima el CDK (overlay-prebuilt.css, que
 * no está en una capa: por eso el `!`); dura lo mismo que la animación del panel.
 */
const BACKDROP_CLASSES = [
  'bg-[color:var(--mimi-dialog-overlay,var(--mimi-overlay))]',
  'backdrop-blur-[var(--mimi-dialog-overlay-blur,var(--mimi-overlay-blur))]',
  'duration-150!',
  'motion-reduce:duration-[1ms]!',
];

/** El contenedor del CDK recibe el foco con `autoFocus: 'dialog'`: sin contorno del navegador. */
const PANE_CLASSES = ['[&>.cdk-dialog-container]:outline-none'];

/**
 * Uso interno (se exporta porque el compilador lo exige): crea el contenido del usuario dentro
 * del panel. Hace lo mismo que NgComponentOutlet y NgTemplateOutlet, sin @angular/common.
 */
@Directive({ selector: '[mimiDialogOutlet]' })
export class MimiDialogOutlet {
  readonly content = input.required<Type<unknown> | TemplateRef<unknown>>({
    alias: 'mimiDialogOutlet',
  });
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly data = inject(MIMI_DIALOG_DATA, { optional: true });

  private readonly render = effect(() => {
    const content = this.content();
    untracked(() => {
      this.viewContainer.clear();
      if (content instanceof TemplateRef) {
        // El injector deja que las piezas (título, cerrar…) encuentren su MimiDialogRef.
        this.viewContainer.createEmbeddedView(
          content,
          { $implicit: this.data },
          { injector: this.injector },
        );
        return;
      }
      const host = this.viewContainer.createComponent(content, { injector: this.injector }).location
        .nativeElement as HTMLElement;
      // El host del componente no dibuja caja: así el encabezado, el cuerpo y el pie son hijos
      // directos del panel (la columna y el scroll del cuerpo dependen de eso).
      host.style.display = 'contents';
    });
  });
}

/**
 * Uso interno (se exporta porque el compilador lo exige): el panel del diálogo, con la X y el
 * contenido del usuario. Es lo que Mimi le abre al `Dialog` del CDK.
 */
@Component({
  selector: 'mimi-dialog-shell',
  imports: [MimiDialogOutlet],
  template: `
    <div
      #panel
      data-mimi-overlay-panel
      [class]="classes"
      [style.width]="options.config.width ?? null"
      [style.max-width]="maxWidth"
      [attr.data-state]="ref.state()"
      [attr.data-close-button]="closeButton ? '' : null"
      [attr.inert]="ref.state() === 'closed' ? '' : null"
    >
      <ng-container [mimiDialogOutlet]="options.content" />
      <!-- Después del contenido: así el primer elemento enfocable es del contenido, no la X. -->
      @if (closeButton) {
        <button
          type="button"
          data-slot="close"
          [class]="closeClasses"
          [attr.aria-label]="text.close"
          (click)="ref.close()"
        >
          <svg
            aria-hidden="true"
            class="size-[18px]"
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
      }
    </div>
  `,
  styles: MIMI_OVERLAY_ANIMATION,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiDialogShell {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  protected readonly ref = inject<MimiDialogRef>(MimiDialogRef);
  protected readonly options = inject(MIMI_DIALOG_SHELL_OPTIONS);
  protected readonly text = inject(MIMI_DIALOG_TEXT);

  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');

  protected readonly closeButton = this.options.config.closeButton ?? true;
  protected readonly closeClasses = CLOSE_CLASSES;
  protected readonly classes = cn(PANEL_CLASSES, this.options.config.class);
  /** El máximo del usuario, sin salirse de la pantalla (sin él, lo limita la clase del panel). */
  protected readonly maxWidth = this.options.config.maxWidth
    ? `min(${this.options.config.maxWidth}, calc(100vw - 32px))`
    : null;

  /** El `cdk-dialog-container`: lleva el rol y los atributos ARIA. */
  private get container(): HTMLElement | null {
    return this.host.parentElement;
  }

  /**
   * Nombre y descripción: los ids de `mimiDialogTitle` y `mimiDialogDescription`, cuando existen.
   * No se pasan al CDK porque los fija al abrir, antes de que exista el contenido.
   */
  private readonly describe = effect(() => {
    const titleId = this.options.config.ariaLabel ? null : this.ref.titleId();
    const descriptionId = this.ref.descriptionId();
    const container = this.container;
    if (!container) return;
    setAttribute(container, 'aria-labelledby', titleId);
    setAttribute(container, 'aria-describedby', descriptionId);
  });

  /** Al cerrar: espera la animación de salida y recién entonces cierra el diálogo del CDK. */
  private readonly exit = effect(() => {
    if (this.ref.state() !== 'closed') return;
    untracked(() =>
      afterNextRender(
        {
          read: () =>
            void mimiWaitForExit(this.panel().nativeElement).then(() => this.ref.finish()),
        },
        { injector: this.injector },
      ),
    );
  });

  constructor() {
    // En la fase de lectura: después de que el CDK movió el foco al abrir.
    afterNextRender({
      read: () => {
        const container = this.container;
        // `autoFocus` con un selector que no encuentra nada deja el foco fuera: va al panel.
        if (container && !container.contains(this.document.activeElement)) container.focus();
        if (isDevMode() && !this.options.config.ariaLabel && !this.ref.titleId()) {
          console.warn(
            'Mimi Dialog: el diálogo no tiene nombre accesible. Marca su título con ' +
              'mimiDialogTitle o pasa ariaLabel.',
          );
        }
      },
    });
  }
}

function setAttribute(element: HTMLElement, name: string, value: string | null): void {
  if (value) element.setAttribute(name, value);
  else element.removeAttribute(name);
}

/**
 * Abre diálogos:
 *
 * ```ts
 * const ref = inject(MimiDialogService).open(EditarUsuario, { data: usuario });
 * ref.afterClosed().subscribe((resultado) => …);
 * ```
 *
 * El contenido es un componente o un `TemplateRef`. Dentro: `inject(MIMI_DIALOG_DATA)` y
 * `inject(MimiDialogRef).close(resultado)`.
 */
@Injectable({ providedIn: 'root' })
export class MimiDialogService {
  private readonly dialog = inject(Dialog);
  private readonly refs = new Set<MimiDialogRef<unknown>>();

  open<R = unknown, D = unknown>(
    content: Type<unknown> | TemplateRef<unknown>,
    config: MimiDialogConfig<D> = {},
  ): MimiDialogRef<R> {
    const ref = new MimiDialogRef<R>();
    const options: MimiDialogShellOptions = { content, config };
    const autoFocus = config.autoFocus ?? 'first';
    const cdkRef = this.dialog.open<R, D>(MimiDialogShell, {
      // Escape y el clic en el fondo los atiende Mimi (abajo), para animar la salida.
      disableClose: true,
      role: config.role ?? 'dialog',
      ariaModal: true,
      ariaLabel: config.ariaLabel ?? null,
      autoFocus: autoFocus === 'first' ? 'first-tabbable' : autoFocus,
      restoreFocus: true,
      injector: config.injector,
      backdropClass: BACKDROP_CLASSES,
      panelClass: PANE_CLASSES,
      providers: [
        { provide: MimiDialogRef, useValue: ref },
        { provide: MIMI_DIALOG_DATA, useValue: config.data },
        { provide: MIMI_DIALOG_SHELL_OPTIONS, useValue: options },
      ],
    });
    ref.connect(cdkRef);

    const closeOnEscape = !config.disableClose && (config.closeOnEscape ?? true);
    const closeOnBackdropClick = !config.disableClose && (config.closeOnBackdropClick ?? true);
    cdkRef.keydownEvents.subscribe((event) => {
      if (event.key !== 'Escape' || event.altKey || event.ctrlKey || event.metaKey) return;
      if (!closeOnEscape) return;
      event.preventDefault();
      ref.close();
    });
    cdkRef.backdropClick.subscribe(() => {
      if (closeOnBackdropClick) ref.close();
    });

    const tracked = ref as MimiDialogRef<unknown>;
    this.refs.add(tracked);
    // También cuando lo cierra el CDK por su cuenta (una navegación, o al destruirse).
    cdkRef.closed.subscribe(() => this.refs.delete(tracked));
    return ref;
  }

  /** Cierra todos los diálogos abiertos. */
  closeAll(): void {
    for (const ref of [...this.refs]) ref.close();
  }
}

/**
 * Diálogo en la plantilla, sobre el mismo servicio:
 *
 * ```html
 * <mimi-dialog [(open)]="abierto">
 *   <button mimiBtn mimiDialogTrigger>Editar usuario</button>
 *   <ng-template mimiDialogContent>…</ng-template>
 * </mimi-dialog>
 * ```
 *
 * No dibuja nada propio (`display: contents`): su `class` va al panel. Las opciones se leen al
 * abrir.
 */
@Component({
  selector: 'mimi-dialog',
  template: '<ng-content />',
  host: {
    style: 'display: contents',
    // El class es del panel; aria-label, del diálogo: fuera del anfitrión.
    '[attr.class]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.data-state]': 'open() ? "open" : "closed"',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiDialog {
  private readonly service = inject(MimiDialogService);
  private readonly injector = inject(Injector);

  /** Abierto o cerrado. Admite `[(open)]`. */
  readonly open = model(false);
  /** Clases del panel, mezcladas con `cn()` (gana la del usuario). */
  readonly userClass = input('', { alias: 'class' });
  /** Ancho del panel (un valor CSS). */
  readonly width = input<string>();
  /** Ancho máximo del panel (un valor CSS). */
  readonly maxWidth = input<string>();
  readonly closeOnEscape = input(true, { transform: booleanAttribute });
  readonly closeOnBackdropClick = input(true, { transform: booleanAttribute });
  /** Atajo: ni Escape ni el clic en el fondo cierran. */
  readonly disableClose = input(false, { transform: booleanAttribute });
  /** Ocúltala solo en confirmaciones con sus propios botones de salida. */
  readonly closeButton = input(true, { transform: booleanAttribute });
  /** Nombre accesible, si no hay un `mimiDialogTitle`. */
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
  /** `'first'` (por defecto), `'dialog'` o un selector CSS. */
  readonly autoFocus = input<'first' | 'dialog' | (string & {})>('first');

  /** Se cerró, con el resultado de `[mimiDialogClose]="…"` si lo hubo. */
  readonly closed = output<unknown>();

  protected readonly content = contentChild(MimiDialogContent);
  private ref: MimiDialogRef | null = null;

  private readonly syncOpen = effect(() => {
    const open = this.open();
    untracked(() => (open ? this.show() : this.ref?.close()));
  });

  constructor() {
    // Si se destruye abierto, se cierra sin animación.
    inject(DestroyRef).onDestroy(() => this.ref?.finish());
  }

  private show(): void {
    const content = this.content();
    if (this.ref || !content) return;
    const ref = this.service.open(content.templateRef, {
      class: this.userClass(),
      width: this.width(),
      maxWidth: this.maxWidth(),
      closeOnEscape: this.closeOnEscape(),
      closeOnBackdropClick: this.closeOnBackdropClick(),
      disableClose: this.disableClose(),
      closeButton: this.closeButton(),
      ariaLabel: this.ariaLabel(),
      autoFocus: this.autoFocus(),
      injector: this.injector,
    });
    this.ref = ref;
    ref.afterClosed().subscribe((result) => {
      this.ref = null;
      this.open.set(false);
      this.closed.emit(result);
    });
  }
}

/** Botón que abre el diálogo: `<button mimiBtn mimiDialogTrigger>`. */
@Directive({
  selector: '[mimiDialogTrigger]',
  host: {
    'aria-haspopup': 'dialog',
    '[attr.data-state]': 'dialog.open() ? "open" : "closed"',
    '(click)': 'dialog.open.set(true)',
  },
})
export class MimiDialogTrigger {
  protected readonly dialog = inject(MimiDialog);
}

/** Contenido del diálogo: `<ng-template mimiDialogContent>`. Se crea al abrir. */
@Directive({ selector: 'ng-template[mimiDialogContent]' })
export class MimiDialogContent {
  readonly templateRef = inject(TemplateRef);
}

/** Encabezado: el título y la descripción, con sitio para la X a la derecha. */
@Component({
  selector: 'mimi-dialog-header',
  template: '<ng-content />',
  host: { '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiDialogHeader {
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn(
      'flex shrink-0 flex-col gap-1 px-[var(--mimi-dialog-padding,24px)] pt-[var(--mimi-dialog-padding,24px)] pb-1',
      'group-data-[close-button]/dialog:pr-[calc(var(--mimi-dialog-padding,24px)_+_var(--mimi-dialog-close-size,32px))]',
      this.userClass(),
    ),
  );
}

/** Título: le da al diálogo su nombre accesible (aria-labelledby). Úsalo en un `<h2>`. */
@Directive({
  selector: '[mimiDialogTitle]',
  host: { '[id]': 'id', '[class]': 'classes()' },
})
export class MimiDialogTitle {
  private readonly ref = inject<MimiDialogRef>(MimiDialogRef);
  readonly id = `mimi-dialog-title-${nextId++}`;
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn('text-[18px] leading-tight font-bold tracking-[-0.01em]', this.userClass()),
  );

  constructor() {
    this.ref.titleId.set(this.id);
    inject(DestroyRef).onDestroy(() => {
      if (this.ref.titleId() === this.id) this.ref.titleId.set(null);
    });
  }
}

/** Descripción del diálogo (aria-describedby). */
@Directive({
  selector: '[mimiDialogDescription]',
  host: { '[id]': 'id', '[class]': 'classes()' },
})
export class MimiDialogDescription {
  private readonly ref = inject<MimiDialogRef>(MimiDialogRef);
  readonly id = `mimi-dialog-description-${nextId++}`;
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn('text-sm text-muted-foreground', this.userClass()),
  );

  constructor() {
    this.ref.descriptionId.set(this.id);
    inject(DestroyRef).onDestroy(() => {
      if (this.ref.descriptionId() === this.id) this.ref.descriptionId.set(null);
    });
  }
}

/** Cuerpo: si el contenido no cabe, el scroll queda aquí y el encabezado y el pie no se mueven. */
@Component({
  selector: 'mimi-dialog-body',
  template: '<ng-content />',
  host: { '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiDialogBody {
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn(
      'flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-[var(--mimi-dialog-padding,24px)] py-4',
      this.userClass(),
    ),
  );
}

/** Pie: las acciones, a la derecha. */
@Component({
  selector: 'mimi-dialog-footer',
  template: '<ng-content />',
  host: { '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiDialogFooter {
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn(
      'flex shrink-0 justify-end gap-2 px-[var(--mimi-dialog-padding,24px)] pt-2 pb-[var(--mimi-dialog-padding,24px)]',
      this.userClass(),
    ),
  );
}

/**
 * Cierra el diálogo al hacer clic: `<button mimiBtn mimiDialogClose>Cancelar</button>`. Con un
 * valor (`[mimiDialogClose]="true"`), ese es el resultado de `afterClosed()` y de `(closed)`.
 */
@Directive({
  selector: '[mimiDialogClose]',
  host: { '(click)': 'close()' },
})
export class MimiDialogClose {
  private readonly ref = inject<MimiDialogRef>(MimiDialogRef);
  /** Resultado con el que se cierra. */
  readonly result = input<unknown>(undefined, { alias: 'mimiDialogClose' });

  protected close(): void {
    const result = this.result();
    // `mimiDialogClose` sin valor llega como cadena vacía: se cierra sin resultado.
    this.ref.close(result === '' ? undefined : result);
  }
}

/** Todas las piezas de Dialog, para importarlas juntas. */
export const MimiDialogImports = [
  MimiDialog,
  MimiDialogTrigger,
  MimiDialogContent,
  MimiDialogHeader,
  MimiDialogTitle,
  MimiDialogDescription,
  MimiDialogBody,
  MimiDialogFooter,
  MimiDialogClose,
] as const;
