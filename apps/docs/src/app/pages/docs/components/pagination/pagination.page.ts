import type { DocPage } from '../../../../doc-page/doc-page.types';
import { PaginationBasicExample } from './examples/pagination-basic.example';
import { PaginationControlledExample } from './examples/pagination-controlled.example';
import { PaginationFloatingExample } from './examples/pagination-floating.example';
import { PaginationPageSizeExample } from './examples/pagination-page-size.example';
import { PaginationSizesExample } from './examples/pagination-sizes.example';
import { PaginationTableExample } from './examples/pagination-table.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import basicSource from './examples/pagination-basic.example' with { loader: 'text' };
// @ts-expect-error
import clientsSource from './examples/clients' with { loader: 'text' };
// @ts-expect-error
import controlledSource from './examples/pagination-controlled.example' with { loader: 'text' };
// @ts-expect-error
import floatingSource from './examples/pagination-floating.example' with { loader: 'text' };
// @ts-expect-error
import pageSizeSource from './examples/pagination-page-size.example' with { loader: 'text' };
// @ts-expect-error
import sizesSource from './examples/pagination-sizes.example' with { loader: 'text' };
// @ts-expect-error
import tableSource from './examples/pagination-table.example' with { loader: 'text' };

const clientsFile = { name: 'clients.ts', code: clientsSource as string };

/** La página de Pagination (G1.11), con la plantilla de página (DP.4). */
export const PAGINATION_PAGE: DocPage = {
  name: 'Pagination',
  lead: 'Píldora compacta para moverse entre páginas: anterior, la página que se puede escribir, el total, siguiente y los registros por página.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      'Cambia de página con las flechas o escribiéndola. Al cambiar los registros por página, se sigue viendo el primero que estaba visible.',
    component: PaginationPageSizeExample,
    source: pageSizeSource as string,
  },
  install: 'pagination',
  usage: {
    code: [
      "import { MimiPagination } from '@/components/ui/pagination';",
      '',
      '@Component({',
      '  imports: [MimiPagination],',
      '  template: `',
      '    <mimi-pagination',
      '      [(page)]="page"',
      '      [(pageSize)]="pageSize"',
      '      [total]="total()"',
      '      [pageSizeOptions]="[10, 25, 50]"',
      '      (paginate)="load($event)"',
      '    />',
      '  `,',
      '})',
      'export class ClientsComponent {',
      '  page = signal(1);',
      '  pageSize = signal(10);',
      '  total = signal(240);',
      '}',
    ].join('\n'),
    note: '`total` es el número de registros, no de páginas; la página empieza en 1. `(paginate)` avisa una vez por acción.',
  },
  examples: {
    sizes: [
      {
        id: 'sizes',
        title: 'Tamaños',
        sentence:
          '`sm` (por defecto), `md` y `lg`, con la escala de alturas de Button e Input. Las tres comparten la página.',
        component: PaginationSizesExample,
        source: sizesSource as string,
      },
    ],
    variants: [
      {
        id: 'floating',
        title: 'Flotante',
        sentence:
          '`variant="floating"` pone la sombra; la posición (centrada abajo) va en `class`. La tabla deja libre el espacio final.',
        component: PaginationFloatingExample,
        source: floatingSource as string,
        files: [
          { name: 'pagination-floating.example.ts', code: floatingSource as string },
          clientsFile,
        ],
      },
    ],
    advanced: [
      {
        id: 'basic',
        title: 'Escribir la página',
        sentence:
          'Escribe una página y pulsa Enter. Un número que no existe muestra «Entre 1 y 12»; Escape o salir del campo lo deshacen.',
        component: PaginationBasicExample,
        source: basicSource as string,
      },
      {
        id: 'controlled',
        title: 'Controlada',
        sentence:
          'La página se cambia desde fuera con `[(page)]`; solo las acciones en la paginación emiten `(paginate)`.',
        component: PaginationControlledExample,
        source: controlledSource as string,
      },
      {
        id: 'table',
        title: 'Con una tabla',
        sentence: 'En línea, a la derecha, debajo de la tabla, con el rango a la izquierda.',
        component: PaginationTableExample,
        source: tableSource as string,
        files: [{ name: 'pagination-table.example.ts', code: tableSource as string }, clientsFile],
      },
    ],
  },
  accessibility: {
    points: [
      'Es una región de navegación (`role="navigation"`) con nombre. Cada control es una parada de Tab, y el campo usa sus flechas: ↑ y ↓ pasan de página.',
      'En la primera y la última página, ← y → quedan `aria-disabled`: el foco no se pierde al llegar y Enter o Espacio no hacen nada.',
      'El campo se llama «Página, de 12»; el «/ 12» visible no se lee dos veces. Un número inválido se anuncia con el globo de error.',
      'Al cambiar de página, un lector de pantalla oye «Página 3 de 12»; los cambios desde fuera no se anuncian.',
      'En pantallas de menos de 640px se oculta el selector de registros: queda ← página / total →.',
      'Con dos paginaciones en la misma página, dale a cada una un `aria-label` distinto.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'page',
        type: 'number',
        default: '1',
        description:
          'La página, desde 1, con `[(page)]`. Si llega fuera de rango, se pinta acotada sin reescribirla.',
      },
      {
        name: 'pageSize',
        type: 'number',
        default: '10',
        description: 'Registros por página, con `[(pageSize)]`.',
      },
      {
        name: 'total',
        type: 'number',
        default: '—',
        description: 'Número total de registros (no de páginas). Obligatorio.',
      },
      {
        name: 'pageSizeOptions',
        type: 'number[]',
        default: '[]',
        description:
          'Tamaños para elegir. Vacío, sin selector (y sin cargar Select). En móvil el selector se oculta.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'sm'",
        description:
          'El alto, con la escala de Button e Input. `default` es el nombre viejo de `md`.',
      },
      {
        name: 'variant',
        type: "'inline' | 'floating'",
        default: "'inline'",
        description: '`floating` solo cambia la sombra; la posición se da con `class`.',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'Nada cambia (por ejemplo, mientras carga), sin sacar el foco de donde esté.',
      },
      {
        name: 'aria-label',
        type: 'string',
        default: "'Pagination'",
        description: 'Nombre de la región (por defecto, el de los textos).',
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Clases de la píldora, mezcladas con `cn()`: las tuyas ganan.',
      },
      {
        name: 'pageCount (solo lectura)',
        type: 'Signal<number>',
        default: '—',
        description:
          'Número de páginas, para leerlo con `viewChild`; por ejemplo, para corregir una página fuera de rango.',
      },
    ],
    outputs: [
      {
        name: 'paginate',
        type: 'MimiPaginationEvent',
        description:
          '`{ page, pageSize }` una vez por acción del usuario, con el estado final. Los cambios desde fuera no emiten.',
      },
      { name: 'pageChange', type: 'number', description: 'Cambió la página.' },
      { name: 'pageSizeChange', type: 'number', description: 'Cambió el tamaño de página.' },
    ],
    dataAttributes: ['data-size', 'data-variant', 'data-disabled'],
  },
  texts: [
    {
      constant: 'MIMI_PAGINATION_TEXT_ES',
      provider: 'provideMimiPaginationText',
      path: 'pagination/pagination-texts',
    },
  ],
  tokens: 'pagination',
};
