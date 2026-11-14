import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiCheckbox } from '@/components/ui/checkbox';

@Component({
  selector: 'app-checkbox-sizes-example',
  imports: [MimiCheckbox],
  template: `
    <div class="flex flex-wrap items-center gap-8">
      <mimi-checkbox size="sm" [checked]="true">sm</mimi-checkbox>
      <mimi-checkbox size="md" [checked]="true">md (por defecto)</mimi-checkbox>
      <mimi-checkbox size="lg" [checked]="true">lg</mimi-checkbox>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxSizesExample {}
