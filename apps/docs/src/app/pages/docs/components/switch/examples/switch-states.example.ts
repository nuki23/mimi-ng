import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiSwitch } from '@/components/ui/switch';

@Component({
  selector: 'app-switch-states-example',
  imports: [MimiSwitch],
  template: `
    <div class="flex flex-wrap items-center gap-8">
      <mimi-switch>Apagado</mimi-switch>
      <mimi-switch [checked]="true">Encendido</mimi-switch>
      <mimi-switch disabled>Deshabilitado</mimi-switch>
      <mimi-switch [checked]="true" disabled>Deshabilitado</mimi-switch>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchStatesExample {}
