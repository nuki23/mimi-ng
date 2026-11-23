import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiSelectImports } from '@/components/ui/select';

@Component({
  selector: 'app-select-phone-example',
  imports: [MimiSelectImports],
  template: `
    <div class="flex w-64 max-w-full flex-col gap-1.5">
      <label for="select-phone" class="text-sm font-medium">Talla</label>
      <!-- Debajo de 640 px es lo de siempre; presentation="sheet" la pide también aquí. -->
      <mimi-select
        id="select-phone"
        presentation="sheet"
        placeholder="Elige una talla"
        [(value)]="size"
      >
        @for (size of sizes; track size) {
          <mimi-option [value]="size">{{ size }}</mimi-option>
        }
      </mimi-select>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectPhoneExample {
  protected readonly size = signal<string | null>('M');
  protected readonly sizes = ['XS', 'S', 'M', 'L', 'XL'];
}
