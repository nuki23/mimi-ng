import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormField, form, required } from '@angular/forms/signals';
import { MimiFormField } from '@/components/ui/form-field';
import { type MimiOption, MimiSelect } from '@/components/ui/select';

@Component({
  selector: 'app-select-signal-forms-example',
  imports: [FormField, MimiFormField, MimiSelect],
  template: `
    <div class="flex w-full max-w-xs flex-col gap-3">
      <mimi-form-field label="Idioma">
        <mimi-select
          placeholder="Selecciona un idioma"
          clearable
          [formField]="settings.language"
          [options]="languages"
        />
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
  protected readonly languages: MimiOption<string>[] = [
    { label: 'Español', value: 'es' },
    { label: 'English', value: 'en' },
    { label: 'Português', value: 'pt' },
  ];
}
