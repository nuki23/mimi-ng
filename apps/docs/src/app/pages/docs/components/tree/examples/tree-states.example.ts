import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiTreeImports, type MimiTreeNode } from '@/components/ui/tree';

const CATEGORIES: MimiTreeNode[] = [
  {
    id: 'ropa',
    label: 'Ropa',
    children: [
      { id: 'camisas', label: 'Camisas' },
      { id: 'abrigos', label: 'Abrigos (agotado)', disabled: true },
    ],
  },
  {
    id: 'hogar',
    label: 'Hogar',
    children: [
      { id: 'cocina', label: 'Cocina' },
      { id: 'jardin', label: 'Jardín' },
    ],
  },
];

@Component({
  selector: 'app-tree-states-example',
  imports: [MimiTreeImports],
  template: `
    <div class="grid w-full max-w-2xl gap-5 sm:grid-cols-2">
      <div class="flex flex-col gap-2">
        <span id="tree-node-disabled" class="text-sm font-medium">Un nodo deshabilitado</span>
        <mimi-tree
          aria-labelledby="tree-node-disabled"
          [nodes]="categories"
          [expanded]="['ropa']"
          [(value)]="selected"
        />
      </div>
      <div class="flex flex-col gap-2">
        <span id="tree-disabled" class="text-sm font-medium">Todo el árbol deshabilitado</span>
        <mimi-tree
          aria-labelledby="tree-disabled"
          disabled
          [nodes]="categories"
          [expanded]="['hogar']"
          value="cocina"
        />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeStatesExample {
  protected readonly categories = CATEGORIES;
  protected readonly selected = signal<string | null | string[]>('camisas');
}
