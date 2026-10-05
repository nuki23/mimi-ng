import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiBadge } from '@/components/ui/badge';

@Component({
  selector: 'app-badge-custom-class-example',
  imports: [MimiBadge],
  template: `
    <div class="flex items-center gap-3 text-sm font-medium">
      Notificaciones
      <span mimiBadge tone="danger" class="min-w-5 justify-center px-1.5 tabular-nums"> 12 </span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeCustomClassExample {}
