import { type Signal, type WritableSignal, computed, isSignal, signal } from '@angular/core';

/*
 * Estado «headless» de una tabla (R.20, PD-2 opción C, decidida por el usuario el 09/11/2026):
 * búsqueda, filtros, orden, paginación, selección y filas expandidas, como señales. El HTML es
 * tuyo (con `mimiTable` o sin él): haces `@for` sobre `tabla.rows()`. La Data Table usa las mismas
 * funciones de búsqueda, filtro y orden (`mimiFilterSortRows`).
 */

/** Orden de la tabla. */
export interface MimiTableSort {
  column: string;
  direction: 'asc' | 'desc';
}

/** Filtros por columna: los valores elegidos de cada una. */
export type MimiTableFilters = Readonly<Record<string, readonly unknown[]>>;

/** Cómo lee el estado una columna. */
export interface MimiTableStateColumn<T> {
  /** El valor (para buscar, filtrar y ordenar). Por defecto, `row[id]`. */
  value?: (row: T) => unknown;
  /** Entra en la búsqueda. Por defecto, `true`. */
  searchable?: boolean;
  /** Comparación propia para ordenar. Por defecto, `mimiCompareValues`. */
  compare?: (a: T, b: T) => number;
}

/** Opciones de `mimiTableState`. */
export interface MimiTableStateOptions<T> {
  /**
   * Las columnas que busca, filtra y ordena: una lista de ids (`['empresa', 'estado']`, con el
   * valor `row[id]`) o un objeto con lo de cada una.
   */
  columns?: readonly string[] | Readonly<Record<string, MimiTableStateColumn<T>>>;
  /** Identificador estable de cada fila. Por defecto, `row.id` o, sin él, la fila misma. */
  rowId?: (row: T) => unknown;
  /** Filas por página. Por defecto, todas (sin paginación). */
  pageSize?: number;
  /** Una sola fila abierta a la vez (`single`) o varias (`multiple`, por defecto). */
  expandMode?: 'single' | 'multiple';
  /**
   * Modo servidor: el total de filas. Con él, `data` ya es la página y el estado no busca, filtra,
   * ordena ni pagina (solo guarda lo que eligió el usuario para que tu servidor lo use).
   */
  total?: Signal<number | null>;
  /** Valores iniciales. */
  initial?: {
    query?: string;
    filters?: MimiTableFilters;
    sort?: MimiTableSort | null;
    page?: number;
    selection?: readonly unknown[];
    expanded?: readonly unknown[];
  };
}

/** Una fila de `rows()`: los datos y lo que se hace con ella. */
export interface MimiTableRow<T> {
  /** El id (de `rowId`). */
  readonly id: unknown;
  /** La fila de `data`, el mismo objeto. */
  readonly data: T;
  /** Su lugar en las filas filtradas y ordenadas (desde 0, en todas las páginas). */
  readonly index: number;
  readonly selected: Signal<boolean>;
  readonly expanded: Signal<boolean>;
  /** Abre o cierra la fila (con `expandMode: 'single'`, cierra las demás). */
  toggle(open?: boolean): void;
  /** Elige o deja de elegir la fila. */
  toggleSelected(selected?: boolean): void;
}

/** El orden de una columna, para un encabezado (`<th mimiTh [sort]="tabla.sort('empresa')">`). */
export interface MimiTableSortHandle {
  readonly column: string;
  /** `asc`, `desc` o `null` (sin orden por esta columna). */
  readonly direction: Signal<'asc' | 'desc' | null>;
  /** Sin orden → ascendente → descendente → sin orden (vuelve a la página 1). */
  toggle(): void;
}

/** Lo que devuelve `mimiTableState`. */
export interface MimiTableState<T> {
  readonly query: WritableSignal<string>;
  readonly filters: WritableSignal<MimiTableFilters>;
  /** El orden actual (para leerlo o fijarlo). Para un encabezado, `sort(columna)`. */
  readonly sorting: WritableSignal<MimiTableSort | null>;
  /** La página pedida, desde 1 (las filas usan `currentPage`, que nunca pasa de `pageCount`). */
  readonly page: WritableSignal<number>;
  readonly pageSize: WritableSignal<number>;
  /** Ids elegidos. */
  readonly selection: WritableSignal<readonly unknown[]>;
  /** Ids abiertos. */
  readonly expanded: WritableSignal<readonly unknown[]>;
  /** Las filas de la página, con `selected()`, `expanded()`, `toggle()` y `toggleSelected()`. */
  readonly rows: Signal<readonly MimiTableRow<T>[]>;
  /** Todas las filas tras buscar, filtrar y ordenar (sin paginar). */
  readonly allRows: Signal<readonly T[]>;
  /** Cuántas filas hay tras buscar y filtrar (o `total` en modo servidor). */
  readonly count: Signal<number>;
  readonly pageCount: Signal<number>;
  /** La página que se ve: `page()` acotada a `1..pageCount()`. */
  readonly currentPage: Signal<number>;
  /** Hay búsqueda o filtros. */
  readonly narrowed: Signal<boolean>;
  /** Cuántas filas de la página están elegidas: para la casilla del encabezado. */
  readonly pageSelection: Signal<'all' | 'some' | 'none'>;
  sort(column: string): MimiTableSortHandle;
  /** Elige (o quita) todas las filas de la página. */
  togglePage(selected: boolean): void;
  /** Agrega o quita un valor del filtro de una columna (vuelve a la página 1). */
  toggleFilter(column: string, value: unknown): void;
  /** Busca (vuelve a la página 1). */
  search(query: string): void;
  /** Quita la búsqueda y los filtros. */
  clear(): void;
}

const fold = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Compara dos valores: números como números, texto sin tildes ni mayúsculas, vacíos al final. */
export function mimiCompareValues(a: unknown, b: unknown): number {
  if (a == null || a === '') return b == null || b === '' ? 0 : 1;
  if (b == null || b === '') return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

/** `row.id` o, sin él, la propia fila: nunca `undefined`, que repetiría la clave de todas. */
export const MIMI_DEFAULT_ROW_ID = (row: unknown): unknown =>
  (row as { id?: unknown } | null)?.id ?? row;

/** Una columna para `mimiFilterSortRows`. */
export interface MimiRowColumn<T> {
  id: string;
  value?: (row: T) => unknown;
  searchable?: boolean;
  compare?: (a: T, b: T) => number;
}

/**
 * Busca (sin tildes ni mayúsculas, en las columnas `searchable`), filtra (cada columna con valores
 * elegidos: la fila pasa si su valor es uno de ellos) y ordena. La usan `mimiTableState` y la
 * Data Table.
 */
export function mimiFilterSortRows<T>(
  data: readonly T[],
  columns: readonly MimiRowColumn<T>[],
  query: string,
  filters: MimiTableFilters,
  sort: MimiTableSort | null,
): T[] {
  const valueOf = (column: MimiRowColumn<T>, row: T) =>
    column.value ? column.value(row) : (row as Record<string, unknown>)[column.id];
  const folded = fold(query.trim());
  const searchable = columns.filter((c) => c.searchable !== false);
  const active = columns.filter((c) => (filters[c.id]?.length ?? 0) > 0);
  let rows = data.filter(
    (row) =>
      active.every((c) => filters[c.id].includes(valueOf(c, row))) &&
      (!folded || searchable.some((c) => fold(String(valueOf(c, row) ?? '')).includes(folded))),
  );
  const column = sort && columns.find((c) => c.id === sort.column);
  if (sort && column) {
    const factor = sort.direction === 'asc' ? 1 : -1;
    const compare =
      column.compare ?? ((a: T, b: T) => mimiCompareValues(valueOf(column, a), valueOf(column, b)));
    rows = [...rows].sort((a, b) => factor * compare(a, b));
  }
  return rows;
}

/** Sin orden → ascendente → descendente → sin orden. */
export function mimiNextSort(current: MimiTableSort | null, column: string): MimiTableSort | null {
  if (current?.column !== column) return { column, direction: 'asc' };
  return current.direction === 'asc' ? { column, direction: 'desc' } : null;
}

/**
 * El estado de una tabla, para escribir el HTML tú:
 *
 * ```ts
 * tabla = mimiTableState(this.clientes, { columns: ['empresa', 'estado'], pageSize: 10 });
 * ```
 *
 * `data` es una señal (o un arreglo fijo). No necesita un contexto de inyección: son señales y
 * `computed`, sin efectos.
 */
export function mimiTableState<T>(
  data: Signal<readonly T[]> | readonly T[],
  options: MimiTableStateOptions<T> = {},
): MimiTableState<T> {
  const source = isSignal(data) ? data : signal(data).asReadonly();
  const rowId = options.rowId ?? (MIMI_DEFAULT_ROW_ID as (row: T) => unknown);
  const columns: MimiRowColumn<T>[] = Array.isArray(options.columns)
    ? (options.columns as readonly string[]).map((id) => ({ id }))
    : Object.entries((options.columns ?? {}) as Record<string, MimiTableStateColumn<T>>).map(
        ([id, column]) => ({ id, ...column }),
      );
  const initial = options.initial ?? {};
  const total = options.total;
  const server = () => (total ? total() !== null : false);

  const query = signal(initial.query ?? '');
  const filters = signal<MimiTableFilters>(initial.filters ?? {});
  const sorting = signal<MimiTableSort | null>(initial.sort ?? null);
  const page = signal(initial.page ?? 1);
  const pageSize = signal(options.pageSize ?? Infinity);
  const selection = signal<readonly unknown[]>(initial.selection ?? []);
  const expanded = signal<readonly unknown[]>(initial.expanded ?? []);

  const allRows = computed(() =>
    server() ? [...source()] : mimiFilterSortRows(source(), columns, query(), filters(), sorting()),
  );
  const count = computed(() => (server() ? (total?.() ?? 0) : allRows().length));
  const pageCount = computed(() => {
    const size = pageSize();
    return Number.isFinite(size) && size > 0 ? Math.max(1, Math.ceil(count() / size)) : 1;
  });
  const currentPage = computed(() => Math.min(Math.max(1, page()), pageCount()));

  /** Una fila por id, para que `rows()` devuelva los mismos objetos mientras no cambien. */
  const cache = new Map<unknown, MimiTableRow<T> & { _data: T; _index: number }>();
  const makeRow = (row: T, index: number): MimiTableRow<T> => {
    const id = rowId(row);
    const cached = cache.get(id);
    if (cached && cached._data === row && cached._index === index) return cached;
    const made = {
      id,
      data: row,
      index,
      _data: row,
      _index: index,
      selected: computed(() => selection().includes(id)),
      expanded: computed(() => expanded().includes(id)),
      toggle(open?: boolean) {
        const isOpen = expanded().includes(id);
        const next = open ?? !isOpen;
        if (next === isOpen) return;
        if (!next) expanded.update((ids) => ids.filter((x) => x !== id));
        else if (options.expandMode === 'single') expanded.set([id]);
        else expanded.update((ids) => [...ids, id]);
      },
      toggleSelected(selected?: boolean) {
        const isSelected = selection().includes(id);
        const next = selected ?? !isSelected;
        if (next === isSelected) return;
        selection.update((ids) => (next ? [...ids, id] : ids.filter((x) => x !== id)));
      },
    };
    cache.set(id, made);
    return made;
  };

  const rows = computed(() => {
    const all = allRows();
    const size = pageSize();
    const paged = server() || !Number.isFinite(size);
    const start = paged ? 0 : (currentPage() - 1) * size;
    const slice = paged ? all : all.slice(start, start + size);
    return slice.map((row, i) => makeRow(row, start + i));
  });

  const pageSelection = computed<'all' | 'some' | 'none'>(() => {
    const ids = rows().map((r) => r.id);
    const chosen = selection();
    const n = ids.filter((id) => chosen.includes(id)).length;
    return n === 0 ? 'none' : n === ids.length ? 'all' : 'some';
  });

  const handles = new Map<string, MimiTableSortHandle>();

  return {
    query,
    filters,
    sorting,
    page,
    pageSize,
    selection,
    expanded,
    rows,
    allRows,
    count,
    pageCount,
    currentPage,
    narrowed: computed(
      () => !!query().trim() || Object.values(filters()).some((values) => values.length > 0),
    ),
    pageSelection,
    sort(column: string): MimiTableSortHandle {
      let handle = handles.get(column);
      if (!handle) {
        handle = {
          column,
          direction: computed(() => {
            const current = sorting();
            return current?.column === column ? current.direction : null;
          }),
          toggle: () => {
            sorting.set(mimiNextSort(sorting(), column));
            page.set(1);
          },
        };
        handles.set(column, handle);
      }
      return handle;
    },
    togglePage(selected: boolean) {
      const ids = rows().map((r) => r.id);
      selection.update((chosen) =>
        selected
          ? [...chosen, ...ids.filter((id) => !chosen.includes(id))]
          : chosen.filter((id) => !ids.includes(id)),
      );
    },
    toggleFilter(column: string, value: unknown) {
      const current = filters();
      const values = current[column] ?? [];
      const next = values.some((v) => Object.is(v, value))
        ? values.filter((v) => !Object.is(v, value))
        : [...values, value];
      filters.set({ ...current, [column]: next });
      page.set(1);
    },
    search(text: string) {
      query.set(text);
      page.set(1);
    },
    clear() {
      query.set('');
      filters.set({});
      page.set(1);
    },
  };
}
