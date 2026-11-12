import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiComboboxImports } from '@/components/ui/combobox';

interface Category {
  id: string;
  name: string;
}

@Component({
  selector: 'app-combobox-create-example',
  imports: [MimiComboboxImports],
  template: `
    <div class="flex w-full max-w-xs flex-col gap-1.5">
      <label for="category" class="text-sm font-medium">Categoría</label>
      <!-- La app agrega la opción nueva; el Combobox la elige en cuanto aparece. -->
      <mimi-combobox
        id="category"
        placeholder="Elige o crea una"
        creatable
        [(value)]="category"
        (create)="add($event)"
      >
        @for (c of categories(); track c.id) {
          <mimi-option [value]="c.id">{{ c.name }}</mimi-option>
        }
      </mimi-combobox>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboboxCreateExample {
  protected readonly category = signal<string | null>('diseño');
  protected readonly categories = signal<Category[]>([
    { id: 'diseño', name: 'Diseño' },
    { id: 'desarrollo', name: 'Desarrollo' },
    { id: 'ventas', name: 'Ventas' },
  ]);

  protected add(name: string): void {
    this.categories.update((list) => [...list, { id: name.toLowerCase(), name }]);
  }
}
