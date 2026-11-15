import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  MIMI_NUMBER_INPUT_TEXT_ES,
  provideMimiNumberInputText,
} from '@/components/ui/number-input';
import { DocPageView } from '../../../../doc-page/doc-page';
import { NUMBER_INPUT_PAGE } from './number-input.page';

/** Documentación de Number Input: la configuración está en number-input.page.ts (plantilla de página). */
@Component({
  selector: 'app-number-input-page',
  imports: [DocPageView],
  // Los textos de Number Input están en inglés por defecto; este sitio usa el español. Aquí y no
  // en app.config.ts, para no sumar nada al JS inicial.
  providers: [provideMimiNumberInputText(MIMI_NUMBER_INPUT_TEXT_ES)],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberInputPage {
  protected readonly page = NUMBER_INPUT_PAGE;
}
