import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiInput } from '@/components/ui/input';

@Component({
  selector: 'app-input-sizes-example',
  imports: [MimiInput],
  template: `
    <div class="flex w-80 flex-col gap-3">
      <input mimiInput size="sm" placeholder="Pequeño (sm)" aria-label="Pequeño" />
      <input mimiInput placeholder="Normal" aria-label="Normal" />
      <input mimiInput size="lg" placeholder="Grande (lg)" aria-label="Grande" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputSizesExample {}
