import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPageView } from '../../../../doc-page/doc-page';
import { DROPDOWN_MENU_PAGE } from './dropdown-menu.page';

/** Documentación de Dropdown Menu: la configuración está en dropdown-menu.page.ts. */
@Component({
  selector: 'app-dropdown-menu-page',
  imports: [DocPageView],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownMenuPage {
  protected readonly page = DROPDOWN_MENU_PAGE;
}
