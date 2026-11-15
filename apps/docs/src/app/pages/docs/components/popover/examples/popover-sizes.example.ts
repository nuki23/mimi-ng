import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiPopoverImports } from '@/components/ui/popover';

@Component({
  selector: 'app-popover-sizes-example',
  imports: [MimiPopoverImports, MimiButton],
  template: `
    <div class="flex flex-wrap items-center justify-center gap-3">
      <mimi-popover size="sm">
        <button mimiBtn variant="outline" mimiPopoverTrigger>Pequeño</button>
        <ng-template mimiPopoverContent>
          <h4 mimiPopoverTitle>Panel sm</h4>
          <p mimiPopoverDescription>260 px de ancho, para una nota breve.</p>
        </ng-template>
      </mimi-popover>
      <mimi-popover size="md">
        <button mimiBtn variant="outline" mimiPopoverTrigger>Mediano</button>
        <ng-template mimiPopoverContent>
          <h4 mimiPopoverTitle>Panel md</h4>
          <p mimiPopoverDescription>300 px de ancho, el tamaño por defecto.</p>
        </ng-template>
      </mimi-popover>
      <mimi-popover size="lg">
        <button mimiBtn variant="outline" mimiPopoverTrigger>Grande</button>
        <ng-template mimiPopoverContent>
          <h4 mimiPopoverTitle>Panel lg</h4>
          <p mimiPopoverDescription>360 px de ancho, para un formulario pequeño.</p>
        </ng-template>
      </mimi-popover>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverSizesExample {}
