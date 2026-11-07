import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { MimiTreeImports, type MimiTreeNode } from '@/components/ui/tree';

const CATEGORIES: MimiTreeNode[] = [
  {
    id: 'ropa',
    label: 'Ropa',
    children: [
      { id: 'camisas', label: 'Camisas' },
      { id: 'pantalones', label: 'Pantalones' },
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
  selector: 'app-tree-forms-example',
  imports: [MimiTreeImports, FormField, ReactiveFormsModule, FormsModule],
  template: `
    <div class="grid w-full max-w-3xl gap-5 sm:grid-cols-2">
      <div class="flex flex-col gap-2">
        <span id="tree-signal" class="text-sm font-medium">Categorías (Signal Forms)</span>
        <mimi-tree
          aria-labelledby="tree-signal"
          multiple
          [nodes]="categories"
          [expanded]="['ropa', 'hogar']"
          [formField]="filters.categories"
        />
        <span class="text-xs text-muted-foreground">{{ data().categories.join(', ') || '—' }}</span>
      </div>
      <div class="flex flex-col gap-2">
        <span id="tree-reactive" class="text-sm font-medium">Una categoría (Reactive)</span>
        <mimi-tree
          aria-labelledby="tree-reactive"
          [nodes]="categories"
          [expanded]="['ropa']"
          [formControl]="category"
        />
        <span class="text-xs text-muted-foreground">
          {{ category.value ?? '—' }} · {{ category.touched ? 'tocado' : 'sin tocar' }}
        </span>
      </div>
      <div class="flex flex-col gap-2">
        <span id="tree-model" class="text-sm font-medium">ngModel</span>
        <mimi-tree
          aria-labelledby="tree-model"
          name="sección"
          [nodes]="categories"
          [(ngModel)]="section"
        />
      </div>
      <div class="flex flex-col gap-2">
        <span id="tree-disabled" class="text-sm font-medium">Deshabilitado</span>
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
export class TreeFormsExample {
  protected readonly categories = CATEGORIES;
  protected readonly data = signal({ categories: ['camisas'] as string[] });
  protected readonly filters = form(this.data);
  protected readonly category = new FormControl<string | null>('cocina');
  protected section: string | null = null;
}
