import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiSeparator } from '@/components/ui/separator';
import { MimiSwitch } from '@/components/ui/switch';

@Component({
  selector: 'app-switch-custom-class-example',
  imports: [MimiSeparator, MimiSwitch],
  template: `
    <div class="flex w-full max-w-sm flex-col gap-3">
      <mimi-switch [checked]="true" class="flex flex-row-reverse justify-between">
        Notificaciones push
      </mimi-switch>
      <mimi-separator />
      <mimi-switch class="flex flex-row-reverse justify-between">Resumen semanal</mimi-switch>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchCustomClassExample {}
