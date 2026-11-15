import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiTreeImports, type MimiTreeNode } from '@/components/ui/tree';

const NODES: MimiTreeNode[] = [
  {
    id: 'docs',
    label: 'Documentos',
    children: [
      {
        id: 'facturas',
        label: 'Facturas',
        children: [
          { id: 'enero', label: 'enero.pdf', meta: '84 KB' },
          { id: 'febrero', label: 'febrero.pdf', meta: '91 KB' },
        ],
      },
      { id: 'contrato', label: 'contrato.docx', meta: '32 KB' },
    ],
  },
  {
    id: 'fotos',
    label: 'Fotos',
    children: [{ id: 'playa', label: 'playa.jpg', meta: '2 MB' }],
  },
  { id: 'notas', label: 'notas.txt', meta: '1 KB' },
];

@Component({
  selector: 'app-tree-demo-example',
  imports: [MimiTreeImports],
  template: `
    <div class="flex w-full max-w-sm flex-col gap-3">
      <mimi-tree
        aria-label="Mis archivos"
        [nodes]="nodes"
        [(value)]="selected"
        [(expanded)]="open"
      />
      <p class="text-sm text-muted-foreground">
        Elegido: <code class="font-mono">{{ selected() ?? 'ninguno' }}</code>
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeDemoExample {
  protected readonly nodes = NODES;
  protected readonly selected = signal<string | null | string[]>('contrato');
  protected readonly open = signal(['docs']);
}
