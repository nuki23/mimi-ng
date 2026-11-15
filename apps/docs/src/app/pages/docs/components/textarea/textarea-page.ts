import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPageView } from '../../../../doc-page/doc-page';
import { TEXTAREA_PAGE } from './textarea.page';

/** Documentación de Textarea: la configuración está en textarea.page.ts (plantilla de página). */
@Component({
  selector: 'app-textarea-page',
  imports: [DocPageView],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaPage {
  protected readonly page = TEXTAREA_PAGE;
}
