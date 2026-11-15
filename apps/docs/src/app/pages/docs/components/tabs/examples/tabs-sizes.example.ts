import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiTabsImports } from '@/components/ui/tabs';

@Component({
  selector: 'app-tabs-sizes-example',
  imports: [MimiTabsImports],
  template: `
    <div class="flex w-full flex-col gap-6">
      <mimi-tabs size="sm" aria-label="Secciones (sm)">
        <mimi-tab label="Resumen">Pestañas de 36 px.</mimi-tab>
        <mimi-tab label="Actividad">Lo último del equipo.</mimi-tab>
      </mimi-tabs>
      <mimi-tabs aria-label="Secciones (md)">
        <mimi-tab label="Resumen">Pestañas de 44 px, el tamaño por defecto.</mimi-tab>
        <mimi-tab label="Actividad">Lo último del equipo.</mimi-tab>
      </mimi-tabs>
      <mimi-tabs size="lg" variant="pill" aria-label="Secciones (lg, píldora)">
        <mimi-tab label="Resumen">Píldoras de 40 px.</mimi-tab>
        <mimi-tab label="Actividad">Lo último del equipo.</mimi-tab>
      </mimi-tabs>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsSizesExample {}
