import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideCircleAlert } from '@lucide/angular';
import { MimiInput } from '@/components/ui/input';

@Component({
  selector: 'app-input-show-error-example',
  imports: [MimiInput, LucideCircleAlert],
  template: `
    <div class="flex w-80 flex-col gap-1.5">
      <label for="alias" class="text-sm font-medium">Usuario</label>
      <input mimiInput id="alias" value="ana" [showError]="true" aria-describedby="alias-error" />
      <p id="alias-error" class="flex items-center gap-1.5 text-[13px] text-destructive">
        <svg lucideCircleAlert [size]="14" aria-hidden="true"></svg>
        Ese nombre de usuario ya existe.
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputShowErrorExample {}
