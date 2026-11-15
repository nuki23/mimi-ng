import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPageView } from '../../../../doc-page/doc-page';
import { TOOLTIP_PAGE } from './tooltip.page';

/** Documentación de Tooltip: la configuración está en tooltip.page.ts (plantilla de página). */
@Component({
  selector: 'app-tooltip-page',
  imports: [DocPageView],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipPage {
  protected readonly page = TOOLTIP_PAGE;
}
