import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiNumberInput } from '@/components/ui/number-input';

@Component({
  selector: 'app-number-input-basic-example',
  imports: [MimiNumberInput],
  template: `
    <div class="grid w-full max-w-2xl gap-5 sm:grid-cols-3">
      <div class="flex flex-col gap-1.5">
        <label for="qty" class="text-sm font-medium">Cantidad</label>
        <mimi-number-input id="qty" aria-label="Cantidad" [(value)]="qty" [min]="0" [max]="10" />
        <span class="text-xs text-muted-foreground">Entre 0 y 10</span>
      </div>
      <div class="flex flex-col gap-1.5">
        <label for="weight" class="text-sm font-medium">Peso</label>
        <mimi-number-input
          id="weight"
          aria-label="Peso"
          locale="es-MX"
          [(value)]="weight"
          [min]="0"
          [max]="50"
          [step]="0.25"
          [format]="{ style: 'unit', unit: 'kilogram', minimumFractionDigits: 2 }"
        />
        <span class="text-xs text-muted-foreground">Paso de 0,25 kg</span>
      </div>
      <div class="flex flex-col gap-1.5">
        <label for="price" class="text-sm font-medium">Precio</label>
        <mimi-number-input
          id="price"
          aria-label="Precio"
          locale="es-MX"
          [(value)]="price"
          [min]="0"
          [max]="100000"
          [step]="50"
          [format]="{ style: 'currency', currency: 'MXN' }"
        />
        <span class="text-xs text-muted-foreground">En pesos mexicanos, de 50 en 50</span>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberInputBasicExample {
  protected readonly qty = signal<number | null>(2);
  protected readonly weight = signal<number | null>(12.5);
  protected readonly price = signal<number | null>(1250);
}
