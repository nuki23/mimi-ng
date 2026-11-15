import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_PASSWORD_TEXT_ES, provideMimiPasswordText } from '@/components/ui/password';
import { DocPageView } from '../../../../doc-page/doc-page';
import { PASSWORD_PAGE } from './password.page';

/** Documentación de Password: la configuración está en password.page.ts (plantilla de página). */
@Component({
  selector: 'app-password-page',
  imports: [DocPageView],
  // Los textos de Password están en inglés por defecto; este sitio usa el español. Aquí y no en
  // app.config.ts, para no sumar nada al JS inicial.
  providers: [provideMimiPasswordText(MIMI_PASSWORD_TEXT_ES)],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordPage {
  protected readonly page = PASSWORD_PAGE;
}
