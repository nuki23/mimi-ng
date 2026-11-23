import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiAccordionImports } from '@/components/ui/accordion';

@Component({
  selector: 'app-accordion-states-example',
  imports: [MimiAccordionImports],
  template: `
    <div class="grid w-full gap-4 md:grid-cols-2">
      <mimi-accordion value="activo">
        <mimi-accordion-item value="activo" title="Abierto"
          >Se cierra con un clic.</mimi-accordion-item
        >
        <mimi-accordion-item value="cerrado" title="Cerrado"
          >Se abre con un clic.</mimi-accordion-item
        >
        <mimi-accordion-item value="bloqueado" title="Deshabilitado" disabled>
          No se abre.
        </mimi-accordion-item>
      </mimi-accordion>
      <mimi-accordion disabled>
        <mimi-accordion-item title="Todo el acordeón deshabilitado">Nada.</mimi-accordion-item>
        <mimi-accordion-item title="Sigue enfocable con Tab">Nada.</mimi-accordion-item>
      </mimi-accordion>
    </div>
  `,
  host: { class: 'block w-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionStatesExample {}
