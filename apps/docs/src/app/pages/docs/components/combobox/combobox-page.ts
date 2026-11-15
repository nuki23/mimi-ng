import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_CHIP_TEXT_ES, provideMimiChipText } from '@/components/ui/chip';
import { MIMI_COMBOBOX_TEXT_ES, provideMimiComboboxText } from '@/components/ui/combobox';
import { DocPageView } from '../../../../doc-page/doc-page';
import { COMBOBOX_PAGE } from './combobox.page';

/** Documentación de Combobox: la configuración está en combobox.page.ts (plantilla de página). */
@Component({
  selector: 'app-combobox-page',
  imports: [DocPageView],
  // Los textos están en inglés por defecto; este sitio usa el español (el del chip, para el
  // múltiple). Aquí y no en app.config.ts, para no sumar nada al JS inicial.
  providers: [
    provideMimiComboboxText(MIMI_COMBOBOX_TEXT_ES),
    provideMimiChipText(MIMI_CHIP_TEXT_ES),
  ],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboboxPage {
  protected readonly page = COMBOBOX_PAGE;
}
