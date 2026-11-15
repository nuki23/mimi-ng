import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_COMMAND_TEXT_ES, provideMimiCommandText } from '@/components/ui/command';
import { DocPageView } from '../../../../doc-page/doc-page';
import { COMMAND_PAGE } from './command.page';

/** Documentación de Command: la configuración está en command.page.ts (plantilla de página). */
@Component({
  selector: 'app-command-page',
  imports: [DocPageView],
  // Los textos de Command están en inglés por defecto; este sitio usa el español. Aquí y no en
  // app.config.ts, para no sumar nada al JS inicial.
  providers: [provideMimiCommandText(MIMI_COMMAND_TEXT_ES)],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandPage {
  protected readonly page = COMMAND_PAGE;
}
