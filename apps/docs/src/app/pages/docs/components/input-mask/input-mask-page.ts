import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPageView } from '../../../../doc-page/doc-page';
import { INPUT_MASK_PAGE } from './input-mask.page';

/** Documentación de Input Mask: la configuración está en input-mask.page.ts (plantilla de página). */
@Component({
  selector: 'app-input-mask-page',
  imports: [DocPageView],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputMaskPage {
  protected readonly page = INPUT_MASK_PAGE;
}
