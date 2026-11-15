import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { LucideCircleCheck } from '@lucide/angular';
import { MimiInputMaskImports } from '@/components/ui/input-mask';

/** Del ejemplo, no de Mimi: la marca por el primer dígito y la suma de Luhn. */
function brand(digits: string): string {
  if (/^4/.test(digits)) return 'VISA';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'MASTERCARD';
  if (/^3[47]/.test(digits)) return 'AMEX';
  return '';
}

function luhn(digits: string): boolean {
  let sum = 0;
  [...digits].reverse().forEach((d, i) => {
    let n = +d;
    if (i % 2) n = n * 2 > 9 ? n * 2 - 9 : n * 2;
    sum += n;
  });
  return digits.length > 0 && sum % 10 === 0;
}

@Component({
  selector: 'app-input-mask-card-example',
  imports: [MimiInputMaskImports, LucideCircleCheck],
  template: `
    <div class="flex w-full max-w-md flex-col gap-1.5">
      <label for="card" class="text-sm font-medium">Número de tarjeta</label>
      <mimi-input-mask
        id="card"
        mask="0000 0000 0000 0000"
        ghost="0000 0000 0000 0000"
        autocomplete="cc-number"
        aria-describedby="card-hint"
        [(value)]="card"
      >
        @if (cardBrand()) {
          <span
            mimiMaskEnd
            class="h-[22px] rounded-[5px] bg-primary px-[7px] text-[10.5px] font-extrabold tracking-[.06em] text-primary-foreground"
            >{{ cardBrand() }}</span
          >
        }
        @if (cardValid()) {
          <svg
            mimiMaskEnd
            lucideCircleCheck
            class="text-success-soft-foreground"
            aria-hidden="true"
          ></svg>
        }
      </mimi-input-mask>
      <span id="card-hint" class="text-xs text-muted-foreground">
        {{ cardValid() ? 'Número válido.' : '16 dígitos' }}
      </span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputMaskCardExample {
  protected readonly card = signal('');
  protected readonly cardBrand = computed(() => brand(this.card()));
  protected readonly cardValid = computed(() => this.card().length === 16 && luhn(this.card()));
}
