import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MimiInputOtp } from '@/components/ui/input-otp';

@Component({
  selector: 'app-input-otp-verify-example',
  imports: [MimiInputOtp],
  template: `
    <div class="flex flex-col gap-2">
      <label for="otp" class="text-sm font-medium">
        Código de verificación
        <span class="font-normal text-muted-foreground">· prueba con 246810</span>
      </label>
      <!-- La verificación y el mensaje son tuyos; el componente solo pinta success o error. -->
      <mimi-input-otp
        id="otp"
        aria-describedby="otp-msg"
        [separatorAfter]="3"
        [success]="status() === 'ok'"
        [(value)]="code"
      />
      <span id="otp-msg" role="status" class="min-h-5 text-[13px]" [class]="messageClass()">
        {{ message() }}
      </span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputOtpVerifyExample {
  protected readonly code = signal('');
  protected readonly status = computed(() =>
    this.code().length < 6 ? 'typing' : this.code() === '246810' ? 'ok' : 'error',
  );
  protected readonly message = computed(
    () =>
      ({
        typing: 'Te enviamos un código de 6 dígitos por SMS.',
        ok: 'Código verificado.',
        error: 'Código incorrecto.',
      })[this.status()],
  );
  protected readonly messageClass = computed(
    () =>
      ({
        typing: 'text-muted-foreground',
        ok: 'text-success-soft-foreground',
        error: 'text-destructive-soft-foreground',
      })[this.status()],
  );
}
