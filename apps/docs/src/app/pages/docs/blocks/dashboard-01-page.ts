import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlock } from '../../../code/code-block';
import { BlockDoc, type BlockApiRow, type BlockComponent, type BlockFile } from './block-doc';
import type { BlockState } from './block-frame';
// Los archivos reales del Block, como texto (spec 10: TypeScript no tipa los import attributes).
// @ts-expect-error
import tsSource from '@/blocks/dashboard-01/dashboard-01' with { loader: 'text' };
// @ts-expect-error
import htmlSource from '@/blocks/dashboard-01/dashboard-01.html' with { loader: 'text' };
import { pageFiles, pageInfo } from './page-code';

/** Página del Block dashboard-01 (B.8). */
@Component({
  selector: 'app-dashboard-01-page',
  imports: [BlockDoc, CodeBlock],
  template: `
    <app-block-doc
      name="dashboard-01"
      kind="page"
      description="La pantalla de inicio de una aplicación: menú lateral (un Sheet en el teléfono), saludo, cuatro métricas, los ingresos por mes, la actividad y los clientes recientes."
      [components]="components"
      [files]="files"
      [inputs]="inputs"
      [outputs]="outputs"
      [states]="states"
    >
      <p class="text-pretty">
        Es tu página: pega la línea en tus rutas y dale tus datos con sus entradas (sin ellas, los
        del ejemplo). El menú cambia
        <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]">[(active)]</code>:
        conéctalo a tus rutas. Los números son fijos y la actividad es una lista: cuando lleguen
        Number Ticker y Timeline, puedes cambiarlos.
      </p>
      <app-code-block [code]="usage" lang="angular-ts" />
      <h3 id="accessibility" class="mt-2 text-lg font-semibold tracking-[-0.01em]">
        Accesibilidad
      </h3>
      <ul class="flex list-disc flex-col gap-1.5 pl-5 text-pretty">
        <li>
          Un solo <code class="font-mono text-[13px]">h1</code>; cada tarjeta, un
          <code class="font-mono text-[13px]">h2</code> que nombra su región o su tabla.
        </li>
        <li>
          El menú es un <code class="font-mono text-[13px]">nav</code> con nombre; el activo lleva
          <code class="font-mono text-[13px]">aria-current="page"</code>. En el teléfono, «Open
          menu» abre un Sheet: el foco entra y vuelve al botón al cerrar.
        </li>
        <li>
          Las barras de ingresos son decorativas; sus valores van en una lista para los lectores.
        </li>
        <li>
          Cargando, la pantalla queda inerte y con
          <code class="font-mono text-[13px]">aria-busy</code>, y se anuncia.
        </li>
      </ul>
    </app-block-doc>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard01Page {
  protected readonly usage = [
    '// app.routes.ts (la línea que te da ng g mimi)',
    pageInfo('dashboard-01').routeLine,
    '',
    '// O dentro de otra página tuya, con tus datos:',
    '<app-dashboard-page [stats]="stats" [customers]="recent" (newCustomer)="create()" />',
  ].join('\n');

  protected readonly components: BlockComponent[] = [
    { name: 'card', path: '/docs/components/card' },
    { name: 'table', path: '/docs/components/table' },
    { name: 'sheet', path: '/docs/components/sheet' },
    { name: 'avatar', path: '/docs/components/avatar' },
    { name: 'badge', path: '/docs/components/badge' },
    { name: 'button', path: '/docs/components/button' },
  ];

  /** Como los genera ng g mimi dashboard-01 (B.11). */
  protected readonly files: BlockFile[] = pageFiles(
    'dashboard-01',
    tsSource as string,
    htmlSource as string,
  );

  protected readonly states: BlockState[] = [
    { id: 'empty', label: 'Sin clientes ni actividad' },
    { id: 'loading', label: 'Cargando' },
  ];

  protected readonly inputs: BlockApiRow[] = [
    {
      name: 'stats',
      type: 'Dashboard01Stat[]',
      default: 'las del ejemplo',
      description: 'label, value (con formato), change y tone.',
    },
    {
      name: 'revenue',
      type: 'Dashboard01Month[]',
      default: 'el del ejemplo',
      description: 'month y value (en miles).',
    },
    {
      name: 'customers',
      type: 'Dashboard01Customer[]',
      default: 'los del ejemplo',
      description: 'id, name, plan, status y mrr.',
    },
    {
      name: 'activity',
      type: 'Dashboard01Activity[]',
      default: 'la del ejemplo',
      description: 'id, who, what y when.',
    },
    {
      name: 'nav',
      type: 'Dashboard01NavGroup[]',
      default: 'el del ejemplo',
      description: 'Grupos del menú con sus ítems.',
    },
    { name: 'active', type: 'string', default: "'home'", description: 'Ítem activo: [(active)].' },
    {
      name: 'user',
      type: '{ name, role }',
      default: 'Ana Torres',
      description: 'Quién usa la app (saludo y pie del menú).',
    },
    { name: 'appName', type: 'string', default: "'Mimi Sales'", description: 'Nombre del menú.' },
    { name: 'currency', type: 'string', default: "'USD'", description: 'Moneda del MRR.' },
    { name: 'loading', type: 'boolean', default: 'false', description: 'Todo inerte (R.11).' },
    { name: 'class', type: 'string', default: "''", description: 'Se mezcla con cn().' },
  ];

  protected readonly outputs: BlockApiRow[] = [
    { name: 'newCustomer', type: 'void', default: '—', description: '«New customer».' },
    {
      name: 'viewAllCustomers',
      type: 'void',
      default: '—',
      description: '«View all» de los clientes recientes.',
    },
    { name: 'activeChange', type: 'string', default: '—', description: 'Se eligió otro ítem.' },
  ];
}
