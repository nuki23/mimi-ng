import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiSheetImports } from '@/components/ui/sheet';

@Component({
  selector: 'app-sheet-controlled-example',
  imports: [MimiSheetImports, MimiButton],
  template: `
    <div class="flex flex-wrap items-center gap-3">
      <button mimiBtn variant="outline" (click)="open.set(true)">Ver filtros</button>
      <span class="text-sm text-muted-foreground">{{ open() ? 'Abierta' : 'Cerrada' }}</span>
    </div>
    <mimi-sheet side="bottom" [(open)]="open" disableClose aria-label="Filtros">
      <ng-template mimiSheetContent>
        <div mimiSheetBody class="py-4">
          <p class="text-sm">Con <code>disableClose</code>, solo la cierra un botón tuyo.</p>
        </div>
        <footer mimiSheetFooter>
          <button mimiBtn (click)="open.set(false)">Aplicar</button>
        </footer>
      </ng-template>
    </mimi-sheet>
  `,
  host: { class: 'flex flex-col gap-3' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SheetControlledExample {
  protected readonly open = signal(false);
}
