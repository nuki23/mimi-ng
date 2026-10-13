import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type MimiOption, type MimiOptionGroup, MimiSelect } from '@/components/ui/select';

@Component({
  selector: 'app-select-groups-example',
  imports: [MimiSelect],
  template: `
    <div class="flex w-full max-w-xs flex-col gap-1.5">
      <label for="select-groups" class="text-sm font-medium">Plan</label>
      <mimi-select
        id="select-groups"
        placeholder="Selecciona un plan"
        [(value)]="plan"
        [options]="plans"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectGroupsExample {
  protected readonly plan = signal<string | null>('pro');
  // Opciones sueltas y grupos se pueden mezclar.
  protected readonly plans: (MimiOption<string> | MimiOptionGroup<string>)[] = [
    { label: 'Gratis', value: 'free' },
    {
      label: 'Personas',
      options: [
        { label: 'Pro', value: 'pro' },
        { label: 'Pro anual', value: 'pro-year', hint: '2 meses gratis' },
      ],
    },
    {
      label: 'Equipos',
      options: [
        { label: 'Equipo', value: 'team' },
        { label: 'Empresa', value: 'enterprise', disabled: true, hint: 'Próximamente' },
      ],
    },
  ];
}
