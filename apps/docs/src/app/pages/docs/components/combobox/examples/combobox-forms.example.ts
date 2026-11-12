import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, FormField, required } from '@angular/forms/signals';
import { MimiComboboxImports } from '@/components/ui/combobox';
import { MimiFormField } from '@/components/ui/form-field';

@Component({
  selector: 'app-combobox-forms-example',
  imports: [MimiComboboxImports, MimiFormField, FormField, ReactiveFormsModule, FormsModule],
  template: `
    <div class="grid w-full max-w-2xl gap-5 sm:grid-cols-2">
      <!-- Obligatorio: el error aparece al salir sin elegir. -->
      <mimi-form-field label="Lenguaje (Signal Forms)">
        <mimi-combobox placeholder="Elige uno" [formField]="profile.language">
          @for (l of languages; track l.id) {
            <mimi-option [value]="l.id">{{ l.name }}</mimi-option>
          }
        </mimi-combobox>
      </mimi-form-field>
      <mimi-form-field label="Lenguaje (Reactive)">
        <mimi-combobox placeholder="Elige uno" [formControl]="language">
          @for (l of languages; track l.id) {
            <mimi-option [value]="l.id">{{ l.name }}</mimi-option>
          }
        </mimi-combobox>
      </mimi-form-field>
      <mimi-form-field label="Lenguaje (ngModel)">
        <mimi-combobox name="lang" [(ngModel)]="model">
          @for (l of languages; track l.id) {
            <mimi-option [value]="l.id">{{ l.name }}</mimi-option>
          }
        </mimi-combobox>
      </mimi-form-field>
      <mimi-form-field label="Deshabilitado">
        <mimi-combobox value="ts" disabled>
          @for (l of languages; track l.id) {
            <mimi-option [value]="l.id">{{ l.name }}</mimi-option>
          }
        </mimi-combobox>
      </mimi-form-field>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboboxFormsExample {
  protected readonly languages = [
    { id: 'ts', name: 'TypeScript' },
    { id: 'js', name: 'JavaScript' },
    { id: 'py', name: 'Python' },
    { id: 'rs', name: 'Rust' },
    { id: 'go', name: 'Go' },
  ];
  protected readonly data = signal({ language: null as string | null });
  protected readonly profile = form(this.data, (p) => required(p.language));
  protected readonly language = new FormControl<string | null>(null, Validators.required);
  protected model: string | null = 'py';
}
