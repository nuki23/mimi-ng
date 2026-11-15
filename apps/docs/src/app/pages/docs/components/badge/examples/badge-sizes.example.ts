import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiBadge } from '@/components/ui/badge';

@Component({
  selector: 'app-badge-sizes-example',
  imports: [MimiBadge],
  template: `
    <div class="flex flex-wrap items-center justify-center gap-3">
      <span mimiBadge size="sm" variant="soft" tone="info">Borrador</span>
      <span mimiBadge variant="soft" tone="info">Borrador</span>
      <span mimiBadge size="lg" variant="soft" tone="info">Borrador</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeSizesExample {}
