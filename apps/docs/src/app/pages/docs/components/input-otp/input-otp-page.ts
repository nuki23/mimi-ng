import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPageView } from '../../../../doc-page/doc-page';
import { INPUT_OTP_PAGE } from './input-otp.page';

/** Documentación de Input OTP: la configuración está en input-otp.page.ts (plantilla de página). */
@Component({
  selector: 'app-input-otp-page',
  imports: [DocPageView],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputOtpPage {
  protected readonly page = INPUT_OTP_PAGE;
}
