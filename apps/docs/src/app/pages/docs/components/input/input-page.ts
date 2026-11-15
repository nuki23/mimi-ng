import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPageView } from '../../../../doc-page/doc-page';
import { INPUT_PAGE } from './input.page';

/** Documentación de Input: la configuración está en input.page.ts (plantilla de página). */
@Component({
  selector: 'app-input-page',
  imports: [DocPageView],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputPage {
  protected readonly page = INPUT_PAGE;
}
