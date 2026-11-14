import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiComboboxImports } from '@/components/ui/combobox';

@Component({
  selector: 'app-combobox-declarative-example',
  imports: [MimiComboboxImports],
  template: `
    <div class="flex w-80 max-w-full flex-col gap-1.5">
      <label for="combobox-declarative" class="text-sm font-medium">Ciudad</label>
      <mimi-combobox
        id="combobox-declarative"
        placeholder="Busca una ciudad"
        clearable
        [(value)]="city"
      >
        <mimi-optgroup label="España">
          <mimi-option value="madrid">Madrid</mimi-option>
          <mimi-option value="sevilla">Sevilla</mimi-option>
        </mimi-optgroup>
        <mimi-optgroup label="América">
          @for (city of america; track city.id) {
            <mimi-option [value]="city.id" [hint]="city.country">{{ city.name }}</mimi-option>
          }
        </mimi-optgroup>
      </mimi-combobox>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboboxDeclarativeExample {
  protected readonly city = signal<string | string[] | null>('lima');
  // Las opciones también pueden salir de un @for, con las entradas enlazadas.
  protected readonly america = [
    { id: 'lima', name: 'Lima', country: 'Perú' },
    { id: 'bogota', name: 'Bogotá', country: 'Colombia' },
  ];
}
