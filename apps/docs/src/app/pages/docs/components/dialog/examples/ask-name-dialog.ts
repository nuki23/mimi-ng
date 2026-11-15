import { ChangeDetectionStrategy, Component, inject, input, linkedSignal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiDialogImports, MimiDialogRef } from '@/components/ui/dialog';
import { MimiInput } from '@/components/ui/input';

/** Un componente normal: recibe `name` y devuelve el nuevo con `ref.close()`. */
@Component({
  selector: 'app-ask-name-dialog',
  imports: [MimiDialogImports, MimiButton, MimiInput],
  template: `
    <mimi-dialog-header><h2 mimiDialogTitle>Tu nombre</h2></mimi-dialog-header>
    <mimi-dialog-body>
      <input #f mimiInput aria-label="Nombre" [value]="value()" (input)="value.set(f.value)" />
    </mimi-dialog-body>
    <mimi-dialog-footer>
      <button mimiBtn type="button" variant="outline" mimiDialogClose>Cancelar</button>
      <button mimiBtn type="button" (click)="ref.close(value().trim())">Guardar</button>
    </mimi-dialog-footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AskNameDialog {
  readonly name = input.required<string>();
  protected readonly ref = inject<MimiDialogRef<string>>(MimiDialogRef);
  protected readonly value = linkedSignal(() => this.name());
}
