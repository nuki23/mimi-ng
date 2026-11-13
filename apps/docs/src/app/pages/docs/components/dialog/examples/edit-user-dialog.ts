import { ChangeDetectionStrategy, Component, inject, input, linkedSignal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiDialogImports, MimiDialogRef } from '@/components/ui/dialog';
import { MimiInput } from '@/components/ui/input';
import { MimiSelectImports } from '@/components/ui/select';

export interface User {
  name: string;
  role: string;
}

/** El diálogo: un componente normal que recibe `user` y devuelve el usuario editado. */
@Component({
  selector: 'app-edit-user-dialog',
  imports: [MimiDialogImports, MimiButton, MimiInput, MimiSelectImports],
  template: `
    <mimi-dialog-header>
      <h2 mimiDialogTitle>Editar usuario</h2>
    </mimi-dialog-header>
    <mimi-dialog-body class="flex flex-col gap-4">
      <label class="flex flex-col gap-1.5 text-sm font-medium">
        Nombre
        <input #field mimiInput [value]="name()" (input)="name.set(field.value)" />
      </label>
      <label class="flex flex-col gap-1.5 text-sm font-medium">
        Rol
        <mimi-select [(value)]="role">
          <mimi-option value="Admin">Admin</mimi-option>
          <mimi-option value="Editor">Editor</mimi-option>
          <mimi-option value="Lectura">Lectura</mimi-option>
        </mimi-select>
      </label>
    </mimi-dialog-body>
    <mimi-dialog-footer>
      <button mimiBtn type="button" variant="outline" mimiDialogClose>Cancelar</button>
      <button mimiBtn type="button" (click)="save()">Guardar</button>
    </mimi-dialog-footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditUserDialog {
  readonly user = input.required<User>();
  private readonly ref = inject<MimiDialogRef<User>>(MimiDialogRef);
  protected readonly name = linkedSignal(() => this.user().name);
  protected readonly role = linkedSignal<string | null>(() => this.user().role);

  /** El resultado del diálogo: lo recibe quien lo abrió. */
  protected save(): void {
    this.ref.close({ name: this.name().trim(), role: this.role() ?? this.user().role });
  }
}
