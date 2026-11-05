import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiToggleGroupImports } from '@/components/ui/toggle-group';

@Component({
  selector: 'app-toggle-group-text-example',
  imports: [MimiToggleGroupImports],
  template: `
    <div class="flex flex-col items-center gap-3">
      <mimi-toggle-group aria-label="Periodo" [(value)]="period">
        <button mimiToggleGroupItem="day">Diario</button>
        <button mimiToggleGroupItem="week">Semanal</button>
        <button mimiToggleGroupItem="month">Mensual</button>
        <button mimiToggleGroupItem="year">Anual</button>
      </mimi-toggle-group>
      <p class="text-sm text-muted-foreground">Periodo: {{ period() }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleGroupTextExample {
  protected readonly period = signal<string | null>('week');
}
