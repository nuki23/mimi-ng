import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPageView } from '../../../../doc-page/doc-page';
import { TOOLBAR_PAGE } from './toolbar.page';

/** Documentación de Toolbar: la configuración está en toolbar.page.ts (plantilla de página). */
@Component({
  selector: 'app-toolbar-page',
  imports: [DocPageView],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarPage {
  protected readonly page = TOOLBAR_PAGE;
}
