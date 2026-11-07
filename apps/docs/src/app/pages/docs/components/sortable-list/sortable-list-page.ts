import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_SORTABLE_TEXT_ES, provideMimiSortableText } from '@/components/ui/sortable-list';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { SortableListPrioritiesExample } from './examples/sortable-list-priorities.example';
import { SortableListSimpleExample } from './examples/sortable-list-simple.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import prioritiesSource from './examples/sortable-list-priorities.example' with { loader: 'text' };
// @ts-expect-error
import simpleSource from './examples/sortable-list-simple.example' with { loader: 'text' };

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

/** Documentación de Sortable List (tarea G3.2). */
@Component({
  selector: 'app-sortable-list-page',
  imports: [
    CodeBlock,
    CodePreview,
    CssVariables,
    InstallCommand,
    SortableListPrioritiesExample,
    SortableListSimpleExample,
  ],
  providers: [provideMimiSortableText(MIMI_SORTABLE_TEXT_ES)],
  templateUrl: './sortable-list-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortableListPage {
  protected readonly source = {
    priorities: prioritiesSource as string,
    simple: simpleSource as string,
  };

  protected readonly usage = [
    "import { MimiSortableListImports } from '@/components/ui/sortable-list';",
    '',
    '@Component({',
    '  imports: [MimiSortableListImports],',
    '  template: `',
    '    <mimi-sortable-list aria-label="Pasos" [(items)]="steps" [itemLabel]="name">',
    '      <ng-template mimiSortableItem let-step>{{ step.name }}</ng-template>',
    '    </mimi-sortable-list>',
    '  `,',
    '})',
    'export class StepsComponent {',
    "  steps = signal([{ name: 'Diseñar' }, { name: 'Construir' }]);",
    '  name = (step: { name: string }) => step.name;',
    '}',
  ].join('\n');

  protected readonly texts = [
    "import { MIMI_SORTABLE_TEXT_ES, provideMimiSortableText } from '@/components/ui/sortable-list';",
    '',
    '// app.config.ts',
    'providers: [provideMimiSortableText(MIMI_SORTABLE_TEXT_ES)],',
  ].join('\n');

  protected readonly api: ApiRow[] = [
    {
      name: 'items',
      type: 'T[]',
      default: '[]',
      description:
        'Los elementos, en orden. Al reordenar se escribe un arreglo nuevo ([(items)]); con el teclado, en cada paso, y Escape vuelve al orden de antes.',
    },
    {
      name: 'itemLabel',
      type: '(item: T) => string',
      default: 'String(item)',
      description: 'El nombre de cada elemento en su asa («Reordenar …») y en los anuncios.',
    },
    {
      name: 'trackBy',
      type: '(item: T) => unknown',
      default: 'el elemento',
      description: 'Clave estable de cada elemento (por ejemplo, su id): la usa la animación.',
    },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'No se puede reordenar.' },
    {
      name: 'aria-label',
      type: 'string',
      default: '—',
      description: 'Nombre de la lista (o aria-labelledby).',
    },
    {
      name: 'class',
      type: 'string',
      default: "''",
      description: 'Se mezcla con cn() en el anfitrión.',
    },
  ];

  protected readonly outputs: ApiRow[] = [
    {
      name: 'reordered',
      type: '{ item, previousIndex, currentIndex }',
      default: '—',
      description: 'Un elemento se soltó en otro lugar (con el puntero, el dedo o el teclado).',
    },
  ];
}
