import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_SELECT_TEXT_ES, provideMimiSelectText } from '@/components/ui/select';
import { DocPageView } from '../../../../doc-page/doc-page';
import { SELECT_PAGE } from './select.page';

/** Documentación de Select: la configuración está en select.page.ts (plantilla de página). */
@Component({
  selector: 'app-select-page',
  imports: [DocPageView],
  // Los textos de Select están en inglés por defecto; este sitio usa el español. Aquí y no en
  // app.config.ts, para no sumar nada al JS inicial.
  providers: [provideMimiSelectText(MIMI_SELECT_TEXT_ES)],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectPage {
  protected readonly page = SELECT_PAGE;
}
