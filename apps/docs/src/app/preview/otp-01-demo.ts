import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import { Otp01, type Otp01Status } from '@/blocks/otp-01';

/** El código «correcto» de la demo (el del diseño); el Block no lo conoce. */
export const OTP_DEMO_CODE = '246810';

/**
 * otp-01 en la vista previa del sitio, con una verificación de mentira: tarda un poco y acepta
 * 246810. Así se ven el error, el éxito y la carga sin servidor. No es parte del Block.
 */
@Component({
  selector: 'app-otp-01-demo',
  imports: [Otp01],
  template: `<mimi-otp-01
    [resendSeconds]="resendSeconds()"
    [status]="status()"
    [loading]="loading()"
    (verify)="check($event)"
    (resend)="status.set('idle')"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Otp01Demo {
  readonly resendSeconds = input(42, { transform: numberAttribute });

  protected readonly status = signal<Otp01Status>('idle');
  protected readonly loading = signal(false);
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.timer !== null && clearTimeout(this.timer));
  }

  protected check(code: string): void {
    this.loading.set(true);
    this.timer = setTimeout(() => {
      this.loading.set(false);
      this.status.set(code === OTP_DEMO_CODE ? 'success' : 'error');
    }, 600);
  }
}
