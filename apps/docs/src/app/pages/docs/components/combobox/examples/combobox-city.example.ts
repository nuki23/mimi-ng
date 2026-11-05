import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideMapPin } from '@lucide/angular';
import { MimiComboboxImports } from '@/components/ui/combobox';
import type { MimiListOption } from '@/components/ui/option-list';

@Component({
  selector: 'app-combobox-city-example',
  imports: [MimiComboboxImports, LucideMapPin],
  template: `
    <div class="flex w-full max-w-xs flex-col gap-1.5">
      <label for="city" class="text-sm font-medium">Ciudad</label>
      <mimi-combobox id="city" placeholder="Busca una ciudad" [options]="cities" [(value)]="city">
        <svg mimiComboboxStart lucideMapPin></svg>
      </mimi-combobox>
      <p class="text-[13px] text-muted-foreground">Elegida: {{ city() ?? 'ninguna' }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboboxCityExample {
  protected readonly city = signal<string | null>(null);
  /** `hint` es el texto secundario de la derecha; `disabled`, una opción que no se elige. */
  protected readonly cities: MimiListOption<string>[] = [
    { label: 'Bogotá', value: 'bog', hint: 'Colombia' },
    { label: 'Buenos Aires', value: 'bue', hint: 'Argentina' },
    { label: 'Ciudad de México', value: 'mex', hint: 'México' },
    { label: 'Lima', value: 'lim', hint: 'Sin cobertura', disabled: true },
    { label: 'Madrid', value: 'mad', hint: 'España' },
    { label: 'Medellín', value: 'med', hint: 'Colombia' },
    { label: 'Montevideo', value: 'mvd', hint: 'Uruguay' },
    { label: 'Santiago', value: 'scl', hint: 'Chile' },
  ];
}
