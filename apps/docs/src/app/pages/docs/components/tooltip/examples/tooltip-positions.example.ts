import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiTooltip, type MimiTooltipSide } from '@/components/ui/tooltip';

@Component({
  selector: 'app-tooltip-positions-example',
  imports: [MimiTooltip, MimiButton],
  template: `
    <div class="flex flex-wrap justify-center gap-2">
      @for (side of sides; track side) {
        <button
          mimiBtn
          variant="outline"
          [mimiTooltip]="'Tooltip ' + side"
          [mimiTooltipSide]="side"
        >
          {{ side }}
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipPositionsExample {
  protected readonly sides: MimiTooltipSide[] = ['top', 'right', 'bottom', 'left'];
}
