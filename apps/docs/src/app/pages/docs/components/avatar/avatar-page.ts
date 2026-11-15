import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPageView } from '../../../../doc-page/doc-page';
import { AVATAR_PAGE } from './avatar.page';

/** Documentación de Avatar: la configuración está en avatar.page.ts (plantilla de página). */
@Component({
  selector: 'app-avatar-page',
  imports: [DocPageView],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarPage {
  protected readonly page = AVATAR_PAGE;
}
