import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MimiButton } from '@/components/ui/button';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiInput } from '@/components/ui/input';
import { type MimiOption, MimiSelect } from '@/components/ui/select';

@Component({
  selector: 'app-select-reactive-forms-example',
  imports: [ReactiveFormsModule, MimiButton, MimiFormField, MimiInput, MimiSelect],
  template: `
    <form
      class="flex w-full max-w-md flex-col gap-4"
      [formGroup]="form"
      (ngSubmit)="form.markAllAsTouched()"
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <mimi-form-field label="Nombre">
          <input mimiInput formControlName="name" />
        </mimi-form-field>
        <!-- La etiqueta, el error y aria-describedby los pone mimi-form-field. -->
        <mimi-form-field label="Rol">
          <mimi-select formControlName="role" placeholder="Selecciona un rol" [options]="roles" />
        </mimi-form-field>
      </div>
      <button mimiBtn type="submit" class="self-start">Invitar</button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectReactiveFormsExample {
  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: Validators.required }),
    role: new FormControl<string | null>(null, Validators.required),
  });
  protected readonly roles: MimiOption<string>[] = [
    { label: 'Administrador', value: 'admin' },
    { label: 'Editor', value: 'editor' },
    { label: 'Lector', value: 'viewer' },
  ];
}
