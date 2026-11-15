import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPageView } from '../../../../doc-page/doc-page';
import { POPOVER_PAGE } from './popover.page';

/** Documentación de Popover: la configuración está en popover.page.ts (plantilla de página). */
@Component({
  selector: 'app-popover-page',
  imports: [DocPageView],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverPage {
  protected readonly page = POPOVER_PAGE;
}
