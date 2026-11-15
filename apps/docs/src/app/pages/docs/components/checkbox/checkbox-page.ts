import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPageView } from '../../../../doc-page/doc-page';
import { CHECKBOX_PAGE } from './checkbox.page';

/** Documentación de Checkbox: la configuración está en checkbox.page.ts (plantilla de página). */
@Component({
  selector: 'app-checkbox-page',
  imports: [DocPageView],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxPage {
  protected readonly page = CHECKBOX_PAGE;
}
