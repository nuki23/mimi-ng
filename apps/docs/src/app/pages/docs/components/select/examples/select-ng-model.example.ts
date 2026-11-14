import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiSelectImports } from '@/components/ui/select';

@Component({
  selector: 'app-select-ng-model-example',
  imports: [FormsModule, MimiFormField, MimiSelectImports],
  template: `
    <div class="flex w-full max-w-xs flex-col gap-3">
      <mimi-form-field label="Moneda">
        <mimi-select
          name="currency"
          required
          placeholder="Selecciona una moneda"
          clearable
          [(ngModel)]="currency"
        >
          <mimi-option value="COP">Peso colombiano</mimi-option>
          <mimi-option value="MXN">Peso mexicano</mimi-option>
          <mimi-option value="USD">Dólar estadounidense</mimi-option>
          <mimi-option value="EUR">Euro</mimi-option>
        </mimi-select>
      </mimi-form-field>
      <p class="font-mono text-[13px] text-muted-foreground">
        currency: {{ currency() ?? 'null' }}
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectNgModelExample {
  protected readonly currency = signal<string | null>('COP');
}
