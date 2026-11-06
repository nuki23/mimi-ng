import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiToggleGroupImports } from '@/components/ui/toggle-group';

@Component({
  selector: 'app-toggle-group-custom-example',
  imports: [MimiToggleGroupImports],
  template: `
    <!-- class gana: un grupo a todo el ancho, con ítems más altos. -->
    <mimi-toggle-group aria-label="Facturación" class="w-full max-w-sm" [(value)]="billing">
      <button mimiToggleGroupItem="monthly" class="h-10">Mensual</button>
      <button mimiToggleGroupItem="yearly" class="h-10">Anual · −20 %</button>
    </mimi-toggle-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleGroupCustomExample {
  protected readonly billing = signal<string | null>('monthly');
}
