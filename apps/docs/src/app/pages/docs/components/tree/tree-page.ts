import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_TREE_TEXT_ES, provideMimiTreeText } from '@/components/ui/tree';
import { DocPageView } from '../../../../doc-page/doc-page';
import { TREE_PAGE } from './tree.page';

/** Documentación de Tree: la configuración está en tree.page.ts (plantilla de página). */
@Component({
  selector: 'app-tree-page',
  imports: [DocPageView],
  // Los textos están en inglés por defecto; este sitio usa el español. Aquí y no en
  // app.config.ts, para no sumar nada al JS inicial.
  providers: [provideMimiTreeText(MIMI_TREE_TEXT_ES)],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreePage {
  protected readonly page = TREE_PAGE;
}
