import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_DATA_TABLE_TEXT_ES, provideMimiDataTableText } from '@/components/ui/data-table';
import { MIMI_PAGINATION_TEXT_ES, provideMimiPaginationText } from '@/components/ui/pagination';
import { DocPageView } from '../../../../doc-page/doc-page';
import { DATA_TABLE_PAGE } from './data-table.page';

/** Documentación de Data Table: la configuración está en data-table.page.ts (plantilla de página). */
@Component({
  selector: 'app-data-table-page',
  imports: [DocPageView],
  // Los textos están en inglés por defecto; este sitio usa el español (el de Pagination, para el
  // pie). Aquí y no en app.config.ts, para no sumar nada al JS inicial.
  providers: [
    provideMimiDataTableText(MIMI_DATA_TABLE_TEXT_ES),
    provideMimiPaginationText(MIMI_PAGINATION_TEXT_ES),
  ],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTablePage {
  protected readonly page = DATA_TABLE_PAGE;
}
