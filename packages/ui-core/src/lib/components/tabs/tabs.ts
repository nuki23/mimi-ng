import { Tab, TabContent, TabList, TabPanel, Tabs } from '@angular/aria/tabs';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  Directive,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
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
 * Una pestaña: `<ng-template mimiTab="cuenta" label="Cuenta">contenido del panel</ng-template>`.
 * El contenido no se crea hasta que la pestaña se elige.
 */
@Directive({ selector: 'ng-template[mimiTab]' })
export class MimiTab {
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

/** El contenedor visible de las pestañas (recibe el `class` del usuario). */
const containerVariants = cva('relative font-sans', {
  variants: {
    variant: {
      underline: 'border-b border-border',
      // 4px fijos (no rem): el indicador resta los mismos 8px.
      pill: 'max-w-[520px] rounded-[calc(var(--mimi-radius)_+_4px)] bg-[color:var(--mimi-tabs-pill-bg,var(--mimi-muted))] p-[4px]',
    },
  },
  defaultVariants: { variant: 'underline' },
});

/**
 * El indicador: columnas iguales, así que su ancho es el de una columna y se desplaza su propio
 * ancho por cada pestaña (sin medir nada). En derecha a izquierda, al revés.
 */
const indicatorVariants = cva(
  [
    'pointer-events-none absolute',
    'translate-x-[calc(100%_*_var(--mimi-tabs-index))] rtl:translate-x-[calc(-100%_*_var(--mimi-tabs-index))]',
    'transition-[translate] duration-[450ms] ease-[var(--mimi-tabs-spring,cubic-bezier(0.3,1.35,0.5,1))] motion-reduce:transition-none',
  ],
  {
    variants: {
      variant: {
        underline:
          '-bottom-px start-0 h-0.5 w-[calc(100%_/_var(--mimi-tabs-count))] rounded-[2px] bg-[color:var(--mimi-tabs-indicator,var(--mimi-foreground))]',
        pill: 'start-[4px] top-[4px] bottom-[4px] w-[calc((100%_-_8px)_/_var(--mimi-tabs-count))] rounded-[var(--mimi-radius)] bg-[color:var(--mimi-tabs-pill-active,var(--mimi-card))] shadow-neutral',
      },
    },
    defaultVariants: { variant: 'underline' },
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
    },
    defaultVariants: { variant: 'underline' },
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
              [selectedTab]="painted()"
              (selectedTabChange)="fromAria($event)"
              [attr.aria-label]="ariaLabel() || null"
              [attr.aria-labelledby]="ariaLabelledby() || null"
              [class]="tablistClasses"
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
    style: 'display: flex; flex-direction: column; gap: 14px',
    // El class es del contenedor de las pestañas; aria-label y aria-labelledby, del tablist.
    '[attr.class]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    '[attr.data-variant]': 'variant()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiTabs {
  private readonly document = inject(DOCUMENT);

  /** La pestaña elegida. Admite `[(value)]`. */
  readonly value = model<string | undefined>(undefined);
  /** Por defecto, `underline`. */
  readonly variant = input<MimiTabsVariant>('underline');
  /** Conserva el contenido de los paneles al cambiar de pestaña (por defecto se destruye). */
  readonly preserveContent = input(false, { transform: booleanAttribute });
  /** Nombre accesible de la fila de pestañas. */
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string>(undefined, { alias: 'aria-labelledby' });
  /** Clases del contenedor de las pestañas, mezcladas con `cn()` (gana la del usuario). */
  readonly userClass = input('', { alias: 'class' });
  /** Clases de los paneles. */
  readonly panelClass = input('');

  protected readonly tabs = contentChildren(MimiTab);
  private readonly labels = contentChildren(MimiTabLabel);
  private readonly list = viewChild<ElementRef<HTMLElement>>('list');

  /** Sube para recrear el `ngTabList` (choque 2). */
  protected readonly generation = signal(0);
  /** Pestañas con etiqueta propia sin texto visible: `label` es su nombre accesible. */
  protected readonly iconOnly = signal<ReadonlySet<MimiTab>>(new Set());

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

  protected readonly containerClasses = computed(() =>
    cn(containerVariants({ variant: this.variant() }), this.userClass()),
  );
  protected readonly indicatorClasses = computed(() =>
    indicatorVariants({ variant: this.variant() }),
  );
  protected readonly tabClasses = computed(() => tabVariants({ variant: this.variant() }));
  // Sin outline-none: en Tailwind 4 pone --tw-outline-style en none y anula el anillo de foco.
  protected readonly tablistClasses = cn(
    'grid grid-cols-[repeat(var(--mimi-tabs-count),minmax(0,1fr))] rounded-[inherit]',
    // Con todas deshabilitadas, el foco queda en la fila (aria).
    buttonFocusStyles,
  );
  protected readonly countClasses = COUNT_CLASSES;
  protected readonly panelClasses = computed(() =>
    cn('px-0.5 py-1', buttonFocusStyles, this.panelClass()),
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
  private lastTabs: readonly MimiTab[] | null = null;

  constructor() {
    afterRenderEffect({
      read: () => {
        const list = this.list()?.nativeElement;
        const tabs = this.tabs();
        if (!list) return;
        // Etiquetas propias sin texto visible (solo ícono): label pasa a ser el nombre.
        const iconOnly = new Set<MimiTab>();
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

  protected labelFor(tab: MimiTab): TemplateRef<unknown> | undefined {
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
  private focusInside(tabs: readonly MimiTab[]): boolean {
    const active = this.document.activeElement;
    const list = this.list()?.nativeElement;
    if (!active || !list?.contains(active)) return false;
    const focused = active.closest('[role="tab"]')?.getAttribute('data-value');
    return focused === null || focused === undefined || tabs.some((t) => t.value() === focused);
  }

  private warned = false;
  private warn(tabs: readonly MimiTab[], iconOnly: ReadonlySet<MimiTab>): void {
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
    console.warn(`Mimi Tabs: ${problems.join('; ')}.`);
  }
}

/** Todas las piezas de Tabs, para importarlas juntas. */
export const MimiTabsImports = [MimiTabs, MimiTab, MimiTabLabel] as const;
