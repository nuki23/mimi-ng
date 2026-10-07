import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideCopy } from '@lucide/angular';
import { MimiButton } from '@/components/ui/button';
import { MimiTooltip } from '@/components/ui/tooltip';

@Component({
  selector: 'app-tooltip-icon-button-example',
  imports: [MimiTooltip, MimiButton, LucideCopy],
  template: `
    <!-- aria-label es el nombre del botón; el tooltip lo muestra a quien ve la pantalla. -->
    <button
      mimiBtn
      variant="outline"
      size="icon"
      aria-label="Copiar"
      mimiTooltip="Copiar"
      mimiTooltipShortcut="⌘C"
    >
      <svg lucideCopy></svg>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipIconButtonExample {}
