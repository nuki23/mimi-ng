import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiStepperImports } from '@/components/ui/stepper';

@Component({
  selector: 'app-stepper-basic-example',
  imports: [MimiStepperImports, MimiButton],
  template: `
    <div class="flex w-full flex-col gap-4">
      <mimi-stepper #pasos="mimiStepper" aria-label="Alta de cliente" [(value)]="step">
        <mimi-step title="Cuenta">Elige tu correo y una contraseña.</mimi-step>
        <mimi-step title="Empresa">Nombre, NIF y dirección fiscal.</mimi-step>
        <mimi-step title="Plan">Mensual o anual; cámbialo cuando quieras.</mimi-step>
        <mimi-step title="Pago">Tarjeta o domiciliación.</mimi-step>
        <mimi-step title="Listo">Revisa los datos y confirma el alta.</mimi-step>
      </mimi-stepper>
      <div
        class="flex flex-wrap items-center justify-between gap-3 rounded-[var(--mimi-radius)] border border-border bg-card px-4 py-3"
      >
        <span class="text-sm font-semibold">Paso {{ step() + 1 }} de 5</span>
        <div class="flex gap-2">
          <button
            mimiBtn
            variant="outline"
            size="sm"
            [disabled]="pasos.isFirst()"
            [mimiStepperPrev]="pasos"
          >
            Atrás
          </button>
          <button mimiBtn size="sm" [mimiStepperNext]="pasos">
            {{ pasos.isLast() ? 'Finalizar' : 'Siguiente' }}
          </button>
        </div>
      </div>
    </div>
  `,
  host: { class: 'block w-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepperBasicExample {
  protected readonly step = signal(2);
}
