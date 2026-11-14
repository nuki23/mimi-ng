import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiSelectImports } from '@/components/ui/select';

interface Plan {
  id: string;
  name: string;
  hint?: string;
  soon?: boolean;
}

@Component({
  selector: 'app-select-groups-example',
  imports: [MimiSelectImports],
  template: `
    <div class="flex w-full max-w-xs flex-col gap-1.5">
      <label for="select-groups" class="text-sm font-medium">Plan</label>
      <!-- Opciones sueltas y grupos se pueden mezclar. -->
      <mimi-select id="select-groups" placeholder="Selecciona un plan" [(value)]="plan">
        <mimi-option value="free">Gratis</mimi-option>
        @for (group of groups(); track group.label) {
          <mimi-optgroup [label]="group.label">
            @for (item of group.plans; track item.id) {
              <mimi-option [value]="item.id" [hint]="item.hint" [disabled]="!!item.soon">{{
                item.name
              }}</mimi-option>
            }
          </mimi-optgroup>
        }
      </mimi-select>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectGroupsExample {
  protected readonly plan = signal<string | null>('pro');
  protected readonly groups = signal<{ label: string; plans: Plan[] }[]>([
    {
      label: 'Personas',
      plans: [
        { id: 'pro', name: 'Pro' },
        { id: 'pro-year', name: 'Pro anual', hint: '2 meses gratis' },
      ],
    },
    {
      label: 'Equipos',
      plans: [
        { id: 'team', name: 'Equipo' },
        { id: 'enterprise', name: 'Empresa', hint: 'Próximamente', soon: true },
      ],
    },
  ]);
}
