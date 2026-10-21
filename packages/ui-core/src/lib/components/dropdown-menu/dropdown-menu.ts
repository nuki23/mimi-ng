import { CdkConnectedOverlay, type ConnectedOverlayPositionChange } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  Directive,
  ElementRef,
  HostAttributeToken,
  Injector,
  TemplateRef,
  afterNextRender,
  computed,
  contentChild,
  effect,
  inject,
  input,
  model,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { MimiMenuItemsImports } from '@/components/ui/menu';
import { MimiMenuPanel } from '@/components/ui/menu/menu';
import {
  MIMI_VIEWPORT_MARGIN,
  type MimiOverlayAlign,
  type MimiOverlaySide,
  mimiConnectedPositions,
  mimiPlacedSide,
  mimiWaitForExit,
} from '@/components/ui/utils/overlay';

/*
 * Dropdown Menu (docs/design/Mimi F2 Overlays.dc.html, «5 · Dropdown Menu»): panel a 8px del
 * trigger. Ítems, panel y tokens (`menu`, spec 13) en `@/components/ui/menu`.
 *
 * Por dentro: @angular/cdk/overlay posiciona el panel (popover nativo 'inline', como Popover) y
 * @angular/aria/menu da el teclado del patrón de menú (en MimiMenuPanel). El trigger es de Mimi:
 * ngMenuTrigger necesita una referencia al menú en el botón del usuario, que no se puede dar sin
 * exponer aria (decisión 4.3). Nada de aria ni del CDK sale en la API pública.
 */

export type MimiDropdownMenuSide = MimiOverlaySide;
export type MimiDropdownMenuAlign = MimiOverlayAlign;

/** Distancia entre el trigger y el panel (diseño: 8px). */
const OFFSET = 8;

let nextId = 0;

/**
 * Menú desplegable: un trigger (`[mimiDropdownMenuTrigger]`) y el contenido en un
 * `<ng-template mimiDropdownMenuContent>`. No dibuja nada propio (`display: contents`): su
 * `class` y su `aria-label` van al panel.
 */
@Component({
  selector: 'mimi-dropdown-menu',
  imports: [CdkConnectedOverlay, MimiMenuPanel],
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
      (detach)="onDetach()"
      (overlayOutsideClick)="close(false)"
      (positionChange)="onPositionChange($event)"
    >
      @if (content(); as content) {
        <mimi-menu-panel
          [template]="content.templateRef"
          [menuId]="menuId"
          [label]="ariaLabel() ?? ''"
          [labelledBy]="trigger()?.id"
          [state]="state()"
          [side]="placedSide()"
          [align]="align()"
          [initialFocus]="focusTarget"
          [focusExempt]="trigger()?.element"
          [class]="userClass()"
          (closeRequest)="close($event)"
        />
      }
    </ng-template>
  `,
  host: {
    style: 'display: contents',
    // El class y el aria-label son del panel: en el host no tendrían efecto o se heredarían.
    '[attr.class]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.data-state]': 'open() ? "open" : "closed"',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiDropdownMenu {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);

  /** Abierto o cerrado. Admite `[(open)]`. */
  readonly open = model(false);
  /** Lado preferido. Si no cabe, pasa al lado opuesto. */
  readonly side = input<MimiDropdownMenuSide>('bottom');
  /** Alineación con el trigger. */
  readonly align = input<MimiDropdownMenuAlign>('start');
  /** Nombre accesible del menú (`aria-label`). Sin él, lo nombra el texto del trigger. */
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
  /** Clases del panel, mezcladas con `cn()` (gana la del usuario). */
  readonly userClass = input('', { alias: 'class' });

  protected readonly trigger = contentChild(MimiDropdownMenuTrigger);
  protected readonly content = contentChild(MimiDropdownMenuContent);
  private readonly panel = viewChild(MimiMenuPanel);

  /** id del menú (aria-controls del trigger). */
  readonly menuId = `mimi-dropdown-menu-${nextId++}`;

  /** El panel está en el DOM (también mientras dura la animación de salida). */
  protected readonly rendered = signal(false);
  protected readonly state = signal<'open' | 'closed'>('closed');
  protected readonly placedSide = signal<MimiDropdownMenuSide>('bottom');
  protected readonly viewportMargin = MIMI_VIEWPORT_MARGIN;

  protected readonly originElement = computed(() => this.trigger()?.element ?? null);
  protected readonly positions = computed(() =>
    mimiConnectedPositions(this.side(), this.align(), OFFSET),
  );

  /** A qué ítem va el foco al abrir: el primero, o el último si se abrió con ↑. */
  protected focusTarget: 'first' | 'last' = 'first';
  /** Cuenta los cierres: si se vuelve a abrir durante la animación de salida, no se desmonta. */
  private closing = 0;
  /** Si el próximo cierre devuelve el foco al trigger. */
  private refocus = true;

  private readonly syncOpen = effect(() => {
    const open = this.open();
    untracked(() => (open ? this.show() : this.hide()));
  });

  /** Abre o cierra (lo usa el trigger). */
  toggle(): void {
    this.focusTarget = 'first';
    this.open.update((open) => !open);
  }

  /** Abre con el foco en el primer o el último ítem (lo usa el trigger con las flechas). */
  openAt(target: 'first' | 'last'): void {
    this.focusTarget = target;
    if (this.open()) this.panel()?.focusItem(target);
    else this.open.set(true);
  }

  /**
   * Cierra. Con `refocus` (al elegir un ítem o con Escape), el foco vuelve al trigger; sin él
   * (clic fuera, Tab), queda donde el usuario lo puso.
   */
  close(refocus = true): void {
    this.refocus = refocus;
    this.open.set(false);
  }

  private show(): void {
    this.closing++;
    this.placedSide.set(this.side());
    this.state.set('open');
    // Reabierto durante la animación de salida: el panel sigue montado.
    if (this.rendered()) this.panel()?.focusItem(this.focusTarget);
    else this.rendered.set(true);
  }

  private hide(): void {
    if (!this.rendered()) return;
    this.state.set('closed');
    const panel = this.panel()?.element;
    const active = this.document.activeElement;
    const focusInside = !active || active === this.document.body || panel?.contains(active);
    if (this.refocus && focusInside) this.trigger()?.element.focus();
    this.refocus = true;
    const closing = ++this.closing;
    afterNextRender(
      {
        read: () => {
          void mimiWaitForExit(panel).then(() => {
            if (closing === this.closing) this.rendered.set(false);
          });
        },
      },
      { injector: this.injector },
    );
  }

  protected onDetach(): void {
    this.rendered.set(false);
    if (this.open()) this.open.set(false);
  }

  protected onPositionChange({ connectionPair }: ConnectedOverlayPositionChange): void {
    this.placedSide.set(mimiPlacedSide(connectionPair));
  }
}

/**
 * Botón que abre y cierra el menú: `<button mimiBtn mimiDropdownMenuTrigger>`. Clic, Enter o
 * Espacio abren en el primer ítem; ↓ también, y ↑ en el último.
 */
@Directive({
  selector: '[mimiDropdownMenuTrigger]',
  host: {
    'aria-haspopup': 'menu',
    '[id]': 'id',
    '[attr.aria-expanded]': 'menu.open()',
    '[attr.aria-controls]': 'menu.open() ? menu.menuId : null',
    '[attr.data-state]': 'menu.open() ? "open" : "closed"',
    '(click)': 'menu.toggle()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class MimiDropdownMenuTrigger {
  protected readonly menu = inject(MimiDropdownMenu);
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  /** El del usuario, o uno generado (el menú se nombra con él). */
  readonly id =
    inject(new HostAttributeToken('id'), { optional: true }) ?? `${this.menu.menuId}-trigger`;

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.menu.openAt(event.key === 'ArrowDown' ? 'first' : 'last');
    }
  }
}

/**
 * Contenido del menú: `<ng-template mimiDropdownMenuContent>`. Se crea al abrir y se destruye al
 * cerrar. El `class` y el `label` del panel van en `<mimi-dropdown-menu>`.
 */
@Directive({ selector: 'ng-template[mimiDropdownMenuContent]' })
export class MimiDropdownMenuContent {
  readonly templateRef = inject(TemplateRef);
}

export const MimiDropdownMenuImports = [
  MimiDropdownMenu,
  MimiDropdownMenuTrigger,
  MimiDropdownMenuContent,
  ...MimiMenuItemsImports,
] as const;
