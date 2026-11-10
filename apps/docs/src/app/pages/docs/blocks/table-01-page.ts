import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlock } from '../../../code/code-block';
import { BlockDoc, type BlockApiRow, type BlockComponent, type BlockFile } from './block-doc';
import type { BlockState } from './block-frame';
// Los archivos reales del Block, como texto (spec 10: TypeScript no tipa los import attributes).
// @ts-expect-error
import tsSource from '@/blocks/table-01/table-01' with { loader: 'text' };
// @ts-expect-error
import htmlSource from '@/blocks/table-01/table-01.html' with { loader: 'text' };
import { pageFiles, pageInfo } from './page-code';

/** Página del Block table-01 (B.9). */
@Component({
  selector: 'app-table-01-page',
  imports: [BlockDoc, CodeBlock],
  template: `
    <app-block-doc
      name="table-01"
      kind="page"
      description="La pantalla «Clientes»: en escritorio, un resumen por estado y la Data Table (buscar, filtrar, ordenar, paginar y elegir filas); en móvil, una lista de tarjetas con búsqueda, píldoras y una barra de acciones."
      [components]="components"
      [files]="files"
      [inputs]="inputs"
      [outputs]="outputs"
      [states]="states"
    >
      <p class="text-pretty">
        Es tu página: pega la línea en tus rutas, dale tus clientes con
        <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]">customers</code>
        (sin ellos, los 36 del ejemplo) y conecta las acciones con tu servicio. Para miles de
        clientes, pasa la Data Table a modo servidor (<code class="font-mono text-[13px]"
          >[total]</code
        >) en
        <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]">table.html</code>.
        Cambia el ancho entre las dos vistas con el punto de corte
        <code class="font-mono text-[13px]">md</code> de la plantilla.
      </p>
      <app-code-block [code]="usage" lang="angular-ts" />
      <h3 id="accessibility" class="mt-2 text-lg font-semibold tracking-[-0.01em]">
        Accesibilidad
      </h3>
      <ul class="flex list-disc flex-col gap-1.5 pl-5 text-pretty">
        <li>
          Un solo <code class="font-mono text-[13px]">h1</code>; el Block no pone
          <code class="font-mono text-[13px]">main</code>.
        </li>
        <li>
          La vista que no se ve (escritorio o móvil) está con
          <code class="font-mono text-[13px]">display: none</code>: no se lee dos veces.
        </li>
        <li>
          La Data Table es una tabla nativa (ver su página); la lista móvil usa casillas con su
          nombre («Select Hotel Brisa 1») y las píldoras son botones con
          <code class="font-mono text-[13px]">aria-pressed</code>.
        </li>
        <li>
          El número de resultados y las filas elegidas se anuncian en regiones de estado; la barra
          de acciones móvil es un <code class="font-mono text-[13px]">toolbar</code> con nombre.
        </li>
      </ul>
    </app-block-doc>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Table01Page {
  protected readonly usage = [
    '// app.routes.ts (la línea que te da ng g mimi)',
    pageInfo('table-01').routeLine,
    '',
    '// O dentro de otra página tuya, con tus datos:',
    '<app-table-page',
    '  [customers]="customers()"',
    '  currency="EUR"',
    '  [(selection)]="selection"',
    '  (newCustomer)="create()"',
    '  (deleted)="remove($event)"',
    '/>',
  ].join('\n');

  protected readonly components: BlockComponent[] = [
    { name: 'data-table', path: '/docs/components/data-table' },
    { name: 'badge', path: '/docs/components/badge' },
    { name: 'button', path: '/docs/components/button' },
    { name: 'checkbox', path: '/docs/components/checkbox' },
    { name: 'input', path: '/docs/components/input' },
  ];

  /** Como los genera ng g mimi table-01 (B.11). */
  protected readonly files: BlockFile[] = pageFiles(
    'table-01',
    tsSource as string,
    htmlSource as string,
  );

  protected readonly states: BlockState[] = [
    { id: 'selected', label: 'Con filas elegidas' },
    { id: 'loading', label: 'Cargando' },
  ];

  protected readonly inputs: BlockApiRow[] = [
    {
      name: 'customers',
      type: 'Table01Customer[]',
      default: 'los 36 del ejemplo',
      description: 'id, name, email, status, plan, mrr, users, country.',
    },
    { name: 'currency', type: 'string', default: "'USD'", description: 'Moneda (ISO 4217).' },
    {
      name: 'locale',
      type: 'string',
      default: 'LOCALE_ID',
      description: 'Idioma de los números (Intl.NumberFormat).',
    },
    {
      name: 'selection',
      type: 'unknown[]',
      default: '[]',
      description: 'Ids de las filas elegidas. Admite [(selection)].',
    },
    { name: 'class', type: 'string', default: "''", description: 'Se mezcla con cn().' },
  ];

  protected readonly outputs: BlockApiRow[] = [
    { name: 'newCustomer', type: 'void', default: '—', description: '«New customer».' },
    { name: 'importCsv', type: 'void', default: '—', description: '«Import CSV» (escritorio).' },
    {
      name: 'exported',
      type: 'unknown[]',
      default: '—',
      description: '«Export»: los ids elegidos.',
    },
    {
      name: 'deleted',
      type: 'unknown[]',
      default: '—',
      description: '«Delete»: los ids elegidos. Quítalos tú de customers.',
    },
  ];
}
