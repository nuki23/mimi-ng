import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiProgress } from '@/components/ui/progress';

@Component({
  selector: 'app-progress-custom-example',
  imports: [MimiProgress],
  template: `
    <div class="flex w-full max-w-sm flex-col items-center gap-6">
      <!-- class gana: una barra más gruesa y con esquinas menos redondas. -->
      <mimi-progress aria-label="Capítulos leídos" class="h-3 rounded-md" [value]="7" [max]="12" />
      <!-- Un círculo más grande. -->
      <mimi-progress aria-label="Perfil completo" shape="circle" class="size-24" [value]="85" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressCustomExample {}
