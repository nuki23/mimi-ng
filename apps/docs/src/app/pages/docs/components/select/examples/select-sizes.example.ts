import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiSelectImports } from '@/components/ui/select';

@Component({
  selector: 'app-select-sizes-example',
  imports: [MimiSelectImports],
  template: `
    <div class="flex w-80 max-w-full flex-col gap-3">
      <mimi-select size="sm" aria-label="Pequeño (sm)" [(value)]="small">
        <mimi-option value="free">Gratis</mimi-option>
        <mimi-option value="pro">Pro (sm)</mimi-option>
      </mimi-select>
      <mimi-select aria-label="Normal (md)" [(value)]="normal">
        <mimi-option value="free">Gratis</mimi-option>
        <mimi-option value="pro">Pro (md)</mimi-option>
      </mimi-select>
      <mimi-select size="lg" aria-label="Grande (lg)" [(value)]="large">
        <mimi-option value="free">Gratis</mimi-option>
        <mimi-option value="pro">Pro (lg)</mimi-option>
      </mimi-select>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectSizesExample {
  protected readonly small = signal<string | null>('pro');
  protected readonly normal = signal<string | null>('pro');
  protected readonly large = signal<string | null>('pro');
}
