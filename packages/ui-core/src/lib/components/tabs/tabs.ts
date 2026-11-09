import { Tab, TabContent, TabList, TabPanel, Tabs } from '@angular/aria/tabs';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  Directive,
  ElementRef,
  InjectionToken,
  type Signal,
  TemplateRef,
  ViewContainerRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  forwardRef,
  inject,
  input,
  isDevMode,
  model,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { cva } from 'class-variance-authority';
import { cn } from '@/components/ui/utils/cn';
import { buttonFocusStyles } from '@/components/ui/utils/control-styles';

/*
 * Tabs (docs/design/Mimi F2 Toast Tabs Toolbar.dc.html, «3 · Tabs»; prefijo de tokens `tabs`,
 * spec 13): pestañas en columnas iguales, subrayadas o en píldora, con un indicador que se
 * desliza a la elegida.
 *
 * Por dentro usa @angular/aria/tabs (roles, foco itinerante, flechas, Inicio/Fin, contenido
 * diferido), siempre dentro de la plantilla de Mimi: la API es propia. Dos choques con aria
 * contenidos (spec 4, «Base técnica»; plan, G1.5b):
 * - El valor vive en Mimi. aria solo pinta la pestaña elegida y nunca se toma un valor suyo que no
 *   coincide con una pestaña (aria vacía su modelo si el valor no tiene pestaña).
 * - Después de la primera interacción, aria ya no mueve el `tabindex="0"` a la elegida. Mimi
 *   recrea la fila de pestañas (`ngTabList`) cuando el valor cambia desde fuera o cambian las
 *   pestañas, sin el foco dentro: aria vuelve a empezar y la pone en la elegida.
 */

/** Cómo se ve: subrayada (por defecto) o en píldora. */
export type MimiTabsVariant = 'underline' | 'pill';

/**
 * Lo que `mimi-tabs` necesita de una pestaña: la da `ng-template[mimiTab]` (el contenido se crea
 * al elegirla) o el elemento `mimi-tab` (el contenido se crea con la página; R.17).
 * @internal
 */
export interface MimiTabLike {
  readonly value: Signal<string>;
  readonly label: Signal<string>;
  readonly count: Signal<number | string | null | undefined>;
  readonly disabled: Signal<boolean>;
  readonly template: TemplateRef<unknown>;
}

/** @internal */
export const MIMI_TAB = new InjectionToken<MimiTabLike>('MIMI_TAB');

/** Lo que un `<mimi-tab>` le pide a su `mimi-tabs`: las pestañas, para el índice y los repetidos. @internal */
export interface MimiTabGroup {
  readonly tabs: Signal<readonly MimiTabLike[]>;
  warnMissingValue(label: string, value: string): void;
}

/** @internal */
export const MIMI_TAB_GROUP = new InjectionToken<MimiTabGroup>('MIMI_TAB_GROUP');

/**
 * Una pestaña: `<ng-template mimiTab="cuenta" label="Cuenta">contenido del panel</ng-template>`.
 * El contenido no se crea hasta que la pestaña se elige.
 */
@Directive({
  selector: 'ng-template[mimiTab]',
  providers: [{ provide: MIMI_TAB, useExisting: forwardRef(() => MimiTab) }],
})
export class MimiTab implements MimiTabLike {
  /**
   * El valor de la pestaña (único y no vacío). No es `input.required`: las pestañas declaradas en
   * un `@for` se ven antes de recibir su valor, y vacío significa «todavía no» (NG0950).
   */
  readonly value = input('', { alias: 'mimiTab' });
  /** El texto de la pestaña. Con `mimiTabLabel` sin texto visible, es su nombre accesible. */
  readonly label = input('');
  /** Un contador al lado del texto (por ejemplo, avisos sin leer). */
  readonly count = input<number | string | null | undefined>(undefined);
  /** Se puede enfocar con las flechas, pero no elegir. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Uso interno: el contenido del panel. */
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

/**
 * La pestaña como elemento, más corta (R.17): `<mimi-tab label="Cuenta">contenido</mimi-tab>`.
 * Convive con `ng-template[mimiTab]` (se pueden mezclar; el orden es el del DOM).
 *
 * **El contenido se crea con la página**, esté o no elegida la pestaña (un elemento proyecta su
 * contenido al declararlo): para un panel costoso o con datos, usa `ng-template[mimiTab]`, que
 * lo crea al elegirla, o pon un `<ng-template>` con `@defer` dentro. Sin `value`, el valor es el
 * `label` en minúsculas y con guiones (`Facturación` → `facturacion`).
 */
@Component({
  selector: 'mimi-tab',
  template: '<ng-template><ng-content /></ng-template>',
  providers: [{ provide: MIMI_TAB, useExisting: forwardRef(() => MimiTabElement) }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiTabElement implements MimiTabLike {
  readonly valueInput = input('', { alias: 'value' });
  readonly label = input('');
  readonly count = input<number | string | null | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  private readonly group = inject(MIMI_TAB_GROUP, { optional: true });
  /** El `label` en minúsculas, sin tildes y con guiones; vacío si no tiene letras latinas ni dígitos. */
  private readonly slug = computed(() =>
    this.label()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),
  );
  /**
   * El valor: el dado o, sin él, el `label` en minúsculas y con guiones. Si el label no da un valor
   * (sin letras latinas ni dígitos), el índice de la pestaña; si el valor ya lo tiene una pestaña
   * anterior, un sufijo (`facturacion`, `facturacion-2`). Sin `value` y con uno de esos dos casos,
   * avisa en desarrollo (una vez por grupo de pestañas).
   */
  readonly value = computed(() => {
    const given = this.valueInput();
    if (given) return given;
    const tabs = this.group?.tabs() ?? [];
    const index = Math.max(0, tabs.indexOf(this));
    const base = this.slug() || String(index);
    const taken = new Set(tabs.slice(0, index).map((tab) => tab.value()));
    let value = base;
    for (let n = 2; taken.has(value); n++) value = `${base}-${n}`;
    if (value !== this.slug()) this.group?.warnMissingValue(this.label(), value);
    return value;
  });
  private readonly content = viewChild.required(TemplateRef);
  /** Uso interno: el contenido del panel. */
  get template(): TemplateRef<unknown> {
    return this.content();
  }
}

/**
 * Etiqueta propia de una pestaña, con ícono o solo ícono:
 * `<ng-template mimiTabLabel="dia"><svg lucideSun></svg>Día</ng-template>`.
 */
@Directive({ selector: 'ng-template[mimiTabLabel]' })
export class MimiTabLabel {
  /** El valor de la pestaña a la que pertenece. */
  readonly value = input('', { alias: 'mimiTabLabel' });
  /** Uso interno: la etiqueta. */
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

/**
 * Uso interno (se exporta porque el compilador lo exige): crea una plantilla del usuario. Hace lo
 * mismo que NgTemplateOutlet, sin @angular/common.
 * @internal No está en el índice; no forma parte de la API de Mimi.
 */
@Directive({ selector: '[mimiTabsOutlet]' })
export class MimiTabsOutlet {
  readonly template = input.required<TemplateRef<unknown>>({ alias: 'mimiTabsOutlet' });
  /** Al cambiar, la vista se vuelve a crear (la fila de pestañas: choque 2). */
  readonly key = input<unknown>(undefined, { alias: 'mimiTabsOutletKey' });
  private readonly viewContainer = inject(ViewContainerRef);

  private readonly render = effect(() => {
    const template = this.template();
    this.key();
    untracked(() => {
      this.viewContainer.clear();
      this.viewContainer.createEmbeddedView(template);
    });
  });
}

/**
 * Orientación de la fila de pestañas (B.10): horizontal (por defecto) o vertical, para una
 * navegación lateral. En vertical, las flechas son ↑/↓ (las pone aria) y el panel va al lado.
 */
export type MimiTabsOrientation = 'horizontal' | 'vertical';

/** El contenedor visible de las pestañas (recibe el `class` del usuario). */
const containerVariants = cva('relative font-sans', {
  variants: {
    variant: {
      underline: 'border-border',
      // 4px fijos (no rem): el indicador resta los mismos 8px.
      pill: 'rounded-[calc(var(--mimi-radius)_+_4px)] bg-[color:var(--mimi-tabs-pill-bg,var(--mimi-muted))] p-[4px]',
    },
    orientation: { horizontal: '', vertical: 'self-start' },
  },
  compoundVariants: [
    { variant: 'underline', orientation: 'horizontal', class: 'border-b' },
    { variant: 'underline', orientation: 'vertical', class: 'border-s' },
    { variant: 'pill', orientation: 'horizontal', class: 'max-w-[520px]' },
  ],
  defaultVariants: { variant: 'underline', orientation: 'horizontal' },
});

/**
 * El indicador: columnas (o filas) iguales, así que su tamaño es el de una pestaña y se desplaza
 * su propio ancho (o alto) por cada una (sin medir nada). En derecha a izquierda, al revés.
 */
const indicatorVariants = cva(
  [
    'pointer-events-none absolute',
    'transition-[translate] duration-[450ms] ease-[var(--mimi-tabs-spring,cubic-bezier(0.3,1.35,0.5,1))] motion-reduce:transition-none',
  ],
  {
    variants: {
      variant: {
        underline: 'rounded-[2px] bg-[color:var(--mimi-tabs-indicator,var(--mimi-foreground))]',
        pill: 'rounded-[var(--mimi-radius)] bg-[color:var(--mimi-tabs-pill-active,var(--mimi-card))] shadow-[shadow:var(--mimi-tabs-pill-shadow,var(--mimi-shadow-neutral))]',
      },
      orientation: {
        horizontal:
          'translate-x-[calc(100%_*_var(--mimi-tabs-index))] rtl:translate-x-[calc(-100%_*_var(--mimi-tabs-index))]',
        vertical: 'translate-y-[calc(100%_*_var(--mimi-tabs-index))]',
      },
    },
    compoundVariants: [
      {
        variant: 'underline',
        orientation: 'horizontal',
        class: '-bottom-px start-0 h-0.5 w-[calc(100%_/_var(--mimi-tabs-count))]',
      },
      {
        // La barra va a la izquierda (al inicio), sobre el borde del contenedor.
        variant: 'underline',
        orientation: 'vertical',
        class: '-start-px top-0 w-0.5 h-[calc(100%_/_var(--mimi-tabs-count))]',
      },
      {
        variant: 'pill',
        orientation: 'horizontal',
        class: 'start-[4px] top-[4px] bottom-[4px] w-[calc((100%_-_8px)_/_var(--mimi-tabs-count))]',
      },
      {
        variant: 'pill',
        orientation: 'vertical',
        class: 'start-[4px] end-[4px] top-[4px] h-[calc((100%_-_8px)_/_var(--mimi-tabs-count))]',
      },
    ],
    defaultVariants: { variant: 'underline', orientation: 'horizontal' },
  },
);

const tabVariants = cva(
  [
    'relative z-1 inline-flex min-w-0 cursor-pointer items-center justify-center border-0 bg-transparent whitespace-nowrap',
    'font-medium text-[color:var(--mimi-tabs-fg,var(--mimi-muted-foreground))] mimi-transition',
    'aria-selected:font-semibold aria-selected:text-[color:var(--mimi-tabs-active-fg,var(--mimi-foreground))]',
    'not-aria-disabled:hover:text-[color:var(--mimi-tabs-active-fg,var(--mimi-foreground))] not-aria-disabled:active:scale-(--mimi-press-scale)',
    // Deshabilitada (sin diseño, plan D6): enfocable con las flechas, pero no se elige.
    'aria-disabled:cursor-not-allowed aria-disabled:opacity-(--mimi-disabled-opacity)',
    buttonFocusStyles,
  ],
  {
    variants: {
      variant: {
        underline: 'h-[var(--mimi-tabs-height,44px)] gap-2 text-sm',
        // 34px sin token (el token de alto es el de la subrayada): plan D6.
        pill: 'h-[34px] gap-1.5 rounded-[var(--mimi-radius)] text-[13.5px] [&_svg]:size-[15px] [&_svg]:shrink-0',
      },
      // En vertical, el texto al inicio, como una navegación lateral.
      orientation: { horizontal: '', vertical: 'justify-start px-3 text-start' },
    },
    defaultVariants: { variant: 'underline', orientation: 'horizontal' },
  },
);

const COUNT_CLASSES =
  'inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-info-soft px-1.5 text-[11px] font-bold text-info-soft-foreground';

/**
 * Pestañas:
 *
 * ```html
 * <mimi-tabs [(value)]="seccion" aria-label="Secciones de la cuenta">
 *   <ng-template mimiTab="cuenta" label="Cuenta">Nombre, correo y foto.</ng-template>
 *   <ng-template mimiTab="avisos" label="Avisos" [count]="3">…</ng-template>
 * </mimi-tabs>
 * ```
 *
 * Sin valor, se elige la primera habilitada. Un valor sin pestaña (pestañas que llegan después)
 * no se pierde: se muestra la primera habilitada hasta que llega la suya.
 */
@Component({
  selector: 'mimi-tabs',
  providers: [{ provide: MIMI_TAB_GROUP, useExisting: forwardRef(() => MimiTabs) }],
  imports: [Tabs, TabList, Tab, TabPanel, TabContent, MimiTabsOutlet],
  template: `
    <div ngTabs class="contents">
      @if (tabs().length) {
        <div
          #list
          data-slot="list"
          [class]="containerClasses()"
          [attr.data-variant]="variant()"
          [style.--mimi-tabs-count]="tabs().length"
          [style.--mimi-tabs-index]="paintedIndex()"
        >
          <!-- Antes de las pestañas: en la píldora, el fondo queda debajo del texto. -->
          <span
            aria-hidden="true"
            data-slot="indicator"
            [class]="indicatorClasses()"
            [hidden]="paintedIndex() < 0"
          ></span>
          <!-- Se recrea (generation) para que aria vuelva a poner el tabindex en la elegida. -->
          <ng-container [mimiTabsOutlet]="row" [mimiTabsOutletKey]="generation()" />
          <ng-template #row>
            <div
              ngTabList
              data-slot="tablist"
              [orientation]="orientation()"
              [selectedTab]="painted()"
              (selectedTabChange)="fromAria($event)"
              [attr.aria-label]="ariaLabel() || null"
              [attr.aria-labelledby]="ariaLabelledby() || null"
              [class]="tablistClasses()"
              (click)="choose($event)"
              (keydown.enter)="choose($event)"
              (keydown.space)="choose($event)"
            >
              @for (tab of tabs(); track tab) {
                <button
                  ngTab
                  [value]="tab.value()"
                  [disabled]="tab.disabled()"
                  [attr.data-value]="tab.value()"
                  [attr.data-state]="tab.value() === painted() ? 'active' : 'inactive'"
                  [attr.data-disabled]="tab.disabled() ? '' : null"
                  [attr.aria-label]="iconOnly().has(tab) ? tab.label() || null : null"
                  [class]="tabClasses()"
                >
                  @if (labelFor(tab); as label) {
                    <span data-slot="label" class="inline-flex min-w-0 items-center gap-[inherit]">
                      <ng-container [mimiTabsOutlet]="label" />
                    </span>
                  } @else {
                    <span data-slot="label" class="truncate">{{ tab.label() }}</span>
                  }
                  @if (tab.count() !== undefined && tab.count() !== null) {
                    <span data-slot="count" [class]="countClasses">{{ tab.count() }}</span>
                  }
                </button>
              }
            </div>
          </ng-template>
        </div>
      }
      @for (tab of tabs(); track tab) {
        <div
          ngTabPanel
          data-slot="panel"
          [value]="tab.value()"
          [preserveContent]="preserveContent()"
          [hidden]="tab.value() !== painted()"
          [attr.data-state]="tab.value() === painted() ? 'active' : 'inactive'"
          [class]="panelClasses()"
        >
          <ng-template ngTabContent><ng-container [mimiTabsOutlet]="tab.template" /></ng-template>
        </div>
      }
    </div>
  `,
  host: {
    // flex-direction va en su binding (B.10), no aquí.
    style: 'display: flex; gap: 14px',
    // El class es del contenedor de las pestañas; aria-label y aria-labelledby, del tablist.
    '[attr.class]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    '[attr.data-variant]': 'variant()',
    '[attr.data-orientation]': 'orientation()',
    // En vertical, las pestañas a un lado y el panel al otro. Bindings sueltos (no [style] con
    // un objeto, que sumaba ɵɵstyleMap al JS inicial: spec 10).
    // Siempre con valor: con null, Angular quita también el flex-direction del style estático.
    '[style.flex-direction]': 'orientation() === "vertical" ? "row" : "column"',
    '[style.align-items]': 'orientation() === "vertical" ? "flex-start" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiTabs implements MimiTabGroup {
  private readonly document = inject(DOCUMENT);

  /** La pestaña elegida. Admite `[(value)]`. */
  readonly value = model<string | undefined>(undefined);
  /** Por defecto, `underline`. */
  readonly variant = input<MimiTabsVariant>('underline');
  /** Por defecto, `horizontal`. Puede cambiar en vivo (por ejemplo, con el ancho). */
  readonly orientation = input<MimiTabsOrientation>('horizontal');
  /** Conserva el contenido de los paneles al cambiar de pestaña (por defecto se destruye). */
  readonly preserveContent = input(false, { transform: booleanAttribute });
  /** Nombre accesible de la fila de pestañas. */
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string>(undefined, { alias: 'aria-labelledby' });
  /** Clases del contenedor de las pestañas, mezcladas con `cn()` (gana la del usuario). */
  readonly userClass = input('', { alias: 'class' });
  /** Clases de los paneles. */
  readonly panelClass = input('');

  /** Uso interno (lo lee `<mimi-tab>` para su índice y los valores repetidos). */
  readonly tabs = contentChildren(MIMI_TAB);

  private warnedMissing = false;
  /** Uso interno: aviso en desarrollo de un `<mimi-tab>` sin `value` cuyo valor no sale limpio del label. */
  warnMissingValue(label: string, value: string): void {
    if (!isDevMode() || this.warnedMissing) return;
    this.warnedMissing = true;
    console.warn(
      `[Mimi] Tabs: <mimi-tab label="${label}"> no tiene value y su label no da un valor único: ` +
        `usa «${value}». Pon value="…" en la pestaña.`,
    );
  }
  private readonly labels = contentChildren(MimiTabLabel);
  private readonly list = viewChild<ElementRef<HTMLElement>>('list');

  /** Sube para recrear el `ngTabList` (choque 2). */
  protected readonly generation = signal(0);
  /** Pestañas con etiqueta propia sin texto visible: `label` es su nombre accesible. */
  protected readonly iconOnly = signal<ReadonlySet<MimiTabLike>>(new Set());

  private readonly firstEnabled = computed(() =>
    this.tabs().find((tab) => tab.value() && !tab.disabled()),
  );

  /** La pestaña que se muestra: la del valor si existe; si no, la primera habilitada. */
  protected readonly painted = computed(() => {
    const value = this.value();
    return value && this.tabs().some((tab) => tab.value() === value)
      ? value
      : this.firstEnabled()?.value();
  });
  protected readonly paintedIndex = computed(() =>
    this.tabs().findIndex((tab) => tab.value() === this.painted()),
  );

  private readonly variants = computed(() => ({
    variant: this.variant(),
    orientation: this.orientation(),
  }));
  protected readonly containerClasses = computed(() =>
    cn(containerVariants(this.variants()), this.userClass()),
  );
  protected readonly indicatorClasses = computed(() => indicatorVariants(this.variants()));
  // Con cn(): la vertical cambia `justify-center` por `justify-start` (sin él, quedaban las dos y
  // ganaba la que va después en el CSS).
  protected readonly tabClasses = computed(() => cn(tabVariants(this.variants())));
  // Sin outline-none: en Tailwind 4 pone --tw-outline-style en none y anula el anillo de foco.
  // Las clases de cada orientación, completas (no variantes encadenadas: selectores largos, G2.1).
  protected readonly tablistClasses = computed(() =>
    cn(
      this.orientation() === 'vertical'
        ? 'grid grid-rows-[repeat(var(--mimi-tabs-count),minmax(0,1fr))]'
        : 'grid grid-cols-[repeat(var(--mimi-tabs-count),minmax(0,1fr))]',
      'rounded-[inherit]',
      // Con todas deshabilitadas, el foco queda en la fila (aria).
      buttonFocusStyles,
    ),
  );
  protected readonly countClasses = COUNT_CLASSES;
  protected readonly panelClasses = computed(() =>
    cn(
      'px-0.5 py-1',
      this.orientation() === 'vertical' && 'min-w-0 flex-1',
      buttonFocusStyles,
      this.panelClass(),
    ),
  );

  /** El último valor que puso Mimi (no viene de fuera). */
  private known: string | undefined;
  private started = false;

  /** Sin valor, la primera habilitada (al iniciar y si vuelve a undefined). */
  private readonly defaultValue = effect(() => {
    const value = this.value();
    const first = this.firstEnabled()?.value();
    if (value !== undefined || first === undefined) return;
    untracked(() => this.set(first));
  });

  /** Valor desde fuera, o pestañas que cambian: recrear la fila si el foco no está dentro. */
  private readonly resync = effect(() => {
    const value = this.value();
    const tabs = this.tabs();
    untracked(() => {
      const external = value !== this.known;
      this.known = value;
      if (!this.started) {
        this.started = true;
        this.lastTabs = tabs;
        return;
      }
      if (!external && tabs === this.lastTabs) return;
      this.lastTabs = tabs;
      if (!this.focusInside(tabs)) this.generation.update((n) => n + 1);
    });
  });
  private lastTabs: readonly MimiTabLike[] | null = null;

  constructor() {
    afterRenderEffect({
      read: () => {
        const list = this.list()?.nativeElement;
        const tabs = this.tabs();
        if (!list) return;
        // Etiquetas propias sin texto visible (solo ícono): label pasa a ser el nombre.
        const iconOnly = new Set<MimiTabLike>();
        const buttons = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]'));
        for (const tab of tabs) {
          if (!this.labelFor(tab)) continue;
          const button = buttons.find((b) => b.getAttribute('data-value') === tab.value());
          const label = button?.querySelector('[data-slot="label"]');
          if (label && !label.textContent?.trim()) iconOnly.add(tab);
        }
        const before = untracked(this.iconOnly);
        if (iconOnly.size !== before.size || [...iconOnly].some((tab) => !before.has(tab))) {
          this.iconOnly.set(iconOnly);
        }
        if (isDevMode()) this.warn(tabs, iconOnly);
      },
    });
  }

  protected labelFor(tab: MimiTabLike): TemplateRef<unknown> | undefined {
    return this.labels().find((label) => label.value() === tab.value())?.template;
  }

  /** Lo que aria elige con el teclado. Solo se toma si es una pestaña habilitada que existe. */
  protected fromAria(value: string | undefined): void {
    const tab = this.tabs().find((t) => t.value() === value);
    if (tab && !tab.disabled()) this.set(tab.value());
  }

  /**
   * Clic, Enter o Espacio en una pestaña. aria no emite nada si es la que ya pinta (la que se
   * muestra mientras se espera otro valor): Mimi toma la elección.
   */
  protected choose(event: Event): void {
    const button = (event.target as Element | null)?.closest('[role="tab"]');
    const value = button?.getAttribute('data-value');
    const tab = this.tabs().find((t) => t.value() === value);
    if (tab && !tab.disabled()) this.set(tab.value());
  }

  private set(value: string): void {
    this.known = value;
    this.value.set(value);
  }

  /** El foco está en una pestaña que sigue existiendo. */
  private focusInside(tabs: readonly MimiTabLike[]): boolean {
    const active = this.document.activeElement;
    const list = this.list()?.nativeElement;
    if (!active || !list?.contains(active)) return false;
    const focused = active.closest('[role="tab"]')?.getAttribute('data-value');
    return focused === null || focused === undefined || tabs.some((t) => t.value() === focused);
  }

  private warned = false;
  private warn(tabs: readonly MimiTabLike[], iconOnly: ReadonlySet<MimiTabLike>): void {
    if (this.warned) return;
    const values = tabs.map((tab) => tab.value());
    const problems = [
      values.some((value) => !value) && 'una pestaña tiene el valor vacío',
      values.some((value, i) => values.indexOf(value) !== i) && 'hay valores repetidos',
      [...iconOnly].some((tab) => !tab.label()) &&
        'una pestaña sin texto visible no tiene label (su nombre accesible)',
    ].filter(Boolean);
    if (!problems.length) return;
    this.warned = true;
    console.warn(`[Mimi] Tabs: ${problems.join('; ')}.`);
  }
}

/** Todas las piezas de Tabs, para importarlas juntas. */
export const MimiTabsImports = [MimiTabs, MimiTab, MimiTabElement, MimiTabLabel] as const;
