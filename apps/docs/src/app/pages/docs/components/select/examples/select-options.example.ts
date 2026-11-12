import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type MimiOption, MimiSelect } from '@/components/ui/select';

const MONTH = new Intl.DateTimeFormat('es', { month: 'long' });

@Component({
  selector: 'app-select-options-example',
  imports: [MimiSelect],
  template: `
    <div class="flex w-full max-w-xs flex-col gap-1.5">
      <label for="select-options" class="text-sm font-medium">Mes de facturación</label>
      <!-- La lista sale de código: se pasa entera con [options]. -->
      <mimi-select
        id="select-options"
        placeholder="Selecciona un mes"
        [(value)]="month"
        [options]="months"
      />
      <p class="font-mono text-[13px] text-muted-foreground">value: {{ month() ?? 'null' }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectOptionsExample {
  protected readonly month = signal<number | null>(null);
  /** Los 12 meses con el nombre del idioma: `{ label, value }` armados por código. */
  protected readonly months: MimiOption<number>[] = Array.from({ length: 12 }, (_, i) => {
    const name = MONTH.format(new Date(2026, i, 1));
    return { label: name.charAt(0).toUpperCase() + name.slice(1), value: i + 1 };
  });
}
