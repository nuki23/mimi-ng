import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
import { CdkConnectedOverlay, type ConnectedOverlayPositionChange } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  type EmbeddedViewRef,
  Injector,
  TemplateRef,
  ViewContainerRef,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { cn } from '@/components/ui/utils/cn';
import { buttonFocusStyles } from '@/components/ui/utils/control-styles';
import {
  MIMI_FIELD_CONTROL,
  type MimiFieldControl,
  injectFieldState,
} from '@/components/ui/utils/field-state';
import {
  MIMI_OVERLAY_ANIMATION,
  MIMI_VIEWPORT_MARGIN,
  mimiConnectedPositions,
  mimiPlacedSide,
  mimiWaitForExit,
} from '@/components/ui/utils/overlay';
import { MIMI_SELECT_TEXT } from './select-texts';

/*
 * Select (docs/design/Mimi F2 Select.dc.html; prefijo de tokens `select`, spec 13): disparador del
 * alto de Input, panel a 8px con el ancho del disparador, opción de 34px, buscador de 40px,
 * limpiar, grupos, opciones deshabilitadas, sin resultados y cargando.
 *
 * Por dentro: @angular/aria (Combobox + Listbox) da los roles, aria-activedescendant y el teclado
 * de la lista; @angular/cdk/overlay posiciona el panel (popover nativo 'inline'). Nada de aria ni
 * del CDK sale en la API pública (decisión 4.3). Lo que aria no hace y pone Mimi está marcado con
 * «Rodeo» (plan, G1.5b).
 */

/** Una opción de Select. `hint` es el texto atenuado de la derecha («Sin cobertura»). */
export interface MimiOption<T = unknown> {
  label: string;
  value: T;
  disabled?: boolean;
  hint?: string;
}

/** Un grupo de opciones con su etiqueta. */
export interface MimiOptionGroup<T = unknown> {
  label: string;
  options: readonly MimiOption<T>[];
}

/** Decide si una opción coincide con la búsqueda. */
export type MimiSelectFilter<T = unknown> = (option: MimiOption<T>, query: string) => boolean;

/** Contexto de `<ng-template mimiSelectOption let-option let-query="query" let-trigger="trigger">`. */
export interface MimiSelectOptionContext<T = unknown> {
  $implicit: MimiOption<T>;
  /** Texto del buscador (vacío en el disparador). */
  query: string;
  /** `true` cuando se pinta el valor elegido en el disparador. */
  trigger: boolean;
}

/** Distancia entre el disparador y el panel (diseño: 8px). */
const OFFSET = 8;
/** Pausa que reinicia la búsqueda por letra de la lista (la de aria por defecto). */
const TYPEAHEAD_DELAY = 500;

let nextId = 0;

/** Minúsculas y sin tildes, para comparar textos. */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Filtro predeterminado: la etiqueta contiene la búsqueda, sin tildes ni mayúsculas. */
const defaultFilter: MimiSelectFilter = (option, query) =>
  normalize(option.label).includes(normalize(query));

interface Row {
  /** Clave interna: posición en la lista completa (estable aunque se filtre). */
  key: string;
  option: MimiOption;
}

interface Section {
  id: string;
  label: string | null;
  rows: Row[];
}

const ICON = {
  viewBox: '0 0 24 24',
  check: 'M20 6 9 17l-5-5',
  chevron: 'm6 9 6 6 6-6',
  spinner: 'M21 12a9 9 0 1 1-6.219-8.56',
} as const;

/**
 * Resalta en `text` la parte que coincide con `query` (negrita y subrayado, como el diseño). Lo
 * usa la lista, y sirve dentro de una plantilla `mimiSelectOption`:
 * `<mimi-select-highlight [text]="option.label" [query]="query" />`.
 */
@Component({
  selector: 'mimi-select-highlight',
  // Tres elementos pegados, sin @if: un salto de línea entre ellos sería un espacio en el texto.
  template: `<span>{{ parts().before }}</span
    ><mark class="bg-transparent font-bold text-inherit underline underline-offset-[3px]">{{
      parts().match
    }}</mark
    ><span>{{ parts().after }}</span>`,
  host: { '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiSelectHighlight {
  readonly text = input.required<string>();
  readonly query = input('');
  readonly userClass = input('', { alias: 'class' });

  protected readonly classes = computed(() => cn('min-w-0 truncate', this.userClass()));

  protected readonly parts = computed(() => {
    const text = this.text();
    const query = normalize(this.query());
    const start = query ? normalize(text).indexOf(query) : -1;
    if (start < 0) return { before: text, match: '', after: '' };
    const end = start + query.length;
    return { before: text.slice(0, start), match: text.slice(start, end), after: text.slice(end) };
  });
}

/**
 * Contenido propio de cada opción, en la lista y en el disparador:
 *
 * ```html
 * <ng-template mimiSelectOption let-option let-query="query" let-trigger="trigger">
 *   <span class="font-mono text-[11px]">{{ option.value }}</span>
 *   <mimi-select-highlight [text]="option.label" [query]="query" />
 * </ng-template>
 * ```
 */
@Directive({ selector: 'ng-template[mimiSelectOption]' })
export class MimiSelectOption {
  readonly templateRef = inject<TemplateRef<MimiSelectOptionContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _directive: MimiSelectOption,
    context: unknown,
  ): context is MimiSelectOptionContext {
    return true;
  }
}

/**
 * Uso interno (no está en los Imports; se exporta porque el compilador lo exige): pinta la
 * plantilla `mimiSelectOption` y actualiza su contexto sin recrearla. Hace lo mismo que
 * NgTemplateOutlet, sin @angular/common.
 */
@Directive({ selector: '[mimiSelectOutlet]' })
export class MimiSelectOutlet {
  readonly template = input.required<TemplateRef<MimiSelectOptionContext>>({
    alias: 'mimiSelectOutlet',
  });
  readonly option = input.required<MimiOption>({ alias: 'mimiSelectOutletOption' });
  readonly query = input('', { alias: 'mimiSelectOutletQuery' });
  readonly trigger = input(false, { alias: 'mimiSelectOutletTrigger' });

  private readonly viewContainer = inject(ViewContainerRef);
  private view: EmbeddedViewRef<MimiSelectOptionContext> | null = null;
  private rendered: TemplateRef<MimiSelectOptionContext> | null = null;

  private readonly render = effect(() => {
    const template = this.template();
    const context = { $implicit: this.option(), query: this.query(), trigger: this.trigger() };
    untracked(() => {
      if (this.view && this.rendered === template) {
        Object.assign(this.view.context, context);
        this.view.markForCheck();
        return;
      }
      this.viewContainer.clear();
      this.rendered = template;
      this.view = this.viewContainer.createEmbeddedView(template, context);
    });
  });
}

const LIST_CLASSES = 'flex max-h-[280px] flex-col gap-px overflow-y-auto p-1 outline-none';
const GROUP_LABEL_CLASSES =
  'px-2 pt-1.5 pb-1 text-[11px] font-semibold tracking-[.05em] text-muted-foreground uppercase';
const OPTION_CLASSES = cn(
  'flex h-[var(--mimi-select-option-height,34px)] shrink-0 cursor-pointer items-center gap-2 px-2 text-sm select-none',
  'rounded-[var(--mimi-select-option-radius,var(--mimi-radius-sm))]',
  'transition-[background-color] duration-120 ease-[ease] active:scale-[0.985]',
  'data-[active=true]:bg-[color:var(--mimi-select-option-hover,var(--mimi-accent))]',
  'aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:active:scale-100',
);
const SKELETON_CLASSES =
  'mx-2 h-7 rounded-[var(--mimi-radius-sm)] bg-muted animate-mimi-pulse motion-reduce:animate-none';

/**
 * Uso interno de Select (no está en los Imports): el `ngListbox` con las opciones, más los estados
 * de carga y sin resultados. Es un componente aparte para que el listbox se registre, por DI, en
 * el popup que lo contiene: el del disparador (sin buscador) o el del buscador.
 *
 * El `value` del listbox es solo lo que se pinta (el check y `aria-selected`): el valor real es
 * el de Select. Rodeo: aria desmarca la opción elegida al volver a elegirla y vacía el valor
 * cuando la opción queda fuera del filtro; aquí se le vuelve a escribir (`resync`).
 */
@Component({
  selector: 'mimi-select-list',
  imports: [Listbox, Option, ComboboxWidget, MimiSelectOutlet, MimiSelectHighlight],
  template: `
    <div
      ngListbox
      ngComboboxWidget
      #listbox="ngListbox"
      focusMode="activedescendant"
      selectionMode="explicit"
      tabindex="-1"
      [softDisabled]="false"
      [typeaheadDelay]="typeaheadDelay"
      [id]="listId()"
      [value]="selectedKeys()"
      [activeDescendant]="listbox.activeDescendant()"
      [attr.aria-label]="labelledBy() ? null : label() || null"
      [attr.aria-labelledby]="labelledBy() || null"
      [class]="listClasses()"
      (valueChange)="resync()"
      (click)="onClick($event)"
      (pointermove)="onPointerMove($event)"
    >
      @for (section of sections(); track section.id) {
        <div
          class="flex flex-col gap-px"
          [attr.role]="section.label ? 'group' : 'presentation'"
          [attr.aria-labelledby]="section.label ? section.id : null"
        >
          @if (section.label) {
            <span role="presentation" [id]="section.id" [class]="groupLabelClasses">{{
              section.label
            }}</span>
          }
          @for (row of section.rows; track row.key) {
            <div
              ngOption
              [id]="optionId(row.key)"
              [value]="row.key"
              [label]="row.option.label"
              [disabled]="!!row.option.disabled"
              [class]="optionClasses"
              [attr.data-key]="row.key"
              [attr.data-state]="row.key === selectedKey() ? 'checked' : 'unchecked'"
            >
              @if (optionTemplate(); as template) {
                <span class="flex min-w-0 flex-1 items-center gap-2">
                  <ng-container
                    [mimiSelectOutlet]="template"
                    [mimiSelectOutletOption]="row.option"
                    [mimiSelectOutletQuery]="query()"
                  />
                </span>
              } @else {
                <mimi-select-highlight class="flex-1" [text]="row.option.label" [query]="query()" />
              }
              @if (row.option.hint) {
                <span class="shrink-0 text-xs text-muted-foreground">{{ row.option.hint }}</span>
              }
              @if (row.key === selectedKey()) {
                <svg
                  aria-hidden="true"
                  class="size-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  [attr.viewBox]="icon.viewBox"
                >
                  <path [attr.d]="icon.check" />
                </svg>
              }
            </div>
          }
        </div>
      }
    </div>
    @if (loading()) {
      <div aria-busy="true" class="flex flex-col gap-1.5 p-2">
        <div class="flex items-center gap-2 px-2 py-1.5 text-[13px] text-muted-foreground">
          <svg
            aria-hidden="true"
            class="size-3.5 shrink-0 animate-[mimi-spin_0.8s_linear_infinite]"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            [attr.viewBox]="icon.viewBox"
          >
            <path [attr.d]="icon.spinner" />
          </svg>
          {{ text.loading }}
        </div>
        <div aria-hidden="true" [class]="skeletonClasses"></div>
        <div aria-hidden="true" class="w-[70%]" [class]="skeletonClasses"></div>
        <div aria-hidden="true" class="mb-1.5 w-[84%]" [class]="skeletonClasses"></div>
      </div>
    }
    <div
      role="status"
      [class]="empty() ? 'flex flex-col items-center gap-1.5 px-4 py-6 text-center' : 'sr-only'"
    >
      @if (empty()) {
        <span
          aria-hidden="true"
          class="inline-flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground"
        >
          <svg
            class="size-[18px]"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            [attr.viewBox]="icon.viewBox"
          >
            <path d="m13.5 8.5-5 5" />
            <path d="m8.5 8.5 5 5" />
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </span>
        <span class="text-sm font-semibold">{{ text.noResults }}</span>
        @if (query()) {
          <span class="text-[13px] text-muted-foreground">{{ text.noResultsFor(query()) }}</span>
        }
      }
    </div>
  `,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiSelectList {
  readonly sections = input.required<Section[]>();
  /** Clave de la opción elegida, o null. */
  readonly selectedKey = input<string | null>(null);
  readonly query = input('');
  readonly loading = input(false);
  readonly optionTemplate = input<TemplateRef<MimiSelectOptionContext> | null>(null);
  readonly listId = input.required<string>();
  readonly label = input('');
  readonly labelledBy = input<string | null | undefined>(null);
  /** Se eligió una opción habilitada con el puntero. */
  readonly pick = output<string>();

  private readonly listbox = viewChild.required<Listbox<string>>('listbox');

  protected readonly text = inject(MIMI_SELECT_TEXT);
  protected readonly icon = ICON;
  protected readonly typeaheadDelay = TYPEAHEAD_DELAY;
  protected readonly groupLabelClasses = GROUP_LABEL_CLASSES;
  protected readonly optionClasses = OPTION_CLASSES;
  protected readonly skeletonClasses = SKELETON_CLASSES;

  private readonly keys = computed(() =>
    this.sections().flatMap((section) => section.rows.map((row) => row.key)),
  );
  protected readonly empty = computed(() => !this.loading() && this.keys().length === 0);
  protected readonly listClasses = computed(() =>
    cn(LIST_CLASSES, this.keys().length === 0 && 'hidden'),
  );

  /** Cambia para volver a escribir el valor en el listbox (un arreglo nuevo cada vez). */
  private readonly version = signal(0);
  protected readonly selectedKeys = computed(() => {
    this.version();
    const key = this.selectedKey();
    return key !== null && this.keys().includes(key) ? [key] : [];
  });

  /** El activo cambió con el puntero: no hace falta traerlo a la vista. */
  private byPointer = false;

  constructor() {
    afterRenderEffect({
      read: () => {
        const listbox = this.listbox();
        if (!listbox.activeDescendant()) return;
        if (this.byPointer) this.byPointer = false;
        else listbox.scrollActiveItemIntoView();
      },
    });
  }

  protected optionId(key: string): string {
    return `${this.listId()}-${key}`;
  }

  protected resync(): void {
    this.version.update((version) => version + 1);
  }

  /** Clave de la opción activa (la del `aria-activedescendant`), o null. */
  activeKey(): string | null {
    const id = this.listbox().activeDescendant();
    return id ? id.slice(this.listId().length + 1) : null;
  }

  /** Activa la primera opción habilitada (al escribir en el buscador). */
  gotoFirst(): void {
    this.listbox().gotoFirst();
  }

  private optionAt(event: Event): HTMLElement | null {
    return (event.target as Element | null)?.closest<HTMLElement>('[role="option"]') ?? null;
  }

  /** Rodeo: el listbox no avisa qué opción se eligió. Solo cuentan las habilitadas. */
  protected onClick(event: MouseEvent): void {
    const option = this.optionAt(event);
    const key = option?.dataset['key'];
    if (key !== undefined && option?.getAttribute('aria-disabled') !== 'true') this.pick.emit(key);
  }

  /** El puntero activa la opción, como en el diseño (aria solo la activa con el teclado). */
  protected onPointerMove(event: PointerEvent): void {
    const option = this.optionAt(event);
    const key = option?.dataset['key'];
    if (key === undefined || option?.dataset['active'] === 'true') return;
    if (option?.getAttribute('aria-disabled') === 'true') return;
    this.byPointer = true;
    this.listbox().gotoIndex(this.keys().indexOf(key));
  }
}

const TRIGGER_CLASSES = cn(
  'group/select relative flex w-full min-w-0 items-center gap-2 pr-2.5 pl-3 font-sans text-sm text-foreground mimi-transition',
  'h-[var(--mimi-select-height,var(--mimi-control-height,2.5rem))] rounded-[var(--mimi-select-radius,var(--mimi-radius,0.75rem))]',
  'border border-[color:var(--mimi-select-border,var(--mimi-input))] bg-[color:var(--mimi-select-trigger-bg,var(--mimi-input-background))]',
  // Foco, error y deshabilitado como en Input (utils/control-styles.ts). Aquí el foco y
  // aria-invalid están en el botón de dentro, así que la caja los lee con has-[] y data-*.
  'has-[[role=combobox]:focus]:border-ring has-[[role=combobox]:focus]:ring-3 has-[[role=combobox]:focus]:ring-ring-soft',
  'data-[invalid]:border-destructive data-[invalid]:has-[[role=combobox]:focus]:border-destructive data-[invalid]:has-[[role=combobox]:focus]:ring-destructive-ring',
  'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-[var(--mimi-disabled-opacity,0.5)]',
  'has-[[role=combobox]:active]:scale-(--mimi-press-scale)',
);

// El ::after cubre toda la caja: un clic en cualquier parte (también en el chevron) es del botón.
const BUTTON_CLASSES =
  'flex h-full min-w-0 flex-1 cursor-pointer items-center gap-2 bg-transparent text-left outline-none after:absolute after:inset-0 disabled:cursor-not-allowed';

const CLEAR_CLASSES = cn(
  'relative z-10 inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground',
  'mimi-transition hover:bg-accent hover:text-foreground active:scale-90',
  buttonFocusStyles,
);

const PANEL_CLASSES =
  'w-full overflow-hidden rounded-[var(--mimi-select-radius,var(--mimi-radius,0.75rem))] border border-border bg-[color:var(--mimi-select-menu-bg,var(--mimi-popover))] font-sans text-sm text-popover-foreground shadow-[shadow:var(--mimi-select-menu-shadow,var(--mimi-shadow-popover))] outline-none';

const SEARCH_INPUT_CLASSES =
  'h-full min-w-0 flex-1 border-0 bg-transparent font-sans text-sm text-foreground outline-none placeholder:text-muted-foreground';

/**
 * Lista desplegable de una sola opción:
 *
 * ```html
 * <mimi-select [(value)]="pais" [options]="paises" placeholder="Selecciona un país" search clearable />
 * ```
 *
 * Implementa `FormValueControl`: funciona con `[formField]`, `formControlName` y `[(ngModel)]`
 * sin adaptador (spec, sección 8). `class` va al disparador y `panelClass` al panel.
 */
@Component({
  selector: 'mimi-select',
  imports: [
    Combobox,
    ComboboxPopup,
    ComboboxWidget,
    CdkConnectedOverlay,
    MimiSelectList,
    MimiSelectOutlet,
  ],
  // mimi-form-field lo encuentra por este token para mostrar el mensaje de error.
  providers: [{ provide: MIMI_FIELD_CONTROL, useExisting: MimiSelect }],
  template: `
    <div
      #box
      [class]="classes()"
      [attr.data-state]="open() ? 'open' : 'closed'"
      [attr.data-invalid]="showInvalid() ? '' : null"
      [attr.data-disabled]="disabled() ? '' : null"
      [attr.data-placeholder]="selectedOption() ? null : ''"
    >
      <!-- preserveContent: el panel sigue montado mientras dura la animación de salida. -->
      <button
        #trigger
        #combobox="ngCombobox"
        ngCombobox
        type="button"
        [id]="controlId()"
        [class]="buttonClasses"
        [expanded]="open()"
        [disabled]="disabled()"
        [softDisabled]="false"
        [preserveContent]="true"
        [attr.aria-invalid]="showInvalid() || null"
        [attr.aria-required]="required() || null"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-labelledby]="ariaLabelledby() || null"
        (expandedChange)="setOpen($event)"
        (keydown)="onTriggerKeydown($event)"
        (keyup)="onTriggerKeyup($event)"
      >
        @if (selectedOption(); as option) {
          @if (optionTemplate(); as template) {
            <span class="flex min-w-0 flex-1 items-center gap-2 overflow-hidden whitespace-nowrap">
              <ng-container
                [mimiSelectOutlet]="template.templateRef"
                [mimiSelectOutletOption]="option"
                [mimiSelectOutletTrigger]="true"
              />
            </span>
          } @else {
            <span class="min-w-0 flex-1 truncate">{{ option.label }}</span>
          }
        } @else {
          <span class="min-w-0 flex-1 truncate text-muted-foreground">{{ placeholder() }}</span>
        }
      </button>
      @if (showClear()) {
        <button
          type="button"
          [class]="clearClasses"
          [attr.aria-label]="text.clear"
          (click)="clear()"
        >
          <svg
            aria-hidden="true"
            class="size-3.5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            [attr.viewBox]="icon.viewBox"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      }
      @if (loading()) {
        <svg
          aria-hidden="true"
          data-slot="spinner"
          class="size-4 shrink-0 animate-[mimi-spin_0.8s_linear_infinite] text-muted-foreground"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          [attr.viewBox]="icon.viewBox"
        >
          <path [attr.d]="icon.spinner" />
        </svg>
      }
      <svg
        aria-hidden="true"
        class="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-[cubic-bezier(.2,.8,.2,1)] group-data-[state=open]/select:rotate-180"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        [attr.viewBox]="icon.viewBox"
      >
        <path [attr.d]="icon.chevron" />
      </svg>
    </div>

    <!-- El popup de aria va por fuera del overlay: así el disparador tiene aria-haspopup cerrado. -->
    <ng-template
      ngComboboxPopup
      [combobox]="combobox"
      [popupType]="search() ? 'dialog' : 'listbox'"
    >
      <ng-template
        cdkConnectedOverlay
        [cdkConnectedOverlayOrigin]="box"
        [cdkConnectedOverlayOpen]="rendered()"
        [cdkConnectedOverlayPositions]="positions"
        [cdkConnectedOverlayViewportMargin]="viewportMargin"
        [cdkConnectedOverlayDisableClose]="true"
        [cdkConnectedOverlayMatchWidth]="true"
        cdkConnectedOverlayUsePopover="inline"
        cdkConnectedOverlayTransformOriginOn="[data-mimi-overlay-panel]"
        (detach)="onDetach()"
        (overlayOutsideClick)="setOpen(false)"
        (positionChange)="onPositionChange($event)"
      >
        @if (search()) {
          <!-- Rodeo: buscador dentro del panel con un segundo combobox (ejemplo oficial de aria). -->
          <div
            ngComboboxWidget
            #panel
            data-mimi-overlay-panel
            role="dialog"
            [class]="panelClasses()"
            [attr.aria-label]="ariaLabelledby() ? null : panelLabel() || null"
            [attr.aria-labelledby]="ariaLabelledby() || null"
            [attr.data-state]="state()"
            [attr.data-side]="placedSide()"
            [attr.inert]="state() === 'closed' ? '' : null"
            (mousedown)="onPanelMousedown($event)"
          >
            <div
              class="flex h-10 items-center gap-2 border-b border-border px-3 text-muted-foreground"
            >
              <svg
                aria-hidden="true"
                class="size-[15px] shrink-0"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                [attr.viewBox]="icon.viewBox"
              >
                <path d="m21 21-4.34-4.34" />
                <circle cx="11" cy="11" r="8" />
              </svg>
              <input
                #searchInput
                #searchBox="ngCombobox"
                ngCombobox
                type="text"
                autocomplete="off"
                [alwaysExpanded]="true"
                [class]="searchInputClasses"
                [value]="query()"
                [attr.aria-label]="searchPlaceholder() || text.search"
                [attr.placeholder]="searchPlaceholder() || text.search"
                (valueChange)="onQuery($event)"
                (keydown)="onSearchKeydown($event)"
              />
              @if (query() && !loading()) {
                <span data-slot="count" class="shrink-0 font-mono text-[11px]">{{
                  text.results(count())
                }}</span>
              }
            </div>
            <ng-template ngComboboxPopup [combobox]="searchBox">
              <mimi-select-list
                [sections]="visibleSections()"
                [selectedKey]="selectedKey()"
                [query]="query()"
                [loading]="loading()"
                [optionTemplate]="optionTemplate()?.templateRef ?? null"
                [listId]="listId"
                [label]="panelLabel()"
                [labelledBy]="ariaLabelledby()"
                (pick)="pick($event)"
              />
            </ng-template>
          </div>
        } @else {
          <div
            #panel
            data-mimi-overlay-panel
            [class]="panelClasses()"
            [attr.data-state]="state()"
            [attr.data-side]="placedSide()"
            [attr.inert]="state() === 'closed' ? '' : null"
            (mousedown)="onPanelMousedown($event)"
          >
            <mimi-select-list
              [sections]="visibleSections()"
              [selectedKey]="selectedKey()"
              [loading]="loading()"
              [optionTemplate]="optionTemplate()?.templateRef ?? null"
              [listId]="listId"
              [label]="panelLabel()"
              [labelledBy]="ariaLabelledby()"
              (pick)="pick($event)"
            />
          </div>
        }
      </ng-template>
    </ng-template>
  `,
  styles: MIMI_OVERLAY_ANIMATION,
  host: {
    style: 'display: contents',
    // El class es del disparador; id y aria-* pasan al botón: fuera del anfitrión.
    '[attr.class]': 'null',
    '[attr.id]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    '(focusout)': 'onFocusOut($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiSelect<T = unknown> implements FormValueControl<T | null>, MimiFieldControl {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  protected readonly text = inject(MIMI_SELECT_TEXT);

  /** Opciones sueltas o en grupos (`{ label, options }`). */
  readonly options = input<readonly (MimiOption<T> | MimiOptionGroup<T>)[]>([]);
  /** Valor de la opción elegida, o `null`. Con `[(value)]` o un formulario. */
  readonly value = model<T | null>(null);
  /** Compara el valor con el de cada opción (para objetos). Por defecto, `Object.is`. */
  readonly compareWith = input<(a: T, b: T) => boolean>(Object.is);
  readonly placeholder = input('');
  /** Muestra el buscador dentro del panel. */
  readonly search = input(false, { transform: booleanAttribute });
  /** Placeholder y nombre accesible del buscador. */
  readonly searchPlaceholder = input('');
  /** Filtro propio. Por defecto: la etiqueta contiene la búsqueda, sin tildes ni mayúsculas. */
  readonly filterWith = input<MimiSelectFilter<T>>();
  /** Muestra el botón de limpiar cuando hay un valor. */
  readonly clearable = input(false, { transform: booleanAttribute });
  /** Cargando: spinner en el disparador y, en el panel, el estado de carga en vez de la lista. */
  readonly loading = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Los pasa el formulario. Se muestra el error si es inválido y se tocó o modificó. */
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly touched = input(false, { transform: booleanAttribute });
  readonly dirty = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  /** id del disparador, para una etiqueta externa (`<label for>`). */
  readonly id = input<string>();
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string>(undefined, { alias: 'aria-labelledby' });
  /** Clases del disparador, mezcladas con `cn()` (gana la del usuario). */
  readonly userClass = input('', { alias: 'class' });
  /** Clases del panel. */
  readonly panelClass = input('');

  /** Se emite cuando el foco sale del Select (disparador y panel): marca el control como tocado. */
  readonly touch = output<void>();
  /** Texto del buscador, para buscar en el servidor. Al cerrar se emite vacío. */
  readonly searchChange = output<string>();

  protected readonly optionTemplate = contentChild(MimiSelectOption);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly list = viewChild(MimiSelectList);

  /** Estado del formulario, con los errores, para el mensaje de mimi-form-field. */
  readonly fieldState = injectFieldState();

  /** El disparador: mimi-form-field le agrega el aria-describedby del mensaje. */
  get controlElement(): HTMLElement {
    return this.trigger().nativeElement;
  }

  private readonly baseId = `mimi-select-${nextId++}`;
  protected readonly listId = `${this.baseId}-list`;
  protected readonly controlId = computed(() => this.id() || this.baseId);
  /** Error visible (inválido y tocado o modificado). Lo lee también mimi-form-field. */
  readonly showInvalid = computed(() => this.invalid() && (this.touched() || this.dirty()));

  protected readonly icon = ICON;
  protected readonly buttonClasses = BUTTON_CLASSES;
  protected readonly clearClasses = CLEAR_CLASSES;
  protected readonly searchInputClasses = SEARCH_INPUT_CLASSES;
  protected readonly viewportMargin = MIMI_VIEWPORT_MARGIN;
  /** Debajo del disparador; si no cabe, encima. */
  protected readonly positions = mimiConnectedPositions('bottom', 'start', OFFSET).slice(0, 2);

  protected readonly classes = computed(() => cn(TRIGGER_CLASSES, this.userClass()));
  protected readonly panelClasses = computed(() => cn(PANEL_CLASSES, this.panelClass()));

  /** Todas las opciones, con su clave interna, en secciones (sueltas o de un grupo). */
  private readonly sections = computed<Section[]>(() => {
    const sections: Section[] = [];
    let loose: Section | null = null;
    let index = 0;
    const row = (option: MimiOption<T>): Row => ({ key: String(index++), option });
    for (const item of this.options()) {
      const id = `${this.listId}-group-${sections.length}`;
      if ('options' in item) {
        loose = null;
        sections.push({ id, label: item.label, rows: item.options.map(row) });
      } else {
        if (!loose) sections.push((loose = { id, label: null, rows: [] }));
        loose.rows.push(row(item));
      }
    }
    return sections;
  });
  private readonly rows = computed(() => this.sections().flatMap((section) => section.rows));

  /** Texto del buscador. */
  protected readonly query = signal('');

  /** Lo que se pinta: nada mientras carga, y solo las coincidencias al buscar. */
  protected readonly visibleSections = computed<Section[]>(() => {
    if (this.loading()) return [];
    const query = this.search() ? this.query() : '';
    if (!query) return this.sections();
    const filter = (this.filterWith() ?? defaultFilter) as MimiSelectFilter;
    return this.sections()
      .map((section) => ({ ...section, rows: section.rows.filter((r) => filter(r.option, query)) }))
      .filter((section) => section.rows.length > 0);
  });
  protected readonly count = computed(() =>
    this.visibleSections().reduce((count, section) => count + section.rows.length, 0),
  );

  private matches(option: MimiOption, value: T | null): boolean {
    return value != null && this.compareWith()(option.value as T, value);
  }

  /** Rodeo: aria compara por identidad, así que cada opción lleva una clave interna. */
  protected readonly selectedKey = computed(() => {
    const value = this.value();
    return this.rows().find((row) => this.matches(row.option, value))?.key ?? null;
  });

  /**
   * La opción elegida. Si deja de estar en `options` (búsqueda en el servidor), se conserva la
   * última para seguir mostrando su texto.
   */
  protected readonly selectedOption = linkedSignal<
    { value: T | null; rows: Row[] },
    MimiOption | null
  >({
    source: () => ({ value: this.value(), rows: this.rows() }),
    computation: ({ value, rows }, previous) => {
      const found = rows.find((row) => this.matches(row.option, value))?.option;
      if (found) return found;
      const last = previous?.value;
      return last && this.matches(last, value) ? last : null;
    },
  });

  protected readonly showClear = computed(
    () => this.clearable() && !this.disabled() && this.selectedOption() !== null,
  );

  /** Abierto (aria-expanded). */
  protected readonly open = signal(false);
  /** El panel está en el DOM (también mientras dura la animación de salida). */
  protected readonly rendered = signal(false);
  /** Estado ya pintado: cambia después de `open`, en el siguiente ciclo. */
  protected readonly state = signal<'open' | 'closed'>('closed');
  protected readonly placedSide = signal<'top' | 'right' | 'bottom' | 'left'>('bottom');
  /** Nombre del panel y de la lista: el del disparador. */
  protected readonly panelLabel = signal('');

  /** Cuenta los cierres: si se vuelve a abrir durante la animación de salida, no se desmonta. */
  private closing = 0;
  /** Última letra de la búsqueda por teclado: mientras dura, Espacio es parte del texto. */
  private typedAt = -Infinity;

  private readonly syncOpen = effect(() => {
    const open = this.open();
    untracked(() => (open ? this.show() : this.hide()));
  });

  private readonly closeWhenDisabled = effect(() => {
    if (this.disabled()) untracked(() => this.open.set(false));
  });

  /** Rodeo: con buscador, el foco pasa al input al abrir (aria no lo mueve). */
  private readonly focusSearch = effect(() => {
    const input = this.searchInput()?.nativeElement;
    if (!input || this.state() !== 'open') return;
    untracked(() => afterNextRender({ read: () => input.focus() }, { injector: this.injector }));
  });

  /** Enfoca el disparador. Lo usa Signal Forms para llevar el foco al campo con error. */
  focus(options?: FocusOptions): void {
    this.trigger().nativeElement.focus(options);
  }

  /** Abre o cierra. Lo llama aria (clic, ↓, Enter, Espacio, Escape, foco fuera) y Mimi. */
  protected setOpen(open: boolean): void {
    if (open && this.disabled()) return;
    this.open.set(open);
  }

  /** Cierra y, con `refocus`, devuelve el foco al disparador (al elegir o con Escape). */
  private close(refocus: boolean): void {
    if (refocus) this.focus();
    this.open.set(false);
  }

  private show(): void {
    this.closing++;
    const trigger = this.trigger().nativeElement;
    this.panelLabel.set(
      this.ariaLabel() || trigger.labels?.[0]?.textContent?.trim() || this.placeholder(),
    );
    this.state.set('open');
    this.rendered.set(true);
    // Safari no enfoca un botón al hacer clic: sin foco no habría teclado.
    if (!this.search()) this.focus({ preventScroll: true });
  }

  private hide(): void {
    if (!this.rendered()) return;
    this.state.set('closed');
    const panel = this.panel()?.nativeElement;
    const closing = ++this.closing;
    afterNextRender(
      {
        read: () => {
          void mimiWaitForExit(panel).then(() => {
            if (closing === this.closing) this.unmount();
          });
        },
      },
      { injector: this.injector },
    );
  }

  private unmount(): void {
    this.rendered.set(false);
    if (this.query()) {
      this.query.set('');
      this.searchChange.emit('');
    }
  }

  protected onDetach(): void {
    this.unmount();
    if (this.open()) this.open.set(false);
  }

  protected onPositionChange({ connectionPair }: ConnectedOverlayPositionChange): void {
    this.placedSide.set(mimiPlacedSide(connectionPair));
  }

  /** Elige la opción de esa clave y cierra. Elegir la ya elegida solo cierra. */
  protected pick(key: string): void {
    const option = this.rows().find((row) => row.key === key)?.option;
    if (!option || option.disabled) return;
    this.value.set(option.value as T);
    this.close(true);
  }

  /** Elige la opción activa de la lista (Enter, Espacio, Alt+↑). */
  private pickActive(): boolean {
    const key = this.list()?.activeKey();
    if (key) this.pick(key);
    return !!key;
  }

  /** Quita el valor (botón de limpiar). */
  protected clear(): void {
    this.value.set(null);
    this.focus();
  }

  /**
   * Teclas del disparador que aria no cubre. aria ya atendió la tecla cuando esto corre; `state`
   * todavía es «closed» si esa misma tecla acaba de abrir.
   */
  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled() || event.ctrlKey || event.metaKey) return;
    const { key, altKey } = event;
    if (this.state() !== 'open') {
      // Rodeo: aria solo abre con ↓, Enter y Espacio (sin modificadores).
      if (key === 'ArrowUp' || (key === 'ArrowDown' && altKey)) {
        event.preventDefault();
        this.setOpen(true);
      }
      return;
    }
    if (key === 'ArrowUp' && altKey) {
      event.preventDefault();
      if (!this.pickActive()) this.close(true);
    } else if (key === 'Enter' && !altKey) {
      this.pickActive();
    } else if (key === ' ') {
      if (event.timeStamp - this.typedAt > TYPEAHEAD_DELAY) this.pickActive();
    } else if (key.length === 1 && !altKey) {
      this.typedAt = event.timeStamp;
    }
  }

  /** Espacio activa un botón al soltar la tecla: sin esto, el clic volvería a abrir o cerrar. */
  protected onTriggerKeyup(event: KeyboardEvent): void {
    if (event.key === ' ') event.preventDefault();
  }

  /** Rodeo: teclas del buscador que su combobox (siempre abierto) no cubre. */
  protected onSearchKeydown(event: KeyboardEvent): void {
    if (event.isComposing) return;
    const { key } = event;
    if (key === 'Escape') {
      event.preventDefault();
      this.close(true);
    } else if (key === 'Tab') {
      // El panel está fuera del orden del documento: el Tab sigue desde el disparador.
      this.close(true);
    } else if (key === 'Enter') {
      event.preventDefault();
      this.pickActive();
    } else if (key === 'ArrowUp' && event.altKey) {
      event.preventDefault();
      if (!this.pickActive()) this.close(true);
    }
  }

  protected onQuery(query: string): void {
    if (query === this.query()) return;
    this.query.set(query);
    this.searchChange.emit(query);
    // Como en el diseño: al escribir, la primera coincidencia habilitada queda activa.
    afterNextRender({ read: () => this.list()?.gotoFirst() }, { injector: this.injector });
  }

  /** Un clic en el panel no mueve el foco (salvo al buscador): si no, aria cerraría. */
  protected onPanelMousedown(event: MouseEvent): void {
    if (event.target !== this.searchInput()?.nativeElement) event.preventDefault();
  }

  /** El foco salió del Select entero (disparador, limpiar y panel). */
  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && (this.host.contains(next) || this.panel()?.nativeElement.contains(next))) return;
    this.touch.emit();
  }
}

/** Todas las piezas de Select, para importarlas juntas. */
export const MimiSelectImports = [MimiSelect, MimiSelectOption, MimiSelectHighlight] as const;
