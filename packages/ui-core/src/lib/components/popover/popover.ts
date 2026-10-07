import { CdkConnectedOverlay, type ConnectedOverlayPositionChange } from '@angular/cdk/overlay';
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
 * Popover (docs/design/Mimi F2 Overlays.dc.html, «3 · Popover»): panel de 300px, padding 16px,
 * gap 12px, a 12px del trigger, con flecha de 10px. Tokens de la spec 13 (MimiPopoverTokens), con
 * la cascada de la 6.2: --mimi-popover-* → token global → valor del diseño.
 *
 * Por dentro usa @angular/cdk/overlay (decisión 4.3): CdkConnectedOverlay posiciona el panel como
 * popover nativo (top layer) insertado junto al trigger ('inline'), con flip si no cabe. Nada del
 * CDK sale en la API pública. Los estilos del overlay vienen de @angular/cdk/overlay-prebuilt.css,
 * que la CLI agrega al CSS global (spec 4.3). Posición, flecha y animación: utils/overlay.ts.
 */

export type MimiPopoverSide = MimiOverlaySide;
export type MimiPopoverAlign = MimiOverlayAlign;

/** Distancia entre el trigger y el panel (diseño: margin-top 12px). */
const OFFSET = 12;

let nextId = 0;

/**
 * Uso interno de mimi-popover (no está en MimiPopoverImports; se exporta porque el compilador de
 * Angular lo exige): pinta el contenido del usuario dentro del panel. Hace lo mismo que
 * NgTemplateOutlet, pero sin importar @angular/common: esbuild pondría ese módulo en el chunk
 * inicial del proyecto, aunque Popover sea lazy (spec 10).
 */
@Directive({ selector: '[mimiPopoverOutlet]' })
export class MimiPopoverOutlet {
  readonly template = input.required<TemplateRef<unknown>>({ alias: 'mimiPopoverOutlet' });
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly render = effect(() => {
    const template = this.template();
    untracked(() => {
      this.viewContainer.clear();
      this.viewContainer.createEmbeddedView(template);
    });
  });
}

/**
 * Contenedor del popover: un trigger (`[mimiPopoverTrigger]`) y el contenido en un
 * `<ng-template mimiPopoverContent>`. No dibuja nada propio (`display: contents`): su `class` y
 * su `label` van al panel.
 */
@Component({
  selector: 'mimi-popover',
  imports: [CdkConnectedOverlay, MimiPopoverOutlet],
  template: `
    <ng-content />
    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="originElement()!"
      [cdkConnectedOverlayOpen]="rendered()"
      [cdkConnectedOverlayPositions]="positions()"
      [cdkConnectedOverlayViewportMargin]="viewportMargin"
      [cdkConnectedOverlayDisableClose]="true"
      cdkConnectedOverlayUsePopover="inline"
      cdkConnectedOverlayTransformOriginOn="[data-mimi-overlay-panel]"
      (attach)="onAttach()"
      (detach)="onDetach()"
      (overlayKeydown)="onKeydown($event)"
      (overlayOutsideClick)="close()"
      (positionChange)="onPositionChange($event)"
    >
      <div
        #panel
        data-mimi-overlay-panel
        role="dialog"
        tabindex="-1"
        [id]="panelId"
        [class]="panelClasses()"
        [attr.aria-label]="label() || null"
        [attr.aria-labelledby]="label() ? null : titleId()"
        [attr.aria-describedby]="descriptionId()"
        [attr.data-state]="state()"
        [attr.data-side]="placedSide()"
        [attr.data-align]="align()"
        [attr.inert]="state() === 'closed' ? '' : null"
        [style.--mimi-popover-arrow-offset]="arrowOffset()"
      >
        @if (arrow()) {
          <span aria-hidden="true" [attr.data-side]="placedSide()" [class]="arrowClasses"></span>
        }
        @if (content(); as content) {
          <ng-container [mimiPopoverOutlet]="content.templateRef" />
        }
      </div>
    </ng-template>
  `,
  styles: MIMI_OVERLAY_ANIMATION,
  host: {
    style: 'display: contents',
    // El class es del panel: en el host no tendría efecto o se heredaría al trigger.
    '[attr.class]': 'null',
    '[attr.data-state]': 'open() ? "open" : "closed"',
    '[attr.data-side]': 'side()',
    '[attr.data-align]': 'align()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiPopover {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly checker = inject(InteractivityChecker);

  /** Abierto o cerrado. Admite `[(open)]`. */
  readonly open = model(false);
  /** Lado preferido. Si no cabe, pasa al lado opuesto. */
  readonly side = input<MimiPopoverSide>('bottom');
  /** Alineación con el trigger. */
  readonly align = input<MimiPopoverAlign>('center');
  /** Flecha hacia el trigger (decorativa). */
  readonly arrow = input(true, { transform: booleanAttribute });
  /** Nombre accesible del panel (aria-label). Si hay `mimiPopoverTitle`, no hace falta. */
  readonly label = input('');
  /** Clases del panel, mezcladas con `cn()` (gana la del usuario). */
  readonly userClass = input('', { alias: 'class' });

  protected readonly trigger = contentChild(MimiPopoverTrigger);
  protected readonly content = contentChild(MimiPopoverContent);
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  /** id del panel (aria-controls del trigger). */
  readonly panelId = `mimi-popover-${nextId++}`;
  /** Registrados por `mimiPopoverTitle` y `mimiPopoverDescription`. */
  readonly titleId = signal<string | null>(null);
  readonly descriptionId = signal<string | null>(null);

  /** El panel está en el DOM (también mientras dura la animación de salida). */
  protected readonly rendered = signal(false);
  protected readonly state = signal<'open' | 'closed'>('closed');
  protected readonly placedSide = signal<MimiPopoverSide>('bottom');
  protected readonly arrowOffset = signal<string | null>(null);
  protected readonly viewportMargin = MIMI_VIEWPORT_MARGIN;

  protected readonly originElement = computed(() => this.trigger()?.element ?? null);

  /** Lado y alineación pedidos, el lado opuesto y, por último, los otros dos lados. */
  protected readonly positions = computed(() =>
    mimiConnectedPositions(this.side(), this.align(), OFFSET),
  );

  protected readonly panelClasses = computed(() =>
    cn(
      'relative flex w-[300px] max-w-[calc(100vw_-_16px)] flex-col gap-3 outline-none',
      'rounded-[var(--mimi-popover-radius,var(--mimi-radius))] border border-[color:var(--mimi-popover-border,var(--mimi-border))]',
      'bg-[color:var(--mimi-popover-bg,var(--mimi-popover))] text-popover-foreground',
      'p-[var(--mimi-popover-padding,16px)] shadow-[shadow:var(--mimi-popover-shadow,var(--mimi-shadow-popover))]',
      this.userClass(),
    ),
  );

  protected readonly arrowClasses = cn(
    'pointer-events-none absolute size-[var(--mimi-popover-arrow,10px)] rounded-tl-[2px] border-t border-l',
    'border-[color:var(--mimi-popover-border,var(--mimi-border))] bg-[color:var(--mimi-popover-bg,var(--mimi-popover))]',
    'data-[side=bottom]:top-[calc(var(--mimi-popover-arrow,10px)/-2_-_1px)] data-[side=bottom]:left-[var(--mimi-popover-arrow-offset,50%)] data-[side=bottom]:-translate-x-1/2 data-[side=bottom]:rotate-45',
    'data-[side=top]:bottom-[calc(var(--mimi-popover-arrow,10px)/-2_-_1px)] data-[side=top]:left-[var(--mimi-popover-arrow-offset,50%)] data-[side=top]:-translate-x-1/2 data-[side=top]:rotate-[225deg]',
    'data-[side=right]:left-[calc(var(--mimi-popover-arrow,10px)/-2_-_1px)] data-[side=right]:top-[var(--mimi-popover-arrow-offset,50%)] data-[side=right]:-translate-y-1/2 data-[side=right]:-rotate-45',
    'data-[side=left]:right-[calc(var(--mimi-popover-arrow,10px)/-2_-_1px)] data-[side=left]:top-[var(--mimi-popover-arrow-offset,50%)] data-[side=left]:-translate-y-1/2 data-[side=left]:rotate-[135deg]',
  );

  /** Cuenta los cierres: si se vuelve a abrir durante la animación de salida, no se desmonta. */
  private closing = 0;
  private warnedLabel = false;

  private readonly syncOpen = effect(() => {
    const open = this.open();
    untracked(() => (open ? this.show() : this.hide()));
  });

  /** Abre o cierra (lo usa el trigger). */
  toggle(): void {
    this.open.update((open) => !open);
  }

  /** Cierra. El foco vuelve al trigger si estaba dentro del panel o en ningún lado. */
  close(): void {
    this.open.set(false);
  }

  private show(): void {
    this.closing++;
    this.placedSide.set(this.side());
    this.state.set('open');
    if (this.rendered()) {
      // Se reabrió durante la salida: el panel sigue montado, así que no habrá (attach).
      this.focusPanel();
    } else {
      this.rendered.set(true);
    }
  }

  private hide(): void {
    if (!this.rendered()) return;
    this.state.set('closed');
    const panel = this.panel()?.nativeElement;
    const active = this.document.activeElement;
    if (!active || active === this.document.body || panel?.contains(active)) {
      this.trigger()?.element.focus();
    }
    const closing = ++this.closing;
    afterNextRender(
      {
        read: () => {
          // Espera la animación de salida (sin animación, como con movimiento reducido, no hay).
          void mimiWaitForExit(panel).then(() => {
            if (closing === this.closing) this.rendered.set(false);
          });
        },
      },
      { injector: this.injector },
    );
  }

  protected onAttach(): void {
    this.focusPanel();
  }

  protected onDetach(): void {
    // El CDK lo desmontó por su cuenta (p. ej. al destruirse): se sincroniza el estado.
    this.rendered.set(false);
    if (this.open()) this.open.set(false);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && !event.altKey && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      this.close();
    }
  }

  protected onPositionChange({ connectionPair }: ConnectedOverlayPositionChange): void {
    const side = mimiPlacedSide(connectionPair);
    this.placedSide.set(side);
    // La flecha apunta al centro del trigger.
    const trigger = this.trigger()?.element.getBoundingClientRect();
    const panel = this.panel()?.nativeElement.getBoundingClientRect();
    this.arrowOffset.set(trigger && panel ? mimiArrowOffset(trigger, panel, side) : null);
  }

  /** Al abrir, el foco va al primer elemento enfocable del panel o, si no hay, al panel. */
  private focusPanel(): void {
    afterNextRender(
      {
        write: () => {
          const panel = this.panel()?.nativeElement;
          if (!panel || this.state() !== 'open') return;
          this.warnMissingLabel();
          const first = Array.from(panel.querySelectorAll<HTMLElement>('*')).find(
            (element) => this.checker.isFocusable(element) && this.checker.isTabbable(element),
          );
          (first ?? panel).focus();
        },
      },
      { injector: this.injector },
    );
  }

  private warnMissingLabel(): void {
    if (!isDevMode() || this.warnedLabel) return;
    if (this.label() || this.titleId()) return;
    this.warnedLabel = true;
    console.warn(
      'mimi-popover: el panel no tiene nombre accesible. Agrega label="…" al ' +
        '<mimi-popover> o marca su título con mimiPopoverTitle.',
    );
  }
}

/**
 * Botón que abre y cierra el popover: `<button mimiBtn mimiPopoverTrigger>`. Lleva
 * `aria-haspopup="dialog"`, `aria-expanded` y, abierto, `aria-controls`.
 */
@Directive({
  selector: '[mimiPopoverTrigger]',
  host: {
    'aria-haspopup': 'dialog',
    '[attr.aria-expanded]': 'popover.open()',
    '[attr.aria-controls]': 'popover.open() ? popover.panelId : null',
    '[attr.data-state]': 'popover.open() ? "open" : "closed"',
    '(click)': 'popover.toggle()',
  },
})
export class MimiPopoverTrigger {
  protected readonly popover = inject(MimiPopover);
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
}

/**
 * Contenido del popover: `<ng-template mimiPopoverContent>`. Se crea al abrir y se destruye al
 * cerrar. El `class` y el `label` del panel van en `<mimi-popover>`: Angular no pasa un `class`
 * estático de un ng-template a la directiva.
 */
@Directive({ selector: 'ng-template[mimiPopoverContent]' })
export class MimiPopoverContent {
  readonly templateRef = inject(TemplateRef);
}

/** Título del panel: le da su nombre accesible (aria-labelledby). */
@Directive({
  selector: '[mimiPopoverTitle]',
  host: { '[id]': 'id', '[class]': 'classes()' },
})
export class MimiPopoverTitle {
  private readonly popover = inject(MimiPopover);
  private readonly destroyRef = inject(DestroyRef);
  readonly id = `mimi-popover-title-${nextId++}`;
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn('text-[15px] leading-tight font-bold', this.userClass()),
  );

  constructor() {
    this.popover.titleId.set(this.id);
    this.destroyRef.onDestroy(() => {
      if (this.popover.titleId() === this.id) this.popover.titleId.set(null);
    });
  }
}

/** Descripción del panel (aria-describedby). */
@Directive({
  selector: '[mimiPopoverDescription]',
  host: { '[id]': 'id', '[class]': 'classes()' },
})
export class MimiPopoverDescription {
  private readonly popover = inject(MimiPopover);
  private readonly destroyRef = inject(DestroyRef);
  readonly id = `mimi-popover-description-${nextId++}`;
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn('text-[13px] text-muted-foreground', this.userClass()),
  );

  constructor() {
    this.popover.descriptionId.set(this.id);
    this.destroyRef.onDestroy(() => {
      if (this.popover.descriptionId() === this.id) this.popover.descriptionId.set(null);
    });
  }
}

/** Cierra el popover al hacer clic (p. ej. «Cancelar» o «Enviar»). El foco vuelve al trigger. */
@Directive({
  selector: '[mimiPopoverClose]',
  host: { '(click)': 'popover.close()' },
})
export class MimiPopoverClose {
  protected readonly popover = inject(MimiPopover);
}

export const MimiPopoverImports = [
  MimiPopover,
  MimiPopoverTrigger,
  MimiPopoverContent,
  MimiPopoverTitle,
  MimiPopoverDescription,
  MimiPopoverClose,
] as const;
