import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiComboboxImports } from '@/components/ui/combobox';
import type { MimiListOptionGroup } from '@/components/ui/option-list';

const pad = (n: number) => String(n).padStart(2, '0');

@Component({
  selector: 'app-combobox-options-example',
  imports: [MimiComboboxImports],
  template: `
    <div class="flex w-full max-w-xs flex-col gap-1.5">
      <label for="combobox-options" class="text-sm font-medium">Hora de inicio</label>
      <!-- La lista sale de código: se pasa entera con [options]. -->
      <mimi-combobox
        id="combobox-options"
        placeholder="Escribe una hora, por ejemplo 14"
        [options]="slots"
        [(value)]="slot"
      />
      <p class="font-mono text-[13px] text-muted-foreground">value: {{ slot() ?? 'null' }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboboxOptionsExample {
  protected readonly slot = signal<string | null>(null);
  /** Cada media hora de 8:00 a 19:30, en dos grupos: `{ label, options }` armados por código. */
  protected readonly slots: MimiListOptionGroup<string>[] = [
    { label: 'Mañana', options: this.range(8, 12) },
    { label: 'Tarde', options: this.range(12, 20) },
  ];

  private range(from: number, to: number) {
    return Array.from({ length: (to - from) * 2 }, (_, i) => {
      const time = `${pad(from + Math.floor(i / 2))}:${i % 2 ? '30' : '00'}`;
      return { label: time, value: time };
    });
  }
}
