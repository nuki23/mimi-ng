import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiDialogImports } from '@/components/ui/dialog';
import { MimiInput } from '@/components/ui/input';

@Component({
  selector: 'app-dialog-basic-example',
  imports: [MimiDialogImports, MimiButton, MimiInput],
  template: `
    <mimi-dialog>
      <button mimiBtn variant="outline" mimiDialogTrigger>Editar usuario</button>
      <ng-template mimiDialogContent>
        <mimi-dialog-header>
          <h2 mimiDialogTitle>Editar usuario</h2>
          <p mimiDialogDescription>Los cambios se aplican al guardar.</p>
        </mimi-dialog-header>
        <mimi-dialog-body>
          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1.5">
              <label for="dialog-basic-name" class="text-sm font-medium">Nombre</label>
              <input mimiInput id="dialog-basic-name" value="Ana" autocomplete="given-name" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="dialog-basic-last" class="text-sm font-medium">Apellido</label>
              <input mimiInput id="dialog-basic-last" value="Torres" autocomplete="family-name" />
            </div>
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="dialog-basic-email" class="text-sm font-medium">Correo</label>
            <input
              mimiInput
              id="dialog-basic-email"
              type="email"
              value="ana@empresa.com"
              autocomplete="email"
            />
          </div>
        </mimi-dialog-body>
        <mimi-dialog-footer>
          <button mimiBtn type="button" variant="outline" mimiDialogClose>Cancelar</button>
          <button mimiBtn type="button" mimiDialogClose>Guardar cambios</button>
        </mimi-dialog-footer>
      </ng-template>
    </mimi-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogBasicExample {}
