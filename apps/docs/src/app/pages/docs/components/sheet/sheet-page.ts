import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPageView } from '../../../../doc-page/doc-page';
import { SHEET_PAGE } from './sheet.page';

/** Documentación de Sheet: la configuración está en sheet.page.ts (plantilla de página). */
@Component({
  selector: 'app-sheet-page',
  imports: [DocPageView],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SheetPage {
  protected readonly page = SHEET_PAGE;
}
