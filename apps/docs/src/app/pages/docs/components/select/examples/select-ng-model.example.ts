import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MimiFormField } from '@/components/ui/form-field';
import { type MimiOption, MimiSelect } from '@/components/ui/select';

@Component({
  selector: 'app-select-ng-model-example',
  imports: [FormsModule, MimiFormField, MimiSelect],
  template: `
    <div class="flex w-full max-w-xs flex-col gap-3">
      <mimi-form-field label="Moneda">
        <mimi-select
          name="currency"
          required
          placeholder="Selecciona una moneda"
          clearable
          [(ngModel)]="currency"
          [options]="currencies"
        />
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
  protected readonly currencies: MimiOption<string>[] = [
    { label: 'Peso colombiano', value: 'COP' },
    { label: 'Peso mexicano', value: 'MXN' },
    { label: 'Dólar estadounidense', value: 'USD' },
    { label: 'Euro', value: 'EUR' },
  ];
}
