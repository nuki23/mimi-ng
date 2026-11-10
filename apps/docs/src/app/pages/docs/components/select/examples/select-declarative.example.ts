import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiSelectImports } from '@/components/ui/select';

@Component({
  selector: 'app-select-declarative-example',
  imports: [MimiSelectImports],
  template: `
    <div class="flex w-full max-w-xs flex-col gap-1.5">
      <label for="select-declarative" class="text-sm font-medium">Plan</label>
      <mimi-select
        id="select-declarative"
        placeholder="Selecciona un plan"
        clearable
        [(value)]="plan"
      >
        <mimi-option value="free">Gratis</mimi-option>
        <mimi-optgroup label="Personas">
          <mimi-option value="pro">Pro</mimi-option>
          <mimi-option value="pro-year" hint="2 meses gratis">Pro anual</mimi-option>
        </mimi-optgroup>
        <mimi-optgroup label="Equipos">
          <mimi-option value="team">Equipo</mimi-option>
          <mimi-option value="enterprise" disabled>Enterprise</mimi-option>
        </mimi-optgroup>
      </mimi-select>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectDeclarativeExample {
  protected readonly plan = signal<string | null>('pro');
}
