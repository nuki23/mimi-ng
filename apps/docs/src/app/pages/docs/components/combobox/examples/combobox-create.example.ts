import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiComboboxImports } from '@/components/ui/combobox';
import type { MimiListOption } from '@/components/ui/option-list';

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
        [options]="categories()"
        [(value)]="category"
        (create)="add($event)"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboboxCreateExample {
  protected readonly category = signal<string | null>('diseño');
  protected readonly categories = signal<MimiListOption<string>[]>([
    { label: 'Diseño', value: 'diseño' },
    { label: 'Desarrollo', value: 'desarrollo' },
    { label: 'Ventas', value: 'ventas' },
  ]);

  protected add(label: string): void {
    this.categories.update((list) => [...list, { label, value: label.toLowerCase() }]);
  }
}
