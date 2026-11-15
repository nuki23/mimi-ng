import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_DIALOG_TEXT_ES, provideMimiDialogText } from '@/components/ui/dialog';
import { DocPageView } from '../../../../doc-page/doc-page';
import { TOAST_PAGE } from './toast.page';

/**
 * Documentación de Toast: la configuración está en toast.page.ts (plantilla de página). Los
 * textos de Toast en español van en app.config.ts (el nombre de la región se lee en la raíz).
 */
@Component({
  selector: 'app-toast-page',
  imports: [DocPageView],
  // La X del Dialog del ejemplo «Desde un Dialog», en español.
  providers: [provideMimiDialogText(MIMI_DIALOG_TEXT_ES)],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastPage {
  protected readonly page = TOAST_PAGE;
}
