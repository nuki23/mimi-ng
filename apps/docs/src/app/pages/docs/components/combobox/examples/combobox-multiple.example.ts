import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiComboboxImports } from '@/components/ui/combobox';

interface Tech {
  id: string;
  name: string;
}

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
        [(value)]="chosen"
        (create)="add($event)"
      >
        @for (t of techs(); track t.id) {
          <mimi-option [value]="t.id">{{ t.name }}</mimi-option>
        }
      </mimi-combobox>
      <p class="text-[13px] text-muted-foreground">Elegidas: {{ chosen().join(', ') || '—' }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboboxMultipleExample {
  protected readonly chosen = signal<string[]>(['angular', 'typescript']);
  protected readonly techs = signal<Tech[]>([
    { id: 'angular', name: 'Angular' },
    { id: 'typescript', name: 'TypeScript' },
    { id: 'tailwind', name: 'Tailwind CSS' },
    { id: 'rxjs', name: 'RxJS' },
    { id: 'signals', name: 'Signals' },
    { id: 'vitest', name: 'Vitest' },
  ]);

  protected add(name: string): void {
    this.techs.update((list) => [...list, { id: name.toLowerCase(), name }]);
  }
}
