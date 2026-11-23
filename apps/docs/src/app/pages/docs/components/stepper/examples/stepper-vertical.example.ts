import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiStepperImports } from '@/components/ui/stepper';

@Component({
  selector: 'app-stepper-vertical-example',
  imports: [MimiStepperImports],
  template: `
    <mimi-stepper
      orientation="vertical"
      aria-label="Despliegue"
      class="w-full max-w-md"
      [value]="2"
    >
      <mimi-step title="Compilar" description="Hecho en 42 s" />
      <mimi-step title="Pruebas" description="3 pruebas fallaron" error />
      <mimi-step title="Revisión" description="Esperando a una persona del equipo" />
      <mimi-step title="Avisar al equipo" optional />
      <mimi-step title="Publicar" />
    </mimi-stepper>
  `,
  host: { class: 'block w-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepperVerticalExample {}
