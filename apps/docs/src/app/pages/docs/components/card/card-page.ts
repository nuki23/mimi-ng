import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPageView } from '../../../../doc-page/doc-page';
import { CARD_PAGE } from './card.page';

/** Documentación de Card: la configuración está en card.page.ts (plantilla de página). */
@Component({
  selector: 'app-card-page',
  imports: [DocPageView],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardPage {
  protected readonly page = CARD_PAGE;
}
