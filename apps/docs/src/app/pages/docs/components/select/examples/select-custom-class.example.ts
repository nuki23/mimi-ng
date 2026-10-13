import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type MimiOption, MimiSelect } from '@/components/ui/select';

@Component({
  selector: 'app-select-custom-class-example',
  imports: [MimiSelect],
  template: `
    <!-- class va al disparador; panelClass, al panel. -->
    <mimi-select
      aria-label="Orden"
      class="h-8 w-44 rounded-full bg-muted text-[13px]"
      panelClass="w-56 rounded-card"
      [(value)]="order"
      [options]="orders"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectCustomClassExample {
  protected readonly order = signal<string | null>('recent');
  protected readonly orders: MimiOption<string>[] = [
    { label: 'Más recientes', value: 'recent' },
    { label: 'Más antiguos', value: 'oldest' },
    { label: 'Nombre (A-Z)', value: 'name' },
  ];
}
