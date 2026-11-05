import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiNumberInput } from '@/components/ui/number-input';

@Component({
  selector: 'app-number-input-states-example',
  imports: [MimiNumberInput],
  template: `
    <div class="grid w-full max-w-2xl gap-5 sm:grid-cols-3">
      <div class="flex flex-col gap-1.5">
        <span class="text-xs text-muted-foreground">Deshabilitado</span>
        <mimi-number-input aria-label="Deshabilitado" [value]="4" disabled />
      </div>
      <div class="flex flex-col gap-1.5">
        <span class="text-xs text-muted-foreground">Solo lectura</span>
        <mimi-number-input aria-label="Solo lectura" [value]="4" readonly />
      </div>
      <div class="flex flex-col gap-1.5">
        <span class="text-xs text-muted-foreground">Vacío (null)</span>
        <mimi-number-input aria-label="Vacío" placeholder="Sin cantidad" [value]="null" />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberInputStatesExample {}
