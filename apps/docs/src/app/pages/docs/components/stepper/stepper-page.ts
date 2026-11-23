import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  MIMI_STEPPER_TEXT_ES,
  provideMimiStepperText,
} from '@/components/ui/stepper/stepper-texts';
import { DocPageView } from '../../../../doc-page/doc-page';
import { STEPPER_PAGE } from './stepper.page';

/** Documentación de Stepper: la configuración está en stepper.page.ts (plantilla de página). */
@Component({
  selector: 'app-stepper-page',
  imports: [DocPageView],
  template: '<app-doc-page [page]="page" />',
  // El sitio está en español: lo que el Stepper anuncia, también (en la página, no en la ruta:
  // así los textos van en el chunk de la página y no en uno compartido del JS inicial).
  providers: [provideMimiStepperText(MIMI_STEPPER_TEXT_ES)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepperPage {
  protected readonly page = STEPPER_PAGE;
}
