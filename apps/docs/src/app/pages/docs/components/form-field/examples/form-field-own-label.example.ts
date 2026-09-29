import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiTextarea } from '@/components/ui/textarea';

@Component({
  selector: 'app-form-field-own-label-example',
  imports: [MimiFormField, MimiTextarea],
  template: `
    <mimi-form-field class="w-80">
      <label class="text-sm font-medium">
        Comentario <span class="font-normal text-muted-foreground">(opcional)</span>
      </label>
      <textarea mimiTextarea rows="3" placeholder="¿Cómo nos conociste?"></textarea>
    </mimi-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldOwnLabelExample {}
