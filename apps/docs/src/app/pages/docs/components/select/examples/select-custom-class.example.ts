import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiSelectImports } from '@/components/ui/select';

@Component({
  selector: 'app-select-custom-class-example',
  imports: [MimiSelectImports],
  template: `
    <!-- class va al disparador; panelClass, al panel. -->
    <mimi-select
      aria-label="Orden"
      class="h-8 w-44 rounded-full bg-muted text-[13px]"
      panelClass="w-56 rounded-card"
      [(value)]="order"
    >
      <mimi-option value="recent">Más recientes</mimi-option>
      <mimi-option value="oldest">Más antiguos</mimi-option>
      <mimi-option value="name">Nombre (A-Z)</mimi-option>
    </mimi-select>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectCustomClassExample {
  protected readonly order = signal<string | null>('recent');
}
