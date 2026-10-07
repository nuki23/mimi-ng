import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiTooltip } from '@/components/ui/tooltip';

@Component({
  selector: 'app-tooltip-basic-example',
  imports: [MimiTooltip, MimiButton],
  template: `
    <button mimiBtn variant="outline" mimiTooltip="Guarda los cambios del borrador">Guardar</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipBasicExample {}
