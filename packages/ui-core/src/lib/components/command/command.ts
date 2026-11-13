import { Combobox, ComboboxPopup } from '@angular/aria/combobox';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  type EmbeddedViewRef,
  InjectionToken,
  type Signal,
  TemplateRef,
  ViewContainerRef,
  computed,
  contentChild,
  effect,
  forwardRef,
  inject,
  input,
  model,
  output,
  untracked,
  viewChild,
} from '@angular/core';
import { MimiDialog, MimiDialogContent } from '@/components/ui/dialog';
import {
  type MimiListFilter,
  type MimiListOption,
  type MimiListOptionGroup,
  MimiHighlight,
  MimiOptionList,
  mimiFilterSections,
  mimiListSections,
  mimiNormalizeText,
} from '@/components/ui/option-list/option-list';
import { cn } from '@/components/ui/utils/cn';
import { MimiSized } from '@/components/ui/utils/size';
import { MIMI_COMMAND_TEXT } from './command-texts';

/*
 * Command ⌘K (docs/design/Mimi F4 Command Tree Sortable.dc.html, «1 · Command ⌘K»; prefijo de
 * tokens `command`, spec 13). Una paleta de comandos: se escribe para filtrar y Enter o un clic
 * ejecutan el comando activo.
 *
 * - `mimi-command`: la paleta (buscador, lista y pie), que también se puede poner en la página.
 * - `mimi-command-dialog`: la paleta en un diálogo, que se abre con ⌘K (Mac) o Ctrl+K.
 *
 * Por dentro: @angular/aria (Combobox siempre abierto sobre el <input> y el Listbox del ítem
 * `option-list`, la lógica de lista de Combobox) da los roles, aria-activedescendant y las
 * flechas; el diálogo es el de Mimi (cdk). Nada de aria ni del cdk sale en la API pública.
 */

/** Tono del ícono de un comando (como Badge y Progress). */
export type MimiCommandTone = 'info' | 'success' | 'warning' | 'danger';

/** Un comando. */
export interface MimiCommandItem<T = unknown> {
  /** Identificador estable. */
  id: string;
  /** Texto del comando: se busca y se resalta. */
  label: string;
  /** Otras palabras con las que se encuentra (no se muestran). */
  keywords?: readonly string[];
  /** Atajo que se muestra a la derecha (`['⌘', 'N']`). Mimi solo lo muestra: no lo registra. */
  shortcut?: readonly string[];
  /** Color de la caja del ícono. */
  tone?: MimiCommandTone;
  /** Se ve pero no se puede ejecutar. */
  disabled?: boolean;
  /** Datos propios, para `(run)`. */
  data?: T;
}

/** Un grupo de comandos con su título. */
export interface MimiCommandGroup<T = unknown> {
  label: string;
  items: readonly MimiCommandItem<T>[];
}

/** Contexto de la plantilla del ícono: `let-item`. */
export interface MimiCommandIconContext<T = unknown> {
  $implicit: MimiCommandItem<T>;
}

/**
 * Ícono de cada comando, dentro de la caja de 26px del diseño:
 * `<ng-template mimiCommandIcon let-item><svg … /></ng-template>`. Sin plantilla, no hay caja.
 */
@Directive({ selector: 'ng-template[mimiCommandIcon]' })
export class MimiCommandIcon<T = any> {
  readonly templateRef = inject<TemplateRef<MimiCommandIconContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(
    _dir: MimiCommandIcon<T>,
    ctx: unknown,
  ): ctx is MimiCommandIconContext<T> {
    return true;
  }
}

/**
 * Lo que va debajo de «sin resultados» (el «Buscar en la documentación» del diseño):
 * `<button mimiBtn mimiCommandEmpty>…</button>`.
 */
@Directive({ selector: '[mimiCommandEmpty]', host: { 'data-slot': 'empty-action' } })
export class MimiCommandEmpty {}

/**
 * Uso interno: pinta la plantilla del ícono. Recibe el comando (siempre el mismo objeto de
 * `items`), no un contexto nuevo en cada detección de cambios (NG0103, G3.2); sin
 * `NgTemplateOutlet`, que lleva `@angular/common` al JS inicial del sitio (G3.1).
 * @internal No forma parte de la API de Mimi.
 */
@Directive({ selector: '[mimiCommandOutlet]' })
export class MimiCommandOutlet {
  readonly template = input.required<TemplateRef<MimiCommandIconContext>>({
    alias: 'mimiCommandOutlet',
  });
  readonly item = input.required<MimiCommandItem>({ alias: 'mimiCommandOutletItem' });

  private readonly viewContainer = inject(ViewContainerRef);
  private view: EmbeddedViewRef<MimiCommandIconContext> | null = null;
  private rendered: TemplateRef<MimiCommandIconContext> | null = null;

  private readonly render = effect(() => {
    const template = this.template();
    const item = this.item();
    untracked(() => {
      if (this.view && this.rendered === template) {
        this.view.context.$implicit = item;
        this.view.markForCheck();
        return;
      }
      this.viewContainer.clear();
      this.rendered = template;
      this.view = this.viewContainer.createEmbeddedView(template, { $implicit: item });
    });
  });
}

/** Uso interno: lo que `mimi-command-dialog` pasa a la paleta de dentro. */
interface MimiCommandHost {
  readonly iconTemplate: Signal<TemplateRef<MimiCommandIconContext> | undefined>;
  /** Cierra el diálogo (Escape). */
  close(): void;
}

const MIMI_COMMAND_HOST = new InjectionToken<MimiCommandHost>('MIMI_COMMAND_HOST');

let nextId = 0;

const ICON = {
  viewBox: '0 0 24 24',
  search: ['m21 21-4.34-4.34', 'M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z'],
  searchX: [
    'm13.5 8.5-5 5',
    'm8.5 8.5 5 5',
    'M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z',
    'm21 21-4.3-4.3',
  ],
} as const;

const HOST_CLASSES = cn(
  'flex w-full min-w-0 flex-col overflow-hidden font-sans text-popover-foreground',
  'rounded-[var(--mimi-radius-card)] border border-border bg-popover',
  'shadow-[shadow:var(--mimi-shadow-popover)]',
);

const SEARCH_CLASSES =
  'flex h-[var(--mimi-command-input-h,var(--mimi-command-input-height,52px))] shrink-0 items-center gap-2.5 border-b border-border pr-3.5 pl-4';

const INPUT_CLASSES =
  'h-full min-w-0 flex-1 bg-transparent text-[length:var(--mimi-command-text,var(--mimi-command-input-font-size,15px))] text-foreground outline-none placeholder:text-muted-foreground';

const KBD_CLASSES =
  'inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-[5px] border border-border bg-background px-[5px] font-mono text-[11px] text-muted-foreground';

const ESC_CLASSES =
  'inline-flex h-[22px] shrink-0 items-center rounded-[5px] border border-border bg-background px-[7px] font-mono text-[11px] text-muted-foreground';

const FOOTER_KBD_CLASSES =
  'inline-flex h-[18px] items-center rounded-[4px] border border-border px-[5px] font-mono text-[10.5px]';

const LIST_CLASSES = 'max-h-[var(--mimi-command-list-height,332px)] p-1.5';

const OPTION_CLASSES = cn(
  'group/command-item flex h-[var(--mimi-command-item-h,var(--mimi-command-item-height,40px))] shrink-0 cursor-pointer items-center gap-2.5 px-2.5 text-sm select-none',
  'rounded-[var(--mimi-command-item-radius,var(--mimi-radius-sm))]',
  'transition-[background-color] duration-100 ease-[ease] active:scale-(--mimi-press-scale)',
  'data-[active=true]:bg-[color:var(--mimi-command-active,var(--mimi-accent))]',
  'aria-disabled:cursor-not-allowed aria-disabled:opacity-[var(--mimi-disabled-opacity,0.5)]',
);

const ICON_BOX_CLASSES =
  'mr-0.5 inline-flex size-[var(--mimi-command-icon-size,26px)] shrink-0 items-center justify-center rounded-[7px] mimi-transition [&_svg]:size-[15px] [&_svg]:shrink-0';

/** Caja del ícono: suave sin activar, sólida activada (clases literales para Tailwind). */
const ICON_TONE_CLASSES: Record<MimiCommandTone | 'none', string> = {
  none: 'bg-muted text-muted-foreground group-data-[active=true]/command-item:bg-primary group-data-[active=true]/command-item:text-primary-foreground',
  info: 'bg-info-soft text-info-soft-foreground group-data-[active=true]/command-item:bg-info group-data-[active=true]/command-item:text-info-foreground',
  success:
    'bg-success-soft text-success-soft-foreground group-data-[active=true]/command-item:bg-success group-data-[active=true]/command-item:text-success-foreground',
  warning:
    'bg-warning-soft text-warning-soft-foreground group-data-[active=true]/command-item:bg-warning group-data-[active=true]/command-item:text-warning-foreground',
  danger:
    'bg-destructive-soft-bg text-destructive-soft-foreground group-data-[active=true]/command-item:bg-destructive group-data-[active=true]/command-item:text-destructive-foreground',
};

/** Busca en el texto y en las `keywords`, sin tildes ni mayúsculas. */
const commandFilter: MimiListFilter<MimiCommandItem> = (option, query) => {
  const q = mimiNormalizeText(query.trim());
  if (!q) return true;
  const item = option.value;
  return (
    mimiNormalizeText(item.label).includes(q) ||
    (item.keywords ?? []).some((word) => mimiNormalizeText(word).includes(q))
  );
};

const toOption = (item: MimiCommandItem): MimiListOption<MimiCommandItem> => ({
  label: item.label,
  value: item,
  disabled: item.disabled,
});

/**
 * Paleta de comandos: `<mimi-command [items]="comandos" (run)="ejecutar($event)" />`.
 *
 * - `items`: comandos sueltos o en grupos (`{ label, items }`).
 * - `run`: el comando que se ejecutó (Enter o clic).
 * - `<ng-template mimiCommandIcon let-item>`: el ícono de cada comando.
 *
 * Dentro de la página, Escape vacía lo escrito; en `mimi-command-dialog`, cierra.
 */
@Component({
  selector: 'mimi-command',
  hostDirectives: [{ directive: MimiSized, inputs: ['size'] }],
  imports: [Combobox, ComboboxPopup, MimiOptionList, MimiHighlight, MimiCommandOutlet],
  template: `
    <div data-slot="search" [class]="searchClasses">
      <svg
        aria-hidden="true"
        class="size-[18px] shrink-0 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        [attr.viewBox]="icon.viewBox"
      >
        @for (d of icon.search; track d) {
          <path [attr.d]="d" />
        }
      </svg>
      <input
        #field
        #combobox="ngCombobox"
        ngCombobox
        alwaysExpanded
        type="text"
        autocomplete="off"
        spellcheck="false"
        [class]="inputClasses"
        [value]="query()"
        [softDisabled]="false"
        [attr.placeholder]="placeholder() || texts.placeholder"
        [attr.aria-label]="label()"
        (valueChange)="onText($event)"
        (keydown)="onKeydown($event)"
      />
      @if (inDialog) {
        <kbd aria-hidden="true" data-slot="esc" [class]="escClasses">esc</kbd>
      }
    </div>

    <ng-template ngComboboxPopup [combobox]="combobox" popupType="listbox">
      <mimi-option-list
        [sections]="visibleSections()"
        [query]="query().trim()"
        [status]="status()"
        [optionTemplate]="itemTemplate()"
        [listId]="listId"
        [label]="label()"
        [listClass]="listClasses"
        [optionClass]="optionClasses"
        (pick)="pick($event)"
      />
    </ng-template>

    @if (empty()) {
      <div data-slot="empty" class="flex flex-col items-center gap-2 px-5 py-10 text-center">
        <span
          class="inline-flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground"
        >
          <svg
            aria-hidden="true"
            class="size-5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            [attr.viewBox]="icon.viewBox"
          >
            @for (d of icon.searchX; track d) {
              <path [attr.d]="d" />
            }
          </svg>
        </span>
        <span class="text-[15px] font-bold">{{ texts.noResults(query().trim()) }}</span>
        <span class="text-[13px] text-muted-foreground">{{ texts.noResultsHint }}</span>
        <span class="mt-1 empty:hidden"><ng-content select="[mimiCommandEmpty]" /></span>
      </div>
    }

    <div data-slot="footer" aria-hidden="true" [class]="footerClasses">
      <span class="flex items-center gap-1.5"
        ><kbd [class]="footerKbdClasses">↑↓</kbd>{{ texts.navigate }}</span
      >
      <span class="flex items-center gap-1.5"
        ><kbd [class]="footerKbdClasses">↵</kbd>{{ texts.run }}</span
      >
      <span class="flex-1"></span>
      <span data-slot="count">{{ texts.results(count()) }}</span>
    </div>

    <ng-template #item let-option let-query="query">
      @if (iconTemplate(); as iconTemplate) {
        <span data-slot="icon" [class]="iconBoxClasses(option.value)">
          <ng-container [mimiCommandOutlet]="iconTemplate" [mimiCommandOutletItem]="option.value" />
        </span>
      }
      <mimi-highlight class="flex-1" [text]="option.label" [query]="query" />
      @if (option.value.shortcut?.length) {
        <span aria-hidden="true" data-slot="shortcut" class="flex shrink-0 gap-[3px]">
          @for (key of option.value.shortcut; track $index) {
            <kbd [class]="kbdClasses">{{ key }}</kbd>
          }
        </span>
      }
    </ng-template>
  `,
  host: { '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiCommand<T = unknown> {
  protected readonly texts = inject(MIMI_COMMAND_TEXT);
  private readonly host = inject(MIMI_COMMAND_HOST, { optional: true });
  /** Está dentro de `mimi-command-dialog`: Escape cierra y se ve la tecla `esc`. */
  protected readonly inDialog = !!this.host;

  /** Los comandos, sueltos o en grupos. */
  readonly items = input<readonly (MimiCommandItem<T> | MimiCommandGroup<T>)[]>([]);
  /** Lo escrito. Admite `[(query)]`. */
  readonly query = model('');
  readonly placeholder = input('');
  /** Nombre de la lista y del buscador (por defecto, «Command palette»). */
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
  readonly userClass = input('', { alias: 'class' });

  /** Se ejecutó un comando (Enter o clic). */
  readonly run = output<MimiCommandItem<T>>();

  private readonly ownIcon = contentChild(MimiCommandIcon);
  protected readonly iconTemplate = computed(
    () => this.ownIcon()?.templateRef ?? this.host?.iconTemplate(),
  );
  protected readonly itemTemplate = viewChild.required<TemplateRef<never>>('item');
  private readonly list = viewChild(MimiOptionList);

  protected readonly icon = ICON;
  protected readonly searchClasses = SEARCH_CLASSES;
  protected readonly inputClasses = INPUT_CLASSES;
  protected readonly escClasses = ESC_CLASSES;
  protected readonly kbdClasses = KBD_CLASSES;
  protected readonly footerKbdClasses = FOOTER_KBD_CLASSES;
  protected readonly footerClasses =
    'flex h-10 shrink-0 items-center gap-4 border-t border-border px-4 text-xs text-muted-foreground';
  protected readonly listClasses = LIST_CLASSES;
  protected readonly optionClasses = OPTION_CLASSES;
  protected readonly classes = computed(() => cn(HOST_CLASSES, this.userClass()));

  protected readonly listId = `mimi-command-${nextId++}-list`;
  protected readonly label = computed(() => this.ariaLabel() || this.texts.label);

  private readonly sections = computed(() =>
    mimiListSections<MimiCommandItem<T>>(
      this.items().map((entry) =>
        'items' in entry
          ? ({
              label: entry.label,
              options: entry.items.map(toOption),
            } as MimiListOptionGroup<MimiCommandItem<T>>)
          : (toOption(entry) as MimiListOption<MimiCommandItem<T>>),
      ),
      this.listId,
    ),
  );
  protected readonly visibleSections = computed(() =>
    mimiFilterSections(
      this.sections(),
      this.query().trim(),
      commandFilter as MimiListFilter<MimiCommandItem<T>>,
    ),
  );
  protected readonly count = computed(() =>
    this.visibleSections().reduce((count, section) => count + section.rows.length, 0),
  );
  protected readonly empty = computed(() => this.count() === 0 && !!this.query().trim());
  /** Lo que oye el lector al escribir: el número de resultados, o «sin resultados». */
  protected readonly status = computed(() => {
    const query = this.query().trim();
    if (!query) return '';
    return this.count() ? this.texts.results(this.count()) : this.texts.noResults(query);
  });

  /** Como el diseño: el primer comando está activo al abrir y mientras se escribe. */
  private readonly firstActive = effect(() => {
    this.list()?.gotoFirst();
  });

  protected iconBoxClasses(item: MimiCommandItem): string {
    return cn(ICON_BOX_CLASSES, ICON_TONE_CLASSES[item.tone ?? 'none']);
  }

  protected onText(text: string): void {
    if (text === this.query()) return;
    this.query.set(text);
    this.list()?.gotoFirst();
  }

  /** Ejecuta el comando de esa clave (solo si está habilitado). */
  protected pick(key: string): void {
    const row = this.sections()
      .flatMap((section) => section.rows)
      .find((r) => r.key === key);
    if (!row || row.option.disabled) return;
    this.run.emit(row.option.value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.isComposing) return;
    if (event.key === 'Enter') {
      // aria ya movió la elección en la lista; Mimi ejecuta el activo.
      event.preventDefault();
      const key = this.list()?.activeKey();
      if (key) this.pick(key);
    } else if (event.key === 'Escape' && this.host) {
      // aria corta la propagación de Escape: el diálogo no lo ve, así que se cierra desde aquí.
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      this.host.close();
    } else if (event.key === 'Escape' && this.query()) {
      event.preventDefault();
      this.query.set('');
      this.list()?.gotoFirst();
    }
  }
}

/** Clases del panel del diálogo: arriba (`--mimi-command-top`) y centrado a lo ancho. */
const DIALOG_PANEL_CLASSES = cn(
  'fixed top-[var(--mimi-command-top,36px)] left-1/2 -translate-x-1/2 overflow-hidden',
  'max-h-[calc(100dvh_-_var(--mimi-command-top,36px)_-_16px)]',
);

/**
 * La paleta en un diálogo: `<mimi-command-dialog [(open)]="abierta" [items]="comandos"
 * (run)="ejecutar($event)" />`. ⌘K (Mac) o Ctrl+K la abren y la cierran (`shortcut=""` lo
 * apaga). Al ejecutar un comando, se cierra y emite `run`.
 */
@Component({
  selector: 'mimi-command-dialog',
  hostDirectives: [{ directive: MimiSized, inputs: ['size'] }],
  imports: [MimiDialog, MimiDialogContent, MimiCommand],
  providers: [{ provide: MIMI_COMMAND_HOST, useExisting: forwardRef(() => MimiCommandDialog) }],
  template: `
    <mimi-dialog
      width="var(--mimi-command-width, 560px)"
      autoFocus="input"
      [(open)]="open"
      [class]="panelClasses()"
      [closeButton]="false"
      [aria-label]="label()"
    >
      <ng-template mimiDialogContent>
        <mimi-command
          class="max-h-[inherit] rounded-none border-0 shadow-none"
          [size]="sized.effective()"
          [items]="items()"
          [placeholder]="placeholder()"
          [aria-label]="label()"
          (run)="onRun($event)"
        >
          <ng-content select="[mimiCommandEmpty]" ngProjectAs="[mimiCommandEmpty]" />
        </mimi-command>
      </ng-template>
    </mimi-dialog>
  `,
  host: {
    style: 'display: contents',
    // El class es del panel; aria-label, del diálogo: fuera del anfitrión.
    '[attr.class]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.data-state]': 'open() ? "open" : "closed"',
    '(document:keydown)': 'onShortcut($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiCommandDialog<T = unknown> implements MimiCommandHost {
  protected readonly texts = inject(MIMI_COMMAND_TEXT);
  /** La paleta va en un diálogo (overlay): recibe el tamaño. */
  protected readonly sized = inject(MimiSized);

  /** Abierta o cerrada. Admite `[(open)]`. */
  readonly open = model(false);
  readonly items = input<readonly (MimiCommandItem<T> | MimiCommandGroup<T>)[]>([]);
  readonly placeholder = input('');
  /** Letra del atajo con ⌘ (Mac) o Ctrl. Vacío: sin atajo. */
  readonly shortcut = input('k');
  /** Nombre del diálogo y de la lista (por defecto, «Command palette»). */
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
  /** Clases del panel, mezcladas con `cn()`. */
  readonly userClass = input('', { alias: 'class' });

  /** Se ejecutó un comando; el diálogo ya se está cerrando. */
  readonly run = output<MimiCommandItem<T>>();

  private readonly icon = contentChild(MimiCommandIcon);
  /** @internal La plantilla del ícono, para la paleta de dentro del diálogo. */
  readonly iconTemplate = computed(() => this.icon()?.templateRef);

  protected readonly label = computed(() => this.ariaLabel() || this.texts.label);
  protected readonly panelClasses = computed(() => cn(DIALOG_PANEL_CLASSES, this.userClass()));

  protected onShortcut(event: KeyboardEvent): void {
    const key = this.shortcut().toLowerCase();
    if (!key || event.defaultPrevented || event.repeat) return;
    if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return;
    if (event.key.toLowerCase() !== key) return;
    event.preventDefault();
    this.open.update((open) => !open);
  }

  /** @internal Lo usa la paleta de dentro (Escape). */
  close(): void {
    this.open.set(false);
  }

  protected onRun(item: MimiCommandItem<T>): void {
    this.open.set(false);
    this.run.emit(item);
  }
}

/** Todas las piezas de Command, para importarlas juntas. */
export const MimiCommandImports = [
  MimiCommand,
  MimiCommandDialog,
  MimiCommandIcon,
  MimiCommandEmpty,
] as const;
