import type { DocPage } from '../../../../doc-page/doc-page.types';
import { TreeDemoExample } from './examples/tree-demo.example';
import { TreeFilesExample } from './examples/tree-files.example';
import { TreePermissionsExample } from './examples/tree-permissions.example';
import { TreeStatesExample } from './examples/tree-states.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import demoSource from './examples/tree-demo.example' with { loader: 'text' };
// @ts-expect-error
import filesDataSource from './examples/files' with { loader: 'text' };
// @ts-expect-error
import filesSource from './examples/tree-files.example' with { loader: 'text' };
// @ts-expect-error
import permissionsSource from './examples/tree-permissions.example' with { loader: 'text' };
// @ts-expect-error
import statesSource from './examples/tree-states.example' with { loader: 'text' };

/** La página de Tree (G3.1), con la plantilla de página (DP.4). */
export const TREE_PAGE: DocPage = {
  name: 'Tree',
  lead: 'Árbol para jerarquías que se abren y se cierran, como archivos, categorías o permisos: elige un nodo o marca varios con casillas.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      'Haz clic en una carpeta para abrirla y en un archivo para elegirlo, o recórrelo con las flechas.',
    component: TreeDemoExample,
    source: demoSource as string,
  },
  install: 'tree',
  usage: {
    code: [
      "import { MimiTreeImports, type MimiTreeNode } from '@/components/ui/tree';",
      '',
      '@Component({',
      '  imports: [MimiTreeImports],',
      '  template: `<mimi-tree aria-label="Archivos" [nodes]="nodes" [(value)]="selected" />`,',
      '})',
      'export class FilesComponent {',
      '  nodes: MimiTreeNode[] = [',
      "    { id: 'src', label: 'src', children: [{ id: 'main', label: 'main.ts' }] },",
      "    { id: 'readme', label: 'README.md' },",
      '  ];',
      '  selected = signal<string | null | string[]>(null);',
      '}',
    ].join('\n'),
    note: 'Cada `id` es único en el árbol y es lo que lleva `value` (con `multiple`, la lista de marcados).',
    more: {
      summary: 'Los campos de cada nodo (`MimiTreeNode`) y la carga diferida',
      items: [
        '`id`: único en todo el árbol; es lo que lleva `value`.',
        '`label`: el texto del nodo (y el de la búsqueda por letra).',
        '`children`: los hijos ya conocidos.',
        '`meta`: un dato a la derecha (tamaño, cantidad), en letra monoespaciada.',
        '`disabled`: se enfoca y se abre, pero no se elige ni se marca.',
        '`data`: lo que quieras llevar con el nodo; lo recibe tu plantilla.',
        '`hasChildren`: tiene hijos que se piden la primera vez que se abre, con `loadChildren`.',
        '`loadChildren` recibe el nodo y devuelve una promesa con sus hijos, por ejemplo `firstValueFrom(this.http.get(…))`.',
        'Mientras llegan, el nodo muestra «Cargando…»; si la carga falla, muestra el error y se reintenta al volver a abrirlo.',
      ],
    },
  },
  examples: {
    states: [
      {
        id: 'states',
        title: 'Deshabilitado',
        sentence:
          'Un nodo con `disabled` se enfoca y se abre, pero no se elige; con `disabled` en el árbol, se recorre sin cambiar nada.',
        component: TreeStatesExample,
        source: statesSource as string,
      },
    ],
    advanced: [
      {
        id: 'files',
        title: 'Archivos, con íconos y carga diferida',
        sentence:
          'Cada nodo se pinta con `<ng-template mimiTreeNode let-node>`. Abre «assets»: sus hijos llegan después de un momento.',
        component: TreeFilesExample,
        source: filesSource as string,
        files: [
          { name: 'tree-files.example.ts', code: filesSource as string },
          { name: 'files.ts', code: filesDataSource as string },
        ],
      },
      {
        id: 'multiple',
        title: 'Selección múltiple con estado parcial',
        sentence:
          'Con `multiple`, marcar un padre marca todo lo de debajo; si faltan hijos, su casilla queda en estado parcial. «Reembolsar» está deshabilitado.',
        component: TreePermissionsExample,
        source: permissionsSource as string,
      },
    ],
  },
  forms: 'tree',
  accessibility: {
    points: [
      'Una sola parada de Tab: ↓ y ↑ recorren los nodos visibles; Inicio y Fin van a los extremos.',
      '→ abre un nodo (o entra en su primer hijo si ya está abierto); ← lo cierra (o sube al padre). En derecha a izquierda se invierten.',
      'Enter y Espacio eligen una hoja o abren un nodo con hijos. Con `multiple`, Espacio y el clic marcan; Enter abre.',
      '`*` abre los hermanos; una letra va al siguiente nodo que empieza con ella.',
      'Cada nodo dice su nivel y su posición; el estado parcial se lee como «parcialmente marcado» (`aria-checked="mixed"`).',
      'Mientras se cargan los hijos, el nodo está ocupado (`aria-busy`) y se anuncia «Cargando…».',
    ],
    more: [
      'La casilla es solo visual: no hay controles enfocables dentro de un nodo.',
      'Dale nombre al árbol con `aria-label` o `aria-labelledby`.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'nodes',
        type: 'MimiTreeNode<T>[]',
        default: '[]',
        description: 'Los nodos de primer nivel (sus campos, en «Uso»).',
      },
      {
        name: 'value',
        type: 'string | null | string[]',
        default: 'null',
        description:
          'El id elegido o, con `multiple`, los ids marcados. Un padre está marcado cuando lo están todos sus hijos.',
      },
      {
        name: 'multiple',
        type: 'boolean',
        default: 'false',
        description: 'Casillas con estado parcial: marcar un padre marca todo lo de debajo.',
      },
      {
        name: 'expanded',
        type: 'string[]',
        default: '[]',
        description: 'Los ids de los nodos abiertos, con `[(expanded)]`.',
      },
      {
        name: 'loadChildren',
        type: '(node) => Promise<MimiTreeNode<T>[]>',
        default: '—',
        description:
          'Pide los hijos de un nodo con `hasChildren` la primera vez que se abre (pasos en «Uso»).',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'Se recorre, pero no se elige ni se abre.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md' (o el de `mimiSize`)",
        description: 'El alto de las filas y el texto, con la escala del tema.',
      },
      {
        name: 'aria-label / aria-labelledby',
        type: 'string',
        default: '—',
        description: 'Nombre del árbol.',
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
        name: 'valueChange',
        type: 'string | null | string[]',
        description: 'Cambió el nodo elegido o los marcados.',
      },
      { name: 'expandedChange', type: 'string[]', description: 'Se abrió o se cerró un nodo.' },
      {
        name: 'touch',
        type: 'void',
        description: 'El foco salió del árbol: marca el control como tocado.',
      },
    ],
    parts: [
      {
        name: 'MimiTreeNodeTemplate',
        selector: 'ng-template[mimiTreeNode]',
        description:
          'Contenido de cada nodo, con `let-node`, `let-level`, `let-expanded` y `let-selected`. Reemplaza la etiqueta y `meta`.',
      },
    ],
    dataAttributes: [
      'data-multiple',
      'data-disabled',
      'data-size',
      'data-state (en el nodo)',
      'data-selected (en el nodo)',
    ],
  },
  texts: [
    { constant: 'MIMI_TREE_TEXT_ES', provider: 'provideMimiTreeText', path: 'tree/tree-texts' },
  ],
  tokens: 'tree',
};
