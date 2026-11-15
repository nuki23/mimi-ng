import type { DocPage } from '../../../../doc-page/doc-page.types';
import { DataTableCellsExample } from './examples/data-table-cells.example';
import { DataTableDemoExample } from './examples/data-table-demo.example';
import { DataTableSelectionExample } from './examples/data-table-selection.example';
import { DataTableServerExample } from './examples/data-table-server.example';
import { DataTableSizesExample } from './examples/data-table-sizes.example';
import { DataTableStatesExample } from './examples/data-table-states.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import cellsSource from './examples/data-table-cells.example' with { loader: 'text' };
// @ts-expect-error
import customersSource from './examples/customers' with { loader: 'text' };
// @ts-expect-error
import customersServerSource from './examples/customers-server' with { loader: 'text' };
// @ts-expect-error
import demoSource from './examples/data-table-demo.example' with { loader: 'text' };
// @ts-expect-error
import selectionSource from './examples/data-table-selection.example' with { loader: 'text' };
// @ts-expect-error
import serverSource from './examples/data-table-server.example' with { loader: 'text' };
// @ts-expect-error
import sizesSource from './examples/data-table-sizes.example' with { loader: 'text' };
// @ts-expect-error
import statesSource from './examples/data-table-states.example' with { loader: 'text' };

const customersFile = { name: 'customers.ts', code: customersSource as string };

/** La página de Data Table (G3.4), con la plantilla de página (DP.4). */
export const DATA_TABLE_PAGE: DocPage = {
  name: 'Data Table',
  lead: 'Tabla de datos que busca, filtra, ordena y pagina tus filas: tú das los datos y las columnas, ella hace el resto.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      'Busca, ordena con el encabezado, filtra el estado con el embudo y elige filas: la casilla de arriba marca la página.',
    component: DataTableDemoExample,
    source: demoSource as string,
  },
  install: 'data-table',
  usage: {
    code: [
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
    ].join('\n'),
    note: 'Cada columna es un `MimiTableColumn`, con sus campos debajo. Las celdas a medida son plantillas `mimiTableCell`.',
    more: {
      summary: 'Los campos de cada columna (`MimiTableColumn`)',
      items: [
        '`id`: el identificador; también la propiedad de la fila, si no hay `value`.',
        '`header`: el texto del encabezado.',
        '`value`: `(row) => unknown`, el valor para mostrar, buscar, filtrar y ordenar.',
        '`sortable`: se ordena con el encabezado (ascendente, descendente, sin orden).',
        '`filterOptions`: `{ label, value }[]`, un menú con casillas; cada valor elegido es un chip.',
        '`searchable`: entra en la búsqueda global (por defecto, `true`).',
        "`align`: `'start'` o `'end'` (para cifras).",
        '`width`: un ancho CSS; obligatorio en las columnas fijas.',
        '`sticky`: fija a la izquierda al desplazar; solo columnas iniciales con `width`.',
      ],
    },
  },
  examples: {
    sizes: [
      {
        id: 'sizes',
        title: 'Tamaños y densidad',
        sentence:
          '`size` cambia el alto de fila con la escala del tema; `density`, entre compacta y cómoda (60px fijos), también desde el botón de la barra.',
        component: DataTableSizesExample,
        source: sizesSource as string,
      },
    ],
    states: [
      {
        id: 'states',
        title: 'Mínima, cargando y sin datos',
        sentence:
          'Sin barra (`[toolbar]="false"`), con `loading` (filas de esqueleto) y sin datos, con tu botón en `mimiTableEmpty`.',
        component: DataTableStatesExample,
        source: statesSource as string,
      },
    ],
    advanced: [
      {
        id: 'cells',
        title: 'Celdas a medida, filtros y columna fija',
        sentence:
          'Cliente, estado y MRR son plantillas `mimiTableCell`. Filtra con el embudo (cada valor es un chip) y desplaza: la primera columna queda fija.',
        component: DataTableCellsExample,
        source: cellsSource as string,
        files: [
          { name: 'data-table-cells.example.ts', code: cellsSource as string },
          customersFile,
        ],
      },
      {
        id: 'selection',
        title: 'Selección, detalle y acciones',
        sentence:
          'Elige filas para ver tu barra `mimiTableBulk`; la flecha abre `mimiTableDetail` y el menú de cada fila es `mimiTableActions`.',
        component: DataTableSelectionExample,
        source: selectionSource as string,
        files: [
          { name: 'data-table-selection.example.ts', code: selectionSource as string },
          customersFile,
        ],
      },
      {
        id: 'server',
        title: 'Datos en el servidor',
        sentence:
          'Con `[total]`, `data` ya es la página: escucha `query`, `sort`, `filters`, `page` y `pageSize`, pide esa página y muestra `loading` mientras llega.',
        component: DataTableServerExample,
        source: serverSource as string,
        files: [
          { name: 'data-table-server.example.ts', code: serverSource as string },
          { name: 'customers-server.ts', code: customersServerSource as string },
          customersFile,
        ],
      },
    ],
  },
  accessibility: {
    points: [
      'Es una `<table>` nativa con encabezados `scope="col"`: los botones de dentro se recorren con Tab, sin navegación por celdas.',
      'El área que se desplaza es una región con el nombre de la tabla; entra con Tab y se mueve con las flechas.',
      'La columna ordenada lleva `aria-sort`; la flecha de detalle, `aria-expanded` y `aria-controls`.',
      'Cada casilla se llama «Seleccionar …» con el valor de la primera columna; la del encabezado marca la página, con estado parcial.',
      'Las filas elegidas, el rango al buscar o filtrar y «Cargando…» se anuncian en una región de estado; al cargar, la tabla lleva `aria-busy`.',
      'Dale nombre con `aria-label`; los botones de solo ícono de tus plantillas también lo necesitan.',
    ],
    more: [
      'La fila elegida lleva `data-selected` (para tu CSS), no `aria-selected`: la tabla no es un `grid` y el estado lo anuncia su casilla, que está marcada.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'data',
        type: 'T[]',
        default: '[]',
        description: 'Las filas; con `total`, solo las de la página actual.',
      },
      {
        name: 'columns',
        type: 'MimiTableColumn<T>[]',
        default: '[]',
        description: 'Las columnas (sus campos, en «Uso»).',
      },
      {
        name: 'rowId',
        type: '(row: T) => unknown',
        default: 'row.id, o la fila',
        description:
          'Identificador estable de cada fila. Sin él y sin `id`, se usa el objeto y en desarrollo avisa.',
      },
      {
        name: 'selectable',
        type: 'boolean',
        default: 'false',
        description: 'Casillas en cada fila y barra de selección.',
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
        description: 'Filas de esqueleto y `aria-busy`.',
      },
      {
        name: 'total',
        type: 'number | null',
        default: 'null',
        description: 'Modo servidor: `data` ya es la página y la tabla solo emite los cambios.',
      },
      {
        name: 'pageSizeOptions',
        type: 'number[]',
        default: '[10, 25, 50]',
        description: 'Los tamaños de página que ofrece el pie.',
      },
      {
        name: 'searchPlaceholder',
        type: 'string',
        default: "''",
        description: 'Texto (y nombre) del buscador.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md' (o el de `mimiSize`)",
        description:
          'Escala el alto de las filas y de la cabecera con la escala del tema, como los demás controles.',
      },
      {
        name: 'density',
        type: "'compact' | 'comfortable'",
        default: "'compact'",
        description:
          'Compacta (el alto de `size`) o cómoda (60px fijos), con `[(density)]`; la cambia el botón de la barra.',
      },
      {
        name: 'selection',
        type: 'unknown[]',
        default: '[]',
        description:
          'Ids de las filas elegidas, con `[(selection)]`. Sin `total`, al buscar o filtrar pierde las ocultas.',
      },
      {
        name: 'expanded',
        type: 'unknown[]',
        default: '[]',
        description: 'Ids de las filas con el detalle abierto, con `[(expanded)]`.',
      },
      {
        name: 'expandMode',
        type: "'single' | 'multiple'",
        default: "'multiple'",
        description: 'Con `single`, abrir una fila cierra la que estaba abierta.',
      },
      {
        name: 'sort',
        type: '{ column, direction } | null',
        default: 'null',
        description: 'El orden, con `[(sort)]`: ascendente, descendente o ninguno.',
      },
      {
        name: 'query',
        type: 'string',
        default: "''",
        description: 'La búsqueda global (sin tildes ni mayúsculas), con `[(query)]`.',
      },
      {
        name: 'filters',
        type: 'Record<string, unknown[]>',
        default: '{}',
        description: 'Los valores elegidos en el filtro de cada columna, con `[(filters)]`.',
      },
      {
        name: 'page · pageSize',
        type: 'number',
        default: '1 · 10',
        description: 'La página y su tamaño, con `[(page)]` y `[(pageSize)]`.',
      },
      {
        name: 'aria-label',
        type: 'string',
        default: '—',
        description: 'Nombre de la tabla y de su región de desplazamiento.',
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Clases del contenedor, mezcladas con `cn()`.',
      },
    ],
    outputs: [
      {
        name: 'queryChange · sortChange · filtersChange · pageChange · pageSizeChange',
        type: 'el valor nuevo',
        description:
          'En modo servidor piden otra página: escúchalos (o usa `[(…)]`) y devuelve `data` y `total`.',
      },
      {
        name: 'selectionChange · expandedChange · densityChange',
        type: 'el valor nuevo',
        description: 'Cambió la selección, el detalle abierto o la densidad.',
      },
    ],
    parts: [
      {
        name: 'MimiTableCell',
        selector: 'ng-template[mimiTableCell="<columna>"]',
        description: 'Celda a medida de una columna, con `let-row` y `let-value="value"`.',
      },
      {
        name: 'MimiTableDetail',
        selector: 'ng-template[mimiTableDetail]',
        description:
          'Detalle expandible de la fila (`let-row`, `let-toggle="toggle"` para cerrarlo); agrega la columna de la flecha.',
      },
      {
        name: 'MimiTableActions',
        selector: 'ng-template[mimiTableActions]',
        description:
          'Acciones de cada fila (`let-row`); con `let-toggle`, `let-open="expanded"` y `let-detailId`, un botón tuyo abre el detalle: ponle `aria-expanded` y `aria-controls`.',
      },
      {
        name: 'MimiTableBulk',
        selector: 'ng-template[mimiTableBulk]',
        description: 'Acciones de la barra cuando hay filas elegidas (`let-ids`).',
      },
      {
        name: 'MimiTableEmpty',
        selector: '[mimiTableEmpty]',
        description: 'Lo que va debajo de «sin datos» o «sin resultados», como un botón.',
      },
    ],
    dataAttributes: [
      'data-size',
      'data-density',
      'data-loading',
      'data-scrolled',
      'data-selected (en la fila)',
    ],
  },
  texts: [
    {
      constant: 'MIMI_DATA_TABLE_TEXT_ES',
      provider: 'provideMimiDataTableText',
      path: 'data-table/data-table-texts',
    },
    {
      constant: 'MIMI_PAGINATION_TEXT_ES',
      provider: 'provideMimiPaginationText',
      path: 'pagination/pagination-texts',
      note: 'el pie: páginas y filas por página',
    },
  ],
  tokens: 'dataTable',
};
