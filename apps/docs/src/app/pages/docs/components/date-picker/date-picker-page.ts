import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_DATE_PICKER_TEXT_ES, provideMimiDatePickerText } from '@/components/ui/calendar';
import { DocPageView } from '../../../../doc-page/doc-page';
import { DATE_PICKER_PAGE } from './date-picker.page';

/** Documentación del Date Picker: la configuración está en date-picker.page.ts (plantilla de página). */
@Component({
  selector: 'app-date-picker-page',
  imports: [DocPageView],
  // Los textos del calendario están en inglés por defecto; este sitio usa el español. Aquí y no
  // en app.config.ts, para no sumar nada al JS inicial.
  providers: [provideMimiDatePickerText(MIMI_DATE_PICKER_TEXT_ES)],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerPage {
  protected readonly page = DATE_PICKER_PAGE;
}
