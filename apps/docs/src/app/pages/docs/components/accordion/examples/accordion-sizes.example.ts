import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiAccordionImports } from '@/components/ui/accordion';
import type { MimiSize } from '@/components/ui/utils/size';

@Component({
  selector: 'app-accordion-sizes-example',
  imports: [MimiAccordionImports],
  template: `
    <div class="grid w-full gap-4 md:grid-cols-3">
      @for (size of sizes; track size) {
        <mimi-accordion [size]="size" value="a">
          <mimi-accordion-item value="a" [title]="'size=' + size">
            La cabecera mide {{ heights[size] }} de alto.
          </mimi-accordion-item>
          <mimi-accordion-item value="b" title="Otra sección">Contenido.</mimi-accordion-item>
        </mimi-accordion>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionSizesExample {
  protected readonly sizes: MimiSize[] = ['sm', 'md', 'lg'];
  protected readonly heights: Record<MimiSize, string> = { sm: '44 px', md: '52 px', lg: '60 px' };
}
