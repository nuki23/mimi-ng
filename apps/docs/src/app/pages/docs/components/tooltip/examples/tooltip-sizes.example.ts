import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiTooltip } from '@/components/ui/tooltip';

@Component({
  selector: 'app-tooltip-sizes-example',
  imports: [MimiTooltip, MimiButton],
  template: `
    <div class="flex flex-wrap items-center justify-center gap-3">
      <button mimiBtn variant="outline" mimiTooltip="Copia el enlace" mimiTooltipSize="sm">
        Pequeño
      </button>
      <button mimiBtn variant="outline" mimiTooltip="Copia el enlace" mimiTooltipSize="md">
        Mediano
      </button>
      <button mimiBtn variant="outline" mimiTooltip="Copia el enlace" mimiTooltipSize="lg">
        Grande
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipSizesExample {}
