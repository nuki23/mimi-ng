import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_SLIDER_TEXT_ES, provideMimiSliderText } from '@/components/ui/slider';
import { DocPageView } from '../../../../doc-page/doc-page';
import { SLIDER_PAGE } from './slider.page';

/** Documentación de Slider: la configuración está en slider.page.ts (plantilla de página). */
@Component({
  selector: 'app-slider-page',
  imports: [DocPageView],
  // Los textos de Slider están en inglés por defecto; este sitio usa el español. Aquí y no en
  // app.config.ts, para no sumar nada al JS inicial.
  providers: [provideMimiSliderText(MIMI_SLIDER_TEXT_ES)],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderPage {
  protected readonly page = SLIDER_PAGE;
}
