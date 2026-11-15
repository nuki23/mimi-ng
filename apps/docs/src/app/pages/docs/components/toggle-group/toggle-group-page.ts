import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPageView } from '../../../../doc-page/doc-page';
import { TOGGLE_GROUP_PAGE } from './toggle-group.page';

/** Documentación de Toggle Group: la configuración está en toggle-group.page.ts (plantilla de página). */
@Component({
  selector: 'app-toggle-group-page',
  imports: [DocPageView],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleGroupPage {
  protected readonly page = TOGGLE_GROUP_PAGE;
}
