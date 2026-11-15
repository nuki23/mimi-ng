import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPageView } from '../../../../doc-page/doc-page';
import { CONTEXT_MENU_PAGE } from './context-menu.page';

/** Documentación de Context Menu: la configuración está en context-menu.page.ts. */
@Component({
  selector: 'app-context-menu-page',
  imports: [DocPageView],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextMenuPage {
  protected readonly page = CONTEXT_MENU_PAGE;
}
