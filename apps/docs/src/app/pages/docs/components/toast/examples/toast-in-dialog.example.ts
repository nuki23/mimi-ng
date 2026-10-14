import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiDialogImports } from '@/components/ui/dialog';
import { MimiInput } from '@/components/ui/input';
import { injectMimiToast } from '@/components/ui/toast';

@Component({
  selector: 'app-toast-in-dialog-example',
  imports: [MimiDialogImports, MimiButton, MimiInput],
  template: `
    <mimi-dialog>
      <button mimiBtn variant="outline" mimiDialogTrigger>Compartir</button>
      <ng-template mimiDialogContent>
        <mimi-dialog-header>
          <h2 mimiDialogTitle>Compartir proyecto</h2>
          <p mimiDialogDescription>Cualquiera con el enlace puede verlo.</p>
        </mimi-dialog-header>
        <mimi-dialog-body>
          <div class="flex gap-2">
            <input mimiInput aria-label="Enlace" readonly value="https://mimi.dev/p/panel-ventas" />
            <button mimiBtn type="button" (click)="copy()">Copiar</button>
          </div>
        </mimi-dialog-body>
      </ng-template>
    </mimi-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastInDialogExample {
  private readonly toast = injectMimiToast();

  protected copy(): void {
    // El toast queda encima del diálogo y de su fondo.
    this.toast.success('Enlace copiado');
  }
}
