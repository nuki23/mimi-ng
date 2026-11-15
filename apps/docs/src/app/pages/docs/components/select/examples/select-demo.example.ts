import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiSelectImports } from '@/components/ui/select';

/** `off`: sin cobertura (se ve, pero no se elige). */
type Country = { code: string; name: string; off?: boolean };

@Component({
  selector: 'app-select-demo-example',
  imports: [MimiSelectImports],
  template: `
    <div class="flex w-full max-w-[360px] flex-col gap-1.5">
      <label for="select-demo" class="text-sm font-medium">País de envío</label>
      <mimi-select
        id="select-demo"
        placeholder="Selecciona un país"
        search
        searchPlaceholder="Buscar país…"
        clearable
        [(value)]="country"
      >
        @for (region of regions; track region.label) {
          <mimi-optgroup [label]="region.label">
            @for (c of region.countries; track c.code) {
              <mimi-option
                [value]="c.code"
                [disabled]="!!c.off"
                [hint]="c.off ? 'Sin cobertura' : undefined"
                >{{ c.name }}</mimi-option
              >
            }
          </mimi-optgroup>
        }
      </mimi-select>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectDemoExample {
  protected readonly country = signal<string | null>('MX');
  protected readonly regions: { label: string; countries: Country[] }[] = [
    {
      label: 'América',
      countries: [
        { code: 'AR', name: 'Argentina' },
        { code: 'CO', name: 'Colombia' },
        { code: 'MX', name: 'México' },
        { code: 'PE', name: 'Perú', off: true },
      ],
    },
    {
      label: 'Europa',
      countries: [
        { code: 'ES', name: 'España' },
        { code: 'PT', name: 'Portugal' },
      ],
    },
  ];
}
