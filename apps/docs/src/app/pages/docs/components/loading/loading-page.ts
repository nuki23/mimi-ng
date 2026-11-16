import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_LOADING_TEXT_ES, provideMimiLoadingText } from '@/components/ui/loading';
import { DocPageView } from '../../../../doc-page/doc-page';
import { LOADING_PAGE } from './loading.page';

/** Documentación de Loading: la configuración está en loading.page.ts (plantilla de página). */
@Component({
  selector: 'app-loading-page',
  imports: [DocPageView],
  // Este sitio usa los textos en español; aquí y no en app.config.ts, para no sumar al JS inicial.
  providers: [provideMimiLoadingText(MIMI_LOADING_TEXT_ES)],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingPage {
  protected readonly page = LOADING_PAGE;
}
