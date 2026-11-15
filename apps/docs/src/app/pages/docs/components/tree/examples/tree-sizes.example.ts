import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiTreeImports, type MimiTreeNode } from '@/components/ui/tree';

const NODES: MimiTreeNode[] = [
  {
    id: 'docs',
    label: 'Documentos',
    children: [
      { id: 'cv', label: 'cv.pdf' },
      { id: 'notas', label: 'notas.txt' },
    ],
  },
];

@Component({
  selector: 'app-tree-sizes-example',
  imports: [MimiTreeImports],
  template: `
    <div class="grid w-full max-w-3xl gap-5 sm:grid-cols-3">
      <mimi-tree size="sm" aria-label="Archivos, pequeño" [nodes]="nodes" [expanded]="['docs']" />
      <mimi-tree size="md" aria-label="Archivos, mediano" [nodes]="nodes" [expanded]="['docs']" />
      <mimi-tree size="lg" aria-label="Archivos, grande" [nodes]="nodes" [expanded]="['docs']" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeSizesExample {
  protected readonly nodes = NODES;
}
