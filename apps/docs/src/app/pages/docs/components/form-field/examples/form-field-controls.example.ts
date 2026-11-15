import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MimiButton } from '@/components/ui/button';
import { MimiCheckbox } from '@/components/ui/checkbox';
import { MimiComboboxImports } from '@/components/ui/combobox';
import { MimiDatePicker } from '@/components/ui/date-picker';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiSelectImports } from '@/components/ui/select';
import { MimiSwitch } from '@/components/ui/switch';
import { MimiTagsInput } from '@/components/ui/tags-input';

@Component({
  selector: 'app-form-field-controls-example',
  imports: [
    ReactiveFormsModule,
    MimiFormField,
    MimiSelectImports,
    MimiComboboxImports,
    MimiDatePicker,
    MimiTagsInput,
    MimiSwitch,
    MimiCheckbox,
    MimiButton,
  ],
  template: `
    <form [formGroup]="form" class="grid w-full max-w-2xl gap-5 sm:grid-cols-2" (ngSubmit)="save()">
      <mimi-form-field label="Rol" required>
        <mimi-select formControlName="role" placeholder="Elige un rol">
          <mimi-option value="admin">Administración</mimi-option>
          <mimi-option value="editor">Edición</mimi-option>
        </mimi-select>
      </mimi-form-field>
      <mimi-form-field label="País" required>
        <mimi-combobox formControlName="country" placeholder="Escribe para buscar">
          <mimi-option value="ar">Argentina</mimi-option>
          <mimi-option value="cl">Chile</mimi-option>
          <mimi-option value="mx">México</mimi-option>
        </mimi-combobox>
      </mimi-form-field>
      <mimi-form-field label="Fecha de inicio" required hint="El primer día de trabajo.">
        <mimi-date-picker formControlName="start" locale="es" />
      </mimi-form-field>
      <mimi-form-field label="Habilidades" hint="Enter agrega una.">
        <mimi-tags-input formControlName="skills" placeholder="Angular, diseño…" />
      </mimi-form-field>
      <mimi-form-field description="Te escribimos cuando haya novedades.">
        <mimi-switch formControlName="news">Recibir novedades</mimi-switch>
      </mimi-form-field>
      <mimi-form-field>
        <mimi-checkbox formControlName="terms">Acepto las condiciones</mimi-checkbox>
      </mimi-form-field>
      <button mimiBtn type="submit" class="sm:col-span-2 sm:justify-self-start">Guardar</button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldControlsExample {
  protected readonly form = new FormGroup({
    role: new FormControl<string | null>(null, Validators.required),
    country: new FormControl<string | null>(null, Validators.required),
    start: new FormControl<string | null>(null, Validators.required),
    skills: new FormControl<string[]>(['Angular'], { nonNullable: true }),
    news: new FormControl(true, { nonNullable: true }),
    terms: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
  });

  protected save(): void {
    this.form.markAllAsTouched();
  }
}
