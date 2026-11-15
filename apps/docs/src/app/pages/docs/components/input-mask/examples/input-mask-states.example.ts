import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiInputMask } from '@/components/ui/input-mask';

@Component({
  selector: 'app-input-mask-states-example',
  imports: [MimiInputMask],
  template: `
    <div class="grid w-full max-w-2xl gap-5 sm:grid-cols-2">
      <div class="flex flex-col gap-1.5">
        <span class="text-xs text-muted-foreground">Deshabilitado</span>
        <mimi-input-mask aria-label="Deshabilitado" mask="00/00/0000" value="24122026" disabled />
      </div>
      <div class="flex flex-col gap-1.5">
        <span class="text-xs text-muted-foreground">Solo lectura</span>
        <mimi-input-mask aria-label="Solo lectura" mask="00/00/0000" value="24122026" readonly />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputMaskStatesExample {}
