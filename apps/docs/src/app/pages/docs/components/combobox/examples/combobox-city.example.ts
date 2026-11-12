import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideMapPin } from '@lucide/angular';
import { MimiComboboxImports } from '@/components/ui/combobox';

interface City {
  id: string;
  name: string;
  country: string;
  /** Sin cobertura: se ve, pero no se elige. */
  off?: boolean;
}

@Component({
  selector: 'app-combobox-city-example',
  imports: [MimiComboboxImports, LucideMapPin],
  template: `
    <div class="flex w-full max-w-xs flex-col gap-1.5">
      <label for="city" class="text-sm font-medium">Ciudad</label>
      <mimi-combobox id="city" placeholder="Busca una ciudad" [(value)]="city">
        <svg mimiComboboxStart lucideMapPin></svg>
        <!-- hint es el texto secundario de la derecha; disabled, una opción que no se elige. -->
        @for (c of cities(); track c.id) {
          <mimi-option
            [value]="c.id"
            [hint]="c.off ? 'Sin cobertura' : c.country"
            [disabled]="!!c.off"
            >{{ c.name }}</mimi-option
          >
        }
      </mimi-combobox>
      <p class="text-[13px] text-muted-foreground">Elegida: {{ city() ?? 'ninguna' }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboboxCityExample {
  protected readonly city = signal<string | null>(null);
  protected readonly cities = signal<City[]>([
    { id: 'bog', name: 'Bogotá', country: 'Colombia' },
    { id: 'bue', name: 'Buenos Aires', country: 'Argentina' },
    { id: 'mex', name: 'Ciudad de México', country: 'México' },
    { id: 'lim', name: 'Lima', country: 'Perú', off: true },
    { id: 'mad', name: 'Madrid', country: 'España' },
    { id: 'med', name: 'Medellín', country: 'Colombia' },
    { id: 'mvd', name: 'Montevideo', country: 'Uruguay' },
    { id: 'scl', name: 'Santiago', country: 'Chile' },
  ]);
}
