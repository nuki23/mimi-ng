import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiCheckbox } from '@/components/ui/checkbox';

@Component({
  selector: 'app-checkbox-states-example',
  imports: [MimiCheckbox],
  template: `
    <div class="flex flex-wrap items-center gap-8">
      <mimi-checkbox>Sin marcar</mimi-checkbox>
      <mimi-checkbox [checked]="true">Marcada</mimi-checkbox>
      <mimi-checkbox [indeterminate]="true">Mixta</mimi-checkbox>
      <mimi-checkbox [checked]="true" disabled>Deshabilitada</mimi-checkbox>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxStatesExample {}
