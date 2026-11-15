import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPageView } from '../../../../doc-page/doc-page';
import { BADGE_PAGE } from './badge.page';

/** Documentación de Badge: la configuración está en badge.page.ts (plantilla de página). */
@Component({
  selector: 'app-badge-page',
  imports: [DocPageView],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgePage {
  protected readonly page = BADGE_PAGE;
}
