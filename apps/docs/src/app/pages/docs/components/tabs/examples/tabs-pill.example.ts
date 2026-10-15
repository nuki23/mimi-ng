import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  LucideCalendar,
  LucideCalendarDays,
  LucideChartNoAxesColumn,
  LucideSun,
} from '@lucide/angular';
import { MimiTabsImports } from '@/components/ui/tabs';

@Component({
  selector: 'app-tabs-pill-example',
  imports: [
    MimiTabsImports,
    LucideSun,
    LucideCalendarDays,
    LucideCalendar,
    LucideChartNoAxesColumn,
  ],
  template: `
    <div class="w-full">
      <mimi-tabs variant="pill" [(value)]="period" aria-label="Periodo">
        @for (p of periods; track p.value) {
          <ng-template [mimiTab]="p.value" [label]="p.label">
            <div class="flex items-baseline gap-2.5">
              <span class="text-[28px] font-bold tracking-[-0.02em]">{{ p.visits }}</span>
              <span class="text-sm text-muted-foreground">{{ p.caption }}</span>
            </div>
          </ng-template>
        }
        <!-- Etiquetas con ícono: mimiTabLabel con el valor de su pestaña. -->
        <ng-template mimiTabLabel="day"><svg lucideSun></svg>Día</ng-template>
        <ng-template mimiTabLabel="week"><svg lucideCalendarDays></svg>Semana</ng-template>
        <ng-template mimiTabLabel="month"><svg lucideCalendar></svg>Mes</ng-template>
        <ng-template mimiTabLabel="year"><svg lucideChartNoAxesColumn></svg>Año</ng-template>
      </mimi-tabs>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsPillExample {
  protected readonly period = signal('week');
  protected readonly periods = [
    { value: 'day', label: 'Día', visits: '1.284', caption: 'visitas hoy' },
    { value: 'week', label: 'Semana', visits: '8.902', caption: 'visitas esta semana' },
    { value: 'month', label: 'Mes', visits: '36.410', caption: 'visitas en septiembre' },
    { value: 'year', label: 'Año', visits: '412.077', caption: 'visitas en 2026' },
  ];
}
