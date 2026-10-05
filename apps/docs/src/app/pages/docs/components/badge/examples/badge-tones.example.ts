import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiBadge } from '@/components/ui/badge';

@Component({
  selector: 'app-badge-tones-example',
  imports: [MimiBadge],
  template: `
    <div class="flex flex-wrap items-center justify-center gap-2">
      <span mimiBadge>Nuevo</span>
      <span mimiBadge tone="secondary">Borrador</span>
      <span mimiBadge tone="success">Activo</span>
      <span mimiBadge tone="warning">Pendiente</span>
      <span mimiBadge tone="info">Beta</span>
      <span mimiBadge tone="danger">Error</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeTonesExample {}
