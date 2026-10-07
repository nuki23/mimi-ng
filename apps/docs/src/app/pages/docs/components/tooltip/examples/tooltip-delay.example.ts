import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiTooltip } from '@/components/ui/tooltip';

@Component({
  selector: 'app-tooltip-delay-example',
  imports: [MimiTooltip, MimiButton],
  template: `
    <div class="flex flex-wrap justify-center gap-2">
      <button mimiBtn variant="outline" mimiTooltip="Sin espera" [mimiTooltipDelay]="0">
        0 ms
      </button>
      <button mimiBtn variant="outline" mimiTooltip="El retraso del tema">300 ms (tema)</button>
      <button mimiBtn variant="outline" mimiTooltip="Con calma" [mimiTooltipDelay]="1000">
        1000 ms
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipDelayExample {}
