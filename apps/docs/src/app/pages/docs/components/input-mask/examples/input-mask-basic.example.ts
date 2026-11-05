import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiInputMask } from '@/components/ui/input-mask';

@Component({
  selector: 'app-input-mask-basic-example',
  imports: [MimiInputMask],
  template: `
    <div class="grid w-full max-w-2xl gap-5 sm:grid-cols-2">
      <div class="flex flex-col gap-1.5">
        <label for="phone" class="text-sm font-medium">Teléfono</label>
        <mimi-input-mask
          id="phone"
          mask="(00) 0000 0000"
          autocomplete="tel-national"
          aria-describedby="phone-hint"
          [(value)]="phone"
        />
        <span id="phone-hint" class="text-xs text-muted-foreground"
          >10 dígitos · valor: {{ phone() || '—' }}</span
        >
      </div>
      <div class="flex flex-col gap-1.5">
        <label for="birth" class="text-sm font-medium">Fecha de nacimiento</label>
        <mimi-input-mask
          id="birth"
          mask="00/00/0000"
          autocomplete="bday"
          aria-describedby="birth-hint"
          [(value)]="birth"
        />
        <span id="birth-hint" class="text-xs text-muted-foreground"
          >Día, mes y año (DD/MM/AAAA)</span
        >
      </div>
      <div class="flex flex-col gap-1.5 sm:col-span-2">
        <label for="card" class="text-sm font-medium">Número de tarjeta</label>
        <mimi-input-mask
          id="card"
          mask="0000 0000 0000 0000"
          autocomplete="cc-number"
          [(value)]="card"
        />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputMaskBasicExample {
  protected readonly phone = signal('');
  protected readonly birth = signal('');
  protected readonly card = signal('');
}
