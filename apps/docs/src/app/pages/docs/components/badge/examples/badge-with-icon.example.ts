import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideCircleAlert, LucideCircleCheck } from '@lucide/angular';
import { MimiBadge } from '@/components/ui/badge';

@Component({
  selector: 'app-badge-with-icon-example',
  imports: [MimiBadge, LucideCircleAlert, LucideCircleCheck],
  template: `
    <div class="flex flex-wrap items-center justify-center gap-2">
      <span mimiBadge tone="secondary">
        <svg lucideCircleCheck></svg>
        Verificado
      </span>
      <span mimiBadge tone="danger">
        <svg lucideCircleAlert></svg>
        Pago pendiente
      </span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeWithIconExample {}
