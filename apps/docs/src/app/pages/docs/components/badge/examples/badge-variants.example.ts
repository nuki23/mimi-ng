import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiBadge } from '@/components/ui/badge';

@Component({
  selector: 'app-badge-variants-example',
  imports: [MimiBadge],
  template: `
    <div class="flex flex-wrap items-center justify-center gap-2">
      <span mimiBadge tone="success">Solid</span>
      <span mimiBadge variant="soft" tone="success">Soft</span>
      <span mimiBadge variant="outline" tone="success">Outline</span>
      <span mimiBadge variant="outline">Outline sin tono</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeVariantsExample {}
