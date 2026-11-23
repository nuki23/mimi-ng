import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPageView } from '../../../../doc-page/doc-page';
import { ACCORDION_PAGE } from './accordion.page';

/** Documentación de Accordion: la configuración está en accordion.page.ts (plantilla de página). */
@Component({
  selector: 'app-accordion-page',
  imports: [DocPageView],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionPage {
  protected readonly page = ACCORDION_PAGE;
}
