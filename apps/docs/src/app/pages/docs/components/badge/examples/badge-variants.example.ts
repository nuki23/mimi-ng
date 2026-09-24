import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiBadge } from '@/components/ui/badge';

@Component({
  selector: 'app-badge-variants-example',
  imports: [MimiBadge],
  template: `
    <div class="flex flex-wrap items-center justify-center gap-2">
      <span mimiBadge>Default</span>
      <span mimiBadge variant="secondary">Secondary</span>
      <span mimiBadge variant="outline">Outline</span>
      <span mimiBadge variant="destructive">Destructive</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeVariantsExample {}
