import { Menu } from '@angular/aria/menu';
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
import { cn } from '@/components/ui/utils/cn';
import {
  MIMI_OVERLAY_ANIMATION,
  MIMI_VIEWPORT_MARGIN,
  type MimiOverlayAlign,
  type MimiOverlaySide,
  mimiConnectedPositions,
  mimiPlacedSide,
  mimiWaitForExit,
} from '@/components/ui/utils/overlay';
import {
  MIMI_MENU_HOST,
  MIMI_MENU_PANEL_CLASSES,
  type MimiMenuHost,
  MimiMenuCheckboxItem,
  MimiMenuItem,
  MimiMenuLabel,
  MimiMenuOutlet,
  MimiMenuRadioGroup,
  MimiMenuRadioItem,
  MimiMenuSeparator,
  MimiMenuSub,
  MimiMenuSubContent,
  MimiMenuSubTrigger,
} from './menu-item';

/*
 * Dropdown Menu (docs/design/Mimi F2 Overlays.dc.html, «5 · Dropdown Menu»): panel con padding de
 * 4px a 8px del trigger. Tokens de la spec 13 (MimiMenuTokens, prefijo `menu`).
 *
 * Por dentro: @angular/cdk/overlay posiciona el panel (popover nativo 'inline', como Popover) y
 * @angular/aria/menu da el teclado del patrón de menú (flechas, Home/End, typeahead, Enter y
 * Espacio, submenús). El trigger y el cierre son de Mimi: ngMenuTrigger necesita una referencia
 * al menú en el botón del usuario, que no se puede dar sin exponer aria (decisión 4.3). Nada de
 * aria ni del CDK sale en la API pública.
 */

export type MimiDropdownMenuSide = MimiOverlaySide;
export type MimiDropdownMenuAlign = MimiOverlayAlign;

/** Distancia entre el trigger y el panel (diseño: 8px). */
const OFFSET = 8;

let nextId = 0;

/**
 * Menú desplegable: un trigger (`[mimiDropdownMenuTrigger]`) y el contenido en un
 * `<ng-template mimiDropdownMenuContent>`. No dibuja nada propio (`display: contents`): su
 * `class` y su `label` van al panel.
 */
@Component({
  selector: 'mimi-dropdown-menu',
  imports: [CdkConnectedOverlay, Menu, MimiMenuOutlet],
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
      (attach)="focusItem()"
      (detach)="onDetach()"
      (overlayOutsideClick)="close(false)"
      (positionChange)="onPositionChange($event)"
    >
      <div
        ngMenu
        #panel
        data-mimi-overlay-panel
        [id]="menuId"
        [class]="panelClasses()"
        [attr.aria-label]="label() || null"
        [attr.aria-labelledby]="label() ? null : trigger()?.id"
        [attr.data-state]="state()"
        [attr.data-side]="placedSide()"
        [attr.data-align]="align()"
        [attr.inert]="state() === 'closed' ? '' : null"
        (itemSelected)="onItemSelected($event)"
        (keydown)="onKeydown($event)"
        (focusout)="onFocusOut($event)"
      >
        @if (content(); as content) {
          <ng-container [mimiMenuOutlet]="content.templateRef" />
        }
      </div>
    </ng-template>
  `,
  styles: MIMI_OVERLAY_ANIMATION,
  providers: [{ provide: MIMI_MENU_HOST, useExisting: MimiDropdownMenu }],
  host: {
    style: 'display: contents',
    // El class es del panel: en el host no tendría efecto o se heredaría al trigger.
    '[attr.class]': 'null',
    '[attr.data-state]': 'open() ? "open" : "closed"',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiDropdownMenu implements MimiMenuHost {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);

  /** Abierto o cerrado. Admite `[(open)]`. */
  readonly open = model(false);
  /** Lado preferido. Si no cabe, pasa al lado opuesto. */
  readonly side = input<MimiDropdownMenuSide>('bottom');
  /** Alineación con el trigger. */
  readonly align = input<MimiDropdownMenuAlign>('start');
  /** Nombre accesible del menú (aria-label). Sin él, lo nombra el texto del trigger. */
  readonly label = input('');
  /** Clases del panel, mezcladas con `cn()` (gana la del usuario). */
  readonly userClass = input('', { alias: 'class' });

  protected readonly trigger = contentChild(MimiDropdownMenuTrigger);
  protected readonly content = contentChild(MimiDropdownMenuContent);
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

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
  protected readonly panelClasses = computed(() =>
    cn(
      MIMI_MENU_PANEL_CLASSES,
      'w-[var(--mimi-menu-width,240px)] max-w-[calc(100vw_-_16px)]',
      this.userClass(),
    ),
  );

  /** A qué ítem va el foco al abrir: el primero, o el último si se abrió con ↑. */
  private focusTarget: 'first' | 'last' = 'first';
  /** Cuenta los cierres: si se vuelve a abrir durante la animación de salida, no se desmonta. */
  private closing = 0;
  /** Si el próximo cierre devuelve el foco al trigger. */
  private refocus = true;
  private readonly items = new Map<string, () => void>();

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
    if (this.open()) this.focusItem();
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

  register(id: string, select: () => void): void {
    this.items.set(id, select);
  }

  unregister(id: string): void {
    this.items.delete(id);
  }

  private show(): void {
    this.closing++;
    this.placedSide.set(this.side());
    this.state.set('open');
    if (this.rendered()) this.focusItem();
    else this.rendered.set(true);
  }

  private hide(): void {
    if (!this.rendered()) return;
    this.state.set('closed');
    const panel = this.panel()?.nativeElement;
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

  /**
   * Al abrir, el foco va al primer ítem (o al último). aria no tiene un método público para eso:
   * se le envía Home o End, las teclas del patrón (la prueba «foco al abrir» avisa si cambia).
   */
  protected focusItem(): void {
    const key = this.focusTarget === 'last' ? 'End' : 'Home';
    afterNextRender(
      {
        write: () => {
          const panel = this.panel()?.nativeElement;
          if (!panel || this.state() !== 'open') return;
          panel.dispatchEvent(
            new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
          );
        },
      },
      { injector: this.injector },
    );
  }

  protected onDetach(): void {
    this.rendered.set(false);
    if (this.open()) this.open.set(false);
  }

  protected onItemSelected(value: unknown): void {
    this.items.get(value as string)?.();
    this.close();
  }

  /** Escape en el menú (aria detiene su propagación: el CDK no lo vería). En un submenú, aria lo cierra. */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && !event.altKey && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      this.close();
    }
  }

  /** Tab (o el foco que sale del menú por otro camino) cierra sin mover el foco. */
  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (!next || this.panel()?.nativeElement.contains(next)) return;
    if (next === this.trigger()?.element) return;
    this.close(false);
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
  MimiMenuItem,
  MimiMenuCheckboxItem,
  MimiMenuRadioGroup,
  MimiMenuRadioItem,
  MimiMenuLabel,
  MimiMenuSeparator,
  MimiMenuSub,
  MimiMenuSubTrigger,
  MimiMenuSubContent,
] as const;
