import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, FormField, required } from '@angular/forms/signals';
import { MimiColorInput } from '@/components/ui/color-picker';
import { MimiFormField } from '@/components/ui/form-field';

@Component({
  selector: 'app-color-picker-forms-example',
  imports: [MimiColorInput, MimiFormField, FormField, ReactiveFormsModule, FormsModule],
  template: `
    <div class="grid w-full max-w-2xl gap-5 sm:grid-cols-2">
      <mimi-form-field label="Fondo (Signal Forms, obligatorio)">
        <mimi-color-input placeholder="Sin color" [formField]="theme.background" />
      </mimi-form-field>
      <mimi-form-field label="Texto (Reactive)">
        <mimi-color-input placeholder="Sin color" [formControl]="text" />
      </mimi-form-field>
      <mimi-form-field label="Borde (ngModel)">
        <mimi-color-input name="border" class="rounded-full" [(ngModel)]="border" />
      </mimi-form-field>
      <mimi-form-field label="Deshabilitado">
        <mimi-color-input value="#4f46e5" disabled />
      </mimi-form-field>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorPickerFormsExample {
  protected readonly data = signal({ background: '' });
  protected readonly theme = form(this.data, (p) => required(p.background));
  protected readonly text = new FormControl('', {
    nonNullable: true,
    validators: Validators.required,
  });
  protected border = '#e5e7eb';
}
