import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiDialogImports } from '@/components/ui/dialog';

@Component({
  selector: 'app-dialog-no-dismiss-example',
  imports: [MimiDialogImports, MimiButton],
  template: `
    <!-- disableClose apaga Escape y el clic en el fondo. La X sigue cerrando. -->
    <mimi-dialog disableClose>
      <button mimiBtn variant="outline" mimiDialogTrigger>Aceptar los términos</button>
      <ng-template mimiDialogContent>
        <mimi-dialog-header>
          <h2 mimiDialogTitle>Términos del servicio</h2>
          <p mimiDialogDescription>Necesitamos tu respuesta para continuar.</p>
        </mimi-dialog-header>
        <mimi-dialog-body>
          <p class="text-sm text-pretty">
            Al continuar aceptas que guardemos los datos de tu cuenta para prestarte el servicio.
            Puedes pedir que los borremos cuando quieras.
          </p>
        </mimi-dialog-body>
        <mimi-dialog-footer>
          <button mimiBtn type="button" variant="outline" mimiDialogClose>Ahora no</button>
          <button mimiBtn type="button" mimiDialogClose>Acepto</button>
        </mimi-dialog-footer>
      </ng-template>
    </mimi-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogNoDismissExample {}
