import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiAccordionImports } from '@/components/ui/accordion';

@Component({
  selector: 'app-accordion-faq-example',
  imports: [MimiAccordionImports],
  template: `
    <mimi-accordion class="w-full max-w-lg" [(value)]="open">
      <mimi-accordion-item value="envio" title="¿Cuánto tarda el envío?">
        Entre 2 y 4 días hábiles en la península. Te mandamos el número de seguimiento por correo.
      </mimi-accordion-item>
      <mimi-accordion-item value="pago" title="¿Cómo puedo pagar?">
        Con tarjeta, transferencia o Bizum. El cobro se hace al confirmar el pedido.
      </mimi-accordion-item>
      <mimi-accordion-item value="devolucion" title="¿Puedo devolver un producto?">
        Sí, durante 30 días y sin coste. Inicia la devolución desde tu cuenta.
      </mimi-accordion-item>
    </mimi-accordion>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionFaqExample {
  protected readonly open = signal<string | readonly string[] | null>('envio');
}
