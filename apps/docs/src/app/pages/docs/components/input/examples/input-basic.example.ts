import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiInput } from '@/components/ui/input';

@Component({
  selector: 'app-input-basic-example',
  imports: [MimiInput],
  template: `
    <div class="flex w-80 flex-col gap-1.5">
      <label for="email" class="text-sm font-medium">Correo</label>
      <input mimiInput id="email" type="email" placeholder="tu@correo.com" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputBasicExample {}
