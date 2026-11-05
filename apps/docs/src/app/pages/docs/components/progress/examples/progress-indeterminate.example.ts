import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiProgress } from '@/components/ui/progress';

@Component({
  selector: 'app-progress-indeterminate-example',
  imports: [MimiProgress],
  template: `
    <div class="flex w-full max-w-sm flex-col gap-2">
      <div class="flex justify-between text-[13.5px]">
        <span class="font-medium">Sincronizando…</span>
        <span class="text-muted-foreground">Sin estimación</span>
      </div>
      <!-- Sin [value]: indeterminado. -->
      <mimi-progress aria-label="Sincronizando" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressIndeterminateExample {}
