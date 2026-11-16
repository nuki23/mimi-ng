import type { DocPage } from '../../../../doc-page/doc-page.types';
import { TableDemoExample } from './examples/table-demo.example';
import { TableExpandExample } from './examples/table-expand.example';
import { TableSizesExample } from './examples/table-sizes.example';
import { TableStateExample } from './examples/table-state.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import demoSource from './examples/table-demo.example' with { loader: 'text' };
// @ts-expect-error
import expandSource from './examples/table-expand.example' with { loader: 'text' };
// @ts-expect-error
import sizesSource from './examples/table-sizes.example' with { loader: 'text' };
// @ts-expect-error
import stateSource from './examples/table-state.example' with { loader: 'text' };

/** La página de Table (R.20, PD-2 opción C), con la plantilla de página. */
export const TABLE_PAGE: DocPage = {
  name: 'Table',
  lead: 'Tu `<table>` con `@for` y `@if`, con el aspecto de Mimi, y un estado sin interfaz para ordenar, buscar, paginar, elegir y expandir filas.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      'Ordena con los encabezados; el estado de cada factura es un `@if` y el total, una fila más.',
    component: TableDemoExample,
    source: demoSource as string,
  },
  install: 'table',
  usage: {
    code: [
      "import { MimiTableImports, mimiTableState } from '@/components/ui/table';",
      '',
      '@Component({',
      '  imports: [MimiTableImports],',
      '  template: `',
      '    <table mimiTable>',
      '      <thead mimiThead><tr><th mimiTh [sort]="table.sort(\'name\')">Nombre</th></tr></thead>',
      '      <tbody mimiTbody>',
      '        @for (row of table.rows(); track row.id) {',
      '          <tr mimiTr><td mimiTd>{{ row.data.name }}</td></tr>',
      '        }',
      '      </tbody>',
      '    </table>',
      '  `,',
      '})',
      'export class PeopleComponent {',
      "  table = mimiTableState(this.people, { columns: ['name'] });",
      '}',
    ].join('\n'),
    note: 'Las directivas solo dan el aspecto; el estado es opcional. Con barra y filtros hechos, la Data Table.',
  },
  examples: {
    sizes: [
      {
        id: 'sizes',
        title: 'Tamaños',
        sentence: 'Con `size` en la tabla: filas de 34, 42 o 50 px y cabecera de 32, 38 o 44 px.',
        component: TableSizesExample,
        source: sizesSource as string,
      },
    ],
    advanced: [
      {
        id: 'expand',
        title: 'Expandir filas',
        sentence:
          'Un botón con `mimiRowToggle` abre la fila de detalle que escribes con `@if (row.expanded())`; aquí, una a la vez.',
        component: TableExpandExample,
        source: expandSource as string,
      },
      {
        id: 'state',
        title: 'Buscar, elegir y paginar',
        sentence:
          'El mismo estado da la búsqueda, la casilla de la página, la selección por fila y la paginación.',
        component: TableStateExample,
        source: stateSource as string,
      },
    ],
  },
  accessibility: {
    points: [
      'Es la `<table>` nativa: los lectores la recorren como tabla. Nómbrala con `<caption mimiCaption>` o `aria-label`.',
      '`mimiTh` lleva `scope="col"`; en una fila de totales, `scope="row"`.',
      'Con `[sort]`, el texto del encabezado va en un botón y la columna lleva `aria-sort`.',
      '`mimiRowToggle` pone `aria-expanded` y, con `controls`, `aria-controls` al detalle. El nombre del botón es tuyo.',
      'Las casillas de selección necesitan su nombre: «Elegir a Ana».',
    ],
  },
  api: {
    inputs: [
      {
        name: 'size (en la tabla)',
        type: "'sm' | 'md' | 'lg'",
        default: "'md' (o el del contenedor con mimiSize)",
        description: 'Alto de las filas y de la cabecera.',
      },
      {
        name: 'sort (en mimiTh)',
        type: 'MimiTableSortHandle',
        default: '—',
        description: 'De `table.sort(columna)`: el botón que ordena y `aria-sort`.',
      },
      {
        name: 'align (en mimiTh y mimiTd)',
        type: "'start' | 'end'",
        default: "'start'",
        description: '`end` para cifras.',
      },
      {
        name: 'selected (en mimiTr)',
        type: 'boolean',
        default: 'false',
        description: 'El fondo de fila elegida (`data-selected`).',
      },
      {
        name: 'row / controls (en mimiRowToggle)',
        type: 'MimiTableRow / string',
        default: '—',
        description: 'La fila que abre y el `id` de su detalle.',
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'En todas las piezas. Se mezcla con `cn()`: tus clases ganan.',
      },
    ],
    parts: [
      {
        name: 'MimiTable',
        selector: 'table[mimiTable]',
        description: 'La tabla: ancho, texto y `size`.',
      },
      {
        name: 'MimiThead / MimiTbody',
        selector: 'thead[mimiThead], tbody[mimiTbody]',
        description: 'Las secciones (para `class`).',
      },
      { name: 'MimiTr', selector: 'tr[mimiTr]', description: 'Una fila: hover y elegida.' },
      {
        name: 'MimiTh / MimiTd',
        selector: 'th[mimiTh], td[mimiTd]',
        description: 'Encabezado y celda, con el alto, el borde y el relleno de la escala.',
      },
      { name: 'MimiCaption', selector: 'caption[mimiCaption]', description: 'El título.' },
      {
        name: 'MimiRowToggle',
        selector: 'button[mimiRowToggle]',
        description: 'Abre o cierra una fila de `mimiTableState`.',
      },
    ],
    service: [
      {
        name: 'mimiTableState(data, options)',
        type: 'MimiTableState<T>',
        description:
          '`columns`, `rowId`, `pageSize`, `expandMode` y `total` (servidor). Señales sin efectos: no pide contexto de inyección.',
      },
      {
        name: 'rows()',
        type: 'MimiTableRow<T>[]',
        description:
          'Las filas de la página: `id`, `data`, `selected()`, `expanded()`, `toggle()` y `toggleSelected()`.',
      },
      {
        name: 'query / filters / sorting / page / pageSize / selection / expanded',
        type: 'WritableSignal',
        description: 'El estado, para leerlo o fijarlo.',
      },
      {
        name: 'sort(col) · search(q) · toggleFilter(col, v) · togglePage(b) · clear()',
        type: 'métodos',
        description: 'Cambian el estado y vuelven a la página 1 cuando hace falta.',
      },
      {
        name: 'count() · pageCount() · currentPage() · pageSelection() · narrowed()',
        type: 'Signal',
        description: 'Lo calculado: filas tras buscar y filtrar, páginas, la de la casilla.',
      },
    ],
    dataAttributes: ['data-size', 'data-selected', 'data-sorted'],
  },
  tokens: 'dataTable',
};
