import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_PAGINATION_TEXT_ES, provideMimiPaginationText } from '@/components/ui/pagination';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
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
import controlledSource from './examples/pagination-controlled.example' with { loader: 'text' };
// @ts-expect-error
import floatingSource from './examples/pagination-floating.example' with { loader: 'text' };
// @ts-expect-error
import pageSizeSource from './examples/pagination-page-size.example' with { loader: 'text' };
// @ts-expect-error
import sizesSource from './examples/pagination-sizes.example' with { loader: 'text' };
// @ts-expect-error
import tableSource from './examples/pagination-table.example' with { loader: 'text' };

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

/** Documentación de Pagination (tarea G1.11). Los textos en español se proveen en la página. */
@Component({
  selector: 'app-pagination-page',
  imports: [
    CodeBlock,
    CodePreview,
    CssVariables,
    InstallCommand,
    PaginationBasicExample,
    PaginationControlledExample,
    PaginationFloatingExample,
    PaginationPageSizeExample,
    PaginationSizesExample,
    PaginationTableExample,
  ],
  providers: [provideMimiPaginationText(MIMI_PAGINATION_TEXT_ES)],
  templateUrl: './pagination-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationPage {
  protected readonly source = {
    basic: basicSource as string,
    controlled: controlledSource as string,
    floating: floatingSource as string,
    pageSize: pageSizeSource as string,
    sizes: sizesSource as string,
    table: tableSource as string,
  };

  protected readonly usage = [
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
  ].join('\n');

  protected readonly textsUsage = [
    "import { MIMI_PAGINATION_TEXT_ES, provideMimiPaginationText } from '@/components/ui/pagination';",
    '',
    '// app.config.ts (o los providers de una ruta o componente)',
    'providers: [provideMimiPaginationText(MIMI_PAGINATION_TEXT_ES)]',
  ].join('\n');

  protected readonly api: ApiRow[] = [
    {
      name: 'page',
      type: 'number',
      default: '1',
      description:
        'La página, desde 1. Admite [(page)]. Si llega fuera de rango, se pinta acotada sin reescribirla.',
    },
    {
      name: 'pageSize',
      type: 'number',
      default: '10',
      description: 'Registros por página. Admite [(pageSize)].',
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
    { name: 'size', type: "'sm' | 'md'", default: "'sm'", description: '40px o 50px de alto.' },
    {
      name: 'variant',
      type: "'inline' | 'floating'",
      default: "'inline'",
      description: 'floating solo cambia la sombra; la posición se da con class.',
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
      description:
        'Nombre de la región. Con dos paginaciones en la página, uno distinto para cada una.',
    },
    {
      name: 'class',
      type: 'string',
      default: "''",
      description: 'Clases de la píldora, mezcladas con cn().',
    },
    {
      name: '(paginate)',
      type: '{ page, pageSize }',
      default: '—',
      description:
        'Una vez por acción del usuario, con el estado final (cambiar el tamaño mueve también la página). Los cambios desde fuera no la emiten.',
    },
    {
      name: 'pageCount',
      type: 'Signal<number>',
      default: '—',
      description:
        'Número de páginas (de solo lectura), por ejemplo para corregir una página fuera de rango.',
    },
  ];
}
