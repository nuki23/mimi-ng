import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiProgress } from '@/components/ui/progress';

@Component({
  selector: 'app-progress-sizes-example',
  imports: [MimiProgress],
  template: `
    <div class="flex w-full max-w-md flex-col gap-6">
      <div class="flex flex-col gap-4">
        <mimi-progress aria-label="Copia de seguridad (sm)" size="sm" [value]="30" />
        <mimi-progress aria-label="Copia de seguridad (md)" size="md" [value]="55" />
        <mimi-progress aria-label="Copia de seguridad (lg)" size="lg" [value]="80" />
      </div>
      <div class="flex flex-wrap items-center justify-center gap-6">
        <mimi-progress aria-label="Tareas hechas (sm)" shape="circle" size="sm" [value]="30" />
        <mimi-progress aria-label="Tareas hechas (md)" shape="circle" size="md" [value]="55" />
        <mimi-progress aria-label="Tareas hechas (lg)" shape="circle" size="lg" [value]="80" />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressSizesExample {}
