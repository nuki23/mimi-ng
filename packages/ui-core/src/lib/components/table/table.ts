import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  ViewContainerRef,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import { cn } from '@/components/ui/utils/cn';
import { MimiSized } from '@/components/ui/utils/size';
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
  'bg-[color:var(--mimi-table-head-bg,var(--mimi-muted))] text-[12.5px] font-semibold text-muted-foreground',
);

/** Botón de orden del encabezado (el de la Data Table). @internal */
export const MIMI_TABLE_SORT_BUTTON = cn(
  'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[var(--mimi-radius-sm)] border-0 bg-transparent text-muted-foreground',
  'mimi-transition hover:bg-accent hover:text-foreground',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  '-ms-1.5 h-7 gap-[5px] px-1.5 text-[12.5px] font-semibold in-data-[sorted]:text-foreground',
);

/** Trazos de Lucide (ISC) de los íconos de orden. @internal */
export const MIMI_TABLE_SORT_ICON = {
  none: ['m7 15 5 5 5-5', 'm7 9 5-5 5 5'],
  asc: ['m5 12 7-7 7 7', 'M12 19V5'],
  desc: ['M12 5v14', 'm19 12-7 7-7-7'],
} as const;

/** `<table mimiTable>`: ancho, bordes separados (para las celdas fijas) y el texto de la tabla. */
@Directive({
  selector: 'table[mimiTable]',
  hostDirectives: [{ directive: MimiSized, inputs: ['size'] }],
  host: { '[class]': 'classes()' },
})
export class MimiTable {
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn(
      'w-full border-separate border-spacing-0 font-sans text-[length:var(--mimi-table-font-size,13px)] text-card-foreground tabular-nums',
      this.userClass(),
    ),
  );
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

/** `<thead mimiThead>` (sin estilos propios: los lleva cada `th`; sirve de marca y para `class`). */
@Directive({ selector: 'thead[mimiThead]', host: { '[class]': 'userClass()' } })
export class MimiThead {
  readonly userClass = input('', { alias: 'class' });
}

/** `<tbody mimiTbody>` (como `mimiThead`). */
@Directive({ selector: 'tbody[mimiTbody]', host: { '[class]': 'userClass()' } })
export class MimiTbody {
  readonly userClass = input('', { alias: 'class' });
}

/** `<tr mimiTr [selected]>`: el hover y el fondo de elegida de sus celdas (`data-selected`). */
@Directive({
  selector: 'tr[mimiTr]',
  host: {
    '[class]': 'classes()',
    '[attr.data-selected]': 'selected() ? "" : null',
  },
})
export class MimiTr {
  readonly selected = input(false, { transform: booleanAttribute });
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() => cn('group/row', this.userClass()));
}

/** `<td mimiTd>`: alto de fila, borde, relleno y fondo; `align="end"` para cifras. */
@Directive({ selector: 'td[mimiTd]', host: { '[class]': 'classes()' } })
export class MimiTd {
  readonly align = input<'start' | 'end'>('start');
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn(MIMI_TABLE_CELL, this.align() === 'end' && 'text-end', this.userClass()),
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
          [class]="handle.direction() ? 'size-[13px]' : 'size-[13px] opacity-45'"
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
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiTh {
  readonly sort = input<MimiTableSortHandle | null | undefined>(undefined);
  readonly scope = input<'col' | 'row' | 'colgroup' | 'rowgroup'>('col');
  readonly align = input<'start' | 'end'>('start');
  readonly userClass = input('', { alias: 'class' });

  protected readonly sortButton = MIMI_TABLE_SORT_BUTTON;
  protected readonly ariaSort = computed(() => {
    const handle = this.sort();
    if (!handle) return null;
    const direction = handle.direction();
    return direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none';
  });
  protected readonly icon = computed(() => {
    const direction = this.sort()?.direction();
    return MIMI_TABLE_SORT_ICON[direction ?? 'none'];
  });
  protected readonly classes = computed(() =>
    cn(MIMI_TABLE_HEAD, this.align() === 'end' && 'text-end', this.userClass()),
  );
}

/**
 * Botón que abre o cierra una fila de `mimiTableState`: `<button mimiBtn mimiRowToggle [row]="fila"
 * [controls]="'detalle-' + fila.id">`. Pone `aria-expanded` (y `aria-controls` con la fila abierta).
 * El botón y su nombre son tuyos.
 */
@Directive({
  selector: '[mimiRowToggle]',
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
