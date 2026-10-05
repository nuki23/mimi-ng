import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';

@Component({
  selector: 'app-button-tones-example',
  imports: [MimiButton],
  template: `
    <div class="flex flex-wrap items-center justify-center gap-3">
      <button mimiBtn>Primary</button>
      <button mimiBtn tone="secondary">Secondary</button>
      <button mimiBtn tone="success">Success</button>
      <button mimiBtn tone="warning">Warning</button>
      <button mimiBtn tone="info">Info</button>
      <button mimiBtn tone="danger">Danger</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonTonesExample {}
