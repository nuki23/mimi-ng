import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiToggleGroup, MimiToggleGroupItem } from '@/components/ui/toggle-group';

@Component({
  selector: 'app-toggle-group-readonly-example',
  imports: [MimiToggleGroup, MimiToggleGroupItem],
  template: `
    <mimi-toggle-group aria-label="Periodo" readonly value="mes">
      <button mimiToggleGroupItem="dia">Día</button>
      <button mimiToggleGroupItem="mes">Mes</button>
      <button mimiToggleGroupItem="anio">Año</button>
    </mimi-toggle-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleGroupReadonlyExample {}
