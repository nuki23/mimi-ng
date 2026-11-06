import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { LucideCalendar, LucideCircleCheck } from '@lucide/angular';
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
  selector: 'app-input-mask-basic-example',
  imports: [MimiInputMaskImports, LucideCalendar, LucideCircleCheck],
  template: `
    <div class="grid w-full max-w-2xl gap-5 sm:grid-cols-2">
      <div class="flex flex-col gap-1.5">
        <label for="phone" class="text-sm font-medium">Teléfono</label>
        <!-- El prefijo cambia el significado: dilo también en la ayuda. -->
        <mimi-input-mask
          id="phone"
          mask="00 0000 0000"
          ghost="55 0000 0000"
          autocomplete="tel-national"
          aria-describedby="phone-hint"
          [(value)]="phone"
        >
          <span mimiMaskPrefix>+52</span>
        </mimi-input-mask>
        <span id="phone-hint" class="text-xs text-muted-foreground">México (+52), 10 dígitos</span>
      </div>
      <div class="flex flex-col gap-1.5">
        <label for="birth" class="text-sm font-medium">Fecha de nacimiento</label>
        <mimi-input-mask
          id="birth"
          mask="00/00/0000"
          ghost="DD/MM/AAAA"
          autocomplete="bday"
          aria-describedby="birth-hint"
          [(value)]="birth"
        >
          <svg mimiMaskStart lucideCalendar aria-hidden="true"></svg>
        </mimi-input-mask>
        <span id="birth-hint" class="text-xs text-muted-foreground">Día, mes y año</span>
      </div>
      <div class="flex flex-col gap-1.5 sm:col-span-2">
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
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputMaskBasicExample {
  protected readonly phone = signal('');
  protected readonly birth = signal('');
  protected readonly card = signal('');
  protected readonly cardBrand = computed(() => brand(this.card()));
  protected readonly cardValid = computed(() => this.card().length === 16 && luhn(this.card()));
}
