import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiComboboxImports } from '@/components/ui/combobox';

@Component({
  selector: 'app-combobox-phone-example',
  imports: [MimiComboboxImports],
  template: `
    <div class="flex w-80 max-w-full flex-col gap-1.5">
      <label for="combobox-phone" class="text-sm font-medium">Ciudad</label>
      <!-- Debajo de 640 px es lo de siempre; presentation="fullscreen" lo pide también aquí. -->
      <mimi-combobox
        id="combobox-phone"
        presentation="fullscreen"
        placeholder="Busca una ciudad"
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
export class ComboboxPhoneExample {
  protected readonly city = signal<string | string[] | null>('lima');
  // Las opciones también pueden salir de un @for, con las entradas enlazadas.
  protected readonly america = [
    { id: 'lima', name: 'Lima', country: 'Perú' },
    { id: 'bogota', name: 'Bogotá', country: 'Colombia' },
  ];
}
