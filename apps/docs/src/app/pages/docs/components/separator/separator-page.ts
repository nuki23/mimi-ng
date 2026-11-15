import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPageView } from '../../../../doc-page/doc-page';
import { SEPARATOR_PAGE } from './separator.page';

/** Documentación de Separator: la configuración está en separator.page.ts (plantilla de página). */
@Component({
  selector: 'app-separator-page',
  imports: [DocPageView],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeparatorPage {
  protected readonly page = SEPARATOR_PAGE;
}
