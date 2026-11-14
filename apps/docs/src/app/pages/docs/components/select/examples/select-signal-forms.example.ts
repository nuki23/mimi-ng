import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormField, form, required } from '@angular/forms/signals';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiSelectImports } from '@/components/ui/select';

@Component({
  selector: 'app-select-signal-forms-example',
  imports: [FormField, MimiFormField, MimiSelectImports],
  template: `
    <div class="flex w-full max-w-xs flex-col gap-3">
      <mimi-form-field label="Idioma">
        <mimi-select placeholder="Selecciona un idioma" clearable [formField]="settings.language">
          <mimi-option value="es">Español</mimi-option>
          <mimi-option value="en">English</mimi-option>
          <mimi-option value="pt">Português</mimi-option>
        </mimi-select>
      </mimi-form-field>
      <p class="font-mono text-[13px] text-muted-foreground">
        language: {{ model().language ?? 'null' }} · touched: {{ settings.language().touched() }}
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectSignalFormsExample {
  protected readonly model = signal<{ language: string | null }>({ language: 'es' });
  protected readonly settings = form(this.model, (path) => {
    required(path.language, { message: 'Elige un idioma.' });
  });
}
