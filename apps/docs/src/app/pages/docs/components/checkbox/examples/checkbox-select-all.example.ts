import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MimiCheckbox } from '@/components/ui/checkbox';

@Component({
  selector: 'app-checkbox-select-all-example',
  imports: [MimiCheckbox],
  template: `
    <div class="flex flex-col gap-3">
      <mimi-checkbox
        class="font-medium"
        [checked]="all()"
        [indeterminate]="some()"
        (checkedChange)="setAll($event)"
      >
        Todas las notificaciones
      </mimi-checkbox>
      <div class="flex flex-col gap-3 pl-6.5">
        @for (item of items(); track item.name) {
          <mimi-checkbox [checked]="item.on" (checkedChange)="set(item.name, $event)">
            {{ item.name }}
          </mimi-checkbox>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxSelectAllExample {
  protected readonly items = signal([
    { name: 'Correo', on: true },
    { name: 'Mensajes', on: false },
    { name: 'Menciones', on: true },
  ]);

  protected readonly all = computed(() => this.items().every((i) => i.on));
  protected readonly some = computed(() => !this.all() && this.items().some((i) => i.on));

  protected setAll(on: boolean): void {
    this.items.update((items) => items.map((i) => ({ ...i, on })));
  }

  protected set(name: string, on: boolean): void {
    this.items.update((items) => items.map((i) => (i.name === name ? { ...i, on } : i)));
  }
}
