import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideCreditCard, LucideTruck, LucideUndo2 } from '@lucide/angular';
import { MimiAccordionImports } from '@/components/ui/accordion';
import { MimiBadge } from '@/components/ui/badge';

@Component({
  selector: 'app-accordion-header-example',
  imports: [MimiAccordionImports, MimiBadge, LucideTruck, LucideCreditCard, LucideUndo2],
  template: `
    <mimi-accordion class="w-full max-w-lg">
      <mimi-accordion-item value="envio">
        <svg lucideTruck mimiAccordionStart class="size-4 text-muted-foreground"></svg>
        <span mimiAccordionTitle>Envío</span>
        <span mimiBadge mimiAccordionEnd tone="success">Gratis</span>
        A partir de 30 € de compra, en toda la península.
      </mimi-accordion-item>
      <mimi-accordion-item value="pago">
        <svg lucideCreditCard mimiAccordionStart class="size-4 text-muted-foreground"></svg>
        <span mimiAccordionTitle>
          Pago <span class="font-normal text-muted-foreground">· 3 métodos</span>
        </span>
        Tarjeta, transferencia o Bizum.
      </mimi-accordion-item>
      <mimi-accordion-item value="devolucion">
        <svg lucideUndo2 mimiAccordionStart class="size-4 text-muted-foreground"></svg>
        <span mimiAccordionTitle>Devoluciones</span>
        <span mimiBadge mimiAccordionEnd variant="outline">30 días</span>
        Sin coste, desde tu cuenta.
      </mimi-accordion-item>
    </mimi-accordion>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionHeaderExample {}
