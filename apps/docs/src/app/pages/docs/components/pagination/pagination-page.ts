import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_PAGINATION_TEXT_ES, provideMimiPaginationText } from '@/components/ui/pagination';
import { DocPageView } from '../../../../doc-page/doc-page';
import { PAGINATION_PAGE } from './pagination.page';

/** Documentación de Pagination: la configuración está en pagination.page.ts (plantilla de página). */
@Component({
  selector: 'app-pagination-page',
  imports: [DocPageView],
  // Los textos están en inglés por defecto; este sitio usa el español. Aquí y no en
  // app.config.ts, para no sumar nada al JS inicial.
  providers: [provideMimiPaginationText(MIMI_PAGINATION_TEXT_ES)],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationPage {
  protected readonly page = PAGINATION_PAGE;
}
