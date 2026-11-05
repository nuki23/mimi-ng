import { Combobox, ComboboxPopup } from '@angular/aria/combobox';
import { CdkConnectedOverlay, type ConnectedOverlayPositionChange } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  Injector,
  TemplateRef,
  afterNextRender,
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
import {
  MIMI_LIST_CREATE_KEY,
  type MimiListFilter,
  type MimiListOption,
  type MimiListOptionContext,
  type MimiListOptionGroup,
  type MimiListRow,
  MimiOptionList,
  mimiFilterSections,
  mimiListSections,
  mimiNormalizeText,
} from '@/components/ui/option-list/option-list';
import { cn } from '@/components/ui/utils/cn';
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

const ICON = {
  viewBox: '0 0 24 24',
  chevron: 'm6 9 6 6 6-6',
  spinner: 'M21 12a9 9 0 1 1-6.219-8.56',
} as const;

const BOX_CLASSES = cn(
  'group/combobox relative flex w-full min-w-0 cursor-text items-center gap-2 pr-2.5 pl-3 font-sans text-sm text-foreground mimi-transition',
  'h-[var(--mimi-combobox-height,var(--mimi-control-height,2.5rem))] rounded-[var(--mimi-combobox-radius,var(--mimi-radius,0.75rem))]',
  // Los estados de Input (spec 13, «Campos»), como Tags Input: el foco está en el <input> de dentro.
  'border border-input bg-input-background',
  'not-data-[disabled]:hover:border-input-hover',
  'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring-soft',
  'data-[invalid]:border-destructive data-[invalid]:focus-within:border-destructive data-[invalid]:focus-within:ring-destructive-ring',
  'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-[var(--mimi-disabled-opacity,0.5)]',
);

const INPUT_CLASSES =
  'h-full min-w-0 flex-1 border-0 bg-transparent p-0 font-sans text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed';

const PANEL_CLASSES =
  'w-full overflow-hidden rounded-[var(--mimi-combobox-radius,var(--mimi-radius,0.75rem))] border border-border bg-[color:var(--mimi-combobox-menu-bg,var(--mimi-popover))] font-sans text-sm text-popover-foreground shadow-[shadow:var(--mimi-combobox-menu-shadow,var(--mimi-shadow-popover))] outline-none';

const LIST_CLASSES = 'max-h-[var(--mimi-combobox-menu-max-height,228px)]';

const OPTION_CLASSES = cn(
  'flex min-h-[var(--mimi-combobox-option-height,34px)] shrink-0 cursor-pointer items-center gap-2 px-2 text-sm select-none',
  'rounded-[var(--mimi-combobox-option-radius,var(--mimi-radius-sm))]',
  'transition-[background-color] duration-120 ease-[ease] active:scale-[0.985]',
  'data-[active=true]:bg-[color:var(--mimi-combobox-option-hover,var(--mimi-accent))]',
  'aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:active:scale-100',
);

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
 * <mimi-combobox aria-label="Ciudad" [(value)]="ciudad" [options]="ciudades" creatable
 *   (create)="agregar($event)" />
 * ```
 *
 * Implementa `FormValueControl`: funciona con `[formField]`, `formControlName` y `[(ngModel)]`
 * sin adaptador (spec 8). Lo escrito no es el valor hasta que se elige o se crea una opción.
 * `class` va a la caja del campo y `panelClass` al panel.
 */
@Component({
  selector: 'mimi-combobox',
  imports: [Combobox, ComboboxPopup, CdkConnectedOverlay, MimiOptionList],
  providers: [{ provide: MIMI_FIELD_CONTROL, useExisting: MimiCombobox }],
  template: `
    <div
      #box
      data-slot="box"
      [class]="classes()"
      [attr.data-state]="open() ? 'open' : 'closed'"
      [attr.data-invalid]="showInvalid() ? '' : null"
      [attr.data-disabled]="disabled() ? '' : null"
      (mousedown)="onBoxMousedown($event)"
    >
      <ng-content select="[mimiComboboxStart]" />
      <!-- preserveContent: el panel sigue montado mientras dura la animación de salida. -->
      <input
        #field
        #combobox="ngCombobox"
        ngCombobox
        type="text"
        autocomplete="off"
        [id]="controlId()"
        [class]="inputClasses"
        [value]="draft()"
        [expanded]="open()"
        [disabled]="disabled()"
        [softDisabled]="false"
        [preserveContent]="true"
        [attr.placeholder]="placeholder() || null"
        [attr.aria-invalid]="showInvalid() || null"
        [attr.aria-required]="required() || null"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-labelledby]="ariaLabelledby() || null"
        (valueChange)="onText($event)"
        (expandedChange)="setOpen($event)"
        (keydown)="onKeydown($event)"
        (click)="setOpen(true)"
      />
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
        data-slot="chevron"
        class="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-[cubic-bezier(.2,.8,.2,1)] group-data-[state=open]/combobox:rotate-180"
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
            [optionClass]="optionClasses"
            (pick)="pick($event)"
          />
        </div>
      </ng-template>
    </ng-template>
  `,
  styles: MIMI_OVERLAY_ANIMATION,
  host: {
    class: 'block w-full min-w-0',
    // El class es de la caja; id y aria-* pasan al <input>: fuera del anfitrión.
    '[attr.class]': 'null',
    '[attr.id]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    // `align` es un atributo HTML antiguo: el navegador lo convierte en text-align (se heredaría).
    '[attr.align]': 'null',
    '(focusout)': 'onFocusOut($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiCombobox<T = unknown> implements FormValueControl<T | null>, MimiFieldControl {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  protected readonly texts = inject(MIMI_COMBOBOX_TEXT);

  /** Opciones sueltas o en grupos (`{ label, options }`), con la forma de las de Select. */
  readonly options = input<readonly (MimiListOption<T> | MimiListOptionGroup<T>)[]>([]);
  /** Valor de la opción elegida, o `null`. Con `[(value)]` o un formulario. */
  readonly value = model<T | null>(null);
  /** Compara el valor con el de cada opción (para objetos). Por defecto, `Object.is`. */
  readonly compareWith = input<(a: T, b: T) => boolean>(Object.is);
  /** Filtro propio. Por defecto: la etiqueta contiene lo escrito, sin tildes ni mayúsculas. */
  readonly filterWith = input<MimiListFilter<T>>();
  /**
   * Ofrece «Crear "<texto>"» cuando lo escrito no coincide con ninguna opción. Al elegirla se
   * emite `(create)`: la opción la agrega la app a `options`, y el Combobox la elige en cuanto
   * aparece.
   */
  readonly creatable = input(false, { transform: booleanAttribute });
  /** Cargando: spinner en el campo y, en el panel, el estado de carga en vez de la lista. */
  readonly loading = input(false, { transform: booleanAttribute });
  readonly placeholder = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
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
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly list = viewChild(MimiOptionList);

  /** Estado del formulario, con los errores, para el mensaje de mimi-form-field. */
  readonly fieldState = injectFieldState();

  /** El <input>: mimi-form-field le agrega el aria-describedby del mensaje. */
  get controlElement(): HTMLElement {
    return this.field().nativeElement;
  }

  private readonly baseId = `mimi-combobox-${nextId++}`;
  protected readonly listId = `${this.baseId}-list`;
  protected readonly controlId = computed(() => this.id() || this.baseId);
  /** Error visible (inválido y tocado o modificado). Lo lee también mimi-form-field. */
  readonly showInvalid = computed(() => this.invalid() && (this.touched() || this.dirty()));

  protected readonly icon = ICON;
  protected readonly inputClasses = INPUT_CLASSES;
  protected readonly listClasses = LIST_CLASSES;
  protected readonly optionClasses = OPTION_CLASSES;
  protected readonly viewportMargin = MIMI_VIEWPORT_MARGIN;
  protected readonly positions = computed(() =>
    mimiConnectedPositions(this.side(), this.align(), OFFSET).slice(0, 6),
  );
  protected readonly classes = computed(() => cn(BOX_CLASSES, this.userClass()));
  protected readonly panelClasses = computed(() => cn(PANEL_CLASSES, this.panelClass()));

  private readonly sections = computed(() => mimiListSections<T>(this.options(), this.listId));
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
    return mimiFilterSections(this.sections(), this.query(), this.filterWith());
  });
  private readonly count = computed(() =>
    this.visibleSections().reduce((count, section) => count + section.rows.length, 0),
  );

  private matches(option: MimiListOption<T>, value: T | null): boolean {
    return value != null && this.compareWith()(option.value, value);
  }

  /** Rodeo: aria compara por identidad, así que cada opción lleva una clave interna. */
  protected readonly selectedKeys = computed(() => {
    const value = this.value();
    const key = this.rows().find((row) => this.matches(row.option, value))?.key;
    return key === undefined ? [] : [key];
  });

  /**
   * La opción elegida. Si deja de estar en `options` (búsqueda en el servidor), se conserva la
   * última para seguir mostrando su texto.
   */
  private readonly selectedOption = linkedSignal<
    { value: T | null; rows: MimiListRow<T>[] },
    MimiListOption<T> | null
  >({
    source: () => ({ value: this.value(), rows: this.rows() }),
    computation: ({ value, rows }, previous) => {
      const found = rows.find((row) => this.matches(row.option, value))?.option;
      if (found) return found;
      const last = previous?.value;
      return last && this.matches(last, value) ? last : null;
    },
  });

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

  /** El texto del campo sigue a la opción elegida, salvo mientras se escribe. */
  private readonly syncText = effect(() => {
    const label = this.selectedOption()?.label ?? '';
    untracked(() => {
      if (!this.typed()) this.draft.set(label);
    });
  });

  /** Elige la opción creada en cuanto la app la agrega a `options`. */
  private readonly pickCreated = effect(() => {
    const created = this.pendingCreate();
    if (created === null) return;
    const normalized = mimiNormalizeText(created);
    const row = this.rows().find((r) => mimiNormalizeText(r.option.label) === normalized);
    if (row) untracked(() => this.choose(row.option));
  });

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
    if (open && this.disabled()) return;
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
    if (event.target === field || this.disabled()) return;
    event.preventDefault();
    field.focus();
    this.setOpen(!this.open());
  }

  protected onText(text: string): void {
    if (text === this.draft()) return;
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
    this.choose(option);
  }

  private choose(option: MimiListOption<T>): void {
    this.pendingCreate.set(null);
    this.typed.set(false);
    this.draft.set(option.label);
    this.value.set(option.value);
    this.setOpen(false);
  }

  private createFromText(): void {
    const created = this.query().trim();
    if (!created) return;
    this.setOpen(false);
    this.pendingCreate.set(created);
    this.create.emit(created);
  }

  /** Elige la opción activa de la lista (Enter). */
  private pickActive(): boolean {
    const key = this.list()?.activeKey();
    if (key) this.pick(key);
    return !!key;
  }

  /** Vacía el campo y quita el valor (Escape con el panel cerrado). */
  private clear(): void {
    this.typed.set(false);
    this.pendingCreate.set(null);
    if (this.draft()) {
      this.draft.set('');
      this.searchChange.emit('');
    }
    this.value.set(null);
  }

  /**
   * Teclas que aria no cubre. aria ya atendió la tecla cuando esto corre (abrir con ↓, cerrar
   * con Escape, reenviar las flechas y Enter a la lista).
   */
  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabled() || event.isComposing || event.ctrlKey || event.metaKey) return;
    const { key, altKey } = event;
    // `state` todavía es «open» si esta misma tecla acaba de cerrar (Escape), y «closed» si
    // acaba de abrir (↓): es el estado de antes de la tecla.
    if (this.state() !== 'open') {
      if (key === 'ArrowUp' || (key === 'ArrowDown' && altKey)) {
        // Rodeo: aria solo abre con ↓ sin modificadores.
        event.preventDefault();
        this.setOpen(true);
      } else if (key === 'Escape' && (this.draft() || this.value() != null)) {
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
    this.commit();
    this.touch.emit();
  }

  /**
   * Al salir: lo escrito sin elegir se descarta y el campo vuelve al texto de la opción elegida.
   * Con el campo vacío, se quita el valor.
   */
  private commit(): void {
    if (!this.typed()) return;
    if (!this.draft().trim()) this.value.set(null);
    this.typed.set(false);
    this.draft.set(this.selectedOption()?.label ?? '');
  }
}

/** Todas las piezas del Combobox, para importarlas juntas. */
export const MimiComboboxImports = [MimiCombobox, MimiComboboxStart, MimiComboboxOption] as const;
