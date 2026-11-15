import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiToggleGroupImports } from '@/components/ui/toggle-group';

@Component({
  selector: 'app-toggle-group-states-example',
  imports: [MimiToggleGroupImports],
  template: `
    <div class="flex flex-col items-start gap-4 text-sm">
      <div class="flex flex-col gap-2">
        <span class="font-medium">Deshabilitado</span>
        <mimi-toggle-group aria-label="Periodo deshabilitado" value="week" disabled>
          <button mimiToggleGroupItem="day">Diario</button>
          <button mimiToggleGroupItem="week">Semanal</button>
          <button mimiToggleGroupItem="month">Mensual</button>
        </mimi-toggle-group>
      </div>
      <div class="flex flex-col gap-2">
        <span class="font-medium">Solo lectura</span>
        <mimi-toggle-group aria-label="Periodo de solo lectura" value="month" readonly>
          <button mimiToggleGroupItem="day">Diario</button>
          <button mimiToggleGroupItem="week">Semanal</button>
          <button mimiToggleGroupItem="month">Mensual</button>
        </mimi-toggle-group>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleGroupStatesExample {}
