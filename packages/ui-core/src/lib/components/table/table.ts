import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import { cn } from '@/components/ui/utils/cn';
import { MimiSized } from '@/components/ui/utils/size';
import { MIMI_TABLE_CONFIG, type MimiTableMobile } from './table-config';
import type { MimiTableRow, MimiTableSortHandle } from './table-state';

/*
 * Table (R.20, PD-2 opción C): directivas de estilo sobre la `<table>` nativa, sin lógica, para
 * escribir tu HTML con `@for` y `@if` con el aspecto de Mimi (el de la Data Table, que usa estas
 * mismas clases). La lógica (orden, filtros, paginación, selección, expandir) está aparte, en
 * `mimiTableState`. Patrón «tabla» de la APG: la semántica es la nativa (`<th scope>`, `aria-sort`).
 * Tokens: los de Data Table (`--mimi-table-*`, spec 13); la escala de tamaños, `--mimi-table-row-h`
 * y `--mimi-table-head-h`.
 */

/** Fondo de las celdas: fijo, en hover y elegida (las fijas necesitan fondo opaco). @internal */
export const MIMI_TABLE_CELL_BG = cn(
  'bg-[color:var(--mimi-table-bg,var(--mimi-card))] transition-[background-color] duration-120 ease-[ease]',
  'group-hover/row:bg-[color:var(--mimi-table-row-hover,color-mix(in_oklab,var(--mimi-foreground)_3.5%,var(--mimi-card)))]',
  'group-data-[selected]/row:bg-[color:var(--mimi-table-row-selected,color-mix(in_oklab,var(--mimi-primary)_8%,var(--mimi-card)))]',
);

/** Celda de datos: alto de la escala, borde inferior y relleno. @internal */
export const MIMI_TABLE_CELL = cn(
  'h-[var(--mimi-table-row-h,var(--mimi-table-row-height,42px))] border-b border-border px-[var(--mimi-table-cell-px,10px)]',
  MIMI_TABLE_CELL_BG,
);

/** Celda de encabezado. @internal */
export const MIMI_TABLE_HEAD = cn(
  'h-[var(--mimi-table-head-h,var(--mimi-table-head-height,38px))] border-b border-border px-[var(--mimi-table-cell-px,10px)] text-start whitespace-nowrap',
  'bg-[color:var(--mimi-table-head-bg,var(--mimi-muted))] text-[0.78125rem] font-semibold text-muted-foreground',
);

/** Botón de orden del encabezado (el de la Data Table). @internal */
export const MIMI_TABLE_SORT_BUTTON = cn(
  'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[var(--mimi-radius-sm)] border-0 bg-transparent text-muted-foreground',
  'mimi-transition hover:bg-accent hover:text-foreground',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  '-ms-1.5 h-7 gap-[5px] px-1.5 text-[0.78125rem] font-semibold in-data-[sorted]:text-foreground',
);

/** Trazos de Lucide (ISC) de los íconos de orden. @internal */
export const MIMI_TABLE_SORT_ICON = {
  none: ['m7 15 5 5 5-5', 'm7 9 5-5 5 5'],
  asc: ['m5 12 7-7 7 7', 'M12 19V5'],
  desc: ['M12 5v14', 'm19 12-7 7-7-7'],
} as const;

/**
 * Clases del modo `stack` en el teléfono (`max-sm:`, por debajo de 640 px): cada fila es una
 * tarjeta y cada celda, «etiqueta: valor» (la etiqueta sale de `data-label` con un `::before`
 * cuyo texto alternativo es vacío, `content: attr(data-label) / ""`: el lector de pantalla no la
 * repite, porque ya anuncia el encabezado de la columna). Las usa también Data Table. @internal
 */
export const MIMI_TABLE_STACK = {
  table: 'max-sm:block',
  head: 'max-sm:sr-only',
  body: 'max-sm:flex max-sm:flex-col max-sm:gap-2',
  row: 'max-sm:flex max-sm:flex-col max-sm:overflow-hidden max-sm:rounded-card max-sm:border max-sm:border-border max-sm:bg-[color:var(--mimi-table-bg,var(--mimi-card))]',
  cell: cn(
    'max-sm:flex max-sm:h-auto max-sm:min-h-10 max-sm:items-center max-sm:justify-between max-sm:gap-3 max-sm:border-0 max-sm:px-3 max-sm:py-1.5 max-sm:text-end',
    'max-sm:first:pt-2.5 max-sm:last:pb-2.5',
    "max-sm:before:me-auto max-sm:before:shrink-0 max-sm:before:text-start max-sm:before:font-medium max-sm:before:text-muted-foreground max-sm:before:content-[attr(data-label)_/_'']",
    'max-sm:[&:not([data-label])]:justify-start max-sm:[&:not([data-label])]:before:hidden',
  ),
} as const;

/** Clases del modo `scroll` en el teléfono: sin cortes de línea y la primera columna fija. @internal */
export const MIMI_TABLE_SCROLL_CELL =
  'max-sm:whitespace-nowrap max-sm:first:sticky max-sm:first:start-0 max-sm:first:z-[1]';

/**
 * `<table mimiTable>`: ancho, bordes separados (para las celdas fijas) y el texto de la tabla.
 * `mobile` (`'scroll' | 'stack'`) dice cómo se ve en el teléfono; por defecto, el de
 * `provideMimiTable` (`scroll`). Con `scroll`, envuélvela en un contenedor con `overflow-x-auto`.
 */
@Directive({
  selector: 'table[mimiTable]',
  hostDirectives: [{ directive: MimiSized, inputs: ['size'] }],
  host: {
    '[class]': 'classes()',
    '[attr.data-mobile]': 'mode()',
    '[attr.role]': 'stack() ? "table" : null',
  },
})
export class MimiTable {
  readonly userClass = input('', { alias: 'class' });
  /** Cómo se ve en el teléfono (por debajo de 640 px). Sin valor, el de `provideMimiTable`. */
  readonly mobile = input<MimiTableMobile | undefined>(undefined);

  private readonly config = inject(MIMI_TABLE_CONFIG);
  private readonly host = inject<ElementRef<HTMLTableElement>>(ElementRef).nativeElement;
  readonly mode = computed<MimiTableMobile>(() => this.mobile() ?? this.config.table);
  readonly stack = computed(() => this.mode() === 'stack');

  protected readonly classes = computed(() =>
    cn(
      'w-full border-separate border-spacing-0 font-sans text-[length:var(--mimi-table-font-size,0.8125rem)] text-card-foreground tabular-nums',
      this.stack() && MIMI_TABLE_STACK.table,
      this.userClass(),
    ),
  );

  constructor() {
    // En `stack`, cada celda lleva el texto del encabezado de su columna en `data-label`; un
    // MutationObserver vuelve a etiquetar cuando cambian las filas (las pinta tu `@for`).
    let observer: MutationObserver | null = null;
    afterRenderEffect(() => {
      const stack = this.stack();
      observer?.disconnect();
      observer = null;
      if (!stack) mimiClearStackRoles(this.host);
      if (!stack || typeof MutationObserver === 'undefined') return;
      mimiLabelCells(this.host);
      observer = new MutationObserver(() => mimiLabelCells(this.host));
      observer.observe(this.host, { childList: true, subtree: true, characterData: true });
    });
    inject(DestroyRef).onDestroy(() => observer?.disconnect());
  }
}

/**
 * Pone en cada celda de datos el texto del encabezado de su columna (`data-label`), salvo en las
 * que traen el suyo (`mimiTd label`) y en las que ocupan varias columnas. @internal
 */
export function mimiLabelCells(table: HTMLTableElement): void {
  // Los roles de tabla, también en las filas y celdas sin directiva (la fila del encabezado suele
  // ser un `<tr>` sin `mimiTr`): marcados con `data-mimi-role` para quitarlos al salir de `stack`.
  for (const row of Array.from(table.rows)) {
    mimiSetRole(row, 'row');
    for (const cell of Array.from(row.cells)) {
      const header = cell.tagName === 'TH';
      const inHead = row.parentElement?.tagName === 'THEAD';
      mimiSetRole(
        cell,
        header
          ? inHead || cell.getAttribute('scope') !== 'row'
            ? 'columnheader'
            : 'rowheader'
          : 'cell',
      );
    }
  }
  const head = table.tHead?.rows[0];
  if (!head) return;
  const labels: string[] = [];
  for (const th of Array.from(head.cells)) {
    const text = th.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    for (let i = 0; i < th.colSpan; i++) labels.push(text);
  }
  for (const body of Array.from(table.tBodies)) {
    for (const row of Array.from(body.rows)) {
      let column = 0;
      for (const cell of Array.from(row.cells)) {
        if (!cell.hasAttribute('data-label-own')) {
          const label = cell.colSpan === 1 ? labels[column] : '';
          if (label) {
            if (cell.getAttribute('data-label') !== label) cell.setAttribute('data-label', label);
          } else if (cell.hasAttribute('data-label')) {
            cell.removeAttribute('data-label');
          }
        }
        column += cell.colSpan;
      }
    }
  }
}

function mimiSetRole(el: Element, role: string): void {
  if (el.hasAttribute('role')) return;
  el.setAttribute('role', role);
  el.setAttribute('data-mimi-role', '');
}

/** Quita los roles que puso `mimiLabelCells` y las etiquetas automáticas. @internal */
export function mimiClearStackRoles(table: HTMLTableElement): void {
  for (const el of Array.from(table.querySelectorAll('[data-mimi-role]'))) {
    el.removeAttribute('role');
    el.removeAttribute('data-mimi-role');
  }
  for (const el of Array.from(table.querySelectorAll('[data-label]:not([data-label-own])'))) {
    el.removeAttribute('data-label');
  }
}

/** `<caption mimiCaption>`: el título visible de la tabla (su nombre accesible). */
@Directive({ selector: 'caption[mimiCaption]', host: { '[class]': 'classes()' } })
export class MimiCaption {
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn(
      'px-[var(--mimi-table-cell-px,10px)] py-2 text-start text-sm font-semibold',
      this.userClass(),
    ),
  );
}

/**
 * `<thead mimiThead>` (sin estilos propios: los lleva cada `th`; sirve de marca y para `class`). En
 * `stack`, oculto a la vista y presente para el lector de pantalla.
 */
@Directive({
  selector: 'thead[mimiThead]',
  host: { '[class]': 'classes()', '[attr.role]': 'stack() ? "rowgroup" : null' },
})
export class MimiThead {
  readonly userClass = input('', { alias: 'class' });
  private readonly table = inject(MimiTable, { optional: true });
  protected readonly stack = computed(() => this.table?.stack() ?? false);
  protected readonly classes = computed(() =>
    cn(this.stack() && MIMI_TABLE_STACK.head, this.userClass()),
  );
}

/** `<tbody mimiTbody>` (como `mimiThead`). */
@Directive({
  selector: 'tbody[mimiTbody]',
  host: { '[class]': 'classes()', '[attr.role]': 'stack() ? "rowgroup" : null' },
})
export class MimiTbody {
  readonly userClass = input('', { alias: 'class' });
  private readonly table = inject(MimiTable, { optional: true });
  protected readonly stack = computed(() => this.table?.stack() ?? false);
  protected readonly classes = computed(() =>
    cn(this.stack() && MIMI_TABLE_STACK.body, this.userClass()),
  );
}

/** `<tr mimiTr [selected]>`: el hover y el fondo de elegida de sus celdas (`data-selected`). */
@Directive({
  selector: 'tr[mimiTr]',
  host: {
    '[class]': 'classes()',
    '[attr.data-selected]': 'selected() ? "" : null',
    '[attr.role]': 'stack() ? "row" : null',
  },
})
export class MimiTr {
  readonly selected = input(false, { transform: booleanAttribute });
  readonly userClass = input('', { alias: 'class' });
  private readonly table = inject(MimiTable, { optional: true });
  protected readonly stack = computed(() => this.table?.stack() ?? false);
  protected readonly classes = computed(() =>
    cn('group/row', this.stack() && MIMI_TABLE_STACK.row, this.userClass()),
  );
}

/**
 * `<td mimiTd>`: alto de fila, borde, relleno y fondo; `align="end"` para cifras. `label`: la
 * etiqueta de la celda en la tarjeta del teléfono (`stack`); sin ella, el encabezado de su columna.
 */
@Directive({
  selector: 'td[mimiTd]',
  host: {
    '[class]': 'classes()',
    '[attr.role]': 'stack() ? "cell" : null',
    '[attr.data-label]': 'label() || null',
    '[attr.data-label-own]': 'label() ? "" : null',
  },
})
export class MimiTd {
  readonly align = input<'start' | 'end'>('start');
  readonly label = input<string>();
  readonly userClass = input('', { alias: 'class' });
  private readonly table = inject(MimiTable, { optional: true });
  protected readonly stack = computed(() => this.table?.stack() ?? false);
  protected readonly classes = computed(() =>
    cn(
      MIMI_TABLE_CELL,
      this.align() === 'end' && 'text-end',
      this.table && (this.stack() ? MIMI_TABLE_STACK.cell : MIMI_TABLE_SCROLL_CELL),
      this.userClass(),
    ),
  );
}

/**
 * Uso interno: pinta una plantilla sin contexto (el texto del encabezado, dentro o fuera del botón).
 * Sin `NgTemplateOutlet`: lleva `@angular/common` al JS inicial del sitio (como en G3.1).
 * @internal No forma parte de la API de Mimi.
 */
@Directive({ selector: '[mimiThOutlet]' })
export class MimiThOutlet {
  readonly template = input.required<TemplateRef<unknown>>({ alias: 'mimiThOutlet' });
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly render = effect(() => {
    const template = this.template();
    untracked(() => {
      this.viewContainer.clear();
      this.viewContainer.createEmbeddedView(template);
    });
  });
}

/**
 * `<th mimiTh>`: encabezado de columna (`scope="col"` por defecto). Con `[sort]="tabla.sort('empresa')"`
 * su texto va dentro de un botón que ordena, y el encabezado lleva `aria-sort` (APG, «Sortable
 * Table»).
 */
@Component({
  selector: 'th[mimiTh]',
  imports: [MimiThOutlet],
  template: `
    <ng-template #label><ng-content /></ng-template>
    @if (sort(); as handle) {
      <button type="button" data-slot="sort" [class]="sortButton" (click)="handle.toggle()">
        <ng-container [mimiThOutlet]="label" />
        <svg
          aria-hidden="true"
          class="size-[13px]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          @for (d of icon(); track d) {
            <path [attr.d]="d" />
          }
        </svg>
      </button>
    } @else {
      <ng-container [mimiThOutlet]="label" />
    }
  `,
  host: {
    '[class]': 'classes()',
    '[attr.scope]': 'scope()',
    '[attr.aria-sort]': 'ariaSort()',
    '[attr.data-sorted]': 'sort()?.direction() ? "" : null',
    '[attr.role]': 'role()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiTh {
  readonly sort = input<MimiTableSortHandle | null | undefined>(undefined);
  readonly scope = input<'col' | 'row' | 'colgroup' | 'rowgroup'>('col');
  readonly align = input<'start' | 'end'>('start');
  readonly userClass = input('', { alias: 'class' });

  private readonly table = inject(MimiTable, { optional: true });
  private readonly stack = computed(() => this.table?.stack() ?? false);
  protected readonly role = computed(() =>
    this.stack() ? (this.scope() === 'row' ? 'rowheader' : 'columnheader') : null,
  );

  protected readonly sortButton = MIMI_TABLE_SORT_BUTTON;
  protected readonly ariaSort = computed(() => {
    const handle = this.sort();
    if (!handle) return null;
    const direction = handle.direction();
    // Solo la columna ordenada lleva aria-sort (APG «Sortable Table»): sin «none» en las demás.
    return direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : null;
  });
  protected readonly icon = computed(() => {
    const direction = this.sort()?.direction();
    return MIMI_TABLE_SORT_ICON[direction ?? 'none'];
  });
  protected readonly classes = computed(() =>
    cn(
      MIMI_TABLE_HEAD,
      this.align() === 'end' && 'text-end',
      // Un `th scope="row"` en `stack` se pinta como una celda más de la tarjeta.
      this.stack() && this.scope() === 'row' && MIMI_TABLE_STACK.cell,
      this.table && !this.stack() && MIMI_TABLE_SCROLL_CELL,
      this.userClass(),
    ),
  );
}

/**
 * Botón que abre o cierra una fila de `mimiTableState`: `<button mimiBtn mimiRowToggle [row]="fila"
 * [controls]="'detalle-' + fila.id">`. Pone `aria-expanded` (y `aria-controls` con la fila abierta).
 * El botón y su nombre son tuyos: mejor un nombre fijo («Detalle del pedido de Ana»), porque el
 * estado ya lo dice `aria-expanded`. Solo en `<button>`: el teclado (Enter y Espacio) es el suyo.
 */
@Directive({
  selector: 'button[mimiRowToggle]',
  host: {
    '[attr.aria-expanded]': 'row().expanded()',
    '[attr.aria-controls]': 'row().expanded() ? controls() || null : null',
    '(click)': 'row().toggle()',
  },
})
export class MimiRowToggle {
  readonly row = input.required<MimiTableRow<unknown>>();
  /** El id del elemento con el detalle. */
  readonly controls = input<string>('');
}

/** Todas las piezas de Table, para importarlas juntas. */
export const MimiTableImports = [
  MimiTable,
  MimiCaption,
  MimiThead,
  MimiTbody,
  MimiTr,
  MimiTh,
  MimiTd,
  MimiRowToggle,
] as const;
