import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiToggleGroupImports } from '@/components/ui/toggle-group';

@Component({
  selector: 'app-toggle-group-disabled-example',
  imports: [MimiToggleGroupImports],
  template: `
    <mimi-toggle-group aria-label="Periodo" value="week" disabled>
      <button mimiToggleGroupItem="day">Diario</button>
      <button mimiToggleGroupItem="week">Semanal</button>
      <button mimiToggleGroupItem="month">Mensual</button>
      <button mimiToggleGroupItem="year">Anual</button>
    </mimi-toggle-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleGroupDisabledExample {}
