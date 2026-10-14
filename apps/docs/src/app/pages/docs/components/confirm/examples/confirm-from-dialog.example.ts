import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { injectMimiConfirm } from '@/components/ui/confirm';
import { MimiDialogImports } from '@/components/ui/dialog';
import { MimiInput } from '@/components/ui/input';

@Component({
  selector: 'app-confirm-from-dialog-example',
  imports: [MimiDialogImports, MimiButton, MimiInput],
  template: `
    <mimi-dialog [(open)]="open">
      <button mimiBtn variant="outline" mimiDialogTrigger>Editar nombre</button>
      <ng-template mimiDialogContent>
        <mimi-dialog-header>
          <h2 mimiDialogTitle>Editar nombre</h2>
          <p mimiDialogDescription>Cambia el nombre y pulsa Cancelar: pregunta antes de salir.</p>
        </mimi-dialog-header>
        <mimi-dialog-body>
          <input mimiInput aria-label="Nombre" value="Sitio web" />
        </mimi-dialog-body>
        <mimi-dialog-footer>
          <button mimiBtn type="button" variant="outline" (click)="discard()">Cancelar</button>
          <button mimiBtn type="button" mimiDialogClose>Guardar</button>
        </mimi-dialog-footer>
      </ng-template>
    </mimi-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmFromDialogExample {
  private readonly confirm = injectMimiConfirm();
  protected readonly open = signal(false);

  protected async discard(): Promise<void> {
    // El confirm se abre encima del Dialog; Escape cierra solo el de arriba.
    const ok = await this.confirm({
      title: '¿Descartar los cambios?',
      description: 'El nombre nuevo no se guardará.',
      confirmText: 'Descartar',
      tone: 'danger',
    });
    if (ok) this.open.set(false);
  }
}
