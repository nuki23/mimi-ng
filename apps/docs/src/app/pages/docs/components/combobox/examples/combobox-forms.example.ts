import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, FormField, required } from '@angular/forms/signals';
import { MimiComboboxImports } from '@/components/ui/combobox';
import { MimiFormField } from '@/components/ui/form-field';
import type { MimiListOption } from '@/components/ui/option-list';

@Component({
  selector: 'app-combobox-forms-example',
  imports: [MimiComboboxImports, MimiFormField, FormField, ReactiveFormsModule, FormsModule],
  template: `
    <div class="grid w-full max-w-2xl gap-5 sm:grid-cols-2">
      <!-- Obligatorio: el error aparece al salir sin elegir. -->
      <mimi-form-field label="Lenguaje (Signal Forms)">
        <mimi-combobox
          placeholder="Elige uno"
          [options]="languages"
          [formField]="profile.language"
        />
      </mimi-form-field>
      <mimi-form-field label="Lenguaje (Reactive)">
        <mimi-combobox placeholder="Elige uno" [options]="languages" [formControl]="language" />
      </mimi-form-field>
      <mimi-form-field label="Lenguaje (ngModel)">
        <mimi-combobox name="lang" [options]="languages" [(ngModel)]="model" />
      </mimi-form-field>
      <mimi-form-field label="Deshabilitado">
        <mimi-combobox [options]="languages" value="ts" disabled />
      </mimi-form-field>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboboxFormsExample {
  protected readonly languages: MimiListOption<string>[] = [
    { label: 'TypeScript', value: 'ts' },
    { label: 'JavaScript', value: 'js' },
    { label: 'Python', value: 'py' },
    { label: 'Rust', value: 'rs' },
    { label: 'Go', value: 'go' },
  ];
  protected readonly data = signal({ language: null as string | null });
  protected readonly profile = form(this.data, (p) => required(p.language));
  protected readonly language = new FormControl<string | null>(null, Validators.required);
  protected model: string | null = 'py';
}
