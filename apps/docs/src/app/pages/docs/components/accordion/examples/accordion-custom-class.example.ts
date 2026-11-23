import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiAccordionImports } from '@/components/ui/accordion';

@Component({
  selector: 'app-accordion-custom-class-example',
  imports: [MimiAccordionImports],
  template: `
    <mimi-accordion class="w-full max-w-lg rounded-none border-x-0 bg-transparent">
      <mimi-accordion-item title="Sin caja, solo las líneas">
        Con class en el acordeón: las clases tuyas ganan.
      </mimi-accordion-item>
      <mimi-accordion-item title="Útil dentro de una tarjeta o un panel">
        El borde de arriba y abajo se queda; los lados y el fondo, no.
      </mimi-accordion-item>
    </mimi-accordion>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionCustomClassExample {}
