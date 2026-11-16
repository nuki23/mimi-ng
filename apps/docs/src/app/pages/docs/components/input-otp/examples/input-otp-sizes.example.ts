import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiInputOtp } from '@/components/ui/input-otp';

@Component({
  selector: 'app-input-otp-sizes-example',
  imports: [MimiInputOtp],
  template: `
    <div class="flex min-w-0 max-w-full flex-col gap-3">
      <mimi-input-otp size="sm" aria-label="Código, pequeño" value="246" [separatorAfter]="3" />
      <mimi-input-otp size="md" aria-label="Código, mediano" value="246" [separatorAfter]="3" />
      <mimi-input-otp size="lg" aria-label="Código, grande" value="246" [separatorAfter]="3" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputOtpSizesExample {}
