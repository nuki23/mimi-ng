import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPageView } from '../../../../doc-page/doc-page';
import { SWITCH_PAGE } from './switch.page';

/** Documentación de Switch: la configuración está en switch.page.ts (plantilla de página). */
@Component({
  selector: 'app-switch-page',
  imports: [DocPageView],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchPage {
  protected readonly page = SWITCH_PAGE;
}
