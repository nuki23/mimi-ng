import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiInput } from '@/components/ui/input';

@Component({
  selector: 'app-input-disabled-example',
  imports: [MimiInput],
  template: `
    <div class="flex w-80 flex-col gap-1.5">
      <label for="plan" class="text-sm font-medium">Plan</label>
      <input mimiInput id="plan" value="Equipo" disabled />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputDisabledExample {}
