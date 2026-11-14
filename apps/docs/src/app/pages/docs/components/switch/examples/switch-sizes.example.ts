import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiSwitch } from '@/components/ui/switch';

@Component({
  selector: 'app-switch-sizes-example',
  imports: [MimiSwitch],
  template: `
    <div class="flex flex-wrap items-center gap-8">
      <mimi-switch size="sm" [checked]="true">sm</mimi-switch>
      <mimi-switch size="md" [checked]="true">md (por defecto)</mimi-switch>
      <mimi-switch size="lg" [checked]="true">lg</mimi-switch>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchSizesExample {}
