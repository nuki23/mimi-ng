import { Combobox, ComboboxPopup } from '@angular/aria/combobox';
import { FocusMonitor, InputModalityDetector } from '@angular/cdk/a11y';
import { CdkConnectedOverlay, type ConnectedOverlayPositionChange } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  TemplateRef,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChild,
  contentChildren,
  effect,
  inject,
  input,
  isDevMode,
  linkedSignal,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { MimiChip, injectMimiChipAnnouncer } from '@/components/ui/chip';
import {
  MIMI_LIST_CREATE_KEY,
  type MimiListFilter,
  type MimiListOption,
  type MimiListOptionContext,
  type MimiListOptionGroup,
  type MimiListRow,
  MimiOptgroup,
  MimiOptionItem,
  MimiOptionList,
  type MimiCompareWith,
  type MimiSearchMode,
  mimiCompareFn,
  mimiDeclaredOptions,
  mimiFilterSections,
  mimiListSections,
  mimiNormalizeText,
} from '@/components/ui/option-list/option-list';
import { cn } from '@/components/ui/utils/cn';
import { buttonFocusStyles } from '@/components/ui/utils/control-styles';
import { fieldBoxStyles } from '@/components/ui/utils/field-styles';
import { MimiSized } from '@/components/ui/utils/size';
import {
  MIMI_FIELD_CONTROL,
  type MimiFieldControl,
  injectFieldState,
} from '@/components/ui/utils/field-state';
import {
  MIMI_OVERLAY_ANIMATION,
  MIMI_VIEWPORT_MARGIN,
  type MimiOverlayAlign,
  type MimiOverlaySide,
  mimiConnectedPositions,
  mimiPlacedSide,
  mimiWaitForExit,
} from '@/components/ui/utils/overlay';
import { MIMI_COMBOBOX_TEXT } from './combobox-texts';

/*
 * Combobox / Autocomplete (docs/design/Mimi F3 Combobox Fechas Hora.dc.html, «1 · Combobox /
 * Autocomplete»; prefijo de tokens `combobox`, spec 13). Un campo donde se escribe para filtrar
 * una lista y elegir; con `creatable`, crear un valor nuevo; con `loading` y `(searchChange)`,
 * buscar en el servidor.
 *
 * Por dentro: @angular/aria (Combobox sobre el <input> + Listbox, del ítem `option-list`) da los
 * roles, aria-activedescendant y las flechas; @angular/cdk/overlay posiciona el panel. Nada de
 * aria ni del CDK sale en la API pública. Los rodeos son los del Select (spec 4, «Rodeos de aria»).
 */

/** Distancia entre el campo y el panel (diseño: 2px). */
const OFFSET = 2;

let nextId = 0;

const CLEAR_CLASSES = cn(
  'relative z-10 inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground',
  // Al hacer clic se hunde la caja entera (field-styles, profundidad B), no la X aparte.
  'mimi-transition hover:bg-accent hover:text-foreground',
  buttonFocusStyles,
  // La X solo se ve con el ratón encima, el foco que llegó por teclado o el panel abierto; en
  // pantallas sin ratón, mientras haya valor (como en Select, 13/11/2026). Si no, el chevron.
  'hidden group-hover/combobox:inline-flex group-data-[focus-keyboard]/combobox:inline-flex group-data-[state=open]/combobox:inline-flex [@media(hover:none)]:inline-flex',
);
const CHEVRON_CLASSES =
  'size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-[cubic-bezier(.2,.8,.2,1)] group-data-[state=open]/combobox:rotate-180';
/** El chevron cuando hay X: se esconde cuando la X se ve. */
const CHEVRON_WITH_CLEAR_CLASSES = cn(
  CHEVRON_CLASSES,
  'group-hover/combobox:hidden group-data-[focus-keyboard]/combobox:hidden group-data-[state=open]/combobox:hidden [@media(hover:none)]:hidden',
);

const ICON = {
  viewBox: '0 0 24 24',
  chevron: 'm6 9 6 6 6-6',
  spinner: 'M21 12a9 9 0 1 1-6.219-8.56',
} as const;

const BOX_CLASSES = cn(
  'group/combobox relative flex w-full min-w-0 cursor-text items-center pr-2.5 font-sans text-sm text-foreground mimi-transition',
  'rounded-[var(--mimi-combobox-radius,var(--mimi-radius,0.75rem))]',
  // Los estados de todos los campos (utils/field-styles): el foco está en el <input> de dentro.
  fieldBoxStyles,
);

/** Simple: el alto de los controles. Múltiple: la caja de Tags Input, que crece con los chips. */
const BOX_MODE_CLASSES = {
  single:
    'h-[var(--mimi-combobox-height,var(--mimi-size-height,var(--mimi-control-height,2.5rem)))] gap-2 pl-3',
  multiple:
    'min-h-[var(--mimi-combobox-height,var(--mimi-size-height,var(--mimi-control-height,2.5rem)))] flex-wrap gap-1.5 py-[5px] pl-1.5 in-data-[size=sm]:py-[3px]',
} as const;

const INPUT_BASE =
  'min-w-0 flex-1 border-0 bg-transparent font-sans text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed';
const INPUT_MODE_CLASSES = {
  single: cn(INPUT_BASE, 'h-full p-0'),
  // El alto del campo sigue al del chip (la escala del tema), para que la caja no crezca en `sm`.
  multiple: cn(INPUT_BASE, 'h-[var(--mimi-chip-h,var(--mimi-chip-height,26px))] min-w-20 px-1'),
} as const;

const PANEL_CLASSES =
  'w-full overflow-hidden rounded-[var(--mimi-combobox-radius,var(--mimi-radius,0.75rem))] border border-border bg-[color:var(--mimi-combobox-menu-bg,var(--mimi-popover))] font-sans text-sm text-popover-foreground shadow-[shadow:var(--mimi-combobox-menu-shadow,var(--mimi-shadow-popover))] outline-none';

const LIST_CLASSES = 'max-h-[var(--mimi-combobox-menu-max-height,228px)]';

const OPTION_CLASSES = cn(
  'flex min-h-[var(--mimi-combobox-option-height,34px)] shrink-0 cursor-pointer items-center gap-2 px-2 text-sm select-none',
  'rounded-[var(--mimi-combobox-option-radius,var(--mimi-radius-sm))]',
  'transition-[background-color] duration-120 ease-[ease] active:scale-(--mimi-press-scale)',
  'data-[active=true]:bg-[color:var(--mimi-combobox-option-hover,var(--mimi-accent))]',
  'aria-disabled:cursor-not-allowed aria-disabled:opacity-[var(--mimi-disabled-opacity,0.5)] aria-disabled:active:scale-100',
);
/** En el múltiple, la casilla va a 10px del texto (diseño). */
const OPTION_MULTIPLE_CLASSES = cn(OPTION_CLASSES, 'gap-2.5');

/**
 * Ícono o texto al principio del campo (el pin del diseño):
 * `<svg mimiComboboxStart lucideMapPin />`.
 */
@Directive({
  selector: '[mimiComboboxStart]',
  host: { 'data-slot': 'start', '[class]': 'classes()', 'aria-hidden': 'true' },
})
export class MimiComboboxStart {
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn('inline-flex size-4 shrink-0 items-center text-muted-foreground', this.userClass()),
  );
}

/**
 * Contenido propio de cada opción de la lista:
 *
 * ```html
 * <ng-template mimiComboboxOption let-option let-query="query">
 *   <mimi-highlight [text]="option.label" [query]="query" />
 * </ng-template>
 * ```
 */
@Directive({ selector: 'ng-template[mimiComboboxOption]' })
export class MimiComboboxOption {
  readonly templateRef = inject<TemplateRef<MimiListOptionContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _directive: MimiComboboxOption,
    context: unknown,
  ): context is MimiListOptionContext {
    return true;
  }
}

/**
 * Combobox: se escribe para filtrar y se elige una opción.
 *
 * ```html
 * <mimi-combobox aria-label="Ciudad" [(value)]="ciudad" creatable (create)="agregar($event)">
 *   @for (c of ciudades(); track c.id) {
 *     <mimi-option [value]="c.id">{{ c.nombre }}</mimi-option>
 *   }
 * </mimi-combobox>
 * ```
 *
 * Para una lista armada por código, `[options]` es la alternativa (gana sobre las `<mimi-option>`).
 *
 * Implementa `FormValueControl`: funciona con `[formField]`, `formControlName` y `[(ngModel)]`
 * sin adaptador (spec 8). Lo escrito no es el valor hasta que se elige o se crea una opción.
 * `class` va a la caja del campo y `panelClass` al panel.
 */
@Component({
  selector: 'mimi-combobox',
  hostDirectives: [{ directive: MimiSized, inputs: ['size'] }],
  imports: [Combobox, ComboboxPopup, CdkConnectedOverlay, MimiOptionList, MimiChip],
  providers: [{ provide: MIMI_FIELD_CONTROL, useExisting: MimiCombobox }],
  template: `
    <div
      #box
      data-slot="box"
      [class]="classes()"
      [attr.data-state]="open() ? 'open' : 'closed'"
      [attr.data-invalid]="showInvalid() ? '' : null"
      [attr.data-disabled]="disabled() ? '' : null"
      [attr.data-readonly]="readonly() ? '' : null"
      [attr.data-focus-keyboard]="focusKeyboard() ? '' : null"
      (mousedown)="onBoxMousedown($event)"
    >
      <ng-content select="[mimiComboboxStart]" />
      @if (multiple()) {
        @for (chip of shownChips(); track $index) {
          <mimi-chip
            [label]="chip.label"
            [removable]="!disabled() && !readonly()"
            (remove)="removeAt($index)"
            >{{ chip.label }}</mimi-chip
          >
        }
        @if (hiddenCount(); as count) {
          <span data-slot="more" class="px-0.5 text-xs text-muted-foreground">{{
            texts.more(count)
          }}</span>
        }
      }
      <!-- preserveContent: el panel sigue montado mientras dura la animación de salida. -->
      <input
        #field
        #combobox="ngCombobox"
        ngCombobox
        type="text"
        autocomplete="off"
        [id]="controlId()"
        [class]="inputClasses()"
        [value]="draft()"
        [readOnly]="readonly()"
        [expanded]="open()"
        [disabled]="disabled()"
        [softDisabled]="false"
        [preserveContent]="true"
        [attr.placeholder]="(chips().length ? '' : placeholder()) || null"
        [attr.aria-invalid]="showInvalid() || null"
        [attr.aria-required]="required() || null"
        [readonly]="readonly()"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-labelledby]="ariaLabelledby() || null"
        [attr.aria-describedby]="help() ? helpId : null"
        (valueChange)="onText($event)"
        (expandedChange)="setOpen($event)"
        (keydown)="onKeydown($event)"
        (click)="setOpen(true)"
      />
      <!-- Un solo icono al final, en el sitio del chevron: cargando > limpiar > chevron. -->
      <span
        data-slot="end-icon"
        class="relative z-10 inline-flex size-6 shrink-0 items-center justify-center"
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
              [attr.aria-label]="texts.clear ?? 'Clear'"
              (click)="clearAll()"
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
    @if (help(); as help) {
      <span data-slot="help" class="text-xs text-muted-foreground" [id]="helpId">{{ help }}</span>
    }

    <!-- El popup de aria va por fuera del overlay: así el campo tiene aria-haspopup cerrado. -->
    <ng-template ngComboboxPopup [combobox]="combobox" popupType="listbox">
      <ng-template
        cdkConnectedOverlay
        [cdkConnectedOverlayOrigin]="box"
        [cdkConnectedOverlayOpen]="rendered()"
        [cdkConnectedOverlayPositions]="positions()"
        [cdkConnectedOverlayViewportMargin]="viewportMargin"
        [cdkConnectedOverlayDisableClose]="true"
        [cdkConnectedOverlayMatchWidth]="true"
        cdkConnectedOverlayUsePopover="inline"
        cdkConnectedOverlayTransformOriginOn="[data-mimi-overlay-panel]"
        (detach)="onDetach()"
        (overlayOutsideClick)="onOutsideClick($event)"
        (positionChange)="onPositionChange($event)"
      >
        <div
          #panel
          data-mimi-overlay-panel
          [class]="panelClasses()"
          [attr.data-state]="state()"
          [attr.data-side]="placedSide()"
          [attr.inert]="state() === 'closed' ? '' : null"
          (mousedown)="$event.preventDefault()"
        >
          <mimi-option-list
            [sections]="visibleSections()"
            [selectedKeys]="selectedKeys()"
            [query]="query()"
            [loading]="loading()"
            [loadingText]="texts.loading"
            [emptyTitle]="emptyTitle()"
            [emptyText]="query() ? texts.noResultsHint : ''"
            [status]="status()"
            [createLabel]="createLabel()"
            [optionTemplate]="optionTemplate()?.templateRef ?? null"
            [listId]="listId"
            [label]="panelLabel()"
            [listClass]="listClasses"
            [optionClass]="multiple() ? optionMultipleClasses : optionClasses"
            [multi]="multiple()"
            (pick)="pick($event)"
          />
        </div>
      </ng-template>
    </ng-template>
  `,
  styles: MIMI_OVERLAY_ANIMATION,
  host: {
    class: 'flex w-full min-w-0 flex-col gap-1.5',
    // El class es de la caja; id y aria-* pasan al <input>: fuera del anfitrión.
    '[attr.class]': 'null',
    '[attr.id]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    // `align` es un atributo HTML antiguo: el navegador lo convierte en text-align (se heredaría).
    '[attr.align]': 'null',
    '(focusin)': 'focused.set(true)',
    '(focusout)': 'onFocusOut($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiCombobox<T = unknown>
  implements FormValueControl<T | null | T[]>, MimiFieldControl
{
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  protected readonly texts = inject(MIMI_COMBOBOX_TEXT);
  private readonly announce = injectMimiChipAnnouncer();

  /** Opciones sueltas o en grupos (`{ label, options }`), con la forma de las de Select. */
  readonly options = input<readonly (MimiListOption<T> | MimiListOptionGroup<T>)[]>([]);
  /**
   * La opción elegida (`T | null`) o, con `multiple`, las elegidas (`T[]`), en el orden en que se
   * eligieron. Con `[(value)]` o un formulario.
   */
  readonly value = model<T | null | T[]>(null);
  /** Varias opciones, como chips en el campo (spec 8, «Valor simple o múltiple»). */
  readonly multiple = input(false, { transform: booleanAttribute });
  /**
   * Ayuda debajo del campo, en el múltiple. Por defecto, la de los textos («Enter agrega ·
   * Backspace quita el último»); vacía, sin ayuda.
   */
  readonly hint = input<string | undefined>(undefined);
  /**
   * Compara el valor con el de cada opción (para objetos): una función o el nombre de un campo
   * (`compareWith="id"`). Por defecto, `Object.is`.
   */
  readonly compareWith = input<MimiCompareWith<T>>(Object.is);
  private readonly compare = computed(() => mimiCompareFn(this.compareWith()));
  /** Filtro propio. Por defecto: la etiqueta contiene lo escrito, sin tildes ni mayúsculas. */
  readonly filterWith = input<MimiListFilter<T>>();
  /**
   * Dónde se filtra: `'client'` (aquí, con `filterWith` o el predeterminado) o `'server'` (la app
   * filtra al recibir `(searchChange)` y el Combobox muestra lo que llega, sin volver a filtrar).
   */
  readonly searchMode = input<MimiSearchMode>('client');
  /**
   * Ofrece «Crear "<texto>"» cuando lo escrito no coincide con ninguna opción. Al elegirla se
   * emite `(create)`: la opción la agrega la app a `options`, y el Combobox la elige en cuanto
   * aparece.
   */
  readonly creatable = input(false, { transform: booleanAttribute });
  /** Cargando: spinner en el campo y, en el panel, el estado de carga en vez de la lista. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Botón para quitar el valor (en el múltiple, todos), en el sitio del chevron. */
  readonly clearable = input(false, { transform: booleanAttribute });
  readonly placeholder = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Solo lectura (R.12): el valor se ve y se puede enfocar, pero no cambia ni abre el panel. */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Los pasa el formulario. Se muestra el error si es inválido y se tocó o modificó. */
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly touched = input(false, { transform: booleanAttribute });
  readonly dirty = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  /** id del <input>, para una etiqueta externa (`<label for>`). */
  readonly id = input<string>();
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string>(undefined, { alias: 'aria-labelledby' });
  /** Clases de la caja del campo, mezcladas con `cn()` (gana la del usuario). */
  readonly userClass = input('', { alias: 'class' });
  /** Clases del panel. */
  readonly panelClass = input('');
  /** Lado preferido del panel (como Popover). Si no cabe, pasa al opuesto. */
  readonly side = input<MimiOverlaySide>('bottom');
  /** Alineación del panel con el campo (como Popover). */
  readonly align = input<MimiOverlayAlign>('start');

  /** Se emite cuando el foco sale del Combobox (campo y panel): marca el control como tocado. */
  readonly touch = output<void>();
  /** Lo que se escribe, para buscar en el servidor. Al vaciar el campo se emite vacío. */
  readonly searchChange = output<string>();
  /** Se eligió «Crear "<texto>"»: el texto (sin espacios a los lados). */
  readonly create = output<string>();

  protected readonly optionTemplate = contentChild(MimiComboboxOption);
  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');
  private readonly box = viewChild.required<ElementRef<HTMLElement>>('box');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly list = viewChild(MimiOptionList);

  private readonly focusMonitor = inject(FocusMonitor);
  private readonly modality = inject(InputModalityDetector);
  /**
   * El foco está en la caja (el input o la X) y llegó con el teclado: muestra la X (13/11/2026).
   * Con el ratón o el dedo se borra, aunque el foco no salga (al elegir una opción con el ratón).
   */
  protected readonly focusKeyboard = signal(false);
  private readonly watchFocus = afterNextRender(() => {
    const box = this.box().nativeElement;
    const destroyRef = this.injector.get(DestroyRef);
    const focus = this.focusMonitor
      .monitor(box, true)
      .subscribe((origin) =>
        this.focusKeyboard.set(
          origin === 'keyboard' ||
            (origin === 'program' && this.modality.mostRecentModality === 'keyboard'),
        ),
      );
    const modality = this.modality.modalityDetected.subscribe((m) => {
      if (m !== 'keyboard') this.focusKeyboard.set(false);
    });
    destroyRef.onDestroy(() => {
      focus.unsubscribe();
      modality.unsubscribe();
      this.focusMonitor.stopMonitoring(box);
    });
  });

  /** Estado del formulario, con los errores, para el mensaje de mimi-form-field. */
  readonly fieldState = injectFieldState();

  /** El <input>: mimi-form-field le agrega el aria-describedby del mensaje. */
  get controlElement(): HTMLElement {
    return this.field().nativeElement;
  }

  private readonly baseId = `mimi-combobox-${nextId++}`;
  protected readonly listId = `${this.baseId}-list`;
  protected readonly helpId = `${this.baseId}-help`;
  protected readonly controlId = computed(() => this.id() || this.baseId);
  /** Error visible (inválido y tocado o modificado). Lo lee también mimi-form-field. */
  readonly showInvalid = computed(() => this.invalid() && (this.touched() || this.dirty()));

  protected readonly icon = ICON;
  protected readonly clearClasses = CLEAR_CLASSES;
  protected readonly chevronClasses = CHEVRON_CLASSES;
  protected readonly chevronWithClearClasses = CHEVRON_WITH_CLEAR_CLASSES;
  private readonly declared = contentChildren(MimiOptionItem, { descendants: true });
  /** `[options]` si se dio; si no, las `<mimi-option>` (como en Select). */
  private readonly items = computed<readonly (MimiListOption<T> | MimiListOptionGroup<T>)[]>(() => {
    const given = this.options();
    return given.length > 0 ? given : mimiDeclaredOptions<T>(this.declared());
  });
  private readonly hasValue = computed(() => {
    const value = this.value();
    return Array.isArray(value) ? value.length > 0 : value != null;
  });
  /** Qué icono ocupa el sitio del chevron. */
  protected readonly endIcon = computed(() =>
    this.loading()
      ? 'loading'
      : this.clearable() && this.hasValue() && !this.disabled() && !this.readonly()
        ? 'clear'
        : 'chevron',
  );
  protected readonly listClasses = LIST_CLASSES;
  protected readonly optionClasses = OPTION_CLASSES;
  protected readonly optionMultipleClasses = OPTION_MULTIPLE_CLASSES;
  protected readonly viewportMargin = MIMI_VIEWPORT_MARGIN;
  protected readonly positions = computed(() =>
    mimiConnectedPositions(this.side(), this.align(), OFFSET).slice(0, 6),
  );
  private readonly mode = computed(() => (this.multiple() ? 'multiple' : 'single'));
  protected readonly classes = computed(() =>
    cn(BOX_CLASSES, BOX_MODE_CLASSES[this.mode()], this.userClass()),
  );
  protected readonly inputClasses = computed(() => INPUT_MODE_CLASSES[this.mode()]);
  /** Ayuda debajo del campo (solo en el múltiple). */
  protected readonly help = computed(() =>
    this.multiple() ? (this.hint() ?? this.texts.help) : '',
  );
  protected readonly panelClasses = computed(() => cn(PANEL_CLASSES, this.panelClass()));

  private readonly sections = computed(() => mimiListSections<T>(this.items(), this.listId));
  private readonly rows = computed(() => this.sections().flatMap((section) => section.rows));

  /** El texto del campo. */
  protected readonly draft = signal('');
  /** Se escribió desde que se eligió por última vez: solo entonces se filtra. */
  private readonly typed = signal(false);
  /** Lo escrito que filtra la lista (vacío si el texto es el de la opción elegida). */
  protected readonly query = computed(() => (this.typed() ? this.draft() : ''));
  /** Texto de una opción creada que todavía no llegó a `options`. */
  private readonly pendingCreate = signal<string | null>(null);

  protected readonly visibleSections = computed(() => {
    if (this.loading()) return [];
    if (this.searchMode() === 'server') return this.sections();
    return mimiFilterSections(this.sections(), this.query(), this.filterWith());
  });
  private readonly count = computed(() =>
    this.visibleSections().reduce((count, section) => count + section.rows.length, 0),
  );

  private matches(option: MimiListOption<T>, value: T | null | undefined): boolean {
    return value != null && this.compare()(option.value, value);
  }

  /** Los valores elegidos como arreglo: uno (o ninguno) en simple, todos en el múltiple. */
  private readonly values = computed<T[]>(() => {
    const value = this.value();
    if (this.multiple()) return Array.isArray(value) ? value : [];
    return value == null || Array.isArray(value) ? [] : [value];
  });

  /** Rodeo: aria compara por identidad, así que cada opción lleva una clave interna. */
  protected readonly selectedKeys = computed(() => {
    const rows = this.rows();
    return this.values().flatMap((value) => {
      const key = rows.find((row) => this.matches(row.option, value))?.key;
      return key === undefined ? [] : [key];
    });
  });

  /**
   * Las opciones elegidas, en el orden del valor. Si una deja de estar en `options` (búsqueda en
   * el servidor), se conserva la última conocida para seguir mostrando su texto.
   */
  protected readonly chips = linkedSignal<
    { values: T[]; rows: MimiListRow<T>[] },
    MimiListOption<T>[]
  >({
    source: () => ({ values: this.values(), rows: this.rows() }),
    computation: ({ values, rows }, previous) =>
      values.flatMap((value) => {
        const found =
          rows.find((row) => this.matches(row.option, value))?.option ??
          previous?.value.find((option) => this.matches(option, value));
        return found ? [found] : [];
      }),
  });
  /** La opción elegida en simple. */
  private readonly selectedOption = computed(() =>
    this.multiple() ? null : (this.chips()[0] ?? null),
  );

  /** El foco está dentro del Combobox (campo, chips o panel). */
  protected readonly focused = signal(false);
  /** Cerrado y sin foco, el múltiple muestra el primer chip y «+N» (diseño). */
  private readonly collapsed = computed(
    () => this.multiple() && !this.focused() && !this.open() && this.chips().length > 1,
  );
  protected readonly shownChips = computed(() =>
    this.collapsed() ? this.chips().slice(0, 1) : this.chips(),
  );
  protected readonly hiddenCount = computed(() => (this.collapsed() ? this.chips().length - 1 : 0));

  /** Texto de la fila «Crear», o null. */
  protected readonly createLabel = computed(() => {
    if (!this.creatable() || this.loading()) return null;
    const typed = this.query().trim();
    if (!typed) return null;
    const normalized = mimiNormalizeText(typed);
    const exists = this.rows().some((row) => mimiNormalizeText(row.option.label) === normalized);
    return exists ? null : this.texts.create(typed);
  });

  protected readonly emptyTitle = computed(() => {
    const query = this.query().trim();
    return query ? this.texts.noResults(query) : this.texts.noOptions;
  });
  /** Anuncio de la cantidad de resultados mientras se escribe. */
  protected readonly status = computed(() =>
    this.open() && this.query() && !this.loading() && this.count() > 0
      ? this.texts.results(this.count())
      : '',
  );

  /** Abierto (aria-expanded). */
  protected readonly open = signal(false);
  /** El panel está en el DOM (también mientras dura la animación de salida). */
  protected readonly rendered = signal(false);
  /** Estado ya pintado: cambia después de `open`, en el siguiente ciclo. */
  protected readonly state = signal<'open' | 'closed'>('closed');
  protected readonly placedSide = linkedSignal<MimiOverlaySide>(() => this.side());
  /** Nombre de la lista: el del campo. */
  protected readonly panelLabel = signal('');

  /** Cuenta los cierres: si se vuelve a abrir durante la animación de salida, no se desmonta. */
  private closing = 0;

  private readonly syncOpen = effect(() => {
    const open = this.open();
    untracked(() => (open ? this.show() : this.hide()));
  });

  private readonly closeWhenDisabled = effect(() => {
    if (this.disabled()) untracked(() => this.open.set(false));
  });

  /** En simple, el texto del campo sigue a la opción elegida, salvo mientras se escribe. */
  private readonly syncText = effect(() => {
    if (this.multiple()) return;
    const label = this.selectedOption()?.label ?? '';
    untracked(() => {
      if (!this.typed()) this.draft.set(label);
    });
  });

  /** Elige (o, en el múltiple, agrega) la opción creada en cuanto la app la agrega a `options`. */
  private readonly pickCreated = effect(() => {
    const created = this.pendingCreate();
    if (created === null) return;
    const normalized = mimiNormalizeText(created);
    const row = this.rows().find((r) => mimiNormalizeText(r.option.label) === normalized);
    if (!row) return;
    untracked(() => {
      this.pendingCreate.set(null);
      if (!this.multiple()) this.choose(row.option);
      else if (!this.values().some((v) => this.matches(row.option, v))) this.toggle(row.option);
    });
  });

  /** En desarrollo, avisa si `value` no tiene la forma del modo (spec 8). */
  private warned = false;
  private readonly warnShape = isDevMode()
    ? afterRenderEffect({
        read: () => {
          const value = this.value();
          const multiple = this.multiple();
          if (this.warned) return;
          const problem =
            multiple && value != null && !Array.isArray(value)
              ? 'con multiple, value tiene que ser un arreglo'
              : !multiple && Array.isArray(value)
                ? 'sin multiple, value no puede ser un arreglo'
                : null;
          if (!problem) return;
          this.warned = true;
          console.warn(`[Mimi] Combobox: ${problem}.`);
        },
      })
    : null;

  /**
   * La lista se crea al abrir, después de la primera letra: si se abrió escribiendo, activa la
   * primera coincidencia en cuanto existe (al escribir con la lista ya abierta, lo hace `onText`).
   */
  private readonly firstOnOpen = effect(() => {
    const list = this.list();
    if (list && untracked(this.typed)) list.gotoFirst();
  });

  /** Enfoca el campo. Lo usa Signal Forms para llevar el foco al campo con error. */
  focus(options?: FocusOptions): void {
    this.field().nativeElement.focus(options);
  }

  /** Abre o cierra. Lo llama aria (↓, escribir, Escape, foco fuera) y Mimi (clic, Alt+↓/↑). */
  protected setOpen(open: boolean): void {
    if (open && (this.disabled() || this.readonly())) return;
    this.open.set(open);
  }

  private show(): void {
    this.closing++;
    const field = this.field().nativeElement;
    this.panelLabel.set(
      this.ariaLabel() || field.labels?.[0]?.textContent?.trim() || this.placeholder(),
    );
    this.state.set('open');
    this.rendered.set(true);
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

  /** Un clic fuera cierra; en el propio campo no (lo maneja el campo). */
  protected onOutsideClick(event: MouseEvent): void {
    if (this.host.contains(event.target as Node)) return;
    this.setOpen(false);
  }

  protected onPositionChange({ connectionPair }: ConnectedOverlayPositionChange): void {
    this.placedSide.set(mimiPlacedSide(connectionPair));
  }

  /** Un clic en la caja (fuera del <input>) enfoca el campo y abre o cierra. */
  protected onBoxMousedown(event: MouseEvent): void {
    const field = this.field().nativeElement;
    // El botón de quitar de un chip hace lo suyo (y lleva el foco al campo).
    const button = (event.target as Element).closest('button');
    if (event.target === field || button || this.disabled()) return;
    event.preventDefault();
    field.focus();
    this.setOpen(!this.open());
  }

  protected onText(text: string): void {
    if (this.readonly() || text === this.draft()) return;
    this.draft.set(text);
    this.typed.set(true);
    this.pendingCreate.set(null);
    this.searchChange.emit(text);
    // Como en el diseño: al escribir, la primera coincidencia habilitada queda activa.
    this.list()?.gotoFirst();
  }

  /** Elige la opción de esa clave (o «Crear») y cierra. */
  protected pick(key: string): void {
    if (key === MIMI_LIST_CREATE_KEY) {
      this.createFromText();
      return;
    }
    const option = this.rows().find((row) => row.key === key)?.option;
    if (!option || option.disabled) return;
    if (this.multiple()) this.toggle(option);
    else this.choose(option);
  }

  /** Simple: elige, pone su texto y cierra. */
  private choose(option: MimiListOption<T>): void {
    this.pendingCreate.set(null);
    this.typed.set(false);
    this.draft.set(option.label);
    this.value.set(option.value);
    this.setOpen(false);
  }

  /** Múltiple: agrega o quita la opción, sin cerrar; lo escrito se vacía para seguir buscando. */
  private toggle(option: MimiListOption<T>): void {
    const values = this.values();
    const selected = values.some((value) => this.matches(option, value));
    this.value.set(
      selected ? values.filter((value) => !this.matches(option, value)) : [...values, option.value],
    );
    if (selected) this.announce.removed(option.label);
    else this.announce.added(option.label);
    this.resetDraft();
  }

  /** Vacía lo escrito (y avisa a la búsqueda en el servidor). */
  private resetDraft(): void {
    this.typed.set(false);
    if (this.draft()) {
      this.draft.set('');
      this.searchChange.emit('');
    }
  }

  /** Quita el chip de esa posición. El foco va al campo antes (si no, caería a `body`). */
  removeAt(index: number): void {
    if (this.disabled()) return;
    const chip = this.chips()[index];
    if (!chip) return;
    this.field().nativeElement.focus();
    this.value.set(this.values().filter((value) => !this.matches(chip, value)));
    this.announce.removed(chip.label);
  }

  private createFromText(): void {
    const created = this.query().trim();
    if (!created) return;
    if (this.multiple()) this.resetDraft();
    else this.setOpen(false);
    this.pendingCreate.set(created);
    this.create.emit(created);
  }

  /** Elige la opción activa de la lista (Enter). */
  private pickActive(): boolean {
    const key = this.list()?.activeKey();
    if (key) this.pick(key);
    return !!key;
  }

  /**
   * Escape con el panel cerrado: vacía el campo y, en simple, quita el valor. En el múltiple los
   * chips se quedan (se quitan uno a uno).
   */
  protected clearAll(): void {
    this.pendingCreate.set(null);
    this.resetDraft();
    this.value.set(this.multiple() ? [] : null);
    this.field().nativeElement.focus();
  }

  private clear(): void {
    this.pendingCreate.set(null);
    this.resetDraft();
    if (!this.multiple()) this.value.set(null);
  }

  /**
   * Teclas que aria no cubre. aria ya atendió la tecla cuando esto corre (abrir con ↓, cerrar
   * con Escape, reenviar las flechas y Enter a la lista).
   */
  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabled() || event.isComposing || event.ctrlKey || event.metaKey) return;
    const { key, altKey } = event;
    // Con clearable, Supr o Retroceso quitan el valor si el campo muestra la opción elegida (no se
    // está escribiendo); en el múltiple, Supr con el campo vacío quita todos los chips.
    if (this.endIcon() === 'clear' && (key === 'Delete' || key === 'Backspace')) {
      const single = !this.multiple() && !this.typed();
      const all = this.multiple() && key === 'Delete' && !this.draft();
      if (single || all) {
        event.preventDefault();
        this.clearAll();
        return;
      }
    }
    // Múltiple: Backspace con el campo vacío quita el último chip (diseño).
    if (
      key === 'Backspace' &&
      this.multiple() &&
      !this.readonly() &&
      !this.draft() &&
      this.chips().length
    ) {
      event.preventDefault();
      this.removeAt(this.chips().length - 1);
      return;
    }
    // `state` todavía es «open» si esta misma tecla acaba de cerrar (Escape), y «closed» si
    // acaba de abrir (↓): es el estado de antes de la tecla.
    if (this.state() !== 'open') {
      if (key === 'ArrowUp' || (key === 'ArrowDown' && altKey)) {
        // Rodeo: aria solo abre con ↓ sin modificadores.
        event.preventDefault();
        this.setOpen(true);
      } else if (key === 'Escape' && !this.readonly() && (this.draft() || this.selectedOption())) {
        // Como la APG: Escape con el panel cerrado vacía el campo.
        event.preventDefault();
        this.clear();
      }
      return;
    }
    if (key === 'ArrowUp' && altKey) {
      event.preventDefault();
      this.setOpen(false);
    } else if (key === 'Enter') {
      // Con el panel abierto, Enter elige (no envía el formulario).
      event.preventDefault();
      this.pickActive();
    }
  }

  /** El foco salió del Combobox entero (campo y panel). */
  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && (this.host.contains(next) || this.panel()?.nativeElement.contains(next))) return;
    this.focused.set(false);
    this.commit();
    this.touch.emit();
  }

  /**
   * Al salir: lo escrito sin elegir se descarta. En simple, el campo vuelve al texto de la opción
   * elegida y, con el campo vacío, se quita el valor; en el múltiple, el campo queda vacío.
   */
  private commit(): void {
    if (!this.typed()) return;
    if (this.multiple()) {
      this.resetDraft();
      return;
    }
    if (!this.draft().trim()) this.value.set(null);
    this.typed.set(false);
    this.draft.set(this.selectedOption()?.label ?? '');
  }
}

/** Todas las piezas del Combobox, para importarlas juntas. */
export const MimiComboboxImports = [
  MimiCombobox,
  MimiComboboxStart,
  MimiComboboxOption,
  MimiOptionItem,
  MimiOptgroup,
] as const;
