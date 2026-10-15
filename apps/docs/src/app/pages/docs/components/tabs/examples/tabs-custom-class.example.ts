import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiTabsImports } from '@/components/ui/tabs';

@Component({
  selector: 'app-tabs-custom-class-example',
  imports: [MimiTabsImports],
  template: `
    <!-- class va a la fila de pestañas; panelClass, a los paneles. -->
    <mimi-tabs
      variant="pill"
      aria-label="Vista"
      class="w-80 rounded-full [&_[role=tab]]:rounded-full [&_[data-slot=indicator]]:rounded-full"
      panelClass="rounded-[var(--mimi-radius)] border p-4"
    >
      <ng-template mimiTab="list" label="Lista">
        <p class="text-sm text-muted-foreground">24 proyectos.</p>
      </ng-template>
      <ng-template mimiTab="grid" label="Cuadrícula">
        <p class="text-sm text-muted-foreground">24 proyectos en tarjetas.</p>
      </ng-template>
    </mimi-tabs>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsCustomClassExample {}
