import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_SORTABLE_TEXT_ES, provideMimiSortableText } from '@/components/ui/sortable-list';
import { DocPageView } from '../../../../doc-page/doc-page';
import { SORTABLE_LIST_PAGE } from './sortable-list.page';

/** Documentación de Sortable List: la configuración está en sortable-list.page.ts (plantilla). */
@Component({
  selector: 'app-sortable-list-page',
  imports: [DocPageView],
  // Los textos están en inglés por defecto; este sitio usa el español. Aquí y no en
  // app.config.ts, para no sumar nada al JS inicial.
  providers: [provideMimiSortableText(MIMI_SORTABLE_TEXT_ES)],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortableListPage {
  protected readonly page = SORTABLE_LIST_PAGE;
}
