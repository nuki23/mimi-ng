import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucidePlus } from '@lucide/angular';
import { MimiButton } from '@/components/ui/button';

@Component({
  selector: 'app-button-sizes-example',
  imports: [MimiButton, LucidePlus],
  template: `
    <div class="flex flex-wrap items-center justify-center gap-3">
      <button mimiBtn size="sm">Small</button>
      <button mimiBtn>Default</button>
      <button mimiBtn size="lg">Large</button>
      <button mimiBtn size="icon" aria-label="Añadir">
        <svg lucidePlus></svg>
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonSizesExample {}
