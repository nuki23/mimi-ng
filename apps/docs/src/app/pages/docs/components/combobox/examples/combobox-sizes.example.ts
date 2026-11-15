import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiComboboxImports } from '@/components/ui/combobox';

@Component({
  selector: 'app-combobox-sizes-example',
  imports: [MimiComboboxImports],
  template: `
    <div class="flex w-80 max-w-full flex-col gap-3">
      <mimi-combobox size="sm" aria-label="País pequeño (sm)" [(value)]="small">
        @for (c of countries; track c.id) {
          <mimi-option [value]="c.id">{{ c.name }}</mimi-option>
        }
      </mimi-combobox>
      <mimi-combobox aria-label="País normal (md)" [(value)]="normal">
        @for (c of countries; track c.id) {
          <mimi-option [value]="c.id">{{ c.name }}</mimi-option>
        }
      </mimi-combobox>
      <mimi-combobox size="lg" aria-label="País grande (lg)" [(value)]="large">
        @for (c of countries; track c.id) {
          <mimi-option [value]="c.id">{{ c.name }}</mimi-option>
        }
      </mimi-combobox>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboboxSizesExample {
  protected readonly small = signal<string | null>('cl');
  protected readonly normal = signal<string | null>('cl');
  protected readonly large = signal<string | null>('cl');
  protected readonly countries = [
    { id: 'ar', name: 'Argentina' },
    { id: 'cl', name: 'Chile' },
    { id: 'uy', name: 'Uruguay' },
  ];
}
