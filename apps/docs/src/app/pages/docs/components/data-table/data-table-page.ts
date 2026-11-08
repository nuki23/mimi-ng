import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_DATA_TABLE_TEXT_ES, provideMimiDataTableText } from '@/components/ui/data-table';
import { MIMI_PAGINATION_TEXT_ES, provideMimiPaginationText } from '@/components/ui/pagination';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { DataTableFullExample } from './examples/data-table-full.example';
import { DataTableStatesExample } from './examples/data-table-states.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import fullSource from './examples/data-table-full.example' with { loader: 'text' };
// @ts-expect-error
import statesSource from './examples/data-table-states.example' with { loader: 'text' };

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

/** Documentación de Data Table (tarea G3.4). */
@Component({
  selector: 'app-data-table-page',
  imports: [
    CodeBlock,
    CodePreview,
    CssVariables,
    InstallCommand,
    DataTableFullExample,
    DataTableStatesExample,
  ],
  providers: [
    provideMimiDataTableText(MIMI_DATA_TABLE_TEXT_ES),
    provideMimiPaginationText(MIMI_PAGINATION_TEXT_ES),
  ],
  templateUrl: './data-table-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTablePage {
  protected readonly source = { full: fullSource as string, states: statesSource as string };

  protected readonly usage = [
    "import { MimiDataTableImports, type MimiTableColumn } from '@/components/ui/data-table';",
    '',
    '@Component({',
    '  imports: [MimiDataTableImports],',
    '  template: `',
    '    <mimi-data-table aria-label="Clientes" selectable [data]="clientes" [columns]="columnas"',
    '      [(selection)]="elegidos">',
    '      <ng-template mimiTableCell="estado" let-value="value">…</ng-template>',
    '    </mimi-data-table>',
    '  `,',
    '})',
    'export class ClientesComponent {',
    "  clientes = [{ id: 1, nombre: 'Acme', estado: 'Activo' }];",
    '  columnas: MimiTableColumn[] = [',
    "    { id: 'nombre', header: 'Cliente', sortable: true },",
    "    { id: 'estado', header: 'Estado', filterOptions: [{ label: 'Activo', value: 'Activo' }] },",
    '  ];',
    '  elegidos = signal<unknown[]>([]);',
    '}',
  ].join('\n');

  protected readonly column = [
    'interface MimiTableColumn<T> {',
    '  id: string;            // y la propiedad de la fila, si no hay value',
    '  header: string;',
    '  value?: (row: T) => unknown;',
    '  sortable?: boolean;',
    '  filterOptions?: { label: string; value: unknown }[];',
    '  searchable?: boolean;  // por defecto, true',
    "  align?: 'start' | 'end';",
    '  width?: string;        // obligatorio en las fijas',
    '  sticky?: boolean;      // columnas iniciales, con width',
    '}',
  ].join('\n');

  protected readonly texts = [
    "import { MIMI_DATA_TABLE_TEXT_ES, provideMimiDataTableText } from '@/components/ui/data-table';",
    '',
    '// app.config.ts',
    'providers: [provideMimiDataTableText(MIMI_DATA_TABLE_TEXT_ES)],',
  ].join('\n');

  protected readonly api: ApiRow[] = [
    {
      name: 'data',
      type: 'T[]',
      default: '[]',
      description: 'Las filas (con total, las de la página actual).',
    },
    { name: 'columns', type: 'MimiTableColumn<T>[]', default: '[]', description: 'Las columnas.' },
    {
      name: 'rowId',
      type: '(row: T) => unknown',
      default: 'row.id, o la fila misma',
      description:
        'Identificador estable de cada fila (selección, detalle). Si las filas no traen id y no lo das, se identifican por el objeto (la selección se pierde si data trae objetos nuevos) y en desarrollo se avisa.',
    },
    {
      name: 'selectable',
      type: 'boolean',
      default: 'false',
      description: 'Casillas y barra de selección.',
    },
    {
      name: 'toolbar',
      type: 'boolean',
      default: 'true',
      description: 'Barra con búsqueda, chips de filtro y densidad.',
    },
    {
      name: 'loading',
      type: 'boolean',
      default: 'false',
      description: 'Filas de esqueleto y aria-busy.',
    },
    {
      name: 'total',
      type: 'number | null',
      default: 'null',
      description: 'Modo servidor: con él, data ya es la página y la tabla solo emite los cambios.',
    },
    {
      name: 'pageSizeOptions',
      type: 'number[]',
      default: '[10, 25, 50]',
      description: 'Tamaños de página.',
    },
    {
      name: 'searchPlaceholder',
      type: 'string',
      default: "''",
      description: 'Texto (y nombre) del buscador.',
    },
    { name: 'aria-label', type: 'string', default: '—', description: 'Nombre de la tabla.' },
    {
      name: 'class',
      type: 'string',
      default: "''",
      description: 'Se mezcla con cn() en el contenedor.',
    },
  ];

  protected readonly models: ApiRow[] = [
    {
      name: 'selection',
      type: 'unknown[]',
      default: '[]',
      description:
        'Ids de las filas elegidas. Sin total, al buscar o filtrar pierde las que ya no se ven.',
    },
    {
      name: 'expanded',
      type: 'unknown[]',
      default: '[]',
      description: 'Ids de las filas con el detalle abierto.',
    },
    {
      name: 'sort',
      type: '{ column, direction } | null',
      default: 'null',
      description: 'Orden: ascendente, descendente, ninguno.',
    },
    {
      name: 'query',
      type: 'string',
      default: "''",
      description: 'La búsqueda global (sin tildes ni mayúsculas).',
    },
    {
      name: 'filters',
      type: 'Record<string, unknown[]>',
      default: '{}',
      description: 'Valores elegidos del filtro de cada columna.',
    },
    { name: 'page · pageSize', type: 'number', default: '1 · 10', description: 'Paginación.' },
    {
      name: 'density',
      type: "'compact' | 'comfortable'",
      default: "'compact'",
      description: 'Filas de 42px o de 60px.',
    },
  ];

  protected readonly parts: ApiRow[] = [
    {
      name: 'mimiTableCell="<columna>"',
      type: 'let-row let-value="value"',
      default: '—',
      description: 'Celda a medida de una columna.',
    },
    {
      name: 'mimiTableDetail',
      type: 'let-row',
      default: '—',
      description: 'Detalle expandible (agrega la columna de expandir).',
    },
    {
      name: 'mimiTableActions',
      type: 'let-row',
      default: '—',
      description: 'Acciones de cada fila (agrega su columna).',
    },
    {
      name: 'mimiTableBulk',
      type: 'let-ids',
      default: '—',
      description: 'Acciones de la barra cuando hay filas elegidas.',
    },
    {
      name: '[mimiTableEmpty]',
      type: 'contenido',
      default: '—',
      description: 'Lo que va debajo de «sin datos» o «sin resultados».',
    },
  ];
}
