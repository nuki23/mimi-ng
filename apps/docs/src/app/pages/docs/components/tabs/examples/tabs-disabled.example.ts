import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiTabsImports } from '@/components/ui/tabs';

@Component({
  selector: 'app-tabs-disabled-example',
  imports: [MimiTabsImports],
  template: `
    <!-- La deshabilitada se puede enfocar con las flechas (y leer), pero no elegir. -->
    <div class="w-full">
      <mimi-tabs aria-label="Proyecto">
        <ng-template mimiTab="overview" label="Resumen">
          <p class="text-sm text-muted-foreground">12 páginas y 3 personas.</p>
        </ng-template>
        <ng-template mimiTab="activity" label="Actividad">
          <p class="text-sm text-muted-foreground">48 cambios este mes.</p>
        </ng-template>
        <ng-template mimiTab="reports" label="Informes" disabled>
          <p class="text-sm text-muted-foreground">Disponible en el plan Equipo.</p>
        </ng-template>
      </mimi-tabs>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsDisabledExample {}
