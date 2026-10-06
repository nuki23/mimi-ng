import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiPopoverImports } from '@/components/ui/popover';

@Component({
  selector: 'app-popover-controlled-example',
  imports: [MimiPopoverImports, MimiButton],
  template: `
    <div class="flex flex-col items-center gap-3">
      <div class="flex flex-wrap justify-center gap-2">
        <mimi-popover [(open)]="open" side="right">
          <button mimiBtn variant="outline" mimiPopoverTrigger>Filtros</button>
          <ng-template mimiPopoverContent>
            <div class="flex flex-col gap-0.5">
              <h4 mimiPopoverTitle>Filtros</h4>
              <p mimiPopoverDescription>Este panel también se abre desde fuera.</p>
            </div>
            <button mimiBtn size="sm" variant="soft" mimiPopoverClose>Cerrar</button>
          </ng-template>
        </mimi-popover>
        <!-- Con el panel abierto, este clic cuenta como clic fuera y lo cierra. -->
        <button mimiBtn variant="ghost" (click)="open.set(true)">Abrir desde fuera</button>
      </div>
      <p class="text-sm text-muted-foreground">open = {{ open() }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverControlledExample {
  protected readonly open = signal(false);
}
