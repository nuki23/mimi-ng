import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPageView } from '../../../../doc-page/doc-page';
import { BUTTON_PAGE } from './button.page';

/** Documentación de Button: la configuración está en button.page.ts (plantilla de página). */
@Component({
  selector: 'app-button-page',
  imports: [DocPageView],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonPage {
  protected readonly page = BUTTON_PAGE;
}
