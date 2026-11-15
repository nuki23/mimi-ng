import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPageView } from '../../../../doc-page/doc-page';
import { SKELETON_PAGE } from './skeleton.page';

/** Documentación de Skeleton: la configuración está en skeleton.page.ts (plantilla de página). */
@Component({
  selector: 'app-skeleton-page',
  imports: [DocPageView],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonPage {
  protected readonly page = SKELETON_PAGE;
}
