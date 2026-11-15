import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPageView } from '../../../../doc-page/doc-page';
import { FORM_FIELD_PAGE } from './form-field.page';

/** Documentación de Form Field: la configuración está en form-field.page.ts (plantilla de página). */
@Component({
  selector: 'app-form-field-page',
  imports: [DocPageView],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldPage {
  protected readonly page = FORM_FIELD_PAGE;
}
