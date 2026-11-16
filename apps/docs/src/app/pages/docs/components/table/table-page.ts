import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPageView } from '../../../../doc-page/doc-page';
import { TABLE_PAGE } from './table.page';

/** Documentación de Table: la configuración está en table.page.ts (plantilla de página). */
@Component({
  selector: 'app-table-page',
  imports: [DocPageView],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablePage {
  protected readonly page = TABLE_PAGE;
}
