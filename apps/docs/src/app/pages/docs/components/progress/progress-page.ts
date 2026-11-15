import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPageView } from '../../../../doc-page/doc-page';
import { PROGRESS_PAGE } from './progress.page';

/** Documentación de Progress: la configuración está en progress.page.ts (plantilla de página). */
@Component({
  selector: 'app-progress-page',
  imports: [DocPageView],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressPage {
  protected readonly page = PROGRESS_PAGE;
}
