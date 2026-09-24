import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';

@Component({
  selector: 'app-button-variants-example',
  imports: [MimiButton],
  template: `
    <div class="flex flex-wrap items-center justify-center gap-3">
      <button mimiBtn>Default</button>
      <button mimiBtn variant="secondary">Secondary</button>
      <button mimiBtn variant="destructive">Destructive</button>
      <button mimiBtn variant="outline">Outline</button>
      <button mimiBtn variant="ghost">Ghost</button>
      <button mimiBtn variant="link">Link</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonVariantsExample {}
