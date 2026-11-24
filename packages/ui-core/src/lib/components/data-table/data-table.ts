import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  type EmbeddedViewRef,
  Injector,
  TemplateRef,
  ViewContainerRef,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
  contentChildren,
  effect,
  inject,
  input,
  isDevMode,
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
import {
  MimiSheet,
  MimiSheetBody,
  MimiSheetClose,
  MimiSheetContent,
  MimiSheetFooter,
  MimiSheetHeader,
  MimiSheetTitle,
} from '@/components/ui/sheet';
import {
  MIMI_DEFAULT_ROW_ID,
  MIMI_TABLE_CELL,
  MIMI_TABLE_HEAD,
  MIMI_TABLE_CONFIG,
  MIMI_TABLE_STACK,
  type MimiTableFilters,
  type MimiTableMobile,
  type MimiTableSort,
  mimiFilterSortRows,
  mimiNextSort,
} from '@/components/ui/table';
import { MimiToggleGroup, MimiToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/components/ui/utils/cn';
import { MIMI_OVERLAY_CONFIG } from '@/components/ui/utils/overlay-config';
import { MimiSized } from '@/components/ui/utils/size';
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

/** El orden y los filtros son los de la capa base (`table`, R.20): los mismos tipos en las dos. */
export type { MimiTableFilters, MimiTableSort } from '@/components/ui/table';

/** Densidad: filas de 42px (`compact`) o de 60px (`comfortable`). */
export type MimiTableDensity = 'compact' | 'comfortable';

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
  /** La fila está abierta (R.20): `let-expanded="expanded"`. */
  expanded: boolean;
  /** Abre o cierra la fila (R.20): `let-toggle="toggle"` y `(click)="toggle()"`. */
  toggle: () => void;
  /** El `id` del detalle de la fila, para `[attr.aria-controls]` en un botón propio. */
  detailId: string;
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
  readonly expanded = input(false, { alias: 'mimiTableOutletExpanded' });
  /** Una función estable por fila (la Data Table la guarda por id): no repite el efecto. */
  readonly toggle = input<() => void>(NOOP, { alias: 'mimiTableOutletToggle' });
  readonly detailId = input('', { alias: 'mimiTableOutletDetailId' });

  private readonly viewContainer = inject(ViewContainerRef);
  private view: EmbeddedViewRef<MimiTableCellContext & MimiTableRowContext> | null = null;
  private rendered: TemplateRef<unknown> | null = null;

  private readonly render = effect(() => {
    const template = this.template();
    const context: MimiTableCellContext & MimiTableRowContext = {
      $implicit: this.item(),
      value: this.value(),
      density: this.density(),
      expanded: this.expanded(),
      toggle: this.toggle(),
      detailId: this.detailId(),
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

const NOOP = (): void => undefined;

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

/** Celda y encabezado: los de la capa base (`mimiTd`, `mimiTh`; R.20), más la densidad. */
const CELL_CLASSES = cn(
  MIMI_TABLE_CELL,
  'group-data-[density=comfortable]/data-table:h-[var(--mimi-table-row-height-comfortable,60px)]',
);

const HEAD_CLASSES = cn(
  MIMI_TABLE_HEAD,
  'group-data-[density=comfortable]/data-table:h-[var(--mimi-table-head-height-comfortable,44px)]',
);

/**
 * Sombra de la última columna fija, solo con la tabla desplazada. El desplazamiento horizontal
 * vale 1 y en RTL -1 (la sombra cae del lado del contenido que pasa por debajo); un
 * `--mimi-table-sticky-shadow` propio se usa tal cual en las dos direcciones.
 */
const EDGE_CLASSES = cn(
  'rtl:[--sticky-dir:-1]',
  'group-data-[scrolled]/data-table:shadow-[shadow:var(--mimi-table-sticky-shadow,calc(6px_*_var(--sticky-dir,1))_0_10px_-6px_oklch(0_0_0/.25))]',
);

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
  clearSelection: cn(ICON_BUTTON_CLASSES, 'h-[30px] px-2.5 text-[0.8125rem] font-medium'),
  clearSearch: cn(
    ICON_BUTTON_CLASSES,
    'absolute top-1/2 end-2 size-[22px] -translate-y-1/2 rounded-full bg-muted [&_svg]:size-3',
  ),
  sort: cn(
    ICON_BUTTON_CLASSES,
    'relative mimi-touch -ml-1.5 h-7 gap-[5px] px-1.5 text-[0.78125rem] font-semibold in-data-[sorted]:text-foreground',
  ),
  filter: cn(
    ICON_BUTTON_CLASSES,
    'relative size-6 data-[active]:bg-primary-subtle data-[active]:text-primary [&_svg]:size-[13px]',
  ),
  expand: cn(
    ICON_BUTTON_CLASSES,
    'relative mimi-touch size-[26px] [&_svg]:size-[15px] [&_svg]:transition-transform [&_svg]:duration-250 aria-expanded:[&_svg]:rotate-90 rtl:[&_svg]:-scale-x-100',
  ),
  clearAll: cn(
    'h-9 cursor-pointer rounded-[var(--mimi-radius)] border border-border bg-card px-3.5 text-[0.84375rem] font-medium shadow-[shadow:var(--mimi-shadow-neutral)] mimi-transition hover:bg-accent',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  ),
  /** Teléfono: el botón de la barra que abre la hoja, su contador y las opciones de orden. */
  refine: cn(
    'inline-flex h-11 min-w-0 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-[var(--mimi-radius)] border border-border bg-card px-3.5 text-[0.875rem] font-medium shadow-[shadow:var(--mimi-shadow-neutral)] mimi-transition hover:bg-accent [&_svg]:size-4 [&_svg]:shrink-0',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  ),
  refineCount:
    'inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground',
  option: cn(
    'inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-[var(--mimi-radius)] border border-border bg-card px-3.5 text-[0.875rem] font-medium mimi-transition hover:bg-accent [&_svg]:size-[14px]',
    'aria-pressed:border-primary aria-pressed:bg-primary-subtle aria-pressed:text-primary',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  ),
  showResults: cn(
    'h-11 flex-1 cursor-pointer rounded-[var(--mimi-radius)] border-0 bg-primary px-4 text-[0.875rem] font-semibold text-primary-foreground mimi-transition hover:opacity-90',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  ),
  /** El detalle de una fila en «stack»: pegado debajo de su tarjeta. */
  detailRowStacked: cn(
    MIMI_TABLE_STACK.row,
    'max-sm:-mt-2 max-sm:rounded-t-none max-sm:border-t-0',
  ),
  skeletonWide: cn(SKELETON_CLASSES, 'w-1/4'),
  skeletonShort: cn(SKELETON_CLASSES, 'w-1/6'),
  skeletonMid: cn(SKELETON_CLASSES, 'w-1/5'),
} as const;

/** `row.id` o, sin él, la propia fila (el mismo que `mimiTableState`). */
const DEFAULT_ROW_ID = MIMI_DEFAULT_ROW_ID;

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
  hostDirectives: [{ directive: MimiSized, inputs: ['size'] }],
  imports: [
    MimiCheckbox,
    MimiChip,
    MimiDropdownMenu,
    MimiDropdownMenuContent,
    MimiDropdownMenuTrigger,
    MimiInput,
    MimiMenuCheckboxItem,
    MimiPagination,
    MimiSheet,
    MimiSheetBody,
    MimiSheetClose,
    MimiSheetContent,
    MimiSheetFooter,
    MimiSheetHeader,
    MimiSheetTitle,
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
              class="inline-flex h-[26px] items-center rounded-full bg-primary-subtle px-2.5 text-[0.8125rem] font-bold text-primary"
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
        } @else if (phone()) {
          <!-- En el teléfono: la búsqueda, los filtros y el orden van en una hoja (abajo); en
               «stack», «Seleccionar todo» pasa aquí desde el encabezado (oculto a la vista). -->
          <div data-slot="mobile-bar" class="flex min-w-0 flex-1 items-center gap-2">
            @if (stacked() && selectable()) {
              <span
                data-slot="select-all"
                class="flex size-11 shrink-0 items-center justify-center"
              >
                <mimi-checkbox
                  [aria-label]="texts.selectAll"
                  [checked]="pageState() === 'all'"
                  [indeterminate]="pageState() === 'some'"
                  [disabled]="!pageIds().length"
                  (checkedChange)="togglePage($event)"
                />
              </span>
            }
            <button
              type="button"
              data-slot="refine"
              [class]="ui.refine"
              (click)="refineOpen.set(true)"
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
              {{ texts.refine }}
              @if (refineCount()) {
                <span data-slot="refine-count" [class]="ui.refineCount">{{ refineCount() }}</span>
              }
            </button>
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
              class="h-9 pr-8 pl-8 text-[0.84375rem] [&::-webkit-search-cancel-button]:hidden"
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
                class="h-[26px] cursor-pointer rounded-full px-2 text-[0.78125rem] font-medium text-muted-foreground underline underline-offset-[3px] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
      <!-- En «stack» (teléfono), la tabla sigue siendo una tabla para el lector: roles explícitos
           (al cambiar el display, algunos navegadores le quitan la semántica) y el encabezado,
           oculto a la vista, sin nada que se pueda enfocar. -->
      <table
        [class]="tableClasses()"
        [attr.role]="stacked() ? 'table' : null"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-busy]="loading() || null"
      >
        <thead [class]="stacked() ? stack.head : ''" [attr.role]="stacked() ? 'rowgroup' : null">
          <tr [attr.role]="stacked() ? 'row' : null">
            @if (selectable()) {
              <th
                scope="col"
                data-slot="select"
                [class]="ui.selectHead"
                [attr.role]="stacked() ? 'columnheader' : null"
              >
                <span class="sr-only">{{ texts.select }}</span>
                @if (!stacked()) {
                  <mimi-checkbox
                    [aria-label]="texts.selectAll"
                    [checked]="pageState() === 'all'"
                    [indeterminate]="pageState() === 'some'"
                    [disabled]="!pageIds().length"
                    (checkedChange)="togglePage($event)"
                  />
                }
              </th>
            }
            @if (detail()) {
              <th
                scope="col"
                [class]="ui.expandHead"
                [style.inset-inline-start]="expandLeft()"
                [attr.role]="stacked() ? 'columnheader' : null"
              >
                <span class="sr-only">{{ texts.details }}</span>
              </th>
            }
            @for (col of columnViews(); track col.column.id) {
              <th
                scope="col"
                [attr.role]="stacked() ? 'columnheader' : null"
                [class]="col.headClass"
                [style.inset-inline-start]="col.left"
                [style.width]="col.column.width ?? null"
                [style.min-width]="col.left !== null ? col.column.width : null"
                [style.max-width]="col.left !== null ? col.column.width : null"
                [attr.aria-sort]="col.sort === 'none' ? null : col.sort"
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
                  @if (col.column.sortable && !stacked()) {
                    <button
                      type="button"
                      data-slot="sort"
                      [class]="ui.sort"
                      (click)="toggleSort(col.column.id)"
                    >
                      {{ col.column.header }}
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
                        @for (d of sortIcon(col.sort); track d) {
                          <path [attr.d]="d" />
                        }
                      </svg>
                    </button>
                  } @else {
                    {{ col.column.header }}
                  }
                  @if (col.column.filterOptions?.length && !stacked()) {
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
                            class="absolute top-0.5 end-0.5 size-1.5 rounded-full bg-primary"
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
              <th
                scope="col"
                [class]="ui.actionsHead"
                [attr.role]="stacked() ? 'columnheader' : null"
              >
                <span class="sr-only">{{ texts.actions }}</span>
              </th>
            }
          </tr>
        </thead>
        <tbody [class]="stacked() ? stack.body : ''" [attr.role]="stacked() ? 'rowgroup' : null">
          @if (loading()) {
            @for (n of skeletonRows(); track n) {
              <tr aria-hidden="true" data-slot="skeleton" [attr.role]="stacked() ? 'row' : null">
                <td
                  [class]="cellClasses"
                  [attr.colspan]="colCount()"
                  [attr.role]="stacked() ? 'cell' : null"
                >
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
              <tr
                [class]="rowClasses()"
                [attr.role]="stacked() ? 'row' : null"
                [attr.data-selected]="isSelected(row) ? '' : null"
              >
                @if (selectable()) {
                  <td [class]="selectCellClasses()" [attr.role]="stacked() ? 'cell' : null">
                    <mimi-checkbox
                      [aria-label]="texts.selectRow(rowLabel(row))"
                      [checked]="isSelected(row)"
                      (checkedChange)="toggleRow(row)"
                    />
                  </td>
                }
                @if (detail()) {
                  <td
                    [class]="expandCellClasses()"
                    [style.inset-inline-start]="stacked() ? null : expandLeft()"
                    [attr.role]="stacked() ? 'cell' : null"
                  >
                    <button
                      type="button"
                      data-slot="expand"
                      [id]="detailId(row) + '-toggle'"
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
                    [attr.role]="stacked() ? 'cell' : null"
                    [attr.data-label]="stacked() ? col.column.header : null"
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
                  <td [class]="actionsCellClasses()" [attr.role]="stacked() ? 'cell' : null">
                    <ng-container
                      [mimiTableOutlet]="actions.templateRef"
                      [mimiTableOutletItem]="row"
                      [mimiTableOutletDensity]="density()"
                      [mimiTableOutletExpanded]="isExpanded(row)"
                      [mimiTableOutletToggle]="toggleFor(row)"
                      [mimiTableOutletDetailId]="detailId(row)"
                    />
                  </td>
                }
              </tr>
              @if (detail(); as detail) {
                @if (isExpanded(row)) {
                  <!-- En «stack», pegado debajo de la tarjeta de su fila. -->
                  <tr
                    data-slot="detail"
                    [class]="stacked() ? ui.detailRowStacked : ''"
                    [attr.role]="stacked() ? 'row' : null"
                  >
                    <td
                      class="border-b border-border bg-[color:var(--mimi-table-expanded-bg,var(--mimi-muted))] p-0 max-sm:in-data-[mobile=stack]:block max-sm:in-data-[mobile=stack]:border-0"
                      [attr.colspan]="colCount()"
                      [attr.role]="stacked() ? 'cell' : null"
                    >
                      <div class="sticky start-0 w-fit max-w-full px-5 py-4" [id]="detailId(row)">
                        <ng-container
                          [mimiTableOutlet]="detail.templateRef"
                          [mimiTableOutletItem]="row"
                          [mimiTableOutletDensity]="density()"
                          [mimiTableOutletExpanded]="true"
                          [mimiTableOutletToggle]="toggleFor(row)"
                          [mimiTableOutletDetailId]="detailId(row)"
                        />
                      </div>
                    </td>
                  </tr>
                }
              }
            } @empty {
              <tr [attr.role]="stacked() ? 'row' : null">
                <td
                  class="border-b border-border p-0"
                  [attr.colspan]="colCount()"
                  [attr.role]="stacked() ? 'cell' : null"
                >
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
                    <span class="text-[0.9375rem] font-bold">{{
                      narrowed() ? texts.noResults : texts.empty
                    }}</span>
                    <span
                      class="max-w-[360px] text-[0.84375rem] text-pretty text-muted-foreground"
                      >{{ narrowed() ? texts.noResultsHint : texts.emptyHint }}</span
                    >
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
        class="flex flex-wrap items-center justify-between gap-3 border-t border-border py-3 pr-3 pl-4 text-[0.8125rem] text-muted-foreground tabular-nums"
      >
        <span data-slot="range">{{ rangeText() }}</span>
        <!-- En el teléfono, compacta: sin «filas por página». -->
        <mimi-pagination
          [total]="count()"
          [pageSizeOptions]="phone() ? noSizes : pageSizeOptions()"
          [(page)]="page"
          [(pageSize)]="pageSize"
        />
      </div>
    }

    @if (phone()) {
      <mimi-sheet side="bottom" [aria-label]="texts.refine" [(open)]="refineOpen">
        <ng-template mimiSheetContent>
          <header mimiSheetHeader>
            <h2 mimiSheetTitle>{{ texts.refine }}</h2>
          </header>
          <div mimiSheetBody data-slot="refine-sheet" class="gap-5">
            <input
              mimiInput
              type="search"
              data-slot="sheet-search"
              [value]="query()"
              [attr.placeholder]="searchPlaceholder() || texts.search"
              [attr.aria-label]="searchPlaceholder() || texts.search"
              (input)="setQuery($any($event.target).value)"
            />
            @if (sortableColumns().length) {
              <fieldset data-slot="sort-group" class="m-0 min-w-0 border-0 p-0">
                <legend class="mb-2 text-sm font-semibold">{{ texts.sortBy }}</legend>
                <div class="flex flex-wrap gap-2">
                  @for (column of sortableColumns(); track column.id) {
                    <button
                      type="button"
                      data-slot="sort-option"
                      [class]="ui.option"
                      [attr.aria-pressed]="sort()?.column === column.id"
                      (click)="toggleSort(column.id)"
                    >
                      {{ column.header }}
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        @for (d of sortIcon(sortOf(column.id)); track d) {
                          <path [attr.d]="d" />
                        }
                      </svg>
                      @if (sort()?.column === column.id) {
                        <span class="sr-only">{{
                          sort()?.direction === 'asc' ? texts.ascending : texts.descending
                        }}</span>
                      }
                    </button>
                  }
                </div>
              </fieldset>
            }
            @for (column of filterColumns(); track column.id) {
              <fieldset data-slot="filter-group" class="m-0 min-w-0 border-0 p-0">
                <legend class="mb-1 text-sm font-semibold">{{ column.header }}</legend>
                @for (option of column.filterOptions; track $index) {
                  <label class="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
                    <mimi-checkbox
                      [aria-label]="option.label"
                      [checked]="isFiltered(column.id, option.value)"
                      (checkedChange)="toggleFilter(column.id, option.value)"
                    />
                    <span aria-hidden="true">{{ option.label }}</span>
                  </label>
                }
              </fieldset>
            }
          </div>
          <footer mimiSheetFooter>
            @if (narrowed()) {
              <button
                type="button"
                data-slot="sheet-clear"
                [class]="ui.clearAll"
                (click)="clearAll()"
              >
                {{ texts.clearFilters }}
              </button>
            }
            <button type="button" data-slot="show-results" mimiSheetClose [class]="ui.showResults">
              {{ texts.showResults(count()) }}
            </button>
          </footer>
        </ng-template>
      </mimi-sheet>
    }
  `,
  host: {
    '[class]': 'classes()',
    '[attr.aria-label]': 'null',
    '[attr.data-density]': 'density()',
    '[attr.data-scrolled]': 'scrolled() ? "" : null',
    '[attr.data-loading]': 'loading() ? "" : null',
    '[attr.data-mobile]': 'phone() ? mode() : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiDataTable<T = any> {
  protected readonly texts = inject(MIMI_DATA_TABLE_TEXT);

  /** Las filas (o, con `total`, las de la página actual). */
  readonly data = input<readonly T[]>([]);
  readonly columns = input<readonly MimiTableColumn<T>[]>([]);
  /**
   * Identificador estable de cada fila. Por defecto, `row.id`; si la fila no tiene `id`, la propia
   * fila (el objeto), y en modo desarrollo avisa de que falta `rowId` (G3.P).
   */
  readonly rowId = input<(row: T) => unknown>(DEFAULT_ROW_ID);
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
  /** Varias filas abiertas a la vez (`multiple`, por defecto) o una sola (`single`; R.20). */
  readonly expandMode = input<'single' | 'multiple'>('multiple');
  readonly sort = model<MimiTableSort | null>(null);
  /** La búsqueda global. */
  readonly query = model('');
  readonly filters = model<MimiTableFilters>({});
  /** La página, desde 1. */
  readonly page = model(1);
  readonly pageSize = model(10);
  readonly density = model<MimiTableDensity>('compact');
  /**
   * Cómo se ve en el teléfono (por debajo del corte de los paneles, 640 px): `stack` (cada fila,
   * una tarjeta) o `scroll` (scroll lateral con la primera columna fija). Sin valor, el de
   * `provideMimiTable` (`stack`). En los dos, la búsqueda, los filtros y el orden van en una hoja.
   */
  readonly mobile = input<MimiTableMobile | undefined>(undefined);

  private readonly tableConfig = inject(MIMI_TABLE_CONFIG);
  protected readonly mode = computed<MimiTableMobile>(
    () => this.mobile() ?? this.tableConfig.dataTable,
  );
  /** Más angosta que el corte de los paneles (`provideMimiOverlay`, 640 px por defecto). */
  protected readonly phone = signal(false);
  protected readonly stacked = computed(() => this.phone() && this.mode() === 'stack');
  protected readonly refineOpen = signal(false);
  protected readonly stack = MIMI_TABLE_STACK;
  protected readonly noSizes: readonly number[] = [];

  private readonly cells = contentChildren(MimiTableCell);
  protected readonly detail = contentChild(MimiTableDetail);
  protected readonly actions = contentChild(MimiTableActions);
  protected readonly bulk = contentChild(MimiTableBulk);

  protected readonly icon = ICON;
  protected readonly ui = UI;
  protected readonly toolbarClasses = TOOLBAR_CLASSES;
  protected readonly cellClasses = CELL_CLASSES;
  protected readonly classes = computed(() => cn(HOST_CLASSES, this.userClass()));

  protected readonly tableClasses = computed(() =>
    cn(
      'w-full min-w-max border-separate border-spacing-0 text-[length:var(--mimi-table-font-size,0.8125rem)] tabular-nums group-data-[density=comfortable]/data-table:text-[length:var(--mimi-table-font-size-comfortable,0.875rem)]',
      this.stacked() && cn(MIMI_TABLE_STACK.table, 'max-sm:min-w-0 max-sm:p-3'),
    ),
  );
  /**
   * En «stack», la fila envuelve: la casilla y la flecha de detalle comparten la primera línea de
   * la tarjeta (`basis-auto`) y cada dato ocupa una línea entera (`basis-full`).
   */
  protected readonly rowClasses = computed(() =>
    cn('group/row', this.stacked() && cn(MIMI_TABLE_STACK.row, 'max-sm:flex-row max-sm:flex-wrap')),
  );
  /** En «stack», las celdas fijas dejan de serlo y pierden su ancho de columna. */
  private readonly unstick =
    'max-sm:static max-sm:w-auto max-sm:min-w-0 max-sm:max-w-none max-sm:basis-auto max-sm:pt-2.5';
  protected readonly selectCellClasses = computed(() =>
    this.stacked() ? cn(UI.selectCell, MIMI_TABLE_STACK.cell, this.unstick) : UI.selectCell,
  );
  protected readonly expandCellClasses = computed(() =>
    this.stacked() ? cn(UI.expandCell, MIMI_TABLE_STACK.cell, this.unstick) : UI.expandCell,
  );
  protected readonly actionsCellClasses = computed(() =>
    this.stacked()
      ? cn(
          UI.actionsCell,
          MIMI_TABLE_STACK.cell,
          'max-sm:basis-full max-sm:[&:not([data-label])]:justify-end',
        )
      : UI.actionsCell,
  );
  protected readonly sortableColumns = computed(() => this.columns().filter((c) => c.sortable));
  protected readonly filterColumns = computed(() =>
    this.columns().filter((c) => c.filterOptions?.length),
  );
  /** Lo que acota las filas (búsqueda y filtros): el contador del botón de la hoja. */
  protected readonly refineCount = computed(() => (this.query() ? 1 : 0) + this.chips().length);

  private readonly watchPhone = (() => {
    const view = inject(DOCUMENT).defaultView;
    const breakpoint = inject(MIMI_OVERLAY_CONFIG).mobileBreakpoint;
    if (!breakpoint || breakpoint <= 0 || typeof view?.matchMedia !== 'function') return;
    const media = view.matchMedia(`(max-width: ${breakpoint - 0.02}px)`);
    this.phone.set(media.matches);
    const onChange = (event: MediaQueryListEvent) => {
      this.phone.set(event.matches);
      if (!event.matches) this.refineOpen.set(false);
    };
    media.addEventListener('change', onChange);
    inject(DestroyRef).onDestroy(() => media.removeEventListener('change', onChange));
  })();

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
    const stacked = this.stacked();
    let lastSticky = columns.reduce((last, col, i) => (col.sticky && col.width ? i : last), -1);
    // En el teléfono con «scroll», la primera columna de datos queda fija aunque no lo pidas
    // (no necesita `width`: es la última fija y nadie se coloca detrás de ella).
    const autoSticky = this.phone() && !stacked && lastSticky === -1 && columns.length > 1;
    if (autoSticky) lastSticky = 0;
    return columns.map((column, i) => {
      const sticky =
        !stacked &&
        ((!!column.sticky && !!column.width && i <= lastSticky) || (autoSticky && i === 0));
      const left = sticky ? (offsets.length ? `calc(${offsets.join(' + ')})` : '0px') : null;
      if (sticky && column.width) offsets.push(column.width);
      const edge = sticky && i === lastSticky;
      const extra = cn(edge && EDGE_CLASSES, column.align === 'end' && 'text-end');
      return {
        column,
        left,
        edge,
        headClass: cn(HEAD_CLASSES, sticky && 'sticky z-[2]', extra),
        cellClass: cn(
          CELL_CLASSES,
          sticky && 'sticky z-[1]',
          extra,
          stacked && cn(MIMI_TABLE_STACK.cell, 'max-sm:basis-full max-sm:text-end'),
        ),
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
    // La misma búsqueda, filtro y orden que `mimiTableState` (capa base, R.20).
    return mimiFilterSortRows(data, this.columns(), this.query(), this.filters(), this.sort());
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

  /** En desarrollo, avisa una vez si las filas no traen `id` y no hay `rowId` (G3.P). */
  private warnedRowId = false;
  private readonly warnRowId = isDevMode()
    ? effect(() => {
        const data = this.data();
        if (this.warnedRowId || this.rowId() !== DEFAULT_ROW_ID) return;
        if (!data.some((row) => (row as { id?: unknown } | null)?.id == null)) return;
        this.warnedRowId = true;
        console.warn(
          '[Mimi] Data Table: las filas no tienen `id` y falta `rowId`. Se identifican por el ' +
            'objeto, así que la selección y el detalle abierto se pierden si `data` trae objetos ' +
            'nuevos. Usa `[rowId]="fila => fila.codigo"`.',
        );
      })
    : null;

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

  /** El orden de una columna, como en `columnViews` (para la hoja del teléfono). */
  protected sortOf(column: string): ColumnView<T>['sort'] {
    const sort = this.sort();
    if (sort?.column !== column) return 'none';
    return sort.direction === 'asc' ? 'ascending' : 'descending';
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
    this.expanded.update((ids) =>
      ids.includes(id)
        ? ids.filter((x) => x !== id)
        : this.expandMode() === 'single'
          ? [id]
          : [...ids, id],
    );
  }

  /** Una función por id de fila, la misma en cada pintada (la usan las plantillas: `toggle()`). */
  private readonly toggles = new Map<unknown, () => void>();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);

  protected toggleFor(row: T): () => void {
    const id = this.rowId()(row);
    let toggle = this.toggles.get(id);
    if (!toggle) {
      toggle = () => {
        const current = this.data().find((r) => this.rowId()(r) === id);
        // Cerrar desde un botón del detalle lo destruye: el foco iría a <body>. Va al botón de
        // expandir de la fila (APG Disclosure; revisión de accesibilidad de la tanda 2).
        const detail =
          current !== undefined
            ? this.host.querySelector(`[id="${this.detailId(current)}"]`)
            : null;
        const fromDetail = !!detail && detail.contains(this.host.ownerDocument.activeElement);
        if (current !== undefined) this.toggleExpanded(current);
        else this.expanded.update((ids) => ids.filter((x) => x !== id));
        if (fromDetail && current !== undefined) {
          const target = `${this.detailId(current)}-toggle`;
          afterNextRender(() => this.host.querySelector<HTMLElement>(`[id="${target}"]`)?.focus(), {
            injector: this.injector,
          });
        }
      };
      this.toggles.set(id, toggle);
    }
    return toggle;
  }

  /** Sin orden → ascendente → descendente → sin orden. */
  protected toggleSort(column: string): void {
    this.sort.set(mimiNextSort(this.sort(), column));
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
    // En RTL el desplazamiento horizontal es negativo.
    this.scrolled.set(Math.abs((event.target as HTMLElement).scrollLeft) > 0);
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
