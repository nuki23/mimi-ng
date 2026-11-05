import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideBluetooth, LucideMapPin, LucideWifi } from '@lucide/angular';
import { MimiToggleGroupImports } from '@/components/ui/toggle-group';

@Component({
  selector: 'app-toggle-group-solid-example',
  imports: [MimiToggleGroupImports, LucideWifi, LucideBluetooth, LucideMapPin],
  template: `
    <mimi-toggle-group aria-label="Conexiones" variant="solid" multiple [(value)]="network">
      <button mimiToggleGroupItem="wifi"><svg lucideWifi></svg>Wi-Fi</button>
      <button mimiToggleGroupItem="bluetooth"><svg lucideBluetooth></svg>Bluetooth</button>
      <button mimiToggleGroupItem="location"><svg lucideMapPin></svg>Ubicación</button>
    </mimi-toggle-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleGroupSolidExample {
  protected readonly network = signal<string[]>(['wifi', 'location']);
}
