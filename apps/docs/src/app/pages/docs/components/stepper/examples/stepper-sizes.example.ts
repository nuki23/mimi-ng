import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiStepperImports } from '@/components/ui/stepper';
import type { MimiSize } from '@/components/ui/utils/size';

@Component({
  selector: 'app-stepper-sizes-example',
  imports: [MimiStepperImports],
  template: `
    <div class="flex w-full flex-col gap-8">
      @for (size of sizes; track size) {
        <mimi-stepper [size]="size" [value]="1" [aria-label]="'Tamaño ' + size">
          <mimi-step [title]="'size=' + size" />
          <mimi-step title="Segundo" />
          <mimi-step title="Tercero" />
        </mimi-stepper>
      }
    </div>
  `,
  host: { class: 'block w-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepperSizesExample {
  protected readonly sizes: MimiSize[] = ['sm', 'md', 'lg'];
}
