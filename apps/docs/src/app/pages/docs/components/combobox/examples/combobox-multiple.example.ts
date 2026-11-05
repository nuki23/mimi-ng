import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiComboboxImports } from '@/components/ui/combobox';
import type { MimiListOption } from '@/components/ui/option-list';

@Component({
  selector: 'app-combobox-multiple-example',
  imports: [MimiComboboxImports],
  template: `
    <div class="flex w-full max-w-sm flex-col gap-1.5">
      <label for="techs" class="text-sm font-medium">Tecnologías</label>
      <!-- Con multiple, value es un arreglo y las elegidas se ven como chips. -->
      <mimi-combobox
        id="techs"
        multiple
        creatable
        placeholder="Agrega tecnologías"
        [options]="techs()"
        [(value)]="chosen"
        (create)="add($event)"
      />
      <p class="text-[13px] text-muted-foreground">Elegidas: {{ chosen().join(', ') || '—' }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboboxMultipleExample {
  protected readonly chosen = signal<string[]>(['angular', 'typescript']);
  protected readonly techs = signal<MimiListOption<string>[]>([
    { label: 'Angular', value: 'angular' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'Tailwind CSS', value: 'tailwind' },
    { label: 'RxJS', value: 'rxjs' },
    { label: 'Signals', value: 'signals' },
    { label: 'Vitest', value: 'vitest' },
  ]);

  protected add(label: string): void {
    this.techs.update((list) => [...list, { label, value: label.toLowerCase() }]);
  }
}
