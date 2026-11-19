import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiPopoverImports } from '@/components/ui/popover';

@Component({
  selector: 'app-popover-phone-example',
  imports: [MimiPopoverImports, MimiButton],
  template: `
    <div class="flex flex-col items-center gap-3">
      <!-- Popover sigue siendo popover en el teléfono; presentation="sheet" pide la hoja. -->
      <!-- El aria-label es también el título de la hoja. -->
      <mimi-popover presentation="sheet" aria-label="Filtros" [(open)]="open">
        <button mimiBtn variant="outline" mimiPopoverTrigger>Filtros</button>
        <ng-template mimiPopoverContent>
          <p class="text-sm text-muted-foreground">Elige qué pedidos ver.</p>
          <div class="flex flex-wrap gap-2">
            @for (state of states; track state) {
              <button mimiBtn size="sm" variant="soft" (click)="pick(state)">
                {{ state }}
              </button>
            }
          </div>
        </ng-template>
      </mimi-popover>
      <p class="text-sm text-muted-foreground">Viendo: {{ shown() }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverPhoneExample {
  protected readonly open = signal(false);
  protected readonly shown = signal('Todos');
  protected readonly states = ['Todos', 'Pendientes', 'Enviados', 'Devueltos'];

  protected pick(state: string): void {
    this.shown.set(state);
    this.open.set(false);
  }
}
