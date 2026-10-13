import { Menu, MenuItem } from '@angular/aria/menu';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  InjectionToken,
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
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { cva } from 'class-variance-authority';
import { cn } from '@/components/ui/utils/cn';
import { MIMI_OVERLAY_ANIMATION, MIMI_VIEWPORT_MARGIN } from '@/components/ui/utils/overlay';

/*
 * Ítems de menú (docs/design/Mimi F2 Overlays.dc.html, «5 · Dropdown Menu»). Los comparten Dropdown
 * Menu y Context Menu (prefijo de tokens `menu`, spec 13). Ítem de 32px, padding 0 8px, gap 8px,
 * columna de ícono de 16px, atajo en monoespaciada; etiqueta de grupo y separador.
 *
 * Teclado, foco, typeahead y submenús: @angular/aria/menu (decisión 4.3), solo por dentro. Cada
 * ítem pinta su `div ngMenuItem` con un `value` interno único; el menú raíz traduce el
 * `itemSelected` de aria al ítem con MIMI_MENU_HOST. Nada de aria sale en la API pública.
 */

let nextId = 0;

/** Uso interno: el menú raíz (Dropdown o Context Menu) avisa al ítem elegido y se cierra. */
export interface MimiMenuHost {
  register(id: string, select: () => void): void;
  unregister(id: string): void;
}

export const MIMI_MENU_HOST = new InjectionToken<MimiMenuHost>('MimiMenuHost');

/**
 * Uso interno (no está en los Imports; se exporta porque el compilador lo exige): pinta el
 * contenido del usuario con el injector de este punto, dentro del `ngMenu`, para que los ítems
 * encuentren su menú. Hace lo mismo que NgTemplateOutlet con `injector`, sin @angular/common.
 */
@Directive({ selector: '[mimiMenuOutlet]' })
export class MimiMenuOutlet {
  readonly template = input.required<TemplateRef<unknown>>({ alias: 'mimiMenuOutlet' });
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly render = effect(() => {
    const template = this.template();
    untracked(() => {
      this.viewContainer.clear();
      this.viewContainer.createEmbeddedView(template, undefined, { injector: this.injector });
    });
  });
}

/** Panel del menú y del submenú: fondo, borde, radio y sombra de la spec 13. */
export const MIMI_MENU_PANEL_CLASSES =
  'flex flex-col p-1 outline-none rounded-[var(--mimi-menu-radius,var(--mimi-radius))] border border-[color:var(--mimi-menu-border,var(--mimi-border))] bg-[color:var(--mimi-menu-bg,var(--mimi-popover))] text-popover-foreground shadow-[shadow:var(--mimi-menu-shadow,var(--mimi-shadow-popover))]';

export type MimiMenuItemTone = 'default' | 'danger';

export const menuItemVariants = cva(
  [
    'relative flex h-[var(--mimi-menu-item-height,32px)] cursor-pointer items-center gap-2 px-2 text-sm outline-none select-none',
    'rounded-[var(--mimi-menu-item-radius,var(--mimi-radius-sm))]',
    'transition-[background-color] duration-120 ease-[ease] active:scale-[0.985]',
    'aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:active:scale-100',
  ],
  {
    variants: {
      tone: {
        // Activo (puntero o teclado) con fondo; deshabilitado, solo con el foco de teclado.
        default: [
          'text-popover-foreground',
          'not-aria-disabled:data-[active=true]:bg-[color:var(--mimi-menu-item-hover,var(--mimi-accent))]',
          'aria-disabled:focus-visible:bg-[color:var(--mimi-menu-item-hover,var(--mimi-accent))]',
          'aria-expanded:bg-[color:var(--mimi-menu-item-hover,var(--mimi-accent))]',
        ],
        danger: [
          'text-[color:var(--mimi-menu-danger,var(--mimi-destructive-soft-foreground))]',
          'not-aria-disabled:data-[active=true]:bg-[color:var(--mimi-menu-danger-hover,var(--mimi-destructive-soft-bg))]',
          'aria-disabled:focus-visible:bg-[color:var(--mimi-menu-danger-hover,var(--mimi-destructive-soft-bg))]',
        ],
      },
    },
    defaultVariants: { tone: 'default' },
  },
);

/** Columna de ícono de 16px. El check del checkbox va en `foreground`; los íconos, en muted. */
const ICON_COLUMN = 'inline-flex w-4 shrink-0 justify-center [&_svg]:size-4 [&_svg]:shrink-0';
const ICON_TONE: Record<MimiMenuItemTone | 'checked', string> = {
  default: 'text-muted-foreground',
  checked: 'text-foreground',
  danger: 'text-[color:var(--mimi-menu-danger,var(--mimi-destructive-soft-foreground))]',
};
const LABEL = 'min-w-0 flex-1 truncate';
const SHORTCUT =
  'font-mono text-[11.5px] tracking-[.06em] text-[color:var(--mimi-menu-shortcut,var(--mimi-muted-foreground))]';

/** Registra el ítem en el menú raíz y devuelve el `value` interno de su `ngMenuItem` (único). */
function registerMenuItem(select: () => void): string {
  const host = inject(MIMI_MENU_HOST);
  const value = `mimi-menu-item-${nextId++}`;
  host.register(value, select);
  inject(DestroyRef).onDestroy(() => host.unregister(value));
  return value;
}

/** Texto del typeahead: `textValue` o, si no hay, el texto del ítem sin el atajo. */
function menuSearchTerm(
  textValue: () => string,
  label: () => ElementRef<HTMLElement> | undefined,
): () => string {
  const text = signal('');
  afterNextRender({ read: () => text.set(label()?.nativeElement.textContent?.trim() ?? '') });
  return computed(() => textValue() || text());
}

/**
 * Ítem de menú: `<mimi-menu-item (selected)="…">Ajustes</mimi-menu-item>`. Un `svg` (o un
 * elemento con `mimiMenuIcon`) va a la columna de ícono; `shortcut` muestra el atajo a la derecha.
 */
@Component({
  selector: 'mimi-menu-item',
  imports: [MenuItem],
  template: `
    <div
      ngMenuItem
      [value]="value"
      [disabled]="disabled()"
      [searchTerm]="searchTerm()"
      [class]="classes()"
      [attr.data-tone]="tone()"
      [attr.data-disabled]="disabled() ? '' : null"
    >
      <span aria-hidden="true" [class]="iconClasses()"
        ><ng-content select="svg,[mimiMenuIcon]"
      /></span>
      <span #label [class]="labelClasses"><ng-content /></span>
      @if (shortcut()) {
        <span [class]="shortcutClasses">{{ shortcut() }}</span>
      }
    </div>
  `,
  host: { style: 'display: contents', '[attr.class]': 'null' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiMenuItem {
  /** `danger` para acciones destructivas (texto y hover en rojo suave). */
  readonly tone = input<MimiMenuItemTone>('default');
  /** Atajo de teclado que se muestra (solo texto: no registra el atajo). */
  readonly shortcut = input('');
  /** No se puede elegir (recibe el foco, como pide el patrón de menú). */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Texto para la búsqueda por teclado, si el contenido no es solo texto. */
  readonly textValue = input('');
  /** Clases del ítem, mezcladas con `cn()` (gana la del usuario). */
  readonly userClass = input('', { alias: 'class' });
  /** Se eligió el ítem (clic, Enter o Espacio). El menú se cierra. */
  readonly selected = output<void>();

  private readonly label = viewChild<ElementRef<HTMLElement>>('label');
  protected readonly value = registerMenuItem(() => this.selected.emit());
  protected readonly searchTerm = menuSearchTerm(this.textValue, this.label);

  protected readonly classes = computed(() =>
    cn(menuItemVariants({ tone: this.tone() }), this.userClass()),
  );
  protected readonly iconClasses = computed(() => cn(ICON_COLUMN, ICON_TONE[this.tone()]));
  protected readonly labelClasses = LABEL;
  protected readonly shortcutClasses = SHORTCUT;
}

/** Ítem con casilla: `<mimi-menu-checkbox-item [(checked)]="…">`. Al marcarlo, el menú se cierra. */
@Component({
  selector: 'mimi-menu-checkbox-item',
  imports: [MenuItem],
  template: `
    <div
      ngMenuItem
      role="menuitemcheckbox"
      [value]="value"
      [disabled]="disabled()"
      [searchTerm]="searchTerm()"
      [class]="classes()"
      [attr.aria-checked]="checked()"
      [attr.data-state]="checked() ? 'checked' : 'unchecked'"
      [attr.data-disabled]="disabled() ? '' : null"
    >
      <span aria-hidden="true" [class]="iconClasses">
        @if (checked()) {
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        }
      </span>
      <span #label [class]="labelClasses"><ng-content /></span>
      @if (shortcut()) {
        <span [class]="shortcutClasses">{{ shortcut() }}</span>
      }
    </div>
  `,
  host: { style: 'display: contents', '[attr.class]': 'null' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiMenuCheckboxItem {
  /** Marcado o no. Admite `[(checked)]`. */
  readonly checked = model(false);
  readonly shortcut = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly textValue = input('');
  readonly userClass = input('', { alias: 'class' });

  private readonly label = viewChild<ElementRef<HTMLElement>>('label');
  protected readonly value = registerMenuItem(() => this.checked.update((checked) => !checked));
  protected readonly searchTerm = menuSearchTerm(this.textValue, this.label);

  protected readonly classes = computed(() => cn(menuItemVariants(), this.userClass()));
  protected readonly iconClasses = cn(ICON_COLUMN, ICON_TONE.checked);
  protected readonly labelClasses = LABEL;
  protected readonly shortcutClasses = SHORTCUT;
}

/**
 * Grupo de opciones excluyentes: `<mimi-menu-radio-group [(value)]="orden">` con
 * `<mimi-menu-radio-item value="…">`. Provisional: no está en el diseño (plan, T.2a).
 */
@Component({
  selector: 'mimi-menu-radio-group',
  template: '<ng-content />',
  host: { role: 'group', '[attr.aria-label]': 'label() || null', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiMenuRadioGroup {
  /** Valor de la opción marcada. Admite `[(value)]`. */
  readonly value = model<unknown>(undefined);
  /** Nombre accesible del grupo (aria-label). */
  readonly label = input('');
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() => cn('flex flex-col', this.userClass()));
}

/** Opción de un `mimi-menu-radio-group`: punto en la columna del ícono si está marcada. */
@Component({
  selector: 'mimi-menu-radio-item',
  imports: [MenuItem],
  template: `
    <div
      ngMenuItem
      role="menuitemradio"
      [value]="value"
      [disabled]="disabled()"
      [searchTerm]="searchTerm()"
      [class]="classes()"
      [attr.aria-checked]="checked()"
      [attr.data-state]="checked() ? 'checked' : 'unchecked'"
      [attr.data-disabled]="disabled() ? '' : null"
    >
      <span aria-hidden="true" [class]="iconClasses">
        @if (checked()) {
          <svg viewBox="0 0 24 24" class="size-2! fill-current">
            <circle cx="12" cy="12" r="10" />
          </svg>
        }
      </span>
      <span #label [class]="labelClasses"><ng-content /></span>
    </div>
  `,
  host: { style: 'display: contents', '[attr.class]': 'null' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiMenuRadioItem {
  private readonly group = inject(MimiMenuRadioGroup, { optional: true });
  /** Valor de esta opción. */
  readonly option = input.required<unknown>({ alias: 'value' });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly textValue = input('');
  readonly userClass = input('', { alias: 'class' });

  private readonly label = viewChild<ElementRef<HTMLElement>>('label');
  protected readonly value = registerMenuItem(() => this.group?.value.set(this.option()));
  protected readonly searchTerm = menuSearchTerm(this.textValue, this.label);

  protected readonly checked = computed(() => this.group?.value() === this.option());
  protected readonly classes = computed(() => cn(menuItemVariants(), this.userClass()));
  protected readonly iconClasses = cn(ICON_COLUMN, 'items-center', ICON_TONE.checked);
  protected readonly labelClasses = LABEL;

  constructor() {
    if (isDevMode() && !this.group) {
      console.warn('mimi-menu-radio-item: ponlo dentro de un <mimi-menu-radio-group>.');
    }
  }
}

/** Etiqueta de un grupo de ítems (como «Cuenta» o «Vista» en el diseño). */
@Component({
  selector: 'mimi-menu-label',
  template: '<ng-content />',
  host: { role: 'presentation', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiMenuLabel {
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn(
      'block px-2 pt-1.5 pb-1 text-[11px] font-semibold tracking-[.05em] text-muted-foreground uppercase',
      this.userClass(),
    ),
  );
}

/** Línea entre grupos de ítems. */
@Component({
  selector: 'mimi-menu-separator',
  template: '',
  host: { role: 'separator', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiMenuSeparator {
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn('-mx-1 my-1 block h-px bg-border', this.userClass()),
  );
}

/** Texto e ícono del ítem que abre un submenú (dentro de `mimi-menu-sub`). */
@Component({
  selector: 'mimi-menu-sub-trigger',
  template: `
    <span aria-hidden="true" [class]="iconClasses"><ng-content select="svg,[mimiMenuIcon]" /></span>
    <span #label [class]="labelClasses"><ng-content /></span>
  `,
  host: { style: 'display: contents', '[attr.class]': 'null' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiMenuSubTrigger {
  /** No abre el submenú. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Texto para la búsqueda por teclado, si el contenido no es solo texto. */
  readonly textValue = input('');
  /** Clases del ítem, mezcladas con `cn()`. */
  readonly userClass = input('', { alias: 'class' });

  readonly label = viewChild<ElementRef<HTMLElement>>('label');
  protected readonly iconClasses = cn(ICON_COLUMN, ICON_TONE.default);
  protected readonly labelClasses = LABEL;
}

/** Contenido del submenú: `<ng-template mimiMenuSubContent>` dentro de `mimi-menu-sub`. */
@Directive({ selector: 'ng-template[mimiMenuSubContent]' })
export class MimiMenuSubContent {
  readonly templateRef = inject(TemplateRef);
}

/**
 * Submenú: un `mimi-menu-sub-trigger` y su `<ng-template mimiMenuSubContent>`. Se abre con el
 * puntero, con Enter, Espacio o →, y se cierra con ← o Escape (el foco vuelve a su ítem). Va a
 * 10px del ítem; si no cabe a la derecha, pasa a la izquierda.
 */
@Component({
  selector: 'mimi-menu-sub',
  imports: [Menu, MenuItem, MimiMenuOutlet],
  template: `
    <div
      ngMenuItem
      [value]="value"
      [submenu]="menu"
      [attr.id]="triggerId"
      [disabled]="trigger()?.disabled() ?? false"
      [searchTerm]="searchTerm()"
      [class]="itemClasses()"
      [attr.data-disabled]="trigger()?.disabled() ? '' : null"
    >
      <ng-content select="mimi-menu-sub-trigger" />
      <span aria-hidden="true" class="inline-flex text-muted-foreground">
        <svg
          class="size-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </span>
    </div>
    <div
      ngMenu
      #menu="ngMenu"
      #panel
      data-mimi-overlay-panel
      [id]="menuId"
      [hidden]="!menu.visible()"
      [attr.aria-labelledby]="triggerId"
      [attr.data-state]="menu.visible() ? 'open' : 'closed'"
      [attr.data-side]="side()"
      [style.translate]="shiftY() ? '0 ' + -shiftY() + 'px' : null"
      [class]="panelClasses()"
    >
      @if (content(); as content) {
        <ng-container [mimiMenuOutlet]="content.templateRef" />
      }
    </div>
  `,
  styles: MIMI_OVERLAY_ANIMATION,
  host: { class: 'relative block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiMenuSub {
  /** Clases del panel del submenú, mezcladas con `cn()`. */
  readonly userClass = input('', { alias: 'class' });

  protected readonly trigger = contentChild(MimiMenuSubTrigger, { descendants: false });
  protected readonly content = contentChild(MimiMenuSubContent, { descendants: false });
  private readonly menu = viewChild(Menu);
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');

  protected readonly value = `mimi-menu-sub-${nextId++}`;
  protected readonly triggerId = `${this.value}-trigger`;
  protected readonly menuId = `${this.value}-menu`;

  /** Lado en el que se abre: derecha, o izquierda si no cabe. */
  protected readonly side = signal<'right' | 'left'>('right');
  /** Cuánto sube el panel para no salir por abajo de la pantalla. */
  protected readonly shiftY = signal(0);

  private readonly labelText = signal('');
  protected readonly searchTerm = computed(() => this.trigger()?.textValue() || this.labelText());

  protected readonly itemClasses = computed(() =>
    cn(menuItemVariants(), this.trigger()?.userClass()),
  );
  protected readonly panelClasses = computed(() =>
    cn(
      MIMI_MENU_PANEL_CLASSES,
      'absolute top-[-5px] z-10 w-[200px] cursor-default',
      'data-[side=right]:left-[calc(100%_+_10px)] data-[side=left]:right-[calc(100%_+_10px)]',
      this.userClass(),
    ),
  );

  constructor() {
    afterNextRender({
      read: () =>
        this.labelText.set(this.trigger()?.label()?.nativeElement.textContent?.trim() ?? ''),
    });
    // Al abrir: a la derecha; si no cabe, a la izquierda. Sube si sale por abajo.
    const injector = inject(Injector);
    effect(() => {
      if (!this.menu()?.visible()) return;
      untracked(() => {
        this.side.set('right');
        this.shiftY.set(0);
      });
      afterNextRender({ read: () => this.place() }, { injector });
    });
  }

  private place(): void {
    const panel = this.panel().nativeElement;
    const view = panel.ownerDocument.defaultView;
    if (!view || panel.hidden) return;
    const rect = panel.getBoundingClientRect();
    if (rect.width === 0) return;
    if (rect.right > view.innerWidth - MIMI_VIEWPORT_MARGIN) this.side.set('left');
    const below = rect.bottom - (view.innerHeight - MIMI_VIEWPORT_MARGIN);
    if (below > 0) this.shiftY.set(Math.min(below, Math.max(rect.top - MIMI_VIEWPORT_MARGIN, 0)));
  }
}
