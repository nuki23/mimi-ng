import type { DocPage } from '../../../../doc-page/doc-page.types';
import { SortableListPrioritiesExample } from './examples/sortable-list-priorities.example';
import { SortableListSimpleExample } from './examples/sortable-list-simple.example';
import { SortableListSizesExample } from './examples/sortable-list-sizes.example';
import { SortableListStatesExample } from './examples/sortable-list-states.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import prioritiesSource from './examples/sortable-list-priorities.example' with { loader: 'text' };
// @ts-expect-error
import simpleSource from './examples/sortable-list-simple.example' with { loader: 'text' };
// @ts-expect-error
import sizesSource from './examples/sortable-list-sizes.example' with { loader: 'text' };
// @ts-expect-error
import statesSource from './examples/sortable-list-states.example' with { loader: 'text' };

/** La página de Sortable List (G3.2), con la plantilla de página (DP.4). */
export const SORTABLE_LIST_PAGE: DocPage = {
  name: 'Sortable List',
  lead: 'Lista que se reordena arrastrando desde su asa, con el dedo o con el teclado, y que anuncia dónde quedó cada elemento.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      'Arrastra desde ⋮⋮, o enfoca el asa y usa Espacio y ↑ ↓: el orden nuevo se escribe en `[(items)]`.',
    component: SortableListSimpleExample,
    source: simpleSource as string,
  },
  install: 'sortable-list',
  usage: {
    code: [
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
    ].join('\n'),
    note: 'Con objetos, da `itemLabel`: nombra el asa y los anuncios. Sin plantilla, cada elemento se pinta como texto.',
  },
  examples: {
    sizes: [
      {
        id: 'sizes',
        title: 'Tamaños',
        sentence:
          '`size` cambia el alto de cada elemento y el hueco entre ellos. Las tres listas comparten el mismo `[(items)]`.',
        component: SortableListSizesExample,
        source: sizesSource as string,
      },
    ],
    states: [
      {
        id: 'states',
        title: 'Deshabilitada',
        sentence:
          'Con `disabled`, las asas quedan deshabilitadas: no se agarra ni se arrastra ningún elemento.',
        component: SortableListStatesExample,
        source: statesSource as string,
      },
    ],
    advanced: [
      {
        id: 'priorities',
        title: 'Prioridades, con contenido propio',
        sentence:
          'Todo lo que va al lado del asa es tuyo, en `<ng-template mimiSortableItem let-item let-index="index">`. `(reordered)` dice qué se movió.',
        component: SortableListPrioritiesExample,
        source: prioritiesSource as string,
      },
    ],
  },
  accessibility: {
    points: [
      'Cada asa es un botón: «Reordenar …» con el nombre de `itemLabel`, y las instrucciones en su descripción.',
      'Espacio o Enter agarran el elemento; ↑ y ↓ lo mueven, Inicio y Fin lo llevan a un extremo. El foco sigue al asa.',
      'Espacio o Enter lo sueltan y Escape lo devuelve a su lugar; si el foco sale del asa, se suelta donde está.',
      'Cada paso se anuncia («Diseñar Tabs: lugar 3 de 5») en la línea de debajo de la lista, que también se ve.',
      'Con el puntero o el dedo, solo se arrastra desde el asa: el resto se puede seleccionar y pulsar.',
      'Dale nombre a la lista con `aria-label` o `aria-labelledby`.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'items',
        type: 'T[]',
        default: '[]',
        description:
          'Los elementos, en orden, con `[(items)]`: al reordenar se escribe un arreglo nuevo.',
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
        description:
          'Clave estable de cada elemento, como su id, para la animación. Sin ella, los repetidos se identifican por su lugar.',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'No se puede reordenar.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md' (o el de `mimiSize`)",
        description: 'El alto de cada elemento y el hueco, con la escala del tema.',
      },
      {
        name: 'aria-label / aria-labelledby',
        type: 'string',
        default: '—',
        description: 'Nombre de la lista.',
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Clases del anfitrión, mezcladas con `cn()`.',
      },
    ],
    outputs: [
      {
        name: 'itemsChange',
        type: 'T[]',
        description: 'El orden nuevo; con el teclado, en cada paso (Escape vuelve al de antes).',
      },
      {
        name: 'reordered',
        type: 'MimiSortableReorder<T>',
        description:
          '`{ item, previousIndex, currentIndex }` al soltar un elemento en otro lugar, con el puntero, el dedo o el teclado.',
      },
    ],
    parts: [
      {
        name: 'MimiSortableItemTemplate',
        selector: 'ng-template[mimiSortableItem]',
        description:
          'Contenido de cada elemento, al lado del asa: `let-item`, `let-index="index"` y `let-grabbed="grabbed"`.',
      },
    ],
    dataAttributes: [
      'data-disabled',
      'data-sorting',
      'data-size',
      'data-grabbed (en el elemento)',
      'data-index (en el elemento)',
    ],
  },
  texts: [
    {
      constant: 'MIMI_SORTABLE_TEXT_ES',
      provider: 'provideMimiSortableText',
      path: 'sortable-list/sortable-list-texts',
    },
  ],
  tokens: 'sortable',
};
