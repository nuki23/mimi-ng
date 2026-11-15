import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  MIMI_COLOR_PICKER_TEXT_ES,
  provideMimiColorPickerText,
} from '@/components/ui/color-picker';
import { DocPageView } from '../../../../doc-page/doc-page';
import { COLOR_PICKER_PAGE } from './color-picker.page';

/** Documentación del Color Picker: la configuración está en color-picker.page.ts (plantilla de página). */
@Component({
  selector: 'app-color-picker-page',
  imports: [DocPageView],
  // Los textos del Color Picker están en inglés por defecto; este sitio usa el español. Aquí y no
  // en app.config.ts, para no sumar nada al JS inicial.
  providers: [provideMimiColorPickerText(MIMI_COLOR_PICKER_TEXT_ES)],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorPickerPage {
  protected readonly page = COLOR_PICKER_PAGE;
}
