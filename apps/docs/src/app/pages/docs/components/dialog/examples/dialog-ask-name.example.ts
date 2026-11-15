import { ChangeDetectionStrategy, Component, Injector, inject, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiDialogService } from '@/components/ui/dialog';
import { AskNameDialog } from './ask-name-dialog';

@Component({
  selector: 'app-dialog-ask-name-example',
  imports: [MimiButton],
  template: `
    <div class="flex flex-col items-center gap-3">
      <p data-slot="result" class="text-sm">Hola, {{ name() }}</p>
      <button mimiBtn (click)="ask()">Cambiar nombre</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogAskNameExample {
  private readonly dialog = inject(MimiDialogService);
  private readonly injector = inject(Injector);
  protected readonly name = signal('Ana');

  protected ask(): void {
    // inputs llega a las entradas del diálogo; el resultado, undefined si se canceló.
    const ref = this.dialog.open<string>(AskNameDialog, {
      inputs: { name: this.name() },
      injector: this.injector,
    });
    ref.afterClosed().subscribe((name) => name && this.name.set(name));
  }
}
