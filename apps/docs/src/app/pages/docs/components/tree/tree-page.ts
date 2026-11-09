import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_TREE_TEXT_ES, provideMimiTreeText } from '@/components/ui/tree';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { TreeFilesExample } from './examples/tree-files.example';
import { TreeFormsExample } from './examples/tree-forms.example';
import { TreePermissionsExample } from './examples/tree-permissions.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import filesSource from './examples/tree-files.example' with { loader: 'text' };
// @ts-expect-error
import formsSource from './examples/tree-forms.example' with { loader: 'text' };
// @ts-expect-error
import permissionsSource from './examples/tree-permissions.example' with { loader: 'text' };

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

/** Documentación del Tree (tarea G3.1). */
@Component({
  selector: 'app-tree-page',
  imports: [
    CodeBlock,
    CodePreview,
    CssVariables,
    InstallCommand,
    TreeFilesExample,
    TreePermissionsExample,
    TreeFormsExample,
  ],
  providers: [provideMimiTreeText(MIMI_TREE_TEXT_ES)],
  templateUrl: './tree-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreePage {
  protected readonly source = {
    files: filesSource as string,
    permissions: permissionsSource as string,
    forms: formsSource as string,
  };

  protected readonly usage = [
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
  ].join('\n');

  protected readonly lazy = [
    '// Un nodo con hasChildren pide sus hijos la primera vez que se abre.',
    "nodes = [{ id: 'assets', label: 'assets', hasChildren: true }];",
    '',
    'loadChildren = (node: MimiTreeNode) =>',
    '  firstValueFrom(this.http.get<MimiTreeNode[]>(`/api/folders/${node.id}`));',
  ].join('\n');

  protected readonly texts = [
    "import { MIMI_TREE_TEXT_ES, provideMimiTreeText } from '@/components/ui/tree';",
    '',
    '// app.config.ts',
    'providers: [provideMimiTreeText(MIMI_TREE_TEXT_ES)],',
  ].join('\n');

  protected readonly api: ApiRow[] = [
    {
      name: 'nodes',
      type: 'MimiTreeNode<T>[]',
      default: '[]',
      description: 'Los nodos de primer nivel. Cada id es único en todo el árbol.',
    },
    {
      name: 'value',
      type: 'string | null | string[]',
      default: 'null',
      description:
        'El id elegido o, con multiple, los ids marcados (un padre está cuando lo están todos sus hijos). Admite [(value)], [formField], formControlName y [(ngModel)].',
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
      description: 'Los ids de los nodos abiertos ([(expanded)]).',
    },
    {
      name: 'loadChildren',
      type: '(node) => Promise<MimiTreeNode<T>[]>',
      default: '—',
      description:
        'Pide los hijos de un nodo con hasChildren la primera vez que se abre. Mientras, «Cargando…»; si falla, se reintenta al volver a abrirlo.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Se navega, pero no se elige ni se abre.',
    },
    {
      name: 'aria-label',
      type: 'string',
      default: '—',
      description: 'Nombre del árbol (o aria-labelledby).',
    },
    {
      name: 'class',
      type: 'string',
      default: "''",
      description: 'Se mezcla con cn() en el contenedor.',
    },
  ];

  protected readonly nodeApi: ApiRow[] = [
    {
      name: 'id',
      type: 'string',
      default: '—',
      description: 'Único en el árbol; es lo que lleva value.',
    },
    {
      name: 'label',
      type: 'string',
      default: '—',
      description: 'Texto del nodo (y de la búsqueda por letra).',
    },
    { name: 'children', type: 'MimiTreeNode<T>[]', default: '—', description: 'Hijos conocidos.' },
    {
      name: 'hasChildren',
      type: 'boolean',
      default: 'false',
      description: 'Tiene hijos que se piden con loadChildren.',
    },
    {
      name: 'meta',
      type: 'string',
      default: '—',
      description: 'Dato a la derecha (tamaño, cantidad).',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Se enfoca, pero no se elige ni se marca.',
    },
    {
      name: 'data',
      type: 'T',
      default: '—',
      description: 'Lo que quieras llevar (lo recibe la plantilla).',
    },
  ];
}
