import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiStepperImports } from '@/components/ui/stepper';

@Component({
  selector: 'app-stepper-custom-class-example',
  imports: [MimiStepperImports],
  template: `
    <mimi-stepper
      aria-label="Pedido"
      class="w-full max-w-lg rounded-[var(--mimi-radius-card)] border border-border bg-card p-5"
      [value]="1"
    >
      <mimi-step title="Carrito" />
      <mimi-step title="Pago" />
      <mimi-step title="Envío" />
    </mimi-stepper>
  `,
  host: { class: 'block w-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepperCustomClassExample {}
