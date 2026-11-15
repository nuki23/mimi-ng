import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPageView } from '../../../../doc-page/doc-page';
import { TABS_PAGE } from './tabs.page';

/** Documentación de Tabs: la configuración está en tabs.page.ts (plantilla de página). */
@Component({
  selector: 'app-tabs-page',
  imports: [DocPageView],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsPage {
  protected readonly page = TABS_PAGE;
}
