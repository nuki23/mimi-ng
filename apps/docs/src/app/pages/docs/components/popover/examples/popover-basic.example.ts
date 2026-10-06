import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiPopoverImports } from '@/components/ui/popover';

@Component({
  selector: 'app-popover-basic-example',
  imports: [MimiPopoverImports, MimiButton],
  template: `
    <mimi-popover>
      <button mimiBtn variant="outline" mimiPopoverTrigger>Abrir</button>
      <ng-template mimiPopoverContent>
        <div class="flex flex-col gap-0.5">
          <h4 mimiPopoverTitle>Hola</h4>
          <p mimiPopoverDescription>Se cierra con Escape, con un clic fuera o con el botón.</p>
        </div>
        <button mimiBtn size="sm" mimiPopoverClose>Entendido</button>
      </ng-template>
    </mimi-popover>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverBasicExample {}
