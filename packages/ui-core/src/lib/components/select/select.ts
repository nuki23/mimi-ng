import { FocusMonitor, InputModalityDetector } from '@angular/cdk/a11y';
import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { CdkConnectedOverlay, type ConnectedOverlayPositionChange } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
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
  contentChildren,
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
import { MimiSized } from '@/components/ui/utils/size';
import { buttonFocusStyles } from '@/components/ui/utils/control-styles';
import { fieldTriggerBoxStyles } from '@/components/ui/utils/field-styles';
import {
  MIMI_FIELD_CONTROL,
  type MimiFieldControl,
  injectFieldState,
} from '@/components/ui/utils/field-state';
import {
  MIMI_OVERLAY_ANIMATION,
  MIMI_VIEWPORT_MARGIN,
  MimiOverlayFollow,
  type MimiOverlayAlign,
  type MimiOverlaySide,
  mimiConnectedPositions,
  mimiPlacedSide,
  mimiWaitForExit,
} from '@/components/ui/utils/overlay';
import {
  MimiHighlight,
  MimiOptgroup,
  MimiOptionItem,
  MimiOptionList,
  MimiOptionListStandalone,
  type MimiCompareWith,
  type MimiListFilter,
  type MimiListOptionContext,
  type MimiListRow,
  type MimiSearchMode,
  mimiCompareFn,
  mimiDeclaredOptions,
  mimiFilterSections,
  mimiListSections,
} from '@/components/ui/option-list/option-list';
import {
  MIMI_OVERLAY_CONFIG,
  type MimiOverlayPresentation,
  type MimiResolvedPresentation,
  mimiResolvePresentation,
} from '@/components/ui/utils/overlay-config';
import { MimiSheetOutlet, MimiSheetOverlay } from '@/components/ui/utils/sheet';
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
/** Pausa que reinicia la búsqueda por letra (la de aria por defecto): Espacio no elige mientras. */
const TYPEAHEAD_DELAY = 500;

let nextId = 0;

const ICON = {
  viewBox: '0 0 24 24',
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
// M.9: la lógica (entradas, comparar sin tildes, partir el texto) es la de `MimiHighlight` de
// option-list; aquí solo queda el selector propio y la plantilla.
export class MimiSelectHighlight extends MimiHighlight {}

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
 * @internal No está en el índice; no forma parte de la API de Mimi.
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

/** La lista (la de `option-list`): 280px de alto como máximo, como el diseño. */
const LIST_CLASSES = 'max-h-[280px]';
/** Cada opción: 34px, con la altura, el radio y el hover propios de Select. */
const OPTION_CLASSES = cn(
  'flex h-[var(--mimi-select-option-height,34px)] shrink-0 cursor-pointer items-center gap-2 px-2 text-sm select-none',
  'rounded-[var(--mimi-select-option-radius,var(--mimi-radius-sm))]',
  'transition-[background-color] duration-120 ease-[ease] active:scale-(--mimi-press-scale)',
  'data-[active=true]:bg-[color:var(--mimi-select-option-hover,var(--mimi-accent))]',
  'aria-disabled:cursor-not-allowed aria-disabled:opacity-[var(--mimi-disabled-opacity,0.5)] aria-disabled:active:scale-100',
);

const TRIGGER_CLASSES = cn(
  'group/select relative flex w-full min-w-0 items-center gap-2 pr-2.5 pl-3 font-sans text-sm text-foreground mimi-transition',
  'h-[var(--mimi-select-height,var(--mimi-size-height,var(--mimi-control-height,2.5rem)))] rounded-[var(--mimi-select-radius,var(--mimi-radius,0.75rem))]',
  // Borde, hover, foco (solo con el teclado: `data-focus-visible`, origen del FocusMonitor),
  // clic (se hunde y crece el halo), error, deshabilitado y solo lectura: los de todos los campos
  // (utils/field-styles). El borde y el fondo en reposo siguen leyendo los tokens del Select.
  fieldTriggerBoxStyles,
  'border-[color:var(--mimi-select-border,var(--mimi-input-border,var(--mimi-input)))] bg-[color:var(--mimi-select-trigger-bg,var(--mimi-input-bg,var(--mimi-input-background)))]',
);

// El ::after cubre toda la caja: un clic en cualquier parte (también en el chevron) es del botón.
const BUTTON_CLASSES =
  'flex h-full min-w-0 flex-1 cursor-pointer items-center gap-2 bg-transparent text-left outline-none after:absolute after:inset-0 disabled:cursor-not-allowed';

const CLEAR_CLASSES = cn(
  'pointer-events-auto relative z-10 inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground',
  'mimi-transition hover:bg-accent hover:text-foreground active:scale-(--mimi-press-scale-sm)',
  buttonFocusStyles,
  // La X solo se ve con el ratón encima, el foco que llegó por teclado o el panel abierto; en
  // pantallas sin ratón, mientras haya valor (informes del usuario, 12 y 13/11/2026). Si no, el
  // chevron. Con `focus-within` se quedaba después de elegir con el ratón.
  'hidden group-hover/select:inline-flex group-data-[focus-keyboard]/select:inline-flex group-data-[state=open]/select:inline-flex [@media(hover:none)]:inline-flex',
);
const CHEVRON_CLASSES =
  'size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-[cubic-bezier(.2,.8,.2,1)] group-data-[state=open]/select:rotate-180';
/** El chevron cuando hay X: se esconde cuando la X se ve. */
const CHEVRON_WITH_CLEAR_CLASSES = cn(
  CHEVRON_CLASSES,
  'group-hover/select:hidden group-data-[focus-keyboard]/select:hidden group-data-[state=open]/select:hidden [@media(hover:none)]:hidden',
);

const PANEL_CLASSES =
  'w-full max-w-[calc(100vw_-_16px)] overflow-hidden rounded-[var(--mimi-select-radius,var(--mimi-radius,0.75rem))] border border-border bg-[color:var(--mimi-select-menu-bg,var(--mimi-popover))] font-sans text-sm text-popover-foreground shadow-[shadow:var(--mimi-select-menu-shadow,var(--mimi-shadow-popover))] outline-none';

/** La barra del buscador; en la hoja, sin el borde de abajo y como un campo (R.34). */
const SEARCH_BAR_CLASSES =
  'flex h-10 shrink-0 items-center gap-2 border-b border-border px-3 text-muted-foreground';
const SHEET_SEARCH_BAR_CLASSES =
  'mx-3 mb-2 flex h-11 shrink-0 items-center gap-2 rounded-[var(--mimi-select-radius,var(--mimi-radius,0.75rem))] border border-[color:var(--mimi-select-border,var(--mimi-input-border,var(--mimi-input)))] px-3 text-muted-foreground focus-within:border-ring';
/** En la hoja, la lista ocupa lo que quede y cada opción mide 44 px (objetivo táctil). */
const SHEET_LIST_CLASSES = 'max-h-none min-h-0 flex-1 px-2 pb-2';
const SHEET_OPTION_CLASSES = cn(OPTION_CLASSES, 'h-11');

const SEARCH_INPUT_CLASSES =
  'h-full min-w-0 flex-1 border-0 bg-transparent font-sans text-sm text-foreground outline-none placeholder:text-muted-foreground';

/**
 * Lista desplegable de una sola opción:
 *
 * ```html
 * <mimi-select [(value)]="pais" placeholder="Selecciona un país" search clearable>
 *   @for (p of paises(); track p.code) {
 *     <mimi-option [value]="p.code">{{ p.nombre }}</mimi-option>
 *   }
 * </mimi-select>
 * ```
 *
 * Para una lista armada por código, `[options]` es la alternativa (gana sobre las `<mimi-option>`).
 *
 * Implementa `FormValueControl`: funciona con `[formField]`, `formControlName` y `[(ngModel)]`
 * sin adaptador (spec, sección 8). `class` va al disparador y `panelClass` al panel.
 */
@Component({
  selector: 'mimi-select',
  hostDirectives: [{ directive: MimiSized, inputs: ['size'] }],
  imports: [
    Combobox,
    ComboboxPopup,
    ComboboxWidget,
    CdkConnectedOverlay,
    MimiOverlayFollow,
    MimiOptionList,
    MimiOptionListStandalone,
    MimiSelectOutlet,
    MimiSheetOverlay,
    MimiSheetOutlet,
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
      [attr.data-focus-visible]="focusVisible() ? '' : null"
      [attr.data-focus-keyboard]="focusKeyboard() ? '' : null"
      [attr.data-readonly]="readonly() ? '' : null"
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
        [readonly]="readonly()"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-labelledby]="ariaLabelledby() || null"
        (expandedChange)="onExpandedChange($event)"
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
      <!-- Un solo icono al final, en el sitio del chevron: cargando > limpiar > chevron. -->
      <span
        data-slot="end-icon"
        class="pointer-events-none relative z-10 inline-flex size-6 shrink-0 items-center justify-center"
        [attr.data-icon]="endIcon()"
      >
        @if (endIcon() === 'loading') {
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
        } @else {
          @if (endIcon() === 'clear') {
            <button
              type="button"
              data-slot="clear"
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
          <svg
            aria-hidden="true"
            data-slot="chevron"
            [class]="endIcon() === 'clear' ? chevronWithClearClasses : chevronClasses"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            [attr.viewBox]="icon.viewBox"
          >
            <path [attr.d]="icon.chevron" />
          </svg>
        }
      </span>
    </div>

    <!-- El popup de aria va por fuera del overlay: así el disparador tiene aria-haspopup cerrado. -->
    <ng-template
      ngComboboxPopup
      [combobox]="combobox"
      [popupType]="search() ? 'dialog' : 'listbox'"
    >
      <ng-template
        cdkConnectedOverlay
        mimiOverlayFollow
        (mimiOverlayOutOfView)="setOpen(false)"
        [cdkConnectedOverlayOrigin]="box"
        [cdkConnectedOverlayOpen]="rendered()"
        [cdkConnectedOverlayPositions]="positions()"
        [cdkConnectedOverlayViewportMargin]="viewportMargin"
        [cdkConnectedOverlayDisableClose]="true"
        [cdkConnectedOverlayMinWidth]="matchWidth() ? (boxWidth() ?? '') : ''"
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
            <ng-container [mimiSheetOutlet]="searchContent" />
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
            <mimi-option-list
              [sections]="visibleSections()"
              [selectedKeys]="selectedKeys()"
              [loading]="loading()"
              [loadingText]="text.loading"
              [emptyTitle]="text.noResults"
              [status]="loading() ? text.loading : ''"
              [optionTemplate]="listTemplate()"
              [listId]="listId"
              [label]="panelLabel()"
              [labelledBy]="ariaLabelledby()"
              [listClass]="listClasses"
              [optionClass]="optionClasses"
              (pick)="pick($event)"
            />
          </div>
        }
      </ng-template>
    </ng-template>

    <!-- El buscador y su lista: en el panel y, en el teléfono, arriba en la hoja (R.34). -->
    <ng-template #searchContent>
      <div [class]="searchBarClasses()">
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
        <mimi-option-list
          [sections]="visibleSections()"
          [selectedKeys]="selectedKeys()"
          [query]="query()"
          [loading]="loading()"
          [loadingText]="text.loading"
          [emptyTitle]="text.noResults"
          [emptyText]="query() ? text.noResultsFor(query()) : ''"
          [status]="loading() ? text.loading : query() && count() ? text.results(count()) : ''"
          [optionTemplate]="listTemplate()"
          [listId]="listId"
          [label]="panelLabel()"
          [labelledBy]="ariaLabelledby()"
          [listClass]="sheetOpen() ? sheetListClasses : listClasses"
          [optionClass]="sheetOpen() ? sheetOptionClasses : optionClasses"
          (pick)="pick($event)"
        />
      </ng-template>
    </ng-template>

    <!--
      En el teléfono (R.34): un diálogo (la hoja) con la lista. El panel de aria no entra: sin
      buscador, la lista va sola (recibe el foco y su teclado); con buscador, el buscador de arriba.
    -->
    <ng-template
      mimiSheet
      [mimiSheetOpen]="sheetOpen()"
      [mimiSheetSide]="mode() === 'fullscreen' ? 'full' : 'bottom'"
      [mimiSheetTitle]="sheetTitle() || panelLabel()"
      [mimiSheetSize]="sized.effective()"
      [mimiSheetClass]="panelClass()"
      (mimiSheetClose)="close(false)"
      (mimiSheetDetach)="onSheetDetach()"
    >
      @if (search()) {
        <div data-slot="sheet-search" class="flex min-h-0 flex-1 flex-col">
          <ng-container [mimiSheetOutlet]="searchContent" />
        </div>
      } @else {
        <div mimiOptionListStandalone class="flex min-h-0 flex-1 flex-col">
          <mimi-option-list
            standalone
            [sections]="visibleSections()"
            [selectedKeys]="selectedKeys()"
            [loading]="loading()"
            [loadingText]="text.loading"
            [emptyTitle]="text.noResults"
            [status]="loading() ? text.loading : ''"
            [optionTemplate]="listTemplate()"
            [listId]="listId"
            [label]="panelLabel()"
            [labelledBy]="ariaLabelledby()"
            [listClass]="sheetListClasses"
            [optionClass]="sheetOptionClasses"
            (pick)="pick($event)"
          />
        </div>
      }
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
    // `align` es un atributo HTML antiguo: el navegador lo convierte en text-align (se heredaría).
    '[attr.align]': 'null',
    '[attr.data-presentation]': 'open() ? mode() : null',
    '(focusout)': 'onFocusOut($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiSelect<T = unknown> implements FormValueControl<T | null>, MimiFieldControl {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  protected readonly text = inject(MIMI_SELECT_TEXT);
  private readonly focusMonitor = inject(FocusMonitor);
  private readonly modality = inject(InputModalityDetector);
  /**
   * El disparador tiene el foco y se llegó con el teclado o desde el código (Signal Forms lleva el
   * foco al campo con error): solo entonces se pinta el anillo, como `:focus-visible`.
   */
  protected readonly focusVisible = signal(false);
  /**
   * El foco está en la caja (el disparador o la X) y llegó con el teclado: muestra la X. El foco
   * que vuelve desde el código después de elegir con el ratón no cuenta (13/11/2026).
   */
  protected readonly focusKeyboard = signal(false);
  private readonly destroyRef = inject(DestroyRef);

  private readonly watchFocus = afterNextRender(() => {
    const trigger = this.trigger().nativeElement;
    const box = this.box().nativeElement;
    this.focusMonitor
      .monitor(trigger)
      .subscribe((origin) => this.focusVisible.set(origin === 'keyboard' || origin === 'program'));
    this.focusMonitor
      .monitor(box, true)
      .subscribe((origin) =>
        this.focusKeyboard.set(
          origin === 'keyboard' ||
            (origin === 'program' && this.modality.mostRecentModality === 'keyboard'),
        ),
      );
    // Con el ratón o el dedo, la X deja de verse aunque el foco no salga.
    const modality = this.modality.modalityDetected.subscribe((m) => {
      if (m !== 'keyboard') this.focusKeyboard.set(false);
    });
    this.destroyRef.onDestroy(() => {
      modality.unsubscribe();
      this.focusMonitor.stopMonitoring(trigger);
      this.focusMonitor.stopMonitoring(box);
    });
  });

  /** Opciones sueltas o en grupos (`{ label, options }`). */
  readonly options = input<readonly (MimiOption<T> | MimiOptionGroup<T>)[]>([]);
  /** Valor de la opción elegida, o `null`. Con `[(value)]` o un formulario. */
  readonly value = model<T | null>(null);
  /**
   * Compara el valor con el de cada opción (para objetos): una función o el nombre de un campo
   * (`compareWith="id"`). Por defecto, `Object.is`.
   */
  readonly compareWith = input<MimiCompareWith<T>>(Object.is);
  private readonly compare = computed(() => mimiCompareFn(this.compareWith()));
  readonly placeholder = input('');
  /** Muestra el buscador dentro del panel. */
  readonly search = input(false, { transform: booleanAttribute });
  /** Placeholder y nombre accesible del buscador. */
  readonly searchPlaceholder = input('');
  /** Filtro propio. Por defecto: la etiqueta contiene la búsqueda, sin tildes ni mayúsculas. */
  readonly filterWith = input<MimiSelectFilter<T>>();
  /**
   * Dónde se filtra: `'client'` (aquí, con `filterWith` o el predeterminado) o `'server'` (la app
   * filtra al recibir `(searchChange)` y el Select muestra lo que llega, sin volver a filtrar).
   */
  readonly searchMode = input<MimiSearchMode>('client');
  /** Muestra el botón de limpiar cuando hay un valor. */
  readonly clearable = input(false, { transform: booleanAttribute });
  /** Cargando: spinner en el disparador y, en el panel, el estado de carga en vez de la lista. */
  readonly loading = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Solo lectura (R.12): el valor se ve y se puede enfocar, pero no cambia ni abre el panel. */
  readonly readonly = input(false, { transform: booleanAttribute });
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
  /** Lado preferido del panel (como Popover). Si no cabe, pasa al opuesto. */
  readonly side = input<MimiOverlaySide>('bottom');
  /** Alineación del panel con el disparador (como Popover). */
  readonly align = input<MimiOverlayAlign>('start');
  /** El panel mide al menos lo que el disparador (más si una opción lo pide). Con `false`, lo que pida su contenido. */
  readonly matchWidth = input(true, { transform: booleanAttribute });
  /**
   * Cómo se abre (R.34): `auto` (por defecto) = panel desde 640 px y, por debajo, la hoja
   * inferior; `popover`, `sheet` o `fullscreen` lo fijan.
   */
  readonly presentation = input<MimiOverlayPresentation>('auto');
  /** Título de la hoja. Sin él, el nombre del campo. */
  readonly sheetTitle = input<string>();

  /** Se emite cuando el foco sale del Select (disparador y panel): marca el control como tocado. */
  readonly touch = output<void>();
  /** Texto del buscador, para buscar en el servidor. Al cerrar se emite vacío. */
  readonly searchChange = output<string>();

  protected readonly optionTemplate = contentChild(MimiSelectOption);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly box = viewChild.required<ElementRef<HTMLElement>>('box');
  /**
   * Ancho del disparador al abrir: con `matchWidth`, el panel mide **al menos** eso y crece si una
   * opción lo pide. Antes medía exactamente eso: con un valor corto («Pro») el disparador, y con él
   * el panel, quedaban de 78px y las etiquetas no se veían (informe del usuario, 12/11/2026).
   */
  protected readonly boxWidth = signal<number | null>(null);
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly list = viewChild(MimiOptionList);

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
  protected readonly listClasses = LIST_CLASSES;
  protected readonly optionClasses = OPTION_CLASSES;
  protected readonly buttonClasses = BUTTON_CLASSES;
  protected readonly clearClasses = CLEAR_CLASSES;
  protected readonly chevronClasses = CHEVRON_CLASSES;
  protected readonly chevronWithClearClasses = CHEVRON_WITH_CLEAR_CLASSES;
  protected readonly searchInputClasses = SEARCH_INPUT_CLASSES;
  protected readonly sheetListClasses = SHEET_LIST_CLASSES;
  protected readonly sheetOptionClasses = SHEET_OPTION_CLASSES;
  protected readonly sized = inject(MimiSized);
  private readonly overlayConfig = inject(MIMI_OVERLAY_CONFIG);
  private readonly document = inject(DOCUMENT);
  /** La presentación de esta apertura (se elige al abrir, R.34). */
  protected readonly mode = signal<MimiResolvedPresentation>('popover');
  /** La hoja está abierta. */
  protected readonly sheetOpen = computed(() => this.open() && this.mode() !== 'popover');
  protected readonly searchBarClasses = computed(() =>
    this.sheetOpen() ? SHEET_SEARCH_BAR_CLASSES : SEARCH_BAR_CLASSES,
  );
  protected readonly viewportMargin = MIMI_VIEWPORT_MARGIN;
  /** En el lado pedido (debajo, por defecto); si no cabe, en el opuesto. Con las tres
   *  alineaciones de cada lado (5.17a), sin pasar a los costados. */
  protected readonly positions = computed(() =>
    mimiConnectedPositions(this.side(), this.align(), OFFSET).slice(0, 6),
  );

  protected readonly classes = computed(() => cn(TRIGGER_CLASSES, this.userClass()));
  protected readonly panelClasses = computed(() => cn(PANEL_CLASSES, this.panelClass()));

  private readonly declared = contentChildren(MimiOptionItem, { descendants: true });

  /** `[options]` si se dio; si no, las `<mimi-option>` (las de un mismo `<mimi-optgroup>` juntas). */
  private readonly items = computed<readonly (MimiOption<T> | MimiOptionGroup<T>)[]>(() => {
    const given = this.options();
    return given.length > 0 ? given : mimiDeclaredOptions<T>(this.declared());
  });

  /** Todas las opciones, con su clave interna, en secciones (sueltas o de un grupo). */
  private readonly sections = computed(() => mimiListSections(this.items(), this.listId));
  private readonly rows = computed(() => this.sections().flatMap((section) => section.rows));

  /** Texto del buscador. */
  protected readonly query = signal('');

  /** Lo que se pinta: nada mientras carga, y solo las coincidencias al buscar. */
  protected readonly visibleSections = computed(() => {
    if (this.loading()) return [];
    const query = this.search() ? this.query() : '';
    if (!query || this.searchMode() === 'server') return this.sections();
    // Sin `filterWith`, el de option-list: la etiqueta contiene lo escrito, sin tildes.
    return mimiFilterSections(this.sections(), query, this.filterWith() as MimiListFilter);
  });

  /** La plantilla `mimiSelectOption` para la lista (en la lista, `trigger` es `false`). */
  protected readonly listTemplate = computed(
    () => (this.optionTemplate()?.templateRef ?? null) as TemplateRef<MimiListOptionContext> | null,
  );
  protected readonly count = computed(() =>
    this.visibleSections().reduce((count, section) => count + section.rows.length, 0),
  );

  private matches(option: MimiOption, value: T | null): boolean {
    return value != null && this.compare()(option.value as T, value);
  }

  /** Rodeo: aria compara por identidad, así que cada opción lleva una clave interna. */
  protected readonly selectedKey = computed(() => {
    const value = this.value();
    return this.rows().find((row) => this.matches(row.option, value))?.key ?? null;
  });
  /** Lo que pinta la lista (el check y `aria-selected`): la clave elegida, si la hay. */
  protected readonly selectedKeys = computed(() => {
    const key = this.selectedKey();
    return key === null ? [] : [key];
  });

  /**
   * La opción elegida. Si deja de estar en `options` (búsqueda en el servidor), se conserva la
   * última para seguir mostrando su texto.
   */
  protected readonly selectedOption = linkedSignal<
    { value: T | null; rows: MimiListRow[] },
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
    () =>
      this.clearable() && !this.disabled() && !this.readonly() && this.selectedOption() !== null,
  );

  /** Qué icono ocupa el sitio del chevron. */
  protected readonly endIcon = computed(() =>
    this.loading() ? 'loading' : this.showClear() ? 'clear' : 'chevron',
  );

  /** Abierto (aria-expanded). */
  protected readonly open = signal(false);
  /** El panel está en el DOM (también mientras dura la animación de salida). */
  protected readonly rendered = signal(false);
  /** Estado ya pintado: cambia después de `open`, en el siguiente ciclo. */
  protected readonly state = signal<'open' | 'closed'>('closed');
  protected readonly placedSide = linkedSignal<MimiOverlaySide>(() => this.side());
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

  /**
   * Devuelve el foco al disparador con el origen de la última interacción (ratón o teclado): así
   * el anillo solo sale si se usó el teclado.
   */
  private refocus(options?: FocusOptions): void {
    const origin = this.modality.mostRecentModality === 'keyboard' ? 'keyboard' : 'mouse';
    this.focusMonitor.focusVia(this.trigger().nativeElement, origin, options);
  }

  /** Abre o cierra. Lo llama aria (clic, ↓, Enter, Espacio, Escape, foco fuera) y Mimi. */
  protected setOpen(open: boolean): void {
    if (open && (this.disabled() || this.readonly())) return;
    this.open.set(open);
  }

  /**
   * aria abre y cierra con el disparador. Con la hoja abierta, el foco pasa a ella y aria cierra
   * («foco fuera»): eso no cuenta; la hoja se cierra con lo suyo (R.34).
   */
  protected onExpandedChange(open: boolean): void {
    if (!open && this.sheetOpen()) return;
    this.setOpen(open);
  }

  /** Cierra y, con `refocus`, devuelve el foco al disparador (al elegir o con Escape). */
  private close(refocus: boolean): void {
    if (refocus) this.refocus();
    this.open.set(false);
  }

  private show(): void {
    this.closing++;
    const trigger = this.trigger().nativeElement;
    this.boxWidth.set(this.box().nativeElement.getBoundingClientRect().width || null);
    this.panelLabel.set(
      this.ariaLabel() || trigger.labels?.[0]?.textContent?.trim() || this.placeholder(),
    );
    if (!this.rendered()) {
      this.mode.set(
        mimiResolvePresentation(
          this.presentation(),
          'sheet',
          this.overlayConfig,
          this.document.defaultView,
        ),
      );
    }
    this.state.set('open');
    // En la hoja, la abre y la cierra `mimiSheet`; el foco va adentro y vuelve solo (cdk).
    if (this.mode() !== 'popover') return;
    this.rendered.set(true);
    // Safari no enfoca un botón al hacer clic: sin foco no habría teclado.
    if (!this.search()) this.refocus({ preventScroll: true });
  }

  private hide(): void {
    if (!this.rendered()) {
      this.state.set('closed');
      return;
    }
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

  /**
   * La hoja se fue (después de su salida; el cdk ya devolvió el foco al disparador): la búsqueda
   * vuelve a vacío, como al desmontar el panel. Con el dedo o el ratón, sin el anillo del foco.
   */
  protected onSheetDetach(): void {
    if (this.query()) {
      this.query.set('');
      this.searchChange.emit('');
    }
    if (this.modality.mostRecentModality !== 'keyboard') this.focusVisible.set(false);
    if (this.open() && this.mode() !== 'popover') this.open.set(false);
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
    this.refocus();
  }

  /**
   * Teclas del disparador que aria no cubre. aria ya atendió la tecla cuando esto corre; `state`
   * todavía es «closed» si esa misma tecla acaba de abrir.
   */
  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled() || event.ctrlKey || event.metaKey) return;
    const { key, altKey } = event;
    if (this.state() !== 'open') {
      // Supr o Retroceso en el disparador quitan el valor, si se puede limpiar.
      if ((key === 'Delete' || key === 'Backspace') && this.showClear()) {
        event.preventDefault();
        this.clear();
        return;
      }
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
      // El panel está fuera del orden del documento: el Tab sigue desde el disparador. En la
      // hoja no: el foco queda atrapado en ella (R.34).
      if (!this.sheetOpen()) this.close(true);
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
    this.list()?.gotoFirst();
  }

  /** Un clic en el panel no mueve el foco (salvo al buscador): si no, aria cerraría. */
  protected onPanelMousedown(event: MouseEvent): void {
    if (event.target !== this.searchInput()?.nativeElement) event.preventDefault();
  }

  /** El foco salió del Select entero (disparador, limpiar y panel). */
  protected onFocusOut(event: FocusEvent): void {
    // Al abrir la hoja el foco pasa a ella: el Select no se toca hasta que se va después.
    if (this.sheetOpen()) return;
    const next = event.relatedTarget as Node | null;
    if (next && (this.host.contains(next) || this.panel()?.nativeElement.contains(next))) return;
    this.touch.emit();
  }
}

/** Todas las piezas de Select, para importarlas juntas. */
export const MimiSelectImports = [
  MimiSelect,
  MimiSelectOption,
  MimiSelectHighlight,
  MimiOptionItem,
  MimiOptgroup,
] as const;
