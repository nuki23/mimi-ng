import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  type EmbeddedViewRef,
  TemplateRef,
  ViewContainerRef,
  booleanAttribute,
  computed,
  contentChild,
  contentChildren,
  effect,
  inject,
  input,
  model,
  signal,
  untracked,
} from '@angular/core';
import { MimiCheckbox } from '@/components/ui/checkbox';
import { MimiChip } from '@/components/ui/chip';
import {
  MimiDropdownMenu,
  MimiDropdownMenuContent,
  MimiDropdownMenuTrigger,
  MimiMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { MimiInput } from '@/components/ui/input';
import { MimiPagination } from '@/components/ui/pagination';
import { MimiToggleGroup, MimiToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/components/ui/utils/cn';
import { MIMI_DATA_TABLE_TEXT } from './data-table-texts';

/*
 * Data Table (docs/design/Mimi Data Table.dc.html; prefijo de tokens `table`, spec 13). Una
 * tabla de datos con búsqueda, filtros por columna, orden, paginación (Pagination), selección
 * (Checkbox), detalle expandible, acciones por fila, columnas fijas y dos densidades.
 *
 * Por dentro: una `<table>` nativa (patrón «tabla» de la APG, no el `grid` de aria: las celdas
 * tienen controles que se recorren con Tab; G3.4-a). Sin `total`, la tabla busca, filtra, ordena y
 * pagina `data`; con `total`, `data` ya es la página y la tabla solo emite los cambios.
 */

/** Una opción del filtro de una columna. */
export interface MimiTableFilterOption {
  label: string;
  value: unknown;
}

/** Una columna. */
export interface MimiTableColumn<T = any> {
  /** Identificador; por defecto, también la propiedad de la fila (`row[id]`). */
  id: string;
  /** Texto del encabezado. */
  header: string;
  /** El valor de la celda (para mostrar, buscar, filtrar y ordenar). Por defecto, `row[id]`. */
  value?: (row: T) => unknown;
  /** Se puede ordenar por esta columna. */
  sortable?: boolean;
  /** Opciones del filtro de la columna (un menú con casillas). Sin opciones, sin filtro. */
  filterOptions?: readonly MimiTableFilterOption[];
  /** Entra en la búsqueda global. Por defecto, `true`. */
  searchable?: boolean;
  /** Alineación del contenido (`end` para cifras). */
  align?: 'start' | 'end';
  /** Ancho (un valor CSS). Hace falta en las columnas fijas. */
  width?: string;
  /** Fija a la izquierda al desplazar. Solo columnas iniciales con `width`. */
  sticky?: boolean;
}

/** Orden de la tabla. */
export interface MimiTableSort {
  column: string;
  direction: 'asc' | 'desc';
}

/** Densidad: filas de 42px (`compact`) o de 60px (`comfortable`). */
export type MimiTableDensity = 'compact' | 'comfortable';

/** Filtros por columna: los valores elegidos de cada una. */
export type MimiTableFilters = Readonly<Record<string, readonly unknown[]>>;

/** Contexto de las plantillas de celda: `let-row let-value="value" let-density="density"`. */
export interface MimiTableCellContext<T = any> {
  $implicit: T;
  value: unknown;
  density: MimiTableDensity;
}

/** Contexto de las plantillas de detalle y acciones (`let-row`) y de la selección (`let-ids`). */
export interface MimiTableRowContext<T = any> {
  $implicit: T;
  density: MimiTableDensity;
}

/** Celda a medida de una columna: `<ng-template mimiTableCell="estado" let-row let-value="value">`. */
@Directive({ selector: 'ng-template[mimiTableCell]' })
export class MimiTableCell<T = any> {
  readonly column = input.required<string>({ alias: 'mimiTableCell' });
  readonly templateRef = inject<TemplateRef<MimiTableCellContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(
    _dir: MimiTableCell<T>,
    ctx: unknown,
  ): ctx is MimiTableCellContext<T> {
    return true;
  }
}

/** Detalle de una fila (agrega la columna de expandir): `<ng-template mimiTableDetail let-row>`. */
@Directive({ selector: 'ng-template[mimiTableDetail]' })
export class MimiTableDetail<T = any> {
  readonly templateRef = inject<TemplateRef<MimiTableRowContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(
    _dir: MimiTableDetail<T>,
    ctx: unknown,
  ): ctx is MimiTableRowContext<T> {
    return true;
  }
}

/** Acciones de una fila (agrega su columna): `<ng-template mimiTableActions let-row>`. */
@Directive({ selector: 'ng-template[mimiTableActions]' })
export class MimiTableActions<T = any> {
  readonly templateRef = inject<TemplateRef<MimiTableRowContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(
    _dir: MimiTableActions<T>,
    ctx: unknown,
  ): ctx is MimiTableRowContext<T> {
    return true;
  }
}

/** Acciones de la barra con filas elegidas: `<ng-template mimiTableBulk let-ids>`. */
@Directive({ selector: 'ng-template[mimiTableBulk]' })
export class MimiTableBulk {
  readonly templateRef = inject<TemplateRef<MimiTableRowContext<unknown[]>>>(TemplateRef);

  static ngTemplateContextGuard(
    _dir: MimiTableBulk,
    ctx: unknown,
  ): ctx is MimiTableRowContext<unknown[]> {
    return true;
  }
}

/** Lo que va debajo de «sin datos» o «sin resultados»: `<button mimiBtn mimiTableEmpty>`. */
@Directive({ selector: '[mimiTableEmpty]', host: { 'data-slot': 'empty-action' } })
export class MimiTableEmpty {}

/**
 * Uso interno: pinta una plantilla con su contexto. Recibe cada dato por separado (la fila es el
 * mismo objeto de `data`): un contexto nuevo en cada detección de cambios repetiría el efecto sin
 * fin (NG0103, G3.2); sin `NgTemplateOutlet`, que lleva `@angular/common` al JS inicial (G3.1).
 * @internal No forma parte de la API de Mimi.
 */
@Directive({ selector: '[mimiTableOutlet]' })
export class MimiTableOutlet {
  readonly template = input.required<TemplateRef<any>>({ alias: 'mimiTableOutlet' });
  readonly item = input.required<unknown>({ alias: 'mimiTableOutletItem' });
  readonly value = input<unknown>(undefined, { alias: 'mimiTableOutletValue' });
  readonly density = input.required<MimiTableDensity>({ alias: 'mimiTableOutletDensity' });

  private readonly viewContainer = inject(ViewContainerRef);
  private view: EmbeddedViewRef<MimiTableCellContext> | null = null;
  private rendered: TemplateRef<unknown> | null = null;

  private readonly render = effect(() => {
    const template = this.template();
    const context: MimiTableCellContext = {
      $implicit: this.item(),
      value: this.value(),
      density: this.density(),
    };
    untracked(() => {
      if (this.view && this.rendered === template) {
        Object.assign(this.view.context, context);
        this.view.markForCheck();
        return;
      }
      this.viewContainer.clear();
      this.rendered = template;
      this.view = this.viewContainer.createEmbeddedView(template, { ...context });
    });
  });
}

let nextId = 0;

/** Trazos de Lucide (ISC). */
const ICON = {
  search: ['m21 21-4.34-4.34', 'M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z'],
  x: ['M18 6 6 18', 'm6 6 12 12'],
  sortNone: ['m7 15 5 5 5-5', 'm7 9 5-5 5 5'],
  sortAsc: ['m5 12 7-7 7 7', 'M12 19V5'],
  sortDesc: ['M12 5v14', 'm19 12-7 7-7-7'],
  filter: ['M3 6h18', 'M7 12h10', 'M10 18h4'],
  chevron: ['m9 18 6-6-6-6'],
  rows4: [
    'M21 7.5H3',
    'M21 12H3',
    'M21 16.5H3',
    'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z',
  ],
  rows2: ['M3 12h18', 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z'],
  searchX: [
    'm13.5 8.5-5 5',
    'm8.5 8.5 5 5',
    'M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z',
    'm21 21-4.3-4.3',
  ],
} as const;

const HOST_CLASSES = cn(
  'group/data-table relative flex min-w-0 flex-col font-sans text-card-foreground',
  'rounded-[var(--mimi-radius-card)] border border-border bg-[color:var(--mimi-table-bg,var(--mimi-card))]',
  'shadow-[shadow:var(--mimi-shadow-card)]',
);

const TOOLBAR_CLASSES =
  'flex min-h-[var(--mimi-table-toolbar-height,56px)] flex-wrap items-center gap-2.5 border-b border-border py-2.5 pr-3 pl-4';

/** Fondo de las celdas: fijo, en hover y elegida (las fijas necesitan fondo opaco). */
const CELL_BG = cn(
  'bg-[color:var(--mimi-table-bg,var(--mimi-card))] transition-[background-color] duration-120 ease-[ease]',
  'group-hover/row:bg-[color:var(--mimi-table-row-hover,color-mix(in_oklab,var(--mimi-foreground)_3.5%,var(--mimi-card)))]',
  'group-data-[selected]/row:bg-[color:var(--mimi-table-row-selected,color-mix(in_oklab,var(--mimi-info)_8%,var(--mimi-card)))]',
);

const CELL_CLASSES = cn(
  'h-[var(--mimi-table-row-height,42px)] border-b border-border px-[var(--mimi-table-cell-px,10px)]',
  'group-data-[density=comfortable]/data-table:h-[var(--mimi-table-row-height-comfortable,60px)]',
  CELL_BG,
);

const HEAD_CLASSES = cn(
  'h-[var(--mimi-table-head-height,38px)] border-b border-border px-[var(--mimi-table-cell-px,10px)] text-start whitespace-nowrap',
  'group-data-[density=comfortable]/data-table:h-[var(--mimi-table-head-height-comfortable,44px)]',
  'bg-[color:var(--mimi-table-head-bg,var(--mimi-muted))] text-[12.5px] font-semibold text-muted-foreground',
);

/** Sombra de la última columna fija, solo con la tabla desplazada. */
const EDGE_CLASSES =
  'group-data-[scrolled]/data-table:shadow-[shadow:var(--mimi-table-sticky-shadow,6px_0_10px_-6px_oklch(0_0_0/.25))]';

const ICON_BUTTON_CLASSES = cn(
  'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[var(--mimi-radius-sm)] border-0 bg-transparent text-muted-foreground',
  'mimi-transition hover:bg-accent hover:text-foreground',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
);

const SKELETON_CLASSES =
  'h-2.5 rounded-[4px] bg-muted animate-mimi-pulse motion-reduce:animate-none';

/** Clases de cada pieza, ya mezcladas (sin clases estáticas que choquen con un binding). */
const UI = {
  selectHead: cn(
    HEAD_CLASSES,
    'sticky start-0 z-[2] box-border w-11 min-w-11 max-w-11 pe-0 ps-3.5',
  ),
  expandHead: cn(HEAD_CLASSES, 'sticky z-[2] box-border w-9 min-w-9 max-w-9 px-0'),
  actionsHead: cn(HEAD_CLASSES, 'w-14'),
  selectCell: cn(
    CELL_CLASSES,
    'sticky start-0 z-[1] box-border w-11 min-w-11 max-w-11 pe-0 ps-3.5',
  ),
  expandCell: cn(CELL_CLASSES, 'sticky z-[1] box-border w-9 min-w-9 max-w-9 px-0'),
  actionsCell: cn(CELL_CLASSES, 'px-2 text-center'),
  clearSelection: cn(ICON_BUTTON_CLASSES, 'h-[30px] px-2.5 text-[13px] font-medium'),
  clearSearch: cn(
    ICON_BUTTON_CLASSES,
    'absolute top-1/2 end-2 size-[22px] -translate-y-1/2 rounded-full bg-muted [&_svg]:size-3',
  ),
  sort: cn(
    ICON_BUTTON_CLASSES,
    '-ml-1.5 h-7 gap-[5px] px-1.5 text-[12.5px] font-semibold in-data-[sorted]:text-foreground',
  ),
  filter: cn(
    ICON_BUTTON_CLASSES,
    'relative size-6 data-[active]:bg-info-soft data-[active]:text-info-soft-foreground [&_svg]:size-[13px]',
  ),
  expand: cn(
    ICON_BUTTON_CLASSES,
    'size-[26px] [&_svg]:size-[15px] [&_svg]:transition-transform [&_svg]:duration-250 aria-expanded:[&_svg]:rotate-90 rtl:[&_svg]:-scale-x-100',
  ),
  clearAll: cn(
    'h-9 cursor-pointer rounded-[var(--mimi-radius)] border border-border bg-card px-3.5 text-[13.5px] font-medium shadow-[shadow:var(--mimi-shadow-neutral)] mimi-transition hover:bg-accent',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  ),
  skeletonWide: cn(SKELETON_CLASSES, 'w-1/4'),
  skeletonShort: cn(SKELETON_CLASSES, 'w-1/6'),
  skeletonMid: cn(SKELETON_CLASSES, 'w-1/5'),
} as const;

const fold = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Compara dos valores: números como números, texto sin tildes ni mayúsculas, vacíos al final. */
function compareValues(a: unknown, b: unknown): number {
  if (a == null || a === '') return b == null || b === '' ? 0 : 1;
  if (b == null || b === '') return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

/** Una columna con lo que la plantilla necesita ya calculado. */
interface ColumnView<T> {
  column: MimiTableColumn<T>;
  left: string | null;
  edge: boolean;
  sort: 'ascending' | 'descending' | 'none' | null;
  filtered: boolean;
  cell: TemplateRef<MimiTableCellContext<T>> | null;
  headClass: string;
  cellClass: string;
}

/**
 * Tabla de datos: `<mimi-data-table aria-label="Clientes" [data]="clientes" [columns]="columnas"
 * selectable [(selection)]="elegidos" />`.
 *
 * - Celdas a medida: `<ng-template mimiTableCell="estado" let-row let-value="value">`.
 * - Detalle expandible: `<ng-template mimiTableDetail let-row>`.
 * - Acciones por fila: `<ng-template mimiTableActions let-row>`; de la selección: `mimiTableBulk`.
 */
@Component({
  selector: 'mimi-data-table',
  imports: [
    MimiCheckbox,
    MimiChip,
    MimiDropdownMenu,
    MimiDropdownMenuContent,
    MimiDropdownMenuTrigger,
    MimiInput,
    MimiMenuCheckboxItem,
    MimiPagination,
    MimiTableOutlet,
    MimiToggleGroup,
    MimiToggleGroupItem,
  ],
  template: `
    <span role="status" class="sr-only">{{ liveText() }}</span>

    @if (toolbar()) {
      <div data-slot="toolbar" [class]="toolbarClasses">
        @if (selectable() && selection().length) {
          <div data-slot="selection" class="flex min-w-0 flex-1 items-center gap-2.5">
            <span
              class="inline-flex h-[26px] items-center rounded-full bg-info-soft px-2.5 text-[13px] font-bold text-info-soft-foreground"
              >{{ texts.selected(selection().length) }}</span
            >
            <button
              type="button"
              data-slot="clear-selection"
              [class]="ui.clearSelection"
              (click)="selection.set([])"
            >
              {{ texts.clearSelection }}
            </button>
            <span class="flex-1"></span>
            @if (bulk(); as bulk) {
              <span class="flex items-center gap-2">
                <ng-container
                  [mimiTableOutlet]="bulk.templateRef"
                  [mimiTableOutletItem]="selection()"
                  [mimiTableOutletDensity]="density()"
                />
              </span>
            }
          </div>
        } @else {
          <div class="relative w-[280px] max-w-full">
            <svg
              aria-hidden="true"
              class="pointer-events-none absolute top-1/2 start-2.5 size-[15px] -translate-y-1/2 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              @for (d of icon.search; track d) {
                <path [attr.d]="d" />
              }
            </svg>
            <input
              mimiInput
              type="search"
              data-slot="search"
              class="h-9 pr-8 pl-8 text-[13.5px] [&::-webkit-search-cancel-button]:hidden"
              [value]="query()"
              [attr.placeholder]="searchPlaceholder() || texts.search"
              [attr.aria-label]="searchPlaceholder() || texts.search"
              (input)="setQuery($any($event.target).value)"
            />
            @if (query()) {
              <button
                type="button"
                data-slot="clear-search"
                [class]="ui.clearSearch"
                [attr.aria-label]="texts.clearSearch"
                (click)="setQuery('')"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  @for (d of icon.x; track d) {
                    <path [attr.d]="d" />
                  }
                </svg>
              </button>
            }
          </div>
          <div data-slot="chips" class="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            @for (chip of chips(); track chip.key) {
              <mimi-chip
                removable
                [label]="chip.name"
                (remove)="toggleFilter(chip.column, chip.value)"
                >{{ chip.name }}</mimi-chip
              >
            }
            @if (chips().length) {
              <button
                type="button"
                data-slot="clear-filters"
                class="h-[26px] cursor-pointer rounded-full px-2 text-[12.5px] font-medium text-muted-foreground underline underline-offset-[3px] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                (click)="clearFilters()"
              >
                {{ texts.clearFilters }}
              </button>
            }
          </div>
          <mimi-toggle-group
            data-slot="density"
            [aria-label]="texts.density"
            [value]="density()"
            (valueChange)="setDensity($event)"
          >
            <button
              mimiToggleGroupItem="compact"
              [attr.aria-label]="texts.compact"
              [attr.title]="texts.compact"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                @for (d of icon.rows4; track d) {
                  <path [attr.d]="d" />
                }
              </svg>
            </button>
            <button
              mimiToggleGroupItem="comfortable"
              [attr.aria-label]="texts.comfortable"
              [attr.title]="texts.comfortable"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                @for (d of icon.rows2; track d) {
                  <path [attr.d]="d" />
                }
              </svg>
            </button>
          </mimi-toggle-group>
        }
      </div>
    }

    <div
      data-slot="scroll"
      class="overflow-x-auto overscroll-x-contain focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      role="region"
      tabindex="0"
      [attr.aria-label]="ariaLabel() || null"
      (scroll)="onScroll($event)"
    >
      <table
        class="w-full min-w-max border-separate border-spacing-0 text-[length:var(--mimi-table-font-size,13px)] tabular-nums group-data-[density=comfortable]/data-table:text-[length:var(--mimi-table-font-size-comfortable,14px)]"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-busy]="loading() || null"
      >
        <thead>
          <tr>
            @if (selectable()) {
              <th scope="col" data-slot="select" [class]="ui.selectHead">
                <span class="sr-only">{{ texts.select }}</span>
                <mimi-checkbox
                  [aria-label]="texts.selectAll"
                  [checked]="pageState() === 'all'"
                  [indeterminate]="pageState() === 'some'"
                  [disabled]="!pageIds().length"
                  (checkedChange)="togglePage($event)"
                />
              </th>
            }
            @if (detail()) {
              <th scope="col" [class]="ui.expandHead" [style.inset-inline-start]="expandLeft()">
                <span class="sr-only">{{ texts.details }}</span>
              </th>
            }
            @for (col of columnViews(); track col.column.id) {
              <th
                scope="col"
                [class]="col.headClass"
                [style.inset-inline-start]="col.left"
                [style.width]="col.column.width ?? null"
                [style.min-width]="col.left !== null ? col.column.width : null"
                [style.max-width]="col.left !== null ? col.column.width : null"
                [attr.aria-sort]="col.sort"
                [attr.data-sorted]="
                  col.sort === 'ascending' || col.sort === 'descending' ? '' : null
                "
              >
                <span
                  [class]="
                    col.column.align === 'end'
                      ? 'flex items-center justify-end gap-0.5'
                      : 'flex items-center gap-0.5'
                  "
                >
                  @if (col.column.sortable) {
                    <button
                      type="button"
                      data-slot="sort"
                      [class]="ui.sort"
                      (click)="toggleSort(col.column.id)"
                    >
                      {{ col.column.header }}
                      <svg
                        aria-hidden="true"
                        [class]="col.sort === 'none' ? 'size-[13px] opacity-45' : 'size-[13px]'"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        @for (d of sortIcon(col.sort); track d) {
                          <path [attr.d]="d" />
                        }
                      </svg>
                    </button>
                  } @else {
                    {{ col.column.header }}
                  }
                  @if (col.column.filterOptions?.length) {
                    <mimi-dropdown-menu>
                      <button
                        type="button"
                        mimiDropdownMenuTrigger
                        data-slot="filter"
                        [class]="ui.filter"
                        [attr.aria-label]="texts.filter(col.column.header)"
                        [attr.data-active]="col.filtered ? '' : null"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          @for (d of icon.filter; track d) {
                            <path [attr.d]="d" />
                          }
                        </svg>
                        @if (col.filtered) {
                          <span
                            aria-hidden="true"
                            class="absolute top-0.5 end-0.5 size-1.5 rounded-full bg-info"
                          ></span>
                        }
                      </button>
                      <ng-template mimiDropdownMenuContent>
                        @for (option of col.column.filterOptions; track $index) {
                          <mimi-menu-checkbox-item
                            [checked]="isFiltered(col.column.id, option.value)"
                            (checkedChange)="toggleFilter(col.column.id, option.value)"
                            >{{ option.label }}</mimi-menu-checkbox-item
                          >
                        }
                      </ng-template>
                    </mimi-dropdown-menu>
                  }
                </span>
              </th>
            }
            @if (actions()) {
              <th scope="col" [class]="ui.actionsHead">
                <span class="sr-only">{{ texts.actions }}</span>
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @if (loading()) {
            @for (n of skeletonRows(); track n) {
              <tr aria-hidden="true" data-slot="skeleton">
                <td [class]="cellClasses" [attr.colspan]="colCount()">
                  <span class="flex items-center gap-6">
                    <span [class]="ui.skeletonWide"></span>
                    <span [class]="ui.skeletonShort"></span>
                    <span [class]="ui.skeletonMid"></span>
                  </span>
                </td>
              </tr>
            }
          } @else {
            @for (row of pageRows(); track rowId()(row)) {
              <tr class="group/row" [attr.data-selected]="isSelected(row) ? '' : null">
                @if (selectable()) {
                  <td [class]="ui.selectCell">
                    <mimi-checkbox
                      [aria-label]="texts.selectRow(rowLabel(row))"
                      [checked]="isSelected(row)"
                      (checkedChange)="toggleRow(row)"
                    />
                  </td>
                }
                @if (detail()) {
                  <td [class]="ui.expandCell" [style.inset-inline-start]="expandLeft()">
                    <button
                      type="button"
                      data-slot="expand"
                      [class]="ui.expand"
                      [attr.aria-label]="texts.expand(rowLabel(row))"
                      [attr.aria-expanded]="isExpanded(row)"
                      [attr.aria-controls]="isExpanded(row) ? detailId(row) : null"
                      (click)="toggleExpanded(row)"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path [attr.d]="icon.chevron[0]" />
                      </svg>
                    </button>
                  </td>
                }
                @for (col of columnViews(); track col.column.id) {
                  <td
                    [class]="col.cellClass"
                    [style.inset-inline-start]="col.left"
                    [style.min-width]="col.left !== null ? col.column.width : null"
                    [style.max-width]="col.left !== null ? col.column.width : null"
                  >
                    @if (col.cell; as cell) {
                      <ng-container
                        [mimiTableOutlet]="cell"
                        [mimiTableOutletItem]="row"
                        [mimiTableOutletValue]="valueOf(col.column, row)"
                        [mimiTableOutletDensity]="density()"
                      />
                    } @else {
                      {{ valueOf(col.column, row) }}
                    }
                  </td>
                }
                @if (actions(); as actions) {
                  <td [class]="ui.actionsCell">
                    <ng-container
                      [mimiTableOutlet]="actions.templateRef"
                      [mimiTableOutletItem]="row"
                      [mimiTableOutletDensity]="density()"
                    />
                  </td>
                }
              </tr>
              @if (detail(); as detail) {
                @if (isExpanded(row)) {
                  <tr data-slot="detail">
                    <td
                      class="border-b border-border bg-[color:var(--mimi-table-expanded-bg,var(--mimi-muted))] p-0"
                      [attr.colspan]="colCount()"
                    >
                      <div class="sticky start-0 w-fit max-w-full px-5 py-4" [id]="detailId(row)">
                        <ng-container
                          [mimiTableOutlet]="detail.templateRef"
                          [mimiTableOutletItem]="row"
                          [mimiTableOutletDensity]="density()"
                        />
                      </div>
                    </td>
                  </tr>
                }
              }
            } @empty {
              <tr>
                <td class="border-b border-border p-0" [attr.colspan]="colCount()">
                  <div
                    data-slot="empty"
                    class="sticky start-0 flex w-full max-w-[760px] flex-col items-center gap-2 px-6 py-14 text-center"
                  >
                    <span
                      class="inline-flex size-[52px] items-center justify-center rounded-full bg-muted text-muted-foreground"
                    >
                      <svg
                        aria-hidden="true"
                        class="size-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        @for (d of icon.searchX; track d) {
                          <path [attr.d]="d" />
                        }
                      </svg>
                    </span>
                    <span class="text-[15px] font-bold">{{
                      narrowed() ? texts.noResults : texts.empty
                    }}</span>
                    <span class="max-w-[360px] text-[13.5px] text-pretty text-muted-foreground">{{
                      narrowed() ? texts.noResultsHint : texts.emptyHint
                    }}</span>
                    <span class="mt-2 flex gap-2 empty:hidden">
                      @if (narrowed()) {
                        <button
                          type="button"
                          data-slot="clear-all"
                          [class]="ui.clearAll"
                          (click)="clearAll()"
                        >
                          {{ texts.clearFilters }}
                        </button>
                      }
                      <ng-content select="[mimiTableEmpty]"
                    /></span>
                  </div>
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
    </div>

    @if (!loading() && count() > 0) {
      <div
        data-slot="footer"
        class="flex flex-wrap items-center justify-between gap-3 border-t border-border py-3 pr-3 pl-4 text-[13px] text-muted-foreground tabular-nums"
      >
        <span data-slot="range">{{ rangeText() }}</span>
        <mimi-pagination
          [total]="count()"
          [pageSizeOptions]="pageSizeOptions()"
          [(page)]="page"
          [(pageSize)]="pageSize"
        />
      </div>
    }
  `,
  host: {
    '[class]': 'classes()',
    '[attr.aria-label]': 'null',
    '[attr.data-density]': 'density()',
    '[attr.data-scrolled]': 'scrolled() ? "" : null',
    '[attr.data-loading]': 'loading() ? "" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiDataTable<T = any> {
  protected readonly texts = inject(MIMI_DATA_TABLE_TEXT);

  /** Las filas (o, con `total`, las de la página actual). */
  readonly data = input<readonly T[]>([]);
  readonly columns = input<readonly MimiTableColumn<T>[]>([]);
  /** Identificador estable de cada fila. Por defecto, `row.id`. */
  readonly rowId = input<(row: T) => unknown>((row) => (row as { id?: unknown }).id);
  /** Agrega la columna de casillas y la barra de selección. */
  readonly selectable = input(false, { transform: booleanAttribute });
  /** Muestra la barra (búsqueda, chips, densidad). Por defecto, `true`. */
  readonly toolbar = input(true, { transform: booleanAttribute });
  /** Filas de esqueleto, con `aria-busy`. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Modo servidor: el total de filas. Con él, `data` ya es la página y la tabla no la procesa. */
  readonly total = input<number | null>(null);
  readonly pageSizeOptions = input<readonly number[]>([10, 25, 50]);
  readonly searchPlaceholder = input('');
  /** Nombre de la tabla. */
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
  readonly userClass = input('', { alias: 'class' });

  /** Ids elegidos. Admite `[(selection)]`. */
  readonly selection = model<unknown[]>([]);
  /** Ids con el detalle abierto. */
  readonly expanded = model<unknown[]>([]);
  readonly sort = model<MimiTableSort | null>(null);
  /** La búsqueda global. */
  readonly query = model('');
  readonly filters = model<MimiTableFilters>({});
  /** La página, desde 1. */
  readonly page = model(1);
  readonly pageSize = model(10);
  readonly density = model<MimiTableDensity>('compact');

  private readonly cells = contentChildren(MimiTableCell);
  protected readonly detail = contentChild(MimiTableDetail);
  protected readonly actions = contentChild(MimiTableActions);
  protected readonly bulk = contentChild(MimiTableBulk);

  protected readonly icon = ICON;
  protected readonly ui = UI;
  protected readonly toolbarClasses = TOOLBAR_CLASSES;
  protected readonly cellClasses = CELL_CLASSES;
  protected readonly classes = computed(() => cn(HOST_CLASSES, this.userClass()));

  private readonly baseId = `mimi-data-table-${nextId++}`;
  protected readonly scrolled = signal(false);

  private readonly server = computed(() => this.total() !== null);

  /** Desde dónde empiezan las columnas de datos fijas: la casilla (44px) y el expandir (36px). */
  protected readonly expandLeft = computed(() => (this.selectable() ? '44px' : '0px'));

  protected readonly columnViews = computed<ColumnView<T>[]>(() => {
    const cells = this.cells();
    const sort = this.sort();
    const filters = this.filters();
    const offsets: string[] = [];
    if (this.selectable()) offsets.push('44px');
    if (this.detail()) offsets.push('36px');
    const columns = this.columns();
    const lastSticky = columns.reduce((last, col, i) => (col.sticky && col.width ? i : last), -1);
    return columns.map((column, i) => {
      const sticky = !!column.sticky && !!column.width && i <= lastSticky;
      const left = sticky ? (offsets.length ? `calc(${offsets.join(' + ')})` : '0px') : null;
      if (sticky) offsets.push(column.width!);
      const edge = sticky && i === lastSticky;
      const extra = cn(edge && EDGE_CLASSES, column.align === 'end' && 'text-end');
      return {
        column,
        left,
        edge,
        headClass: cn(HEAD_CLASSES, sticky && 'sticky z-[2]', extra),
        cellClass: cn(CELL_CLASSES, sticky && 'sticky z-[1]', extra),
        sort: !column.sortable
          ? null
          : sort?.column === column.id
            ? sort.direction === 'asc'
              ? 'ascending'
              : 'descending'
            : 'none',
        filtered: (filters[column.id]?.length ?? 0) > 0,
        cell:
          (cells.find((c) => c.column() === column.id)?.templateRef as
            TemplateRef<MimiTableCellContext<T>> | undefined) ?? null,
      };
    });
  });

  protected readonly colCount = computed(
    () =>
      this.columns().length +
      (this.selectable() ? 1 : 0) +
      (this.detail() ? 1 : 0) +
      (this.actions() ? 1 : 0),
  );

  /** Hay búsqueda o filtros: el vacío es «sin resultados». */
  protected readonly narrowed = computed(
    () => !!this.query().trim() || Object.values(this.filters()).some((v) => v.length > 0),
  );

  private readonly filteredRows = computed(() => {
    const data = this.data();
    if (this.server()) return data;
    const columns = this.columns();
    const query = fold(this.query().trim());
    const filters = this.filters();
    const searchable = columns.filter((c) => c.searchable !== false);
    const active = columns.filter((c) => (filters[c.id]?.length ?? 0) > 0);
    let rows = data.filter(
      (row) =>
        active.every((c) => filters[c.id].includes(this.valueOf(c, row))) &&
        (!query ||
          searchable.some((c) => fold(String(this.valueOf(c, row) ?? '')).includes(query))),
    );
    const sort = this.sort();
    const column = sort && columns.find((c) => c.id === sort.column);
    if (sort && column) {
      const factor = sort.direction === 'asc' ? 1 : -1;
      rows = [...rows].sort(
        (a, b) => factor * compareValues(this.valueOf(column, a), this.valueOf(column, b)),
      );
    }
    return rows;
  });

  /** Filas en total (con la búsqueda y los filtros), o `total` en modo servidor. */
  protected readonly count = computed(() => this.total() ?? this.filteredRows().length);

  protected readonly pageRows = computed(() => {
    const rows = this.filteredRows();
    if (this.server()) return rows;
    const size = this.pageSize();
    const start = (this.page() - 1) * size;
    return rows.slice(start, start + size);
  });

  protected readonly pageIds = computed(() => this.pageRows().map((row) => this.rowId()(row)));
  protected readonly pageState = computed<'all' | 'some' | 'none'>(() => {
    const ids = this.pageIds();
    const selected = this.selection();
    const n = ids.filter((id) => selected.includes(id)).length;
    return n === 0 ? 'none' : n === ids.length ? 'all' : 'some';
  });

  protected readonly skeletonRows = computed(() =>
    Array.from({ length: Math.min(this.pageSize(), 5) }, (_, i) => i),
  );

  protected readonly chips = computed(() => {
    const filters = this.filters();
    return this.columns().flatMap((column) =>
      (filters[column.id] ?? []).map((value, i) => {
        const label =
          column.filterOptions?.find((o) => Object.is(o.value, value))?.label ?? String(value);
        return {
          key: `${column.id}-${i}`,
          column: column.id,
          value,
          name: `${column.header}: ${label}`,
        };
      }),
    );
  });

  protected readonly rangeText = computed(() => {
    const count = this.count();
    const from = Math.min((this.page() - 1) * this.pageSize() + 1, count);
    // Nunca «desde > hasta»: una página sin filas todavía (modo servidor) cuenta como la fila `from`.
    const to = Math.max(from, Math.min(from + this.pageRows().length - 1, count));
    return this.texts.range(from, to, count);
  });

  /** Lo que oyen los lectores: las filas elegidas o, al buscar o filtrar, el rango. */
  protected readonly liveText = computed(() => {
    if (this.loading()) return this.texts.loading;
    const selected = this.selection().length;
    if (this.selectable() && selected) return this.texts.selected(selected);
    if (!this.narrowed()) return '';
    return this.count() ? this.rangeText() : this.texts.noResults;
  });

  /**
   * Si la búsqueda, los filtros o (con `total`) un total menor dejan la página fuera de rango,
   * vuelve a la última (G3.P).
   */
  private readonly clampPage = effect(() => {
    if (this.loading()) return;
    const pages = Math.max(1, Math.ceil(this.count() / this.pageSize()));
    if (untracked(this.page) > pages) untracked(() => this.page.set(pages));
  });

  /**
   * Al buscar o filtrar (sin `total`), la selección pierde las filas que ya no se ven: la barra
   * nunca cuenta ni entrega filas ocultas. Quitar la búsqueda no devuelve lo podado (G3.P).
   */
  private readonly pruneSelection = effect(() => {
    this.query();
    this.filters();
    if (this.server() || !this.narrowed()) return;
    untracked(() => {
      const selected = this.selection();
      if (!selected.length) return;
      const visible = new Set(this.filteredRows().map((row) => this.rowId()(row)));
      const kept = selected.filter((id) => visible.has(id));
      if (kept.length !== selected.length) this.selection.set(kept);
    });
  });

  protected valueOf(column: MimiTableColumn<T>, row: T): unknown {
    return column.value ? column.value(row) : (row as Record<string, unknown>)[column.id];
  }

  protected rowLabel(row: T): string {
    const first = this.columns()[0];
    return first ? String(this.valueOf(first, row) ?? '') : '';
  }

  /** Un número por id de fila: el id del detalle sigue a la fila, no a su lugar en la página. */
  private readonly detailKeys = new Map<unknown, number>();

  protected detailId(row: T): string {
    const id = this.rowId()(row);
    let key = this.detailKeys.get(id);
    if (key === undefined) {
      key = this.detailKeys.size;
      this.detailKeys.set(id, key);
    }
    return `${this.baseId}-detail-${key}`;
  }

  protected sortIcon(sort: ColumnView<T>['sort']): readonly string[] {
    return sort === 'ascending'
      ? ICON.sortAsc
      : sort === 'descending'
        ? ICON.sortDesc
        : ICON.sortNone;
  }

  protected isSelected(row: T): boolean {
    return this.selection().includes(this.rowId()(row));
  }

  protected isExpanded(row: T): boolean {
    return this.expanded().includes(this.rowId()(row));
  }

  protected isFiltered(column: string, value: unknown): boolean {
    return (this.filters()[column] ?? []).some((v) => Object.is(v, value));
  }

  protected toggleRow(row: T): void {
    const id = this.rowId()(row);
    this.selection.update((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  protected togglePage(checked: boolean): void {
    const page = this.pageIds();
    this.selection.update((ids) =>
      checked
        ? [...ids, ...page.filter((id) => !ids.includes(id))]
        : ids.filter((id) => !page.includes(id)),
    );
  }

  protected toggleExpanded(row: T): void {
    const id = this.rowId()(row);
    this.expanded.update((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  /** Sin orden → ascendente → descendente → sin orden. */
  protected toggleSort(column: string): void {
    const sort = this.sort();
    this.sort.set(
      sort?.column !== column
        ? { column, direction: 'asc' }
        : sort.direction === 'asc'
          ? { column, direction: 'desc' }
          : null,
    );
    this.page.set(1);
  }

  protected toggleFilter(column: string, value: unknown): void {
    const filters = this.filters();
    const values = filters[column] ?? [];
    const next = values.some((v) => Object.is(v, value))
      ? values.filter((v) => !Object.is(v, value))
      : [...values, value];
    this.filters.set({ ...filters, [column]: next });
    this.page.set(1);
  }

  protected clearFilters(): void {
    this.filters.set({});
    this.page.set(1);
  }

  /** «Limpiar filtros» del vacío: también la búsqueda. */
  protected clearAll(): void {
    this.query.set('');
    this.clearFilters();
  }

  protected setQuery(query: string): void {
    this.query.set(query);
    this.page.set(1);
  }

  protected setDensity(value: unknown): void {
    if (value === 'compact' || value === 'comfortable') this.density.set(value);
  }

  protected onScroll(event: Event): void {
    this.scrolled.set((event.target as HTMLElement).scrollLeft > 0);
  }
}

/** Todas las piezas de Data Table, para importarlas juntas. */
export const MimiDataTableImports = [
  MimiDataTable,
  MimiTableCell,
  MimiTableDetail,
  MimiTableActions,
  MimiTableBulk,
  MimiTableEmpty,
] as const;
