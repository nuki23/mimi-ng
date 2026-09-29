import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { MimiCheckbox } from '@/components/ui/checkbox';
import { MimiSwitch } from '@/components/ui/switch';

@Component({
  selector: 'app-switch-signal-forms-example',
  imports: [FormField, MimiCheckbox, MimiSwitch],
  template: `
    <div class="flex flex-col gap-4">
      <mimi-switch [formField]="settings.newsletter">Recibir novedades</mimi-switch>
      <mimi-checkbox [formField]="settings.remember">Recordarme</mimi-checkbox>
      <p class="font-mono text-[13px] text-muted-foreground">
        newsletter: {{ model().newsletter }} · remember: {{ model().remember }}
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchSignalFormsExample {
  protected readonly model = signal({ newsletter: true, remember: false });
  protected readonly settings = form(this.model);
}
