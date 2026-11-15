import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_CHIP_TEXT_ES, provideMimiChipText } from '@/components/ui/chip';
import { MIMI_TAGS_INPUT_TEXT_ES, provideMimiTagsInputText } from '@/components/ui/tags-input';
import { DocPageView } from '../../../../doc-page/doc-page';
import { TAGS_INPUT_PAGE } from './tags-input.page';

/** Documentación de Tags Input: la configuración está en tags-input.page.ts (plantilla de página). */
@Component({
  selector: 'app-tags-input-page',
  imports: [DocPageView],
  // Los textos de Tags Input y del chip están en inglés por defecto; este sitio usa el español.
  // Aquí y no en app.config.ts, para no sumar nada al JS inicial.
  providers: [
    provideMimiTagsInputText(MIMI_TAGS_INPUT_TEXT_ES),
    provideMimiChipText(MIMI_CHIP_TEXT_ES),
  ],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsInputPage {
  protected readonly page = TAGS_INPUT_PAGE;
}
