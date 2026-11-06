import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  type AbstractControl,
  FormControl,
  ReactiveFormsModule,
  type ValidationErrors,
} from '@angular/forms';
import { MimiSlider, type MimiSliderValue } from '@/components/ui/slider';

/** Del ejemplo, no de Mimi: el rango tiene que abarcar al menos 5 años. */
function minSpan(control: AbstractControl<MimiSliderValue>): ValidationErrors | null {
  const value = control.value;
  return Array.isArray(value) && value[1] - value[0] < 5 ? { span: true } : null;
}

@Component({
  selector: 'app-slider-range-example',
  imports: [MimiSlider, ReactiveFormsModule],
  template: `
    <div class="grid w-full max-w-2xl gap-9 sm:grid-cols-2">
      <div class="flex flex-col gap-3">
        <div class="flex justify-between text-sm">
          <span id="price" class="font-medium">Precio por noche</span>
          <span class="text-muted-foreground tabular-nums">{{ priceText() }}</span>
        </div>
        <!-- range: dos pulgares que no se cruzan; el valor es [desde, hasta]. -->
        <mimi-slider
          aria-labelledby="price"
          range
          [max]="1000"
          [step]="10"
          [format]="money"
          [(value)]="price"
        />
      </div>
      <div class="flex flex-col gap-3">
        <span
          id="ages"
          class="text-sm font-medium"
          [class.text-destructive-soft-foreground]="ages.invalid"
        >
          Rango de edad
        </span>
        <!-- La distancia mínima es un validador del formulario: el error se ve al soltar. -->
        <mimi-slider aria-labelledby="ages" range [min]="18" [max]="80" [formControl]="ages" />
        @if (ages.invalid && ages.touched) {
          <span class="text-[13px] text-destructive-soft-foreground">
            El rango debe abarcar al menos 5 años.
          </span>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderRangeExample {
  protected readonly price = signal<MimiSliderValue>([300, 700]);
  protected readonly money = (v: number) => `$${v}`;
  protected readonly ages = new FormControl<MimiSliderValue>([30, 33], { validators: minSpan });

  constructor() {
    this.ages.markAsTouched();
  }

  protected priceText(): string {
    const value = this.price();
    return Array.isArray(value) ? `$${value[0]} – $${value[1]}` : '';
  }
}
