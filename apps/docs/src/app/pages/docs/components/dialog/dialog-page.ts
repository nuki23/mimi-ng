import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_DIALOG_TEXT_ES, provideMimiDialogText } from '@/components/ui/dialog';
import { MIMI_SELECT_TEXT_ES, provideMimiSelectText } from '@/components/ui/select';
import { DocPageView } from '../../../../doc-page/doc-page';
import { DIALOG_PAGE } from './dialog.page';

/** Documentación de Dialog: la configuración está en dialog.page.ts (plantilla de página). */
@Component({
  selector: 'app-dialog-page',
  imports: [DocPageView],
  // Los textos están en inglés por defecto; este sitio usa el español (el de Select, para el
  // ejemplo con formulario). Aquí y no en app.config.ts, para no sumar nada al JS inicial.
  providers: [
    provideMimiDialogText(MIMI_DIALOG_TEXT_ES),
    provideMimiSelectText(MIMI_SELECT_TEXT_ES),
  ],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogPage {
  protected readonly page = DIALOG_PAGE;
}
