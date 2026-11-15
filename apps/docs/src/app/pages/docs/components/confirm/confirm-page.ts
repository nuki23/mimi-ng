import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_CONFIRM_TEXT_ES, provideMimiConfirmText } from '@/components/ui/confirm';
import { MIMI_DIALOG_TEXT_ES, provideMimiDialogText } from '@/components/ui/dialog';
import { DocPageView } from '../../../../doc-page/doc-page';
import { CONFIRM_PAGE } from './confirm.page';

/** Documentación de Confirm: la configuración está en confirm.page.ts (plantilla de página). */
@Component({
  selector: 'app-confirm-page',
  imports: [DocPageView],
  // Los textos de Confirm y de Dialog (la X del ejemplo «Desde un Dialog») están en inglés por
  // defecto; este sitio usa el español. Aquí y no en app.config.ts, para no sumar nada al JS
  // inicial. injectMimiConfirm() los toma de aquí.
  providers: [
    provideMimiConfirmText(MIMI_CONFIRM_TEXT_ES),
    provideMimiDialogText(MIMI_DIALOG_TEXT_ES),
  ],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmPage {
  protected readonly page = CONFIRM_PAGE;
}
