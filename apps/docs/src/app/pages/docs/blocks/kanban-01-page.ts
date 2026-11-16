import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlock } from '../../../code/code-block';
import { BlockDoc, type BlockApiRow, type BlockComponent, type BlockFile } from './block-doc';
import type { BlockState } from './block-frame';
// Los archivos reales del Block, como texto (spec 10: TypeScript no tipa los import attributes).
// @ts-expect-error
import tsSource from '@/blocks/kanban-01/kanban-01' with { loader: 'text' };
// @ts-expect-error
import htmlSource from '@/blocks/kanban-01/kanban-01.html' with { loader: 'text' };
import { pageFiles, pageInfo } from './page-code';

/** Página del Block kanban-01 (R.22). */
@Component({
  selector: 'app-kanban-01-page',
  imports: [BlockDoc, CodeBlock],
  template: `
    <app-block-doc
      name="kanban-01"
      kind="page"
      description="Un tablero con tres columnas («To do», «In progress», «Done»): las tarjetas, con su etiqueta y su responsable, se mueven entre columnas con el puntero, el dedo o el teclado."
      [components]="components"
      [files]="files"
      [inputs]="inputs"
      [outputs]="outputs"
      [states]="states"
    >
      <p class="text-pretty">
        Es tu página: pega la línea en tus rutas y dale tu tablero con
        <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]">[(columns)]</code>
        (sin él, el del ejemplo). El Block no guarda nada: al mover una tarjeta cambia
        <code class="font-mono text-[13px]">columns</code> y
        <code class="font-mono text-[13px]">(moved)</code> te dice qué se movió y adónde, para tu
        servidor. Una columna con <code class="font-mono text-[13px]">limit</code> no acepta más
        tarjetas. En móvil, las columnas se desplazan en horizontal.
      </p>
      <app-code-block [code]="usage" lang="angular-ts" />
      <h3 id="accessibility" class="mt-2 text-lg font-semibold tracking-[-0.01em]">
        Accesibilidad
      </h3>
      <ul class="flex list-disc flex-col gap-1.5 pl-5 text-pretty">
        <li>
          Un solo <code class="font-mono text-[13px]">h1</code>; cada columna, un
          <code class="font-mono text-[13px]">h2</code>, y su lista se nombra con el título y el
          número de tarjetas.
        </li>
        <li>
          Con el teclado: Espacio o Enter en el asa agarran la tarjeta, ↑ ↓ la mueven, ← → la pasan
          de columna y Escape la devuelve; cada paso se anuncia.
        </li>
        <li>
          «Add card» se describe con el título de su columna. El responsable es un Avatar con su
          nombre (no solo las iniciales).
        </li>
        <li>
          Cargando, el tablero queda inerte y con
          <code class="font-mono text-[13px]">aria-busy</code>, y se anuncia.
        </li>
      </ul>
    </app-block-doc>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Kanban01Page {
  protected readonly usage = [
    '// app.routes.ts (la línea que te da ng g mimi)',
    pageInfo('kanban-01').routeLine,
    '',
    '// O dentro de otra página tuya, con tus datos:',
    '<app-kanban-page [(columns)]="board" (moved)="save($event)" (addCard)="create($event)" />',
  ].join('\n');

  protected readonly components: BlockComponent[] = [
    { name: 'sortable-list', path: '/docs/components/sortable-list' },
    { name: 'avatar', path: '/docs/components/avatar' },
    { name: 'badge', path: '/docs/components/badge' },
    { name: 'button', path: '/docs/components/button' },
  ];

  /** Como los genera ng g mimi kanban-01 (B.11). */
  protected readonly files: BlockFile[] = pageFiles(
    'kanban-01',
    tsSource as string,
    htmlSource as string,
  );

  protected readonly states: BlockState[] = [
    { id: 'empty', label: 'Una columna vacía' },
    { id: 'loading', label: 'Cargando' },
  ];

  protected readonly inputs: BlockApiRow[] = [
    {
      name: 'columns',
      type: 'Kanban01Column[]',
      default: 'el del ejemplo',
      description: 'id, title, cards y limit. Admite [(columns)].',
    },
    { name: 'heading', type: 'string', default: "'Board'", description: 'El título (h1).' },
    {
      name: 'description',
      type: 'string',
      default: 'la del ejemplo',
      description: 'Bajo el título.',
    },
    { name: 'loading', type: 'boolean', default: 'false', description: 'Todo inerte (R.11).' },
    { name: 'class', type: 'string', default: "''", description: 'Se mezcla con cn().' },
  ];

  protected readonly outputs: BlockApiRow[] = [
    {
      name: 'moved',
      type: 'MimiSortableMove<Kanban01Card>',
      default: '—',
      description: 'Una tarjeta pasó a otra columna (from.list y to.list son los id).',
    },
    {
      name: 'reordered',
      type: '{ column, card, from, to }',
      default: '—',
      description: 'Una tarjeta cambió de lugar en su columna.',
    },
    {
      name: 'addCard',
      type: 'string',
      default: '—',
      description: '«Add card»: el id de la columna.',
    },
  ];
}
