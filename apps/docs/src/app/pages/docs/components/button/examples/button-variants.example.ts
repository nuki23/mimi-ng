import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';

@Component({
  selector: 'app-button-variants-example',
  imports: [MimiButton],
  template: `
    <div class="flex flex-col items-center gap-4">
      <div class="flex flex-wrap items-center justify-center gap-3">
        <button mimiBtn>Solid</button>
        <button mimiBtn variant="soft">Soft</button>
        <button mimiBtn variant="outline">Outline</button>
        <button mimiBtn variant="ghost">Ghost</button>
        <button mimiBtn variant="link">Link</button>
      </div>
      <div class="flex flex-wrap items-center justify-center gap-3">
        <button mimiBtn>Primary</button>
        <button mimiBtn tone="secondary">Secondary</button>
        <button mimiBtn tone="success">Success</button>
        <button mimiBtn tone="warning">Warning</button>
        <button mimiBtn tone="info">Info</button>
        <button mimiBtn tone="danger">Danger</button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonVariantsExample {}
