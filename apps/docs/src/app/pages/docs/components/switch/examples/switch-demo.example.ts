import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiSwitch } from '@/components/ui/switch';

@Component({
  selector: 'app-switch-demo-example',
  imports: [MimiSwitch],
  template: `
    <div class="flex flex-col gap-4">
      <mimi-switch [(checked)]="airplane">Modo avión</mimi-switch>
      <mimi-switch [(checked)]="wifi" [disabled]="airplane()">Wifi</mimi-switch>
      <p class="text-sm text-muted-foreground">
        @if (airplane()) {
          Sin conexión: el modo avión apaga el wifi.
        } @else {
          Wifi {{ wifi() ? 'encendido' : 'apagado' }}.
        }
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchDemoExample {
  protected readonly airplane = signal(false);
  protected readonly wifi = signal(true);
}
